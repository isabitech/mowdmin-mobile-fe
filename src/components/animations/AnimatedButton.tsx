import React, { useRef } from 'react';
import { Animated, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import { createScaleAnimation } from '../../utils/animations';
import { LoadingDots } from './AnimatedComponents';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  style,
  textStyle,
  variant = 'primary',
  size = 'medium',
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!disabled && !loading) {
      createScaleAnimation(scaleAnim, 0.95, 100).start();
    }
  };

  const handlePressOut = () => {
    if (!disabled && !loading) {
      createScaleAnimation(scaleAnim, 1, 100).start();
    }
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
    };

    // Size variations
    const sizeStyles = {
      small: { paddingVertical: 8, paddingHorizontal: 16 },
      medium: { paddingVertical: 12, paddingHorizontal: 24 },
      large: { paddingVertical: 16, paddingHorizontal: 32 },
    };

    // Variant styles
    const variantStyles = {
      primary: {
        backgroundColor: disabled ? '#94a3b8' : '#0B1448',
      },
      secondary: {
        backgroundColor: disabled ? '#f1f5f9' : '#f8fafc',
        borderWidth: 1,
        borderColor: disabled ? '#cbd5e1' : '#0B1448',
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: disabled ? '#cbd5e1' : '#0B1448',
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: '600',
      textAlign: 'center',
    };

    // Size text styles
    const sizeTextStyles = {
      small: { fontSize: 14 },
      medium: { fontSize: 16 },
      large: { fontSize: 18 },
    };

    // Variant text styles
    const variantTextStyles = {
      primary: { color: disabled ? '#64748b' : '#ffffff' },
      secondary: { color: disabled ? '#94a3b8' : '#0B1448' },
      outline: { color: disabled ? '#94a3b8' : '#0B1448' },
    };

    return {
      ...baseStyle,
      ...sizeTextStyles[size],
      ...variantTextStyles[variant],
    };
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[getButtonStyle(), style]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <LoadingDots 
            size={6} 
            color={variant === 'primary' ? '#ffffff' : '#0B1448'} 
          />
        ) : (
          <Text style={[getTextStyle(), textStyle]}>
            {title}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};