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
      console.log('[BibleVersesAPI] Making GET request to /bible-verses/daily');
      const response = await apiClient.get('/bible-verses/daily');
      console.log('[BibleVersesAPI] Response status:', response.status);
      console.log('[BibleVersesAPI] Response data:', JSON.stringify(response.data, null, 2));
      
      if (!response.data || !response.data.data) {
        throw new Error('Invalid API response structure');
      }
      
      const verseData = response.data.data;
      console.log('[BibleVersesAPI] Parsed verse data:', JSON.stringify(verseData, null, 2));
      
      return verseData;
    } catch (error) {
      console.error('[BibleVersesAPI] getDailyVerse error:', error);
      console.error('[BibleVersesAPI] Error response:', error?.response?.data || 'No response data');
      throw error;
    }
  }
}

export const bibleVersesAPI = new BibleVersesAPI();
export default bibleVersesAPI;