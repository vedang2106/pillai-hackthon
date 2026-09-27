import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('eventflow_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  register: (body) => api.post('/api/auth/register', body),
  login: (body) => api.post('/api/auth/login', body),
  me: () => api.get('/api/auth/me'),
  getOrganizers: () => api.get('/api/auth/organizers'),
};

export const eventsApi = {
  list: () => api.get('/api/events'),
  get: (id) => api.get(`/api/events/${id}`),
  create: (body) => api.post('/api/events', body),
  createOfficial: (body) => api.post('/api/events/official', body),
  getGovernmentOverview: () => api.get('/api/events/government/overview'),
  getDemandPredictions: (id) => api.get(`/api/events/${id}/predictions/demand`),
  verify: (id) => api.patch(`/api/events/${id}/verify`),
  assignOrganizer: (id, organizerId) => api.patch(`/api/events/${id}/assign-organizer`, { organizerId }),
  update: (id, body) => api.patch(`/api/events/${id}`, body),
  remove: (id) => api.delete(`/api/events/${id}`),
};

export const zonesApi = {
  listByEvent: (eventId) => api.get(`/api/zones/${eventId}`),
  create: (body) => api.post('/api/zones', body),
  update: (id, body) => api.patch(`/api/zones/${id}`, body),
  remove: (id) => api.delete(`/api/zones/${id}`),
};

export const aiApi = {
  getDemandPredictions: (eventId) => api.get(`/api/ai/events/${eventId}/predictions/demand`),
  getRiskDetection: (eventId) => api.get(`/api/ai/events/${eventId}/risk`),
  getCrowdRipple: (eventId) => api.get(`/api/ai/events/${eventId}/ripple`),
  getSmartRoute: (body) => api.post('/api/ai/smart-route', body),
  getRecommendations: (eventId) => api.get(`/api/ai/events/${eventId}/recommendations`),
  getMultiEvent: () => api.get('/api/ai/multi-event'),
  getDigitalTwin: () => api.get('/api/ai/digital-twin'),
  runWhatIf: (eventId, scenario) => api.post(`/api/ai/events/${eventId}/what-if`, { scenario }),
  getExitWave: (eventId) => api.get(`/api/ai/events/${eventId}/exit-wave`),
  queryAssistant: (query, eventId) => api.post('/api/ai/assistant/query', { query, eventId }),
  getMlAnalytics: () => api.get('/api/ai/analytics'),
  calculateVisitorRoute: (body) => api.post('/api/ai/visitor-route', body),
  getLiveWeather: (lat, lon) => api.get('/api/ai/weather/live', { params: { lat, lon } }),
};

export const healthApi = {
  check: () => api.get('/api/health'),
};

export const ticketsApi = {
  getTiers: (eventId) => api.get(`/api/tickets/tiers/${eventId}`),
  saveTiers: (eventId, tiers) => api.post(`/api/tickets/tiers/${eventId}`, { tiers }),
  purchase: (body) => api.post('/api/tickets/purchase', body),
  getMyTickets: (email) => api.get('/api/tickets/my-tickets', { params: { email } }),
  scan: (body) => api.post('/api/tickets/scan', body),
};
