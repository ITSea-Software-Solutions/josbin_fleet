export interface Vehicle {
  id: number;
  plate_number: string;
  make: string;
  model: string;
  year: number;
  color: string;
  vin: string;
  status: 'active' | 'inactive' | 'maintenance';
  fuel_type: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  mileage: number;
  driver_id?: number;
  driver?: Driver;
  next_service_date?: string;
  next_inspection_date?: string;
  insurance_expiry?: string;
  created_at: string;
  updated_at: string;
}

export interface Driver {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  license_number: string;
  license_expiry: string;
  address?: string;
  status: 'active' | 'inactive' | 'suspended';
  vehicle?: Vehicle;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: number;
  vehicle_id: number;
  vehicle?: Vehicle;
  type: 'oil_change' | 'tire_rotation' | 'brake_inspection' | 'full_service' | 'other';
  description?: string;
  service_date: string;
  next_service_date?: string;
  next_service_mileage?: number;
  cost?: number;
  garage?: string;
  status: 'scheduled' | 'completed' | 'overdue';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Insurance {
  id: number;
  vehicle_id: number;
  vehicle?: Vehicle;
  provider: string;
  policy_number: string;
  type: 'third_party' | 'comprehensive' | 'fire_theft';
  start_date: string;
  expiry_date: string;
  premium_amount: number;
  coverage_amount?: number;
  status: 'active' | 'expired' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Inspection {
  id: number;
  vehicle_id: number;
  vehicle?: Vehicle;
  type: 'routine' | 'annual' | 'safety' | 'emissions';
  inspection_date: string;
  next_inspection_date?: string;
  result: 'pass' | 'fail' | 'pending';
  inspector?: string;
  location?: string;
  cost?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationLog {
  id: number;
  type: 'service' | 'insurance' | 'inspection' | 'license';
  channel: 'email' | 'whatsapp';
  recipient: string;
  subject?: string;
  message: string;
  status: 'sent' | 'failed' | 'pending';
  sent_at?: string;
  vehicle_id?: number;
  vehicle?: Vehicle;
  driver_id?: number;
  driver?: Driver;
  created_at: string;
}

export interface DashboardStats {
  total_vehicles: number;
  active_vehicles: number;
  total_drivers: number;
  active_drivers: number;
  vehicles_in_maintenance: number;
  upcoming_services: number;
  upcoming_inspections: number;
  expiring_insurance: number;
  expiring_licenses: number;
}

export interface FuelLog {
  id: number;
  vehicle_id: number;
  vehicle?: Vehicle;
  driver_id?: number;
  driver?: Driver;
  fill_date: string;
  liters: number;
  cost_per_liter: number;
  total_cost: number;
  odometer: number;
  fuel_type: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  station?: string;
  full_tank?: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TripLog {
  id: number;
  vehicle_id: number;
  vehicle?: Vehicle;
  driver_id?: number;
  driver?: Driver;
  origin: string;
  destination: string;
  purpose?: string;
  start_time: string;
  end_time?: string | null;
  start_odometer: number;
  end_odometer?: number | null;
  distance_km?: number | null;
  status: 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
