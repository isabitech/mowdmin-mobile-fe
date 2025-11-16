import { useMutation } from '@tanstack/react-query';
import { authApi } from '../src/api/auth';
import { ResetPasswordRequest } from '../src/types/auth';

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => authApi.resetPassword(data),
    onSuccess: (response) => {
      if (!response.success) {
        throw new Error(response.error || 'Password reset failed');
      }
    },
    onError: (error: any) => {
      console.error('Reset password error:', error);
    },
  });
};

export default useResetPassword;