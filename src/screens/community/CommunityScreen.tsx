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
  StyleSheet,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import groupsAPI, { Group } from '../../services/groupsAPI';

const PRIMARY = '#040725';
const ACCENT = '#007AFF';
const BG = '#F4F6FB';
const CARD_BG = '#FFFFFF';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const getGroupColor = (id: string): [string, string] => {
  const colors: [string, string][] = [
    ['#3B82F6', '#2563EB'],
    ['#8B5CF6', '#7C3AED'],
    ['#F97316', '#EA580C'],
    ['#10B981', '#059669'],
    ['#EF4444', '#DC2626'],
    ['#EC4899', '#DB2777'],
    ['#14B8A6', '#0D9488'],
    ['#F59E0B', '#D97706'],
  ];
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const getInitials = (name: string): string =>
  name.split(/[\s\-,]+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');

const getRelativeTime = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
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
  const [searchFocused, setSearchFocused] = useState(false);

  const filters = ['All', 'Public', 'Private'];

  useEffect(() => { fetchGroups(); }, []);

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

  // ─── My Group Horizontal Card ─────────────────────────────────────────
  const renderMyGroupCard = ({ item: group }: { item: Group }) => {
    const colors = getGroupColor(group._id);
    const initials = getInitials(group.name);
    const isLeaving = leavingGroupId === group._id;

    return (
      <TouchableOpacity
        style={styles.myGroupCard}
        onPress={() => navigation.navigate('GroupChat', { groupId: group._id, groupName: group.name, groupImage: group.image || group.avatar || '' })}
        onLongPress={() => handleLeaveGroup(group._id, group.name)}
        activeOpacity={0.8}
      >
        {isLeaving && (
          <View style={styles.myGroupCardOverlay}>
            <ActivityIndicator size="small" color="#fff" />
          </View>
        )}
        {group.avatar || group.image ? (
          <Image source={{ uri: group.avatar || group.image }} style={styles.myGroupAvatar} />
        ) : (
          <LinearGradient colors={colors} style={styles.myGroupAvatar}>
            <Text style={styles.myGroupInitials}>{initials}</Text>
          </LinearGradient>
        )}
        <Text style={styles.myGroupName} numberOfLines={1}>{group.name}</Text>
        <View style={styles.myGroupMeta}>
          <Ionicons name="people" size={10} color="rgba(4,7,37,0.35)" />
          <Text style={styles.myGroupMembers}>{group.memberCount || 0}</Text>
        </View>
        {group.isPrivate && (
          <View style={styles.myGroupLock}>
            <Ionicons name="lock-closed" size={8} color="#fff" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // ─── Discover Group Card ──────────────────────────────────────────────
  const renderDiscoverCard = (group: Group) => {
    const isJoining = joiningGroupId === group._id;
    const colors = getGroupColor(group._id);
    const initials = getInitials(group.name);

    return (
      <View key={group._id} style={styles.discoverCard}>
        <View style={styles.discoverCardInner}>
          {/* Left: Avatar */}
          <View style={{ marginRight: 14 }}>
            {group.image || group.avatar ? (
              <Image source={{ uri: group.image || group.avatar }} style={styles.discoverAvatar} />
            ) : (
              <LinearGradient colors={colors} style={styles.discoverAvatar}>
                <Text style={styles.discoverInitials}>{initials}</Text>
              </LinearGradient>
            )}
          </View>

          {/* Center: Info */}
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.discoverName} numberOfLines={1}>{group.name}</Text>
              {group.isPrivate && (
                <View style={styles.privateBadge}>
                  <Ionicons name="lock-closed" size={9} color={ACCENT} />
                </View>
              )}
            </View>
            <Text style={styles.discoverDesc} numberOfLines={2}>{group.description}</Text>
            <View style={styles.discoverMetaRow}>
              <Ionicons name="people-outline" size={12} color="rgba(4,7,37,0.4)" />
              <Text style={styles.discoverMetaText}>{group.memberCount || 0} members</Text>
              <View style={styles.metaDot} />
              <Text style={styles.discoverMetaText}>{getRelativeTime(group.createdAt)}</Text>
            </View>
          </View>

          {/* Right: Join Button */}
          <TouchableOpacity
            style={[styles.joinBtn, isJoining && styles.joinBtnLoading]}
            onPress={() => handleJoinGroup(group._id)}
            disabled={isJoining}
            activeOpacity={0.7}
          >
            {isJoining ? (
              <ActivityIndicator size="small" color={ACCENT} />
            ) : (
              <Text style={styles.joinBtnText}>Join</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ─── Header ───────────────────────────────────────────────────────────
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackBtn} activeOpacity={0.7}>
        <Ionicons name="chevron-back" size={22} color={PRIMARY} />
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text style={styles.headerTitle}>Community</Text>
        <Text style={styles.headerSubtitle}>
          {myGroups.length > 0 ? `${myGroups.length} group${myGroups.length !== 1 ? 's' : ''} joined` : 'Find your community'}
        </Text>
      </View>
    </View>
  );

  // ─── Loading State ────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar barStyle="dark-content" backgroundColor={BG} />
        {renderHeader()}
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={styles.centerStateText}>Loading groups...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Error State ──────────────────────────────────────────────────────
  if (error && !refreshing) {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar barStyle="dark-content" backgroundColor={BG} />
        {renderHeader()}
        <View style={styles.centerState}>
          <View style={styles.errorIcon}>
            <Ionicons name="alert-circle-outline" size={32} color="#EF4444" />
          </View>
          <Text style={styles.errorTitle}>Unable to Load Groups</Text>
          <Text style={styles.errorMsg}>{error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => { setLoading(true); fetchGroups(); }}
            activeOpacity={0.8}
          >
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Main Render ──────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />
      {renderHeader()}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PRIMARY} colors={[PRIMARY]} />
        }
      >
        {/* Search Bar */}
        <View style={{ paddingHorizontal: 20, marginBottom: 6 }}>
          <View style={[styles.searchBar, searchFocused && styles.searchBarFocused]}>
            <Ionicons name="search" size={18} color={searchFocused ? ACCENT : 'rgba(4,7,37,0.3)'} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search groups..."
              placeholderTextColor="rgba(4,7,37,0.3)"
              style={styles.searchInput}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={18} color="rgba(4,7,37,0.25)" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── My Groups (Horizontal) ─────────────────────────────────── */}
        {filteredMyGroups.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Groups</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{filteredMyGroups.length}</Text>
              </View>
            </View>

            <FlatList
              data={filteredMyGroups}
              renderItem={renderMyGroupCard}
              keyExtractor={(item) => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
            />

            <Text style={styles.hintText}>Long press to leave a group</Text>
          </View>
        )}

        {/* ── Discover Section ───────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 20 }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Discover</Text>
            <View style={[styles.countBadge, { backgroundColor: 'rgba(0,122,255,0.1)' }]}>
              <Text style={[styles.countBadgeText, { color: ACCENT }]}>{filteredDiscoverGroups.length}</Text>
            </View>
          </View>

          {/* Filter Pills */}
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
                  style={[styles.filterPill, isActive && styles.filterPillActive]}
                  activeOpacity={0.7}
                >
                  {filter === 'Private' && (
                    <Ionicons
                      name="lock-closed"
                      size={11}
                      color={isActive ? '#fff' : 'rgba(4,7,37,0.4)'}
                      style={{ marginRight: 4 }}
                    />
                  )}
                  {filter === 'Public' && (
                    <Ionicons
                      name="globe-outline"
                      size={12}
                      color={isActive ? '#fff' : 'rgba(4,7,37,0.4)'}
                      style={{ marginRight: 4 }}
                    />
                  )}
                  <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                    {filter}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Discover Cards */}
          {filteredDiscoverGroups.length > 0 ? (
            filteredDiscoverGroups.map(renderDiscoverCard)
          ) : (
            <View style={styles.emptyDiscover}>
              <View style={styles.emptyDiscoverIcon}>
                <Ionicons name="telescope-outline" size={28} color="rgba(4,7,37,0.2)" />
              </View>
              <Text style={styles.emptyDiscoverTitle}>
                {searchQuery ? 'No Groups Found' : 'No Groups Available'}
              </Text>
              <Text style={styles.emptyDiscoverSub}>
                {searchQuery ? 'Try adjusting your search terms' : 'Check back later for new groups'}
              </Text>
            </View>
          )}
        </View>

        {/* ── Full Empty State ────────────────────────────────────────── */}
        {myGroups.length === 0 && discoverGroups.length === 0 && !searchQuery && (
          <View style={styles.fullEmpty}>
            <View style={styles.fullEmptyIcon}>
              <Ionicons name="people-outline" size={40} color="rgba(4,7,37,0.2)" />
            </View>
            <Text style={styles.fullEmptyTitle}>No Groups Yet</Text>
            <Text style={styles.fullEmptySub}>Groups are created by admins. Check back soon!</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG },
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  centerStateText: { color: 'rgba(4,7,37,0.5)', marginTop: 16, fontSize: 14 },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
  },
  headerBackBtn: {
    width: 40, height: 40, borderRadius: 14,
    backgroundColor: 'rgba(4,7,37,0.05)',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 14,
  },
  headerTitle: { color: PRIMARY, fontSize: 22, fontWeight: '800', letterSpacing: -0.4 },
  headerSubtitle: { color: 'rgba(4,7,37,0.4)', fontSize: 12, fontWeight: '500', marginTop: 1 },
  headerAddBtn: {
    width: 40, height: 40, borderRadius: 14,
    backgroundColor: PRIMARY,
    alignItems: 'center', justifyContent: 'center',
  },

  // ── Search ──
  searchBar: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 4,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
    ...Platform.select({
      ios: { shadowColor: PRIMARY, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  searchBarFocused: {
    borderColor: 'rgba(0,122,255,0.25)',
    ...Platform.select({
      ios: { shadowColor: ACCENT, shadowOpacity: 0.1, shadowRadius: 12 },
      android: { elevation: 4 },
    }),
  },
  searchInput: {
    flex: 1, marginLeft: 10, color: PRIMARY, fontSize: 14,
    fontWeight: '500', paddingVertical: Platform.OS === 'ios' ? 0 : 8,
  },

  // ── Section ──
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 14,
  },
  sectionTitle: { color: PRIMARY, fontSize: 17, fontWeight: '800', letterSpacing: -0.2 },
  countBadge: {
    backgroundColor: PRIMARY, borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 2, marginLeft: 8,
  },
  countBadgeText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  hintText: {
    color: 'rgba(4,7,37,0.25)', fontSize: 11, textAlign: 'center', marginTop: 10,
  },

  // ── My Groups (Horizontal Cards) ──
  myGroupCard: {
    width: 100,
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 10,
    ...Platform.select({
      ios: { shadowColor: PRIMARY, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 10 },
      android: { elevation: 3 },
    }),
  },
  myGroupCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 10,
  },
  myGroupAvatar: {
    width: 52, height: 52, borderRadius: 17,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
  },
  myGroupInitials: { color: '#fff', fontSize: 18, fontWeight: '800' },
  myGroupName: { color: PRIMARY, fontSize: 12, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  myGroupMeta: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  myGroupMembers: { color: 'rgba(4,7,37,0.35)', fontSize: 10, fontWeight: '600' },
  myGroupLock: {
    position: 'absolute', top: 8, right: 8,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: 'rgba(4,7,37,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },

  // ── Discover Cards ──
  discoverCard: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    marginBottom: 10,
    ...Platform.select({
      ios: { shadowColor: PRIMARY, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  discoverCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  discoverAvatar: {
    width: 52, height: 52, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  discoverInitials: { color: '#fff', fontSize: 17, fontWeight: '800' },
  discoverName: { color: PRIMARY, fontSize: 15, fontWeight: '700', flex: 1 },
  discoverDesc: {
    color: 'rgba(4,7,37,0.5)', fontSize: 12.5, lineHeight: 17,
    marginTop: 3, marginBottom: 6,
  },
  discoverMetaRow: { flexDirection: 'row', alignItems: 'center' },
  discoverMetaText: { color: 'rgba(4,7,37,0.4)', fontSize: 11, fontWeight: '500', marginLeft: 4 },
  metaDot: {
    width: 3, height: 3, borderRadius: 2,
    backgroundColor: 'rgba(4,7,37,0.15)', marginHorizontal: 6,
  },
  privateBadge: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: 'rgba(0,122,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
    marginLeft: 6,
  },
  joinBtn: {
    backgroundColor: 'rgba(0,122,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 9,
    marginLeft: 10,
  },
  joinBtnLoading: { paddingHorizontal: 12 },
  joinBtnText: { color: ACCENT, fontSize: 13, fontWeight: '700' },

  // ── Filter Pills ──
  filterPill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: CARD_BG,
    borderWidth: 1, borderColor: 'rgba(4,7,37,0.08)',
  },
  filterPillActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  filterPillText: { fontSize: 13, fontWeight: '600', color: 'rgba(4,7,37,0.5)' },
  filterPillTextActive: { color: '#FFF' },

  // ── Empty States ──
  emptyDiscover: { alignItems: 'center', paddingVertical: 40 },
  emptyDiscoverIcon: {
    width: 56, height: 56, borderRadius: 18,
    backgroundColor: 'rgba(4,7,37,0.05)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  emptyDiscoverTitle: { color: PRIMARY, fontSize: 16, fontWeight: '700' },
  emptyDiscoverSub: {
    color: 'rgba(4,7,37,0.4)', fontSize: 13, marginTop: 6,
    textAlign: 'center', paddingHorizontal: 32,
  },

  fullEmpty: { alignItems: 'center', paddingVertical: 48 },
  fullEmptyIcon: {
    width: 72, height: 72, borderRadius: 24,
    backgroundColor: 'rgba(4,7,37,0.05)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  fullEmptyTitle: { color: PRIMARY, fontSize: 18, fontWeight: '700' },
  fullEmptySub: {
    color: 'rgba(4,7,37,0.4)', fontSize: 14, marginTop: 6,
    textAlign: 'center', paddingHorizontal: 32,
  },

  createBtn: {
    backgroundColor: PRIMARY, borderRadius: 14,
    paddingHorizontal: 24, paddingVertical: 13,
    marginTop: 20, flexDirection: 'row', alignItems: 'center',
  },
  createBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },

  // ── Error State ──
  errorIcon: {
    width: 64, height: 64, borderRadius: 22,
    backgroundColor: 'rgba(239,68,68,0.1)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  errorTitle: { color: PRIMARY, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  errorMsg: { color: 'rgba(4,7,37,0.5)', fontSize: 14, marginTop: 8, textAlign: 'center' },
  retryBtn: {
    backgroundColor: PRIMARY, borderRadius: 14,
    paddingHorizontal: 24, paddingVertical: 13, marginTop: 20,
  },
  retryBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
});

export default CommunityScreen;
