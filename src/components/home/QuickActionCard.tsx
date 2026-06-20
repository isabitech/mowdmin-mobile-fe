import React from 'react';
import { TouchableOpacity, Text, View, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface QuickActionCardProps {
  label: string;
  icon: IoniconName;
  colors: readonly [string, string];
  onPress: () => void;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

const QuickActionCard = ({
  label,
  icon,
  colors,
  onPress,
  fullWidth = false,
  style,
}: QuickActionCardProps) => {
  return (
    <TouchableOpacity
      style={[
        {
          width: fullWidth ? '100%' : '48.5%',
          borderRadius: 20,
          overflow: 'hidden',
          height: 92,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={[colors[0], colors[1]]}
        style={{ flex: 1, padding: 16, justifyContent: 'space-between' }}
      >
        <Text style={{ color: '#FFF', fontSize: 15, fontWeight: '700' }}>{label}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Ionicons name={icon} size={20} color="rgba(255,255,255,0.3)" />
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
  );
};

export default QuickActionCard;
