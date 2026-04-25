import apiClient from './api'; // Adjust path as needed

export interface BibleStoryMedia {
  url: string;
  type?: string;
}

export interface BibleStoryAPI {
  _id: string;
  id: string;
  title: string;
  content: string;
  order: number;
  mediaIds: string[];
  media: BibleStoryMedia[];
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface BibleStoriesResponse {
  status: string;
  message: string;
  data: BibleStoryAPI[];
  meta?: {
    requestId: string;
    ip: string;
    userAgent: string;
    timestamp: string;
  };
}

export const bibleStoriesAPI = {
  getAllStories: async (): Promise<BibleStoriesResponse> => {
    try {
      const response = await apiClient.get('/bible-stories');
      console.log('[BibleStoriesAPI] getAllStories:', response.data?.data?.length, 'stories');
      return response.data;
    } catch (error) {
      console.error('[BibleStoriesAPI] getAllStories error:', error);
      throw error;
    }
  },

  getStoryById: async (id: string): Promise<{ status: string; data: BibleStoryAPI }> => {
    try {
      const response = await apiClient.get(`/bible-stories/${id}`);
      return response.data;
    } catch (error) {
      console.error('[BibleStoriesAPI] getStoryById error:', error);
      throw error;
    }
  },
};

export default bibleStoriesAPI;