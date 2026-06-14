import { mediaAPI, MediaItemAPI } from './mediaAPI';

export type FaithMediaType = 'gospelMusic' | 'sermon';

export interface FaithMediaItem {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  mediaUrl?: string;
  author?: string;
  duration?: string;
  type?: string;
  isLive?: boolean;
  createdAt?: string;
  source: 'media-api' | 'fallback';
}

const SAMPLE_MEDIA_URL =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
const DEFAULT_THUMBNAIL =
  'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=1200&h=800&fit=crop';

const KEYWORDS: Record<FaithMediaType, string[]> = {
  gospelMusic: ['gospel', 'music', 'worship', 'praise', 'choir', 'song', 'hymn'],
  sermon: ['sermon', 'message', 'teaching', 'word', 'preaching', 'homily', 'service'],
};

const fallbackContent: Record<FaithMediaType, FaithMediaItem[]> = {
  gospelMusic: [
    {
      id: 'fallback-gospel-1',
      title: 'Morning of Praise',
      description: 'A joyful praise session to begin the day with faith and gratitude.',
      category: 'Gospel Music',
      thumbnail:
        'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1200&h=800&fit=crop',
      mediaUrl: SAMPLE_MEDIA_URL,
      author: 'MOWDMIN Worship',
      duration: '18 min',
      type: 'video',
      source: 'fallback',
    },
    {
      id: 'fallback-gospel-2',
      title: 'Worship Nights Live',
      description: 'Spirit-lifting songs recorded during a recent worship gathering.',
      category: 'Worship Session',
      thumbnail:
        'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=800&fit=crop',
      mediaUrl: SAMPLE_MEDIA_URL,
      author: 'The Sanctuary Choir',
      duration: '27 min',
      type: 'video',
      source: 'fallback',
    },
    {
      id: 'fallback-gospel-3',
      title: 'Songs of Testimony',
      description: 'A medley focused on gratitude, victory, and hope in Christ.',
      category: 'Praise Medley',
      thumbnail:
        'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&h=800&fit=crop',
      mediaUrl: SAMPLE_MEDIA_URL,
      author: 'Voices of Zion',
      duration: '15 min',
      type: 'video',
      source: 'fallback',
    },
    {
      id: 'fallback-gospel-4',
      title: 'Quiet Time Instrumentals',
      description: 'Gentle worship instrumentals for prayer, reading, and reflection.',
      category: 'Instrumental',
      thumbnail:
        'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=1200&h=800&fit=crop',
      mediaUrl: SAMPLE_MEDIA_URL,
      author: 'Faith Sounds',
      duration: '42 min',
      type: 'video',
      source: 'fallback',
    },
  ],
  sermon: [
    {
      id: 'fallback-sermon-1',
      title: 'Faith That Keeps Moving',
      description: 'A practical message on staying steadfast when answers feel delayed.',
      category: 'Sermon',
      thumbnail:
        'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&h=800&fit=crop',
      mediaUrl: SAMPLE_MEDIA_URL,
      author: 'Pastor Michael',
      duration: '34 min',
      type: 'video',
      source: 'fallback',
    },
    {
      id: 'fallback-sermon-2',
      title: 'Grace for the Journey',
      description: 'A teaching on how grace sustains believers in every season.',
      category: 'Teaching',
      thumbnail:
        'https://images.unsplash.com/photo-1515165562835-c4c9958f4a2d?w=1200&h=800&fit=crop',
      mediaUrl: SAMPLE_MEDIA_URL,
      author: 'MOWDMIN TV',
      duration: '29 min',
      type: 'video',
      source: 'fallback',
    },
    {
      id: 'fallback-sermon-3',
      title: 'The Power of Thanksgiving',
      description: 'Biblical insight on praise, perspective, and breakthrough.',
      category: 'Sunday Message',
      thumbnail:
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&h=800&fit=crop',
      mediaUrl: SAMPLE_MEDIA_URL,
      author: 'Rev. Daniel',
      duration: '41 min',
      type: 'video',
      source: 'fallback',
    },
    {
      id: 'fallback-sermon-4',
      title: 'Kingdom Discipline',
      description: 'A focused sermon on consistency, obedience, and spiritual maturity.',
      category: 'Sermon Series',
      thumbnail:
        'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?w=1200&h=800&fit=crop',
      mediaUrl: SAMPLE_MEDIA_URL,
      author: 'Bishop Samuel',
      duration: '38 min',
      type: 'video',
      source: 'fallback',
    },
  ],
};

const normalizeText = (...parts: Array<string | undefined>) =>
  parts
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

const toFaithMediaItem = (item: MediaItemAPI): FaithMediaItem => ({
  id: item._id,
  title: item.title,
  description: item.description,
  category: item.category_id?.name || 'Media',
  thumbnail: item.thumbnail || DEFAULT_THUMBNAIL,
  mediaUrl: item.media_url,
  author: item.author,
  duration: item.duration,
  type: item.type,
  isLive: item.isLive,
  createdAt: item.createdAt,
  source: 'media-api',
});

const matchesType = (item: FaithMediaItem, type: FaithMediaType) => {
  const haystack = normalizeText(item.title, item.description, item.category, item.type, item.author);
  return KEYWORDS[type].some((keyword) => haystack.includes(keyword));
};

const sortContent = (items: FaithMediaItem[]) => {
  return [...items].sort((a, b) => {
    if (a.isLive && !b.isLive) return -1;
    if (!a.isLive && b.isLive) return 1;

    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });
};

const getContentByType = async (type: FaithMediaType): Promise<FaithMediaItem[]> => {
  try {
    const response = await mediaAPI.getAllMedia();
    const mediaItems = Array.isArray(response.data) ? response.data.map(toFaithMediaItem) : [];
    const filtered = mediaItems.filter((item) => matchesType(item, type));

    if (filtered.length > 0) {
      return sortContent(filtered);
    }
  } catch (error) {
    console.log(`[faithMediaAPI] Falling back to local ${type} content`, error);
  }

  return sortContent(fallbackContent[type]);
};

export const faithMediaAPI = {
  getGospelMusic: () => getContentByType('gospelMusic'),
  getSermons: () => getContentByType('sermon'),
};

export default faithMediaAPI;
