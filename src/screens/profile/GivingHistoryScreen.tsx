import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { donationsAPI, Donation } from '../../services/donationsApi';
import { payForDonation } from '../../services/stripeService';

const PRIMARY = '#040725';

interface Transaction {
  id: string;
  title: string;
  date: string;
  time: string;
  amount: string;
  type: 'tithe' | 'mission' | 'building' | 'youth' | 'offering';
  status: 'completed' | 'pending';
  paymentMethod: string;
}

const mapDonationStatus = (status: string): 'completed' | 'pending' => {
  if (status === 'Success') return 'completed';
  return 'pending';
};

const mapDonationType = (campaign?: string): Transaction['type'] => {
  if (!campaign) return 'offering';
  const lower = campaign.toLowerCase();
  if (lower.includes('tithe')) return 'tithe';
  if (lower.includes('mission')) return 'mission';
  if (lower.includes('building') || lower.includes('sanctuary')) return 'building';
  if (lower.includes('youth')) return 'youth';
  return 'offering';
};

const formatDate = (dateStr: string): string => {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: '2-digit', year: 'numeric',
    });
  } catch { return dateStr; }
};

const formatTime = (dateStr: string): string => {
  try {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  } catch { return ''; }
};

const toTransaction = (d: Donation): Transaction => ({
  id: d._id,
  title: d.campaign || 'Donation',
  date: formatDate(d.createdAt),
  time: formatTime(d.createdAt),
  amount: `$${d.amount.toFixed(2)}`,
  type: mapDonationType(d.campaign),
  status: mapDonationStatus(d.status),
  paymentMethod: 'Online Payment',
});

const categories = [
  { id: 'all', label: 'All Giving', icon: 'layers-outline' },
  { id: 'tithe', label: 'Tithes', icon: 'heart-outline' },
  { id: 'mission', label: 'Missions', icon: 'earth' },
  { id: 'building', label: 'Building', icon: 'business-outline' },
  { id: 'youth', label: 'Youth', icon: 'people-outline' },
];

const getTypeConfig = (type: string) => {
  const configs: Record<string, { color: string; bgColor: string; icon: string }> = {
    tithe: { color: '#3B82F6', bgColor: '#EFF6FF', icon: 'heart' },
    mission: { color: '#EF4444', bgColor: '#FEF2F2', icon: 'earth' },
    building: { color: '#8B5CF6', bgColor: '#F5F3FF', icon: 'business' },
    youth: { color: '#F97316', bgColor: '#FFF7ED', icon: 'people' },
    offering: { color: '#10B981', bgColor: '#ECFDF5', icon: 'gift' },
  };
  return configs[type] || configs.tithe;
};

