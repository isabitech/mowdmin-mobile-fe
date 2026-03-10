import apiClient from './api';

export interface DailyVerse {
  _id: string;
  passage: string;
  text: string;
  version: string;
  isDaily: boolean;
  createdAt: string;
  updatedAt: string;
  id: string;
}

class BibleVersesAPI {
  async getDailyVerse(): Promise<DailyVerse> {
    try {
      const response = await apiClient.get('/bible-verses/daily');
      return response.data.data;
    } catch (error) {
      console.error('[BibleVersesAPI] getDailyVerse error:', error);
      throw error;
    }
  }
}

export const bibleVersesAPI = new BibleVersesAPI();
export default bibleVersesAPI;