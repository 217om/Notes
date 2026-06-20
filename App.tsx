import React, { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { StoreProvider, useStore } from './src/lib/store';
import { colors } from './src/lib/theme';
import CalendarScreen from './src/components/CalendarScreen';
import HabitsScreen from './src/components/HabitsScreen';

type Tab = 'calendar' | 'habits';

function TabButton({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.tabButton} onPress={onPress}>
      <Ionicons
        name={icon}
        size={22}
        color={active ? colors.primary : colors.textMuted}
      />
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function Shell() {
  const { ready } = useStore();
  const [tab, setTab] = useState<Tab>('calendar');

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <View style={styles.content}>
        {!ready ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : tab === 'calendar' ? (
          <CalendarScreen />
        ) : (
          <HabitsScreen />
        )}
      </View>

      <View style={styles.tabBar}>
        <TabButton
          label="Calendar"
          icon="calendar-outline"
          active={tab === 'calendar'}
          onPress={() => setTab('calendar')}
        />
        <TabButton
          label="Habits"
          icon="checkbox-outline"
          active={tab === 'habits'}
          onPress={() => setTab('habits')}
        />
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingBottom: Platform.OS === 'ios' ? 18 : 8,
    paddingTop: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  tabLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
});
