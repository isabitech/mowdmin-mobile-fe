import apiClient from './api';

export interface CategoryAPI {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface MediaItemAPI {
  _id: string;
  title: string;
  description: string;
  category_id: CategoryAPI;
  thumbnail: string;
  isLive: boolean;
  type?: string; // e.g., 'video', 'audio'
  media_url?: string; // The actual media file URL
  author?: string;
  duration?: string;
  is_downloadable?: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface MediaResponse {
  status: string;
  message: string;
  data: MediaItemAPI[];
  meta?: {
    requestId: string;
    ip: string;
    userAgent: string;
    timestamp: string;
  };
}

export const mediaAPI = {
  // Fetch all media
  getAllMedia: async (): Promise<MediaResponse> => {
    const response = await apiClient.get('/media');
    return response.data;
  },

  // Fetch a single media item by ID
  getMediaById: async (id: string): Promise<MediaItemAPI> => {
    const response = await apiClient.get(`/media/${id}`);
    return response.data;
  },

  // Create new media (for upload functionality)
  createMedia: async (mediaData: {
    title: string;
    description: string;
    category_id?: string;
    thumbnail?: string;
    isLive?: boolean;
  }): Promise<MediaItemAPI> => {
    const response = await apiClient.post('/media/create', mediaData);
    return response.data;
  },

  // Update media
  updateMedia: async (id: string, mediaData: Partial<MediaItemAPI>): Promise<MediaItemAPI> => {
    const response = await apiClient.put(`/media/${id}`, mediaData);
    return response.data;
  },

  // Delete media
  deleteMedia: async (id: string): Promise<void> => {
    await apiClient.delete(`/media/${id}`);
  },
};

export default mediaAPI;