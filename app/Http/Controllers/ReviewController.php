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

        if ($transaction->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

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

    // ── ADMIN METHODS ─────────────────────────────────────────────────────────

    public function adminIndex(Request $request)
    {
        $query = Review::with(['user', 'transaction'])->latest();

        if ($request->filled('rating')) {
            $query->where('rating', $request->rating);
        }

        if ($request->filled('visible')) {
            $query->where('is_visible', $request->visible === '1');
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('comment', 'like', '%' . $request->search . '%')
                  ->orWhereHas('user', fn($u) => $u->where('name', 'like', '%' . $request->search . '%'));
            });
        }

        $reviews = $query->get()->map(function ($review) {
            return [
                'id'              => $review->id,
                'user_name'       => $review->user?->name ?? 'Anonymous',
                'user_email'      => $review->user?->email ?? '-',
                'rating'          => $review->rating,
                'comment'         => $review->comment,
                'is_visible'      => $review->is_visible,
                'transaction_id'  => $review->transaction_id,
                'booking_type'    => $review->transaction?->booking_type ?? '-',
                'media'           => collect($review->media ?? [])->map(function ($path) {
                    if (str_starts_with($path, 'http')) return $path;
                    return asset('storage/' . ltrim($path, '/'));
                })->toArray(),
                'created_at'      => $review->created_at->format('d M Y, H:i'),
                'created_at_diff' => $review->created_at->diffForHumans(),
            ];
        });

        return response()->json($reviews);
    }

    public function toggleVisibility(Request $request, $id)
    {
        $review = Review::findOrFail($id);
        $review->update(['is_visible' => !$review->is_visible]);

        return response()->json([
            'message'    => 'Visibilitas ulasan berhasil diperbarui.',
            'is_visible' => $review->is_visible,
        ]);
    }

    public function bulkSetVisibility(Request $request)
    {
        $request->validate([
            'rating'     => 'required|integer|min:1|max:5',
            'operator'   => 'nullable|string|in:=,>=',
            'is_visible' => 'required|boolean',
        ]);

        $operator = $request->operator ?? '=';

        $count = Review::where('rating', $operator, $request->rating)
            ->update(['is_visible' => $request->is_visible]);

        // Jika menampilkan suatu filter, sembunyikan yang tidak masuk dalam filter tersebut
        if ($request->is_visible) {
            $hiddenOperator = $operator === '>=' ? '<' : '!=';
            Review::where('rating', $hiddenOperator, $request->rating)
                ->update(['is_visible' => false]);
        }

        $ratingText = $operator === '>=' ? "{$request->rating} ke atas" : $request->rating;

        return response()->json([
            'message' => "{$count} ulasan bintang {$ratingText} berhasil " . ($request->is_visible ? 'ditampilkan' : 'disembunyikan') . '.',
            'count'   => $count,
        ]);
    }
}
