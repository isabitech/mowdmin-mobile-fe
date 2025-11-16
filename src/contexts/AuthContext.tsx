import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/auth';
import { AuthContextType, RegisterRequest, User, UserProfile } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Load auth data on app start
  useEffect(() => {
    loadAuthData();
  }, []);

  const loadAuthData = async () => {
    try {
      setIsLoading(true);
      const [storedToken, storedUser, storedProfile] = await Promise.all([
        AsyncStorage.getItem('auth_token'),
        AsyncStorage.getItem('user_data'),
        AsyncStorage.getItem('user_profile'),
      ]);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        if (storedProfile) {
          setProfile(JSON.parse(storedProfile));
        }
      }
    } catch (error) {
      console.error('Error loading auth data:', error);
      // Clear potentially corrupted data
      await clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  const saveAuthData = async (authResponse: { user: User; token: string }, userProfile?: UserProfile) => {
    try {
      await Promise.all([
        AsyncStorage.setItem('auth_token', authResponse.token),
        AsyncStorage.setItem('user_data', JSON.stringify(authResponse.user)),
        userProfile ? AsyncStorage.setItem('user_profile', JSON.stringify(userProfile)) : Promise.resolve(),
      ]);

      setToken(authResponse.token);
      setUser(authResponse.user);
      if (userProfile) {
        setProfile(userProfile);
      }
    } catch (error) {
      console.error('Error saving auth data:', error);
      throw new Error('Failed to save authentication data');
    }
  };

  const clearAuthData = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem('auth_token'),
        AsyncStorage.removeItem('user_data'),
        AsyncStorage.removeItem('user_profile'),
      ]);

      setToken(null);
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authApi.login({ email, password });
      
      if (response.success && response.data) {
        await saveAuthData(response.data);
        
        // Try to load user profile if it exists
        try {
          const profileResponse = await authApi.getProfile(response.data.user.id);
          if (profileResponse.success && profileResponse.data) {
            await AsyncStorage.setItem('user_profile', JSON.stringify(profileResponse.data));
            setProfile(profileResponse.data);
          }
        } catch (profileError) {
          // Profile might not exist yet, which is OK
          console.log('No profile found, will create later');
        }
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.error || error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      setIsLoading(true);
      const response = await authApi.register(data);
      
      if (response.success) {
        // Don't save auth data yet - wait for email verification
        return response; // Return response for access to user data
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.response?.data?.error || error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (email: string, otp: string) => {
    try {
      setIsLoading(true);
      const response = await authApi.verifyEmail(email, otp);
      
      if (response.success && response.data) {
        // Now save auth data after successful verification
        await saveAuthData(response.data);
        
        // Try to load user profile if it exists
        try {
          const profileResponse = await authApi.getProfile(response.data.user.id);
          if (profileResponse.success && profileResponse.data) {
            await AsyncStorage.setItem('user_profile', JSON.stringify(profileResponse.data));
            setProfile(profileResponse.data);
          }
        } catch (profileError) {
          console.log('No profile found, will create later');
        }
      } else {
        throw new Error(response.error || 'Email verification failed');
      }
    } catch (error: any) {
      console.error('Email verification error:', error);
      throw new Error(error.response?.data?.error || error.message || 'Email verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async (email: string) => {
    try {
      setIsLoading(true);
      const response = await authApi.resendVerification(email);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to resend verification code');
      }
    } catch (error: any) {
      console.error('Resend verification error:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to resend verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await clearAuthData();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: any) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      setIsLoading(true);
      const response = await authApi.createProfile(user.id, data);
      
      if (response.success && response.data) {
        await AsyncStorage.setItem('user_profile', JSON.stringify(response.data));
        setProfile(response.data);
      } else {
        throw new Error(response.error || 'Profile update failed');
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      throw new Error(error.response?.data?.error || error.message || 'Profile update failed');
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    verifyEmail,
    resendVerification,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};