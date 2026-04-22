import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { servicesApi } from '../api/client';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import type { Service } from '../types';

const mockServices: Service[] = [
  { id: 1, vehicle_id: 1, type: 'oil_change',       description: 'Regular oil change', service_date: '2026-01-15', next_service_date: '2026-04-02', next_service_mileage: 90000, cost: 350, garage: 'AutoServ Paramaribo', status: 'completed', created_at: '', updated_at: '' },
  { id: 2, vehicle_id: 2, type: 'full_service',      description: 'Full 120k service',  service_date: '2026-02-20', next_service_date: '2026-05-10', cost: 1200, garage: 'Nissan SRN', status: 'completed', created_at: '', updated_at: '' },
  { id: 3, vehicle_id: 3, type: 'brake_inspection',  description: 'Brake pads worn',    service_date: '2026-04-20', cost: 800, garage: 'Ford Garage', status: 'scheduled', created_at: '', updated_at: '' },
  { id: 4, vehicle_id: 4, type: 'tire_rotation',     description: 'Tire rotation & alignment', service_date: '2026-04-15', cost: 250, garage: 'Tyre King', status: 'scheduled', created_at: '', updated_at: '' },
  { id: 5, vehicle_id: 1, type: 'oil_change',        description: 'Overdue oil change',  service_date: '2026-03-01', status: 'overdue', created_at: '', updated_at: '' },
];

const vehicleLabels: Record<number, string> = { 1: 'SRN-0042', 2: 'SRN-0011', 3: 'SRN-0031', 4: 'SRN-0017', 5: 'SRN-0055' };

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'neutral' | 'info'> = {
  completed: 'success',
  scheduled: 'info',
  overdue:   'danger',
};

const typeLabels: Record<string, string> = {
  oil_change: 'Oil Change', tire_rotation: 'Tire Rotation',
  brake_inspection: 'Brake Inspection', full_service: 'Full Service', other: 'Other',
};

const emptyForm = {
  vehicle_id: '', type: 'oil_change', description: '',
  service_date: '', next_service_date: '', next_service_mileage: '',
  cost: '', garage: '', status: 'scheduled', notes: '',
};

export default function Services() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);

  const { data: services = mockServices } = useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: () => servicesApi.list().then(r => r.data.data ?? r.data),
  });

  const createMutation = useMutation({
    mutationFn: (d: object) => servicesApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['services'] }); closeModal(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: object }) => servicesApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['services'] }); closeModal(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => servicesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['services'] }),
  });

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit   = (s: Service) => {
    setEditing(s);
    setForm({
      vehicle_id: String(s.vehicle_id), type: s.type, description: s.description ?? '',
      service_date: s.service_date, next_service_date: s.next_service_date ?? '',
      next_service_mileage: s.next_service_mileage ? String(s.next_service_mileage) : '',
      cost: s.cost ? String(s.cost) : '', garage: s.garage ?? '', status: s.status, notes: s.notes ?? '',
    });
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) updateMutation.mutate({ id: editing.id, data: form });
    else createMutation.mutate(form);
  };

  const filtered = services.filter(s =>
    `${vehicleLabels[s.vehicle_id] ?? ''} ${typeLabels[s.type]} ${s.garage ?? ''}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search services..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={16} /> Log Service
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Vehicle', 'Type', 'Service Date', 'Next Service', 'Cost', 'Garage', 'Status', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(s => (
              <tr key={s.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono font-medium text-blue-700">{vehicleLabels[s.vehicle_id] ?? s.vehicle_id}</td>
                <td className="px-4 py-3">{typeLabels[s.type]}</td>
                <td className="px-4 py-3 text-slate-500">{s.service_date}</td>
                <td className="px-4 py-3 text-slate-500">{s.next_service_date || '—'}</td>
                <td className="px-4 py-3 text-slate-500">{s.cost ? `SRD ${s.cost.toLocaleString()}` : '—'}</td>
                <td className="px-4 py-3 text-slate-500">{s.garage || '—'}</td>
                <td className="px-4 py-3">
                  <Badge label={s.status} variant={statusVariant[s.status]} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(s)} className="p-1.5 rounded hover:bg-slate-100 text-slate-500"><Pencil size={14} /></button>
                    <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(s.id); }} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">No service records found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal title={editing ? 'Edit Service Record' : 'Log Service'} open={modalOpen} onClose={closeModal} size="lg">
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
            <label className="block text-xs font-medium text-slate-600 mb-1">Service Type</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {Object.entries(typeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>

          {([
            ['service_date',          'Service Date',     'date'],
            ['next_service_date',     'Next Service Date','date'],
            ['next_service_mileage',  'Next Service KM',  'number'],
            ['cost',                  'Cost (SRD)',        'number'],
            ['garage',                'Garage',            'text'],
          ] as [keyof typeof emptyForm, string, string][]).map(([key, label, type]) => (
            <div key={key}>
              <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
              <input type={type} value={form[key]} required={key === 'service_date'}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
            <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="col-span-2 flex gap-3 justify-end pt-2">
            <button type="button" onClick={closeModal} className="px-4 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              {editing ? 'Save Changes' : 'Log Service'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
