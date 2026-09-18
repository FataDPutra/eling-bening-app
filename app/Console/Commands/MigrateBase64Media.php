<?php

namespace App\Console\Commands;

use App\Support\MediaStorage;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * One-off (but safely repeatable) conversion of base64 media that is still
 * stored inside database columns into files on the public disk.
 *
 * Rows already holding a URL are skipped, so running this again after new
 * uploads is harmless.
 *
 * Memory note: these columns hold megabytes per row, and PHP's MySQL driver
 * buffers a whole result set client-side — so selecting the media columns in
 * bulk (even with cursor()) exhausts the memory limit. Everything here is
 * therefore fetched one value at a time, with the gallery arrays sliced
 * element-by-element in SQL so PHP only ever holds a single image.
 */
class MigrateBase64Media extends Command
{
    protected $signature = 'media:migrate-base64 {--dry-run : Report what would change without writing anything}';

    protected $description = 'Move base64 images stored in database columns onto the public disk and replace them with URLs';

    /** Typical length of a replacement URL, used to estimate dry-run savings. */
    private const URL_LENGTH_ESTIMATE = 60;

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');

        if ($dryRun) {
            $this->warn('Dry run — nothing will be written.');
        }

        $freed = 0;
        $freed += $this->migrateJsonArrayColumn('resorts', 'gallery', 'resorts', $dryRun);
        $freed += $this->migrateStringColumn('contents', 'content', 'content', $dryRun);
        $freed += $this->migrateStringColumn('tickets', 'image', 'tickets', $dryRun);

        $this->newLine();
        $this->info(($dryRun ? 'Would free ' : 'Freed ') . $this->humanBytes($freed) . ' of database payload.');
        $this->line('Peak memory: ' . $this->humanBytes(memory_get_peak_usage(true)));

        return self::SUCCESS;
    }

    /**
     * Convert a column holding a JSON array of data URIs (e.g. resorts.gallery).
     *
     * Each array element is pulled from the database on its own so that a
     * resort with many large images never has to fit in memory at once.
     */
    private function migrateJsonArrayColumn(string $table, string $column, string $dir, bool $dryRun): int
    {
        $this->line("→ {$table}.{$column}");
        $freed = 0;

        // Cheap first pass: ids and how many entries each row holds.
        $rows = DB::table($table)
            ->select('id', DB::raw("JSON_LENGTH({$column}) as item_count"))
            ->whereNotNull($column)
            ->orderBy('id')
            ->get();

        foreach ($rows as $row) {
            $count = (int) ($row->item_count ?? 0);

            if ($count === 0) {
                continue;
            }

            $urls       = [];
            $converted  = 0;
            $savedBytes = 0;

            for ($i = 0; $i < $count; $i++) {
                // One element at a time — this is the whole point of the loop.
                $value = DB::table($table)
                    ->where('id', $row->id)
                    ->value(DB::raw("JSON_UNQUOTE(JSON_EXTRACT({$column}, '\$[{$i}]'))"));

                if (!is_string($value) || $value === '') {
                    continue;
                }

                if (!str_starts_with($value, 'data:')) {
                    $urls[] = $value;
                    continue;
                }

                $savedBytes += strlen($value) - self::URL_LENGTH_ESTIMATE;
                $converted++;

                if ($dryRun) {
                    $urls[] = $value;
                } else {
                    $stored = MediaStorage::store($value, $dir);

                    if ($stored === $value) {
                        $this->warn("  #{$row->id}[{$i}]: could not decode, kept as-is");
                        $urls[] = $value;
                    } else {
                        $urls[] = $stored;
                    }
                }

                unset($value, $stored);
            }

            if ($converted === 0) {
                continue;
            }

            if (!$dryRun) {
                DB::table($table)->where('id', $row->id)->update([$column => json_encode($urls)]);
            }

            $freed += $savedBytes;
            $this->line("  #{$row->id}: {$converted}/{$count} file(s), " . $this->humanBytes($savedBytes) . ' saved');

            unset($urls);
        }

        return $freed;
    }

    /**
     * Convert a column holding a single data URI (e.g. contents.content).
     */
    private function migrateStringColumn(string $table, string $column, string $dir, bool $dryRun): int
    {
        $this->line("→ {$table}.{$column}");
        $freed = 0;

        // Ids only — the values themselves are fetched one by one below.
        $ids = DB::table($table)
            ->where($column, 'like', 'data:%')
            ->orderBy('id')
            ->pluck('id');

        foreach ($ids as $id) {
            $raw = DB::table($table)->where('id', $id)->value($column);

            if (!is_string($raw) || $raw === '') {
                continue;
            }

            $saved = strlen($raw) - self::URL_LENGTH_ESTIMATE;

            if (!$dryRun) {
                $url = MediaStorage::store($raw, $dir);

                // store() returns the input unchanged when it can't be decoded.
                if ($url === $raw) {
                    $this->warn("  #{$id}: could not decode, skipped");
                    continue;
                }

                $saved = strlen($raw) - strlen((string) $url);
                DB::table($table)->where('id', $id)->update([$column => $url]);
            }

            $freed += $saved;
            $this->line("  #{$id}: " . $this->humanBytes($saved) . ' saved');

            unset($raw, $url);
        }

        return $freed;
    }

    private function humanBytes(int $bytes): string
    {
        if ($bytes >= 1048576) {
            return round($bytes / 1048576, 2) . ' MB';
        }

        if ($bytes >= 1024) {
            return round($bytes / 1024, 1) . ' KB';
        }

        return $bytes . ' B';
    }
}
