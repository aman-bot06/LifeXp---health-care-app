import React, { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { View } from "react-native";

export { FadeIn, FadeInDown, FadeInUp };

export function FadeInView({ children, delay = 0, style }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.set(withTiming(1, { duration: 400 }));
    translateY.set(withSpring(0, { damping: 15 }));
  }, [opacity, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.get(),
    transform: [{ translateY: translateY.get() }],
  }));

  return (
    <Animated.View style={[style, animStyle]} entering={FadeIn.delay(delay).duration(400)}>
      {children}
    </Animated.View>
  );
}

export function PulseView({ children, style }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    const pulse = () => {
      scale.set(withTiming(1.05, { duration: 800 }, () => {
        scale.set(withTiming(1, { duration: 800 }));
      }));
    };
    pulse();
    const id = setInterval(pulse, 1600);
    return () => clearInterval(id);
  }, [scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  return <Animated.View style={[style, animStyle]}>{children}</Animated.View>;
}

export function ScalePressable({ children, onPress, style, disabled }) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  return (
    <Animated.View style={[animStyle, style]}>
      <View
        onStartShouldSetResponder={() => !disabled}
        onResponderRelease={() => {
          if (!disabled) {
            scale.set(withSpring(0.95, {}, () => {
              scale.set(withSpring(1));
            }));
            onPress?.();
          }
        }}
      >
        {children}
      </View>
    </Animated.View>
  );
}
