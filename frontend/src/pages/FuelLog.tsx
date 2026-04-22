import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search, Fuel } from 'lucide-react';
import { fuelLogsApi } from '../api/client';
import Modal from '../components/Modal';
import type { FuelLog } from '../types';

const mockFuelLogs: FuelLog[] = [
  { id: 1, vehicle_id: 1, driver_id: 1, fill_date: '2026-03-25', liters: 65, cost_per_liter: 4.85, total_cost: 315.25, odometer: 84200, fuel_type: 'diesel', station: 'SurPetrol Paramaribo North', full_tank: true, created_at: '', updated_at: '' },
  { id: 2, vehicle_id: 2, driver_id: 2, fill_date: '2026-03-22', liters: 80, cost_per_liter: 4.85, total_cost: 388.00, odometer: 120400, fuel_type: 'diesel', station: 'Staatsolie Station 5', full_tank: true, created_at: '', updated_at: '' },
  { id: 3, vehicle_id: 4, driver_id: 3, fill_date: '2026-03-20', liters: 90, cost_per_liter: 5.20, total_cost: 468.00, odometer: 45000, fuel_type: 'petrol', station: 'Shell Kwattaweg', full_tank: true, created_at: '', updated_at: '' },
  { id: 4, vehicle_id: 1, driver_id: 1, fill_date: '2026-03-10', liters: 60, cost_per_liter: 4.80, total_cost: 288.00, odometer: 83600, fuel_type: 'diesel', station: 'SurPetrol Paramaribo North', full_tank: false, created_at: '', updated_at: '' },
];

const vehicleLabels: Record<number, string> = { 1: 'SRN-0042', 2: 'SRN-0011', 3: 'SRN-0031', 4: 'SRN-0017', 5: 'SRN-0055' };
const driverLabels: Record<number, string> = { 1: 'John Doe', 2: 'Maria Santos', 3: 'Carlos Fernandez', 4: 'Priya Nair', 5: 'Dwayne Baptiste' };

const emptyForm = {
  vehicle_id: '', driver_id: '', fill_date: '', liters: '',
  cost_per_liter: '', odometer: '', fuel_type: 'diesel',
  station: '', full_tank: true, notes: '',
};

export default function FuelLog() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<FuelLog | null>(null);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);

  const { data: result = { data: mockFuelLogs, summary: { total_liters: 295, total_cost: 1459.25, avg_cost_per_liter: 4.925 } } } = useQuery({
    queryKey: ['fuel-logs'],
    queryFn: () => fuelLogsApi.list().then(r => r.data),
  });

  const logs: FuelLog[] = result.data ?? mockFuelLogs;
  const summary = result.summary ?? {};

  const createMutation = useMutation({ mutationFn: (d: object) => fuelLogsApi.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['fuel-logs'] }); closeModal(); } });
  const updateMutation = useMutation({ mutationFn: ({ id, data }: { id: number; data: object }) => fuelLogsApi.update(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['fuel-logs'] }); closeModal(); } });
  const deleteMutation = useMutation({ mutationFn: (id: number) => fuelLogsApi.delete(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['fuel-logs'] }) });

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (l: FuelLog) => {
    setEditing(l);
    setForm({ vehicle_id: String(l.vehicle_id), driver_id: l.driver_id ? String(l.driver_id) : '', fill_date: l.fill_date, liters: String(l.liters), cost_per_liter: String(l.cost_per_liter), odometer: String(l.odometer), fuel_type: l.fuel_type, station: l.station ?? '', full_tank: l.full_tank ?? true, notes: l.notes ?? '' });
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) updateMutation.mutate({ id: editing.id, data: form });
    else createMutation.mutate(form);
  };

  const filtered = logs.filter(l => `${vehicleLabels[l.vehicle_id] ?? ''} ${driverLabels[l.driver_id ?? 0] ?? ''} ${l.station ?? ''}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Fuel Used', value: `${Number(summary.total_liters ?? 0).toFixed(0)} L`, color: 'bg-blue-50 text-blue-700' },
          { label: 'Total Fuel Cost', value: `SRD ${Number(summary.total_cost ?? 0).toLocaleString('en', { minimumFractionDigits: 2 })}`, color: 'bg-green-50 text-green-700' },
          { label: 'Avg Cost / Liter', value: `SRD ${Number(summary.avg_cost_per_liter ?? 0).toFixed(3)}`, color: 'bg-purple-50 text-purple-700' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-xl p-4 ${color} border border-white shadow-sm`}>
            <p className="text-xs font-medium opacity-70">{label}</p>
            <p className="text-2xl font-bold mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search fuel logs..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={16} /> Log Fuel Fill
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Date', 'Vehicle', 'Driver', 'Liters', 'Cost/L (SRD)', 'Total (SRD)', 'Odometer', 'Station', 'Full Tank', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(l => (
              <tr key={l.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-500">{l.fill_date}</td>
                <td className="px-4 py-3 font-mono font-medium text-blue-700">{vehicleLabels[l.vehicle_id] ?? l.vehicle_id}</td>
                <td className="px-4 py-3 text-slate-600">{driverLabels[l.driver_id ?? 0] ?? '—'}</td>
                <td className="px-4 py-3 font-medium">{Number(l.liters).toFixed(1)} L</td>
                <td className="px-4 py-3 text-slate-500">{Number(l.cost_per_liter).toFixed(3)}</td>
                <td className="px-4 py-3 font-medium text-green-700">{Number(l.total_cost).toLocaleString('en', { minimumFractionDigits: 2 })}</td>
                <td className="px-4 py-3 text-slate-500">{Number(l.odometer).toLocaleString()} km</td>
                <td className="px-4 py-3 text-slate-500">{l.station ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium ${l.full_tank ? 'text-green-600' : 'text-slate-400'}`}>
                    <Fuel size={12} /> {l.full_tank ? 'Full' : 'Partial'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(l)} className="p-1.5 rounded hover:bg-slate-100 text-slate-500"><Pencil size={14} /></button>
                    <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(l.id); }} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={10} className="px-4 py-8 text-center text-slate-400">No fuel logs found</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal title={editing ? 'Edit Fuel Log' : 'Log Fuel Fill'} open={modalOpen} onClose={closeModal} size="lg">
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
            ['fill_date',     'Fill Date',       'date'],
            ['liters',        'Liters',          'number'],
            ['cost_per_liter','Cost per Liter',  'number'],
            ['odometer',      'Odometer (km)',   'number'],
            ['station',       'Fuel Station',    'text'],
          ] as [keyof typeof emptyForm, string, string][]).map(([key, label, type]) => (
            <div key={key}>
              <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
              <input type={type} value={String(form[key])} required={['fill_date','liters','cost_per_liter','odometer'].includes(key)}
                step={type === 'number' ? '0.001' : undefined}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Fuel Type</label>
            <select value={form.fuel_type} onChange={e => setForm(f => ({ ...f, fuel_type: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="diesel">Diesel</option>
              <option value="petrol">Petrol</option>
              <option value="electric">Electric</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <input type="checkbox" id="full_tank" checked={form.full_tank as boolean}
              onChange={e => setForm(f => ({ ...f, full_tank: e.target.checked }))}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="full_tank" className="text-sm text-slate-700">Full tank fill-up</label>
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
            <textarea rows={2} value={form.notes as string} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="col-span-2 flex gap-3 justify-end pt-2">
            <button type="button" onClick={closeModal} className="px-4 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              {editing ? 'Save Changes' : 'Log Fill'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
