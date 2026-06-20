import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * A checkbox that springs/pops when its `done` state changes. Purely
 * presentational — the parent owns the toggle.
 */
export default function AnimatedCheck({
  done,
  color,
  size = 32,
}: {
  done: boolean;
  color: string;
  size?: number;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const prev = useRef(done);

  useEffect(() => {
    if (prev.current !== done) {
      prev.current = done;
      Animated.sequence([
        Animated.spring(scale, {
          toValue: 1.3,
          useNativeDriver: true,
          speed: 50,
          bounciness: 16,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 30,
          bounciness: 12,
        }),
      ]).start();
    }
  }, [done, scale]);

  return (
    <Animated.View
      style={[
        styles.box,
        {
          width: size,
          height: size,
          borderRadius: size * 0.28,
          backgroundColor: done ? color : 'transparent',
          borderColor: color,
          transform: [{ scale }],
        },
      ]}
    >
      {done && <Ionicons name="checkmark" size={size * 0.56} color="#fff" />}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
