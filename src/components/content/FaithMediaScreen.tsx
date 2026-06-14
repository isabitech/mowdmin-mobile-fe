import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Alert,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import NotificationIconWithBadge from '../NotificationIconWithBadge';
import { FaithMediaItem } from '../../services/faithMediaApi';
import FaithMediaCard from './FaithMediaCard';
import FaithMediaListItem from './FaithMediaListItem';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface FaithMediaScreenProps {
  navigation?: any;
  title: string;
  subtitle: string;
  accentColor: string;
  icon: IoniconName;
  actionLabel: string;
  searchPlaceholder: string;
  featuredLabel: string;
  collectionTitle: string;
  continueTitle: string;
  emptyTitle: string;
  emptySubtitle: string;
  loadItems: () => Promise<FaithMediaItem[]>;
}

const PRIMARY = '#040725';

const FaithMediaScreen = ({
  navigation,
  title,
  subtitle,
  accentColor,
  icon,
  actionLabel,
  searchPlaceholder,
  featuredLabel,
  collectionTitle,
  continueTitle,
  emptyTitle,
  emptySubtitle,
  loadItems,
}: FaithMediaScreenProps) => {
  const [items, setItems] = useState<FaithMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const fetchContent = async () => {
    try {
      const data = await loadItems();
      setItems(data);
    } catch (error) {
      console.error(`[FaithMediaScreen] Failed to load ${title}:`, error);
      Alert.alert('Unable to load content', 'Please try again in a moment.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [loadItems]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchContent();
  };

  const categories = useMemo(() => {
    const unique = new Set<string>();
    items.forEach((item) => {
      if (item.category) {
        unique.add(item.category);
      }
    });
    return ['All', ...Array.from(unique).sort()];
  }, [items]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return items.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;
      const haystack = `${item.title} ${item.description} ${item.category} ${item.author || ''}`.toLowerCase();
      const matchesQuery = !query || haystack.includes(query);

      return matchesCategory && matchesQuery;
    });
  }, [items, searchQuery, selectedCategory]);

  const featuredItem = filteredItems[0];
  const highlightItems = filteredItems.slice(0, 6);
  const continueItems = filteredItems.slice(1, 5);

  const openItem = (item: FaithMediaItem) => {
    if (!item.mediaUrl) {
      Alert.alert('Media unavailable', 'Playback will be available once backend media URLs are connected.');
      return;
    }

    navigation?.navigate('VideoPlayer', {
      videoUrl: item.mediaUrl,
      title: item.title,
      author: item.author || item.category,
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 16,
          }}
        >
          <TouchableOpacity
            onPress={() => navigation?.goBack?.()}
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: '#F3F4F6',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="arrow-back" size={22} color={PRIMARY} />
          </TouchableOpacity>
          <Text style={{ color: PRIMARY, fontSize: 22, fontWeight: '800', marginLeft: 14 }}>
            {title}
          </Text>
        </View>

        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={{ color: '#6B7280', fontSize: 15, marginTop: 14 }}>Loading {title.toLowerCase()}...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingVertical: 16,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <TouchableOpacity
            onPress={() => navigation?.goBack?.()}
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: '#F3F4F6',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="arrow-back" size={22} color={PRIMARY} />
          </TouchableOpacity>
          <View style={{ marginLeft: 14, flex: 1 }}>
            <Text style={{ color: PRIMARY, fontSize: 22, fontWeight: '800' }} numberOfLines={1}>
              {title}
            </Text>
            <Text style={{ color: '#6B7280', fontSize: 12, marginTop: 2 }} numberOfLines={1}>
              {subtitle}
            </Text>
          </View>
        </View>

        <NotificationIconWithBadge
          onPress={() => navigation?.navigate('Notifications')}
          color={PRIMARY}
          size={22}
        />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[accentColor]}
            tintColor={accentColor}
          />
        }
      >
        <View style={{ paddingHorizontal: 20, marginBottom: 18 }}>
          <LinearGradient
            colors={[`${accentColor}22`, '#F8FAFC']}
            style={{
              borderRadius: 24,
              padding: 18,
              borderWidth: 1,
              borderColor: `${accentColor}20`,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                backgroundColor: accentColor,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 14,
              }}
            >
              <Ionicons name={icon} size={22} color="#FFFFFF" />
            </View>
            <Text style={{ color: PRIMARY, fontSize: 20, fontWeight: '800' }}>{title}</Text>
            <Text style={{ color: '#6B7280', fontSize: 14, lineHeight: 22, marginTop: 8 }}>
              {subtitle}
            </Text>
          </LinearGradient>
        </View>

        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#F3F4F6',
              borderRadius: 14,
              paddingHorizontal: 16,
              paddingVertical: 12,
            }}
          >
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={searchPlaceholder}
              placeholderTextColor="#9CA3AF"
              style={{
                flex: 1,
                marginLeft: 12,
                fontSize: 15,
                color: PRIMARY,
              }}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          style={{ marginBottom: 20 }}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
              style={{
                paddingHorizontal: 18,
                paddingVertical: 10,
                borderRadius: 20,
                marginRight: 10,
                backgroundColor: selectedCategory === category ? PRIMARY : '#F3F4F6',
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '700',
                  color: selectedCategory === category ? '#FFFFFF' : '#6B7280',
                }}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {featuredItem ? (
          <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <View
              style={{
                backgroundColor: `${accentColor}15`,
                paddingHorizontal: 12,
                paddingVertical: 5,
                borderRadius: 9,
                alignSelf: 'flex-start',
                marginBottom: 12,
              }}
            >
              <Text style={{ color: accentColor, fontSize: 11, fontWeight: '800', letterSpacing: 1 }}>
                {featuredLabel.toUpperCase()}
              </Text>
            </View>

            <TouchableOpacity onPress={() => openItem(featuredItem)} activeOpacity={0.9}>
              <ImageBackground
                source={{ uri: featuredItem.thumbnail }}
                style={{ height: 220, borderRadius: 24, overflow: 'hidden' }}
              >
                <LinearGradient
                  colors={['transparent', 'rgba(4,7,37,0.95)']}
                  style={{ flex: 1, justifyContent: 'flex-end', padding: 20 }}
                >
                  <View
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.18)',
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 12,
                      alignSelf: 'flex-start',
                      marginBottom: 10,
                    }}
                  >
                    <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>
                      {featuredItem.category}
                    </Text>
                  </View>
                  <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '800' }} numberOfLines={2}>
                    {featuredItem.title}
                  </Text>
                  <Text
                    style={{ color: '#D1D5DB', fontSize: 13, marginTop: 6 }}
                    numberOfLines={2}
                  >
                    {featuredItem.description}
                  </Text>

                  <View
                    style={{
                      alignSelf: 'flex-start',
                      backgroundColor: '#FFFFFF',
                      borderRadius: 22,
                      paddingHorizontal: 18,
                      paddingVertical: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginTop: 16,
                    }}
                  >
                    <Ionicons name="play" size={16} color={accentColor} />
                    <Text style={{ color: PRIMARY, fontSize: 14, fontWeight: '700', marginLeft: 8 }}>
                      {actionLabel}
                    </Text>
                  </View>
                </LinearGradient>
              </ImageBackground>
            </TouchableOpacity>
          </View>
        ) : null}

        {highlightItems.length > 0 ? (
          <View style={{ marginBottom: 24 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                marginBottom: 14,
              }}
            >
              <Text style={{ color: PRIMARY, fontSize: 18, fontWeight: '800' }}>{collectionTitle}</Text>
              <Text style={{ color: accentColor, fontSize: 13, fontWeight: '700' }}>
                {highlightItems.length} items
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              {highlightItems.map((item) => (
                <FaithMediaCard
                  key={item.id}
                  item={item}
                  accentColor={accentColor}
                  actionLabel={actionLabel}
                  onPress={() => openItem(item)}
                />
              ))}
            </ScrollView>
          </View>
        ) : null}

        {continueItems.length > 0 ? (
          <View style={{ paddingHorizontal: 20 }}>
            <Text style={{ color: PRIMARY, fontSize: 18, fontWeight: '800', marginBottom: 16 }}>
              {continueTitle}
            </Text>
            {continueItems.map((item) => (
              <FaithMediaListItem
                key={item.id}
                item={item}
                accentColor={accentColor}
                onPress={() => openItem(item)}
              />
            ))}
          </View>
        ) : null}

        {filteredItems.length === 0 ? (
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 60,
              paddingHorizontal: 36,
            }}
          >
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: '#F3F4F6',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name={icon} size={30} color="#9CA3AF" />
            </View>
            <Text
              style={{
                color: PRIMARY,
                fontSize: 18,
                fontWeight: '800',
                marginTop: 18,
                textAlign: 'center',
              }}
            >
              {emptyTitle}
            </Text>
            <Text
              style={{
                color: '#9CA3AF',
                fontSize: 14,
                textAlign: 'center',
                marginTop: 8,
                lineHeight: 22,
              }}
            >
              {emptySubtitle}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

export default FaithMediaScreen;
