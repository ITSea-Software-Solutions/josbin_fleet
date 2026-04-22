import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { driversApi } from '../api/client';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import type { Driver } from '../types';

const mockDrivers: Driver[] = [
  { id: 1, first_name: 'John',    last_name: 'Doe',      email: 'john.doe@fleet.sr',    phone: '+59712345001', whatsapp: '+59712345001', license_number: 'DL-001', license_expiry: '2026-04-04', status: 'active',    created_at: '', updated_at: '' },
  { id: 2, first_name: 'Maria',   last_name: 'Santos',   email: 'maria.s@fleet.sr',     phone: '+59712345002', whatsapp: '+59712345002', license_number: 'DL-002', license_expiry: '2027-01-15', status: 'active',    created_at: '', updated_at: '' },
  { id: 3, first_name: 'Carlos',  last_name: 'Fernandez',email: 'c.fernandez@fleet.sr', phone: '+59712345003', whatsapp: '+59712345003', license_number: 'DL-003', license_expiry: '2026-08-20', status: 'active',    created_at: '', updated_at: '' },
  { id: 4, first_name: 'Priya',   last_name: 'Nair',     email: 'p.nair@fleet.sr',      phone: '+59712345004', whatsapp: '',            license_number: 'DL-004', license_expiry: '2025-11-30', status: 'suspended', created_at: '', updated_at: '' },
  { id: 5, first_name: 'Dwayne',  last_name: 'Baptiste', email: 'd.baptiste@fleet.sr',  phone: '+59712345005', whatsapp: '+59712345005', license_number: 'DL-005', license_expiry: '2027-03-10', status: 'inactive',  created_at: '', updated_at: '' },
];

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  active:    'success',
  suspended: 'danger',
  inactive:  'neutral',
};

const emptyForm = {
  first_name: '', last_name: '', email: '', phone: '', whatsapp: '',
  license_number: '', license_expiry: '', address: '', status: 'active',
};

export default function Drivers() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Driver | null>(null);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);

  const { data: drivers = mockDrivers } = useQuery<Driver[]>({
    queryKey: ['drivers'],
    queryFn: () => driversApi.list().then(r => r.data.data ?? r.data),
  });

  const createMutation = useMutation({
    mutationFn: (d: object) => driversApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['drivers'] }); closeModal(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: object }) => driversApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['drivers'] }); closeModal(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => driversApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['drivers'] }),
  });

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit   = (d: Driver) => {
    setEditing(d);
    setForm({
      first_name: d.first_name, last_name: d.last_name, email: d.email,
      phone: d.phone, whatsapp: d.whatsapp ?? '', license_number: d.license_number,
      license_expiry: d.license_expiry, address: d.address ?? '', status: d.status,
    });
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) updateMutation.mutate({ id: editing.id, data: form });
    else createMutation.mutate(form);
  };

  const filtered = drivers.filter(d =>
    `${d.first_name} ${d.last_name} ${d.license_number} ${d.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search drivers..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={16} /> Add Driver
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Name', 'Email', 'Phone', 'WhatsApp', 'License No.', 'License Expiry', 'Status', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(d => (
              <tr key={d.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{d.first_name} {d.last_name}</td>
                <td className="px-4 py-3 text-slate-500">{d.email}</td>
                <td className="px-4 py-3 text-slate-500">{d.phone}</td>
                <td className="px-4 py-3 text-slate-500">{d.whatsapp || '—'}</td>
                <td className="px-4 py-3 font-mono text-slate-600">{d.license_number}</td>
                <td className="px-4 py-3 text-slate-500">{d.license_expiry}</td>
                <td className="px-4 py-3">
                  <Badge label={d.status} variant={statusVariant[d.status]} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(d)} className="p-1.5 rounded hover:bg-slate-100 text-slate-500"><Pencil size={14} /></button>
                    <button onClick={() => { if (confirm('Delete this driver?')) deleteMutation.mutate(d.id); }} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">No drivers found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal title={editing ? 'Edit Driver' : 'Add Driver'} open={modalOpen} onClose={closeModal} size="lg">
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          {([
            ['first_name',      'First Name', 'text'],
            ['last_name',       'Last Name',  'text'],
            ['email',           'Email',      'email'],
            ['phone',           'Phone',      'text'],
            ['whatsapp',        'WhatsApp',   'text'],
            ['license_number',  'License No.','text'],
          ] as [keyof typeof emptyForm, string, string][]).map(([key, label, type]) => (
            <div key={key}>
              <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
              <input type={type} value={form[key]} required={key !== 'whatsapp'}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">License Expiry</label>
            <input type="date" required value={form.license_expiry}
              onChange={e => setForm(f => ({ ...f, license_expiry: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">Address</label>
            <input type="text" value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="col-span-2 flex gap-3 justify-end pt-2">
            <button type="button" onClick={closeModal} className="px-4 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              {editing ? 'Save Changes' : 'Add Driver'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
