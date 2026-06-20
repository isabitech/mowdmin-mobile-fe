import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './api';

export interface TestimonyAuthor {
  _id: string;
  name: string;
  avatar?: string;
  role?: string;
}

export interface Testimony {
  _id: string;
  userId: string;
  title: string;
  description: string;
  isPublic: boolean;
  likeCount?: number;
  commentCount?: number;
  createdAt: string;
  updatedAt: string;
  author?: TestimonyAuthor;
  isLiked?: boolean;
}

export interface TestimonyComment {
  _id: string;
  userId: string | { _id: string; name?: string; email?: string; photo?: string };
  testimonyId: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    _id: string;
    name: string;
    avatar?: string;
  };
}

interface ApiListResponse<T> {
  status: string;
  message: string;
  data: T[];
  meta?: Record<string, unknown>;
}

interface ApiSingleResponse<T> {
  status: string;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
}

interface TestimonyLikeResponse {
  status: string;
  message: string;
  data: {
    testimony: Testimony;
    liked: boolean;
  };
  meta?: Record<string, unknown>;
}

export interface CreateTestimonyData {
  title: string;
  description: string;
  isPublic?: boolean;
}

interface FallbackUserContext {
  _id: string;
  name: string;
  avatar?: string;
}

const STORAGE_KEYS = {
  TESTIMONIES: '@app:testimonies:data',
  COMMENTS: '@app:testimonies:comments',
  LIKES: '@app:testimonies:likes',
};

const sampleTestimonies: Testimony[] = [
  {
    _id: 'sample-testimony-1',
    userId: 'sample-user-1',
    title: 'God came through for my family',
    description:
      'After months of praying for peace at home, the Lord restored love and understanding in our family. I share this so someone else can hold on to hope.',
    isPublic: true,
    likeCount: 12,
    commentCount: 2,
    createdAt: '2026-04-20T09:30:00.000Z',
    updatedAt: '2026-04-20T09:30:00.000Z',
    author: {
      _id: 'sample-user-1',
      name: 'Sarah A.',
    },
    isLiked: false,
  },
  {
    _id: 'sample-testimony-2',
    userId: 'sample-user-2',
    title: 'Provision arrived right on time',
    description:
      'I was trusting God for school fees, and help came in the same week we prayed about it. Truly, He still provides.',
    isPublic: true,
    likeCount: 8,
    commentCount: 1,
    createdAt: '2026-04-18T15:00:00.000Z',
    updatedAt: '2026-04-18T15:00:00.000Z',
    author: {
      _id: 'sample-user-2',
      name: 'David O.',
    },
    isLiked: false,
  },
  {
    _id: 'sample-testimony-3',
    userId: 'sample-user-3',
    title: 'Healing after a long season',
    description:
      'I want to testify that God strengthened me through recovery and gave me a new song. Keep believing even when the journey feels slow.',
    isPublic: true,
    likeCount: 17,
    commentCount: 0,
    createdAt: '2026-04-16T07:10:00.000Z',
    updatedAt: '2026-04-16T07:10:00.000Z',
    author: {
      _id: 'sample-user-3',
      name: 'Esther K.',
    },
    isLiked: false,
  },
];

const sampleComments: Record<string, TestimonyComment[]> = {
  'sample-testimony-1': [
    {
      _id: 'sample-comment-1',
      userId: { _id: 'sample-user-4', name: 'Peter C.' },
      testimonyId: 'sample-testimony-1',
      comment: 'This encouraged me today. Thank you for sharing.',
      createdAt: '2026-04-20T11:00:00.000Z',
      updatedAt: '2026-04-20T11:00:00.000Z',
      author: {
        _id: 'sample-user-4',
        name: 'Peter C.',
      },
    },
    {
      _id: 'sample-comment-2',
      userId: { _id: 'sample-user-5', name: 'Grace F.' },
      testimonyId: 'sample-testimony-1',
      comment: 'Glory to God. I receive this as a reminder to keep trusting.',
      createdAt: '2026-04-20T12:15:00.000Z',
      updatedAt: '2026-04-20T12:15:00.000Z',
      author: {
        _id: 'sample-user-5',
        name: 'Grace F.',
      },
    },
  ],
  'sample-testimony-2': [
    {
      _id: 'sample-comment-3',
      userId: { _id: 'sample-user-6', name: 'Mary T.' },
      testimonyId: 'sample-testimony-2',
      comment: 'God is faithful. Thank you for strengthening our faith.',
      createdAt: '2026-04-18T16:30:00.000Z',
      updatedAt: '2026-04-18T16:30:00.000Z',
      author: {
        _id: 'sample-user-6',
        name: 'Mary T.',
      },
    },
  ],
};

