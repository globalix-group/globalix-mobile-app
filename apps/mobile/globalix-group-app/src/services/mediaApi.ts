import { API_BASE_URL, getAuthToken } from './apiClient';

export interface Media {
  id: string;
  userId: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  thumbnailUrl: string | null;
  caption: string | null;
  privacy: 'public' | 'private' | 'followers';
  likes: number;
  views: number;
  duration: number | null;
  width: number | null;
  height: number | null;
  fileSize: number | null;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaUploadResponse {
  success: boolean;
  data: Media;
  message: string;
}

export interface MediaListResponse {
  success: boolean;
  data: Media[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

const buildAuthHeaders = async (isMultipart: boolean = false) => {
  const headers: Record<string, string> = {};
  const token = await getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

export const mediaApi = {
  /**
   * Upload media (image or video)
   */
  upload: async (file: {
    uri: string;
    type: string;
    name: string;
  }, caption?: string, privacy: 'public' | 'private' | 'followers' = 'public'): Promise<MediaUploadResponse> => {
    const token = await getAuthToken();
    if (!token) {
      return {
        success: false,
        data: undefined as any,
        message: 'Authentication required',
      } as MediaUploadResponse;
    }

    const formData = new FormData();
    
    // @ts-ignore - React Native FormData accepts object with uri, type, name
    formData.append('media', {
      uri: file.uri,
      type: file.type,
      name: file.name,
    });

    if (caption) {
      formData.append('caption', caption);
    }
    formData.append('privacy', privacy);

    const response = await fetch(`${API_BASE_URL}/media/upload`, {
      method: 'POST',
      headers: await buildAuthHeaders(true),
      body: formData,
    });

    let payload: any = null;
    try {
      payload = await response.json();
    } catch (error) {
      payload = { success: response.ok };
    }

    if (!response.ok) {
      return {
        success: false,
        data: payload?.data,
        message: payload?.message || payload?.error?.message || payload?.error || 'Upload failed',
      } as MediaUploadResponse;
    }

    return {
      success: payload?.success ?? true,
      data: payload?.data,
      message: payload?.message || 'Media uploaded successfully',
    } as MediaUploadResponse;
  },

  /**
   * Get user's media gallery
   */
  getUserMedia: async (userId: string, limit: number = 50, offset: number = 0): Promise<MediaListResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/media/user/${userId}?limit=${limit}&offset=${offset}`,
      {
        method: 'GET',
        headers: await buildAuthHeaders(),
      }
    );
    return response.json();
  },

  /**
   * Get specific media by ID
   */
  getMediaById: async (mediaId: string): Promise<{ success: boolean; data: Media }> => {
    const response = await fetch(`${API_BASE_URL}/media/${mediaId}`, {
      method: 'GET',
      headers: await buildAuthHeaders(),
    });
    return response.json();
  },

  /**
   * Delete media
   */
  deleteMedia: async (mediaId: string): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/media/${mediaId}`, {
      method: 'DELETE',
      headers: await buildAuthHeaders(),
    });
    return response.json();
  },

  /**
   * Update media caption
   */
  updateCaption: async (mediaId: string, caption: string): Promise<{ success: boolean; data: Media; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/media/${mediaId}/caption`, {
      method: 'PATCH',
      headers: await buildAuthHeaders(),
      body: JSON.stringify({ caption }),
    });
    return response.json();
  },
};
