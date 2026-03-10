import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { authAPI } from '../../services/api';
import { useAuth } from '@/contexts';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });

  const { setIsAuthenticated } = useAuth();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleGoHome = async () => {
    await setIsAuthenticated(true);
  };

  const handleLogin = async () => {
    setErrors({ email: '', password: '' });

    let hasError = false;
    const newErrors = { email: '', password: '' };

    if (!email) {
      newErrors.email = 'Email is required';
      hasError = true;
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
      hasError = true;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      hasError = true;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔐 Attempting login...');
      const response = await authAPI.login(email.trim().toLowerCase(), password);
      
      console.log('✅ Login response:', response);
      
      const token = response?.data?.token;
      const user = response?.data?.user;
      
      if (token) {
        await AsyncStorage.setItem('@app:token', token);
        await AsyncStorage.setItem('@app:isAuthenticated', 'true');
        
        if (user) {
          await AsyncStorage.setItem('@app:userData', JSON.stringify(user));
        }

        await handleGoHome();
      } else {
        Alert.alert('Login Failed', 'Invalid response from server. Please try again.');
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);
      
      let errorMessage = 'An error occurred during login. Please try again.';
      
      if (error.response) {
        console.error('Server error response:', error.response.data);
        if (error.response.status === 401) {
          errorMessage = 'Invalid email or password';
        } else if (error.response.status === 403) {
          errorMessage = 'Please verify your email first';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        console.error('Network error - no response received');
        errorMessage = 'Network error. Please check your connection.';
      }

      Alert.alert('Login Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = email && password && !isLoading;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 pt-12">
            {/* Header */}
            <View className="mb-8">
              <Text className="text-[#040725] text-3xl font-bold">Log in</Text>
              <Text className="text-[#040725]/50 text-sm mt-2">
                Don't have an account?{' '}
                <Text
                  className="text-[#0015ff] font-semibold"
                  onPress={() => !isLoading && navigation.navigate('Register')}
                >
                  Sign up
                </Text>
              </Text>
            </View>

            {/* Email Input */}
            <View className="mb-4">
              <View
                className={`flex-row items-center border rounded-xl px-4 py-3.5 ${
                  errors.email 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-[#040725]/20 bg-[#040725]/[0.02]'
                }`}
              >
                <Ionicons 
                  name="mail-outline" 
                  size={20} 
                  color={errors.email ? '#EF4444' : 'rgba(4, 7, 37, 0.4)'} 
                />
                <TextInput
                  className="flex-1 ml-3 text-[#040725] text-base"
                  placeholder="Email"
                  placeholderTextColor="rgba(4, 7, 37, 0.4)"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) {
                      setErrors({ ...errors, email: '' });
                    }
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>
              {errors.email ? (
                <Text className="text-red-500 text-xs mt-1.5 ml-1">{errors.email}</Text>
              ) : null}
            </View>

            {/* Password Input */}
            <View className="mb-4">
              <View
                className={`flex-row items-center border rounded-xl px-4 py-3.5 ${
                  errors.password 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-[#040725]/20 bg-[#040725]/[0.02]'
                }`}
              >
                <Ionicons 
                  name="lock-closed-outline" 
                  size={20} 
                  color={errors.password ? '#EF4444' : 'rgba(4, 7, 37, 0.4)'} 
                />
                <TextInput
                  className="flex-1 ml-3 text-[#040725] text-base"
                  placeholder="Password"
                  placeholderTextColor="rgba(4, 7, 37, 0.4)"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) {
                      setErrors({ ...errors, password: '' });
                    }
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="p-1"
                >
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="rgba(4, 7, 37, 0.4)"
                  />
                </TouchableOpacity>
              </View>
              {errors.password ? (
                <Text className="text-red-500 text-xs mt-1.5 ml-1">{errors.password}</Text>
              ) : null}
            </View>

            {/* Login Button */}
            <TouchableOpacity
              className={`rounded-xl py-4 mt-2 items-center justify-center ${
                isFormValid ? 'bg-[#040725]' : 'bg-[#040725]/20'
              }`}
              onPress={handleLogin}
              disabled={!isFormValid}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text
                  className={`text-base font-semibold ${
                    isFormValid ? 'text-white' : 'text-[#040725]/40'
                  }`}
                >
                  Log in
                </Text>
              )}
            </TouchableOpacity>

            {/* Forgot Password */}
            <TouchableOpacity
              className="items-center mt-4"
              disabled={isLoading}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text className="text-[#040725] font-semibold text-sm">
                Forgot password?
              </Text>
            </TouchableOpacity>

            {/* Terms */}
            <View className="mt-auto pb-6">
              <Text className="text-center text-[#040725]/40 text-xs leading-5">
                By continuing, you agree to our{' '}
                <Text className="text-[#040725] font-medium">Terms of Service</Text>
                {' '}and{' '}
                <Text className="text-[#040725] font-medium">Privacy Policy</Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}