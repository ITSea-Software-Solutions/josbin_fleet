import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search, MapPin, CheckCircle } from 'lucide-react';
import { tripLogsApi } from '../api/client';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import type { TripLog } from '../types';

const mockTrips: TripLog[] = [
  { id: 1, vehicle_id: 1, driver_id: 1, origin: 'Paramaribo HQ', destination: 'Nickerie District', purpose: 'Client delivery', start_time: '2026-03-28 06:00', end_time: '2026-03-28 14:00', start_odometer: 83800, end_odometer: 84100, distance_km: 300, status: 'completed', created_at: '', updated_at: '' },
  { id: 2, vehicle_id: 2, driver_id: 2, origin: 'Paramaribo HQ', destination: 'Wanica District', purpose: 'Site inspection', start_time: '2026-03-29 08:00', end_time: '2026-03-29 11:30', start_odometer: 120200, end_odometer: 120400, distance_km: 200, status: 'completed', created_at: '', updated_at: '' },
  { id: 3, vehicle_id: 4, driver_id: 3, origin: 'Paramaribo HQ', destination: 'Brokopondo', purpose: 'Equipment transport', start_time: '2026-03-30 07:00', end_time: null, start_odometer: 45000, end_odometer: null, distance_km: null, status: 'in_progress', created_at: '', updated_at: '' },
];

const vehicleLabels: Record<number, string> = { 1: 'SRN-0042', 2: 'SRN-0011', 3: 'SRN-0031', 4: 'SRN-0017', 5: 'SRN-0055' };
const driverLabels: Record<number, string> = { 1: 'John Doe', 2: 'Maria Santos', 3: 'Carlos Fernandez', 4: 'Priya Nair', 5: 'Dwayne Baptiste' };

const statusVariant: Record<string, 'success' | 'info' | 'neutral'> = {
  completed:   'success',
  in_progress: 'info',
  cancelled:   'neutral',
};

const emptyForm = {
  vehicle_id: '', driver_id: '', origin: '', destination: '', purpose: '',
  start_time: '', end_time: '', start_odometer: '', end_odometer: '',
  status: 'in_progress', notes: '',
};

const emptyEndForm = { end_time: '', end_odometer: '', notes: '' };

