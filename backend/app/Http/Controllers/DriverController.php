<?php

namespace App\Http\Controllers;

use App\Models\Driver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DriverController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Driver::with('vehicle');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('first_name', 'like', "%$s%")
                  ->orWhere('last_name', 'like', "%$s%")
                  ->orWhere('email', 'like', "%$s%")
                  ->orWhere('license_number', 'like', "%$s%");
            });
        }

        return response()->json($query->orderBy('first_name')->paginate(50));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'first_name'     => 'required|string',
            'last_name'      => 'required|string',
            'email'          => 'required|email|unique:drivers',
            'phone'          => 'required|string',
            'whatsapp'       => 'nullable|string',
            'license_number' => 'required|string|unique:drivers',
            'license_expiry' => 'required|date',
            'address'        => 'nullable|string',
            'status'         => 'in:active,inactive,suspended',
        ]);

        $driver = Driver::create($data);

        return response()->json($driver, 201);
    }

    public function show(Driver $driver): JsonResponse
    {
        return response()->json($driver->load('vehicle'));
    }

    public function update(Request $request, Driver $driver): JsonResponse
    {
        $data = $request->validate([
            'first_name'     => 'required|string',
            'last_name'      => 'required|string',
            'email'          => 'required|email|unique:drivers,email,' . $driver->id,
            'phone'          => 'required|string',
            'whatsapp'       => 'nullable|string',
            'license_number' => 'required|string|unique:drivers,license_number,' . $driver->id,
            'license_expiry' => 'required|date',
            'address'        => 'nullable|string',
            'status'         => 'in:active,inactive,suspended',
        ]);

        $driver->update($data);

        return response()->json($driver->load('vehicle'));
    }

    public function destroy(Driver $driver): JsonResponse
    {
        $driver->delete();

        return response()->json(null, 204);
    }
}
