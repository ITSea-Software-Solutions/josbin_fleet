<?php

namespace App\Http\Controllers;

use App\Models\Driver;
use App\Models\Insurance;
use App\Models\Inspection;
use App\Models\Service;
use App\Models\Vehicle;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $now  = Carbon::today();
        $in30 = Carbon::today()->addDays(30);

        return response()->json([
            'total_vehicles'          => Vehicle::count(),
            'active_vehicles'         => Vehicle::where('status', 'active')->count(),
            'total_drivers'           => Driver::count(),
            'active_drivers'          => Driver::where('status', 'active')->count(),
            'vehicles_in_maintenance' => Vehicle::where('status', 'maintenance')->count(),
            'upcoming_services'       => Vehicle::whereBetween('next_service_date', [$now, $in30])->count(),
            'upcoming_inspections'    => Vehicle::whereBetween('next_inspection_date', [$now, $in30])->count(),
            'expiring_insurance'      => Vehicle::whereBetween('insurance_expiry', [$now, $in30])->count(),
            'expiring_licenses'       => Driver::where('status', 'active')->whereBetween('license_expiry', [$now, $in30])->count(),
        ]);
    }

    public function alerts(): JsonResponse
    {
        $now  = Carbon::today();
        $in30 = Carbon::today()->addDays(30);

        $alerts = [];

        // Upcoming services
        Vehicle::whereBetween('next_service_date', [$now, $in30])
            ->with('driver')
            ->get()
            ->each(function ($v) use (&$alerts) {
                $days = Carbon::today()->diffInDays($v->next_service_date);
                $alerts[] = [
                    'type'     => 'service',
                    'severity' => $days <= 7 ? 'danger' : 'warning',
                    'message'  => "Vehicle {$v->plate_number} service due in {$days} days",
                    'date'     => $v->next_service_date->format('Y-m-d'),
                ];
            });

        // Expiring insurance
        Vehicle::whereBetween('insurance_expiry', [$now, $in30])
            ->get()
            ->each(function ($v) use (&$alerts) {
                $days = Carbon::today()->diffInDays($v->insurance_expiry);
                $alerts[] = [
                    'type'     => 'insurance',
                    'severity' => $days <= 7 ? 'danger' : 'warning',
                    'message'  => "Vehicle {$v->plate_number} insurance expires in {$days} days",
                    'date'     => $v->insurance_expiry->format('Y-m-d'),
                ];
            });

        // Due inspections
        Vehicle::whereBetween('next_inspection_date', [$now, $in30])
            ->get()
            ->each(function ($v) use (&$alerts) {
                $days = Carbon::today()->diffInDays($v->next_inspection_date);
                $alerts[] = [
                    'type'     => 'inspection',
                    'severity' => $days <= 7 ? 'danger' : 'warning',
                    'message'  => "Vehicle {$v->plate_number} inspection due in {$days} days",
                    'date'     => $v->next_inspection_date->format('Y-m-d'),
                ];
            });

        // Expiring licenses
        Driver::where('status', 'active')
            ->whereBetween('license_expiry', [$now, $in30])
            ->get()
            ->each(function ($d) use (&$alerts) {
                $days = Carbon::today()->diffInDays($d->license_expiry);
                $alerts[] = [
                    'type'     => 'license',
                    'severity' => $days <= 7 ? 'danger' : 'warning',
                    'message'  => "Driver {$d->full_name} license expires in {$days} days",
                    'date'     => $d->license_expiry->format('Y-m-d'),
                ];
            });

        usort($alerts, fn($a, $b) => $a['date'] <=> $b['date']);

        return response()->json($alerts);
    }
}
