import axios from 'axios';

const ADMIN_API_URL =
  process.env.NEXT_PUBLIC_ADMIN_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3002/admin/api';
const GLOBALIX_API_URL =
  process.env.NEXT_PUBLIC_GLOBALIX_API_URL ||
  'http://localhost:3002/api/v1';
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID;

const adminClient = axios.create({
  baseURL: `${ADMIN_API_URL}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Separate client for globalix-group-backend (main API)
const globalixClient = axios.create({
  baseURL: `${GLOBALIX_API_URL}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to admin requests
adminClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (TENANT_ID) {
    config.headers['x-tenant-id'] = TENANT_ID;
  }
  return config;
});

globalixClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (TENANT_ID) {
    config.headers['x-tenant-id'] = TENANT_ID;
  }
  return config;
});

export const adminApi = {
  // Auth
  login: (email: string, password: string) =>
    adminClient.post('/admin/login', { email, password }),
  
  // Dashboard
  getDashboard: () => adminClient.get('/dashboard'),
  
  // Activity - directly from globalix-group-backend
  getActivity: (params?: { limit?: number; offset?: number; type?: string }) =>
    globalixClient.get('/activities', { params }),
  
  // Properties
  getProperties: (params?: { page?: number; limit?: number; type?: string; status?: string }) =>
    globalixClient.get('/properties', { params }),
  getPropertyById: (id: string) => globalixClient.get(`/properties/${id}`),
  
  // Cars
  getCars: (params?: { page?: number; limit?: number; category?: string }) =>
    globalixClient.get('/cars', { params }),
  getCarById: (id: string) => globalixClient.get(`/cars/${id}`),
  
  // Inquiries
  getInquiries: (params?: { limit?: number; offset?: number; status?: string }) =>
    globalixClient.get('/inquiries', { params }),
  updateInquiry: (id: string, data: { status: string }) =>
    globalixClient.put(`/inquiries/${id}`, data),
  
  // Contacts
  getContacts: (params?: { limit?: number; offset?: number; resolved?: boolean }) =>
    globalixClient.get('/contacts', { params }),
  
  // Car Reservations
  getReservations: (params?: { limit?: number; offset?: number; status?: string }) =>
    globalixClient.get('/reservations', { params }),
  updateReservation: (id: string, data: { status: string }) =>
    globalixClient.put(`/reservations/${id}`, data),
  
  // Earnings
  getEarnings: (period?: string) =>
    adminClient.get('/earnings', { params: { period } }),
  
  // Analytics
  getAnalytics: (days?: number) =>
    adminClient.get('/analytics', { params: { days } }),
  
  // Users
  getUsers: (limit?: number, offset?: number, search?: string) =>
    globalixClient.get('/admin/users', { params: { limit: limit || 20, offset: offset || 0, search } }),
  deleteUser: (userId: string) => globalixClient.delete(`/admin/users/${userId}`),

  // Chats
  getAllUserChats: () => globalixClient.get('/admin/chats'),
  sendChatMessage: (userId: string, message: string) =>
    globalixClient.post('/admin/chats', { userId, message }),
  
  // Auth Stats
  getAuthStats: () => adminClient.get('/auth-stats'),
};

export default adminClient;