export default function GivingHistoryScreen() {
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showGiveModal, setShowGiveModal] = useState(false);
  const [giveAmount, setGiveAmount] = useState('');
  const [giveCampaign, setGiveCampaign] = useState('');
  const [givingLoading, setGivingLoading] = useState(false);

  const fetchDonations = useCallback(async () => {
    try {
      const donations = await donationsAPI.getMyDonations();
      setTransactions(donations.map(toTransaction));
    } catch (error: any) {
      // 404 means endpoint not deployed yet — show empty state
      if (error?.response?.status !== 404) {
        console.error('[GivingHistory] fetch error:', error.message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDonations();
  };

  const handleGiveNow = async () => {
    const amount = parseFloat(giveAmount);
    if (!amount || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid donation amount.');
      return;
    }
    setGivingLoading(true);
    try {
      const donation = await donationsAPI.createDonation({
        amount,
        campaign: giveCampaign.trim() || undefined,
      });

      // Attempt Stripe payment
      const paid = await payForDonation(donation._id);

      setTransactions(prev => [toTransaction({ ...donation, status: paid ? 'Success' : 'Pending' }), ...prev]);
      setShowGiveModal(false);
      setGiveAmount('');
      setGiveCampaign('');

      if (paid) {
        Alert.alert('Thank You!', 'Your donation was successful.');
      } else {
        Alert.alert('Donation Saved', 'Your donation has been recorded. You can complete payment later.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to process donation.');
    } finally {
      setGivingLoading(false);
    }
  };

  const filteredTransactions = selectedCategory === 'all'
    ? transactions
    : transactions.filter(t => t.type === selectedCategory);

  const totalGiving = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + parseFloat((t.amount || '0').replace('$', '').replace(',', '')), 0);

  const stats = [
    { label: 'This Year', value: `$${totalGiving.toLocaleString()}`, change: '', positive: true },
    { label: 'Donations', value: `${transactions.length}`, change: '', positive: true },
  ];

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const config = getTypeConfig(item.type);

    return (
      <TouchableOpacity
        className="bg-white rounded-2xl p-4 mb-3 border border-gray-100"
        onPress={() => {
          setSelectedTransaction(item);
          setShowDetails(true);
        }}
        activeOpacity={0.7}
      >
        <View className="flex-row items-center">
          <View
            className="w-14 h-14 rounded-2xl items-center justify-center"
            style={{ backgroundColor: config.bgColor }}
          >
            <Ionicons name={config.icon as any} size={24} color={config.color} />
          </View>

          <View className="ml-4 flex-1">
            <View className="flex-row items-center justify-between">
              <Text className="text-[#040725] font-semibold text-base" numberOfLines={1}>
                {item.title}
              </Text>
              <Text className="text-[#040725] font-bold text-base">{item.amount}</Text>
            </View>

            <View className="flex-row items-center justify-between mt-1.5">
              <Text className="text-gray-400 text-sm">
                {item.date}
              </Text>
              {item.status === 'pending' ? (
                <View className="flex-row items-center bg-amber-50 px-2 py-0.5 rounded-full">
                  <View className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />
                  <Text className="text-amber-600 text-xs font-medium">Pending</Text>
                </View>
              ) : (
                <View className="flex-row items-center bg-emerald-50 px-2 py-0.5 rounded-full">
                  <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                  <Text className="text-emerald-600 text-xs font-medium ml-1">Completed</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text className="text-gray-500 mt-4">Loading giving history...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-11 h-11 items-center justify-center rounded-full bg-gray-100"
        >
          <Ionicons name="chevron-back" size={24} color={PRIMARY} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-[#040725]">Giving History</Text>
        <View className="w-11" />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={PRIMARY} />
        }
      >
        {/* Summary Card */}
        <View className="px-5 pt-5">
          <LinearGradient
            colors={[PRIMARY, '#0A1045', '#151560']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 24, overflow: 'hidden' }}
          >
            <View style={{ position: 'absolute', top: -48, right: -48, width: 160, height: 160, borderRadius: 80, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
            <View style={{ position: 'absolute', top: 80, right: -24, width: 96, height: 96, borderRadius: 48, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }} />
            <View style={{ position: 'absolute', bottom: -40, left: -40, width: 128, height: 128, borderRadius: 64, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }} />

            <View className="p-6">
              {/* Total Amount */}
              <View className="items-center mb-6">
                <View className="flex-row items-center mb-2">
                  <MaterialCommunityIcons name="hand-coin" size={20} color="#3B82F6" />
                  <Text className="text-gray-400 text-sm ml-2 uppercase tracking-wider">
                    Total Giving
                  </Text>
                </View>
                <Text className="text-white text-5xl font-bold">${Math.floor(totalGiving).toLocaleString()}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 18 }}>.{((totalGiving || 0) % 1).toFixed(2).slice(2)}</Text>
              </View>

              {/* Partner Badge */}
              <View className="flex-row items-center justify-center rounded-2xl py-3 px-4 mb-6" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: 'rgba(59,130,246,0.2)' }}>
                  <FontAwesome5 name="medal" size={18} color="#3B82F6" />
                </View>
                <View className="ml-3">
                  <Text className="text-white font-semibold">Faithful Partner</Text>
                  <Text className="text-gray-400 text-xs">Thank you for your generosity</Text>
                </View>
              </View>

              {/* Stats Row */}
              <View className="flex-row">
                {stats.map((stat, index) => (
                  <View
                    key={index}
                    className="flex-1 items-center"
                    style={index < stats.length - 1 ? { borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.1)' } : {}}
                  >
                    <Text className="text-white text-xl font-bold">{stat.value}</Text>
                    <Text className="text-gray-400 text-xs mt-1">{stat.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Quick Actions */}
        <View className="flex-row px-5 mt-5">
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center bg-white rounded-2xl py-4 mr-2 border border-gray-100"
            activeOpacity={0.7}
            onPress={() => setShowGiveModal(true)}
          >
            <Ionicons name="add-circle" size={20} color={PRIMARY} />
            <Text className="text-[#040725] font-semibold ml-2">Give Now</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center bg-white rounded-2xl py-4 ml-2 border border-gray-100"
            activeOpacity={0.7}
            onPress={() => Alert.alert('Coming Soon', 'Recurring donations will be available soon.')}
          >
            <Ionicons name="repeat" size={20} color={PRIMARY} />
            <Text className="text-[#040725] font-semibold ml-2">Recurring</Text>
          </TouchableOpacity>
        </View>

        {/* Category Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-6"
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => setSelectedCategory(category.id)}
              className={`flex-row items-center px-4 py-2.5 rounded-full mr-3 ${
                selectedCategory === category.id
                  ? 'bg-[#040725]'
                  : 'bg-white border border-gray-200'
              }`}
            >
              <Ionicons
                name={category.icon as any}
                size={16}
                color={selectedCategory === category.id ? '#FFFFFF' : '#6B7280'}
              />
              <Text className={`font-medium text-sm ml-2 ${
                selectedCategory === category.id
                  ? 'text-white'
                  : 'text-gray-600'
              }`}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Transactions List */}
        <View className="px-5 mt-6 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-[#040725] font-bold text-lg">Transactions</Text>
            <View className="flex-row items-center">
              <TouchableOpacity
                className="flex-row items-center bg-white px-3 py-2 rounded-lg border border-gray-200"
                onPress={() => {
                  const nextIndex = categories.findIndex(c => c.id === selectedCategory) + 1;
                  setSelectedCategory(categories[nextIndex % categories.length].id);
                }}
              >
                <Ionicons name="filter" size={16} color="#6B7280" />
                <Text className="text-gray-500 text-sm ml-2">Filter</Text>
              </TouchableOpacity>
            </View>
          </View>

          {filteredTransactions.length > 0 ? (
            <>
              {filteredTransactions.map((item) => (
                <View key={item.id}>
                  {renderTransaction({ item })}
                </View>
              ))}
            </>
          ) : (
            <View className="items-center py-10 bg-white rounded-2xl">
              <Ionicons name="receipt-outline" size={48} color="#D1D5DB" />
              <Text className="text-gray-400 mt-4">No transactions found</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Transaction Details Modal */}
      <Modal
        visible={showDetails}
        transparent
        animationType="slide"
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="bg-white rounded-t-3xl">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
              <Text className="text-lg font-bold text-[#040725]">Transaction Details</Text>
              <TouchableOpacity
                onPress={() => setShowDetails(false)}
                className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
              >
                <Ionicons name="close" size={24} color={PRIMARY} />
              </TouchableOpacity>
            </View>

            {selectedTransaction && (
              <View className="px-5 py-6">
                {/* Amount */}
                <View className="items-center mb-6">
                  <View
                    className="w-16 h-16 rounded-full items-center justify-center mb-3"
                    style={{ backgroundColor: getTypeConfig(selectedTransaction.type).bgColor }}
                  >
                    <Ionicons
                      name={getTypeConfig(selectedTransaction.type).icon as any}
                      size={28}
                      color={getTypeConfig(selectedTransaction.type).color}
                    />
                  </View>
                  <Text className="text-3xl font-bold text-[#040725]">{selectedTransaction.amount}</Text>
                  <Text className="text-gray-500 mt-1">{selectedTransaction.title}</Text>
                </View>

                {/* Details */}
                <View className="bg-gray-50 rounded-2xl p-4">
                  <View className="flex-row justify-between py-3 border-b border-gray-100">
                    <Text className="text-gray-500">Status</Text>
                    <View className="flex-row items-center">
                      <View className={`w-2 h-2 rounded-full mr-2 ${
                        selectedTransaction.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`} />
                      <Text className="text-[#040725] font-medium capitalize">{selectedTransaction.status}</Text>
                    </View>
                  </View>
                  <View className="flex-row justify-between py-3 border-b border-gray-100">
                    <Text className="text-gray-500">Date</Text>
                    <Text className="text-[#040725] font-medium">{selectedTransaction.date}</Text>
                  </View>
                  <View className="flex-row justify-between py-3 border-b border-gray-100">
                    <Text className="text-gray-500">Time</Text>
                    <Text className="text-[#040725] font-medium">{selectedTransaction.time}</Text>
                  </View>
                  <View className="flex-row justify-between py-3">
                    <Text className="text-gray-500">Payment Method</Text>
                    <Text className="text-[#040725] font-medium">{selectedTransaction.paymentMethod}</Text>
                  </View>
                </View>

                {/* Actions */}
                <View className="flex-row mt-6">
                  <TouchableOpacity
                    className="flex-1 flex-row items-center justify-center py-4 bg-gray-100 rounded-xl mr-2"
                    onPress={() => {
                      Share.share({
                        message: `Donation: ${selectedTransaction.title}\nAmount: ${selectedTransaction.amount}\nDate: ${selectedTransaction.date}\nStatus: ${selectedTransaction.status}`,
                      });
                    }}
                  >
                    <Ionicons name="share-outline" size={20} color={PRIMARY} />
                    <Text className="text-[#040725] font-semibold ml-2">Share</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 flex-row items-center justify-center py-4 rounded-xl ml-2"
                    style={{ backgroundColor: PRIMARY }}
                    onPress={() => {
                      Share.share({
                        message: `--- Donation Receipt ---\n\n${selectedTransaction.title}\nAmount: ${selectedTransaction.amount}\nDate: ${selectedTransaction.date}\nTime: ${selectedTransaction.time}\nPayment: ${selectedTransaction.paymentMethod}\nStatus: ${selectedTransaction.status}\n\n--- Mowdministries ---`,
                      });
                    }}
                  >
                    <Ionicons name="download-outline" size={20} color="#FFFFFF" />
                    <Text className="text-white font-semibold ml-2">Receipt</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View className="h-8" />
          </View>
        </View>
      </Modal>

      {/* Give Now Modal */}
      <Modal visible={showGiveModal} transparent animationType="slide">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <View className="bg-white rounded-t-3xl px-5 pt-5 pb-8">
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-lg font-bold text-[#040725]">Give Now</Text>
                <TouchableOpacity
                  onPress={() => setShowGiveModal(false)}
                  className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
                >
                  <Ionicons name="close" size={22} color={PRIMARY} />
                </TouchableOpacity>
              </View>

              <Text className="text-gray-500 text-sm mb-2 font-medium">Amount ($)</Text>
              <TextInput
                value={giveAmount}
                onChangeText={setGiveAmount}
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
                className="bg-gray-50 rounded-xl px-4 py-3.5 text-lg font-bold border border-gray-100 mb-4"
                style={{ color: PRIMARY }}
              />

              <Text className="text-gray-500 text-sm mb-2 font-medium">Campaign (optional)</Text>
              <TextInput
                value={giveCampaign}
                onChangeText={setGiveCampaign}
                placeholder="e.g. Tithe, Missions, Youth"
                placeholderTextColor="#9CA3AF"
                className="bg-gray-50 rounded-xl px-4 py-3.5 text-base border border-gray-100 mb-6"
                style={{ color: PRIMARY }}
              />

              <TouchableOpacity
                onPress={handleGiveNow}
                disabled={givingLoading || !giveAmount}
                className="rounded-xl py-4 items-center"
                style={{ backgroundColor: giveAmount ? PRIMARY : '#D1D5DB' }}
              >
                {givingLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-bold text-base">Submit Donation</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
