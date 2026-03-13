import apiClient from './api';

export interface Profile {
  id: string;
  name: string;
  email: string;
  photo?: string;
  language?: string;
  displayName?: string;
  bio?: string;
  phoneNumber?: string;
  location?: string;
  ministryRole?: string;
  createdAt?: string;
  updatedAt?: string;
}

const BACKEND_URL = 'https://mowdmin-mobile-be-qwo0.onrender.com';

const fixPhotoUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  // Backend returns localhost URL — replace with deployed URL
  if (trimmed.includes('localhost')) {
    return trimmed.replace(/http:\/\/localhost:\d+/, BACKEND_URL);
  }
  // If it's a relative path like /uploads/..., prepend the backend URL
  if (trimmed.startsWith('/uploads')) {
    return `${BACKEND_URL}${trimmed}`;
  }
  // If it's just a filename or partial path without protocol
  if (!trimmed.startsWith('http') && !trimmed.startsWith('data:')) {
    return `${BACKEND_URL}/uploads/${trimmed}`;
  }
  return trimmed;
};

const transformProfile = (data: any): Profile => {
  // Backend populates userId with the User object { id, name, email }
  const user = typeof data.userId === 'object' ? data.userId : null;
  const rawPhoto = data.photoUrl || data.photo || data.avatar || data.profileImage || '';
  return {
    id: data._id || data.id,
    name: data.name || user?.name || '',
    email: data.email || user?.email || '',
    photo: fixPhotoUrl(rawPhoto),
    language: data.language || 'EN',
    displayName: data.displayName || data.name || user?.name || '',
    bio: data.bio || '',
    phoneNumber: data.phoneNumber || data.phone_number || data.phone || '',
    location: data.location || '',
    ministryRole: data.ministryRole || data.role || '',
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

export const profileAPI = {
  getProfile: async (): Promise<Profile> => {
    const response = await apiClient.get('/auth/profile');
    console.log('[ProfileAPI] Raw response:', JSON.stringify(response.data, null, 2));
    const data = response.data?.data || response.data;
    console.log('[ProfileAPI] Extracted data:', JSON.stringify(data, null, 2));
    console.log('[ProfileAPI] photoUrl field:', data?.photoUrl);
    const result = transformProfile(data);
    console.log('[ProfileAPI] Final photo URL:', result.photo);
    return result;
  },

  updateProfile: async (updates: { name?: string; language?: string; photo?: string }): Promise<Profile> => {
    const response = await apiClient.put('/auth/profile', updates);
    const data = response.data?.data || response.data;
    return transformProfile(data);
  },

  updateDetailedProfile: async (updates: {
    displayName?: string;
    bio?: string;
    phoneNumber?: string;
    location?: string;
    ministryRole?: string;
    name?: string;
    language?: string;
    photo?: string;
  }): Promise<Profile> => {
    // Backend schema uses phone_number (underscore), not phoneNumber
    const { phoneNumber, ...rest } = updates;
    const payload = { ...rest, ...(phoneNumber !== undefined && { phone_number: phoneNumber }) };
    const response = await apiClient.put('/auth/profile', payload);
    const data = response.data?.data || response.data;
    return transformProfile(data);
  },

  changePassword: async (email: string, currentPassword: string, newPassword: string): Promise<any> => {
    const response = await apiClient.post('/auth/change-password', {
      email,
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  uploadProfilePhoto: async (uri: string): Promise<Profile> => {
    const formData = new FormData();
    const filename = uri.split('/').pop() || 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('photo', {
      uri,
      name: filename,
      type,
    } as any);

    const response = await apiClient.put('/auth/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log('[ProfileAPI] Upload response:', JSON.stringify(response.data, null, 2));
    const data = response.data?.data || response.data;
    console.log('[ProfileAPI] Upload photoUrl:', data?.photoUrl);
    return transformProfile(data);
  },

  deleteProfile: async (): Promise<any> => {
    const response = await apiClient.delete('/auth/profile');
    return response.data;
  },
};
