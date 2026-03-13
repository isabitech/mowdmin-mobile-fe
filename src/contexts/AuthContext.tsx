import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, setUnauthorizedHandler, UnauthorizedError } from '../services/api';

interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
}

interface AuthContextType {
  isLoading: boolean;
  isFirstTime: boolean;
  isAuthenticated: boolean;
  user: User | null;
  setIsFirstTime: (value: boolean) => void;
  setIsAuthenticated: (value: boolean) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<any>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  resendOTP: (email: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  IS_FIRST_TIME: '@app:isFirstTime',
  IS_AUTHENTICATED: '@app:isAuthenticated',
  USER_DATA: '@app:userData',
  TOKEN: '@app:token',
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstTime, setIsFirstTimeState] = useState(true);
  const [isAuthenticated, setIsAuthenticatedState] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  // Use ref to track if we're already handling an unauthorized error
  const handlingUnauthorized = useRef(false);

  useEffect(() => {
    checkAuthState();
  }, []);

  useEffect(() => {
    // Set up the unauthorized handler for the API interceptor
    setUnauthorizedHandler(handleUnauthorized);
  }, []);

  const checkAuthState = async () => {
    try {
      const [firstTimeValue, authValue, userData, token] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.IS_FIRST_TIME),
        AsyncStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED),
        AsyncStorage.getItem(STORAGE_KEYS.USER_DATA),
        AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
      ]);

      setIsFirstTimeState(firstTimeValue === null);
      
      if (authValue === 'true' && token && userData) {
        const parsed = JSON.parse(userData);
        // Normalize: backend returns _id, ensure id is always set
        const normalizedUser = { ...parsed, id: parsed.id || parsed._id };
        setIsAuthenticatedState(true);
        setUser(normalizedUser);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnauthorized = async () => {
    // Prevent multiple simultaneous calls
    if (handlingUnauthorized.current) {
      return;
    }

    handlingUnauthorized.current = true;

    try {
      // Clear the auth state
      setUser(null);
      setIsAuthenticatedState(false);

      // Note: Storage is already cleared by the API interceptor
      // If you're using React Navigation, you can navigate here:
      // navigationRef.current?.reset({
      //   index: 0,
      //   routes: [{ name: 'Login' }],
      // });
      
      console.log('Session expired - user logged out');
    } finally {
      handlingUnauthorized.current = false;
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.IS_FIRST_TIME, 'false');
      setIsFirstTimeState(false);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const setIsFirstTime = (value: boolean) => {
    setIsFirstTimeState(value);
  };

  const setIsAuthenticated = async (value: boolean) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, value.toString());
      setIsAuthenticatedState(value);
    } catch (error) {
      console.error('Error setting authentication:', error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await authAPI.register(name, email, password);
      return response;
    } catch (error: any) {
      console.error('Error registering:', error);
      
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    try {
      const response = await authAPI.verifyOTP(email, otp);

      const { data } = response;
      const { token, user: userData } = data;
      // Normalize: backend returns _id, ensure id is also set
      const normalizedUser = { ...userData, id: userData.id || userData._id };

      await AsyncStorage.multiSet([
        [STORAGE_KEYS.TOKEN, token],
        [STORAGE_KEYS.IS_AUTHENTICATED, 'true'],
        [STORAGE_KEYS.USER_DATA, JSON.stringify(normalizedUser)],
      ]);

      setUser(normalizedUser);
      setIsAuthenticatedState(true);
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      
      throw new Error(error.response?.data?.message || 'OTP verification failed');
    }
  };

  const resendOTP = async (email: string) => {
    try {
      await authAPI.resendOTP(email);
    } catch (error: any) {
      console.error('Error resending OTP:', error);
      
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      
      throw new Error(error.response?.data?.message || 'Failed to resend OTP');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);

      const { data } = response;
      const { token, user: userData } = data;
      // Normalize: backend returns _id, ensure id is also set
      const normalizedUser = { ...userData, id: userData.id || userData._id };

      await AsyncStorage.multiSet([
        [STORAGE_KEYS.TOKEN, token],
        [STORAGE_KEYS.IS_AUTHENTICATED, 'true'],
        [STORAGE_KEYS.USER_DATA, JSON.stringify(normalizedUser)],
      ]);

      setUser(normalizedUser);
      setIsAuthenticatedState(true);
    } catch (error: any) {
      console.error('Error logging in:', error);
      
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Error calling logout API:', error);
      // Continue with local cleanup even if API call fails
    } finally {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.TOKEN,
        STORAGE_KEYS.IS_AUTHENTICATED,
        STORAGE_KEYS.USER_DATA,
      ]);
      setUser(null);
      setIsAuthenticatedState(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isFirstTime,
        isAuthenticated,
        user,
        setIsFirstTime,
        setIsAuthenticated,
        register,
        verifyOTP,
        resendOTP,
        login,
        logout,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};