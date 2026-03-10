import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import Toast from 'react-native-toast-message';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ name: '', email: '', password: '' });

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[@$!%*?&]/.test(password);
  const hasMinLength = password.length >= 6;
  const isPasswordValid = hasUppercase && hasLowercase && hasNumber && hasSpecial && hasMinLength;

  const validate = () => {
    const newErrors = { name: '', email: '', password: '' };
    let valid = true;

    if (!name.trim()) {
      newErrors.name = 'Name is required';
      valid = false;
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
      valid = false;
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!validateEmail(email.trim())) {
      newErrors.email = 'Please enter a valid email';
      valid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (!isPasswordValid) {
      newErrors.password = 'Password does not meet requirements';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleContinue = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await register(name.trim(), email.trim(), password);

      Toast.show({
        type: 'success',
        text1: 'Registration Successful',
        text2: 'Please check your email for verification code',
        position: 'top',
        visibilityTime: 3000,
      });

      setTimeout(() => {
        navigation.navigate('VerifyOTP', { email: email.trim() });
      }, 500);
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Something went wrong';
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: msg,
        position: 'top',
        visibilityTime: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = name.trim().length >= 2 && validateEmail(email.trim()) && isPasswordValid;

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Progress Indicator */}
        <View className="flex-row px-6 pt-14 gap-2 w-[45%]">
          <View className="h-1 bg-green-500 rounded-sm w-[50%]" />
          <View className="h-1 bg-gray-200 rounded-sm w-[25%]" />
          <View className="h-1 bg-gray-200 rounded-sm w-[25%]" />
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-6 pt-6 pb-6">
            {/* Header */}
            <View className="mb-8">
              <Text className="text-[30px] font-bold text-[#040725] mb-2 tracking-tight">
                Create account
              </Text>
              <View className="flex-row items-center flex-wrap">
                <Text className="text-sm text-gray-600">
                  Already have an account?{' '}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text className="text-sm text-[#f80606] font-semibold">
                    Log in
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Name Input */}
            <View className="mb-4">
              <View
                className={`flex-row items-center bg-gray-50 rounded-xl px-4 py-3.5 border ${
                  errors.name ? 'border-red-500 bg-red-50' : nameFocused ? 'border-[#040725] bg-[#F0F1F5]' : 'border-gray-200'
                }`}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={errors.name ? '#EF4444' : nameFocused ? '#040725' : '#9CA3AF'}
                  style={{ marginRight: 12 }}
                />
                <TextInput
                  className="flex-1 text-base text-[#040725] p-0"
                  placeholder="Enter your name"
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={(text) => { setName(text); if (errors.name) setErrors(e => ({ ...e, name: '' })); }}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                  autoCapitalize="words"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                {name.length > 0 && !isLoading && (
                  <TouchableOpacity onPress={() => setName('')} className="ml-2 p-1">
                    <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </View>
              {errors.name ? <Text className="text-red-500 text-xs mt-1.5 ml-1">{errors.name}</Text> : null}
            </View>

            {/* Email Input */}
            <View className="mb-4">
              <View
                className={`flex-row items-center bg-gray-50 rounded-xl px-4 py-3.5 border ${
                  errors.email ? 'border-red-500 bg-red-50' : emailFocused ? 'border-[#040725] bg-[#F0F1F5]' : 'border-gray-200'
                }`}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={errors.email ? '#EF4444' : emailFocused ? '#040725' : '#9CA3AF'}
                  style={{ marginRight: 12 }}
                />
                <TextInput
                  className="flex-1 text-base text-[#040725] p-0"
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={(text) => { setEmail(text); if (errors.email) setErrors(e => ({ ...e, email: '' })); }}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                {email.length > 0 && !isLoading && (
                  <TouchableOpacity onPress={() => setEmail('')} className="ml-2 p-1">
                    <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </View>
              {errors.email ? <Text className="text-red-500 text-xs mt-1.5 ml-1">{errors.email}</Text> : null}
            </View>

            {/* Password Input */}
            <View className="mb-4">
              <View
                className={`flex-row items-center bg-gray-50 rounded-xl px-4 py-3.5 border ${
                  errors.password ? 'border-red-500 bg-red-50' : passwordFocused ? 'border-[#040725] bg-[#F0F1F5]' : 'border-gray-200'
                }`}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={errors.password ? '#EF4444' : passwordFocused ? '#040725' : '#9CA3AF'}
                  style={{ marginRight: 12 }}
                />
                <TextInput
                  className="flex-1 text-base text-[#040725] p-0"
                  placeholder="Create a password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={(text) => { setPassword(text); if (errors.password) setErrors(e => ({ ...e, password: '' })); }}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="ml-2 p-1"
                  disabled={isLoading}
                >
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
              {errors.password ? <Text className="text-red-500 text-xs mt-1.5 ml-1">{errors.password}</Text> : null}

              {/* Password Requirements */}
              {password.length > 0 && (
                <View className="mt-3 ml-1 gap-1.5">
                  <View className="flex-row items-center">
                    <Ionicons name={hasMinLength ? 'checkmark-circle' : 'ellipse-outline'} size={14} color={hasMinLength ? '#22C55E' : '#9CA3AF'} />
                    <Text className={`text-xs ml-1.5 ${hasMinLength ? 'text-green-500' : 'text-gray-400'}`}>At least 6 characters</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name={hasUppercase ? 'checkmark-circle' : 'ellipse-outline'} size={14} color={hasUppercase ? '#22C55E' : '#9CA3AF'} />
                    <Text className={`text-xs ml-1.5 ${hasUppercase ? 'text-green-500' : 'text-gray-400'}`}>One uppercase letter</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name={hasLowercase ? 'checkmark-circle' : 'ellipse-outline'} size={14} color={hasLowercase ? '#22C55E' : '#9CA3AF'} />
                    <Text className={`text-xs ml-1.5 ${hasLowercase ? 'text-green-500' : 'text-gray-400'}`}>One lowercase letter</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name={hasNumber ? 'checkmark-circle' : 'ellipse-outline'} size={14} color={hasNumber ? '#22C55E' : '#9CA3AF'} />
                    <Text className={`text-xs ml-1.5 ${hasNumber ? 'text-green-500' : 'text-gray-400'}`}>One number</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name={hasSpecial ? 'checkmark-circle' : 'ellipse-outline'} size={14} color={hasSpecial ? '#22C55E' : '#9CA3AF'} />
                    <Text className={`text-xs ml-1.5 ${hasSpecial ? 'text-green-500' : 'text-gray-400'}`}>One special character (@$!%*?&)</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Continue Button */}
        <View className="px-6 pb-8 pt-4 bg-white border-gray-100">
          <TouchableOpacity
            className={`rounded-[20px] py-4 ${
              isFormValid && !isLoading ? 'bg-[#040725]' : 'bg-gray-200'
            }`}
            onPress={handleContinue}
            disabled={!isFormValid || isLoading}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-center">
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text
                    className={`text-base font-semibold ${
                      isFormValid ? 'text-white' : 'text-gray-400'
                    }`}
                  >
                    Continue
                  </Text>
                  {isFormValid && (
                    <Ionicons
                      name="arrow-forward"
                      size={20}
                      color="white"
                      style={{ marginLeft: 8 }}
                    />
                  )}
                </>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}