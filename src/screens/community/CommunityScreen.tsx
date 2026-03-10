import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import groupsAPI, { Group } from '../../services/groupsAPI';

const PRIMARY = '#040725';
const { width } = Dimensions.get('window');

// Generate a deterministic color from a string (for group avatar backgrounds)
const getGroupColor = (id: string): [string, string] => {
  const colors: [string, string][] = [
    ['#3B82F6', '#2563EB'], // blue
    ['#8B5CF6', '#7C3AED'], // purple
    ['#F97316', '#EA580C'], // orange
    ['#10B981', '#059669'], // green
    ['#EF4444', '#DC2626'], // red
    ['#EC4899', '#DB2777'], // pink
    ['#14B8A6', '#0D9488'], // teal
    ['#F59E0B', '#D97706'], // amber
  ];
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

// Get initials from group name
const getInitials = (name: string): string => {
  return name
    .split(/[\s\-,]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
};

// Format relative time from date string
const getRelativeTime = (dateStr: string): string => {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
};

const CommunityScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [discoverGroups, setDiscoverGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);
  const [leavingGroupId, setLeavingGroupId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filters = ['All', 'Public', 'Private'];

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = useCallback(async () => {
    try {
      setError(null);
      const [myGroupsData, discoverGroupsData] = await Promise.all([
        groupsAPI.getMyGroups().catch(() => []),
        groupsAPI.getDiscoverGroups().catch(() => []),
      ]);
      setMyGroups(myGroupsData);
      setDiscoverGroups(discoverGroupsData);
    } catch (err: any) {
      console.error('[CommunityScreen] fetchGroups error:', err);
      setError(err.response?.data?.message || 'Failed to load groups. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchGroups();
  }, [fetchGroups]);

  const handleJoinGroup = async (groupId: string) => {
    try {
      setJoiningGroupId(groupId);
      await groupsAPI.joinGroup(groupId);

      const joinedGroup = discoverGroups.find((g) => g._id === groupId);
      if (joinedGroup) {
        setMyGroups((prev) => [...prev, joinedGroup]);
        setDiscoverGroups((prev) => prev.filter((g) => g._id !== groupId));
      }

      Alert.alert('Joined!', 'You have successfully joined the group.', [{ text: 'OK' }]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to join group.', [{ text: 'OK' }]);
    } finally {
      setJoiningGroupId(null);
    }
  };

  const handleLeaveGroup = async (groupId: string, groupName: string) => {
    Alert.alert('Leave Group', `Are you sure you want to leave "${groupName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          try {
            setLeavingGroupId(groupId);
            await groupsAPI.leaveGroup(groupId);

            const leftGroup = myGroups.find((g) => g._id === groupId);
            if (leftGroup) {
              setMyGroups((prev) => prev.filter((g) => g._id !== groupId));
              setDiscoverGroups((prev) => [...prev, leftGroup]);
            }
          } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to leave group.', [{ text: 'OK' }]);
          } finally {
            setLeavingGroupId(null);
          }
        },
      },
    ]);
  };

  // ─── Filtering ──────────────────────────────────────────────────────────────

  const applyPrivacyFilter = (groups: Group[]) => {
    if (activeFilter === 'Public') return groups.filter((g) => !g.isPrivate);
    if (activeFilter === 'Private') return groups.filter((g) => g.isPrivate);
    return groups;
  };

  const filteredDiscoverGroups = applyPrivacyFilter(
    discoverGroups.filter(
      (g) =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const filteredMyGroups = myGroups.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ─── Render Helpers ─────────────────────────────────────────────────────────

  const renderHeader = () => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 14,
      }}
    >
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{
          width: 40,
          height: 40,
          borderRadius: 14,
          backgroundColor: 'rgba(4,7,37,0.06)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-back" size={22} color={PRIMARY} />
      </TouchableOpacity>
      <Text style={{ color: PRIMARY, fontSize: 17, fontWeight: '800', letterSpacing: -0.2 }}>
        Community
      </Text>
      <TouchableOpacity
        onPress={() => navigation.navigate('CreateNewGroup')}
        style={{
          width: 40,
          height: 40,
          borderRadius: 14,
          backgroundColor: PRIMARY,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        activeOpacity={0.7}
      >
        <Ionicons name="add" size={20} color="#FFF" />
      </TouchableOpacity>
    </View>
  );

  const renderMyGroupItem = (group: Group) => {
    const colors = getGroupColor(group._id);
    const initials = getInitials(group.name);
    const isLeaving = leavingGroupId === group._id;

    return (
      <TouchableOpacity
        key={group._id}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 12,
          paddingHorizontal: 4,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(4,7,37,0.06)',
        }}
        onPress={() =>
          navigation.navigate('GroupChat', { groupId: group._id, groupName: group.name })
        }
        onLongPress={() => handleLeaveGroup(group._id, group.name)}
        activeOpacity={0.7}
      >
        {/* Avatar */}
        <View style={{ marginRight: 14 }}>
          {group.avatar || group.image ? (
            <Image
              source={{ uri: group.avatar || group.image }}
              style={{ width: 48, height: 48, borderRadius: 16 }}
            />
          ) : (
            <LinearGradient
              colors={colors}
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '800' }}>{initials}</Text>
            </LinearGradient>
          )}
        </View>

        {/* Info */}
        <View style={{ flex: 1 }}>
          <Text style={{ color: PRIMARY, fontSize: 14, fontWeight: '700' }} numberOfLines={1}>
            {group.name}
          </Text>
          <Text
            style={{ color: 'rgba(4,7,37,0.45)', fontSize: 12, marginTop: 3, fontWeight: '400' }}
            numberOfLines={1}
          >
            {group.lastMessage || group.description}
          </Text>
        </View>

        {/* Meta */}
        <View style={{ alignItems: 'flex-end', marginLeft: 8 }}>
          <Text style={{ color: 'rgba(4,7,37,0.35)', fontSize: 11, fontWeight: '500' }}>
            {group.time || getRelativeTime(group.updatedAt || group.createdAt)}
          </Text>
          {group.isPrivate && (
            <Ionicons
              name="lock-closed"
              size={11}
              color="rgba(4,7,37,0.25)"
              style={{ marginTop: 4 }}
            />
          )}
        </View>

        {isLeaving && (
          <ActivityIndicator size="small" color={PRIMARY} style={{ marginLeft: 8 }} />
        )}
      </TouchableOpacity>
    );
  };

  const renderDiscoverGroupCard = (group: Group) => {
    const isJoining = joiningGroupId === group._id;
    const colors = getGroupColor(group._id);
    const initials = getInitials(group.name);

    return (
      <View
        key={group._id}
        style={{
          backgroundColor: '#FFF',
          borderRadius: 20,
          overflow: 'hidden',
          marginBottom: 14,
          ...Platform.select({
            ios: {
              shadowColor: PRIMARY,
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.06,
              shadowRadius: 10,
            },
            android: { elevation: 3 },
          }),
        }}
      >
        {/* Cover area */}
        {group.image ? (
          <Image source={{ uri: group.image }} style={{ width: '100%', height: 120 }} resizeMode="cover" />
        ) : (
          <LinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: '100%',
              height: 100,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: 'rgba(255,255,255,0.25)', fontSize: 48, fontWeight: '900' }}>
              {initials}
            </Text>
          </LinearGradient>
        )}

        <View style={{ padding: 16 }}>
          {/* Name + privacy */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <Text style={{ color: PRIMARY, fontSize: 16, fontWeight: '700', flex: 1 }} numberOfLines={1}>
              {group.name}
            </Text>
            {group.isPrivate && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: 'rgba(4,7,37,0.06)',
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 8,
                  marginLeft: 8,
                }}
              >
                <Ionicons name="lock-closed" size={11} color="rgba(4,7,37,0.45)" />
                <Text style={{ color: 'rgba(4,7,37,0.45)', fontSize: 11, fontWeight: '600', marginLeft: 3 }}>
                  Private
                </Text>
              </View>
            )}
          </View>

          {/* Meta row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Ionicons name="people-outline" size={13} color="rgba(4,7,37,0.4)" />
            <Text style={{ color: 'rgba(4,7,37,0.4)', fontSize: 12, marginLeft: 4, fontWeight: '500' }}>
              {group.memberCount || 0} members
            </Text>
            <View
              style={{
                width: 3,
                height: 3,
                borderRadius: 2,
                backgroundColor: 'rgba(4,7,37,0.2)',
                marginHorizontal: 8,
              }}
            />
            <Ionicons name="time-outline" size={13} color="rgba(4,7,37,0.4)" />
            <Text style={{ color: 'rgba(4,7,37,0.4)', fontSize: 12, marginLeft: 4, fontWeight: '500' }}>
              {getRelativeTime(group.createdAt)}
            </Text>
          </View>

          {/* Description */}
          <Text
            style={{
              color: 'rgba(4,7,37,0.55)',
              fontSize: 13,
              lineHeight: 20,
              marginBottom: 14,
            }}
            numberOfLines={2}
          >
            {group.description}
          </Text>

          {/* Join button */}
          <TouchableOpacity
            style={{
              backgroundColor: PRIMARY,
              borderRadius: 14,
              paddingVertical: 13,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
            onPress={() => handleJoinGroup(group._id)}
            disabled={isJoining}
            activeOpacity={0.8}
          >
            {isJoining ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Ionicons name="people" size={16} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '700' }}>Join Group</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ─── Loading State ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FC' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FC" />
        {renderHeader()}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={{ color: 'rgba(4,7,37,0.5)', marginTop: 16, fontSize: 14 }}>Loading groups...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Error State ────────────────────────────────────────────────────────────

  if (error && !refreshing) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FC' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FC" />
        {renderHeader()}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 22,
              backgroundColor: 'rgba(239,68,68,0.1)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <Ionicons name="alert-circle-outline" size={32} color="#EF4444" />
          </View>
          <Text style={{ color: PRIMARY, fontSize: 17, fontWeight: '700', textAlign: 'center' }}>
            Unable to Load Groups
          </Text>
          <Text style={{ color: 'rgba(4,7,37,0.5)', fontSize: 14, marginTop: 8, textAlign: 'center' }}>
            {error}
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: PRIMARY,
              borderRadius: 14,
              paddingHorizontal: 24,
              paddingVertical: 13,
              marginTop: 20,
            }}
            onPress={() => {
              setLoading(true);
              fetchGroups();
            }}
            activeOpacity={0.8}
          >
            <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '700' }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Main Render ────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FC' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FC" />
      {renderHeader()}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PRIMARY} colors={[PRIMARY]} />
        }
      >
        {/* Search Bar */}
        <View
          style={{
            backgroundColor: '#FFF',
            borderRadius: 16,
            paddingHorizontal: 16,
            paddingVertical: Platform.OS === 'ios' ? 12 : 4,
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
            ...Platform.select({
              ios: { shadowColor: PRIMARY, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 },
              android: { elevation: 2 },
            }),
          }}
        >
          <Ionicons name="search" size={18} color="rgba(4,7,37,0.35)" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search groups..."
            placeholderTextColor="rgba(4,7,37,0.35)"
            style={{
              flex: 1,
              marginLeft: 10,
              color: PRIMARY,
              fontSize: 14,
              fontWeight: '500',
              paddingVertical: Platform.OS === 'ios' ? 0 : 8,
            }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={18} color="rgba(4,7,37,0.3)" />
            </TouchableOpacity>
          )}
        </View>

        {/* ── My Groups Section ──────────────────────────────────────────── */}
        {filteredMyGroups.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: PRIMARY, fontSize: 16, fontWeight: '800' }}>My Groups</Text>
                <View
                  style={{
                    backgroundColor: PRIMARY,
                    borderRadius: 10,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    marginLeft: 8,
                  }}
                >
                  <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '700' }}>{filteredMyGroups.length}</Text>
                </View>
              </View>
              {myGroups.length > 5 && (
                <TouchableOpacity onPress={() => navigation.navigate('MyGroups')} activeOpacity={0.7}>
                  <Text style={{ color: 'rgba(4,7,37,0.45)', fontSize: 13, fontWeight: '600' }}>See All</Text>
                </TouchableOpacity>
              )}
            </View>

            <View
              style={{
                backgroundColor: '#FFF',
                borderRadius: 18,
                paddingHorizontal: 14,
                ...Platform.select({
                  ios: { shadowColor: PRIMARY, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 },
                  android: { elevation: 2 },
                }),
              }}
            >
              {filteredMyGroups.slice(0, 5).map(renderMyGroupItem)}
            </View>
            <Text style={{ color: 'rgba(4,7,37,0.3)', fontSize: 11, marginTop: 8, textAlign: 'center' }}>
              Long press a group to leave
            </Text>
          </View>
        )}

        {/* ── Discover Groups Section ────────────────────────────────────── */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
            <Text style={{ color: PRIMARY, fontSize: 16, fontWeight: '800' }}>Discover</Text>
            <View
              style={{
                backgroundColor: 'rgba(59,130,246,0.1)',
                borderRadius: 10,
                paddingHorizontal: 8,
                paddingVertical: 2,
                marginLeft: 8,
              }}
            >
              <Text style={{ color: '#3B82F6', fontSize: 11, fontWeight: '700' }}>{filteredDiscoverGroups.length}</Text>
            </View>
          </View>

          {/* Filter Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, marginBottom: 16 }}
          >
            {filters.map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <TouchableOpacity
                  key={filter}
                  onPress={() => setActiveFilter(filter)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 12,
                    backgroundColor: isActive ? PRIMARY : '#FFF',
                    borderWidth: 1,
                    borderColor: isActive ? PRIMARY : 'rgba(4,7,37,0.1)',
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '600',
                      color: isActive ? '#FFF' : 'rgba(4,7,37,0.5)',
                    }}
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Group Cards */}
          {filteredDiscoverGroups.length > 0 ? (
            filteredDiscoverGroups.map(renderDiscoverGroupCard)
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 48 }}>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 18,
                  backgroundColor: 'rgba(4,7,37,0.06)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 14,
                }}
              >
                <Ionicons name="search-outline" size={26} color="rgba(4,7,37,0.25)" />
              </View>
              <Text style={{ color: PRIMARY, fontSize: 16, fontWeight: '700' }}>
                {searchQuery ? 'No Groups Found' : 'No Groups Available'}
              </Text>
              <Text
                style={{
                  color: 'rgba(4,7,37,0.45)',
                  fontSize: 13,
                  marginTop: 6,
                  textAlign: 'center',
                  paddingHorizontal: 32,
                }}
              >
                {searchQuery ? 'Try adjusting your search terms' : 'Check back later for new groups to join'}
              </Text>
            </View>
          )}
        </View>

        {/* ── Empty State ────────────────────────────────────────────────── */}
        {myGroups.length === 0 && discoverGroups.length === 0 && !searchQuery && (
          <View style={{ alignItems: 'center', paddingVertical: 48 }}>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 24,
                backgroundColor: 'rgba(4,7,37,0.06)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <Ionicons name="people-outline" size={36} color="rgba(4,7,37,0.25)" />
            </View>
            <Text style={{ color: PRIMARY, fontSize: 18, fontWeight: '700' }}>No Groups Yet</Text>
            <Text
              style={{
                color: 'rgba(4,7,37,0.45)',
                fontSize: 14,
                marginTop: 6,
                textAlign: 'center',
                paddingHorizontal: 32,
              }}
            >
              Be the first to create a community group
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: PRIMARY,
                borderRadius: 14,
                paddingHorizontal: 24,
                paddingVertical: 13,
                marginTop: 20,
                flexDirection: 'row',
                alignItems: 'center',
              }}
              onPress={() => navigation.navigate('CreateNewGroup')}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={18} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '700' }}>Create Group</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default CommunityScreen;