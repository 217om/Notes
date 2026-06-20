import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  LayoutChangeEvent,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import {
  useFonts,
  PublicSans_400Regular,
  PublicSans_500Medium,
  PublicSans_600SemiBold,
  PublicSans_700Bold,
} from '@expo-google-fonts/public-sans';
import { StoreProvider, useStore } from './src/lib/store';
import { Theme, font, useTheme } from './src/lib/theme';
import CalendarScreen from './src/components/CalendarScreen';
import HabitsScreen from './src/components/HabitsScreen';

type Tab = 'calendar' | 'habits';

const TABS: { key: Tab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'calendar', label: 'Calendar', icon: 'calendar-outline' },
  { key: 'habits', label: 'Habits', icon: 'checkbox-outline' },
];

/** A single tab with Apple-style spring press feedback. */
function TabButton({
  item,
  active,
  theme,
  onPress,
}: {
  item: (typeof TABS)[number];
  active: boolean;
  theme: Theme;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const spring = (to: number) =>
    Animated.spring(scale, {
      toValue: to,
      useNativeDriver: true,
      speed: 50,
      bounciness: 12,
    }).start();

  return (
    <Pressable
      style={styles.tabButton}
      onPress={onPress}
      onPressIn={() => spring(0.86)}
      onPressOut={() => spring(1)}
    >
      <Animated.View style={[styles.tabInner, { transform: [{ scale }] }]}>
        <Ionicons
          name={item.icon}
          size={22}
          color={active ? theme.text : theme.textMuted}
        />
        <Text
          style={[
            styles.tabLabel,
            { color: active ? theme.text : theme.textMuted },
          ]}
        >
          {item.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

/** Frosted "liquid glass" floating tab bar with a sliding active pill. */
function GlassTabBar({
  tab,
  setTab,
  theme,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  theme: Theme;
}) {
  const [trackWidth, setTrackWidth] = useState(0);
  const index = TABS.findIndex((t) => t.key === tab);
  const translateX = useRef(new Animated.Value(0)).current;

  const slot = trackWidth / TABS.length;
  const PILL_INSET = 6;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: index * slot,
      useNativeDriver: true,
      speed: 18,
      bounciness: 10,
    }).start();
  }, [index, slot, translateX]);

  const onLayout = (e: LayoutChangeEvent) =>
    setTrackWidth(e.nativeEvent.layout.width);

  return (
    <View style={styles.tabBarWrap} pointerEvents="box-none">
      <View
        style={[
          styles.tabBar,
          { borderColor: theme.glassBorder, shadowColor: '#000' },
        ]}
      >
        <BlurView
          intensity={60}
          tint={theme.glassTint}
          style={StyleSheet.absoluteFill}
        />
        {/* translucent wash so the glass reads on plain backgrounds too */}
        <View
          style={[StyleSheet.absoluteFill, { backgroundColor: theme.glassBg }]}
        />

        <View style={styles.track} onLayout={onLayout}>
          {slot > 0 && (
            <Animated.View
              style={[
                styles.pill,
                {
                  width: slot - PILL_INSET * 2,
                  left: PILL_INSET,
                  backgroundColor: theme.pill,
                  borderColor: theme.glassBorder,
                  transform: [{ translateX }],
                },
              ]}
            />
          )}
          {TABS.map((item) => (
            <TabButton
              key={item.key}
              item={item}
              active={item.key === tab}
              theme={theme}
              onPress={() => setTab(item.key)}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

function Shell() {
  const { ready } = useStore();
  const theme = useTheme();
  const [tab, setTab] = useState<Tab>('calendar');

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <View style={styles.content}>
        {!ready ? (
          <View style={styles.loading}>
            <ActivityIndicator color={theme.primary} size="large" />
          </View>
        ) : tab === 'calendar' ? (
          <CalendarScreen />
        ) : (
          <HabitsScreen />
        )}
      </View>

      <GlassTabBar tab={tab} setTab={setTab} theme={theme} />
    </SafeAreaView>
  );
}

export default function App() {
  const [loaded] = useFonts({
    PublicSans_400Regular,
    PublicSans_500Medium,
    PublicSans_600SemiBold,
    PublicSans_700Bold,
  });

  // Public Sans as the global default font for any unstyled <Text>.
  useEffect(() => {
    if (!loaded) return;
    const T = Text as unknown as { defaultProps?: { style?: object } };
    T.defaultProps = T.defaultProps ?? {};
    T.defaultProps.style = [T.defaultProps.style, { fontFamily: font.regular }];
  }, [loaded]);

  if (!loaded) return null;

  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabBarWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 24,
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    width: 280,
    maxWidth: '90%',
    borderRadius: 34,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    paddingVertical: 8,
    paddingHorizontal: 6,
    // soft floating shadow
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  track: {
    flex: 1,
    flexDirection: 'row',
    position: 'relative',
  },
  pill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
  },
  tabButton: { flex: 1 },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 10,
  },
  tabLabel: {
    fontSize: 12,
    fontFamily: font.semibold,
  },
});
