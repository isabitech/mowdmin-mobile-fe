import { useMutation } from '@tanstack/react-query';
import { authApi } from '../src/api/auth';
import { ForgotPasswordRequest } from '../src/types/auth';

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) => authApi.forgotPassword(data),
    onSuccess: (response) => {
      if (!response.success) {
        throw new Error(response.error || 'Failed to send reset email');
      }
    },
    onError: (error: any) => {
      console.error('Forgot password error:', error);
    },
  });
};

export default useForgotPassword;