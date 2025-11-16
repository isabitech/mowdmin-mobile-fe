import { useMutation } from '@tanstack/react-query';
import { authApi } from '../../src/api/auth';
import { LoginRequest } from '../../src/types/auth';

export const useLogin = () => {
  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      if (!response.success) {
        throw new Error(response.error || 'Login failed');
      }
    },
    onError: (error: any) => {
      console.error('Login error:', error);
      // You can add toast notifications here
    },
  });
};

export default useLogin;