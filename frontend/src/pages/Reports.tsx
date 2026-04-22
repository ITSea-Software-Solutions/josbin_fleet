import { useState } from 'react';
import { Download, FileText, Truck, Users, Loader2 } from 'lucide-react';
import api from '../api/client';

const vehicleOptions = [
  { id: 1, label: 'SRN-0042 — Toyota Hilux' },
  { id: 2, label: 'SRN-0011 — Nissan Navara' },
  { id: 3, label: 'SRN-0031 — Ford Ranger' },
  { id: 4, label: 'SRN-0017 — Toyota Land Cruiser' },
  { id: 5, label: 'SRN-0055 — Isuzu D-Max' },
];

const driverOptions = [
  { id: 1, label: 'John Doe' },
  { id: 2, label: 'Maria Santos' },
  { id: 3, label: 'Carlos Fernandez' },
  { id: 4, label: 'Priya Nair' },
  { id: 5, label: 'Dwayne Baptiste' },
];

export default function Reports() {
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedDriver,  setSelectedDriver]  = useState('');
  const [loading, setLoading] = useState<string | null>(null);

  const downloadPdf = async (url: string, filename: string, key: string) => {
    setLoading(key);
    try {
      const res = await api.get(url, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const href = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = href;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(href);
    } catch {
      alert('Failed to generate report. Make sure the backend is running.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Fleet Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <FileText size={22} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-slate-800">Fleet Summary Report</h2>
            <p className="text-sm text-slate-500 mt-1">
              A full overview of all vehicles — status, key dates, insurance, mileage and fleet-wide fuel costs. Landscape A4 PDF.
            </p>
            <button
              onClick={() => downloadPdf('/reports/fleet-summary', 'fleet-summary-report.pdf', 'fleet')}
              disabled={loading === 'fleet'}
              className="mt-3 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
            >
              {loading === 'fleet' ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Vehicle Report */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-green-50 rounded-lg">
            <Truck size={22} className="text-green-600" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-slate-800">Vehicle Report</h2>
            <p className="text-sm text-slate-500 mt-1">
              Full history for a single vehicle — services, insurance policies, inspections, fuel log and trip log. Portrait A4.
            </p>
            <div className="flex gap-3 mt-3">
              <select
                value={selectedVehicle}
                onChange={e => setSelectedVehicle(e.target.value)}
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select vehicle...</option>
                {vehicleOptions.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
              </select>
              <button
                disabled={!selectedVehicle || loading === `vehicle-${selectedVehicle}`}
                onClick={() => {
                  const v = vehicleOptions.find(v => String(v.id) === selectedVehicle);
                  downloadPdf(`/reports/vehicle/${selectedVehicle}`, `vehicle-${v?.label.split(' — ')[0]}-report.pdf`, `vehicle-${selectedVehicle}`);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-60"
              >
                {loading?.startsWith('vehicle-') ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                Download
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Driver Report */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-50 rounded-lg">
            <Users size={22} className="text-purple-600" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-slate-800">Driver Report</h2>
            <p className="text-sm text-slate-500 mt-1">
              Individual driver activity — trips taken, fuel fills, distance driven, and cost. Portrait A4 PDF.
            </p>
            <div className="flex gap-3 mt-3">
              <select
                value={selectedDriver}
                onChange={e => setSelectedDriver(e.target.value)}
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select driver...</option>
                {driverOptions.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
              </select>
              <button
                disabled={!selectedDriver || loading === `driver-${selectedDriver}`}
                onClick={() => {
                  const d = driverOptions.find(d => String(d.id) === selectedDriver);
                  downloadPdf(`/reports/driver/${selectedDriver}`, `driver-${d?.label.replace(' ', '-')}-report.pdf`, `driver-${selectedDriver}`);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-60"
              >
                {loading?.startsWith('driver-') ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                Download
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-500">
        Reports are generated as PDF in real time from live database data. Make sure the backend is running and you have data entered first.
      </div>
    </div>
  );
}
