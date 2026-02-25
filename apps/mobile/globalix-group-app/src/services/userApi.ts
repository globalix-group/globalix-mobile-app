import { API_BASE_URL, getAuthToken } from './apiClient';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileResponse {
  success: boolean;
  data: User;
  message?: string;
}

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
}

const buildAuthHeaders = () => {
  return {
    'Content-Type': 'application/json',
  };
};

export const userApi = {
  /**
   * Get current user's profile
   */
  getProfile: async (): Promise<UserProfileResponse> => {
    const token = await getAuthToken();
    if (!token) {
      return {
        success: false,
        data: undefined as any,
        message: 'Authentication required',
      } as UserProfileResponse;
    }

    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'GET',
      headers: {
        ...buildAuthHeaders(),
        Authorization: `Bearer ${token}`,
      },
    });

    const payload = await response.json();

    if (!response.ok) {
      return {
        success: false,
        data: payload?.data,
        message: payload?.message || payload?.error?.message || 'Failed to fetch profile',
      } as UserProfileResponse;
    }

    return {
      success: true,
      data: payload?.data,
      message: payload?.message || 'Profile fetched successfully',
    } as UserProfileResponse;
  },

  /**
   * Update user's profile
   */
  updateProfile: async (updates: UpdateProfilePayload): Promise<UserProfileResponse> => {
    const token = await getAuthToken();
    if (!token) {
      return {
        success: false,
        data: undefined as any,
        message: 'Authentication required',
      } as UserProfileResponse;
    }

    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'PUT',
      headers: {
        ...buildAuthHeaders(),
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    const payload = await response.json();

    if (!response.ok) {
      return {
        success: false,
        data: payload?.data,
        message: payload?.message || payload?.error?.message || 'Failed to update profile',
      } as UserProfileResponse;
    }

    return {
      success: true,
      data: payload?.data,
      message: payload?.message || 'Profile updated successfully',
    } as UserProfileResponse;
  },

  /**
   * Update user's avatar
   */
  updateAvatar: async (avatarUrl: string): Promise<UserProfileResponse> => {
    const token = await getAuthToken();
    if (!token) {
      return {
        success: false,
        data: undefined as any,
        message: 'Authentication required',
      } as UserProfileResponse;
    }

    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'PUT',
      headers: {
        ...buildAuthHeaders(),
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ avatar: avatarUrl }),
    });

    const payload = await response.json();

    if (!response.ok) {
      return {
        success: false,
        data: payload?.data,
        message: payload?.message || payload?.error?.message || 'Failed to update avatar',
      } as UserProfileResponse;
    }

    return {
      success: true,
      data: payload?.data,
      message: payload?.message || 'Avatar updated successfully',
    } as UserProfileResponse;
  },
};
