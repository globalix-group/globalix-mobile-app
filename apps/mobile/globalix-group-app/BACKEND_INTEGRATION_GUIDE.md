# BACKEND INTEGRATION GUIDE
**Quick Start Guide for Connecting Frontend to Backend APIs**

---

## 🚀 QUICK START (Do This First)

### Step 1: Install Required Packages (5 minutes)
```bash
cd /Users/emmanueltangadivine/globalix-group/apps/mobile/globalix-group-app

npm install @react-native-async-storage/async-storage axios
npm install zustand  # or redux if you prefer
```

### Step 2: Create API Client (10 minutes)

Create `/src/services/apiClient.ts`:

```typescript
/**
 * apiClient.ts
 * Centralized HTTP client with interceptors for all API calls
 */

import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ===== CONFIGURATION =====
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.globalix.com';
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// ===== API CLIENT INSTANCE =====
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ===== REQUEST INTERCEPTOR =====
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ===== RESPONSE INTERCEPTOR =====
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    // Handle 401 Unauthorized - try refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { token } = response.data;
        await AsyncStorage.setItem(TOKEN_KEY, token);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Clear tokens and redirect to login
        await AsyncStorage.removeItem(TOKEN_KEY);
        await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ===== HELPER FUNCTIONS =====
export const setAuthToken = async (token: string, refreshToken?: string) => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
  if (refreshToken) {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

export const clearAuthTokens = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
};

export default apiClient;
```

### Step 3: Create Auth Service (10 minutes)

Create `/src/services/authService.ts`:

```typescript
/**
 * authService.ts
 * Authentication-related API calls
 */

import apiClient, { setAuthToken, clearAuthTokens } from './apiClient';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export interface SignUpRequest {
  email: string;
  password: string;
  name: string;
}

// ===== AUTH CALLS =====
export const authService = {
  // Email/Password Login
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/login', data);
    const { token, refreshToken } = response.data;
    await setAuthToken(token, refreshToken);
    return response.data;
  },

  // User Registration
  register: async (data: SignUpRequest): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/register', data);
    const { token, refreshToken } = response.data;
    await setAuthToken(token, refreshToken);
    return response.data;
  },

  // Apple Sign-In Callback
  appleSignIn: async (identityToken: string): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/apple-callback', {
      identityToken,
    });
    const { token, refreshToken } = response.data;
    await setAuthToken(token, refreshToken);
    return response.data;
  },

  // Google Sign-In Callback
  googleSignIn: async (idToken: string): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/google-callback', {
      idToken,
    });
    const { token, refreshToken } = response.data;
    await setAuthToken(token, refreshToken);
    return response.data;
  },

  // Forgot Password
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      await clearAuthTokens();
    }
  },
};
```

### Step 4: Create Property Service (10 minutes)

Create `/src/services/propertyService.ts`:

```typescript
/**
 * propertyService.ts
 * Property-related API calls
 */

import apiClient from './apiClient';

export interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
  beds: string;
  baths: string;
  sqft: string;
  image: string;
  tag: string;
  type: string;
}

export interface PropertyFilter {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

// ===== PROPERTY CALLS =====
export const propertyService = {
  // Get all properties with filtering
  getProperties: async (filters?: PropertyFilter): Promise<{
    data: Property[];
    pagination: { total: number; page: number; limit: number };
  }> => {
    const response = await apiClient.get('/properties', { params: filters });
    return response.data;
  },

  // Get single property details
  getPropertyDetails: async (id: string): Promise<Property> => {
    const response = await apiClient.get(`/properties/${id}`);
    return response.data;
  },

  // Get properties for map view
  getPropertiesForMap: async (bounds?: any): Promise<Property[]> => {
    const response = await apiClient.get('/properties/map', { params: bounds });
    return response.data;
  },

  // Search properties
  searchProperties: async (query: string): Promise<Property[]> => {
    const response = await apiClient.get('/properties/search', {
      params: { q: query },
    });
    return response.data;
  },

  // Get property categories
  getCategories: async (): Promise<string[]> => {
    const response = await apiClient.get('/properties/categories');
    return response.data;
  },
};
```

### Step 5: Create Car Service (5 minutes)

Create `/src/services/carService.ts`:

```typescript
/**
 * carService.ts
 * Car-related API calls
 */

import apiClient from './apiClient';

export interface Car {
  id: string;
  name: string;
  brand: string;
  model: string;
  price: string;
  specs: string;
  image: string;
  category: string;
}

export const carService = {
  getCars: async (category?: string): Promise<Car[]> => {
    const response = await apiClient.get('/cars', { params: { category } });
    return response.data;
  },

  getCarDetails: async (id: string): Promise<Car> => {
    const response = await apiClient.get(`/cars/${id}`);
    return response.data;
  },

  searchCars: async (query: string): Promise<Car[]> => {
    const response = await apiClient.get('/cars/search', { params: { q: query } });
    return response.data;
  },

  reserveCar: async (carId: string, dates: { start: string; end: string }): Promise<any> => {
    const response = await apiClient.post(`/cars/${carId}/reserve`, dates);
    return response.data;
  },
};
```

