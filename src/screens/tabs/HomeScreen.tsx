import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  StatusBar,
  ImageBackground,
  ActivityIndicator,
  Platform,
  RefreshControl,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import NotificationIconWithBadge from '../../components/NotificationIconWithBadge';
import { profileAPI, Profile } from '../../services/profileApi';
import { eventsAPI, Event as APIEvent } from '../../services/eventsApi';
import { bibleVersesAPI, DailyVerse as APIDailyVerse } from '../../services/bibleVersesApi';
import mediaAPI, { MediaItemAPI } from '../../services/mediaAPI';

const { width } = Dimensions.get('window');

const PRIMARY = '#040725';
const ACCENT = '#3B82F6';

// Storage keys
const VERSE_STORAGE_KEY = '@daily_verse';
const VERSE_DATE_KEY = '@daily_verse_date';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DailyVerse {
  text: string;
  reference: string;
  version?: string;
}

interface VideoItem {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  isLive?: boolean;
  views?: string;
}

// ─── Fallback data ────────────────────────────────────────────────────────────

const fallbackVerses: DailyVerse[] = [
  { text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.", reference: "John 3:16" },
  { text: "I can do all this through him who gives me strength.", reference: "Philippians 4:13" },
  { text: "Trust in the LORD with all your heart and lean not on your own understanding.", reference: "Proverbs 3:5" },
  { text: "The LORD is my shepherd, I lack nothing.", reference: "Psalm 23:1" },
  { text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the LORD your God will be with you wherever you go.", reference: "Joshua 1:9" },
];

// ─── Utility functions ───────────────────────────────────────────────────────

const getTodayDateString = (): string => {
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
};

const getDayOfYear = (): number =>
  Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const getFirstName = (fullName: string): string => {
  return fullName?.split(' ')[0] || 'there';
};

const formatEventDate = (dateStr: string): { day: string; month: string; full: string } => {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return { day: dateStr.split(' ')[0] || '', month: dateStr.split(' ')[1] || '', full: dateStr };
    }
    return {
      day: date.getDate().toString(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      full: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
  } catch {
    return { day: '', month: '', full: dateStr };
  }
};

// ─── Custom Hooks ────────────────────────────────────────────────────────────

const useDailyVerse = () => {
  const [verse, setVerse] = useState<DailyVerse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchVerse = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);

      if (!forceRefresh) {
        // Check cache
        const cachedDate = await AsyncStorage.getItem(VERSE_DATE_KEY);
        const todayDate = getTodayDateString();

        if (cachedDate === todayDate) {
          const cachedVerse = await AsyncStorage.getItem(VERSE_STORAGE_KEY);
          if (cachedVerse) {
            const parsed = JSON.parse(cachedVerse);
            // Validate it's from our backend (has reference field)
            if (parsed.reference) {
              setVerse(parsed);
              setLoading(false);
              return;
            }
          }
        }
      }

      // Clear old cache
      await AsyncStorage.multiRemove([VERSE_STORAGE_KEY, VERSE_DATE_KEY]);

      // Fetch from backend API
      const apiVerse = await bibleVersesAPI.getDailyVerse();
      const transformedVerse: DailyVerse = {
        text: apiVerse.text,
        reference: apiVerse.passage,
        version: apiVerse.version,
      };

      // Cache it
      await AsyncStorage.setItem(VERSE_STORAGE_KEY, JSON.stringify(transformedVerse));
      await AsyncStorage.setItem(VERSE_DATE_KEY, getTodayDateString());
      setVerse(transformedVerse);
    } catch (error) {
      console.log('[HomeScreen] Daily verse fetch error:', error);
      try {
        const cachedVerse = await AsyncStorage.getItem(VERSE_STORAGE_KEY);
        if (cachedVerse) {
          setVerse(JSON.parse(cachedVerse));
          return;
        }
      } catch {}
      setVerse(fallbackVerses[getDayOfYear() % fallbackVerses.length]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVerse();
  }, [fetchVerse]);

  return { verse, loading, fetchVerse };
};

