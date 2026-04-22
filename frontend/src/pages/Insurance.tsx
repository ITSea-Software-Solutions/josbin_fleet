import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { insuranceApi } from '../api/client';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import type { Insurance } from '../types';

const mockInsurance: Insurance[] = [
  { id: 1, vehicle_id: 1, provider: 'Assuria NV',      policy_number: 'ASS-2024-0042', type: 'comprehensive', start_date: '2025-12-01', expiry_date: '2026-12-01', premium_amount: 4800, coverage_amount: 200000, status: 'active',   created_at: '', updated_at: '' },
  { id: 2, vehicle_id: 2, provider: 'Hakrinbank Ins.', policy_number: 'HBI-2024-0011', type: 'comprehensive', start_date: '2025-04-06', expiry_date: '2026-04-06', premium_amount: 3600, coverage_amount: 150000, status: 'active',   created_at: '', updated_at: '' },
  { id: 3, vehicle_id: 3, provider: 'Assuria NV',      policy_number: 'ASS-2025-0031', type: 'third_party',   start_date: '2025-09-15', expiry_date: '2026-09-15', premium_amount: 1800, status: 'active',   created_at: '', updated_at: '' },
  { id: 4, vehicle_id: 4, provider: 'CLICO Suriname',  policy_number: 'CLC-2025-0017', type: 'comprehensive', start_date: '2025-11-20', expiry_date: '2026-11-20', premium_amount: 6200, coverage_amount: 300000, status: 'active',   created_at: '', updated_at: '' },
  { id: 5, vehicle_id: 5, provider: 'Hakrinbank Ins.', policy_number: 'HBI-2025-0055', type: 'third_party',   start_date: '2025-05-30', expiry_date: '2026-05-30', premium_amount: 1200, status: 'active',   created_at: '', updated_at: '' },
];

const vehicleLabels: Record<number, string> = { 1: 'SRN-0042', 2: 'SRN-0011', 3: 'SRN-0031', 4: 'SRN-0017', 5: 'SRN-0055' };

const statusVariant: Record<string, 'success' | 'danger' | 'neutral'> = {
  active:    'success',
  expired:   'danger',
  cancelled: 'neutral',
};

const typeLabels: Record<string, string> = {
  third_party:   'Third Party',
  comprehensive: 'Comprehensive',
  fire_theft:    'Fire & Theft',
};

const emptyForm = {
  vehicle_id: '', provider: '', policy_number: '', type: 'comprehensive',
  start_date: '', expiry_date: '', premium_amount: '', coverage_amount: '', status: 'active', notes: '',
};

export default function InsurancePage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Insurance | null>(null);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);

  const { data: records = mockInsurance } = useQuery<Insurance[]>({
    queryKey: ['insurance'],
    queryFn: () => insuranceApi.list().then(r => r.data.data ?? r.data),
  });

  const createMutation = useMutation({
    mutationFn: (d: object) => insuranceApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['insurance'] }); closeModal(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: object }) => insuranceApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['insurance'] }); closeModal(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => insuranceApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['insurance'] }),
  });

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit   = (r: Insurance) => {
    setEditing(r);
    setForm({
      vehicle_id: String(r.vehicle_id), provider: r.provider, policy_number: r.policy_number,
      type: r.type, start_date: r.start_date, expiry_date: r.expiry_date,
      premium_amount: String(r.premium_amount), coverage_amount: r.coverage_amount ? String(r.coverage_amount) : '',
      status: r.status, notes: r.notes ?? '',
    });
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) updateMutation.mutate({ id: editing.id, data: form });
    else createMutation.mutate(form);
  };

  const today = new Date().toISOString().split('T')[0];
  const filtered = records.filter(r =>
    `${vehicleLabels[r.vehicle_id] ?? ''} ${r.provider} ${r.policy_number}`.toLowerCase().includes(search.toLowerCase())
  );

  const daysUntilExpiry = (d: string) => Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search insurance..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={16} /> Add Policy
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Vehicle', 'Provider', 'Policy No.', 'Type', 'Start', 'Expiry', 'Days Left', 'Premium', 'Status', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(r => {
              const days = daysUntilExpiry(r.expiry_date);
              return (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono font-medium text-blue-700">{vehicleLabels[r.vehicle_id] ?? r.vehicle_id}</td>
                  <td className="px-4 py-3 font-medium">{r.provider}</td>
                  <td className="px-4 py-3 font-mono text-slate-600">{r.policy_number}</td>
                  <td className="px-4 py-3 text-slate-500">{typeLabels[r.type]}</td>
                  <td className="px-4 py-3 text-slate-500">{r.start_date}</td>
                  <td className="px-4 py-3 text-slate-500">{r.expiry_date}</td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${days < 0 ? 'text-red-600' : days <= 30 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {days < 0 ? 'Expired' : `${days}d`}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">SRD {r.premium_amount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <Badge label={r.expiry_date < today ? 'expired' : r.status} variant={r.expiry_date < today ? 'danger' : statusVariant[r.status]} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(r)} className="p-1.5 rounded hover:bg-slate-100 text-slate-500"><Pencil size={14} /></button>
                      <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(r.id); }} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={10} className="px-4 py-8 text-center text-slate-400">No insurance records found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal title={editing ? 'Edit Insurance Policy' : 'Add Insurance Policy'} open={modalOpen} onClose={closeModal} size="lg">
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
            ['provider',         'Insurance Provider', 'text'],
            ['policy_number',    'Policy Number',      'text'],
            ['start_date',       'Start Date',         'date'],
            ['expiry_date',      'Expiry Date',        'date'],
            ['premium_amount',   'Premium (SRD)',      'number'],
            ['coverage_amount',  'Coverage (SRD)',     'number'],
          ] as [keyof typeof emptyForm, string, string][]).map(([key, label, type]) => (
            <div key={key}>
              <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
              <input type={type} value={form[key]}
                required={!['coverage_amount'].includes(key)}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
          <div className="col-span-2 flex gap-3 justify-end pt-2">
            <button type="button" onClick={closeModal} className="px-4 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              {editing ? 'Save Changes' : 'Add Policy'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
