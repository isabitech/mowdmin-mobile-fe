import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { FaithMediaItem } from '../../services/faithMediaApi';

interface FaithMediaListItemProps {
  item: FaithMediaItem;
  accentColor: string;
  onPress: () => void;
}

const FaithMediaListItem = ({
  item,
  accentColor,
  onPress,
}: FaithMediaListItemProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 18,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
      }}
      activeOpacity={0.86}
    >
      <Image
        source={{ uri: item.thumbnail }}
        style={{ width: 64, height: 64, borderRadius: 16 }}
        contentFit="cover"
        cachePolicy="disk"
        transition={200}
      />

      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ color: '#040725', fontSize: 15, fontWeight: '700' }} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={{ color: '#6B7280', fontSize: 12, marginTop: 3 }} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
          <View
            style={{
              backgroundColor: `${accentColor}18`,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8,
              marginRight: 8,
            }}
          >
            <Text style={{ color: accentColor, fontSize: 11, fontWeight: '700' }} numberOfLines={1}>
              {item.category}
            </Text>
          </View>
          {item.duration ? <Text style={{ color: '#9CA3AF', fontSize: 12 }}>{item.duration}</Text> : null}
        </View>
      </View>

      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 21,
          backgroundColor: '#040725',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name="play" size={18} color="#FFFFFF" style={{ marginLeft: 2 }} />
      </View>
    </TouchableOpacity>
  );
};

export default FaithMediaListItem;
