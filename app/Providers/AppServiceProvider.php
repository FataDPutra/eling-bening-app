<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\ServiceProvider;

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

        // Load dynamic settings from database
        try {
            if (\Illuminate\Support\Facades\Schema::hasTable('system_settings')) {
                $settings = \App\Models\SystemSetting::all()->pluck('value', 'key');
                
                if (isset($settings['google_client_id'])) {
                    config(['services.google.client_id' => $settings['google_client_id']]);
                }
                if (isset($settings['google_client_secret'])) {
                    config(['services.google.client_secret' => $settings['google_client_secret']]);
                }
                config(['services.google.redirect' => url('/api/auth/google/callback')]);
            }
        } catch (\Exception $e) {
            // Database may not be ready yet
        }
    }
}
