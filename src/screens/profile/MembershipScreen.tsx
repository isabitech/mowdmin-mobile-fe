import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Switch,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { membershipAPI, MembershipApplication } from '../../services/membershipApi';

const PRIMARY = '#040725';

export default function MembershipScreen() {
  const navigation = useNavigation();
  const [baptismInterest, setBaptismInterest] = useState(false);
  const [communionAlert, setCommunionAlert] = useState(false);
  const [existing, setExisting] = useState<MembershipApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMembership = useCallback(async () => {
    try {
      const all = await membershipAPI.getAll();
      if (all.length > 0) {
        const mine = all[0];
        setExisting(mine);
        setBaptismInterest(mine.baptismInterest);
        setCommunionAlert(mine.communionAlert);
      }
    } catch (error: any) {
      if (error?.response?.status !== 404) {
        console.error('[Membership] fetch error:', error.message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMembership();
  }, [fetchMembership]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const result = await membershipAPI.apply({ baptismInterest, communionAlert });
      setExisting(result);
      Alert.alert('Success', 'Your membership application has been submitted!');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
    pending: { bg: '#FEF3C7', text: '#D97706', dot: '#F59E0B' },
    approved: { bg: '#D1FAE5', text: '#059669', dot: '#10B981' },
    rejected: { bg: '#FEE2E2', text: '#DC2626', dot: '#EF4444' },
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </SafeAreaView>
    );
  }

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
        <Text style={{ flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: PRIMARY }}>Membership</Text>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchMembership(); }} />}
      >
        {/* Status card if already applied */}
        {existing && (
          <View style={{
            backgroundColor: statusColors[existing.status]?.bg || '#F3F4F6',
            borderRadius: 16,
            padding: 16,
            marginBottom: 24,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: statusColors[existing.status]?.dot || '#9CA3AF', marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: statusColors[existing.status]?.text || '#6B7280' }}>
                Application {existing.status.charAt(0).toUpperCase() + existing.status.slice(1)}
              </Text>
              <Text style={{ fontSize: 12, color: statusColors[existing.status]?.text || '#6B7280', marginTop: 2, opacity: 0.8 }}>
                Submitted on {new Date(existing.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
            </View>
            <Ionicons
              name={existing.status === 'approved' ? 'checkmark-circle' : existing.status === 'rejected' ? 'close-circle' : 'time'}
              size={24}
              color={statusColors[existing.status]?.dot || '#9CA3AF'}
            />
          </View>
        )}

        {/* Info */}
        <View style={{ backgroundColor: '#F9FAFB', borderRadius: 16, padding: 20, marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <MaterialCommunityIcons name="card-account-details" size={22} color={PRIMARY} />
            <Text style={{ fontSize: 16, fontWeight: '700', color: PRIMARY, marginLeft: 10 }}>Church Membership</Text>
          </View>
          <Text style={{ fontSize: 14, color: '#6B7280', lineHeight: 22 }}>
            Register as a member of the church community. Let us know your interests so we can serve you better.
          </Text>
        </View>

        {/* Baptism Interest */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          backgroundColor: '#F9FAFB', borderRadius: 14, padding: 16, marginBottom: 12,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
              <Ionicons name="water" size={20} color="#3B82F6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: PRIMARY }}>Baptism Interest</Text>
              <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>I am interested in getting baptized</Text>
            </View>
          </View>
          <Switch
            value={baptismInterest}
            onValueChange={setBaptismInterest}
            trackColor={{ false: '#E5E7EB', true: PRIMARY }}
            thumbColor="#fff"
            disabled={existing?.status === 'approved'}
          />
        </View>

        {/* Communion Alert */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          backgroundColor: '#F9FAFB', borderRadius: 14, padding: 16, marginBottom: 32,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3E8FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
              <MaterialCommunityIcons name="cup" size={20} color="#8B5CF6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: PRIMARY }}>Communion Alerts</Text>
              <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>Notify me about communion services</Text>
            </View>
          </View>
          <Switch
            value={communionAlert}
            onValueChange={setCommunionAlert}
            trackColor={{ false: '#E5E7EB', true: PRIMARY }}
            thumbColor="#fff"
            disabled={existing?.status === 'approved'}
          />
        </View>

        {/* Submit */}
        {(!existing || existing.status === 'rejected') && (
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            style={{
              backgroundColor: PRIMARY,
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: 'center',
            }}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
                {existing ? 'Resubmit Application' : 'Submit Application'}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
