import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// --- Resource endpoints ---

export const vehiclesApi = {
  list:   (params?: object) => api.get('/vehicles', { params }),
  get:    (id: number)      => api.get(`/vehicles/${id}`),
  create: (data: object)    => api.post('/vehicles', data),
  update: (id: number, data: object) => api.put(`/vehicles/${id}`, data),
  delete: (id: number)      => api.delete(`/vehicles/${id}`),
};

export const driversApi = {
  list:   (params?: object) => api.get('/drivers', { params }),
  get:    (id: number)      => api.get(`/drivers/${id}`),
  create: (data: object)    => api.post('/drivers', data),
  update: (id: number, data: object) => api.put(`/drivers/${id}`, data),
  delete: (id: number)      => api.delete(`/drivers/${id}`),
};

export const servicesApi = {
  list:   (params?: object) => api.get('/services', { params }),
  get:    (id: number)      => api.get(`/services/${id}`),
  create: (data: object)    => api.post('/services', data),
  update: (id: number, data: object) => api.put(`/services/${id}`, data),
  delete: (id: number)      => api.delete(`/services/${id}`),
};

export const insuranceApi = {
  list:   (params?: object) => api.get('/insurance', { params }),
  get:    (id: number)      => api.get(`/insurance/${id}`),
  create: (data: object)    => api.post('/insurance', data),
  update: (id: number, data: object) => api.put(`/insurance/${id}`, data),
  delete: (id: number)      => api.delete(`/insurance/${id}`),
};

export const inspectionsApi = {
  list:   (params?: object) => api.get('/inspections', { params }),
  get:    (id: number)      => api.get(`/inspections/${id}`),
  create: (data: object)    => api.post('/inspections', data),
  update: (id: number, data: object) => api.put(`/inspections/${id}`, data),
  delete: (id: number)      => api.delete(`/inspections/${id}`),
};

export const fuelLogsApi = {
  list:   (params?: object) => api.get('/fuel-logs', { params }),
  get:    (id: number)      => api.get(`/fuel-logs/${id}`),
  create: (data: object)    => api.post('/fuel-logs', data),
  update: (id: number, data: object) => api.put(`/fuel-logs/${id}`, data),
  delete: (id: number)      => api.delete(`/fuel-logs/${id}`),
};

export const tripLogsApi = {
  list:    (params?: object) => api.get('/trip-logs', { params }),
  get:     (id: number)      => api.get(`/trip-logs/${id}`),
  create:  (data: object)    => api.post('/trip-logs', data),
  update:  (id: number, data: object) => api.put(`/trip-logs/${id}`, data),
  endTrip: (id: number, data: object) => api.post(`/trip-logs/${id}/end`, data),
  delete:  (id: number)      => api.delete(`/trip-logs/${id}`),
};

export const notificationsApi = {
  list:    (params?: object) => api.get('/notification-logs', { params }),
  preview: ()                => api.get('/notifications/preview'),
  run:     ()                => api.post('/notifications/run', {}),
  manual:  (data: object)    => api.post('/notifications/manual', data),
};

export const dashboardApi = {
  stats: () => api.get('/dashboard/stats'),
  alerts: () => api.get('/dashboard/alerts'),
};

export const settingsApi = {
  list:         ()                    => api.get('/settings'),
  update:       (settings: Record<string, string>) => api.put('/settings', { settings }),
  testEmail:    ()                    => api.post('/settings/test-email'),
  testWhatsApp: ()                    => api.post('/settings/test-whatsapp'),
};
