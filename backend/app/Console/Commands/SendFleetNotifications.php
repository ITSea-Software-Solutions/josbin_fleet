<?php

namespace App\Console\Commands;

use App\Models\Driver;
use App\Models\NotificationLog;
use App\Models\Setting;
use App\Models\Vehicle;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Mail;
use Twilio\Rest\Client as TwilioClient;

class SendFleetNotifications extends Command
{
    protected $signature   = 'fleet:notify {--days=7 : Days ahead to check}';
    protected $description = 'Send email and WhatsApp alerts for upcoming service, insurance, inspection, and license renewals';

    private array $thresholds = [30, 14, 7];

    public function handle(): void
    {
        // Read config from settings table (falls back to .env / config)
        $adminEmail     = Setting::get('admin_email',    config('fleet.admin_email'));
        $adminWhatsapp  = Setting::get('admin_whatsapp', config('fleet.admin_whatsapp'));
        $emailEnabled   = Setting::get('notify_email_enabled',    true);
        $waEnabled      = Setting::get('notify_whatsapp_enabled', false);

        // Parse alert days from settings (e.g. "30,14,7")
        $daysStr = Setting::get('alert_days', '30,14,7');
        $this->thresholds = array_map('intval', explode(',', $daysStr));

        $this->info("Checking fleet notifications (days: {$daysStr}, email: " . ($emailEnabled ? 'on' : 'off') . ", whatsapp: " . ($waEnabled ? 'on' : 'off') . ')');

        if (Setting::get('alert_service',    true)) $this->checkServices($adminEmail, $adminWhatsapp, $emailEnabled, $waEnabled);
        if (Setting::get('alert_insurance',  true)) $this->checkInsurance($adminEmail, $adminWhatsapp, $emailEnabled, $waEnabled);
        if (Setting::get('alert_inspection', true)) $this->checkInspections($adminEmail, $adminWhatsapp, $emailEnabled, $waEnabled);
        if (Setting::get('alert_license',    true)) $this->checkLicenses($adminEmail, $adminWhatsapp, $emailEnabled, $waEnabled);

        $this->info('Fleet notifications complete.');
    }

    // -------------------------------------------------------------------------

    private function checkServices(string $adminEmail, string $adminWhatsapp, bool $emailOn, bool $waOn): void
    {
        foreach ($this->thresholds as $days) {
            $target = Carbon::today()->addDays($days)->format('Y-m-d');
            Vehicle::where('next_service_date', $target)->each(function (Vehicle $vehicle) use ($days, $adminEmail, $adminWhatsapp, $emailOn, $waOn) {
                $subject = "Service Due: {$vehicle->plate_number} ({$vehicle->make} {$vehicle->model})";
                $message = "Josbin Fleet MS Alert: Vehicle {$vehicle->plate_number} ({$vehicle->make} {$vehicle->model}) is due for service in {$days} days on {$vehicle->next_service_date->format('d M Y')}.";
                if ($emailOn) $this->sendEmail($adminEmail, $subject, $message, 'service', $vehicle->id);
                if ($waOn)    $this->sendWhatsApp($adminWhatsapp, $message, 'service', $vehicle->id);
                if ($waOn && $vehicle->driver && $vehicle->driver->whatsapp) {
                    $this->sendWhatsApp($vehicle->driver->whatsapp, "Josbin Fleet MS: Your vehicle {$vehicle->plate_number} needs service in {$days} days.", 'service', $vehicle->id, $vehicle->driver->id);
                }
            });
        }
    }

    private function checkInsurance(string $adminEmail, string $adminWhatsapp, bool $emailOn, bool $waOn): void
    {
        foreach ($this->thresholds as $days) {
            $target = Carbon::today()->addDays($days)->format('Y-m-d');
            Vehicle::where('insurance_expiry', $target)->each(function (Vehicle $vehicle) use ($days, $adminEmail, $adminWhatsapp, $emailOn, $waOn) {
                $subject = "Insurance Expiring: {$vehicle->plate_number}";
                $message = "Josbin Fleet MS Alert: Insurance for vehicle {$vehicle->plate_number} expires in {$days} days on {$vehicle->insurance_expiry->format('d M Y')}. Please renew immediately.";
                if ($emailOn) $this->sendEmail($adminEmail, $subject, $message, 'insurance', $vehicle->id);
                if ($waOn)    $this->sendWhatsApp($adminWhatsapp, $message, 'insurance', $vehicle->id);
            });
        }
    }

