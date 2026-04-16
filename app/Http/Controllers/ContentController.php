<?php

namespace App\Http\Controllers;

use App\Models\Content;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ContentController extends Controller
{
    /**
     * Display a listing of CMS content.
     */
    public function index(Request $request)
    {
        $query = Content::query();
        
        if ($request->has('page')) {
            $query->where(function ($q) use ($request) {
                $q->where('page', $request->page);
            });
        }

        return response()->json($query->orderBy('key', 'asc')->get());
    }

    /**
     * Store or Update content (Upsert).
     */
    public function upsert(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'key' => 'required|string',
            'content' => 'nullable|string',
            'data' => 'nullable|array',
            'type' => 'required|string',
            'page' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $content = Content::updateOrCreate(
            ['key' => $request->key],
            [
                'content' => $request->input('content'),
                'data' => $request->data,
                'type' => $request->type,
                'page' => $request->page,
            ]
        );

        return response()->json([
            'message' => 'CMS Content updated successfully!',
            'data' => $content
        ]);
    }

    /**
     * Bulk update CMS content.
     */
    public function bulkUpdate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'contents' => 'required|array',
            'contents.*.key' => 'required|string',
            'contents.*.type' => 'required|string',
            'contents.*.page' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        foreach ($request->contents as $item) {
            Content::updateOrCreate(
                ['key' => $item['key']],
                [
                    'content' => $item['content'] ?? null,
                    'data' => $item['data'] ?? null,
                    'type' => $item['type'],
                    'page' => $item['page'],
                ]
            );
        }

        return response()->json(['message' => 'Bulk CMS content updated successfully!']);
    }
}
