<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #1e293b; padding: 30px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; border-bottom: 2px solid #2563eb; padding-bottom: 14px; }
  .logo { font-size: 22px; font-weight: bold; color: #2563eb; }
  .logo span { color: #1e293b; }
  .meta { text-align: right; font-size: 10px; color: #94a3b8; }
  .stat-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
  .stat { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; text-align: center; }
  .stat .num { font-size: 18px; font-weight: bold; color: #2563eb; }
  .stat .lbl { font-size: 9px; color: #64748b; margin-top: 2px; }
  .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin-bottom: 18px; }
  .card h3 { font-size: 10px; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em; margin-bottom: 8px; }
  .field { display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px solid #f1f5f9; }
  .field:last-child { border-bottom: none; }
  .field-label { color: #64748b; }
  .field-value { font-weight: 600; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  table th { background: #1e3a8a; color: white; padding: 6px 8px; text-align: left; font-size: 10px; }
  table td { padding: 5px 8px; border-bottom: 1px solid #e2e8f0; font-size: 10px; }
  table tr:nth-child(even) td { background: #f8fafc; }
  .section-title { font-size: 12px; font-weight: bold; color: #1e3a8a; margin-bottom: 8px; border-left: 3px solid #2563eb; padding-left: 8px; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 9px; font-weight: 600; }
  .badge-success { background: #dcfce7; color: #166534; }
  .badge-info    { background: #dbeafe; color: #1e40af; }
  .badge-neutral { background: #f1f5f9; color: #475569; }
  .footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 9px; color: #94a3b8; }
</style>
</head>
<body>

<div class="header">
  <div>
    <div class="logo">Josbin<span> Fleet MS</span></div>
    <div style="font-size:13px;color:#64748b;margin-top:3px;">Driver Report — {{ $driver->first_name }} {{ $driver->last_name }}</div>
  </div>
  <div class="meta">Generated: {{ now()->format('d M Y H:i') }}<br>Josbin Fleet MS v1.0</div>
</div>

<div class="stat-row">
  <div class="stat"><div class="num">{{ $trips->count() }}</div><div class="lbl">Total Trips</div></div>
  <div class="stat"><div class="num">{{ number_format($totalDistance) }} km</div><div class="lbl">Distance Driven</div></div>
  <div class="stat"><div class="num">{{ $fuels->count() }}</div><div class="lbl">Fuel Fills</div></div>
  <div class="stat"><div class="num">SRD {{ number_format($totalFuelCost, 0) }}</div><div class="lbl">Fuel Cost</div></div>
</div>

<div class="card">
  <h3>Driver Details</h3>
  @foreach ([
    ['Full Name',       $driver->first_name . ' ' . $driver->last_name],
    ['Email',           $driver->email],
    ['Phone',           $driver->phone],
    ['WhatsApp',        $driver->whatsapp ?? '—'],
    ['License No.',     $driver->license_number],
    ['License Expiry',  $driver->license_expiry->format('d M Y')],
    ['Assigned Vehicle',$driver->vehicle ? $driver->vehicle->plate_number . ' — ' . $driver->vehicle->make . ' ' . $driver->vehicle->model : 'None'],
    ['Status',          ucfirst($driver->status)],
  ] as [$label, $value])
  <div class="field"><span class="field-label">{{ $label }}</span><span class="field-value">{{ $value }}</span></div>
  @endforeach
</div>

@if($trips->count())
<p class="section-title">Trip History</p>
<table>
  <thead><tr><th>Date</th><th>From</th><th>To</th><th>Purpose</th><th>Distance</th><th>Status</th></tr></thead>
  <tbody>
  @foreach($trips as $t)
  <tr>
    <td>{{ $t->start_time->format('d M Y') }}</td>
    <td>{{ $t->origin }}</td>
    <td>{{ $t->destination }}</td>
    <td>{{ $t->purpose ?? '—' }}</td>
    <td>{{ $t->end_odometer ? number_format($t->end_odometer - $t->start_odometer) . ' km' : '—' }}</td>
    <td><span class="badge {{ $t->status === 'completed' ? 'badge-success' : ($t->status === 'in_progress' ? 'badge-info' : 'badge-neutral') }}">{{ str_replace('_', ' ', $t->status) }}</span></td>
  </tr>
  @endforeach
  </tbody>
</table>
@endif

@if($fuels->count())
<p class="section-title">Fuel Fills</p>
<table>
  <thead><tr><th>Date</th><th>Vehicle</th><th>Liters</th><th>Cost/L</th><th>Total (SRD)</th><th>Station</th></tr></thead>
  <tbody>
  @foreach($fuels as $f)
  <tr>
    <td>{{ $f->fill_date->format('d M Y') }}</td>
    <td>{{ $f->vehicle?->plate_number ?? '—' }}</td>
    <td>{{ number_format($f->liters, 1) }}L</td>
    <td>{{ number_format($f->cost_per_liter, 3) }}</td>
    <td>{{ number_format($f->total_cost, 2) }}</td>
    <td>{{ $f->station ?? '—' }}</td>
  </tr>
  @endforeach
  </tbody>
</table>
@endif

<div class="footer">Josbin Fleet Management System &bull; Confidential &bull; Generated {{ now()->format('d M Y H:i') }}</div>
</body>
</html>
