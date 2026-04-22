import { useQuery } from '@tanstack/react-query';
import { Truck, Users, Wrench, ShieldCheck, ClipboardList, AlertTriangle } from 'lucide-react';
import { dashboardApi } from '../api/client';
import StatsCard from '../components/StatsCard';
import type { DashboardStats } from '../types';

// Mock data while backend isn't connected
const mockStats: DashboardStats = {
  total_vehicles: 24,
  active_vehicles: 19,
  total_drivers: 18,
  active_drivers: 16,
  vehicles_in_maintenance: 3,
  upcoming_services: 5,
  upcoming_inspections: 2,
  expiring_insurance: 3,
  expiring_licenses: 1,
};

const mockAlerts = [
  { id: 1, type: 'service',    severity: 'warning', message: 'Vehicle SRN-0042 (Toyota Hilux) service due in 3 days', date: '2026-04-02' },
  { id: 2, type: 'insurance',  severity: 'danger',  message: 'Vehicle SRN-0011 insurance expires in 7 days', date: '2026-04-06' },
  { id: 3, type: 'inspection', severity: 'warning', message: 'Vehicle SRN-0031 annual inspection due in 10 days', date: '2026-04-09' },
  { id: 4, type: 'license',    severity: 'danger',  message: "Driver John Doe's license expires in 5 days", date: '2026-04-04' },
  { id: 5, type: 'service',    severity: 'info',    message: 'Vehicle SRN-0017 scheduled for brake inspection', date: '2026-04-15' },
];

const severityColor: Record<string, string> = {
  danger:  'border-l-red-500 bg-red-50',
  warning: 'border-l-yellow-500 bg-yellow-50',
  info:    'border-l-blue-500 bg-blue-50',
};

const severityIcon: Record<string, string> = {
  danger:  'text-red-500',
  warning: 'text-yellow-500',
  info:    'text-blue-500',
};

export default function Dashboard() {
  const { data: stats = mockStats } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.stats().then(r => r.data),
  });

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatsCard label="Total Vehicles"   value={stats.total_vehicles}      icon={Truck}        color="blue"   sub={`${stats.active_vehicles} active`} />
        <StatsCard label="Total Drivers"    value={stats.total_drivers}       icon={Users}        color="green"  sub={`${stats.active_drivers} active`} />
        <StatsCard label="In Maintenance"   value={stats.vehicles_in_maintenance} icon={Wrench}   color="yellow" />
        <StatsCard label="Upcoming Services"value={stats.upcoming_services}   icon={Wrench}       color="purple" sub="Next 30 days" />
        <StatsCard label="Expiring Insurance" value={stats.expiring_insurance} icon={ShieldCheck} color="red"    sub="Next 30 days" />
        <StatsCard label="Due Inspections"  value={stats.upcoming_inspections} icon={ClipboardList} color="yellow" sub="Next 30 days" />
        <StatsCard label="License Renewals" value={stats.expiring_licenses}   icon={Users}        color="red"    sub="Next 30 days" />
      </div>

      {/* Alerts */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <AlertTriangle size={18} className="text-yellow-500" />
          <h2 className="font-semibold text-slate-800">Active Alerts</h2>
          <span className="ml-auto text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
            {mockAlerts.length}
          </span>
        </div>
        <ul className="divide-y divide-slate-100">
          {mockAlerts.map((alert) => (
            <li
              key={alert.id}
              className={`flex items-start gap-3 px-5 py-3.5 border-l-4 ${severityColor[alert.severity]}`}
            >
              <AlertTriangle size={16} className={`mt-0.5 shrink-0 ${severityIcon[alert.severity]}`} />
              <div className="min-w-0">
                <p className="text-sm text-slate-700">{alert.message}</p>
                <p className="text-xs text-slate-400 mt-0.5">{alert.date}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
