import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { FaithMediaItem } from '../../services/faithMediaApi';

interface FaithMediaCardProps {
  item: FaithMediaItem;
  accentColor: string;
  actionLabel: string;
  onPress: () => void;
}

const FaithMediaCard = ({
  item,
  accentColor,
  actionLabel,
  onPress,
}: FaithMediaCardProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        width: 190,
        marginRight: 16,
      }}
      activeOpacity={0.88}
    >
      <View style={{ position: 'relative' }}>
        <Image
          source={{ uri: item.thumbnail }}
          style={{ width: '100%', height: 168, borderRadius: 20 }}
          contentFit="cover"
          cachePolicy="disk"
          transition={200}
        />

        <View
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            backgroundColor: 'rgba(4,7,37,0.82)',
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 10,
            maxWidth: '72%',
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '700' }} numberOfLines={1}>
            {item.category}
          </Text>
        </View>

        {item.isLive ? (
          <View
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              backgroundColor: '#EF4444',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 10,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: '#FFFFFF',
                marginRight: 5,
              }}
            />
            <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '700' }}>LIVE</Text>
          </View>
        ) : null}

        <View
          style={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            backgroundColor: '#FFFFFF',
            borderRadius: 18,
            paddingHorizontal: 12,
            paddingVertical: 8,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Ionicons name="play" size={14} color={accentColor} />
          <Text style={{ color: '#040725', fontSize: 12, fontWeight: '700', marginLeft: 6 }}>
            {actionLabel}
          </Text>
        </View>
      </View>

      <Text
        style={{ color: '#040725', fontSize: 15, fontWeight: '700', marginTop: 12 }}
        numberOfLines={2}
      >
        {item.title}
      </Text>
      <Text style={{ color: '#6B7280', fontSize: 12, marginTop: 4 }} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
        {item.author ? (
          <Text style={{ color: accentColor, fontSize: 12, fontWeight: '700' }} numberOfLines={1}>
            {item.author}
          </Text>
        ) : null}
        {item.duration ? (
          <>
            {item.author ? <Text style={{ color: '#D1D5DB', marginHorizontal: 6 }}>•</Text> : null}
            <Text style={{ color: '#9CA3AF', fontSize: 12 }}>{item.duration}</Text>
          </>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

export default FaithMediaCard;
