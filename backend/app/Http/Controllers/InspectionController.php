<?php

namespace App\Http\Controllers;

use App\Models\Inspection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InspectionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Inspection::with('vehicle');

        if ($request->filled('vehicle_id')) {
            $query->where('vehicle_id', $request->vehicle_id);
        }
        if ($request->filled('result')) {
            $query->where('result', $request->result);
        }

        return response()->json($query->orderBy('inspection_date', 'desc')->paginate(50));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'vehicle_id'           => 'required|exists:vehicles,id',
            'type'                 => 'required|in:routine,annual,safety,emissions',
            'inspection_date'      => 'required|date',
            'next_inspection_date' => 'nullable|date',
            'result'               => 'in:pass,fail,pending',
            'inspector'            => 'nullable|string',
            'location'             => 'nullable|string',
            'cost'                 => 'nullable|numeric|min:0',
            'notes'                => 'nullable|string',
        ]);

        $inspection = Inspection::create($data);

        // Sync vehicle's next_inspection_date
        if (!empty($data['next_inspection_date'])) {
            $inspection->vehicle->update(['next_inspection_date' => $data['next_inspection_date']]);
        }

        return response()->json($inspection->load('vehicle'), 201);
    }

    public function show(Inspection $inspection): JsonResponse
    {
        return response()->json($inspection->load('vehicle'));
    }

    public function update(Request $request, Inspection $inspection): JsonResponse
    {
        $data = $request->validate([
            'vehicle_id'           => 'required|exists:vehicles,id',
            'type'                 => 'required|in:routine,annual,safety,emissions',
            'inspection_date'      => 'required|date',
            'next_inspection_date' => 'nullable|date',
            'result'               => 'in:pass,fail,pending',
            'inspector'            => 'nullable|string',
            'location'             => 'nullable|string',
            'cost'                 => 'nullable|numeric|min:0',
            'notes'                => 'nullable|string',
        ]);

        $inspection->update($data);

        return response()->json($inspection->load('vehicle'));
    }

    public function destroy(Inspection $inspection): JsonResponse
    {
        $inspection->delete();

        return response()->json(null, 204);
    }
}
