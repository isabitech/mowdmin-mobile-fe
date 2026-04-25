import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { authAPI } from '../../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'VerifyOTP'>;

export default function VerifyOTPScreen({ navigation, route }: Props) {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  const email = route.params.email;

  useEffect(() => {
    setTimeout(() => {
      inputRefs[0].current?.focus();
    }, 100);
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleNumberPress = (num: string) => {
    const firstEmptyIndex = otp.findIndex((digit) => digit === '');
    if (firstEmptyIndex !== -1) {
      const newOtp = [...otp];
      newOtp[firstEmptyIndex] = num;
      setOtp(newOtp);
      setError('');
      if (firstEmptyIndex < 3) {
        inputRefs[firstEmptyIndex + 1].current?.focus();
      }
    }
  };

  const handleBackspace = () => {
    const lastFilledIndex = otp.findLastIndex((digit) => digit !== '');
    if (lastFilledIndex !== -1) {
      const newOtp = [...otp];
      newOtp[lastFilledIndex] = '';
      setOtp(newOtp);
      inputRefs[lastFilledIndex].current?.focus();
    }
  };

  const handleContinue = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 4 || isVerifying) return;

    setIsVerifying(true);
    setError('');

    try {
      await authAPI.verifyOTP(email, otpCode);
      navigation.navigate('CompleteProfile');
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        'Invalid code. Please check your email and try again.';
      setError(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (isResending || resendCooldown > 0) return;

    setIsResending(true);
    setError('');

    try {
      await authAPI.resendOTP(email);
      setOtp(['', '', '', '']);
      inputRefs[0].current?.focus();
      setResendCooldown(60);
      Alert.alert('Code Sent', `A new verification code has been sent to ${email}`);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        'Failed to resend code. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setIsResending(false);
    }
  };

  const isOtpComplete = otp.every((digit) => digit !== '');

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {error ? (
              <View className="bg-red-500 flex-row justify-between items-center px-4 py-3">
                <Text className="flex-1 text-white text-sm">{error}</Text>
                <TouchableOpacity onPress={() => setError('')}>
                  <Text className="text-white text-xl font-bold ml-3">x</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <View className="flex-row px-6 pt-8 pb-5 gap-2 w-[45%]">
              <View className="h-1 bg-gray-200 rounded-sm w-[25%]" />
              <View className="h-1 bg-green-500 rounded-sm w-[50%]" />
              <View className="h-1 bg-gray-200 rounded-sm w-[25%]" />
            </View>

            <View className="flex-1 px-6">
              <View className="mb-8">
                <Text className="text-[28px] font-bold text-[#040725] mb-2">
                  Verify your email address
                </Text>
                <Text className="text-sm text-gray-600 leading-5">
                  We've sent a 4-digit verification code to{' '}
                  <Text className="font-semibold text-[#040725]">{email}</Text>
                </Text>
              </View>

              <View className="flex-row justify-between mb-4 gap-3">
                {otp.map((digit, index) => (
                  <TouchableOpacity
                    key={index}
                    className={`flex-1 aspect-square rounded-xl justify-center items-center border ${
                      error
                        ? 'border-red-500 bg-red-50'
                        : digit !== ''
                        ? 'border-[#040725] bg-white'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                    onPress={() => inputRefs[index].current?.focus()}
                    activeOpacity={0.7}
                  >
                    <Text className="text-[32px] font-bold text-[#040725] absolute pointer-events-none">
                      {digit}
                    </Text>
                    <TextInput
                      ref={inputRefs[index]}
                      className="absolute w-full h-full text-[32px] font-bold text-transparent text-center bg-transparent"
                      value={digit}
                      maxLength={1}
                      keyboardType="number-pad"
                      caretHidden={false}
                      selectTextOnFocus
                      editable={!isVerifying}
                      onChangeText={(text) => {
                        if (text) {
                          const newOtp = [...otp];
                          newOtp[index] = text;
                          setOtp(newOtp);
                          setError('');
                          if (index < 3) {
                            inputRefs[index + 1].current?.focus();
                          } else {
                            Keyboard.dismiss();
                          }
                        } else {
                          const newOtp = [...otp];
                          newOtp[index] = '';
                          setOtp(newOtp);
                        }
                      }}
                      onKeyPress={({ nativeEvent }) => {
                        if (nativeEvent.key === 'Backspace') {
                          if (digit === '' && index > 0) {
                            const newOtp = [...otp];
                            newOtp[index - 1] = '';
                            setOtp(newOtp);
                            inputRefs[index - 1].current?.focus();
                          }
                        }
                      }}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <View className="flex-row justify-center mb-10">
                <Text className="text-sm text-gray-600">
                  Didn't receive any code?{' '}
                </Text>
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

              <View className="mt-5">
                {[[1, 2, 3], [4, 5, 6], [7, 8, 9]].map((row, rowIdx) => (
                  <View key={rowIdx} className="flex-row justify-around mb-5">
                    {row.map((num) => (
                      <TouchableOpacity
                        key={num}
                        className="w-[70px] h-[70px] justify-center items-center"
                        onPress={() => handleNumberPress(num.toString())}
                        disabled={isVerifying}
                      >
                        <Text className="text-[28px] text-[#040725]">{num}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
                <View className="flex-row justify-around mb-5">
                  <View className="w-[70px] h-[70px]" />
                  <TouchableOpacity
                    className="w-[70px] h-[70px] justify-center items-center"
                    onPress={() => handleNumberPress('0')}
                    disabled={isVerifying}
                  >
                    <Text className="text-[28px] text-[#040725]">0</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="w-[70px] h-[70px] justify-center items-center"
                    onPress={handleBackspace}
                    disabled={isVerifying}
                  >
                    <Text className="text-[28px] text-[#040725]">{'\u232B'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View className="px-6 pb-10 pt-4 bg-white">
              <TouchableOpacity
                className={`rounded-[20px] py-4 items-center ${
                  isOtpComplete && !isVerifying ? 'bg-[#040725]' : 'bg-gray-200'
                }`}
                onPress={handleContinue}
                disabled={!isOtpComplete || isVerifying}
              >
                {isVerifying ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className={`text-center text-base font-semibold ${
                    isOtpComplete ? 'text-white' : 'text-gray-400'
                  }`}>
                    Continue
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
