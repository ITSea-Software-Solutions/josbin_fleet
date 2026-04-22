<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Twilio\Rest\Client as TwilioClient;

class SettingController extends Controller
{
    /** GET /settings — return all settings as grouped key-value object */
    public function index(): JsonResponse
    {
        $settings = Setting::orderBy('group')->orderBy('id')->get();

        // Return flat key => value map for easy frontend consumption
        $map = $settings->mapWithKeys(fn($s) => [
            $s->key => [
                'value' => $s->type === 'boolean'
                    ? filter_var($s->value, FILTER_VALIDATE_BOOLEAN)
                    : $s->value,
                'label' => $s->label,
                'group' => $s->group,
                'type'  => $s->type,
            ],
        ]);

        return response()->json($map);
    }

    /** PUT /settings — bulk update settings */
    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'settings'   => 'required|array',
            'settings.*' => 'nullable|string|max:500',
        ]);

        foreach ($data['settings'] as $key => $value) {
            Setting::where('key', $key)->update(['value' => $value]);
        }

        return response()->json(['message' => 'Settings saved successfully.']);
    }

    /** POST /settings/test-email — send a test email */
    public function testEmail(Request $request): JsonResponse
    {
        $to = Setting::get('admin_email', config('fleet.admin_email'));

        try {
            // Apply settings-based mail config at runtime
            $this->applyMailConfig();

            Mail::raw(
                "This is a test notification from Josbin Fleet MS.\n\nIf you received this, your email settings are configured correctly.",
                fn($mail) => $mail->to($to)->subject('Josbin Fleet MS — Test Notification')
            );

            return response()->json(['message' => "Test email sent to {$to}."]);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Email failed: ' . $e->getMessage()], 422);
        }
    }

    /** POST /settings/test-whatsapp — send a test WhatsApp message */
    public function testWhatsApp(Request $request): JsonResponse
    {
        $to   = Setting::get('admin_whatsapp', config('fleet.admin_whatsapp'));
        $sid  = Setting::get('twilio_sid',   config('services.twilio.sid'));
        $token = Setting::get('twilio_token', config('services.twilio.token'));
        $from = Setting::get('twilio_from',  config('services.twilio.whatsapp_from'));

        if (empty($to) || empty($sid) || empty($token)) {
            return response()->json(['message' => 'WhatsApp not configured. Fill in Twilio credentials and admin WhatsApp number first.'], 422);
        }

        try {
            $twilio = new TwilioClient($sid, $token);
            $twilio->messages->create("whatsapp:{$to}", [
                'from' => "whatsapp:{$from}",
                'body' => 'Josbin Fleet MS — Test notification. Your WhatsApp alerts are configured correctly!',
            ]);

            return response()->json(['message' => "Test WhatsApp sent to {$to}."]);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'WhatsApp failed: ' . $e->getMessage()], 422);
        }
    }

    private function applyMailConfig(): void
    {
        $host     = Setting::get('mail_host');
        $port     = Setting::get('mail_port');
        $username = Setting::get('mail_username');
        $password = Setting::get('mail_password');
        $from     = Setting::get('mail_from');

        if ($host) config(['mail.mailers.smtp.host'     => $host]);
        if ($port) config(['mail.mailers.smtp.port'     => (int)$port]);
        if ($username) config(['mail.mailers.smtp.username' => $username]);
        if ($password) config(['mail.mailers.smtp.password' => $password]);
        if ($from)  config(['mail.from.address' => $from]);
        config(['mail.default' => 'smtp']);
    }
}