const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const profileRef = useRef<Profile | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const freshProfile = await profileAPI.getProfile();
      setProfile(freshProfile);
      profileRef.current = freshProfile;
    } catch (err) {
      console.log('[HomeScreen] Profile fetch error:', err);
      if (!profileRef.current) {
        const userData = await AsyncStorage.getItem('@app:userData');
        if (userData) {
          const parsed = JSON.parse(userData);
          const fallback: Profile = {
            id: parsed.id || '',
            name: parsed.name || 'User',
            email: parsed.email || '',
            photo: parsed.profileImage || '',
          };
          setProfile(fallback);
          profileRef.current = fallback;
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return { profile, loading, fetchProfile };
};

const useEvents = () => {
  const [events, setEvents] = useState<APIEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const allEvents = await eventsAPI.getAllEvents();
      const sorted = allEvents.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateA - dateB;
      });
      setEvents(sorted.slice(0, 5));
    } catch (err) {
      console.log('[HomeScreen] Events fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { events, loading, fetchEvents };
};

const useMedia = () => {
  const [mediaItems, setMediaItems] = useState<VideoItem[]>([]);

  const fetchMedia = useCallback(async () => {
    try {
      const response = await mediaAPI.getAllMedia();
      if (response.status === 'success' && response.data?.length > 0) {
        const items: VideoItem[] = response.data.slice(0, 5).map((m: MediaItemAPI) => ({
          id: m._id,
          title: m.title,
          category: m.category_id?.name || 'Media',
          thumbnail: m.thumbnail || 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&h=1000&fit=crop',
          isLive: m.isLive,
        }));
        setMediaItems(items);
      }
    } catch {
      // Silently fail — fallback videos will be used
    }
  }, []);

  return { mediaItems, fetchMedia };
};

// ─── Component ───────────────────────────────────────────────────────────────

const HomeScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const videoFlatListRef = useRef<FlatList>(null);

  const { verse, loading: verseLoading, fetchVerse } = useDailyVerse();
  const { profile, loading: profileLoading, fetchProfile } = useProfile();
  const { events, loading: eventsLoading, fetchEvents } = useEvents();
  const { mediaItems, fetchMedia } = useMedia();

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
      fetchEvents();
      fetchMedia();
    }, [fetchProfile, fetchEvents, fetchMedia])
  );

