import { useRouter } from "expo-router";
import { Lock, Mail } from "lucide-react-native";
import React, { useState } from "react";
import { Alert, Image, Text, View } from "react-native";
import {
  AnimatedButton,
  AnimatedTextInput,
  FadeInView,
  ShakeView,
  SlideInView,
} from "../../src/components/animations";
import { useAuth } from "../../src/contexts/AuthContext";

export default function Login() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [shake, setShake] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const validateForm = () => {
    const newErrors = { email: "", password: "" };
    let isValid = true;

    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      setShake(true);
      return;
    }

    try {
      await login(formData.email, formData.password);
      setLoginSuccess(true);
    } catch (error: any) {
      setShake(true);
      Alert.alert("Login Failed", error.message || "Invalid email or password");
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  return (
    <View className={` h-screen p-4 relative ${loginSuccess ? 'bg-[#040725]' : 'bg-white'}`}>
      {!loginSuccess ? (
        <>
          <SlideInView direction="up" delay={200}>
            <Text className=" text-left text-2xl font-bold pt-4">Log in</Text>
            <Text className=" text-left text-sm text-gray-600 mb-6 pt-3">
              Don&apos;t have an account?{" "}
              <Text
                className=" text-red-600 "
                onPress={() => router.push("/(auth)/get-started")}
              >
                Create Account
              </Text>
            </Text>
          </SlideInView>

          <SlideInView direction="up" delay={300} style={{ width: "100%" }}>
            <ShakeView trigger={shake} onComplete={() => setShake(false)}>
              <View className="relative">
                <AnimatedTextInput
                  label="Email"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange("email", value)}
                  error={errors.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  containerStyle={{ marginBottom: 20 }}
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
                  onChangeText={(value) => handleInputChange("password", value)}
                  error={errors.password}
                  secureTextEntry
                  containerStyle={{ marginBottom: 30 }}
                  inputStyle={{ paddingLeft: 45 }}
                  labelStyle={{ left: 45 }}
                />
                <View className="absolute left-3 top-6 z-10">
                  <Lock size={20} color="#6B7280" />
                </View>
              </View>
            </ShakeView>

            <View className=" flex items-start " onTouchStart={() => router.push("/(auth)/forgot-password")}>
              <Text className=" text-[#1A1AFF] ">Forgot your password? </Text>
            </View>
          </SlideInView>

          <View className=" absolute bottom-0 w-full">
            <SlideInView direction="up" delay={400} style={{ width: "100%" }}>
              <AnimatedButton
                title="Continue"
                onPress={handleLogin}
                loading={isLoading}
                variant="primary"
                size="large"
                style={{ marginBottom: 20, width: "90%" }}
              />
            </SlideInView>
          </View>
        </>
      ) : (
        <>
          <FadeInView>
            <View className="flex py-12 h-full relative ">
              <View className="w-60 h-60 flex mx-auto">
                <Image
                  source={require('../../src/../assets/images/welcome-signin.png')}
                  style={{ width: '100%', height: '100%', marginBottom: 16 }}
                  resizeMode="contain"
                />
              </View>
              <Text className="text-2xl font-bold text-center text-[#fff] px-6 absolute bottom-0">
                Welcome back, you&apos;re signed in!
              </Text>
            </View>
          </FadeInView>

          <View className="absolute bottom-0 w-full">
            <AnimatedButton
              title="Go to Home"
              onPress={() => router.replace("/(tabs)")}
              variant="primary"
              size="large"
              style={{ marginBottom: 20, width: "90%" }}
            />
          </View>
        </>
      )}
    </View>
  );
}
