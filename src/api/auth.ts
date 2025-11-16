import axiosInstance from '../../utils/axiosInstance';
import {
    ApiResponse,
    AuthResponse,
    ChangePasswordRequest,
    CreateProfileRequest,
    ForgotPasswordRequest,
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
    SignupResponse,
    UserProfile,
} from '../types/auth';

const AUTH_BASE_URL = '/api/auth';

export const authApi = {
  // User Registration
  register: async (data: RegisterRequest): Promise<SignupResponse> => {
    const response = await axiosInstance.post(`${AUTH_BASE_URL}/register`, data);
    return response.data;
  },

  // Email Verification
  verifyEmail: async (email: string, otp: string): Promise<ApiResponse<AuthResponse>> => {
    const response = await axiosInstance.post(`${AUTH_BASE_URL}/verify-email`, { email, otp });
    return response.data;
  },

  // Resend Verification Code
  resendVerification: async (email: string): Promise<ApiResponse> => {
    const response = await axiosInstance.post(`${AUTH_BASE_URL}/resend-verification`, { email });
    return response.data;
  },

  // User Login
  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await axiosInstance.post(`${AUTH_BASE_URL}/login`, data);
    return response.data;
  },

  // Forgot Password
  forgotPassword: async (data: ForgotPasswordRequest): Promise<ApiResponse> => {
    const response = await axiosInstance.post(`${AUTH_BASE_URL}/forgot-password`, data);
    return response.data;
  },

  // Reset Password
  resetPassword: async (data: ResetPasswordRequest): Promise<ApiResponse> => {
    const response = await axiosInstance.post(`${AUTH_BASE_URL}/reset-password`, data);
    return response.data;
  },

  // Change Password
  changePassword: async (data: ChangePasswordRequest): Promise<ApiResponse> => {
    const response = await axiosInstance.post(`${AUTH_BASE_URL}/change-password`, data);
    return response.data;
  },

  // Create/Update Profile
  createProfile: async (userId: string, data: CreateProfileRequest): Promise<ApiResponse<UserProfile>> => {
    const response = await axiosInstance.post(`${AUTH_BASE_URL}/profile/${userId}`, data);
    return response.data;
  },

  // Get Current User Profile (if needed)
  getProfile: async (userId: string): Promise<ApiResponse<UserProfile>> => {
    const response = await axiosInstance.get(`${AUTH_BASE_URL}/profile/${userId}`);
    return response.data;
  },
};