import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { profileAPI } from '../../services/profileApi';
import { useAuth } from '../../contexts/AuthContext';

const PRIMARY = '#040725';

export default function ChangePasswordScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const isValid =
    currentPassword.length >= 6 &&
    newPassword.length >= 8 &&
    newPassword === confirmPassword &&
    /[A-Z]/.test(newPassword) &&
    /[a-z]/.test(newPassword) &&
    /[0-9]/.test(newPassword);

  const handleChangePassword = async () => {
    if (!isValid) return;
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await profileAPI.changePassword(user?.email || '', currentPassword, newPassword);
      Alert.alert('Success', 'Your password has been changed successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to change password. Please check your current password.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (t: string) => void,
    show: boolean,
    toggleShow: () => void,
    placeholder: string,
  ) => (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontSize: 13, fontWeight: '600', color: '#6B7280', marginBottom: 8 }}>{label}</Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#F9FAFB',
          borderRadius: 14,
          borderWidth: 1,
          borderColor: '#E5E7EB',
          paddingHorizontal: 16,
        }}
      >
        <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" style={{ marginRight: 10 }} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={!show}
          style={{ flex: 1, fontSize: 15, color: PRIMARY, paddingVertical: Platform.OS === 'ios' ? 14 : 12 }}
        />
        <TouchableOpacity onPress={toggleShow} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name="chevron-back" size={22} color={PRIMARY} />
        </TouchableOpacity>
        <Text style={{ flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: PRIMARY }}>Change Password</Text>
        <View style={{ width: 42 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
          {/* Info */}
          <View style={{ backgroundColor: '#EFF6FF', borderRadius: 14, padding: 16, marginBottom: 24, flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="shield-checkmark" size={22} color="#3B82F6" style={{ marginRight: 12 }} />
            <Text style={{ flex: 1, color: '#1D4ED8', fontSize: 13, lineHeight: 19 }}>
              Password must be at least 8 characters with uppercase, lowercase, and a number.
            </Text>
          </View>

          {renderInput('Current Password', currentPassword, setCurrentPassword, showCurrent, () => setShowCurrent(!showCurrent), 'Enter current password')}
          {renderInput('New Password', newPassword, setNewPassword, showNew, () => setShowNew(!showNew), 'Enter new password')}
          {renderInput('Confirm New Password', confirmPassword, setConfirmPassword, showConfirm, () => setShowConfirm(!showConfirm), 'Confirm new password')}

          {/* Validation hints */}
          <View style={{ marginBottom: 24 }}>
            {[
              { check: newPassword.length >= 8, text: 'At least 8 characters' },
              { check: /[A-Z]/.test(newPassword), text: 'One uppercase letter' },
              { check: /[a-z]/.test(newPassword), text: 'One lowercase letter' },
              { check: /[0-9]/.test(newPassword), text: 'One number' },
              { check: newPassword === confirmPassword && confirmPassword.length > 0, text: 'Passwords match' },
            ].map((rule, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <Ionicons
                  name={rule.check ? 'checkmark-circle' : 'ellipse-outline'}
                  size={16}
                  color={rule.check ? '#22C55E' : '#D1D5DB'}
                />
                <Text style={{ marginLeft: 8, fontSize: 13, color: rule.check ? '#22C55E' : '#9CA3AF' }}>{rule.text}</Text>
              </View>
            ))}
          </View>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleChangePassword}
            disabled={!isValid || loading}
            style={{
              backgroundColor: isValid ? PRIMARY : '#D1D5DB',
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: 'center',
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Update Password</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
