import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Testimony } from '../../services/testimoniesApi';

const PRIMARY = '#040725';
const ACCENT = '#3B82F6';

interface MyTestimonyCardProps {
  testimony: Testimony;
  timeAgoText: string;
  onEdit: () => void;
  onDelete: () => void;
}

const MyTestimonyCard = ({
  testimony,
  timeAgoText,
  onEdit,
  onDelete,
}: MyTestimonyCardProps) => {
  return (
    <View
      style={{
        backgroundColor: '#F9FAFB',
        borderRadius: 24,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F3F4F6',
        borderLeftWidth: 4,
        borderLeftColor: ACCENT,
      }}
    >
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                backgroundColor: PRIMARY,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialCommunityIcons name="book-open-variant" size={18} color="#FFFFFF" />
            </View>

            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ color: PRIMARY, fontSize: 15, fontWeight: '800' }}>Your Testimony</Text>
              <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 3 }}>{timeAgoText}</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={onEdit}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: '#EFF6FF',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 8,
              }}
            >
              <Feather name="edit-3" size={16} color={ACCENT} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onDelete}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: '#FEE2E2',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={{ color: PRIMARY, fontSize: 18, fontWeight: '800', marginTop: 16 }}>
          {testimony.title}
        </Text>
        <Text style={{ color: '#4B5563', fontSize: 14, lineHeight: 22, marginTop: 10 }}>
          {testimony.description}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14 }}>
          <View
            style={{
              backgroundColor: testimony.isPublic === false ? '#FEF3C7' : '#DCFCE7',
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 999,
            }}
          >
            <Text
              style={{
                color: testimony.isPublic === false ? '#B45309' : '#15803D',
                fontSize: 11,
                fontWeight: '800',
              }}
            >
              {testimony.isPublic === false ? 'PRIVATE' : 'SHARED'}
            </Text>
          </View>
          <Text style={{ color: '#9CA3AF', fontSize: 12, marginLeft: 10 }}>
            {testimony.commentCount || 0} {testimony.commentCount === 1 ? 'comment' : 'comments'}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default MyTestimonyCard;
