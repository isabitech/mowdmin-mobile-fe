import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Modal,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

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
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    fullName: '',
    country: '',
  });
  const [otp, setOtp] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [searchCountry, setSearchCountry] = useState('');
  
  const progressAnims = useRef(
    Array.from({ length: 7 }, () => new Animated.Value(0))
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
  }, [step]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });
    setError('');
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

  const validateStep = (): boolean => {
    if (step === 1 && !formData.email) {
      setError('Email is required');
      return false;
    }
    if (step === 2 && !formData.password) {
      setError('Password is required');
      return false;
    }
    if (step === 3 && !formData.username) {
      setError('Username is required');
      return false;
    }
    if (step === 4 && otp.some(digit => !digit)) {
      setError('Please enter the complete verification code');
      return false;
    }
    if (step === 5 && !formData.fullName) {
      setError('Full name is required');
      return false;
    }
    if (step === 6 && !formData.country) {
      setError('Please select your country');
      return false;
    }
    return true;
  };

  const handleContinue = () => {
    if (validateStep()) {
      if (step < 7) {
        setStep(step + 1);
        setError('');
      }
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
    <SafeAreaView className="flex-1 bg-white">
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
          {/* Step 1: Email */}
          {step === 1 && (
            <View className="flex-1">
              <Text className="text-4xl font-bold text-gray-900 mb-2">Create account</Text>
              <Text className="text-base text-gray-600 mb-8">
                Already have an account?{' '}
                <Text className="text-blue-600 font-semibold">Log in</Text>
              </Text>

              <View className="space-y-4">
                <TextInput
                  className="border border-gray-300 rounded-xl p-4 text-base bg-white"
                  placeholder="Email address"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          )}

          {/* Step 2: Password */}
          {step === 2 && (
            <View className="flex-1">
              <Text className="text-4xl font-bold text-gray-900 mb-2">Create account</Text>
              <Text className="text-base text-gray-600 mb-8">
                Already have an account?{' '}
                <Text className="text-blue-600 font-semibold">Log in</Text>
              </Text>

              <View className="space-y-4">
                <TextInput
                  className="border border-gray-300 rounded-xl p-4 text-base bg-gray-50"
                  value={formData.email}
                  editable={false}
                />

                <View className="relative">
                  <TextInput
                    className="border border-gray-300 rounded-xl p-4 pr-12 text-base bg-white"
                    placeholder="Password"
                    value={formData.password}
                    onChangeText={(value) => handleInputChange('password', value)}
                    secureTextEntry={!showPassword}
                    placeholderTextColor="#9CA3AF"
                  />
                  <TouchableOpacity
                    className="absolute right-4 top-4"
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text className="text-xl">{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Step 3: Username */}
          {step === 3 && (
            <View className="flex-1">
              <Text className="text-4xl font-bold text-gray-900 mb-2">Create account</Text>
              <Text className="text-base text-gray-600 mb-8">
                Already have an account?{' '}
                <Text className="text-blue-600 font-semibold">Log in</Text>
              </Text>

              <View className="space-y-4">
                <TextInput
                  className="border border-gray-300 rounded-xl p-4 text-base bg-gray-50"
                  value={formData.email}
                  editable={false}
                />

                <TextInput
                  className="border border-gray-300 rounded-xl p-4 text-base bg-white"
                  placeholder="Username"
                  value={formData.username}
                  onChangeText={(value) => handleInputChange('username', value)}
                  autoCapitalize="none"
                  placeholderTextColor="#9CA3AF"
                />

                {error && (
                  <View className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <Text className="text-red-600 text-sm">{error}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Step 4: OTP Verification */}
          {step === 4 && (
            <View className="flex-1">
              <Text className="text-4xl font-bold text-gray-900 mb-2">Verify your email address</Text>
              <Text className="text-base text-gray-600 mb-8">
                We've sent you a 4-digit verification code to verify your email.
              </Text>

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
                Didn't receive any code?{' '}
                <Text className="text-blue-600 font-semibold">Resend code</Text>
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
                  <Text className="text-xl text-gray-900">⌫</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Step 5: Full Name */}
          {step === 5 && (
            <View className="flex-1">
              <Text className="text-4xl font-bold text-gray-900 mb-2">Complete your profile</Text>
              <Text className="text-base text-gray-600 mb-8">
                Enter your name and choose your country to complete your registration.
              </Text>

              <View className="space-y-4">
                <TextInput
                  className="border border-gray-300 rounded-xl p-4 text-base bg-white"
                  placeholder="Full name"
                  value={formData.fullName}
                  onChangeText={(value) => handleInputChange('fullName', value)}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          )}

          {/* Step 6: Country */}
          {step === 6 && (
            <View className="flex-1">
              <Text className="text-4xl font-bold text-gray-900 mb-2">Complete your profile</Text>
              <Text className="text-base text-gray-600 mb-8">
                Enter your name and choose your country to complete your registration.
              </Text>

              <View className="space-y-4">
                <TextInput
                  className="border border-gray-300 rounded-xl p-4 text-base bg-gray-50"
                  value={formData.fullName}
                  editable={false}
                />

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
            </View>
          )}

          {/* Step 7: Success */}
          {step === 7 && (
            <View className="flex-1 items-center justify-center py-12">
              <View className="w-32 h-32 bg-pink-400 rounded-3xl items-center justify-center mb-8 shadow-lg">
                <Text className="text-6xl text-white">✓</Text>
              </View>
              <Text className="text-3xl font-bold text-center text-gray-900 px-6">
                Your account has been{'\n'}created successfully!
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Continue Button */}
        {step < 7 && (
          <View className="p-6 pb-8">
            <TouchableOpacity
              className="bg-gray-900 py-4 rounded-full items-center shadow-sm active:opacity-80"
              onPress={handleContinue}
            >
              <Text className="text-white text-base font-semibold">Continue</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 7 && (
          <View className="p-6 pb-8">
            <TouchableOpacity
              className="bg-red-500 py-4 rounded-full items-center shadow-sm active:opacity-80"
              onPress={() => router.push('/(tabs)')}
            >
              <Text className="text-white text-base font-semibold">Go to Home</Text>
            </TouchableOpacity>
          </View>
        )}
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