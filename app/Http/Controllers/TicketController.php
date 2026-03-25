<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    public function index()
    {
        return response()->json(Ticket::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|string|unique:tickets,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'validity_day' => 'required|in:weekday,weekend,all_days',
            'price' => 'required|numeric',
            'is_active' => 'boolean',
        ]);

        $ticket = Ticket::create($validated);
        return response()->json($ticket, 201);
    }

    public function show($id)
    {
        $ticket = Ticket::findOrFail($id);
        return response()->json($ticket);
    }

    public function update(Request $request, $id)
    {
        $ticket = Ticket::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'validity_day' => 'sometimes|in:weekday,weekend,all_days',
            'price' => 'sometimes|numeric',
            'is_active' => 'boolean',
        ]);

        $ticket->update($validated);
        return response()->json($ticket);
    }

    public function destroy($id)
    {
        $ticket = Ticket::findOrFail($id);
        $ticket->delete();
        return response()->json(['message' => 'Ticket deleted successfully']);
    }
}