    private function checkInspections(string $adminEmail, string $adminWhatsapp, bool $emailOn, bool $waOn): void
    {
        foreach ($this->thresholds as $days) {
            $target = Carbon::today()->addDays($days)->format('Y-m-d');
            Vehicle::where('next_inspection_date', $target)->each(function (Vehicle $vehicle) use ($days, $adminEmail, $adminWhatsapp, $emailOn, $waOn) {
                $subject = "Inspection Due: {$vehicle->plate_number}";
                $message = "Josbin Fleet MS Alert: Vehicle {$vehicle->plate_number} inspection is due in {$days} days on {$vehicle->next_inspection_date->format('d M Y')}.";
                if ($emailOn) $this->sendEmail($adminEmail, $subject, $message, 'inspection', $vehicle->id);
                if ($waOn)    $this->sendWhatsApp($adminWhatsapp, $message, 'inspection', $vehicle->id);
            });
        }
    }

    private function checkLicenses(string $adminEmail, string $adminWhatsapp, bool $emailOn, bool $waOn): void
    {
        foreach ($this->thresholds as $days) {
            $target = Carbon::today()->addDays($days)->format('Y-m-d');
            Driver::where('status', 'active')->where('license_expiry', $target)->each(function (Driver $driver) use ($days, $adminEmail, $adminWhatsapp, $emailOn, $waOn) {
                $fullName = "{$driver->first_name} {$driver->last_name}";
                $subject  = "License Expiring: {$fullName}";
                $message  = "Josbin Fleet MS Alert: Driver {$fullName}'s license (#{$driver->license_number}) expires in {$days} days on {$driver->license_expiry->format('d M Y')}.";
                if ($emailOn) $this->sendEmail($adminEmail, $subject, $message, 'license', null, $driver->id);
                if ($waOn)    $this->sendWhatsApp($adminWhatsapp, $message, 'license', null, $driver->id);
                if ($waOn && $driver->whatsapp) {
                    $this->sendWhatsApp($driver->whatsapp, "Josbin Fleet MS: Your license expires in {$days} days on {$driver->license_expiry->format('d M Y')}. Please arrange renewal.", 'license', null, $driver->id);
                }
            });
        }
    }

    // -------------------------------------------------------------------------

    private function sendEmail(string $to, string $subject, string $body, string $type, ?int $vehicleId = null, ?int $driverId = null): void
    {
        $log = NotificationLog::create([
            'type'       => $type,
            'channel'    => 'email',
            'recipient'  => $to,
            'subject'    => $subject,
            'message'    => $body,
            'status'     => 'pending',
            'vehicle_id' => $vehicleId,
            'driver_id'  => $driverId,
        ]);

        try {
            Mail::raw($body, function ($mail) use ($to, $subject) {
                $mail->to($to)->subject($subject);
            });

            $log->update(['status' => 'sent', 'sent_at' => now()]);
            $this->line("  Email sent to {$to}: {$subject}");
        } catch (\Throwable $e) {
            $log->update(['status' => 'failed', 'error_message' => $e->getMessage()]);
            $this->error("  Email failed to {$to}: {$e->getMessage()}");
        }
    }

    private function sendWhatsApp(string $to, string $message, string $type, ?int $vehicleId = null, ?int $driverId = null): void
    {
        if (empty($to)) return;

        $log = NotificationLog::create([
            'type'       => $type,
            'channel'    => 'whatsapp',
            'recipient'  => $to,
            'message'    => $message,
            'status'     => 'pending',
            'vehicle_id' => $vehicleId,
            'driver_id'  => $driverId,
        ]);

        try {
            $twilio = new TwilioClient(
                config('services.twilio.sid'),
                config('services.twilio.token')
            );

            $twilio->messages->create("whatsapp:{$to}", [
                'from' => 'whatsapp:' . config('services.twilio.whatsapp_from'),
                'body' => $message,
            ]);

            $log->update(['status' => 'sent', 'sent_at' => now()]);
            $this->line("  WhatsApp sent to {$to}");
        } catch (\Throwable $e) {
            $log->update(['status' => 'failed', 'error_message' => $e->getMessage()]);
            $this->error("  WhatsApp failed to {$to}: {$e->getMessage()}");
        }
    }
}
