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
        if ($logoPath) {
            $this->logoUrl = str_starts_with($logoPath, 'http') ? $logoPath : asset('storage/' . $logoPath);
        } else {
            $this->logoUrl = asset('images/logo.png');
        }

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
