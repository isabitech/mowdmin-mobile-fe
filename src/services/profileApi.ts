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

const transformProfile = (data: any): Profile => {
  return {
    id: data._id || data.id,
    name: data.name || '',
    email: data.email || '',
    photo: data.photo || data.avatar || data.profileImage || '',
    language: data.language || 'EN',
    displayName: data.displayName || data.name || '',
    bio: data.bio || '',
    phoneNumber: data.phoneNumber || data.phone || '',
    location: data.location || '',
    ministryRole: data.ministryRole || data.role || '',
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

export const profileAPI = {
  getProfile: async (): Promise<Profile> => {
    const response = await apiClient.get('/profile');
    const data = response.data?.data || response.data;
    return transformProfile(data);
  },

  updateProfile: async (updates: { name?: string; language?: string; photo?: string }): Promise<Profile> => {
    const response = await apiClient.put('/profile', updates);
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
    // Try the main profile endpoint with all fields
    const response = await apiClient.put('/profile', updates);
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
    const data = response.data?.data || response.data;
    return transformProfile(data);
  },

  deleteProfile: async (): Promise<any> => {
    const response = await apiClient.delete('/auth/profile');
    return response.data;
  },
};
