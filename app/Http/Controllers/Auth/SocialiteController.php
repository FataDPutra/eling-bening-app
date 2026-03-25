<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;

class SocialiteController extends Controller
{
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
            
            $user = User::updateOrCreate(
                ['email' => $googleUser->getEmail()],
                [
                    'name' => $googleUser->getName(),
                    'password' => Hash::make(Str::random(24)), // Dummy password
                    'role' => 'user' // Default role for social logins
                ]
            );

            Auth::login($user);

            // Redirect back to frontend
            return redirect(config('app.frontend_url') . '/');
            
        } catch (\Exception $e) {
            return redirect(config('app.frontend_url') . '/login?error=social_auth_failed');
        }
    }
}