### Step 6: Create Global State with Zustand (10 minutes)

Create `/src/store/authStore.ts`:

```typescript
/**
 * authStore.ts
 * Global authentication state management
 */

import { create } from 'zustand';
import { authService, LoginResponse } from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login({ email, password });
      set({ user: response.user, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || 'Login failed',
        isLoading: false,
      });
      throw error;
    }
  },

  register: async (email: string, password: string, name: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.register({ email, password, name });
      set({ user: response.user, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || 'Registration failed',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
      set({ user: null, isLoading: false });
    } catch (error: any) {
      set({ error: 'Logout failed', isLoading: false });
    }
  },

  checkAuth: async () => {
    // This will be called on app start
    // Check if token exists and validate it
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        // Optional: Call /auth/me endpoint to validate and get user
        // const response = await apiClient.get('/auth/me');
        // set({ user: response.data });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  },
}));
```

---

## 📋 INTEGRATION CHECKLIST

### Phase 1: Setup (Before First Integration)
- [ ] Install axios and async-storage
- [ ] Create apiClient.ts with interceptors
- [ ] Create authService.ts
- [ ] Create propertyService.ts
- [ ] Create carService.ts
- [ ] Create useAuthStore
- [ ] Create .env.local with API_URL

### Phase 2: Update Auth Context (App.tsx)
- [ ] Replace mock login with `authService.login()`
- [ ] Replace mock register with `authService.register()`
- [ ] Implement token persistence with AsyncStorage
- [ ] Add token refresh logic
- [ ] Update logout to call backend

### Phase 3: Update Screens (One by One)
For each screen:
1. Replace mock data with API call
2. Add loading state
3. Add error handling
4. Add retry logic
5. Test thoroughly

---

## 🔌 HOW TO INTEGRATE WITH EXISTING SCREENS

### Example: HomeScreen Integration

**Before (Mock Data):**
```tsx
const [properties, setProperties] = useState(PROPERTY_DATA);
```

**After (API Integration):**
```tsx
const [properties, setProperties] = useState<Property[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  loadProperties();
}, []);

const loadProperties = async () => {
  setLoading(true);
  setError(null);
  try {
    const data = await propertyService.getProperties();
    setProperties(data.data);
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

// In render:
{loading && <ActivityIndicator />}
{error && <Text>{error}</Text>}
{properties.length > 0 && <FlatList data={properties} ... />}
```

---

## 🛠️ ENVIRONMENT SETUP

Create `/src/config/env.ts`:

```typescript
/**
 * env.ts
 * Environment configuration for different builds
 */

const ENV = {
  development: {
    API_URL: 'http://localhost:3000/api',
    LOG_LEVEL: 'debug',
  },
  staging: {
    API_URL: 'https://staging-api.globalix.com',
    LOG_LEVEL: 'info',
  },
  production: {
    API_URL: 'https://api.globalix.com',
    LOG_LEVEL: 'error',
  },
};

const getEnv = () => {
  if (__DEV__) return ENV.development;
  // Add logic to detect staging vs production
  return ENV.production;
};

export default getEnv();
```

---

## 🧪 TESTING API INTEGRATION

### Test with Postman/Insomnia Before Frontend:

1. **Test Login:**
```
POST /auth/login
{
  "email": "test@example.com",
  "password": "password123"
}
```

2. **Test Get Properties:**
```
GET /properties
Authorization: Bearer {token}
```

3. **Test Error Handling:**
```
GET /properties/invalid-id
Authorization: Bearer invalid-token
```

---

## 🚨 IMPORTANT NOTES

1. **API_URL Configuration:**
   - Development: Point to localhost backend
   - Staging: Point to staging server
   - Production: Point to production server

2. **CORS Setup:**
   - Backend must allow `http://localhost:19006` (Expo)
   - In production, configure proper origins

3. **SSL/TLS:**
   - Always use HTTPS in production
   - Configure certificate pinning if needed

4. **Rate Limiting:**
   - Implement backoff retry logic
   - Display user-friendly error messages

5. **Offline Support:**
   - Consider implementing local caching
   - Use react-native-netinfo for network detection

---

## 📞 COMMON ISSUES & SOLUTIONS

**Issue: 404 Not Found**
- Verify API_URL is correct
- Ensure backend endpoint exists
- Check endpoint spelling

**Issue: 401 Unauthorized**
- Token may have expired
- Refresh token logic should handle
- Check token format (Bearer token)

**Issue: CORS Error**
- Ensure backend allows frontend origin
- Verify Content-Type header
- Check preflight requests

**Issue: Network Timeout**
- Increase timeout in apiClient
- Check network connectivity
- Verify backend is running

---

## 🎯 NEXT STEPS

1. ✅ Install packages
2. ✅ Create API services
3. ✅ Create Zustand store
4. ✅ Update App.tsx authentication
5. ✅ Update SignInScreen to use authService
6. ✅ Update HomeScreen to fetch real properties
7. ✅ Test end-to-end
8. ✅ Deploy to staging
9. ✅ Full testing and QA

---

**Ready to start?** Ask backend team for API documentation or start with Step 1!
