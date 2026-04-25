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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { VideoView, useVideoPlayer } from 'expo-video';
import YoutubePlayer from 'react-native-youtube-iframe';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import HomeHero from '../../components/HomeHero';
import { profileAPI, Profile } from '../../services/profileApi';
import { eventsAPI, Event as APIEvent } from '../../services/eventsApi';
import { bibleVersesAPI } from '../../services/bibleVersesApi';
import mediaAPI, { MediaItemAPI } from '../../services/mediaAPI';
const crusadeImagePlaceholder = require('../../assets/images/events/crusade.jpg');

const { width } = Dimensions.get('window');

const PRIMARY = '#040725';
const ACCENT = '#3B82F6';

// Storage keys
const VERSE_STORAGE_KEY = '@daily_verse';
const VERSE_DATE_KEY = '@daily_verse_date';
const HOME_TOUR_STORAGE_PREFIX = '@app:homeTourSeen:';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DailyVerse {
  text: string;
  reference: string;
  version?: string;
  source?: 'api' | 'cache' | 'fallback'; // Track where the verse came from
}

interface VideoItem {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  isLive?: boolean;
  views?: string;
  media_url?: string;
  type?: string;
  author?: string;
  duration?: string;
}

interface TourStep {
  key: 'hero' | 'quickActions' | 'bibleCard' | 'dailyVerse' | 'events';
  title: string;
  description: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    key: 'hero',
    title: 'Featured Media',
    description:
      'Swipe through featured messages here, then use the top icons for your profile and notifications.',
  },
  {
    key: 'quickActions',
    title: 'Quick Actions',
    description:
      'These shortcuts take you straight to Shop, Donate, Bible Stories, and Community in one tap.',
  },
  {
    key: 'bibleCard',
    title: 'Read Bible',
    description: 'Jump into the Bible from here and continue with today’s reading focus.',
  },
  {
    key: 'dailyVerse',
    title: 'Verse Of The Day',
    description:
      'Your daily scripture shows here, with a quick share action when you want to pass it on.',
  },
  {
    key: 'events',
    title: 'Upcoming Events',
    description:
      'Check upcoming programs here. Tap a card for details or use See All for the full list.',
  },
];

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
      console.log('\n=== DAILY VERSE FETCH START ===');
      console.log('[HomeScreen] Fetching daily verse, forceRefresh:', forceRefresh);

      // Check what's currently cached
      const cachedVerse = await AsyncStorage.getItem(VERSE_STORAGE_KEY);
      const cachedDate = await AsyncStorage.getItem(VERSE_DATE_KEY);
      console.log('[HomeScreen] Current cache date:', cachedDate);
      if (cachedVerse) {
        console.log('[HomeScreen] Current cached verse:', JSON.parse(cachedVerse));
      }

      if (!forceRefresh) {
        // Check cache
        const todayDate = getTodayDateString();
        console.log('[HomeScreen] Cache check - cachedDate:', cachedDate, 'todayDate:', todayDate);

        if (cachedDate === todayDate) {
          if (cachedVerse) {
            const parsed = JSON.parse(cachedVerse);
            
            // Check if cached verse looks like Lorem Ipsum or placeholder
            const isPlaceholder = parsed.text && (
              parsed.text.includes('Lorem') || 
              parsed.text.includes('ipsum') || 
              parsed.text.includes('Cinis') || 
              parsed.text.includes('similique') ||
              parsed.text.includes('consectetur') ||
              parsed.text.includes('adipiscing')
            );
            
            if (isPlaceholder) {
              console.log('[HomeScreen] ⚠️ Cached verse appears to be Lorem Ipsum placeholder, forcing refresh');
              // Don't use cached placeholder, force API call
            } else if (parsed.reference) {
              console.log('[HomeScreen] ✅ Using CACHED verse:', parsed);
              parsed.source = 'cache';
              setVerse(parsed);
              setLoading(false);
              return;
            }
          }
        }
      }

      // Clear old cache to force fresh data
      console.log('[HomeScreen] 🗑️ Clearing cache to force fresh API call');
      await AsyncStorage.multiRemove([VERSE_STORAGE_KEY, VERSE_DATE_KEY]);

      // Fetch from backend API
      console.log('[HomeScreen] 🌐 Fetching from API...');
      const apiVerse = await bibleVersesAPI.getDailyVerse();
      console.log('[HomeScreen] 📥 Raw API response:', JSON.stringify(apiVerse, null, 2));
      
      // Check if API response looks like Lorem Ipsum
      const isApiPlaceholder = apiVerse.text && (
        apiVerse.text.includes('Lorem') || 
        apiVerse.text.includes('ipsum') || 
        apiVerse.text.includes('Cinis') || 
        apiVerse.text.includes('similique') ||
        apiVerse.text.includes('consectetur') ||
        apiVerse.text.includes('adipiscing')
      );
      
      if (isApiPlaceholder) {
        console.log('[HomeScreen] ⚠️ API returned Lorem Ipsum placeholder text!');
        console.log('[HomeScreen] Problematic text:', apiVerse.text);
        throw new Error('API returned placeholder text instead of real Bible verse');
      }
      
      const transformedVerse: DailyVerse = {
        text: apiVerse.text,
        reference: apiVerse.passage,
        version: apiVerse.version,
        source: 'api'
      };

      console.log('[HomeScreen] 🔄 Transformed verse:', JSON.stringify(transformedVerse, null, 2));

      // Cache it
      await AsyncStorage.setItem(VERSE_STORAGE_KEY, JSON.stringify(transformedVerse));
      await AsyncStorage.setItem(VERSE_DATE_KEY, getTodayDateString());
      setVerse(transformedVerse);
      console.log('[HomeScreen] ✅ Daily verse from API fetched and cached successfully');
    } catch (error) {
      console.log('[HomeScreen] ❌ Daily verse fetch error:', error);
      console.log('[HomeScreen] Error details:', error?.response?.data || error?.message);
      
      try {
        const cachedVerse = await AsyncStorage.getItem(VERSE_STORAGE_KEY);
        if (cachedVerse) {
          const parsed = JSON.parse(cachedVerse);
          console.log('[HomeScreen] 💾 Using cached verse after error:', parsed);
          parsed.source = 'cache';
          setVerse(parsed);
          return;
        }
      } catch (cacheError) {
        console.log('[HomeScreen] Cache read error:', cacheError);
      }
      
      const fallbackVerse = { 
        ...fallbackVerses[getDayOfYear() % fallbackVerses.length],
        source: 'fallback' as const
      };
      console.log('[HomeScreen] 🔙 Using FALLBACK verse:', fallbackVerse);
      setVerse(fallbackVerse);
    } finally {
      setLoading(false);
      console.log('=== DAILY VERSE FETCH END ===\n');
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
  const [loading, setLoading] = useState(true);

  const fetchMedia = useCallback(async () => {
    try {
      setLoading(true);
      const response = await mediaAPI.getAllMedia();
      if (response.status === 'success' && response.data?.length > 0) {
        const items: VideoItem[] = response.data.slice(0, 5).map((m: MediaItemAPI) => ({
          id: m._id,
          title: m.title,
          category: m.category_id?.name || 'Media',
          thumbnail: m.thumbnail || 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&h=1000&fit=crop',
          isLive: m.isLive,
          media_url: m.media_url,
          type: m.type,
          author: m.author,
          duration: m.duration,
        }));
        setMediaItems(items);
      }
    } catch {
      // Silently fail — fallback videos will be used
    } finally {
      setLoading(false);
    }
  }, []);

  return { mediaItems, loading, fetchMedia };
};

