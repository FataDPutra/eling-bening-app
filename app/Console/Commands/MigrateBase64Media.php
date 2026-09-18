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

        return self::SUCCESS;
    }

    /**
     * Convert a column holding a JSON array of data URIs (e.g. resorts.gallery).
     */
    private function migrateJsonArrayColumn(string $table, string $column, string $dir, bool $dryRun): int
    {
        $this->line("→ {$table}.{$column}");
        $freed = 0;

        foreach (DB::table($table)->select('id', $column)->cursor() as $row) {
            $raw = $row->{$column};

            if (empty($raw)) {
                continue;
            }

            $items = json_decode($raw, true);

            if (!is_array($items)) {
                $this->warn("  #{$row->id}: not valid JSON, skipped");
                continue;
            }

            $base64Count = count(array_filter(
                $items,
                fn ($v) => is_string($v) && str_starts_with($v, 'data:')
            ));

            if ($base64Count === 0) {
                continue;
            }

            if ($dryRun) {
                $saved = array_sum(array_map(
                    fn ($v) => strlen($v) - self::URL_LENGTH_ESTIMATE,
                    array_filter($items, fn ($v) => is_string($v) && str_starts_with($v, 'data:'))
                ));
            } else {
                $newRaw = json_encode(MediaStorage::storeMany($items, $dir));
                $saved  = strlen($raw) - strlen($newRaw);
                DB::table($table)->where('id', $row->id)->update([$column => $newRaw]);
            }

            $freed += $saved;
            $this->line("  #{$row->id}: {$base64Count} file(s), " . $this->humanBytes($saved) . ' saved');
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

        $rows = DB::table($table)
            ->select('id', $column)
            ->where($column, 'like', 'data:%')
            ->cursor();

        foreach ($rows as $row) {
            $raw = $row->{$column};

            if ($dryRun) {
                $saved = strlen($raw) - self::URL_LENGTH_ESTIMATE;
            } else {
                $url = MediaStorage::store($raw, $dir);

                // store() returns the input unchanged when it can't be decoded.
                if ($url === $raw) {
                    $this->warn("  #{$row->id}: could not decode, skipped");
                    continue;
                }

                $saved = strlen($raw) - strlen((string) $url);
                DB::table($table)->where('id', $row->id)->update([$column => $url]);
            }

            $freed += $saved;
            $this->line("  #{$row->id}: " . $this->humanBytes($saved) . ' saved');
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
