import { Menu, Bell } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const titles: Record<string, string> = {
  '/':              'Dashboard',
  '/vehicles':      'Vehicles',
  '/drivers':       'Drivers',
  '/services':      'Services',
  '/insurance':     'Insurance',
  '/inspections':   'Inspections',
  '/fuel-log':      'Fuel Log',
  '/trip-log':      'Trip Log',
  '/reports':       'Reports',
  '/notifications': 'Notifications',
};

interface Props {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: Props) {
  const { pathname } = useLocation();
  const title = titles[pathname] ?? 'Fleet Management';

  return (
    <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex items-center gap-4">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-1.5 rounded-md text-slate-500 hover:bg-slate-100"
      >
        <Menu size={20} />
      </button>

      <h1 className="text-lg font-semibold text-slate-800 flex-1">{title}</h1>

      <div className="flex items-center gap-3">
        <button className="relative p-1.5 rounded-full text-slate-500 hover:bg-slate-100">
          <Bell size={20} />
        </button>
      </div>
    </header>
  );
}
