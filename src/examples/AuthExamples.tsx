/**
 * Authentication System Usage Examples
 * 
 * This file demonstrates how to use the authentication hooks and context
 * that have been implemented based on the API documentation.
 */

import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import {
    useAuth,
    useForgotPassword,
    useLogin,
    useResetPassword,
} from '../../hooks';

// Example Login Component
export const LoginExample = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { login } = useAuth();
  const loginMutation = useLogin();

  const handleLogin = async () => {
    try {
      // Option 1: Using context method (recommended for most cases)
      await login(email, password);
      Alert.alert('Success', 'Logged in successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleLoginWithMutation = () => {
    // Option 2: Using mutation hook directly
    loginMutation.mutate({ email, password }, {
      onSuccess: (response) => {
        Alert.alert('Success', response.message);
      },
      onError: (error: any) => {
        Alert.alert('Error', error.message);
      },
    });
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Login</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, margin: 10, padding: 10 }}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, margin: 10, padding: 10 }}
      />
      <TouchableOpacity onPress={handleLogin}>
        <Text>Login with Context</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleLoginWithMutation}>
        <Text>Login with Mutation</Text>
      </TouchableOpacity>
    </View>
  );
};

// Example Registration Component
export const RegisterExample = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    language: 'EN' as const,
  });
  
  const { register } = useAuth();

  const handleRegister = async () => {
    try {
      await register(formData);
      Alert.alert('Success', 'Account created successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Register</Text>
      <TextInput
        placeholder="Name"
        value={formData.name}
        onChangeText={(name) => setFormData({ ...formData, name })}
        style={{ borderWidth: 1, margin: 10, padding: 10 }}
      />
      <TextInput
        placeholder="Email"
        value={formData.email}
        onChangeText={(email) => setFormData({ ...formData, email })}
        style={{ borderWidth: 1, margin: 10, padding: 10 }}
      />
      <TextInput
        placeholder="Password"
        value={formData.password}
        onChangeText={(password) => setFormData({ ...formData, password })}
        secureTextEntry
        style={{ borderWidth: 1, margin: 10, padding: 10 }}
      />
      <TouchableOpacity onPress={handleRegister}>
        <Text>Register</Text>
      </TouchableOpacity>
    </View>
  );
};

// Example Forgot Password Component
export const ForgotPasswordExample = () => {
  const [email, setEmail] = useState('');
  const forgotPasswordMutation = useForgotPassword();

  const handleForgotPassword = () => {
    forgotPasswordMutation.mutate({ email }, {
      onSuccess: (response) => {
        Alert.alert('Success', 'Password reset email sent!');
      },
      onError: (error: any) => {
        Alert.alert('Error', error.message);
      },
    });
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Forgot Password</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, margin: 10, padding: 10 }}
      />
      <TouchableOpacity onPress={handleForgotPassword}>
        <Text>Send Reset Email</Text>
      </TouchableOpacity>
    </View>
  );
};

// Example Reset Password Component
export const ResetPasswordExample = () => {
  const [formData, setFormData] = useState({
    email: '',
    token: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const resetPasswordMutation = useResetPassword();

  const handleResetPassword = () => {
    resetPasswordMutation.mutate(formData, {
      onSuccess: (response) => {
        Alert.alert('Success', 'Password reset successfully!');
      },
      onError: (error: any) => {
        Alert.alert('Error', error.message);
      },
    });
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Reset Password</Text>
      <TextInput
        placeholder="Email"
        value={formData.email}
        onChangeText={(email) => setFormData({ ...formData, email })}
        style={{ borderWidth: 1, margin: 10, padding: 10 }}
      />
      <TextInput
        placeholder="4-digit Token"
        value={formData.token}
        onChangeText={(token) => setFormData({ ...formData, token })}
        style={{ borderWidth: 1, margin: 10, padding: 10 }}
      />
      <TextInput
        placeholder="New Password"
        value={formData.newPassword}
        onChangeText={(newPassword) => setFormData({ ...formData, newPassword })}
        secureTextEntry
        style={{ borderWidth: 1, margin: 10, padding: 10 }}
      />
      <TextInput
        placeholder="Confirm Password"
        value={formData.confirmPassword}
        onChangeText={(confirmPassword) => setFormData({ ...formData, confirmPassword })}
        secureTextEntry
        style={{ borderWidth: 1, margin: 10, padding: 10 }}
      />
      <TouchableOpacity onPress={handleResetPassword}>
        <Text>Reset Password</Text>
      </TouchableOpacity>
    </View>
  );
};

// Example Profile Management Component
export const ProfileExample = () => {
  const { user, profile, updateProfile } = useAuth();
  
  const [profileData, setProfileData] = useState({
    displayName: profile?.displayName || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
    phoneNumber: profile?.phoneNumber || '',
  });

  const handleUpdateProfile = async () => {
    try {
      await updateProfile(profileData);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  if (!user) {
    return <Text>Please log in first</Text>;
  }

  return (
    <View style={{ padding: 20 }}>
      <Text>Profile Management</Text>
      <Text>User: {user.name} ({user.email})</Text>
      
      <TextInput
        placeholder="Display Name"
        value={profileData.displayName}
        onChangeText={(displayName) => setProfileData({ ...profileData, displayName })}
        style={{ borderWidth: 1, margin: 10, padding: 10 }}
      />
      <TextInput
        placeholder="Bio"
        value={profileData.bio}
        onChangeText={(bio) => setProfileData({ ...profileData, bio })}
        multiline
        style={{ borderWidth: 1, margin: 10, padding: 10 }}
      />
      <TextInput
        placeholder="Location"
        value={profileData.location}
        onChangeText={(location) => setProfileData({ ...profileData, location })}
        style={{ borderWidth: 1, margin: 10, padding: 10 }}
      />
      <TextInput
        placeholder="Phone Number"
        value={profileData.phoneNumber}
        onChangeText={(phoneNumber) => setProfileData({ ...profileData, phoneNumber })}
        style={{ borderWidth: 1, margin: 10, padding: 10 }}
      />
      
      <TouchableOpacity onPress={handleUpdateProfile}>
        <Text>Update Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

// Example Auth Status Component
export const AuthStatusExample = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      Alert.alert('Success', 'Logged out successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={{ padding: 20 }}>
      <Text>Auth Status</Text>
      <Text>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</Text>
      {user && (
        <View>
          <Text>User: {user.name}</Text>
          <Text>Email: {user.email}</Text>
          <Text>Language: {user.language}</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Text>Logout</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};