import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { inspectionsApi } from '../api/client';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import type { Inspection } from '../types';

const mockInspections: Inspection[] = [
  { id: 1, vehicle_id: 1, type: 'annual',   inspection_date: '2025-12-01', next_inspection_date: '2026-06-01', result: 'pass',    inspector: 'MVD Paramaribo', cost: 250, created_at: '', updated_at: '' },
  { id: 2, vehicle_id: 2, type: 'annual',   inspection_date: '2026-01-10', next_inspection_date: '2026-07-10', result: 'pass',    inspector: 'MVD Paramaribo', cost: 250, created_at: '', updated_at: '' },
  { id: 3, vehicle_id: 3, type: 'safety',   inspection_date: '2026-04-09', result: 'pending', inspector: 'AutoCheck SRN', cost: 400, created_at: '', updated_at: '' },
  { id: 4, vehicle_id: 4, type: 'routine',  inspection_date: '2026-02-15', next_inspection_date: '2026-08-15', result: 'pass',    inspector: 'FleetCheck', cost: 180, created_at: '', updated_at: '' },
  { id: 5, vehicle_id: 5, type: 'emissions',inspection_date: '2025-10-01', next_inspection_date: '2026-05-15', result: 'fail',    inspector: 'Env. Bureau SR', notes: 'Exhaust emission over limit', created_at: '', updated_at: '' },
];

const vehicleLabels: Record<number, string> = { 1: 'SRN-0042', 2: 'SRN-0011', 3: 'SRN-0031', 4: 'SRN-0017', 5: 'SRN-0055' };

const resultVariant: Record<string, 'success' | 'danger' | 'warning'> = {
  pass:    'success',
  fail:    'danger',
  pending: 'warning',
};

const typeLabels: Record<string, string> = {
  routine:   'Routine',
  annual:    'Annual',
  safety:    'Safety',
  emissions: 'Emissions',
};

const emptyForm = {
  vehicle_id: '', type: 'annual', inspection_date: '', next_inspection_date: '',
  result: 'pending', inspector: '', location: '', cost: '', notes: '',
};

export default function Inspections() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Inspection | null>(null);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);

  const { data: inspections = mockInspections } = useQuery<Inspection[]>({
    queryKey: ['inspections'],
    queryFn: () => inspectionsApi.list().then(r => r.data.data ?? r.data),
  });

  const createMutation = useMutation({
    mutationFn: (d: object) => inspectionsApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inspections'] }); closeModal(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: object }) => inspectionsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inspections'] }); closeModal(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => inspectionsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inspections'] }),
  });

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit   = (i: Inspection) => {
    setEditing(i);
    setForm({
      vehicle_id: String(i.vehicle_id), type: i.type, inspection_date: i.inspection_date,
      next_inspection_date: i.next_inspection_date ?? '', result: i.result,
      inspector: i.inspector ?? '', location: i.location ?? '',
      cost: i.cost ? String(i.cost) : '', notes: i.notes ?? '',
    });
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) updateMutation.mutate({ id: editing.id, data: form });
    else createMutation.mutate(form);
  };

  const filtered = inspections.filter(i =>
    `${vehicleLabels[i.vehicle_id] ?? ''} ${typeLabels[i.type]} ${i.inspector ?? ''}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search inspections..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={16} /> Add Inspection
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Vehicle', 'Type', 'Date', 'Next Due', 'Result', 'Inspector', 'Cost', 'Notes', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(i => (
              <tr key={i.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono font-medium text-blue-700">{vehicleLabels[i.vehicle_id] ?? i.vehicle_id}</td>
                <td className="px-4 py-3">{typeLabels[i.type]}</td>
                <td className="px-4 py-3 text-slate-500">{i.inspection_date}</td>
                <td className="px-4 py-3 text-slate-500">{i.next_inspection_date || '—'}</td>
                <td className="px-4 py-3">
                  <Badge label={i.result} variant={resultVariant[i.result]} />
                </td>
                <td className="px-4 py-3 text-slate-500">{i.inspector || '—'}</td>
                <td className="px-4 py-3 text-slate-500">{i.cost ? `SRD ${i.cost}` : '—'}</td>
                <td className="px-4 py-3 text-slate-400 text-xs max-w-xs truncate">{i.notes || '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(i)} className="p-1.5 rounded hover:bg-slate-100 text-slate-500"><Pencil size={14} /></button>
                    <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(i.id); }} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-400">No inspections found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal title={editing ? 'Edit Inspection' : 'Add Inspection'} open={modalOpen} onClose={closeModal} size="lg">
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
            <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {Object.entries(typeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          {([
            ['inspection_date',      'Inspection Date',     'date'],
            ['next_inspection_date', 'Next Due Date',       'date'],
            ['inspector',            'Inspector / Station', 'text'],
            ['location',             'Location',            'text'],
            ['cost',                 'Cost (SRD)',          'number'],
          ] as [keyof typeof emptyForm, string, string][]).map(([key, label, type]) => (
            <div key={key}>
              <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
              <input type={type} value={form[key]} required={key === 'inspection_date'}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Result</label>
            <select value={form.result} onChange={e => setForm(f => ({ ...f, result: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="pending">Pending</option>
              <option value="pass">Pass</option>
              <option value="fail">Fail</option>
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
              {editing ? 'Save Changes' : 'Add Inspection'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
