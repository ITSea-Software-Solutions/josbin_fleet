<?php

namespace App\Http\Controllers;

use App\Models\FuelLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FuelLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = FuelLog::with(['vehicle', 'driver']);

        if ($request->filled('vehicle_id')) {
            $query->where('vehicle_id', $request->vehicle_id);
        }
        if ($request->filled('driver_id')) {
            $query->where('driver_id', $request->driver_id);
        }

        $logs = $query->orderBy('fill_date', 'desc')->paginate(50);

        // Append fleet-wide summary to response
        $summary = [
            'total_liters'    => (float) FuelLog::sum('liters'),
            'total_cost'      => (float) FuelLog::sum('total_cost'),
            'avg_cost_per_liter' => (float) FuelLog::avg('cost_per_liter'),
        ];

        return response()->json([
            ...$logs->toArray(),
            'summary' => $summary,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'vehicle_id'     => 'required|exists:vehicles,id',
            'driver_id'      => 'nullable|exists:drivers,id',
            'fill_date'      => 'required|date',
            'liters'         => 'required|numeric|min:0.1',
            'cost_per_liter' => 'required|numeric|min:0',
            'odometer'       => 'required|integer|min:0',
            'fuel_type'      => 'in:petrol,diesel,electric,hybrid',
            'station'        => 'nullable|string',
            'full_tank'      => 'boolean',
            'notes'          => 'nullable|string',
        ]);

        // Update vehicle mileage if this odometer reading is higher
        $vehicle = \App\Models\Vehicle::find($data['vehicle_id']);
        if ($data['odometer'] > $vehicle->mileage) {
            $vehicle->update(['mileage' => $data['odometer']]);
        }

        $log = FuelLog::create($data);

        return response()->json($log->load(['vehicle', 'driver']), 201);
    }

    public function show(FuelLog $fuelLog): JsonResponse
    {
        return response()->json($fuelLog->load(['vehicle', 'driver']));
    }

    public function update(Request $request, FuelLog $fuelLog): JsonResponse
    {
        $data = $request->validate([
            'vehicle_id'     => 'required|exists:vehicles,id',
            'driver_id'      => 'nullable|exists:drivers,id',
            'fill_date'      => 'required|date',
            'liters'         => 'required|numeric|min:0.1',
            'cost_per_liter' => 'required|numeric|min:0',
            'odometer'       => 'required|integer|min:0',
            'fuel_type'      => 'in:petrol,diesel,electric,hybrid',
            'station'        => 'nullable|string',
            'full_tank'      => 'boolean',
            'notes'          => 'nullable|string',
        ]);

        $fuelLog->update($data);

        return response()->json($fuelLog->load(['vehicle', 'driver']));
    }

    public function destroy(FuelLog $fuelLog): JsonResponse
    {
        $fuelLog->delete();

        return response()->json(null, 204);
    }
}
