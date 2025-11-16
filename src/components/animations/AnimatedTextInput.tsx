import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Text,
    TextInput,
    TextInputProps,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native';
import { ANIMATION_DURATION, createFadeAnimation, createSlideAnimation } from '../../utils/animations';

interface AnimatedTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
}

export const AnimatedTextInput: React.FC<AnimatedTextInputProps> = ({
  label,
  error,
  value,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  onFocus,
  onBlur,
  ...props
}) => {
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;
  const errorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (error) {
      createFadeAnimation(errorAnim, 1, ANIMATION_DURATION.FAST).start();
    } else {
      createFadeAnimation(errorAnim, 0, ANIMATION_DURATION.FAST).start();
    }
  }, [error, errorAnim]);

  const handleFocus = (event: any) => {
    createFadeAnimation(borderAnim, 1, ANIMATION_DURATION.FAST).start();
    if (label) {
      createSlideAnimation(labelAnim, 1, ANIMATION_DURATION.FAST).start();
    }
    onFocus?.(event);
  };

  const handleBlur = (event: any) => {
    createFadeAnimation(borderAnim, 0, ANIMATION_DURATION.FAST).start();
    if (label && !value) {
      createSlideAnimation(labelAnim, 0, ANIMATION_DURATION.FAST).start();
    }
    onBlur?.(event);
  };

  const labelTop = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [18, -8],
  });

  const labelScale = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.8],
  });

  const labelColor = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgb(156, 163, 175)', 'rgb(11, 20, 72)'], // gray-400 to primary
  });

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgb(209, 213, 219)', 'rgb(11, 20, 72)'], // gray-300 to primary
  });

  const errorBorderColor = error ? 'rgb(239, 68, 68)' : borderColor; // red-500

  return (
    <View style={[{ marginVertical: 8 }, containerStyle]}>
      <View style={{ position: 'relative' }}>
        {label && (
          <Animated.Text
            style={[
              {
                position: 'absolute',
                left: 16,
                backgroundColor: '#ffffff',
                paddingHorizontal: 4,
                fontSize: 14,
                fontWeight: '500',
                zIndex: 1,
                transform: [
                  { translateY: labelTop },
                  { scale: labelScale },
                ],
                color: labelColor,
              },
              labelStyle,
            ]}
          >
            {label}
          </Animated.Text>
        )}
        
        <Animated.View
          style={{
            borderWidth: 2,
            borderRadius: 12,
            borderColor: errorBorderColor,
          }}
        >
          <TextInput
            style={[
              {
                paddingHorizontal: 16,
                paddingVertical: 16,
                fontSize: 16,
                color: '#1f2937', // gray-800
                backgroundColor: 'transparent',
              },
              inputStyle,
            ]}
            value={value}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholderTextColor="#9ca3af" // gray-400
            {...props}
          />
        </Animated.View>
      </View>

      <Animated.View
        style={{
          opacity: errorAnim,
          transform: [
            {
              translateY: errorAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-10, 0],
              }),
            },
          ],
        }}
      >
        {error && (
          <Text
            style={[
              {
                color: '#ef4444', // red-500
                fontSize: 12,
                marginTop: 4,
                marginLeft: 4,
              },
              errorStyle,
            ]}
          >
            {error}
          </Text>
        )}
      </Animated.View>
    </View>
  );
};