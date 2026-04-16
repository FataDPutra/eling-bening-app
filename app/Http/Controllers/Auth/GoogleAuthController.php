<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class GoogleAuthController extends Controller
{
    private function setGoogleConfig()
    {
        $settings = \App\Models\SystemSetting::whereIn('key', ['google_client_id', 'google_client_secret'])->pluck('value', 'key');
        
        config([
            'services.google.client_id' => $settings['google_client_id'] ?? env('GOOGLE_CLIENT_ID'),
            'services.google.client_secret' => $settings['google_client_secret'] ?? env('GOOGLE_CLIENT_SECRET'),
            'services.google.redirect' => url('/auth/google/callback'),
        ]);
    }

    public function redirect()
    {
        $this->setGoogleConfig();
        return Socialite::driver('google')->stateless()->redirect();
    }

    public function callback()
    {
        $this->setGoogleConfig();
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
            
            $user = User::where('email', $googleUser->getEmail())->first();

            if (!$user) {
                // Determine a nice role. If it's the admin email, we could make them admin. 
                // But usually we just let them be a regular 'user'
                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'password' => bcrypt(Str::random(16)), // random password
                    'role' => 'user', // Assuming there's a role column like the default in Eling Bening
                ]);
            }

            // Log them in
            Auth::login($user, true);

            // Redirect to home page or wherever
            return redirect('/');
        } catch (\Exception $e) {
            return redirect('/login')->with('error', 'Gagal login menggunakan Google.');
        }
    }
}
