<?php

namespace App\Mail;

use App\Models\Transaction;
use App\Models\SystemSetting;
use App\Models\Content;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Config;

class TransactionReceipt extends Mailable
{
    use Queueable, SerializesModels;

    public $transaction;
    public $logoUrl;
    public $siteName;
    public $contactEmail;

    public function __construct(Transaction $transaction)
    {
        $this->transaction = $transaction;

        // Load SMTP dynamically from SystemSetting
        $this->applyMailConfig();

        // Load branding from CMS
        $logoPath = Content::getByKey('layout_logo');
        $this->logoUrl = null;

        if ($logoPath) {
            if (str_starts_with($logoPath, 'data:')) {
                // Prevent CID attachment issues by dumping base64 visually as a public disk file
                if (preg_match('/^data:image\/(\w+);base64,(.+)$/', $logoPath, $matches)) {
                    $type = $matches[1];
                    $data = base64_decode($matches[2]);
                    $ext = $type === 'jpeg' ? 'jpg' : $type;
                    $filename = 'images/cached_logo.' . $ext;
                    $destPath = public_path($filename);
                    
                    if (!file_exists(public_path('images'))) {
                        @mkdir(public_path('images'), 0755, true);
                    }
                    @file_put_contents($destPath, $data);
                    
                    $this->logoUrl = asset($filename);
                }
            } elseif (str_starts_with($logoPath, 'http')) {
                $this->logoUrl = $logoPath;
            } else {
                // Clean path (remove leading slash if present)
                $cleanPath = ltrim($logoPath, '/');
                
                // Try several common locations but store the public URL
                if (file_exists(public_path($cleanPath))) {
                    $this->logoUrl = asset($cleanPath);
                } elseif (file_exists(public_path('storage/' . $cleanPath))) {
                    $this->logoUrl = asset('storage/' . $cleanPath);
                } elseif (file_exists(storage_path('app/public/' . $cleanPath))) {
                    $this->logoUrl = asset('storage/' . $cleanPath);
                } else {
                    $this->logoUrl = asset($cleanPath); // fallback
                }
            }
        }

        // Final fallback to default logo
        if (!$this->logoUrl) {
            if (file_exists(public_path('images/logo.png'))) {
                $this->logoUrl = asset('images/logo.png');
            }
        }

        \Illuminate\Support\Facades\Log::info('Email Logo URL resolved: ' . $this->logoUrl);

        $this->siteName = Content::getByKey('layout_site_title', 'Eling Bening');
        $this->contactEmail = Content::getByKey('contact_email', 'info@elingbening.com');
    }

    protected function applyMailConfig()
    {
        $settings = SystemSetting::whereIn('key', [
            'mail_host', 'mail_port', 'mail_username',
            'mail_password', 'mail_encryption', 'mail_from_address', 'mail_from_name'
        ])->pluck('value', 'key');

        if ($settings->get('mail_host')) {
            Config::set('mail.mailers.smtp.host', $settings->get('mail_host'));
            Config::set('mail.mailers.smtp.port', $settings->get('mail_port', 587));
            Config::set('mail.mailers.smtp.username', $settings->get('mail_username'));
            Config::set('mail.mailers.smtp.password', $settings->get('mail_password'));
            Config::set('mail.mailers.smtp.encryption', $settings->get('mail_encryption', 'tls'));
            Config::set('mail.from.address', $settings->get('mail_from_address', 'hello@example.com'));
            Config::set('mail.from.name', $settings->get('mail_from_name', 'Eling Bening'));
            Config::set('mail.default', 'smtp');
        }
    }

    public function build()
    {
        return $this->subject('Konfirmasi Transaksi #' . $this->transaction->id . ' - ' . $this->siteName)
                    ->view('emails.transaction-receipt')
                    ->with([
                        'transaction' => $this->transaction,
                        'logoUrl' => $this->logoUrl,
                        'siteName' => $this->siteName,
                        'contactEmail' => $this->contactEmail,
                    ]);
    }
}
