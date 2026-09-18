<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;

/**
 * Converts base64 data URIs into files on the public disk and returns their
 * public URL instead.
 *
 * Images used to be stored as base64 text directly in database columns
 * (resorts.gallery, contents.content, tickets.image). That made read endpoints
 * enormous — /api/resorts alone returned 68 MB — which both exhausted PHP's
 * memory limit and made the admin dashboard fail to load. Storing the file on
 * disk and keeping only the URL in the database keeps those payloads small and
 * lets the browser cache the images.
 *
 * Values that are already URLs/paths are passed through untouched, so clients
 * can keep sending back whatever they were given without re-uploading.
 */
class MediaStorage
{
    /**
     * Map of supported data-URI mime types to file extensions.
     */
    private const EXTENSIONS = [
        'image/png'       => 'png',
        'image/jpeg'      => 'jpg',
        'image/jpg'       => 'jpg',
        'image/webp'      => 'webp',
        'image/gif'       => 'gif',
        'image/svg+xml'   => 'svg',
        'image/avif'      => 'avif',
        'video/mp4'       => 'mp4',
        'video/webm'      => 'webm',
        'video/quicktime' => 'mov',
    ];

    /**
     * Store a single value. Returns the public URL, or the original value when
     * it isn't a base64 data URI (already stored, or empty).
     */
    public static function store(?string $value, string $dir): ?string
    {
        if ($value === null || $value === '' || !str_starts_with($value, 'data:')) {
            return $value;
        }

        if (!preg_match('/^data:([-\w.+\/]+);base64,(.+)$/s', $value, $matches)) {
            return $value;
        }

        $binary = base64_decode($matches[2], true);

        if ($binary === false) {
            return $value;
        }

        $ext = self::EXTENSIONS[strtolower($matches[1])] ?? 'bin';

        // Hash-based names make this idempotent: re-uploading the same file
        // reuses the existing one instead of filling the disk with duplicates.
        $path = trim($dir, '/') . '/' . sha1($binary) . '.' . $ext;

        if (!Storage::disk('public')->exists($path)) {
            Storage::disk('public')->put($path, $binary);
        }

        return '/storage/' . $path;
    }

    /**
     * Store every base64 entry of an array, keeping non-base64 entries as-is.
     */
    public static function storeMany(?array $values, string $dir): array
    {
        if (empty($values)) {
            return [];
        }

        $stored = [];

        foreach ($values as $value) {
            if (!is_string($value)) {
                continue;
            }

            $result = self::store($value, $dir);

            if ($result !== null && $result !== '') {
                $stored[] = $result;
            }
        }

        return $stored;
    }
}
