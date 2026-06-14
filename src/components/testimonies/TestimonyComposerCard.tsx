import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

const PRIMARY = '#040725';

interface TestimonyComposerCardProps {
  title: string;
  description: string;
  isEditing: boolean;
  submitting: boolean;
  onChangeTitle: (value: string) => void;
  onChangeDescription: (value: string) => void;
  onSubmit: () => void;
  onCancelEdit: () => void;
}

const TestimonyComposerCard = ({
  title,
  description,
  isEditing,
  submitting,
  onChangeTitle,
  onChangeDescription,
  onSubmit,
  onCancelEdit,
}: TestimonyComposerCardProps) => {
  const disabled = !title.trim() || !description.trim() || submitting;

  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 18,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        marginBottom: 24,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
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
          <Feather name="edit-3" size={18} color="#FFFFFF" />
        </View>
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={{ color: PRIMARY, fontSize: 18, fontWeight: '800' }}>
            {isEditing ? 'Update Your Testimony' : 'Share Your Testimony'}
          </Text>
          <Text style={{ color: '#6B7280', fontSize: 12, marginTop: 3 }}>
            Tell the community what God has done for you.
          </Text>
        </View>
      </View>

      <View style={{ marginBottom: 14 }}>
        <Text style={{ color: '#4B5563', fontSize: 13, fontWeight: '700', marginBottom: 8 }}>
          Title
        </Text>
        <TextInput
          value={title}
          onChangeText={onChangeTitle}
          placeholder="Give your testimony a short title..."
          placeholderTextColor="#9CA3AF"
          style={{
            backgroundColor: '#F9FAFB',
            borderRadius: 16,
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderWidth: 1,
            borderColor: '#F3F4F6',
            color: PRIMARY,
            fontSize: 15,
          }}
        />
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: '#4B5563', fontSize: 13, fontWeight: '700', marginBottom: 8 }}>
          Your Story
        </Text>
        <TextInput
          value={description}
          onChangeText={onChangeDescription}
          placeholder="Share what happened and how God helped you..."
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          style={{
            backgroundColor: '#F9FAFB',
            borderRadius: 16,
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderWidth: 1,
            borderColor: '#F3F4F6',
            color: PRIMARY,
            fontSize: 15,
            minHeight: 140,
          }}
        />
      </View>

      <TouchableOpacity
        onPress={onSubmit}
        disabled={disabled}
        style={{
          borderRadius: 16,
          paddingVertical: 15,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          backgroundColor: disabled ? '#D1D5DB' : PRIMARY,
        }}
      >
        {submitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <Ionicons name="sparkles" size={20} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '800', marginLeft: 8 }}>
              {isEditing ? 'Update Testimony' : 'Share Testimony'}
            </Text>
          </>
        )}
      </TouchableOpacity>

      {isEditing ? (
        <TouchableOpacity onPress={onCancelEdit} style={{ alignItems: 'center', marginTop: 12 }}>
          <Text style={{ color: '#6B7280', fontSize: 13, fontWeight: '700' }}>Cancel editing</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default TestimonyComposerCard;
