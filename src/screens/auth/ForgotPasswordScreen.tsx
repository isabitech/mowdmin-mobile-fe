import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { authAPI } from '../../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = async () => {
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!validateEmail(email.trim())) {
      setError('Please enter a valid email');
      return;
    }

    setIsLoading(true);

    try {
      await authAPI.forgotPassword(email.trim().toLowerCase());
      navigation.navigate('ResetPassword', { email: email.trim().toLowerCase() });
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'Failed to send reset code. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 pt-4">
            {/* Back Button */}
            <TouchableOpacity
              className="w-11 h-11 rounded-full bg-gray-100 justify-center items-center mb-6"
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={24} color="#040725" />
            </TouchableOpacity>

            {/* Header */}
            <View className="mb-8">
              <Text className="text-[28px] font-bold text-[#040725] mb-2">
                Forgot password?
              </Text>
              <Text className="text-sm text-gray-600 leading-5">
                Enter the email address associated with your account and we'll send you a code to reset your password.
              </Text>
            </View>

            {/* Email Input */}
            <View className="mb-6">
              <View
                className={`flex-row items-center border rounded-xl px-4 py-3.5 ${
                  error
                    ? 'border-red-500 bg-red-50'
                    : 'border-[#040725]/20 bg-[#040725]/[0.02]'
                }`}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={error ? '#EF4444' : 'rgba(4, 7, 37, 0.4)'}
                />
                <TextInput
                  className="flex-1 ml-3 text-[#040725] text-base"
                  placeholder="Email"
                  placeholderTextColor="rgba(4, 7, 37, 0.4)"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (error) setError('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>
              {error ? (
                <Text className="text-red-500 text-xs mt-1.5 ml-1">{error}</Text>
              ) : null}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              className={`rounded-xl py-4 items-center ${
                email.trim() && !isLoading ? 'bg-[#040725]' : 'bg-[#040725]/20'
              }`}
              onPress={handleSubmit}
              disabled={!email.trim() || isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text
                  className={`text-base font-semibold ${
                    email.trim() ? 'text-white' : 'text-[#040725]/40'
                  }`}
                >
                  Send Reset Code
                </Text>
              )}
            </TouchableOpacity>

            {/* Back to Login */}
            <TouchableOpacity
              className="items-center mt-6"
              onPress={() => navigation.navigate('Login')}
              disabled={isLoading}
            >
              <Text className="text-[#040725] font-semibold text-sm">
                Back to Log in
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
