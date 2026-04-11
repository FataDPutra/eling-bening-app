<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ReviewController extends Controller
{
    public function index()
    {
        $minRating = (int) \App\Models\Content::getByKey('home_testimonial_min_rating', 1);

        $reviews = Review::with('user')
            ->where('is_visible', true)
            ->where('rating', '>=', $minRating)
            ->latest()
            ->get()
            ->map(function($review) {
                return [
                    'id' => $review->id,
                    'user_name' => $review->user?->name ?? 'Anonymous',
                    'user' => $review->user,
                    'rating' => $review->rating,
                    'comment' => $review->comment,
                    'media' => collect($review->media ?? [])->map(function($path) {
                        if (str_starts_with($path, 'http')) return $path;
                        if (str_contains($path, 'images/reviews')) return asset($path);
                        return asset('storage/' . ltrim($path, '/'));
                    })->toArray(),
                    'created_at' => $review->created_at->diffForHumans(),
                ];
            });

        return response()->json($reviews);
    }

    public function store(Request $request)
    {
        $request->validate([
            'transaction_id' => 'required|exists:transactions,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string',
            'media.*' => 'nullable|file|mimes:jpg,jpeg,png,mp4,mov|max:20480',
        ]);

        $transaction = Transaction::findOrFail($request->transaction_id);
        
        // Ensure user owns the transaction
        if ($transaction->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Prevent duplicate review for the same transaction
        if (Review::where('transaction_id', $request->transaction_id)->exists()) {
            return response()->json(['message' => 'Anda sudah memberikan ulasan untuk transaksi ini.'], 422);
        }

        $mediaPaths = [];
        if ($request->hasFile('media')) {
            foreach ($request->file('media') as $file) {
                $path = $file->store('reviews', 'public');
                $mediaPaths[] = $path;
            }
        }

        $review = Review::create([
            'transaction_id' => $request->transaction_id,
            'user_id' => auth()->id(),
            'rating' => $request->rating,
            'comment' => $request->comment,
            'media' => $mediaPaths,
        ]);

        return response()->json([
            'message' => 'Ulasan berhasil dikirim! Terima kasih.',
            'review' => $review
        ]);
    }
}