export default function TripLog() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [endModalOpen, setEndModalOpen] = useState(false);
  const [editing, setEditing] = useState<TripLog | null>(null);
  const [activeTrip, setActiveTrip] = useState<TripLog | null>(null);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);
  const [endForm, setEndForm] = useState<typeof emptyEndForm>(emptyEndForm);

  const { data: trips = mockTrips } = useQuery<TripLog[]>({
    queryKey: ['trip-logs'],
    queryFn: () => tripLogsApi.list().then(r => r.data.data ?? r.data),
  });

  const createMutation = useMutation({ mutationFn: (d: object) => tripLogsApi.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['trip-logs'] }); closeModal(); } });
  const updateMutation = useMutation({ mutationFn: ({ id, data }: { id: number; data: object }) => tripLogsApi.update(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['trip-logs'] }); closeModal(); } });
  const endMutation   = useMutation({ mutationFn: ({ id, data }: { id: number; data: object }) => tripLogsApi.endTrip(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['trip-logs'] }); setEndModalOpen(false); } });
  const deleteMutation = useMutation({ mutationFn: (id: number) => tripLogsApi.delete(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['trip-logs'] }) });

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (t: TripLog) => {
    setEditing(t);
    setForm({ vehicle_id: String(t.vehicle_id), driver_id: t.driver_id ? String(t.driver_id) : '', origin: t.origin, destination: t.destination, purpose: t.purpose ?? '', start_time: t.start_time?.slice(0, 16) ?? '', end_time: t.end_time?.slice(0, 16) ?? '', start_odometer: String(t.start_odometer), end_odometer: t.end_odometer ? String(t.end_odometer) : '', status: t.status, notes: t.notes ?? '' });
    setModalOpen(true);
  };
  const openEndTrip = (t: TripLog) => { setActiveTrip(t); setEndForm(emptyEndForm); setEndModalOpen(true); };
  const closeModal = () => setModalOpen(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) updateMutation.mutate({ id: editing.id, data: form });
    else createMutation.mutate(form);
  };

  const handleEndTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTrip) endMutation.mutate({ id: activeTrip.id, data: endForm });
  };

  const filtered = trips.filter(t => `${vehicleLabels[t.vehicle_id] ?? ''} ${driverLabels[t.driver_id ?? 0] ?? ''} ${t.origin} ${t.destination}`.toLowerCase().includes(search.toLowerCase()));

  const totalKm = trips.filter(t => t.distance_km).reduce((s, t) => s + (t.distance_km ?? 0), 0);
  const inProgress = trips.filter(t => t.status === 'in_progress').length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Trips', value: trips.length, color: 'bg-blue-50 text-blue-700' },
          { label: 'In Progress', value: inProgress, color: 'bg-yellow-50 text-yellow-700' },
          { label: 'Total Distance', value: `${totalKm.toLocaleString()} km`, color: 'bg-green-50 text-green-700' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-xl p-4 ${color} border border-white shadow-sm`}>
            <p className="text-xs font-medium opacity-70">{label}</p>
            <p className="text-2xl font-bold mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search trips..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={16} /> Start Trip
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Vehicle', 'Driver', 'From → To', 'Purpose', 'Start', 'End', 'Distance', 'Status', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(t => (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono font-medium text-blue-700">{vehicleLabels[t.vehicle_id] ?? t.vehicle_id}</td>
                <td className="px-4 py-3 text-slate-600">{driverLabels[t.driver_id ?? 0] ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1 text-slate-700">
                    <MapPin size={12} className="text-slate-400 shrink-0" />
                    {t.origin} → {t.destination}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">{t.purpose ?? '—'}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{t.start_time?.slice(0, 16).replace('T', ' ') ?? '—'}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{t.end_time?.slice(0, 16).replace('T', ' ') ?? '—'}</td>
                <td className="px-4 py-3 font-medium">{t.distance_km != null ? `${t.distance_km.toLocaleString()} km` : '—'}</td>
                <td className="px-4 py-3"><Badge label={t.status.replace('_', ' ')} variant={statusVariant[t.status]} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    {t.status === 'in_progress' && (
                      <button onClick={() => openEndTrip(t)} title="End trip" className="p-1.5 rounded hover:bg-green-50 text-green-600"><CheckCircle size={14} /></button>
                    )}
                    <button onClick={() => openEdit(t)} className="p-1.5 rounded hover:bg-slate-100 text-slate-500"><Pencil size={14} /></button>
                    <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(t.id); }} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-400">No trips found</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Create/Edit modal */}
      <Modal title={editing ? 'Edit Trip' : 'Start Trip'} open={modalOpen} onClose={closeModal} size="lg">
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Vehicle</label>
            <select required value={form.vehicle_id} onChange={e => setForm(f => ({ ...f, vehicle_id: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select vehicle...</option>
              {Object.entries(vehicleLabels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Driver</label>
            <select value={form.driver_id} onChange={e => setForm(f => ({ ...f, driver_id: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select driver...</option>
              {Object.entries(driverLabels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
            </select>
          </div>
          {([
            ['origin',          'Origin',               'text'],
            ['destination',     'Destination',          'text'],
            ['purpose',         'Purpose',              'text'],
            ['start_time',      'Start Time',           'datetime-local'],
            ['end_time',        'End Time',             'datetime-local'],
            ['start_odometer',  'Start Odometer (km)',  'number'],
            ['end_odometer',    'End Odometer (km)',    'number'],
          ] as [keyof typeof emptyForm, string, string][]).map(([key, label, type]) => (
            <div key={key}>
              <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
              <input type={type} value={String(form[key])} required={['origin','destination','start_time','start_odometer'].includes(key)}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="col-span-2 flex gap-3 justify-end pt-2">
            <button type="button" onClick={closeModal} className="px-4 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              {editing ? 'Save Changes' : 'Start Trip'}
            </button>
          </div>
        </form>
      </Modal>

      {/* End Trip modal */}
      <Modal title={`End Trip — ${activeTrip ? `${vehicleLabels[activeTrip.vehicle_id]} to ${activeTrip.destination}` : ''}`} open={endModalOpen} onClose={() => setEndModalOpen(false)} size="sm">
        <form onSubmit={handleEndTrip} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">End Time</label>
            <input type="datetime-local" required value={endForm.end_time} onChange={e => setEndForm(f => ({ ...f, end_time: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">End Odometer (km)</label>
            <input type="number" required value={endForm.end_odometer} onChange={e => setEndForm(f => ({ ...f, end_odometer: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
            <textarea rows={2} value={endForm.notes} onChange={e => setEndForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-3 justify-end pt-1">
            <button type="button" onClick={() => setEndModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">End Trip</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
