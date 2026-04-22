import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Drivers from './pages/Drivers';
import Services from './pages/Services';
import InsurancePage from './pages/Insurance';
import Inspections from './pages/Inspections';
import FuelLog from './pages/FuelLog';
import TripLog from './pages/TripLog';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import SettingsPage from './pages/Settings';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            element={
              <RequireAuth>
                <Layout />
              </RequireAuth>
            }
          >
            <Route index             element={<Dashboard />} />
            <Route path="vehicles"      element={<Vehicles />} />
            <Route path="drivers"       element={<Drivers />} />
            <Route path="services"      element={<Services />} />
            <Route path="insurance"     element={<InsurancePage />} />
            <Route path="inspections"   element={<Inspections />} />
            <Route path="fuel-log"      element={<FuelLog />} />
            <Route path="trip-log"      element={<TripLog />} />
            <Route path="reports"       element={<Reports />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings"      element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
