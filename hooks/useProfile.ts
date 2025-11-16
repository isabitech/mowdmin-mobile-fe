import { useMutation, useQuery } from '@tanstack/react-query';
import { authApi } from '../src/api/auth';
import { useAuth } from '../src/contexts/AuthContext';
import { CreateProfileRequest } from '../src/types/auth';

export const useCreateProfile = () => {
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (data: CreateProfileRequest) => {
      if (!user) throw new Error('User not authenticated');
      return authApi.createProfile(user.id, data);
    },
    onSuccess: (response) => {
      if (!response.success) {
        throw new Error(response.error || 'Profile creation failed');
      }
    },
    onError: (error: any) => {
      console.error('Profile creation error:', error);
    },
  });
};

export const useGetProfile = (userId?: string) => {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;
  
  return useQuery({
    queryKey: ['profile', targetUserId],
    queryFn: () => {
      if (!targetUserId) throw new Error('No user ID provided');
      return authApi.getProfile(targetUserId);
    },
    enabled: !!targetUserId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export default { useCreateProfile, useGetProfile };