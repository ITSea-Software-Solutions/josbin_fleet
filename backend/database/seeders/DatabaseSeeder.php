<?php

namespace Database\Seeders;

use App\Models\Driver;
use App\Models\FuelLog;
use App\Models\Inspection;
use App\Models\Insurance;
use App\Models\NotificationLog;
use App\Models\Service;
use App\Models\Setting;
use App\Models\TripLog;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        // ── Admin user ────────────────────────────────────────────────────────
        User::updateOrCreate(
            ['email' => 'admin@josbin.sr'],
            ['name' => 'Admin', 'password' => 'password']
        );

        // ── Notification settings ─────────────────────────────────────────────
        $defaults = [
            ['key' => 'admin_email',            'value' => 'admin@josbin.sr',   'label' => 'Admin Email',              'group' => 'recipients', 'type' => 'text'],
            ['key' => 'admin_whatsapp',          'value' => '',                  'label' => 'Admin WhatsApp',           'group' => 'recipients', 'type' => 'text'],
            ['key' => 'notify_email_enabled',    'value' => 'true',              'label' => 'Email Notifications',      'group' => 'recipients', 'type' => 'boolean'],
            ['key' => 'notify_whatsapp_enabled', 'value' => 'false',             'label' => 'WhatsApp Notifications',   'group' => 'recipients', 'type' => 'boolean'],
            ['key' => 'alert_days',              'value' => '30,14,7',           'label' => 'Alert Days',               'group' => 'alerts',     'type' => 'text'],
            ['key' => 'alert_service',           'value' => 'true',              'label' => 'Service Due Alerts',       'group' => 'alerts',     'type' => 'boolean'],
            ['key' => 'alert_insurance',         'value' => 'true',              'label' => 'Insurance Expiry Alerts',  'group' => 'alerts',     'type' => 'boolean'],
            ['key' => 'alert_inspection',        'value' => 'true',              'label' => 'Inspection Due Alerts',    'group' => 'alerts',     'type' => 'boolean'],
            ['key' => 'alert_license',           'value' => 'true',              'label' => 'Driver License Alerts',    'group' => 'alerts',     'type' => 'boolean'],
            ['key' => 'mail_host',               'value' => 'smtp.mailtrap.io',  'label' => 'SMTP Host',                'group' => 'email',      'type' => 'text'],
            ['key' => 'mail_port',               'value' => '2525',              'label' => 'SMTP Port',                'group' => 'email',      'type' => 'number'],
            ['key' => 'mail_username',           'value' => '',                  'label' => 'SMTP Username',            'group' => 'email',      'type' => 'text'],
            ['key' => 'mail_password',           'value' => '',                  'label' => 'SMTP Password',            'group' => 'email',      'type' => 'password'],
            ['key' => 'mail_from',               'value' => 'noreply@josbin.sr', 'label' => 'From Address',             'group' => 'email',      'type' => 'text'],
            ['key' => 'twilio_sid',              'value' => '',                  'label' => 'Twilio Account SID',       'group' => 'whatsapp',   'type' => 'text'],
            ['key' => 'twilio_token',            'value' => '',                  'label' => 'Twilio Auth Token',        'group' => 'whatsapp',   'type' => 'password'],
            ['key' => 'twilio_from',             'value' => '+14155238886',      'label' => 'Twilio WhatsApp Number',   'group' => 'whatsapp',   'type' => 'text'],
        ];
        foreach ($defaults as $row) {
            Setting::updateOrCreate(['key' => $row['key']], $row);
        }

        // ── Drivers ───────────────────────────────────────────────────────────
        $driversData = [
            ['first_name' => 'Ravi',    'last_name' => 'Persaud',      'email' => 'ravi.persaud@josbin.sr',  'phone' => '+5978561001', 'whatsapp' => '+5978561001', 'license_number' => 'SR-DL-0041', 'license_expiry' => $now->copy()->addMonths(8)->format('Y-m-d'),   'address' => 'Kwattaweg 12, Paramaribo',          'status' => 'active'],
            ['first_name' => 'Shankar', 'last_name' => 'Naidoo',       'email' => 'shankar.naidoo@josbin.sr','phone' => '+5978561002', 'whatsapp' => '+5978561002', 'license_number' => 'SR-DL-0042', 'license_expiry' => $now->copy()->addDays(12)->format('Y-m-d'),   'address' => 'Indira Ghandiweg 45, Paramaribo',   'status' => 'active'],
            ['first_name' => 'Indira',  'last_name' => 'Ramkhelawan',  'email' => 'indira.r@josbin.sr',      'phone' => '+5978561003', 'whatsapp' => '+5978561003', 'license_number' => 'SR-DL-0043', 'license_expiry' => $now->copy()->addMonths(14)->format('Y-m-d'),  'address' => 'Tourtonnelaan 8, Paramaribo',       'status' => 'active'],
            ['first_name' => 'Carlos',  'last_name' => 'Fernandez',    'email' => 'carlos.f@josbin.sr',      'phone' => '+5978561004', 'whatsapp' => null,           'license_number' => 'SR-DL-0044', 'license_expiry' => $now->copy()->addMonths(5)->format('Y-m-d'),   'address' => 'Zwartenhovenbrugstraat 3',          'status' => 'active'],
            ['first_name' => 'Priya',   'last_name' => 'Bhagwandeen',  'email' => 'priya.b@josbin.sr',       'phone' => '+5978561005', 'whatsapp' => '+5978561005', 'license_number' => 'SR-DL-0045', 'license_expiry' => $now->copy()->addMonths(22)->format('Y-m-d'),  'address' => 'Mahonylaan 19, Paramaribo',         'status' => 'active'],
            ['first_name' => 'Michael', 'last_name' => 'Jadnanansing', 'email' => 'michael.j@josbin.sr',     'phone' => '+5978561006', 'whatsapp' => null,           'license_number' => 'SR-DL-0046', 'license_expiry' => $now->copy()->subMonths(2)->format('Y-m-d'),   'address' => 'Keizerstraat 77, Paramaribo',       'status' => 'inactive'],
            ['first_name' => 'Devika',  'last_name' => 'Tulsie',       'email' => 'devika.t@josbin.sr',      'phone' => '+5978561007', 'whatsapp' => '+5978561007', 'license_number' => 'SR-DL-0047', 'license_expiry' => $now->copy()->addMonths(11)->format('Y-m-d'),  'address' => 'Nieuwe Domineestraat 56, Paramaribo','status' => 'active'],
            ['first_name' => 'Glenn',   'last_name' => 'Santokie',     'email' => 'glenn.s@josbin.sr',       'phone' => '+5978561008', 'whatsapp' => '+5978561008', 'license_number' => 'SR-DL-0048', 'license_expiry' => $now->copy()->addDays(6)->format('Y-m-d'),    'address' => 'Waterkant 22, Paramaribo',          'status' => 'active'],
        ];
        $drivers = [];
        foreach ($driversData as $d) {
            $drivers[] = Driver::updateOrCreate(['email' => $d['email']], $d);
        }

        // ── Vehicles ──────────────────────────────────────────────────────────
        $vehiclesData = [
            ['plate_number' => 'SRN-0042', 'make' => 'Toyota',     'model' => 'Hilux',        'year' => 2021, 'color' => 'White',  'vin' => 'TH2021SRN00042', 'status' => 'active',      'fuel_type' => 'diesel', 'mileage' => 58420, 'driver_id' => $drivers[0]->id, 'next_service_date' => $now->copy()->addDays(6)->format('Y-m-d'),   'next_inspection_date' => $now->copy()->addDays(32)->format('Y-m-d'),  'insurance_expiry' => $now->copy()->addMonths(9)->format('Y-m-d')],
            ['plate_number' => 'SRN-0011', 'make' => 'Nissan',     'model' => 'Navara',       'year' => 2020, 'color' => 'Silver', 'vin' => 'NN2020SRN00011', 'status' => 'active',      'fuel_type' => 'diesel', 'mileage' => 74130, 'driver_id' => $drivers[1]->id, 'next_service_date' => $now->copy()->addDays(14)->format('Y-m-d'),  'next_inspection_date' => $now->copy()->addDays(60)->format('Y-m-d'),  'insurance_expiry' => $now->copy()->addDays(13)->format('Y-m-d')],
            ['plate_number' => 'SRN-0031', 'make' => 'Mitsubishi', 'model' => 'L200',         'year' => 2022, 'color' => 'Blue',   'vin' => 'ML2022SRN00031', 'status' => 'active',      'fuel_type' => 'diesel', 'mileage' => 41200, 'driver_id' => $drivers[2]->id, 'next_service_date' => $now->copy()->addDays(30)->format('Y-m-d'),  'next_inspection_date' => $now->copy()->addDays(90)->format('Y-m-d'),  'insurance_expiry' => $now->copy()->addMonths(6)->format('Y-m-d')],
            ['plate_number' => 'SRN-0058', 'make' => 'Isuzu',      'model' => 'D-Max',        'year' => 2019, 'color' => 'Red',    'vin' => 'ID2019SRN00058', 'status' => 'active',      'fuel_type' => 'diesel', 'mileage' => 92580, 'driver_id' => $drivers[3]->id, 'next_service_date' => $now->copy()->addDays(45)->format('Y-m-d'),  'next_inspection_date' => $now->copy()->addDays(15)->format('Y-m-d'),  'insurance_expiry' => $now->copy()->addMonths(3)->format('Y-m-d')],
            ['plate_number' => 'SRN-0075', 'make' => 'Toyota',     'model' => 'Land Cruiser', 'year' => 2023, 'color' => 'Black',  'vin' => 'TL2023SRN00075', 'status' => 'active',      'fuel_type' => 'petrol', 'mileage' => 22100, 'driver_id' => $drivers[4]->id, 'next_service_date' => $now->copy()->addMonths(3)->format('Y-m-d'), 'next_inspection_date' => $now->copy()->addMonths(4)->format('Y-m-d'), 'insurance_expiry' => $now->copy()->addMonths(11)->format('Y-m-d')],
            ['plate_number' => 'SRN-0063', 'make' => 'Ford',       'model' => 'Ranger',       'year' => 2021, 'color' => 'Grey',   'vin' => 'FR2021SRN00063', 'status' => 'active',      'fuel_type' => 'diesel', 'mileage' => 65900, 'driver_id' => $drivers[6]->id, 'next_service_date' => $now->copy()->addDays(7)->format('Y-m-d'),   'next_inspection_date' => $now->copy()->addDays(28)->format('Y-m-d'),  'insurance_expiry' => $now->copy()->addMonths(7)->format('Y-m-d')],
            ['plate_number' => 'SRN-0089', 'make' => 'Hyundai',    'model' => 'Tucson',       'year' => 2022, 'color' => 'Pearl',  'vin' => 'HT2022SRN00089', 'status' => 'active',      'fuel_type' => 'petrol', 'mileage' => 33750, 'driver_id' => $drivers[7]->id, 'next_service_date' => $now->copy()->addMonths(2)->format('Y-m-d'), 'next_inspection_date' => $now->copy()->addMonths(5)->format('Y-m-d'), 'insurance_expiry' => $now->copy()->addDays(30)->format('Y-m-d')],
            ['plate_number' => 'SRN-0044', 'make' => 'Toyota',     'model' => 'Corolla',      'year' => 2020, 'color' => 'White',  'vin' => 'TC2020SRN00044', 'status' => 'active',      'fuel_type' => 'petrol', 'mileage' => 48300, 'driver_id' => null,            'next_service_date' => $now->copy()->addMonths(1)->format('Y-m-d'), 'next_inspection_date' => $now->copy()->addMonths(2)->format('Y-m-d'), 'insurance_expiry' => $now->copy()->addMonths(8)->format('Y-m-d')],
            ['plate_number' => 'SRN-0091', 'make' => 'Nissan',     'model' => 'Patrol',       'year' => 2021, 'color' => 'Bronze', 'vin' => 'NP2021SRN00091', 'status' => 'maintenance', 'fuel_type' => 'petrol', 'mileage' => 81200, 'driver_id' => null,            'next_service_date' => $now->copy()->addDays(3)->format('Y-m-d'),   'next_inspection_date' => $now->copy()->addDays(10)->format('Y-m-d'),  'insurance_expiry' => $now->copy()->addMonths(4)->format('Y-m-d')],
            ['plate_number' => 'SRN-0107', 'make' => 'Mitsubishi', 'model' => 'Outlander',    'year' => 2022, 'color' => 'Green',  'vin' => 'MO2022SRN00107', 'status' => 'active',      'fuel_type' => 'hybrid', 'mileage' => 19800, 'driver_id' => null,            'next_service_date' => $now->copy()->addMonths(4)->format('Y-m-d'), 'next_inspection_date' => $now->copy()->addMonths(6)->format('Y-m-d'), 'insurance_expiry' => $now->copy()->addMonths(10)->format('Y-m-d')],
        ];
        $vehicles = [];
        foreach ($vehiclesData as $v) {
            $vehicles[] = Vehicle::updateOrCreate(['plate_number' => $v['plate_number']], $v);
        }

        // ── Services ──────────────────────────────────────────────────────────
        $servicesData = [
            ['vehicle_id' => $vehicles[0]->id, 'type' => 'oil_change',       'service_date' => $now->copy()->subMonths(3)->format('Y-m-d'), 'next_service_date' => $now->copy()->addDays(6)->format('Y-m-d'),  'cost' => 450.00,  'garage' => 'Paramaribo Auto Service', 'status' => 'completed', 'description' => 'Oil & filter change, topped up fluids'],
            ['vehicle_id' => $vehicles[0]->id, 'type' => 'tire_rotation',    'service_date' => $now->copy()->subMonths(6)->format('Y-m-d'), 'next_service_date' => null,                                       'cost' => 200.00,  'garage' => 'TireMaster Suriname',      'status' => 'completed', 'description' => 'Rotated all 4 tyres, checked pressure'],
            ['vehicle_id' => $vehicles[1]->id, 'type' => 'full_service',     'service_date' => $now->copy()->subMonths(4)->format('Y-m-d'), 'next_service_date' => $now->copy()->addDays(14)->format('Y-m-d'), 'cost' => 1250.00, 'garage' => 'Nissan Dealer PBO',        'status' => 'completed', 'description' => '60k service — belts, plugs, oil, air filter'],
            ['vehicle_id' => $vehicles[2]->id, 'type' => 'brake_inspection', 'service_date' => $now->copy()->subMonths(2)->format('Y-m-d'), 'next_service_date' => null,                                       'cost' => 380.00,  'garage' => 'Euro Auto Suriname',       'status' => 'completed', 'description' => 'Front brake pads replaced'],
            ['vehicle_id' => $vehicles[3]->id, 'type' => 'oil_change',       'service_date' => $now->copy()->subMonths(5)->format('Y-m-d'), 'next_service_date' => $now->copy()->addDays(45)->format('Y-m-d'), 'cost' => 520.00,  'garage' => 'Isuzu Service Center',     'status' => 'completed', 'description' => 'Synthetic oil & filter change'],
            ['vehicle_id' => $vehicles[5]->id, 'type' => 'oil_change',       'service_date' => $now->copy()->subDays(20)->format('Y-m-d'),  'next_service_date' => $now->copy()->addDays(7)->format('Y-m-d'),  'cost' => 480.00,  'garage' => 'Ford Suriname',             'status' => 'completed', 'description' => 'Routine oil change'],
            ['vehicle_id' => $vehicles[8]->id, 'type' => 'full_service',     'service_date' => $now->copy()->subDays(5)->format('Y-m-d'),   'next_service_date' => $now->copy()->addDays(3)->format('Y-m-d'),  'cost' => 2100.00, 'garage' => 'Paramaribo Auto Service', 'status' => 'completed', 'description' => 'Major service — brake overhaul'],
            ['vehicle_id' => $vehicles[4]->id, 'type' => 'other',            'service_date' => $now->copy()->addMonths(3)->format('Y-m-d'), 'next_service_date' => null,                                       'cost' => null,    'garage' => 'Toyota Dealer PBO',        'status' => 'scheduled', 'description' => '50k scheduled service'],
        ];
        foreach ($servicesData as $s) {
            Service::create($s);
        }

        // ── Insurance ─────────────────────────────────────────────────────────
        $insuranceData = [
            ['vehicle_id' => $vehicles[0]->id, 'provider' => 'Assuria N.V.',          'policy_number' => 'ASS-2024-0042', 'type' => 'comprehensive', 'start_date' => $now->copy()->subMonths(3)->format('Y-m-d'),  'expiry_date' => $now->copy()->addMonths(9)->format('Y-m-d'),   'premium_amount' => 3600.00, 'coverage_amount' => 180000.00, 'status' => 'active'],
            ['vehicle_id' => $vehicles[1]->id, 'provider' => 'Hakrinbank Assurance',  'policy_number' => 'HAK-2024-0011', 'type' => 'comprehensive', 'start_date' => $now->copy()->subMonths(11)->format('Y-m-d'), 'expiry_date' => $now->copy()->addDays(13)->format('Y-m-d'),    'premium_amount' => 4200.00, 'coverage_amount' => 220000.00, 'status' => 'active'],
            ['vehicle_id' => $vehicles[2]->id, 'provider' => 'Assuria N.V.',          'policy_number' => 'ASS-2025-0031', 'type' => 'comprehensive', 'start_date' => $now->copy()->subMonths(6)->format('Y-m-d'),  'expiry_date' => $now->copy()->addMonths(6)->format('Y-m-d'),   'premium_amount' => 3900.00, 'coverage_amount' => 200000.00, 'status' => 'active'],
            ['vehicle_id' => $vehicles[3]->id, 'provider' => 'Self Reliance N.V.',    'policy_number' => 'SR-2024-0058',  'type' => 'third_party',   'start_date' => $now->copy()->subMonths(9)->format('Y-m-d'),  'expiry_date' => $now->copy()->addMonths(3)->format('Y-m-d'),   'premium_amount' => 1800.00, 'coverage_amount' => 50000.00,  'status' => 'active'],
            ['vehicle_id' => $vehicles[4]->id, 'provider' => 'Assuria N.V.',          'policy_number' => 'ASS-2025-0075', 'type' => 'comprehensive', 'start_date' => $now->copy()->subMonths(1)->format('Y-m-d'),  'expiry_date' => $now->copy()->addMonths(11)->format('Y-m-d'),  'premium_amount' => 5500.00, 'coverage_amount' => 320000.00, 'status' => 'active'],
            ['vehicle_id' => $vehicles[5]->id, 'provider' => 'Hakrinbank Assurance',  'policy_number' => 'HAK-2025-0063', 'type' => 'comprehensive', 'start_date' => $now->copy()->subMonths(5)->format('Y-m-d'),  'expiry_date' => $now->copy()->addMonths(7)->format('Y-m-d'),   'premium_amount' => 4100.00, 'coverage_amount' => 210000.00, 'status' => 'active'],
            ['vehicle_id' => $vehicles[6]->id, 'provider' => 'Self Reliance N.V.',    'policy_number' => 'SR-2025-0089',  'type' => 'comprehensive', 'start_date' => $now->copy()->subMonths(10)->format('Y-m-d'), 'expiry_date' => $now->copy()->addDays(30)->format('Y-m-d'),    'premium_amount' => 3750.00, 'coverage_amount' => 195000.00, 'status' => 'active'],
            ['vehicle_id' => $vehicles[7]->id, 'provider' => 'Assuria N.V.',          'policy_number' => 'ASS-2024-0044', 'type' => 'third_party',   'start_date' => $now->copy()->subMonths(4)->format('Y-m-d'),  'expiry_date' => $now->copy()->addMonths(8)->format('Y-m-d'),   'premium_amount' => 1650.00, 'coverage_amount' => 40000.00,  'status' => 'active'],
            ['vehicle_id' => $vehicles[8]->id, 'provider' => 'Hakrinbank Assurance',  'policy_number' => 'HAK-2024-0091', 'type' => 'comprehensive', 'start_date' => $now->copy()->subMonths(8)->format('Y-m-d'),  'expiry_date' => $now->copy()->addMonths(4)->format('Y-m-d'),   'premium_amount' => 4400.00, 'coverage_amount' => 240000.00, 'status' => 'active'],
            ['vehicle_id' => $vehicles[9]->id, 'provider' => 'Assuria N.V.',          'policy_number' => 'ASS-2025-0107', 'type' => 'comprehensive', 'start_date' => $now->copy()->subMonths(2)->format('Y-m-d'),  'expiry_date' => $now->copy()->addMonths(10)->format('Y-m-d'),  'premium_amount' => 4800.00, 'coverage_amount' => 260000.00, 'status' => 'active'],
        ];
        foreach ($insuranceData as $ins) {
            Insurance::create($ins);
        }

        // ── Inspections ───────────────────────────────────────────────────────
        $inspectionsData = [
            ['vehicle_id' => $vehicles[0]->id, 'type' => 'annual',   'inspection_date' => $now->copy()->subMonths(11)->format('Y-m-d'), 'next_inspection_date' => $now->copy()->addDays(32)->format('Y-m-d'), 'result' => 'pass', 'inspector' => 'MOT Suriname',              'location' => 'Paramaribo', 'cost' => 350.00],
            ['vehicle_id' => $vehicles[1]->id, 'type' => 'safety',   'inspection_date' => $now->copy()->subMonths(5)->format('Y-m-d'),  'next_inspection_date' => $now->copy()->addDays(60)->format('Y-m-d'), 'result' => 'pass', 'inspector' => 'AutoCheck Suriname',        'location' => 'Paramaribo', 'cost' => 280.00],
            ['vehicle_id' => $vehicles[2]->id, 'type' => 'annual',   'inspection_date' => $now->copy()->subMonths(3)->format('Y-m-d'),  'next_inspection_date' => $now->copy()->addDays(90)->format('Y-m-d'), 'result' => 'pass', 'inspector' => 'MOT Suriname',              'location' => 'Paramaribo', 'cost' => 350.00],
            ['vehicle_id' => $vehicles[3]->id, 'type' => 'routine',  'inspection_date' => $now->copy()->subDays(20)->format('Y-m-d'),   'next_inspection_date' => $now->copy()->addDays(15)->format('Y-m-d'), 'result' => 'pass', 'inspector' => 'Fleet Inspector K. Doerga','location' => 'Wanica',     'cost' => 150.00],
            ['vehicle_id' => $vehicles[6]->id, 'type' => 'annual',   'inspection_date' => $now->copy()->subMonths(7)->format('Y-m-d'),  'next_inspection_date' => $now->copy()->addMonths(5)->format('Y-m-d'), 'result' => 'pass', 'inspector' => 'MOT Suriname',              'location' => 'Paramaribo', 'cost' => 350.00],
            ['vehicle_id' => $vehicles[8]->id, 'type' => 'safety',   'inspection_date' => $now->copy()->subDays(10)->format('Y-m-d'),   'next_inspection_date' => $now->copy()->addDays(10)->format('Y-m-d'), 'result' => 'fail', 'inspector' => 'AutoCheck Suriname',        'location' => 'Paramaribo', 'cost' => 280.00, 'notes' => 'Brake issue — vehicle in maintenance'],
            ['vehicle_id' => $vehicles[4]->id, 'type' => 'emissions', 'inspection_date' => $now->copy()->subMonths(2)->format('Y-m-d'), 'next_inspection_date' => $now->copy()->addMonths(4)->format('Y-m-d'), 'result' => 'pass', 'inspector' => 'Emissions Lab PBO',         'location' => 'Paramaribo', 'cost' => 200.00],
        ];
        foreach ($inspectionsData as $ins) {
            Inspection::create($ins);
        }

        // ── Fuel Logs ─────────────────────────────────────────────────────────
        $fuelData = [
            ['vehicle_id' => $vehicles[0]->id, 'driver_id' => $drivers[0]->id, 'fill_date' => $now->copy()->subDays(3)->format('Y-m-d'),  'liters' => 62.5, 'cost_per_liter' => 3.45, 'odometer' => 58420, 'fuel_type' => 'diesel', 'station' => 'Staatsolie Oost-West Verbinding', 'full_tank' => true],
            ['vehicle_id' => $vehicles[0]->id, 'driver_id' => $drivers[0]->id, 'fill_date' => $now->copy()->subDays(17)->format('Y-m-d'), 'liters' => 55.0, 'cost_per_liter' => 3.42, 'odometer' => 57890, 'fuel_type' => 'diesel', 'station' => 'Staatsolie Centrum',              'full_tank' => true],
            ['vehicle_id' => $vehicles[1]->id, 'driver_id' => $drivers[1]->id, 'fill_date' => $now->copy()->subDays(5)->format('Y-m-d'),  'liters' => 70.0, 'cost_per_liter' => 3.45, 'odometer' => 74130, 'fuel_type' => 'diesel', 'station' => 'Staatsolie Noord',                'full_tank' => true],
            ['vehicle_id' => $vehicles[1]->id, 'driver_id' => $drivers[1]->id, 'fill_date' => $now->copy()->subDays(22)->format('Y-m-d'), 'liters' => 65.0, 'cost_per_liter' => 3.40, 'odometer' => 73500, 'fuel_type' => 'diesel', 'station' => 'Staatsolie Kwatta',               'full_tank' => false],
            ['vehicle_id' => $vehicles[2]->id, 'driver_id' => $drivers[2]->id, 'fill_date' => $now->copy()->subDays(7)->format('Y-m-d'),  'liters' => 58.0, 'cost_per_liter' => 3.45, 'odometer' => 41200, 'fuel_type' => 'diesel', 'station' => 'Staatsolie Centrum',              'full_tank' => true],
            ['vehicle_id' => $vehicles[3]->id, 'driver_id' => $drivers[3]->id, 'fill_date' => $now->copy()->subDays(4)->format('Y-m-d'),  'liters' => 80.0, 'cost_per_liter' => 3.45, 'odometer' => 92580, 'fuel_type' => 'diesel', 'station' => 'Staatsolie Oost-West Verbinding', 'full_tank' => true],
            ['vehicle_id' => $vehicles[4]->id, 'driver_id' => $drivers[4]->id, 'fill_date' => $now->copy()->subDays(6)->format('Y-m-d'),  'liters' => 85.0, 'cost_per_liter' => 4.20, 'odometer' => 22100, 'fuel_type' => 'petrol', 'station' => 'Staatsolie Leonsberg',            'full_tank' => true],
            ['vehicle_id' => $vehicles[5]->id, 'driver_id' => $drivers[6]->id, 'fill_date' => $now->copy()->subDays(2)->format('Y-m-d'),  'liters' => 65.0, 'cost_per_liter' => 3.45, 'odometer' => 65900, 'fuel_type' => 'diesel', 'station' => 'Staatsolie Noord',                'full_tank' => true],
            ['vehicle_id' => $vehicles[6]->id, 'driver_id' => $drivers[7]->id, 'fill_date' => $now->copy()->subDays(8)->format('Y-m-d'),  'liters' => 50.0, 'cost_per_liter' => 4.20, 'odometer' => 33750, 'fuel_type' => 'petrol', 'station' => 'Staatsolie Centrum',              'full_tank' => true],
            ['vehicle_id' => $vehicles[7]->id, 'driver_id' => null,            'fill_date' => $now->copy()->subDays(12)->format('Y-m-d'), 'liters' => 45.0, 'cost_per_liter' => 4.18, 'odometer' => 48300, 'fuel_type' => 'petrol', 'station' => 'Staatsolie Kwatta',               'full_tank' => false],
            ['vehicle_id' => $vehicles[9]->id, 'driver_id' => null,            'fill_date' => $now->copy()->subDays(9)->format('Y-m-d'),  'liters' => 30.0, 'cost_per_liter' => 2.10, 'odometer' => 19800, 'fuel_type' => 'hybrid', 'station' => 'Staatsolie Centrum',              'full_tank' => true],
        ];
        foreach ($fuelData as $f) {
            FuelLog::create($f);
        }

        // ── Trip Logs ─────────────────────────────────────────────────────────
        $tripsData = [
            ['vehicle_id' => $vehicles[0]->id, 'driver_id' => $drivers[0]->id, 'origin' => 'Paramaribo Depot',         'destination' => 'Moengo Construction Site',   'purpose' => 'Material delivery',       'start_time' => $now->copy()->subDays(2)->setTime(6,30)->toDateTimeString(),  'end_time' => $now->copy()->subDays(2)->setTime(14,15)->toDateTimeString(), 'start_odometer' => 58100, 'end_odometer' => 58420, 'status' => 'completed'],
            ['vehicle_id' => $vehicles[1]->id, 'driver_id' => $drivers[1]->id, 'origin' => 'Paramaribo HQ',            'destination' => 'Nieuw Nickerie Port',         'purpose' => 'Equipment transport',     'start_time' => $now->copy()->subDays(4)->setTime(5,0)->toDateTimeString(),   'end_time' => $now->copy()->subDays(3)->setTime(17,0)->toDateTimeString(),  'start_odometer' => 73720, 'end_odometer' => 74130, 'status' => 'completed'],
            ['vehicle_id' => $vehicles[2]->id, 'driver_id' => $drivers[2]->id, 'origin' => 'Paramaribo Depot',         'destination' => 'Lelydorp Warehouse',          'purpose' => 'Parts pickup',             'start_time' => $now->copy()->subDays(1)->setTime(8,0)->toDateTimeString(),   'end_time' => $now->copy()->subDays(1)->setTime(10,30)->toDateTimeString(), 'start_odometer' => 41050, 'end_odometer' => 41200, 'status' => 'completed'],
            ['vehicle_id' => $vehicles[3]->id, 'driver_id' => $drivers[3]->id, 'origin' => 'Paramaribo HQ',            'destination' => 'Brownsweg Mining Camp',       'purpose' => 'Staff transport',          'start_time' => $now->copy()->subDays(3)->setTime(6,0)->toDateTimeString(),   'end_time' => $now->copy()->subDays(3)->setTime(13,45)->toDateTimeString(), 'start_odometer' => 92200, 'end_odometer' => 92580, 'status' => 'completed'],
            ['vehicle_id' => $vehicles[4]->id, 'driver_id' => $drivers[4]->id, 'origin' => 'Paramaribo HQ',            'destination' => 'Albina Border Post',          'purpose' => 'Document delivery',       'start_time' => $now->copy()->subDays(5)->setTime(7,0)->toDateTimeString(),   'end_time' => $now->copy()->subDays(5)->setTime(16,0)->toDateTimeString(),  'start_odometer' => 21700, 'end_odometer' => 22100, 'status' => 'completed'],
            ['vehicle_id' => $vehicles[5]->id, 'driver_id' => $drivers[6]->id, 'origin' => 'Paramaribo Depot',         'destination' => 'Apoera Site',                 'purpose' => 'Inspection visit',         'start_time' => $now->copy()->subDays(1)->setTime(5,30)->toDateTimeString(),  'end_time' => null,                                                        'start_odometer' => 65650, 'end_odometer' => null,   'status' => 'in_progress'],
            ['vehicle_id' => $vehicles[6]->id, 'driver_id' => $drivers[7]->id, 'origin' => 'Paramaribo HQ',            'destination' => 'Johan Adolf Pengel Airport',  'purpose' => 'Executive pickup',         'start_time' => $now->copy()->subDays(1)->setTime(14,0)->toDateTimeString(), 'end_time' => $now->copy()->subDays(1)->setTime(15,30)->toDateTimeString(), 'start_odometer' => 33640, 'end_odometer' => 33750, 'status' => 'completed'],
            ['vehicle_id' => $vehicles[9]->id, 'driver_id' => null,            'origin' => 'Paramaribo Service Ctr',  'destination' => 'Paramaribo Service Ctr',      'purpose' => 'Test drive post-service',  'start_time' => $now->copy()->subDays(9)->setTime(9,0)->toDateTimeString(),   'end_time' => $now->copy()->subDays(9)->setTime(9,45)->toDateTimeString(), 'start_odometer' => 19760, 'end_odometer' => 19800, 'status' => 'completed'],
        ];
        foreach ($tripsData as $t) {
            TripLog::create($t);
        }

        // ── Notification history ──────────────────────────────────────────────
        $notifData = [
            ['type' => 'service',    'channel' => 'email',    'recipient' => 'admin@josbin.sr', 'subject' => 'Service Due: SRN-0042 (Toyota Hilux)',       'message' => 'Vehicle SRN-0042 service due in 7 days.',       'status' => 'sent',   'sent_at' => $now->copy()->subDays(1)->setTime(8,0)->toDateTimeString(), 'vehicle_id' => $vehicles[0]->id, 'driver_id' => null],
            ['type' => 'insurance',  'channel' => 'email',    'recipient' => 'admin@josbin.sr', 'subject' => 'Insurance Expiring: SRN-0011 (Nissan Navara)','message' => 'Insurance for SRN-0011 expires in 14 days.',    'status' => 'sent',   'sent_at' => $now->copy()->subDays(1)->setTime(8,0)->toDateTimeString(), 'vehicle_id' => $vehicles[1]->id, 'driver_id' => null],
            ['type' => 'license',    'channel' => 'email',    'recipient' => 'admin@josbin.sr', 'subject' => 'License Expiring: Shankar Naidoo',            'message' => 'Shankar Naidoo license expires in 12 days.',    'status' => 'sent',   'sent_at' => $now->copy()->subDays(1)->setTime(8,1)->toDateTimeString(), 'vehicle_id' => null,            'driver_id' => $drivers[1]->id],
            ['type' => 'service',    'channel' => 'whatsapp', 'recipient' => '+5978561001',     'subject' => null,                                          'message' => 'Josbin Fleet MS Alert: SRN-0042 service in 7 days.','status' => 'failed','sent_at' => null,                                                       'vehicle_id' => $vehicles[0]->id, 'driver_id' => null, 'error_message' => 'Twilio credentials not configured'],
            ['type' => 'license',    'channel' => 'email',    'recipient' => 'admin@josbin.sr', 'subject' => 'License Expiring: Glenn Santokie',            'message' => 'Glenn Santokie license expires in 6 days.',     'status' => 'sent',   'sent_at' => $now->copy()->subDays(1)->setTime(8,2)->toDateTimeString(), 'vehicle_id' => null,            'driver_id' => $drivers[7]->id],
            ['type' => 'inspection', 'channel' => 'email',    'recipient' => 'admin@josbin.sr', 'subject' => 'Inspection Due: SRN-0058',                    'message' => 'Vehicle SRN-0058 inspection due in 15 days.',   'status' => 'sent',   'sent_at' => $now->copy()->subDays(2)->setTime(8,0)->toDateTimeString(), 'vehicle_id' => $vehicles[3]->id, 'driver_id' => null],
        ];
        foreach ($notifData as $n) {
            NotificationLog::create($n);
        }

        $this->command->info('✓ Seeded: 1 admin, 8 drivers, 10 vehicles, 8 services, 10 insurance policies, 7 inspections, 11 fuel logs, 8 trips, 6 notifications, 17 settings.');
    }
}
