<?php

namespace App\Http\Controllers;

use App\Models\TripLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class TripLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = TripLog::with(['vehicle', 'driver']);

        if ($request->filled('vehicle_id')) {
            $query->where('vehicle_id', $request->vehicle_id);
        }
        if ($request->filled('driver_id')) {
            $query->where('driver_id', $request->driver_id);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->orderBy('start_time', 'desc')->paginate(50));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'vehicle_id'      => 'required|exists:vehicles,id',
            'driver_id'       => 'nullable|exists:drivers,id',
            'origin'          => 'required|string',
            'destination'     => 'required|string',
            'purpose'         => 'nullable|string',
            'start_time'      => 'required|date',
            'end_time'        => 'nullable|date|after:start_time',
            'start_odometer'  => 'required|integer|min:0',
            'end_odometer'    => 'nullable|integer|gte:start_odometer',
            'status'          => 'in:in_progress,completed,cancelled',
            'notes'           => 'nullable|string',
        ]);

        $trip = TripLog::create($data);

        return response()->json($trip->load(['vehicle', 'driver']), 201);
    }

    public function show(TripLog $tripLog): JsonResponse
    {
        return response()->json($tripLog->load(['vehicle', 'driver']));
    }

    public function update(Request $request, TripLog $tripLog): JsonResponse
    {
        $data = $request->validate([
            'vehicle_id'      => 'required|exists:vehicles,id',
            'driver_id'       => 'nullable|exists:drivers,id',
            'origin'          => 'required|string',
            'destination'     => 'required|string',
            'purpose'         => 'nullable|string',
            'start_time'      => 'required|date',
            'end_time'        => 'nullable|date|after:start_time',
            'start_odometer'  => 'required|integer|min:0',
            'end_odometer'    => 'nullable|integer|gte:start_odometer',
            'status'          => 'in:in_progress,completed,cancelled',
            'notes'           => 'nullable|string',
        ]);

        $tripLog->update($data);

        return response()->json($tripLog->load(['vehicle', 'driver']));
    }

    /** Quick endpoint to close an active trip */
    public function endTrip(Request $request, TripLog $tripLog): JsonResponse
    {
        $data = $request->validate([
            'end_time'     => 'required|date|after:start_time',
            'end_odometer' => 'required|integer|gte:start_odometer',
            'notes'        => 'nullable|string',
        ]);

        $tripLog->update([
            ...$data,
            'status' => 'completed',
        ]);

        // Sync vehicle mileage
        if ($data['end_odometer'] > $tripLog->vehicle->mileage) {
            $tripLog->vehicle->update(['mileage' => $data['end_odometer']]);
        }

        return response()->json($tripLog->fresh()->load(['vehicle', 'driver']));
    }

    public function destroy(TripLog $tripLog): JsonResponse
    {
        $tripLog->delete();

        return response()->json(null, 204);
    }
}
