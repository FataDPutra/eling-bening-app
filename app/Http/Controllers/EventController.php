<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EventController extends Controller
{
    /**
     * Display a listing of the resource (public or admin).
     */
    public function index()
    {
        return response()->json(Event::orderBy('created_at', 'desc')->get());
    }

    /**
     * Store a newly created resource.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|string',
            'date_info' => 'required|string',
            'price_info' => 'required|string',
            'price' => 'nullable|numeric',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $event = Event::create($request->all());

        return response()->json([
            'message' => 'Event created successfully!',
            'data' => $event
        ]);
    }

    /**
     * Update the specified resource.
     */
    public function update(Request $request, Event $event)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'string|max:255',
            'category' => 'string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $event->update($request->all());

        return response()->json([
            'message' => 'Event updated successfully!',
            'data' => $event
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