// ─── Component ───────────────────────────────────────────────────────────────

const HomeScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const videoFlatListRef = useRef<FlatList>(null);
  
  // Inline video player state
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [currentMedia, setCurrentMedia] = useState<VideoItem | null>(null);
  const player = useVideoPlayer(currentMedia?.media_url || '', player => {
    player.loop = false;
    player.muted = false;
  });

  const { verse, loading: verseLoading, fetchVerse } = useDailyVerse();
  const { profile, loading: profileLoading, fetchProfile } = useProfile();
  const { events, loading: eventsLoading, fetchEvents } = useEvents();
  const { mediaItems, loading: mediaLoading, fetchMedia } = useMedia();

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

  const handleQuickActionPress = useCallback((actionLabel: string, nav: string) => {
    if (actionLabel === 'Donate') {
      Alert.alert('Coming Soon', 'Donate is coming soon');
      return;
    }

    navigation?.navigate(nav);
  }, [navigation]);

  // Handle video playback
  const isYouTubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const getYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handlePlayMedia = useCallback((item: VideoItem) => {
    if (item.media_url) {
      if (playingVideoId === item.id) {
        // Stop playing if same video is clicked
        setPlayingVideoId(null);
        setCurrentMedia(null);
        if (player) {
          player.pause();
        }
      } else {
        // Start playing new video
        setPlayingVideoId(item.id);
        setCurrentMedia(item);
      }
    } else {
      Alert.alert('No Video', 'This media item does not have a video URL available.');
    }
  }, [playingVideoId, player]);

  const handleFullscreen = useCallback((item: VideoItem) => {
    // Navigate to a fullscreen video player screen
    navigation?.navigate('FullscreenVideo', {
      videoUrl: item.media_url,
      title: item.title,
      author: item.author || item.category,
      isYouTube: isYouTubeUrl(item.media_url || '')
    });
  }, [navigation]);

  const closeVideoModal = useCallback(() => {
    // This function is no longer needed but keeping for compatibility
    setPlayingVideoId(null);
    setCurrentMedia(null);
    if (player) {
      player.pause();
    }
  }, [player]);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentVideoIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const fallbackVideos: VideoItem[] = [
    { 
      id: '2', 
      title: 'Praise Unplugged', 
      category: 'Pastor Michael Adams', 
      thumbnail: 'https://images.unsplash.com/photo-1508025690966-2a9a1957da31?w=800&h=1000&fit=crop', 
      views: '2.3k',
      media_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    },
  ];
  // Determine what videos to show
  const getVideosToShow = () => {
    if (mediaLoading) {
      return []; // Empty array will trigger loading state
    }
    return mediaItems.length > 0 ? mediaItems : fallbackVideos;
  };
  
  const videos: VideoItem[] = getVideosToShow();

  // ─── Sub-renders ─────────────────────────────────────────────────────────────

  const renderVideoItem = ({ item }: { item: VideoItem }) => {
    const isPlaying = playingVideoId === item.id;
    const isCurrentMediaItem = currentMedia?.id === item.id;

    return (
      <View style={{ 
        width, 
        height: 460,
        zIndex: isPlaying ? 1000 : 1,
        elevation: isPlaying ? 1000 : 1,
      }}>
        {isPlaying && item.media_url && isCurrentMediaItem ? (
          // Show video player when playing
          <>
            {isYouTubeUrl(item.media_url) ? (
              <YoutubePlayer
                height={460}
                play={true}
                videoId={getYouTubeVideoId(item.media_url) || ''}
                onChangeState={(state) => {
                  if (state === 'ended') {
                    setPlayingVideoId(null);
                    setCurrentMedia(null);
                  }
                }}
                onError={(error) => {
                  console.log('YouTube player error:', error);
                  Alert.alert('Error', 'Failed to load YouTube video');
                  setPlayingVideoId(null);
                  setCurrentMedia(null);
                }}
              />
            ) : (
              <VideoView
                style={{ 
                  width: '100%', 
                  height: '100%',
                  zIndex: 1001,
                }}
                player={player}
                fullscreenOptions={{ enabled: false }}
                allowsPictureInPicture={false}
              />
            )}
          </>
        ) : (
          // Show thumbnail when not playing
          <Image
            source={{ uri: item.thumbnail }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        )}

        {/* Overlay gradient - show for both thumbnail and video */}
        <LinearGradient
          colors={['rgba(4,7,37,0.7)', 'transparent', 'rgba(4,7,37,0.95)']}
          locations={[0, 0.3, 1]}
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            zIndex: isPlaying ? 1002 : 2,
          }}
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
              zIndex: isPlaying ? 1003 : 3,
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
              zIndex: isPlaying ? 1003 : 3,
            }}
          >
            <Ionicons name="eye-outline" size={13} color="#FFF" />
            <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '600' }}>{item.views}</Text>
          </View>
        )}

        {/* Play/Pause Button */}
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
            zIndex: isPlaying ? 1004 : 4,
          }}
          activeOpacity={0.7}
          onPress={() => handlePlayMedia(item)}
        >
          <Ionicons 
            name={isPlaying ? "pause" : "play"} 
            size={28} 
            color="#FFF" 
            style={{ marginLeft: isPlaying ? 0 : 3 }} 
          />
        </TouchableOpacity>

        {/* Fullscreen Button - only show when video is playing */}
        {isPlaying && (
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255,255,255,0.12)',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1005,
            }}
            activeOpacity={0.7}
            onPress={() => handleFullscreen(item)}
          >
            <Ionicons name="expand" size={20} color="#FFF" />
          </TouchableOpacity>
        )}

        {/* Video Info */}
        <View style={{ 
          position: 'absolute', 
          bottom: 32, 
          left: 20, 
          right: 20,
          zIndex: isPlaying ? 1003 : 3,
        }}>
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
  };

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
            source={{uri: event.image || crusadeImagePlaceholder}}
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
        {mediaLoading ? (
          <View style={{ height: 460, backgroundColor: '#040725', justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={{ 
              color: '#FFFFFF', 
              marginTop: 16, 
              fontSize: 16, 
              fontWeight: '600' 
            }}>
              Loading videos...
            </Text>
          </View>
        ) : (
          <HomeHero
            videos={videos}
            currentVideoIndex={currentVideoIndex}
            videoFlatListRef={videoFlatListRef}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            profilePhoto={profilePhoto}
            firstName={firstName}
            profileLoading={profileLoading}
            greeting={greeting}
            navigation={navigation}
          />
        )}

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
                onPress={() => handleQuickActionPress(action.label, action.nav)}
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
                onPress={() => handleQuickActionPress(action.label, action.nav)}
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
                  &quot;{verse.text}&quot;
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
