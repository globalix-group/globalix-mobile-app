/**
 * apiClient.ts
 * HTTP client for communicating with Globalix backend
 */

// Use your machine IP for mobile app to connect from iOS simulator/device
// globalix-group-backend runs on port 3002
// If you change machines, update this IP address to your new machine's local IP
const API_BASE_URL = 'http://192.168.2.173:3002/api/v1';

interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  error?: string;
}

const makeRequest = async <T = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<ApiResponse<T>> => {
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    console.log(`🌐 API Request [${method} ${endpoint}]`, body);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.warn('Failed to parse JSON response:', parseError);
      data = { success: response.ok };
    }

    console.log(`✅ API Response [${method} ${endpoint}]:`, data);

    if (!response.ok) {
      const errorMsg = data?.error || data?.message || 'Request failed';
      console.error(`❌ API Error [${response.status}]:`, errorMsg);
      return { error: errorMsg };
    }

    return data;
  } catch (error: any) {
    console.error(`⚠️ API Error [${method} ${endpoint}]:`, error.message);
    return { error: error.message || 'Network request failed' };
  }
};

export const authApi = {
  login: (email: string, password: string) =>
    makeRequest('/auth/login', 'POST', { email, password }),
  
  register: (email: string, password: string, name: string) =>
    makeRequest('/auth/register', 'POST', { email, password, name }),
  
  logout: () =>
    makeRequest('/auth/logout', 'POST'),
};

export const activityApi = {
  logActivity: (userId: string, action: string, type: string, metadata?: any) =>
    makeRequest('/activities/log', 'POST', { userId, action, type, metadata }),
};

export default { authApi, activityApi };
