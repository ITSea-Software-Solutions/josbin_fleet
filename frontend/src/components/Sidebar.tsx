import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Truck, Users, Wrench,
  ShieldCheck, ClipboardList, Bell, X, Fuel,
  MapPin, FileText, LogOut, Settings
} from 'lucide-react';
import api from '../api/client';

const navItems = [
  { to: '/',              label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/vehicles',      label: 'Vehicles',     icon: Truck },
  { to: '/drivers',       label: 'Drivers',      icon: Users },
  { to: '/services',      label: 'Services',     icon: Wrench },
  { to: '/insurance',     label: 'Insurance',    icon: ShieldCheck },
  { to: '/inspections',   label: 'Inspections',  icon: ClipboardList },
  { to: '/fuel-log',      label: 'Fuel Log',     icon: Fuel },
  { to: '/trip-log',      label: 'Trip Log',     icon: MapPin },
  { to: '/reports',       label: 'Reports',      icon: FileText },
  { to: '/notifications', label: 'Notifications',icon: Bell },
  { to: '/settings',      label: 'Settings',     icon: Settings },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: Props) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') ?? '{}');

  const handleLogout = async () => {
    try { await api.post('/logout'); } catch { /* ignore */ }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <aside
      className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 bg-slate-900 text-white flex flex-col
        transform transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Truck className="text-blue-400" size={24} />
          <span className="font-bold text-lg tracking-tight">Josbin Fleet MS</span>
        </div>
        <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div className="px-4 py-3 border-t border-slate-700">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
            {user.name?.charAt(0)?.toUpperCase() ?? 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-200 truncate">{user.name ?? 'Admin'}</p>
            <p className="text-xs text-slate-500 truncate">{user.email ?? ''}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </aside>
  );
}
