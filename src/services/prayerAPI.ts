import apiClient from './api';

export interface Prayer {
  _id: string;
  userId: string;
  title: string;
  description: string;
  images: string[];
  isPublic: boolean;
  likeCount?: number;
  commentCount?: number;
  prayerRequestId?: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
  author?: {
    _id: string;
    name: string;
    avatar?: string;
    role?: string;
  };
  isLiked?: boolean; // This is what the API actually returns
}

export interface PrayerRequest {
  _id: string;
  userId: string;
  title: string;
  description: string;
  images: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number;
  author?: {
    _id: string;
    name: string;
    avatar?: string;
    role?: string;
  };
}

export interface PrayerComment {
  _id: string;
  userId: string;
  prayerId: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    _id: string;
    name: string;
    avatar?: string;
  };
}

export interface AllPrayersResponse {
  status: string;
  message: string;
  data: Prayer[];
  meta?: {
    requestId: string;
    ip: string;
    userAgent: string;
    timestamp: string;
  };
}

export interface AllPrayerRequestsResponse {
  status: string;
  message: string;
  data: PrayerRequest[];
  meta?: any;
}

export interface SinglePrayerResponse {
  status: string;
  message: string;
  data: Prayer;
  meta?: any;
}

export interface SinglePrayerRequestResponse {
  status: string;
  message: string;
  data: PrayerRequest;
  meta?: any;
}

export interface PrayerLikeResponse {
  status: string;
  message: string;
  data: {
    prayer: Prayer;
    liked: boolean;
  };
  meta?: any;
}

export interface PrayerCommentResponse {
  status: string;
  message: string;
  data: PrayerComment;
  meta?: any;
}

export interface CommentsListResponse {
  status: string;
  message: string;
  data: PrayerComment[];
  meta?: any;
}

export interface CreatePrayerData {
  title: string;
  description: string;
  images?: string[];
  isPublic?: boolean;
  prayerRequestId?: string;
}

export interface CreatePrayerRequestData {
  title: string;
  description: string;
  images?: string[];
  isPublic?: boolean;
}

class PrayerAPI {
  // ============================================
  // PRAYER REQUEST ENDPOINTS (For Prayer Wall)
  // ============================================

  /**
   * Get user's prayer requests
   */
  async getMyPrayerRequests(): Promise<PrayerRequest[]> {
    try {
      const response = await apiClient.get<AllPrayerRequestsResponse>('/prayer-request/user');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching my prayer requests:', error);
      throw error;
    }
  }

  /**
   * Create a new prayer request
   */
  async createPrayerRequest(data: CreatePrayerRequestData): Promise<PrayerRequest> {
    try {
      const response = await apiClient.post<SinglePrayerRequestResponse>(
        '/prayer-request/create',
        data
      );
      return response.data.data;
    } catch (error) {
      console.error('Error creating prayer request:', error);
      throw error;
    }
  }

  /**
   * Update a prayer request
   */
  async updatePrayerRequest(
    requestId: string,
    data: Partial<CreatePrayerRequestData>
  ): Promise<PrayerRequest> {
    try {
      const response = await apiClient.put<SinglePrayerRequestResponse>(
        `/prayer-request/${requestId}`,
        data
      );
      return response.data.data;
    } catch (error) {
      console.error('Error updating prayer request:', error);
      throw error;
    }
  }

  /**
   * Delete a prayer request
   */
  async deletePrayerRequest(requestId: string): Promise<void> {
    try {
      await apiClient.delete(`/prayer-request/${requestId}`);
    } catch (error) {
      console.error('Error deleting prayer request:', error);
      throw error;
    }
  }

  // ============================================
  // PRAYER ENDPOINTS (Church Wall - Public Prayers)
  // ============================================

  /**
   * Get all public prayers (for church wall)
   */
  async getAllPrayers(): Promise<Prayer[]> {
    try {
      const response = await apiClient.get<AllPrayersResponse>('/prayer');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching prayers:', error);
      throw error;
    }
  }

  /**
   * Get user's personal prayers
   */
  async getMyPrayers(): Promise<Prayer[]> {
    try {
      const response = await apiClient.get<AllPrayersResponse>('/prayer/my-prayers');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching my prayers:', error);
      throw error;
    }
  }

  /**
   * Get a single prayer by ID
   */
  async getPrayerById(prayerId: string): Promise<Prayer> {
    try {
      const response = await apiClient.get<SinglePrayerResponse>(`/prayer/${prayerId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching prayer:', error);
      throw error;
    }
  }

  /**
   * Create a new prayer (for church wall)
   */
  async createPrayer(prayerData: CreatePrayerData): Promise<Prayer> {
    try {
      const response = await apiClient.post<SinglePrayerResponse>('/prayer', prayerData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating prayer:', error);
      throw error;
    }
  }

  /**
   * Update a prayer
   */
  async updatePrayer(prayerId: string, prayerData: Partial<CreatePrayerData>): Promise<Prayer> {
    try {
      const response = await apiClient.put<SinglePrayerResponse>(`/prayer/${prayerId}`, prayerData);
      return response.data.data;
    } catch (error) {
      console.error('Error updating prayer:', error);
      throw error;
    }
  }

  /**
   * Delete a prayer
   */
  async deletePrayer(prayerId: string): Promise<void> {
    try {
      await apiClient.delete(`/prayer/${prayerId}`);
    } catch (error) {
      console.error('Error deleting prayer:', error);
      throw error;
    }
  }

  /**
   * Like/Unlike a prayer (toggle)
   */
  async togglePrayerLike(prayerId: string): Promise<{ liked: boolean; likeCount: number }> {
    try {
      const response = await apiClient.post<PrayerLikeResponse>(`/prayer-like/${prayerId}/like`);
      const { prayer, liked } = response.data.data;
      return { liked, likeCount: prayer?.likeCount || 0 };
    } catch (error) {
      console.error('Error toggling prayer like:', error);
      throw error;
    }
  }

  /**
   * Add a comment to a prayer
   */
  async addComment(prayerId: string, comment: string): Promise<PrayerComment> {
    try {
      const response = await apiClient.post<PrayerCommentResponse>(
        `/prayer-comment/${prayerId}/comment`,
        { comment }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  /**
   * Get comments for a prayer
   */
  async getComments(prayerId: string): Promise<PrayerComment[]> {
    try {
      const response = await apiClient.get<CommentsListResponse>(
        `/prayer-comment/${prayerId}/comments`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string): Promise<void> {
    try {
      await apiClient.delete(`/prayer-comment/${commentId}`);
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }

  /**
   * Search prayers
   */
  async searchPrayers(query: string): Promise<Prayer[]> {
    try {
      const response = await apiClient.get<AllPrayersResponse>(`/prayer/search?q=${query}`);
      return response.data.data;
    } catch (error) {
      console.error('Error searching prayers:', error);
      throw error;
    }
  }

  /**
   * Get prayers by category/tag
   */
  async getPrayersByCategory(category: string): Promise<Prayer[]> {
    try {
      const response = await apiClient.get<AllPrayersResponse>(`/prayer/category/${category}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching prayers by category:', error);
      throw error;
    }
  }
}

export const prayerAPI = new PrayerAPI();
export default prayerAPI;