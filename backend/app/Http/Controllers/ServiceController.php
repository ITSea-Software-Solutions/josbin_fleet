<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Service::with('vehicle');

        if ($request->filled('vehicle_id')) {
            $query->where('vehicle_id', $request->vehicle_id);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->orderBy('service_date', 'desc')->paginate(50));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'vehicle_id'           => 'required|exists:vehicles,id',
            'type'                 => 'required|in:oil_change,tire_rotation,brake_inspection,full_service,other',
            'description'          => 'nullable|string',
            'service_date'         => 'required|date',
            'next_service_date'    => 'nullable|date',
            'next_service_mileage' => 'nullable|integer',
            'cost'                 => 'nullable|numeric|min:0',
            'garage'               => 'nullable|string',
            'status'               => 'in:scheduled,completed,overdue',
            'notes'                => 'nullable|string',
        ]);

        $service = Service::create($data);

        // Update vehicle's next_service_date
        if (!empty($data['next_service_date'])) {
            $service->vehicle->update(['next_service_date' => $data['next_service_date']]);
        }

        return response()->json($service->load('vehicle'), 201);
    }

    public function show(Service $service): JsonResponse
    {
        return response()->json($service->load('vehicle'));
    }

    public function update(Request $request, Service $service): JsonResponse
    {
        $data = $request->validate([
            'vehicle_id'           => 'required|exists:vehicles,id',
            'type'                 => 'required|in:oil_change,tire_rotation,brake_inspection,full_service,other',
            'description'          => 'nullable|string',
            'service_date'         => 'required|date',
            'next_service_date'    => 'nullable|date',
            'next_service_mileage' => 'nullable|integer',
            'cost'                 => 'nullable|numeric|min:0',
            'garage'               => 'nullable|string',
            'status'               => 'in:scheduled,completed,overdue',
            'notes'                => 'nullable|string',
        ]);

        $service->update($data);

        return response()->json($service->load('vehicle'));
    }

    public function destroy(Service $service): JsonResponse
    {
        $service->delete();

        return response()->json(null, 204);
    }
}
