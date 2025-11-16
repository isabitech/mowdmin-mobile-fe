// Authentication Types
export interface User {
  id: string;
  name: string;
  email: string;
  language: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  emailVerifiedAt: any;
}

export interface UserProfile {
  id: string;
  userId: string;
  displayName?: string;
  bio?: string;
  location?: string;
  phoneNumber?: string;
  birthdate?: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: string[];
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Signup specific types
export interface SignupResponse {
  success: boolean;
  message: string;
  data: SignupResponseData;
}

export interface SignupResponseData {
  user: User;
  token: string;
  message: string;
}

// Request Types
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface CreateProfileRequest {
  displayName?: string;
  bio?: string;
  location?: string;
  phoneNumber?: string;
  birthdate?: string;
  photoUrl?: string;
}

// Auth Context Types
export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<SignupResponse>;
  verifyEmail: (email: string, otp: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: CreateProfileRequest) => Promise<void>;
}

// Hook Return Types
export interface UseAuthMutation<TData, TVariables> {
  mutate: (variables: TVariables) => void;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  isLoading: boolean;
  error: Error | null;
  isError: boolean;
  isSuccess: boolean;
  data: TData | undefined;
  reset: () => void;
}