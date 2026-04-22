<?php

namespace App\Http\Controllers;

use App\Models\Driver;
use App\Models\FuelLog;
use App\Models\TripLog;
use App\Models\Vehicle;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;
use Illuminate\Support\Carbon;

class ReportController extends Controller
{
    /** Full report for a single vehicle */
    public function vehicleReport(Vehicle $vehicle): Response
    {
        $vehicle->load(['driver', 'services', 'insurances', 'inspections']);

        $fuelLogs = FuelLog::where('vehicle_id', $vehicle->id)
            ->orderBy('fill_date', 'desc')
            ->get();

        $tripLogs = TripLog::where('vehicle_id', $vehicle->id)
            ->orderBy('start_time', 'desc')
            ->get();

        $totalFuelCost   = $fuelLogs->sum('total_cost');
        $totalFuelLiters = $fuelLogs->sum('liters');
        $totalTrips      = $tripLogs->count();
        $totalDistance   = $tripLogs->whereNotNull('end_odometer')->sum(fn ($t) => $t->end_odometer - $t->start_odometer);

        $pdf = Pdf::loadView('reports.vehicle', compact(
            'vehicle', 'fuelLogs', 'tripLogs',
            'totalFuelCost', 'totalFuelLiters', 'totalTrips', 'totalDistance'
        ))->setPaper('a4', 'portrait');

        $filename = "vehicle-{$vehicle->plate_number}-report.pdf";

        return $pdf->download($filename);
    }

    /** Fleet summary report — all vehicles */
    public function fleetSummary(): Response
    {
        $vehicles = Vehicle::with(['driver', 'insurances' => fn($q) => $q->latest('expiry_date')])->get();

        $stats = [
            'total'       => $vehicles->count(),
            'active'      => $vehicles->where('status', 'active')->count(),
            'maintenance' => $vehicles->where('status', 'maintenance')->count(),
            'inactive'    => $vehicles->where('status', 'inactive')->count(),
            'total_fuel_cost'   => (float) FuelLog::sum('total_cost'),
            'total_fuel_liters' => (float) FuelLog::sum('liters'),
            'total_trips'       => TripLog::count(),
            'total_drivers'     => Driver::count(),
            'active_drivers'    => Driver::where('status', 'active')->count(),
        ];

        $generated_at = Carbon::now()->format('d M Y H:i');

        $pdf = Pdf::loadView('reports.fleet-summary', compact('vehicles', 'stats', 'generated_at'))
            ->setPaper('a4', 'landscape');

        return $pdf->download('fleet-summary-report.pdf');
    }

    /** Driver activity report */
    public function driverReport(Driver $driver): Response
    {
        $driver->load('vehicle');

        $trips = TripLog::where('driver_id', $driver->id)
            ->orderBy('start_time', 'desc')
            ->get();

        $fuels = FuelLog::where('driver_id', $driver->id)
            ->orderBy('fill_date', 'desc')
            ->get();

        $totalDistance = $trips->whereNotNull('end_odometer')->sum(fn ($t) => $t->end_odometer - $t->start_odometer);
        $totalFuelCost = $fuels->sum('total_cost');

        $pdf = Pdf::loadView('reports.driver', compact(
            'driver', 'trips', 'fuels', 'totalDistance', 'totalFuelCost'
        ))->setPaper('a4', 'portrait');

        $filename = "driver-{$driver->first_name}-{$driver->last_name}-report.pdf";

        return $pdf->download($filename);
    }
}
