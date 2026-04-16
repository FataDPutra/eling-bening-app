<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\ServiceProvider;
use Illuminate\Database\Eloquent\Relations\Relation;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            return config('app.frontend_url')."/password-reset/$token?email={$notifiable->getEmailForPasswordReset()}";
        });

        // Load dynamic settings from database into Laravel config
        try {
            if (\Illuminate\Support\Facades\Schema::hasTable('system_settings')) {
                $settings = \App\Models\SystemSetting::all()->pluck('value', 'key');
                
                // Google OAuth
                if (isset($settings['google_client_id'])) config(['services.google.client_id' => $settings['google_client_id']]);
                if (isset($settings['google_client_secret'])) config(['services.google.client_secret' => $settings['google_client_secret']]);
                config(['services.google.redirect' => url('/api/auth/google/callback')]);

                // Mail / SMTP
                if (isset($settings['mail_host']) && !empty($settings['mail_host'])) {
                    config(['mail.default' => 'smtp']);
                    config(['mail.mailers.smtp.host' => $settings['mail_host']]);
                }
                if (isset($settings['mail_port'])) config(['mail.mailers.smtp.port' => $settings['mail_port']]);
                if (isset($settings['mail_username'])) config(['mail.mailers.smtp.username' => $settings['mail_username']]);
                if (isset($settings['mail_password'])) config(['mail.mailers.smtp.password' => $settings['mail_password']]);
                if (isset($settings['mail_encryption'])) config(['mail.mailers.smtp.encryption' => $settings['mail_encryption']]);
                if (isset($settings['mail_from_address'])) config(['mail.from.address' => $settings['mail_from_address']]);
                if (isset($settings['mail_from_name'])) config(['mail.from.name' => $settings['mail_from_name']]);

                // Midtrans
                if (isset($settings['midtrans_server_key'])) config(['midtrans.server_key' => $settings['midtrans_server_key']]);
                if (isset($settings['midtrans_client_key'])) config(['midtrans.client_key' => $settings['midtrans_client_key']]);
                if (isset($settings['midtrans_is_production'])) config(['midtrans.is_production' => $settings['midtrans_is_production'] === 'true']);
            }
        } catch (\Exception $e) {
            // Database or table may not be ready yet
        }
        // Morph Map for cleaner database values
        Relation::morphMap([
            'ticket' => \App\Models\Ticket::class,
            'resort' => \App\Models\Resort::class,
            'event'  => \App\Models\Event::class,
            'user'   => \App\Models\User::class,
        ]);
    }
}
