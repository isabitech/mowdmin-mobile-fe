import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Get base URL from environment
const BASE_URL = process.env.WEB_API_URL || 'http://localhost:3000';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // If token is expired or invalid, clear it and redirect to login
    if (error.response?.status === 401) {
      try {
        await AsyncStorage.removeItem('auth_token');
        await AsyncStorage.removeItem('user_data');
      } catch (storageError) {
        console.error('Error clearing auth data:', storageError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
