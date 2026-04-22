<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Vehicle::with('driver');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('plate_number', 'like', "%$s%")
                  ->orWhere('make', 'like', "%$s%")
                  ->orWhere('model', 'like', "%$s%");
            });
        }

        return response()->json($query->orderBy('plate_number')->paginate(50));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'plate_number'         => 'required|string|unique:vehicles',
            'make'                 => 'required|string',
            'model'                => 'required|string',
            'year'                 => 'required|integer|min:1990|max:2030',
            'color'                => 'nullable|string',
            'vin'                  => 'nullable|string|unique:vehicles',
            'status'               => 'in:active,inactive,maintenance',
            'fuel_type'            => 'in:petrol,diesel,electric,hybrid',
            'mileage'              => 'integer|min:0',
            'driver_id'            => 'nullable|exists:drivers,id',
            'next_service_date'    => 'nullable|date',
            'next_inspection_date' => 'nullable|date',
            'insurance_expiry'     => 'nullable|date',
        ]);

        $vehicle = Vehicle::create($data);

        return response()->json($vehicle->load('driver'), 201);
    }

    public function show(Vehicle $vehicle): JsonResponse
    {
        return response()->json($vehicle->load(['driver', 'services', 'insurances', 'inspections']));
    }

    public function update(Request $request, Vehicle $vehicle): JsonResponse
    {
        $data = $request->validate([
            'plate_number'         => 'required|string|unique:vehicles,plate_number,' . $vehicle->id,
            'make'                 => 'required|string',
            'model'                => 'required|string',
            'year'                 => 'required|integer|min:1990|max:2030',
            'color'                => 'nullable|string',
            'vin'                  => 'nullable|string|unique:vehicles,vin,' . $vehicle->id,
            'status'               => 'in:active,inactive,maintenance',
            'fuel_type'            => 'in:petrol,diesel,electric,hybrid',
            'mileage'              => 'integer|min:0',
            'driver_id'            => 'nullable|exists:drivers,id',
            'next_service_date'    => 'nullable|date',
            'next_inspection_date' => 'nullable|date',
            'insurance_expiry'     => 'nullable|date',
        ]);

        $vehicle->update($data);

        return response()->json($vehicle->load('driver'));
    }

    public function destroy(Vehicle $vehicle): JsonResponse
    {
        $vehicle->delete();

        return response()->json(null, 204);
    }
}