const onRefresh = useCallback(async () => {
  setRefreshing(true);
  await Promise.all([fetchProfile(), fetchEvents(), fetchVerse(true), fetchMedia()]);
  setRefreshing(false);
}, [fetchProfile, fetchEvents, fetchVerse, fetchMedia]);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentVideoIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const fallbackVideos: VideoItem[] = [
    { id: '1', title: 'Revival Night: Hope in Christ', category: 'Rev. Emmanuel Adeyemi', thumbnail: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&h=1000&fit=crop', isLive: true, views: '4.5k' },
    { id: '2', title: 'Praise Unplugged', category: 'Pastor Michael Adams', thumbnail: 'https://images.unsplash.com/photo-1508025690966-2a9a1957da31?w=800&h=1000&fit=crop', views: '2.3k' },
    { id: '3', title: 'Word Alive Service', category: 'Rev. Emmanuel Adeyemi', thumbnail: 'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=800&h=1000&fit=crop', views: '8.1k' },
  ];
  const videos: VideoItem[] = mediaItems.length > 0 ? mediaItems : fallbackVideos;

  // ─── Sub-renders ─────────────────────────────────────────────────────────────

  const renderVideoItem = ({ item }: { item: VideoItem }) => (
    <View style={{ width, height: 460 }}>
      <Image
        source={{ uri: item.thumbnail }}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['rgba(4,7,37,0.7)', 'transparent', 'rgba(4,7,37,0.95)']}
        locations={[0, 0.3, 1]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* Badge */}
      {item.isLive ? (
        <View
          style={{
            position: 'absolute',
            bottom: 100,
            left: 20,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#EF4444',
            paddingHorizontal: 14,
            paddingVertical: 6,
            borderRadius: 20,
            gap: 6,
          }}
        >
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFF' }} />
          <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 }}>LIVE</Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11 }}>{item.views}</Text>
        </View>
      ) : (
        <View
          style={{
            position: 'absolute',
            bottom: 100,
            left: 20,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.12)',
            paddingHorizontal: 14,
            paddingVertical: 6,
            borderRadius: 20,
            gap: 6,
          }}
        >
          <Ionicons name="eye-outline" size={13} color="#FFF" />
          <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '600' }}>{item.views}</Text>
        </View>
      )}

      {/* Play Button */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: '42%',
          alignSelf: 'center',
          width: 68,
          height: 68,
          borderRadius: 34,
          backgroundColor: 'rgba(255,255,255,0.12)',
          borderWidth: 2,
          borderColor: 'rgba(255,255,255,0.25)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        activeOpacity={0.7}
      >
        <Ionicons name="play" size={28} color="#FFF" style={{ marginLeft: 3 }} />
      </TouchableOpacity>

      {/* Video Info */}
      <View style={{ position: 'absolute', bottom: 32, left: 20, right: 20 }}>
        <View
          style={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 8,
            alignSelf: 'flex-start',
            marginBottom: 10,
          }}
        >
          <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '600' }}>
            {item.category}
          </Text>
        </View>
        <Text style={{ color: '#FFF', fontSize: 24, fontWeight: '800', letterSpacing: -0.5 }}>
          {item.title}
        </Text>
      </View>
    </View>
  );

  const renderEventCard = (event: APIEvent) => {
    const dateInfo = formatEventDate(event.date);

    return (
      <TouchableOpacity
        key={event.id}
        style={{
          width: 260,
          borderRadius: 20,
          overflow: 'hidden',
          backgroundColor: '#FFF',
          ...Platform.select({
            ios: {
              shadowColor: '#040725',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.06,
              shadowRadius: 16,
            },
            android: { elevation: 3 },
          }),
        }}
        onPress={() => navigation?.navigate('Event', { eventId: event.id })}
        activeOpacity={0.85}
      >
        <View style={{ position: 'relative' }}>
          <Image
            source={{ uri: event.image }}
            style={{ width: '100%', height: 130, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)']}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 50 }}
          />
          {/* Date badge */}
          <View
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              backgroundColor: '#FFF',
              borderRadius: 12,
              paddingHorizontal: 10,
              paddingVertical: 6,
              alignItems: 'center',
              ...Platform.select({
                ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
                android: { elevation: 3 },
              }),
            }}
          >
            <Text style={{ color: PRIMARY, fontSize: 16, fontWeight: '800', lineHeight: 18 }}>
              {dateInfo.day}
            </Text>
            <Text style={{ color: 'rgba(4,7,37,0.45)', fontSize: 10, fontWeight: '600', textTransform: 'uppercase' }}>
              {dateInfo.month}
            </Text>
          </View>

          {/* Tag badge */}
          {event.tag && (
            <View
              style={{
                position: 'absolute',
                top: 10,
                left: 10,
                backgroundColor: ACCENT,
                borderRadius: 8,
                paddingHorizontal: 8,
                paddingVertical: 3,
              }}
            >
              <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' }}>
                {event.tag}
              </Text>
            </View>
          )}
        </View>

        <View style={{ padding: 14, gap: 6 }}>
          <Text
            style={{ color: PRIMARY, fontSize: 15, fontWeight: '700' }}
            numberOfLines={2}
          >
            {event.title}
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="time-outline" size={13} color="rgba(4,7,37,0.4)" />
            <Text style={{ color: 'rgba(4,7,37,0.4)', fontSize: 12, fontWeight: '500' }}>
              {event.time}
            </Text>
          </View>

          {event.location ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="location-outline" size={13} color="rgba(4,7,37,0.4)" />
              <Text
                style={{ color: 'rgba(4,7,37,0.4)', fontSize: 12, fontWeight: '500', flex: 1 }}
                numberOfLines={1}
              >
                {event.location}
              </Text>
            </View>
          ) : null}

          {event.hasLiveStream && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 4,
                backgroundColor: 'rgba(239,68,68,0.06)',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 8,
                alignSelf: 'flex-start',
                gap: 5,
              }}
            >
              <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: '#EF4444' }} />
              <Text style={{ color: '#EF4444', fontSize: 11, fontWeight: '600' }}>
                Live Stream
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // ─── Main Render ─────────────────────────────────────────────────────────────

  const displayName = profile?.displayName || profile?.name || '';
  const firstName = displayName ? getFirstName(displayName) : '';
  const profilePhoto = profile?.photo || '';
  const greeting = getGreeting();

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FC' }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        bounces={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={PRIMARY}
            progressViewOffset={insets.top}
          />
        }
      >
        {/* ── Hero Video Section ──────────────────────────────────────────── */}
        <View>
          <View style={{ height: 460 }}>
            <FlatList
              ref={videoFlatListRef}
              data={videos}
              renderItem={renderVideoItem}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
              keyExtractor={(item) => item.id}
            />
          </View>

          {/* Header Overlay */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              paddingHorizontal: 20,
              paddingTop: insets.top + 8,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {/* Profile Avatar */}
                <TouchableOpacity
                  onPress={() => navigation?.navigate('Profile')}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                    borderWidth: 2,
                    borderColor: 'rgba(255,255,255,0.25)',
                    overflow: 'hidden',
                  }}
                  activeOpacity={0.7}
                >
                  {profilePhoto ? (
                    <Image
                      source={{ uri: profilePhoto }}
                      style={{ width: 44, height: 44, borderRadius: 22 }}
                    />
                  ) : (
                    <Text style={{ color: '#FFF', fontSize: 17, fontWeight: '700' }}>
                      {firstName ? firstName.charAt(0).toUpperCase() : 'U'}
                    </Text>
                  )}
                </TouchableOpacity>
                <View>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500' }}>
                    {greeting}
                  </Text>
                  <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '800', letterSpacing: -0.3 }}>
                    {profileLoading ? '...' : firstName || 'Welcome'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                activeOpacity={0.7}
              >
                <NotificationIconWithBadge
                  onPress={() => navigation?.navigate('Notifications')}
                  color="#FFFFFF"
                  size={20}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Pagination Dots */}
          <View
            style={{
              position: 'absolute',
              bottom: 12,
              left: 0,
              right: 0,
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            {videos.map((_, index) => (
              <View
                key={index}
                style={{
                  height: 3,
                  borderRadius: 2,
                  width: currentVideoIndex === index ? 24 : 8,
                  backgroundColor: currentVideoIndex === index ? '#FFF' : 'rgba(255,255,255,0.35)',
                }}
              />
            ))}
          </View>
        </View>

        {/* ── Quick Actions ──────────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 }}>
          <Text style={{ color: PRIMARY, fontSize: 18, fontWeight: '800', marginBottom: 14, letterSpacing: -0.3 }}>
            Quick Actions
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {[
              { label: 'Shop', icon: 'bag-handle' as const, colors: [PRIMARY, '#0A1045'] as const, nav: 'ShopStack' },
              { label: 'Donate', icon: 'heart' as const, colors: ['#F97316', '#EA580C'] as const, nav: 'GivingHistory' },
            ].map((action) => (
              <TouchableOpacity
                key={action.label}
                style={{ flex: 1, borderRadius: 20, overflow: 'hidden', height: 90 }}
                onPress={() => navigation?.navigate(action.nav)}
                activeOpacity={0.85}
              >
                <LinearGradient colors={[...action.colors]} style={{ flex: 1, padding: 16, justifyContent: 'space-between' }}>
                  <Text style={{ color: '#FFF', fontSize: 15, fontWeight: '700' }}>{action.label}</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Ionicons name={action.icon} size={20} color="rgba(255,255,255,0.3)" />
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons name="arrow-forward" size={14} color="rgba(255,255,255,0.7)" />
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            {[
              { label: 'Bible Stories', icon: 'book-outline' as const, colors: ['#8B5CF6', '#7C3AED'] as const, nav: 'BibleStories' },
              { label: 'Community', icon: 'people' as const, colors: ['#10B981', '#059669'] as const, nav: 'Community' },
            ].map((action) => (
              <TouchableOpacity
                key={action.label}
                style={{ flex: 1, borderRadius: 20, overflow: 'hidden', height: 90 }}
                onPress={() => navigation?.navigate(action.nav)}
                activeOpacity={0.85}
              >
                <LinearGradient colors={[...action.colors]} style={{ flex: 1, padding: 16, justifyContent: 'space-between' }}>
                  <Text style={{ color: '#FFF', fontSize: 15, fontWeight: '700' }}>{action.label}</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Ionicons name={action.icon} size={20} color="rgba(255,255,255,0.3)" />
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons name="arrow-forward" size={14} color="rgba(255,255,255,0.7)" />
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Read Bible Card ────────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 20, marginTop: 12, marginBottom: 20 }}>
          <TouchableOpacity
            onPress={() => navigation?.navigate('Bible')}
            style={{
              borderRadius: 24,
              overflow: 'hidden',
              ...Platform.select({
                ios: { shadowColor: PRIMARY, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 20 },
                android: { elevation: 6 },
              }),
            }}
            activeOpacity={0.9}
          >
            <ImageBackground
              source={{ uri: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800&h=400&fit=crop' }}
              style={{ height: 155 }}
            >
              <LinearGradient
                colors={['rgba(4,7,37,0.8)', 'rgba(4,7,37,0.92)']}
                style={{ flex: 1, padding: 20, flexDirection: 'row', alignItems: 'center' }}
              >
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.12)',
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 8,
                      alignSelf: 'flex-start',
                      marginBottom: 10,
                    }}
                  >
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: '700', letterSpacing: 1.2 }}>
                      HOLY BIBLE
                    </Text>
                  </View>
                  <Text style={{ color: '#FFF', fontSize: 22, fontWeight: '800', letterSpacing: -0.3 }}>
                    Read Bible
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginTop: 4 }}>
                    {verse ? `Today: ${verse.reference}` : 'Continue: John 3:16'}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14, gap: 5 }}>
                    <Text style={{ color: '#60A5FA', fontSize: 13, fontWeight: '700' }}>Start Reading</Text>
                    <Ionicons name="arrow-forward" size={14} color="#60A5FA" />
                  </View>
                </View>
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 18,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="book" size={26} color="#FFF" />
                </View>
              </LinearGradient>
            </ImageBackground>
          </TouchableOpacity>
        </View>

        {/* ── Daily Verse ────────────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <View
            style={{
              backgroundColor: '#FFF',
              borderRadius: 22,
              padding: 20,
              borderWidth: 1,
              borderColor: 'rgba(4,7,37,0.06)',
              ...Platform.select({
                ios: { shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12 },
                android: { elevation: 2 },
              }),
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  backgroundColor: PRIMARY,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="sparkles" size={17} color="#FFF" />
              </View>
              <Text
                style={{
                  color: PRIMARY,
                  fontSize: 11,
                  fontWeight: '800',
                  marginLeft: 12,
                  letterSpacing: 1.2,
                }}
              >
                VERSE OF THE DAY
              </Text>
              {verse?.version && (
                <View
                  style={{
                    marginLeft: 'auto',
                    backgroundColor: 'rgba(4,7,37,0.06)',
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 6,
                  }}
                >
                  <Text style={{ color: 'rgba(4,7,37,0.4)', fontSize: 10, fontWeight: '700' }}>
                    {verse.version}
                  </Text>
                </View>
              )}
            </View>

            {verseLoading ? (
              <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={PRIMARY} />
                <Text style={{ color: 'rgba(4,7,37,0.35)', fontSize: 12, marginTop: 8 }}>Loading verse...</Text>
              </View>
            ) : verse ? (
              <>
                <Text
                  style={{
                    color: 'rgba(4,7,37,0.7)',
                    fontSize: 15,
                    fontStyle: 'italic',
                    lineHeight: 24,
                    letterSpacing: 0.1,
                  }}
                >
                  `{verse.text}`
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 18 }}>
                  <View
                    style={{
                      backgroundColor: PRIMARY,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 10,
                    }}
                  >
                    <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '700' }}>{verse.reference}</Text>
                  </View>
                  <TouchableOpacity
                    style={{ marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 4 }}
                    onPress={() => {
                      if (verse) {
                        Share.share({ message: `"${verse.text}"\n\n— ${verse.reference}` });
                      }
                    }}
                  >
                    <Ionicons name="share-outline" size={17} color="rgba(4,7,37,0.35)" />
                    <Text style={{ color: 'rgba(4,7,37,0.35)', fontSize: 12, fontWeight: '600' }}>
                      Share
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <Text style={{ color: 'rgba(4,7,37,0.35)', fontSize: 13, textAlign: 'center', paddingVertical: 12 }}>
                Unable to load verse.
              </Text>
            )}
          </View>
        </View>

        {/* ── Upcoming Events ────────────────────────────────────────────── */}
        <View style={{ marginBottom: 24 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 20,
              marginBottom: 14,
            }}
          >
            <Text style={{ color: PRIMARY, fontSize: 18, fontWeight: '800', letterSpacing: -0.3 }}>
              Upcoming Events
            </Text>
            <TouchableOpacity
              onPress={() => navigation?.navigate('Event')}
              style={{
                backgroundColor: 'rgba(4,7,37,0.05)',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: 'rgba(4,7,37,0.5)', fontSize: 12, fontWeight: '600' }}>See All</Text>
            </TouchableOpacity>
          </View>

          {eventsLoading ? (
            <View style={{ paddingVertical: 30, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={PRIMARY} />
              <Text style={{ color: 'rgba(4,7,37,0.35)', fontSize: 12, marginTop: 8 }}>Loading events...</Text>
            </View>
          ) : events.length === 0 ? (
            <View style={{ paddingVertical: 30, alignItems: 'center', paddingHorizontal: 40 }}>
              <Ionicons name="calendar-outline" size={32} color="rgba(4,7,37,0.15)" />
              <Text style={{ color: 'rgba(4,7,37,0.35)', fontSize: 14, marginTop: 8, textAlign: 'center' }}>
                No upcoming events right now. Check back soon!
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
            >
              {events.map(renderEventCard)}
            </ScrollView>
          )}
        </View>

        {/* Bottom spacer for tab bar */}
        <View style={{ height: insets.bottom + 80 }} />
      </ScrollView>
    </View>
  );
};

export default HomeScreen;