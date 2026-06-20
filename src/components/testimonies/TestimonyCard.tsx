import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Testimony } from '../../services/testimoniesApi';

const PRIMARY = '#040725';
const ACCENT = '#3B82F6';

interface TestimonyCardProps {
  testimony: Testimony;
  timeAgoText: string;
  onPressLike: () => void;
  onPressComment: () => void;
}

const TestimonyCard = ({
  testimony,
  timeAgoText,
  onPressLike,
  onPressComment,
}: TestimonyCardProps) => {
  return (
    <View
      style={{
        backgroundColor: '#F9FAFB',
        borderRadius: 24,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F3F4F6',
      }}
    >
      <View style={{ padding: 16, paddingBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              width: 46,
              height: 46,
              borderRadius: 23,
              backgroundColor: ACCENT,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '800' }}>
              {(testimony.author?.name || 'A').charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={{ color: PRIMARY, fontSize: 16, fontWeight: '800' }}>
              {testimony.author?.name || 'Anonymous'}
            </Text>
            <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 3 }}>{timeAgoText}</Text>
          </View>

        <View
          style={{
            backgroundColor: '#EFF6FF',
            borderRadius: 999,
              paddingHorizontal: 10,
            paddingVertical: 6,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Ionicons name="sparkles" size={14} color={ACCENT} />
          <Text style={{ color: ACCENT, fontSize: 11, fontWeight: '800', marginLeft: 5 }}>
            TESTIMONY
          </Text>
        </View>
        </View>

        <Text style={{ color: PRIMARY, fontSize: 18, fontWeight: '800', marginTop: 16 }}>
          {testimony.title}
        </Text>
        <Text style={{ color: '#4B5563', fontSize: 14, lineHeight: 22, marginTop: 10 }}>
          {testimony.description}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginTop: 4 }}>
        <MaterialCommunityIcons name="hand-clap" size={14} color="#9CA3AF" />
        <Text style={{ color: '#9CA3AF', fontSize: 12, marginLeft: 6 }}>
          {testimony.likeCount || 0} {(testimony.likeCount || 0) === 1 ? 'encouragement' : 'encouragements'}
        </Text>

        {testimony.commentCount ? (
          <>
            <Text style={{ color: '#D1D5DB', marginHorizontal: 8 }}>•</Text>
            <Text style={{ color: '#9CA3AF', fontSize: 12 }}>
              {testimony.commentCount} {testimony.commentCount === 1 ? 'comment' : 'comments'}
            </Text>
          </>
        ) : null}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 12 }}>
        <TouchableOpacity
          onPress={onPressLike}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: testimony.isLiked ? '#BFDBFE' : '#E5E7EB',
            backgroundColor: testimony.isLiked ? '#EFF6FF' : '#FFFFFF',
            marginRight: 10,
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name={testimony.isLiked ? 'heart' : 'heart-outline'}
            size={16}
            color={testimony.isLiked ? ACCENT : '#6B7280'}
          />
          <Text
            style={{
              color: testimony.isLiked ? ACCENT : '#374151',
              fontSize: 14,
              fontWeight: '700',
              marginLeft: 7,
            }}
          >
            {testimony.isLiked ? 'Inspired' : 'Inspire Me'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onPressComment}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: '#E5E7EB',
            backgroundColor: '#FFFFFF',
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="chatbubble-outline" size={16} color="#6B7280" />
          <Text style={{ color: '#374151', fontSize: 14, fontWeight: '700', marginLeft: 7 }}>
            Comment
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TestimonyCard;
