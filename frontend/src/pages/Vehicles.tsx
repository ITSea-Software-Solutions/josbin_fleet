import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { vehiclesApi } from '../api/client';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import type { Vehicle } from '../types';

const mockVehicles: Vehicle[] = [
  { id: 1, plate_number: 'SRN-0042', make: 'Toyota',  model: 'Hilux',   year: 2021, color: 'White',  vin: 'VIN0001', status: 'active',      fuel_type: 'diesel',  mileage: 84200, next_service_date: '2026-04-02', insurance_expiry: '2026-12-01', next_inspection_date: '2026-06-01', created_at: '', updated_at: '' },
  { id: 2, plate_number: 'SRN-0011', make: 'Nissan',  model: 'Navara',  year: 2019, color: 'Silver', vin: 'VIN0002', status: 'active',      fuel_type: 'diesel',  mileage: 120400,next_service_date: '2026-05-10', insurance_expiry: '2026-04-06', next_inspection_date: '2026-07-01', created_at: '', updated_at: '' },
  { id: 3, plate_number: 'SRN-0031', make: 'Ford',    model: 'Ranger',  year: 2020, color: 'Blue',   vin: 'VIN0003', status: 'maintenance', fuel_type: 'diesel',  mileage: 96300, next_service_date: '2026-04-20', insurance_expiry: '2026-09-15', next_inspection_date: '2026-04-09', created_at: '', updated_at: '' },
  { id: 4, plate_number: 'SRN-0017', make: 'Toyota',  model: 'Land Cruiser', year: 2022, color: 'Black', vin: 'VIN0004', status: 'active', fuel_type: 'petrol', mileage: 45000, next_service_date: '2026-04-15', insurance_expiry: '2026-11-20', next_inspection_date: '2026-08-01', created_at: '', updated_at: '' },
  { id: 5, plate_number: 'SRN-0055', make: 'Isuzu',   model: 'D-Max',   year: 2018, color: 'Red',    vin: 'VIN0005', status: 'inactive',   fuel_type: 'diesel',  mileage: 165000,next_service_date: '2026-06-01', insurance_expiry: '2026-05-30', next_inspection_date: '2026-05-15', created_at: '', updated_at: '' },
];

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  active:      'success',
  maintenance: 'warning',
  inactive:    'neutral',
};

const emptyForm = {
  plate_number: '', make: '', model: '', year: new Date().getFullYear(),
  color: '', vin: '', status: 'active', fuel_type: 'diesel', mileage: 0,
  next_service_date: '', insurance_expiry: '', next_inspection_date: '',
};

export default function Vehicles() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);

  const { data: vehicles = mockVehicles } = useQuery<Vehicle[]>({
    queryKey: ['vehicles'],
    queryFn: () => vehiclesApi.list().then(r => r.data.data ?? r.data),
  });

  const createMutation = useMutation({
    mutationFn: (d: object) => vehiclesApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vehicles'] }); closeModal(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: object }) => vehiclesApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vehicles'] }); closeModal(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => vehiclesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vehicles'] }),
  });

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit   = (v: Vehicle) => {
    setEditing(v);
    setForm({
      plate_number: v.plate_number, make: v.make, model: v.model, year: v.year,
      color: v.color, vin: v.vin, status: v.status, fuel_type: v.fuel_type,
      mileage: v.mileage, next_service_date: v.next_service_date ?? '',
      insurance_expiry: v.insurance_expiry ?? '', next_inspection_date: v.next_inspection_date ?? '',
    });
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) updateMutation.mutate({ id: editing.id, data: form });
    else createMutation.mutate(form);
  };

  const filtered = vehicles.filter(v =>
    `${v.plate_number} ${v.make} ${v.model}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search vehicles..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} /> Add Vehicle
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Plate', 'Make / Model', 'Year', 'Fuel', 'Mileage', 'Next Service', 'Insurance Expiry', 'Status', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(v => (
              <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-mono font-medium text-blue-700">{v.plate_number}</td>
                <td className="px-4 py-3 font-medium">{v.make} {v.model}</td>
                <td className="px-4 py-3 text-slate-500">{v.year}</td>
                <td className="px-4 py-3 capitalize text-slate-500">{v.fuel_type}</td>
                <td className="px-4 py-3 text-slate-500">{v.mileage.toLocaleString()} km</td>
                <td className="px-4 py-3 text-slate-500">{v.next_service_date || '—'}</td>
                <td className="px-4 py-3 text-slate-500">{v.insurance_expiry || '—'}</td>
                <td className="px-4 py-3">
                  <Badge label={v.status} variant={statusVariant[v.status]} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(v)} className="p-1.5 rounded hover:bg-slate-100 text-slate-500"><Pencil size={14} /></button>
                    <button onClick={() => { if (confirm('Delete this vehicle?')) deleteMutation.mutate(v.id); }} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-400">No vehicles found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal title={editing ? 'Edit Vehicle' : 'Add Vehicle'} open={modalOpen} onClose={closeModal} size="lg">
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          {([
            ['plate_number', 'Plate Number', 'text'],
            ['make',         'Make',         'text'],
            ['model',        'Model',        'text'],
            ['year',         'Year',         'number'],
            ['color',        'Color',        'text'],
            ['vin',          'VIN',          'text'],
            ['mileage',      'Mileage (km)', 'number'],
          ] as [keyof typeof emptyForm, string, string][]).map(([key, label, type]) => (
            <div key={key}>
              <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
              <input
                type={type} required
                value={form[key] as string | number}
                onChange={e => setForm(f => ({ ...f, [key]: type === 'number' ? +e.target.value : e.target.value }))}
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

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {([
            ['next_service_date',    'Next Service Date'],
            ['insurance_expiry',     'Insurance Expiry'],
            ['next_inspection_date', 'Next Inspection Date'],
          ] as [keyof typeof emptyForm, string][]).map(([key, label]) => (
            <div key={key}>
              <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
              <input type="date" value={form[key] as string}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}

          <div className="col-span-2 flex gap-3 justify-end pt-2">
            <button type="button" onClick={closeModal} className="px-4 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              {editing ? 'Save Changes' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
