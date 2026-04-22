<?php

namespace App\Http\Controllers;

use App\Models\Driver;
use App\Models\NotificationLog;
use App\Models\Setting;
use App\Models\Vehicle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Mail;
use Twilio\Rest\Client as TwilioClient;

class NotificationLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = NotificationLog::with(['vehicle', 'driver']);

        if ($request->filled('channel')) $query->where('channel', $request->channel);
        if ($request->filled('type'))    $query->where('type',    $request->type);
        if ($request->filled('status'))  $query->where('status',  $request->status);

        return response()->json($query->orderBy('created_at', 'desc')->paginate(50));
    }

    /**
     * GET /notifications/preview
     * Returns vehicles & drivers with upcoming deadlines — no notifications sent.
     */
    public function preview(): JsonResponse
    {
        $daysStr   = Setting::get('alert_days', '30,14,7');
        $thresholds = array_map('intval', explode(',', $daysStr));
        $maxDays   = max($thresholds);
        $cutoff    = Carbon::today()->addDays($maxDays);

        $items = [];

        // Services due
        if (Setting::get('alert_service', true)) {
            Vehicle::where('next_service_date', '<=', $cutoff)
                ->where('next_service_date', '>=', Carbon::today())
                ->with('driver')
                ->get()
                ->each(function (Vehicle $v) use (&$items) {
                    $days = (int) Carbon::today()->diffInDays($v->next_service_date);
                    $items[] = [
                        'type'       => 'service',
                        'days_left'  => $days,
                        'label'      => "Service Due: {$v->plate_number} ({$v->make} {$v->model})",
                        'detail'     => "Due on " . $v->next_service_date->format('d M Y'),
                        'vehicle_id' => $v->id,
                        'plate'      => $v->plate_number,
                    ];
                });
        }

        // Insurance expiring
        if (Setting::get('alert_insurance', true)) {
            Vehicle::where('insurance_expiry', '<=', $cutoff)
                ->where('insurance_expiry', '>=', Carbon::today())
                ->get()
                ->each(function (Vehicle $v) use (&$items) {
                    $days = (int) Carbon::today()->diffInDays($v->insurance_expiry);
                    $items[] = [
                        'type'       => 'insurance',
                        'days_left'  => $days,
                        'label'      => "Insurance Expiring: {$v->plate_number}",
                        'detail'     => "Expires on " . $v->insurance_expiry->format('d M Y'),
                        'vehicle_id' => $v->id,
                        'plate'      => $v->plate_number,
                    ];
                });
        }

        // Inspections due
        if (Setting::get('alert_inspection', true)) {
            Vehicle::where('next_inspection_date', '<=', $cutoff)
                ->where('next_inspection_date', '>=', Carbon::today())
                ->get()
                ->each(function (Vehicle $v) use (&$items) {
                    $days = (int) Carbon::today()->diffInDays($v->next_inspection_date);
                    $items[] = [
                        'type'       => 'inspection',
                        'days_left'  => $days,
                        'label'      => "Inspection Due: {$v->plate_number}",
                        'detail'     => "Due on " . $v->next_inspection_date->format('d M Y'),
                        'vehicle_id' => $v->id,
                        'plate'      => $v->plate_number,
                    ];
                });
        }

        // Licenses expiring
        if (Setting::get('alert_license', true)) {
            Driver::where('status', 'active')
                ->where('license_expiry', '<=', $cutoff)
                ->where('license_expiry', '>=', Carbon::today())
                ->get()
                ->each(function (Driver $d) use (&$items) {
                    $days = (int) Carbon::today()->diffInDays($d->license_expiry);
                    $items[] = [
                        'type'      => 'license',
                        'days_left' => $days,
                        'label'     => "License Expiring: {$d->first_name} {$d->last_name}",
                        'detail'    => "Expires on " . $d->license_expiry->format('d M Y'),
                        'driver_id' => $d->id,
                        'driver'    => "{$d->first_name} {$d->last_name}",
                    ];
                });
        }

        // Sort by days_left ascending
        usort($items, fn($a, $b) => $a['days_left'] - $b['days_left']);

        return response()->json([
            'items'       => $items,
            'total'       => count($items),
            'alert_days'  => $daysStr,
            'email_on'    => Setting::get('notify_email_enabled', true),
            'whatsapp_on' => Setting::get('notify_whatsapp_enabled', false),
            'admin_email' => Setting::get('admin_email'),
            'admin_whatsapp' => Setting::get('admin_whatsapp'),
        ]);
    }

    /**
     * POST /notifications/run
     * Runs the fleet:notify command immediately and returns results.
     */
    public function run(Request $request): JsonResponse
    {
        $startedAt = now();

        // Run the artisan command (uses DB settings)
        Artisan::call('fleet:notify');
        $output = trim(Artisan::output());

        // Collect logs created during this run
        $newLogs = NotificationLog::with(['vehicle', 'driver'])
            ->where('created_at', '>=', $startedAt)
            ->orderBy('created_at')
            ->get();

        $sent   = $newLogs->where('status', 'sent')->count();
        $failed = $newLogs->where('status', 'failed')->count();

        return response()->json([
            'message' => $newLogs->isEmpty()
                ? 'No alerts triggered — no deadlines match the configured thresholds right now.'
                : "Notification run complete: {$sent} sent, {$failed} failed.",
            'sent'    => $sent,
            'failed'  => $failed,
            'total'   => $newLogs->count(),
            'logs'    => $newLogs,
            'output'  => $output,
        ]);
    }

    /**
     * POST /notifications/manual
     * Send a one-off notification to any recipient on any channel.
     */
    public function manual(Request $request): JsonResponse
    {
        $data = $request->validate([
            'channel'   => 'required|in:email,whatsapp',
            'recipient' => 'required|string|max:200',
            'subject'   => 'nullable|string|max:255',
            'message'   => 'required|string|max:2000',
            'type'      => 'nullable|string|max:50',
        ]);

        $log = NotificationLog::create([
            'type'      => $data['type'] ?? 'manual',
            'channel'   => $data['channel'],
            'recipient' => $data['recipient'],
            'subject'   => $data['subject'] ?? null,
            'message'   => $data['message'],
            'status'    => 'pending',
        ]);

        try {
            if ($data['channel'] === 'email') {
                $this->applyMailConfig();
                $subject = $data['subject'] ?? 'Josbin Fleet MS Notification';
                Mail::raw($data['message'], fn($mail) => $mail->to($data['recipient'])->subject($subject));
            } else {
                $sid   = Setting::get('twilio_sid');
                $token = Setting::get('twilio_token');
                $from  = Setting::get('twilio_from');

                if (empty($sid) || empty($token)) {
                    $log->update(['status' => 'failed', 'error_message' => 'Twilio credentials not configured.']);
                    return response()->json(['message' => 'WhatsApp not configured. Add Twilio credentials in Settings.'], 422);
                }

                $twilio = new TwilioClient($sid, $token);
                $twilio->messages->create("whatsapp:{$data['recipient']}", [
                    'from' => "whatsapp:{$from}",
                    'body' => $data['message'],
                ]);
            }

            $log->update(['status' => 'sent', 'sent_at' => now()]);

            return response()->json([
                'message' => "Notification sent successfully to {$data['recipient']}.",
                'log'     => $log->fresh(),
            ]);
        } catch (\Throwable $e) {
            $log->update(['status' => 'failed', 'error_message' => $e->getMessage()]);
            return response()->json(['message' => 'Send failed: ' . $e->getMessage()], 422);
        }
    }

    private function applyMailConfig(): void
    {
        $host     = Setting::get('mail_host');
        $port     = Setting::get('mail_port');
        $username = Setting::get('mail_username');
        $password = Setting::get('mail_password');
        $from     = Setting::get('mail_from');

        if ($host)     config(['mail.mailers.smtp.host'     => $host]);
        if ($port)     config(['mail.mailers.smtp.port'     => (int) $port]);
        if ($username) config(['mail.mailers.smtp.username' => $username]);
        if ($password) config(['mail.mailers.smtp.password' => $password]);
        if ($from)     config(['mail.from.address'          => $from]);
        config(['mail.default' => 'smtp']);
    }
}