const sortNewestFirst = <T extends { createdAt: string }>(items: T[]) =>
  [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

const generateId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const isNotFoundError = (error: any) => {
  const status = error?.response?.status;
  return status === 404 || status === 405 || status === 501;
};

class TestimoniesAPI {
  private async ensureFallbackSeeded() {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.TESTIMONIES);
    if (!stored) {
      await AsyncStorage.setItem(STORAGE_KEYS.TESTIMONIES, JSON.stringify(sampleTestimonies));
    }

    const storedComments = await AsyncStorage.getItem(STORAGE_KEYS.COMMENTS);
    if (!storedComments) {
      await AsyncStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(sampleComments));
    }

    const storedLikes = await AsyncStorage.getItem(STORAGE_KEYS.LIKES);
    if (!storedLikes) {
      await AsyncStorage.setItem(STORAGE_KEYS.LIKES, JSON.stringify({}));
    }
  }

  private async readTestimonies(): Promise<Testimony[]> {
    await this.ensureFallbackSeeded();
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.TESTIMONIES);
    return raw ? (JSON.parse(raw) as Testimony[]) : [];
  }

  private async writeTestimonies(items: Testimony[]) {
    await AsyncStorage.setItem(STORAGE_KEYS.TESTIMONIES, JSON.stringify(items));
  }

  private async readComments(): Promise<Record<string, TestimonyComment[]>> {
    await this.ensureFallbackSeeded();
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.COMMENTS);
    return raw ? (JSON.parse(raw) as Record<string, TestimonyComment[]>) : {};
  }

  private async writeComments(items: Record<string, TestimonyComment[]>) {
    await AsyncStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(items));
  }

  private async readLikes(): Promise<Record<string, string[]>> {
    await this.ensureFallbackSeeded();
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.LIKES);
    return raw ? (JSON.parse(raw) as Record<string, string[]>) : {};
  }

  private async writeLikes(items: Record<string, string[]>) {
    await AsyncStorage.setItem(STORAGE_KEYS.LIKES, JSON.stringify(items));
  }

  async getAllPublicTestimonies(): Promise<Testimony[]> {
    try {
      const response = await apiClient.get<ApiListResponse<Testimony>>('/testimony');
      return sortNewestFirst(response.data.data || []);
    } catch (error) {
      if (!isNotFoundError(error)) {
        console.error('[testimoniesAPI] getAllPublicTestimonies fallback:', error);
      }

      const testimonies = await this.readTestimonies();
      return sortNewestFirst(testimonies.filter((item) => item.isPublic !== false));
    }
  }

  async getMyTestimonies(userId?: string): Promise<Testimony[]> {
    try {
      const response = await apiClient.get<ApiListResponse<Testimony>>('/testimony/user');
      return sortNewestFirst(response.data.data || []);
    } catch (error) {
      if (!isNotFoundError(error)) {
        console.error('[testimoniesAPI] getMyTestimonies fallback:', error);
      }

      if (!userId) {
        return [];
      }

      const testimonies = await this.readTestimonies();
      return sortNewestFirst(testimonies.filter((item) => item.userId === userId));
    }
  }

  async createTestimony(
    data: CreateTestimonyData,
    fallbackUser?: FallbackUserContext
  ): Promise<Testimony> {
    try {
      const response = await apiClient.post<ApiSingleResponse<Testimony>>('/testimony/create', data);
      return response.data.data;
    } catch (error) {
      if (!isNotFoundError(error)) {
        console.error('[testimoniesAPI] createTestimony fallback:', error);
      }

      const testimonies = await this.readTestimonies();
      const now = new Date().toISOString();
      const created: Testimony = {
        _id: generateId('testimony'),
        userId: fallbackUser?._id || 'local-user',
        title: data.title.trim(),
        description: data.description.trim(),
        isPublic: data.isPublic ?? true,
        likeCount: 0,
        commentCount: 0,
        createdAt: now,
        updatedAt: now,
        author: fallbackUser
          ? {
              _id: fallbackUser._id,
              name: fallbackUser.name,
              avatar: fallbackUser.avatar,
            }
          : {
              _id: 'local-user',
              name: 'You',
            },
        isLiked: false,
      };

      await this.writeTestimonies([created, ...testimonies]);
      return created;
    }
  }

  async updateTestimony(
    testimonyId: string,
    data: Partial<CreateTestimonyData>
  ): Promise<Testimony> {
    try {
      const response = await apiClient.put<ApiSingleResponse<Testimony>>(
        `/testimony/${testimonyId}`,
        data
      );
      return response.data.data;
    } catch (error) {
      if (!isNotFoundError(error)) {
        console.error('[testimoniesAPI] updateTestimony fallback:', error);
      }

      const testimonies = await this.readTestimonies();
      let updated: Testimony | null = null;

      const nextItems = testimonies.map((item) => {
        if (item._id !== testimonyId) {
          return item;
        }

        updated = {
          ...item,
          title: data.title?.trim() || item.title,
          description: data.description?.trim() || item.description,
          isPublic: data.isPublic ?? item.isPublic,
          updatedAt: new Date().toISOString(),
        };

        return updated;
      });

      if (!updated) {
        throw new Error('Testimony not found');
      }

      await this.writeTestimonies(nextItems);
      return updated;
    }
  }

  async deleteTestimony(testimonyId: string): Promise<void> {
    try {
      await apiClient.delete(`/testimony/${testimonyId}`);
      return;
    } catch (error) {
      if (!isNotFoundError(error)) {
        console.error('[testimoniesAPI] deleteTestimony fallback:', error);
      }
    }

    const testimonies = await this.readTestimonies();
    const comments = await this.readComments();
    const likes = await this.readLikes();

    await this.writeTestimonies(testimonies.filter((item) => item._id !== testimonyId));

    if (comments[testimonyId]) {
      delete comments[testimonyId];
      await this.writeComments(comments);
    }

    if (likes[testimonyId]) {
      delete likes[testimonyId];
      await this.writeLikes(likes);
    }
  }

  async toggleTestimonyLike(
    testimonyId: string,
    userId?: string
  ): Promise<{ liked: boolean; likeCount: number }> {
    try {
      const response = await apiClient.post<TestimonyLikeResponse>(
        `/testimony-like/${testimonyId}/like`
      );
      const { testimony, liked } = response.data.data;
      return { liked, likeCount: testimony?.likeCount || 0 };
    } catch (error) {
      if (!isNotFoundError(error)) {
        console.error('[testimoniesAPI] toggleTestimonyLike fallback:', error);
      }
    }

    const actorId = userId || 'local-user';
    const testimonies = await this.readTestimonies();
    const likes = await this.readLikes();
    const currentLikes = likes[testimonyId] || [];
    const liked = !currentLikes.includes(actorId);

    likes[testimonyId] = liked
      ? [...currentLikes, actorId]
      : currentLikes.filter((item) => item !== actorId);

    let likeCount = 0;
    const nextItems = testimonies.map((item) => {
      if (item._id !== testimonyId) {
        return item;
      }

      likeCount = likes[testimonyId].length;
      return {
        ...item,
        likeCount,
        isLiked: liked,
      };
    });

    await Promise.all([this.writeLikes(likes), this.writeTestimonies(nextItems)]);
    return { liked, likeCount };
  }

  async getComments(testimonyId: string): Promise<TestimonyComment[]> {
    try {
      const response = await apiClient.get<ApiListResponse<TestimonyComment>>(
        `/testimony-comment/${testimonyId}/comments`
      );
      const data = response.data.data as unknown as
        | TestimonyComment[]
        | { comments?: TestimonyComment[] };
      return Array.isArray(data) ? data : data?.comments || [];
    } catch (error) {
      if (!isNotFoundError(error)) {
        console.error('[testimoniesAPI] getComments fallback:', error);
      }
    }

    const comments = await this.readComments();
    return comments[testimonyId] || [];
  }

  async addComment(
    testimonyId: string,
    comment: string,
    fallbackUser?: FallbackUserContext
  ): Promise<TestimonyComment> {
    try {
      const response = await apiClient.post<ApiSingleResponse<TestimonyComment>>(
        `/testimony-comment/${testimonyId}/comment`,
        { comment }
      );
      return response.data.data;
    } catch (error) {
      if (!isNotFoundError(error)) {
        console.error('[testimoniesAPI] addComment fallback:', error);
      }
    }

    const actor = fallbackUser || { _id: 'local-user', name: 'You' };
    const comments = await this.readComments();
    const testimonies = await this.readTestimonies();
    const now = new Date().toISOString();
    const newComment: TestimonyComment = {
      _id: generateId('comment'),
      userId: actor._id,
      testimonyId,
      comment: comment.trim(),
      createdAt: now,
      updatedAt: now,
      author: {
        _id: actor._id,
        name: actor.name,
        avatar: actor.avatar,
      },
    };

    const currentComments = comments[testimonyId] || [];
    comments[testimonyId] = [...currentComments, newComment];

    const nextItems = testimonies.map((item) =>
      item._id === testimonyId
        ? {
            ...item,
            commentCount: (item.commentCount || 0) + 1,
          }
        : item
    );

    await Promise.all([this.writeComments(comments), this.writeTestimonies(nextItems)]);
    return newComment;
  }

  async deleteComment(commentId: string, testimonyId?: string): Promise<void> {
    try {
      await apiClient.delete(`/testimony-comment/${commentId}`);
      return;
    } catch (error) {
      if (!isNotFoundError(error)) {
        console.error('[testimoniesAPI] deleteComment fallback:', error);
      }
    }

    const comments = await this.readComments();
    const testimonies = await this.readTestimonies();
    let matchedTestimonyId = testimonyId || '';

    const nextComments = Object.fromEntries(
      Object.entries(comments).map(([key, value]) => {
        const filtered = value.filter((item) => item._id !== commentId);
        if (filtered.length !== value.length && !matchedTestimonyId) {
          matchedTestimonyId = key;
        }
        return [key, filtered];
      })
    );

    const nextItems = matchedTestimonyId
      ? testimonies.map((item) =>
          item._id === matchedTestimonyId
            ? {
                ...item,
                commentCount: Math.max(0, (item.commentCount || 1) - 1),
              }
            : item
        )
      : testimonies;

    await Promise.all([this.writeComments(nextComments), this.writeTestimonies(nextItems)]);
  }
}

export const testimoniesAPI = new TestimoniesAPI();
export default testimoniesAPI;
