import axios from 'axios';

const ADMIN_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const GLOBALIX_API_URL = 'http://localhost:3002';

const adminClient = axios.create({
  baseURL: `${ADMIN_API_URL}/admin/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Separate client for globalix-group-backend (activities)
const globalixClient = axios.create({
  baseURL: `${GLOBALIX_API_URL}/api/v1`,
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
  return config;
});

export const adminApi = {
  // Auth
  login: (email: string, password: string) =>
    adminClient.post('/login', { email, password }),
  
  // Dashboard
  getDashboard: () => adminClient.get('/dashboard'),
  
  // Activity - directly from globalix-group-backend
  getActivity: (limit?: number, offset?: number, type?: string) =>
    globalixClient.get('/activities', { params: { limit, offset, type } }),
  
  // Earnings
  getEarnings: (period?: string) =>
    adminClient.get('/earnings', { params: { period } }),
  
  // Analytics
  getAnalytics: (days?: number) =>
    adminClient.get('/analytics', { params: { days } }),
  
  // Users
  getUsers: (limit?: number, offset?: number, search?: string) =>
    adminClient.get('/users', { params: { limit, offset, search } }),
  
  // Auth Stats
  getAuthStats: () => adminClient.get('/auth-stats'),
};

export default adminClient;
