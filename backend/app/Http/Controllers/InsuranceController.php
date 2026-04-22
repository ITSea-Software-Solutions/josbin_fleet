<?php

namespace App\Http\Controllers;

use App\Models\Insurance;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InsuranceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Insurance::with('vehicle');

        if ($request->filled('vehicle_id')) {
            $query->where('vehicle_id', $request->vehicle_id);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->orderBy('expiry_date')->paginate(50));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'vehicle_id'      => 'required|exists:vehicles,id',
            'provider'        => 'required|string',
            'policy_number'   => 'required|string|unique:insurances',
            'type'            => 'required|in:third_party,comprehensive,fire_theft',
            'start_date'      => 'required|date',
            'expiry_date'     => 'required|date|after:start_date',
            'premium_amount'  => 'required|numeric|min:0',
            'coverage_amount' => 'nullable|numeric|min:0',
            'status'          => 'in:active,expired,cancelled',
            'notes'           => 'nullable|string',
        ]);

        $insurance = Insurance::create($data);

        // Sync vehicle's insurance_expiry
        $insurance->vehicle->update(['insurance_expiry' => $data['expiry_date']]);

        return response()->json($insurance->load('vehicle'), 201);
    }

    public function show(Insurance $insurance): JsonResponse
    {
        return response()->json($insurance->load('vehicle'));
    }

    public function update(Request $request, Insurance $insurance): JsonResponse
    {
        $data = $request->validate([
            'vehicle_id'      => 'required|exists:vehicles,id',
            'provider'        => 'required|string',
            'policy_number'   => 'required|string|unique:insurances,policy_number,' . $insurance->id,
            'type'            => 'required|in:third_party,comprehensive,fire_theft',
            'start_date'      => 'required|date',
            'expiry_date'     => 'required|date|after:start_date',
            'premium_amount'  => 'required|numeric|min:0',
            'coverage_amount' => 'nullable|numeric|min:0',
            'status'          => 'in:active,expired,cancelled',
            'notes'           => 'nullable|string',
        ]);

        $insurance->update($data);

        return response()->json($insurance->load('vehicle'));
    }

    public function destroy(Insurance $insurance): JsonResponse
    {
        $insurance->delete();

        return response()->json(null, 204);
    }
}
