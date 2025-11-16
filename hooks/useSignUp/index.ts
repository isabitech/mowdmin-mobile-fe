import { useMutation } from '@tanstack/react-query';
import { authApi } from '../../src/api/auth';
import { RegisterRequest } from '../../src/types/auth';

export const useSignUp = () => {
  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (response) => {
      if (!response.success) {
        throw new Error(response.error || 'Registration failed');
      }
    },
    onError: (error: any) => {
      console.error('Registration error:', error);
      // You can add toast notifications here
    },
  });
};

export default useSignUp;