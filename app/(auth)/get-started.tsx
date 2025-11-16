import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft, EyeIcon, EyeOff, Lock, Mail, User } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedButton, AnimatedTextInput, FadeInView, ShakeView, SlideInView } from '../../src/components/animations';
import { useAuth } from '../../src/contexts/AuthContext';

interface Country {
  name: string;
  flag: string;
  code: string;
}

const countries: Country[] = [
  { name: 'United States', flag: '🇺🇸', code: 'US' },
  { name: 'Germany', flag: '🇩🇪', code: 'DE' },
  { name: 'Nigeria', flag: '🇳🇬', code: 'NG' },
  { name: 'Afghanistan', flag: '🇦🇫', code: 'AF' },
  { name: 'Albania', flag: '🇦🇱', code: 'AL' },
  { name: 'Algeria', flag: '🇩🇿', code: 'DZ' },
  { name: 'Andorra', flag: '🇦🇩', code: 'AD' },
  { name: 'Argentina', flag: '🇦🇷', code: 'AR' },
];

export default function SignupFlow() {
  const router = useRouter();
  const { register, verifyEmail, resendVerification, isLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    country: '',
  });
  const [otp, setOtp] = useState(['', '', '', '']);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    fullName: '',
  });
  const [shake, setShake] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [searchCountry, setSearchCountry] = useState('');
  
  const progressAnims = useRef(
    Array.from({ length: 4 }, () => new Animated.Value(0))
  ).current;
  
  const otpRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  useEffect(() => {
    progressAnims.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: index < step ? 1 : 0,
        duration: 400,
        useNativeDriver: false,
      }).start();
    });
  }, [step, progressAnims]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field as keyof typeof errors]) {
      setErrors({ ...errors, [field]: '' } as any);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      if (value && index < 3) {
        otpRefs[index + 1].current?.focus();
      }
    }
  };

  const handleOtpKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors = { email: '', password: '', fullName: '' };
    let isValid = true;

    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required';
      isValid = false;
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSignUp = async () => {
    if (!validateStep1()) {
      setShake(true);
      return;
    }

    try {
      await register({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
      });
      setStep(2);
      Alert.alert('Success', 'Account created! Please check your email for the verification code.');
    } catch (error: any) {
      setShake(true);
      Alert.alert('Signup Failed', error.message || 'Registration failed. Please try again.');
    }
  };

  const handleVerifyEmail = async () => {
    const verificationCode = otp.join('');
    if (verificationCode.length !== 4) {
      setShake(true);
      Alert.alert('Error', 'Please enter the complete verification code');
      return;
    }

    try {
      await verifyEmail(formData.email, verificationCode);
      setStep(3);
      Alert.alert('Success', 'Email verified successfully!');
    } catch (error: any) {
      setShake(true);
      Alert.alert('Verification Failed', error.message || 'Invalid verification code');
    }
  };

  const handleResendCode = async () => {
    try {
      await resendVerification(formData.email);
      Alert.alert('Success', 'Verification code resent to your email!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to resend verification code');
    }
  };

  const handleCompleteProfile = async () => {
    if (!formData.country) {
      Alert.alert('Error', 'Please select your country');
      return;
    }

    try {
      setStep(4);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to complete profile');
    }
  };

  const handleContinue = () => {
    if (step === 1) {
      handleSignUp();
    } else if (step === 2) {
      handleVerifyEmail();
    } else if (step === 3) {
      handleCompleteProfile();
    } else if (step === 4) {
      router.push('/(tabs)');
    }
  };

  const handleNumberPress = (num: string) => {
    const emptyIndex = otp.findIndex(d => !d);
    if (emptyIndex !== -1) {
      handleOtpChange(emptyIndex, num);
    }
  };

  const handleBackspace = () => {
    const lastFilledIndex = otp.map((d, i) => d ? i : -1).filter(i => i !== -1).pop();
    if (lastFilledIndex !== undefined) {
      handleOtpChange(lastFilledIndex, '');
    }
  };

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchCountry.toLowerCase())
  );

  const selectedCountry = countries.find(c => c.code === formData.country);

  return (
    <SafeAreaView className={`${step === 4 ? 'bg-[#040725]' : 'bg-white'} flex-1`}>
      <StatusBar style='dark' />
      {/* Enhanced Progress Bar */}
      <View className="px-6 pt-4 pb-6 mt-10">
        <View className="flex-row items-center justify-between gap-2">
          {progressAnims.map((anim, index) => {
            const backgroundColor = anim.interpolate({
              inputRange: [0, 1],
              outputRange: ['rgb(229, 231, 235)', 'rgb(16, 185, 129)'],
            });
            
            const scale = anim.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.1],
            });

            return (
              <Animated.View
                key={index}
                className="flex-1 h-2 rounded-full overflow-hidden"
                style={{ 
                  backgroundColor,
                  transform: [{ scaleY: scale }],
                }}
              />
            );
          })}
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1 px-6"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Step 1: Email, Username, Password */}
          {step === 1 && (
            <FadeInView>
              <SlideInView direction="up" delay={100}>
                <Text className="text-4xl font-bold text-gray-900 mb-2">Create account</Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                  <Text className="text-base text-gray-600 mb-8">
                    Already have an account?{' '}
                    <Text className="text-blue-600 font-semibold">Log in</Text>
                  </Text>
                </TouchableOpacity>
              </SlideInView>

              <SlideInView direction="up" delay={200} style={{ width: '100%' }}>
                <ShakeView trigger={shake} onComplete={() => setShake(false)}>
                  <View className="space-y-4">
                    
                    <View className="relative">
                      <AnimatedTextInput
                        label="Full Name"
                        value={formData.fullName}
                        onChangeText={(value) => handleInputChange('fullName', value)}
                        error={errors.fullName}
                        autoCapitalize="words"
                        containerStyle={{ marginBottom: 15 }}
                        inputStyle={{ paddingLeft: 45 }}
                        labelStyle={{ left: 45 }}
                      />
                      <View className="absolute left-3 top-6 z-10">
                        <User size={20} color="#6B7280" />
                      </View>
                    </View>

                    <View className="relative">
                      <AnimatedTextInput
                        label="Email address"
                        value={formData.email}
                        onChangeText={(value) => handleInputChange('email', value)}
                        error={errors.email}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        containerStyle={{ marginBottom: 15 }}
                        inputStyle={{ paddingLeft: 45 }}
                        labelStyle={{ left: 45 }}
                      />
                      <View className="absolute left-3 top-6 z-10">
                        <Mail size={20} color="#6B7280" />
                      </View>
                    </View>

                    

                    <View className="relative">
                      <AnimatedTextInput
                        label="Password"
                        value={formData.password}
                        onChangeText={(value) => handleInputChange('password', value)}
                        error={errors.password}
                        secureTextEntry={!showPassword}
                        containerStyle={{ marginBottom: 20 }}
                        inputStyle={{ paddingLeft: 45, paddingRight: 45 }}
                        labelStyle={{ left: 45 }}
                      />
                      <View className="absolute left-3 top-6 z-10">
                        <Lock size={20} color="#6B7280" />
                      </View>
                      <TouchableOpacity
                        className="absolute right-3 top-6 z-10"
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={20} color="#6B7280" /> : <EyeIcon size={20} color="#6B7280" />}
                      </TouchableOpacity>
                    </View>
                  </View>
                </ShakeView>
              </SlideInView>
            </FadeInView>
          )}

          {/* Step 2: Email Verification */}
          {step === 2 && (
            <FadeInView>
              <SlideInView direction="up" delay={100}>
                <Text className="text-4xl font-bold text-gray-900 mb-2">Verify your email</Text>
                <Text className="text-base text-gray-600 mb-8">
                  We&apos;ve sent you a 4-digit verification code to {formData.email}
                </Text>
              </SlideInView>

              <SlideInView direction="up" delay={200}>
                <ShakeView trigger={shake} onComplete={() => setShake(false)}>
                  <View className="flex-row justify-center gap-3 mb-6">
                    {otp.map((digit, index) => (
                      <TextInput
                        key={index}
                        ref={otpRefs[index]}
                        className="w-16 h-16 border-2 border-gray-300 rounded-xl text-2xl font-semibold text-center"
                        value={digit}
                        onChangeText={(value) => handleOtpChange(index, value)}
                        onKeyPress={({ nativeEvent: { key } }) => handleOtpKeyPress(index, key)}
                        keyboardType="number-pad"
                        maxLength={1}
                        selectTextOnFocus
                      />
                    ))}
                  </View>

                  <Text className="text-center text-sm text-gray-600 mb-8">
                    Didn&apos;t receive any code?{' '}
                    <TouchableOpacity onPress={handleResendCode}>
                      <Text className="text-[#FF0000] font-semibold">Resend code</Text>
                    </TouchableOpacity>
                  </Text>

                  {/* Number Pad */}
                  <View className="flex-row flex-wrap justify-center gap-4 max-w-xs mx-auto">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <TouchableOpacity
                        key={num}
                        className="w-20 h-14 items-center justify-center rounded-xl active:bg-gray-100"
                        onPress={() => handleNumberPress(num.toString())}
                      >
                        <Text className="text-2xl font-medium text-gray-900">{num}</Text>
                      </TouchableOpacity>
                    ))}
                    <View className="w-20 h-14" />
                    <TouchableOpacity
                      className="w-20 h-14 items-center justify-center rounded-xl active:bg-gray-100"
                      onPress={() => handleNumberPress('0')}
                    >
                      <Text className="text-2xl font-medium text-gray-900">0</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="w-20 h-14 items-center justify-center rounded-xl active:bg-gray-100"
                      onPress={handleBackspace}
                      >
                      <Text className="text-xl text-[#000000]"><ChevronLeft  /></Text>
                    </TouchableOpacity>
                  </View>
                </ShakeView>
              </SlideInView>
            </FadeInView>
          )}

          {/* Step 3: Country Selection */}
          {step === 3 && (
            <FadeInView>
              <SlideInView direction="up" delay={100}>
                <Text className="text-4xl font-bold text-gray-900 mb-2">Almost done!</Text>
                <Text className="text-base text-gray-600 mb-8">
                  Choose your country to complete your registration.
                </Text>
              </SlideInView>

              <SlideInView direction="up" delay={200} style={{ width: '100%' }}>
                <View className="space-y-4">
                  <TouchableOpacity
                    className="flex-row items-center border border-gray-300 rounded-xl p-4 gap-3"
                    onPress={() => setShowCountryModal(true)}
                  >
                    {selectedCountry ? (
                      <>
                        <Text className="text-2xl">{selectedCountry.flag}</Text>
                        <Text className="text-base text-gray-900">{selectedCountry.name}</Text>
                      </>
                    ) : (
                      <Text className="text-base text-gray-400">Select your country</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </SlideInView>
            </FadeInView>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <FadeInView >
              <View className="flex  py-12 h-[70vh]  relative">
                <View className="w-60 h-60 flex justify-center items-center mx-auto">
                 <Image
                    source={require('../../src/../assets/images/welcome-register.png')}
                    style={{ width: '100%', height: '100%', marginBottom: 16 }}
                    resizeMode="contain"
                  />
                </View>
                <Text className="text-xl font-bold text-center text-[#fff] px-6 absolute bottom-0">
                  Welcome {formData.fullName}!{'\n'}Your account has been created successfully!
                </Text>
              </View>
            </FadeInView>
          )}
        </ScrollView>

        {/* Continue Button */}
        <View className="p-6 pb-8">
          <AnimatedButton
            title={step === 2 ? 'Verify ' : step === 3 ? 'Select Country' : step === 4 ? 'Go to Home' : 'Continue'}
            onPress={handleContinue}
            loading={isLoading}
            variant={step === 4 ? 'secondary' : 'primary'}
            size="large"
          />
        </View>
      </KeyboardAvoidingView>

      {/* Country Modal */}
      <Modal
        visible={showCountryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCountryModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl max-h-4/5">
            <View className="flex-row justify-between items-center p-5 border-b border-gray-200">
              <Text className="text-lg font-semibold text-gray-900">Select Country</Text>
              <TouchableOpacity onPress={() => setShowCountryModal(false)}>
                <Text className="text-2xl text-gray-600">✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              className="m-4 p-3 border border-gray-300 rounded-xl text-base"
              placeholder="Search"
              value={searchCountry}
              onChangeText={setSearchCountry}
              placeholderTextColor="#9CA3AF"
            />

            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="flex-row items-center p-4 gap-3 border-b border-gray-100 active:bg-gray-50"
                  onPress={() => {
                    handleInputChange('country', item.code);
                    setShowCountryModal(false);
                    setSearchCountry('');
                  }}
                >
                  <Text className="text-2xl">{item.flag}</Text>
                  <Text className="text-base text-gray-900 flex-1">{item.name}</Text>
                  {formData.country === item.code && (
                    <Text className="text-xl text-green-500">✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}