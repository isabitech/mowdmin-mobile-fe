import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// const API_BASE_URL = 'http://10.145.205.66:3000/api/v1'; 
const API_BASE_URL = 'https://mowdmin-mobile-be-qwo0.onrender.com/api/v1'; 

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Custom error class for unauthorized access
export class UnauthorizedError extends Error {
  constructor(message: string = 'Session expired. Please log in again.') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

// Callback for handling unauthorized errors
let onUnauthorizedCallback: (() => void) | null = null;

export const setUnauthorizedHandler = (handler: () => void) => {
  onUnauthorizedCallback = handler;
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('@app:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear auth data from storage
      await AsyncStorage.multiRemove([
        '@app:token',
        '@app:isAuthenticated',
        '@app:userData',
      ]);

      // Notify the auth context
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }

      // Return a custom error
      return Promise.reject(new UnauthorizedError());
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  register: async (name: string, email: string, password: string) => {
    const response = await apiClient.post('/auth/register', {
      name,
      email,
      password,
    });
    return response.data;
  },

  verifyOTP: async (email: string, otp: string) => {
    const response = await apiClient.post('/auth/verify-otp', {
      email,
      otp,
    });
    return response.data;
  },

  resendOTP: async (email: string) => {
    const response = await apiClient.post('/auth/resend-otp', {
      email,
    });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (email: string, otp: string, newPassword: string, confirmPassword: string) => {
    const response = await apiClient.post('/auth/reset-password', {
      email,
      otp,
      newPassword,
      confirmPassword,
    });
    return response.data;
  },
};

export default apiClient;