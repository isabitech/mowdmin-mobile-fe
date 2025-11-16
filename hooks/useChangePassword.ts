import { useMutation } from '@tanstack/react-query';
import { authApi } from '../src/api/auth';
import { ChangePasswordRequest } from '../src/types/auth';

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => authApi.changePassword(data),
    onSuccess: (response) => {
      if (!response.success) {
        throw new Error(response.error || 'Password change failed');
      }
    },
    onError: (error: any) => {
      console.error('Change password error:', error);
    },
  });
};

export default useChangePassword;