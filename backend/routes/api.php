<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DriverController;
use App\Http\Controllers\FuelLogController;
use App\Http\Controllers\InspectionController;
use App\Http\Controllers\InsuranceController;
use App\Http\Controllers\NotificationLogController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\TripLogController;
use App\Http\Controllers\VehicleController;
use Illuminate\Support\Facades\Route;

// ── Public auth routes ────────────────────────────────────────────────────
Route::post('/login',    [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// ── Protected routes (require Sanctum token) ─────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // Dashboard
    Route::get('/dashboard/stats',  [DashboardController::class, 'stats']);
    Route::get('/dashboard/alerts', [DashboardController::class, 'alerts']);

    // Core resources
    Route::apiResource('vehicles',    VehicleController::class);
    Route::apiResource('drivers',     DriverController::class);
    Route::apiResource('services',    ServiceController::class);
    Route::apiResource('insurance',   InsuranceController::class);
    Route::apiResource('inspections', InspectionController::class);

    // Fuel logs
    Route::apiResource('fuel-logs', FuelLogController::class);

    // Trip logs
    Route::apiResource('trip-logs', TripLogController::class);
    Route::post('/trip-logs/{tripLog}/end', [TripLogController::class, 'endTrip']);

    // Notification logs
    Route::get('/notification-logs',     [NotificationLogController::class, 'index']);
    Route::get('/notifications/preview',  [NotificationLogController::class, 'preview']);
    Route::post('/notifications/run',     [NotificationLogController::class, 'run']);
    Route::post('/notifications/manual',  [NotificationLogController::class, 'manual']);

    // PDF Reports
    Route::get('/reports/vehicle/{vehicle}',  [ReportController::class, 'vehicleReport']);
    Route::get('/reports/fleet-summary',      [ReportController::class, 'fleetSummary']);
    Route::get('/reports/driver/{driver}',    [ReportController::class, 'driverReport']);

    // Settings
    Route::get('/settings',                 [SettingController::class, 'index']);
    Route::put('/settings',                 [SettingController::class, 'update']);
    Route::post('/settings/test-email',     [SettingController::class, 'testEmail']);
    Route::post('/settings/test-whatsapp',  [SettingController::class, 'testWhatsApp']);
});
