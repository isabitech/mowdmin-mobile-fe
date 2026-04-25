import apiClient from './api';

export interface MediaBookmark {
  _id: string;
  userId: string;
  mediaId: string | { _id: string; title?: string; thumbnail?: string; description?: string };
  createdAt: string;
  updatedAt: string;
}

class MediaBookmarkAPI {
  async getMyBookmarks(): Promise<MediaBookmark[]> {
    try {
      const response = await apiClient.get('/media-bookmark');
      const data = response.data?.data || response.data || [];
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('[MediaBookmarkAPI] getMyBookmarks error:', error);
      throw error;
    }
  }

  async addBookmark(mediaId: string): Promise<MediaBookmark> {
    try {
      const response = await apiClient.post('/media-bookmark/create', { mediaId });
      return response.data?.data || response.data;
    } catch (error) {
      console.error('[MediaBookmarkAPI] addBookmark error:', error);
      throw error;
    }
  }

  async removeBookmark(bookmarkId: string): Promise<void> {
    try {
      await apiClient.delete(`/media-bookmark/${bookmarkId}`);
    } catch (error: any) {
      console.log('[MediaBookmarkAPI] removeBookmark id:', bookmarkId);
      console.log('[MediaBookmarkAPI] removeBookmark status:', error?.response?.status);
      console.log('[MediaBookmarkAPI] removeBookmark data:', JSON.stringify(error?.response?.data || {}));
      throw error;
    }
  }

  isBookmarked(mediaId: string, bookmarks: MediaBookmark[]): boolean {
    const mediaIdStr = typeof mediaId === 'string' ? mediaId : '';
    return bookmarks.some((b) => {
      const bMediaId = typeof b.mediaId === 'object' ? b.mediaId._id : b.mediaId;
      return bMediaId === mediaIdStr;
    });
  }

  getBookmarkId(mediaId: string, bookmarks: MediaBookmark[]): string | null {
    const found = bookmarks.find((b) => {
      const bMediaId = typeof b.mediaId === 'object' ? b.mediaId._id : b.mediaId;
      return bMediaId === mediaId;
    });
    return found?._id || null;
  }
}

export const mediaBookmarkAPI = new MediaBookmarkAPI();
export default mediaBookmarkAPI;
