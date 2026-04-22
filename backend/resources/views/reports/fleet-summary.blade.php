<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: DejaVu Sans, sans-serif; font-size: 10px; color: #1e293b; padding: 24px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 2px solid #2563eb; padding-bottom: 12px; }
  .logo { font-size: 20px; font-weight: bold; color: #2563eb; }
  .logo span { color: #1e293b; }
  .meta { text-align: right; font-size: 9px; color: #94a3b8; }
  .stat-row { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; margin-bottom: 18px; }
  .stat { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 5px; padding: 8px; text-align: center; }
  .stat .num { font-size: 16px; font-weight: bold; color: #2563eb; }
  .stat .lbl { font-size: 8px; color: #64748b; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; }
  table th { background: #1e3a8a; color: white; padding: 5px 7px; text-align: left; font-size: 9px; }
  table td { padding: 4px 7px; border-bottom: 1px solid #e2e8f0; font-size: 9px; }
  table tr:nth-child(even) td { background: #f8fafc; }
  .badge { display: inline-block; padding: 2px 6px; border-radius: 8px; font-size: 8px; font-weight: 600; }
  .badge-success { background: #dcfce7; color: #166534; }
  .badge-warning { background: #fef9c3; color: #854d0e; }
  .badge-danger  { background: #fee2e2; color: #991b1b; }
  .badge-neutral { background: #f1f5f9; color: #475569; }
  .section-title { font-size: 11px; font-weight: bold; color: #1e3a8a; margin: 14px 0 6px; border-left: 3px solid #2563eb; padding-left: 6px; }
  .footer { margin-top: 24px; padding-top: 8px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 8px; color: #94a3b8; }
</style>
</head>
<body>

<div class="header">
  <div>
    <div class="logo">Josbin<span> Fleet MS</span></div>
    <div style="font-size:12px; color:#64748b; margin-top:3px;">Fleet Summary Report</div>
  </div>
  <div class="meta">Generated: {{ $generated_at }}<br>Josbin Fleet MS v1.0</div>
</div>

<div class="stat-row">
  <div class="stat"><div class="num">{{ $stats['total'] }}</div><div class="lbl">Total Vehicles</div></div>
  <div class="stat"><div class="num">{{ $stats['active'] }}</div><div class="lbl">Active</div></div>
  <div class="stat"><div class="num">{{ $stats['maintenance'] }}</div><div class="lbl">In Maintenance</div></div>
  <div class="stat"><div class="num">{{ $stats['active_drivers'] }}/{{ $stats['total_drivers'] }}</div><div class="lbl">Active Drivers</div></div>
  <div class="stat"><div class="num">{{ number_format($stats['total_fuel_liters'], 0) }}L</div><div class="lbl">Total Fuel</div></div>
  <div class="stat"><div class="num">SRD {{ number_format($stats['total_fuel_cost'], 0) }}</div><div class="lbl">Fuel Cost</div></div>
</div>

<p class="section-title">Vehicle Fleet</p>
<table>
  <thead>
    <tr>
      <th>Plate</th><th>Make / Model</th><th>Year</th><th>Driver</th>
      <th>Mileage</th><th>Next Service</th><th>Insurance Exp.</th><th>Inspection Due</th><th>Status</th>
    </tr>
  </thead>
  <tbody>
  @foreach($vehicles as $v)
  @php
    $insExpiry = $v->insurances->sortByDesc('expiry_date')->first()?->expiry_date;
    $daysIns   = $insExpiry ? now()->diffInDays($insExpiry, false) : null;
    $daysSvc   = $v->next_service_date   ? now()->diffInDays($v->next_service_date, false)   : null;
    $daysInsp  = $v->next_inspection_date? now()->diffInDays($v->next_inspection_date, false) : null;
  @endphp
  <tr>
    <td><strong>{{ $v->plate_number }}</strong></td>
    <td>{{ $v->make }} {{ $v->model }}</td>
    <td>{{ $v->year }}</td>
    <td>{{ $v->driver ? $v->driver->first_name . ' ' . $v->driver->last_name : '—' }}</td>
    <td>{{ number_format($v->mileage) }} km</td>
    <td style="{{ $daysSvc !== null && $daysSvc <= 7 ? 'color:#dc2626;font-weight:bold' : ($daysSvc !== null && $daysSvc <= 30 ? 'color:#d97706' : '') }}">
      {{ $v->next_service_date?->format('d M Y') ?? '—' }}
    </td>
    <td style="{{ $daysIns !== null && $daysIns <= 7 ? 'color:#dc2626;font-weight:bold' : ($daysIns !== null && $daysIns <= 30 ? 'color:#d97706' : '') }}">
      {{ $insExpiry?->format('d M Y') ?? '—' }}
    </td>
    <td style="{{ $daysInsp !== null && $daysInsp <= 7 ? 'color:#dc2626;font-weight:bold' : ($daysInsp !== null && $daysInsp <= 30 ? 'color:#d97706' : '') }}">
      {{ $v->next_inspection_date?->format('d M Y') ?? '—' }}
    </td>
    <td>
      <span class="badge {{ $v->status === 'active' ? 'badge-success' : ($v->status === 'maintenance' ? 'badge-warning' : 'badge-neutral') }}">
        {{ $v->status }}
      </span>
    </td>
  </tr>
  @endforeach
  </tbody>
</table>

<div class="footer">Josbin Fleet Management System &bull; Confidential &bull; Generated {{ $generated_at }}</div>
</body>
</html>
