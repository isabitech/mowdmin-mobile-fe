import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { authAPI } from '../../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'ResetPassword'>;

export default function ResetPasswordScreen({ navigation, route }: Props) {
  const email = route.params.email;
  const [otp, setOtp] = useState(['', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState('');

  const inputRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  useEffect(() => {
    setTimeout(() => inputRefs[0].current?.focus(), 100);
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleResendCode = async () => {
    if (isResending || resendCooldown > 0) return;
    setIsResending(true);
    try {
      await authAPI.forgotPassword(email);
      setOtp(['', '', '', '']);
      setResendCooldown(60);
      Alert.alert('Code Sent', `A new reset code has been sent to ${email}`);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to resend code.');
    } finally {
      setIsResending(false);
    }
  };

  const handleReset = async () => {
    setError('');
    const otpCode = otp.join('');

    if (otpCode.length !== 4) {
      setError('Please enter the 4-digit code');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await authAPI.resetPassword(email, otpCode, newPassword, confirmPassword);
      Alert.alert(
        'Password Reset',
        'Your password has been reset successfully. Please log in with your new password.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'Failed to reset password. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = otp.every((d) => d !== '') && newPassword.length >= 6 && confirmPassword;

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
          showsVerticalScrollIndicator={false}
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
            <View className="mb-6">
              <Text className="text-[28px] font-bold text-[#040725] mb-2">
                Reset password
              </Text>
              <Text className="text-sm text-gray-600 leading-5">
                Enter the code sent to{' '}
                <Text className="font-semibold text-[#040725]">{email}</Text>{' '}
                and set your new password.
              </Text>
            </View>

            {/* OTP Input */}
            <Text className="text-sm font-medium text-[#040725] mb-2 ml-1">Verification Code</Text>
            <View className="flex-row justify-between mb-4 gap-3">
              {otp.map((digit, index) => (
                <View
                  key={index}
                  className={`flex-1 h-14 rounded-xl justify-center items-center border ${
                    error && otp.some((d) => d === '')
                      ? 'border-red-500 bg-red-50'
                      : digit !== ''
                      ? 'border-[#040725] bg-white'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <TextInput
                    ref={inputRefs[index]}
                    className="w-full h-full text-[24px] font-bold text-[#040725] text-center"
                    value={digit}
                    maxLength={1}
                    keyboardType="number-pad"
                    editable={!isLoading}
                    onChangeText={(text) => {
                      if (text) {
                        const newOtp = [...otp];
                        newOtp[index] = text;
                        setOtp(newOtp);
                        setError('');
                        if (index < 3) inputRefs[index + 1].current?.focus();
                      } else {
                        const newOtp = [...otp];
                        newOtp[index] = '';
                        setOtp(newOtp);
                      }
                    }}
                    onKeyPress={({ nativeEvent }) => {
                      if (nativeEvent.key === 'Backspace' && digit === '' && index > 0) {
                        const newOtp = [...otp];
                        newOtp[index - 1] = '';
                        setOtp(newOtp);
                        inputRefs[index - 1].current?.focus();
                      }
                    }}
                  />
                </View>
              ))}
            </View>

            {/* Resend */}
            <View className="flex-row justify-center mb-6">
              <Text className="text-sm text-gray-600">Didn't get the code? </Text>
              <TouchableOpacity
                onPress={handleResendCode}
                disabled={isResending || resendCooldown > 0}
              >
                <Text className={`text-sm font-semibold ${
                  resendCooldown > 0 ? 'text-gray-400' : 'text-red-500'
                }`}>
                  {isResending
                    ? 'Sending...'
                    : resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : 'Resend code'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* New Password */}
            <Text className="text-sm font-medium text-[#040725] mb-2 ml-1">New Password</Text>
            <View className="flex-row items-center border border-[#040725]/20 rounded-xl px-4 py-3.5 mb-4 bg-[#040725]/[0.02]">
              <Ionicons name="lock-closed-outline" size={20} color="rgba(4, 7, 37, 0.4)" />
              <TextInput
                className="flex-1 ml-3 text-[#040725] text-base"
                placeholder="Min 6 characters"
                placeholderTextColor="rgba(4, 7, 37, 0.4)"
                value={newPassword}
                onChangeText={(text) => { setNewPassword(text); setError(''); }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!isLoading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-1">
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="rgba(4, 7, 37, 0.4)"
                />
              </TouchableOpacity>
            </View>

            {/* Confirm Password */}
            <Text className="text-sm font-medium text-[#040725] mb-2 ml-1">Confirm Password</Text>
            <View className="flex-row items-center border border-[#040725]/20 rounded-xl px-4 py-3.5 mb-4 bg-[#040725]/[0.02]">
              <Ionicons name="lock-closed-outline" size={20} color="rgba(4, 7, 37, 0.4)" />
              <TextInput
                className="flex-1 ml-3 text-[#040725] text-base"
                placeholder="Re-enter password"
                placeholderTextColor="rgba(4, 7, 37, 0.4)"
                value={confirmPassword}
                onChangeText={(text) => { setConfirmPassword(text); setError(''); }}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                editable={!isLoading}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} className="p-1">
                <Ionicons
                  name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="rgba(4, 7, 37, 0.4)"
                />
              </TouchableOpacity>
            </View>

            {/* Error */}
            {error ? (
              <Text className="text-red-500 text-sm mb-4 ml-1">{error}</Text>
            ) : null}

            {/* Submit Button */}
            <TouchableOpacity
              className={`rounded-xl py-4 items-center mt-2 ${
                isFormValid && !isLoading ? 'bg-[#040725]' : 'bg-[#040725]/20'
              }`}
              onPress={handleReset}
              disabled={!isFormValid || isLoading}
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
                  Reset Password
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
