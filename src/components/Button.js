import React, { useRef } from 'react';
import { Text, Pressable, StyleSheet, Animated } from 'react-native';

export default function Button({ title, onPress, type = 'primary', style, textStyle, ...props }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const isPrimary = type === 'primary';

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.button,
          isPrimary ? styles.primaryButton : styles.secondaryButton
        ]}
        {...props}
      >
        <Text style={[
          styles.text,
          isPrimary ? styles.primaryText : styles.secondaryText,
          textStyle
        ]}>
          {title}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 26, // fully rounded pill
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    shadowColor: '#810b38',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: '#810b38', // primary-container color
  },
  secondaryButton: {
    backgroundColor: '#f5dbc1', // secondary-container color
    shadowColor: '#6e5b47',
    shadowOpacity: 0.1,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  primaryText: {
    color: '#ffffff',
  },
  secondaryText: {
    color: '#5b0024', // deep burgundy
  },
});
