<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class EventController extends Controller
{
    /**
     * Save base64 images to disk and return array of public URLs.
     */
    private function processImages(array $images): array
    {
        $saved = [];
        foreach ($images as $img) {
            // Already a URL/path stored previously — keep as-is
            if (!str_starts_with($img, 'data:')) {
                $saved[] = $img;
                continue;
            }

            // Parse base64: data:image/jpeg;base64,<data>
            if (!preg_match('/^data:(image\/\w+);base64,(.+)$/', $img, $matches)) {
                continue;
            }

            $mimeType = $matches[1];
            $base64   = $matches[2];
            $ext      = match($mimeType) {
                'image/png'  => 'png',
                'image/webp' => 'webp',
                'image/gif'  => 'gif',
                default      => 'jpg',
            };

            $filename = 'events/' . Str::uuid() . '.' . $ext;
            Storage::disk('public')->put($filename, base64_decode($base64));
            $saved[] = '/storage/' . $filename;
        }
        return $saved;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $events = Event::orderBy('created_at', 'desc')->get();
        foreach ($events as $event) {
            if ($event->is_ticketed) {
                $sold = \App\Models\TransactionItem::where('item_type', Event::class)
                    ->where('item_id', $event->id)
                    ->whereHas('transaction', function($q) {
                        $q->whereIn('status', ['paid', 'success']);
                    })->sum('quantity');
                $event->available_quota = max(0, $event->ticket_quota - $sold);
            }
        }
        return response()->json($events);
    }

    /**
     * Store a newly created resource.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'category'    => 'required|string',
            'date_info'   => 'required|string',
            'price'       => 'nullable|numeric',
            'is_active'   => 'nullable|boolean',
            'is_ticketed' => 'nullable|boolean',
            'ticket_quota' => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $data = $request->except('images');
        $data['images'] = $this->processImages($request->input('images', []));

        $event = Event::create($data);

        return response()->json([
            'message' => 'Event created successfully!',
            'data'    => $event
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Event $event)
    {
        return response()->json($event);
    }

    /**
     * Update the specified resource.
     */
    public function update(Request $request, Event $event)
    {
        $validator = Validator::make($request->all(), [
            'name'        => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'category'    => 'nullable|string',
            'date_info'   => 'nullable|string',
            'price'       => 'nullable|numeric',
            'is_active'   => 'nullable|boolean',
            'is_ticketed' => 'nullable|boolean',
            'ticket_quota' => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $data = $request->except('images');
        if ($request->has('images')) {
            $data['images'] = $this->processImages($request->input('images', []));
        }

        $event->update($data);

        return response()->json([
            'message' => 'Event updated successfully!',
            'data'    => $event
        ]);
    }

    /**
     * Remove the specified resource.
     */
    public function destroy(Event $event)
    {
        $event->delete();
        return response()->json(['message' => 'Event deleted successfully!']);
    }
}
