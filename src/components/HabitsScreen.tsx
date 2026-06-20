import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../lib/store';
import { Theme, font, useTheme } from '../lib/theme';
import { startOfToday } from '../lib/dates';
import {
  FREQUENCY_LABELS,
  habitStats,
  isCompleted,
  isScheduledOn,
  scheduleDescription,
} from '../lib/habits';
import { successHaptic, tickHaptic } from '../lib/haptics';
import { Habit } from '../lib/types';
import AnimatedCheck from './AnimatedCheck';
import HabitFormModal from './HabitFormModal';
import HabitDetailModal from './HabitDetailModal';
import SettingsModal from './SettingsModal';

function currentPeriodLabel(habit: Habit): string {
  switch (habit.frequency) {
    case 'daily':
      return 'today';
    case 'weekly':
      return 'this week';
    case 'monthly':
      return 'this month';
  }
}

export default function HabitsScreen() {
  const { habits, completions, toggle, settings } = useStore();
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const today = startOfToday();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);
  const [detail, setDetail] = useState<Habit | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const active = habits.filter((h) => !h.archived);
  const archived = habits.filter((h) => h.archived);

  // Keep the detail modal's data fresh as the store changes.
  const detailHabit = detail ? habits.find((h) => h.id === detail.id) ?? null : null;

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  // --- "All done today" celebration ----------------------------------------
  const dueToday = active.filter((h) => isScheduledOn(h, today));
  const allDone =
    dueToday.length > 0 && dueToday.every((h) => isCompleted(completions, h, today));
  const celebrate = useRef(new Animated.Value(0)).current;
  const wasAllDone = useRef(allDone);

  useEffect(() => {
    if (allDone && !wasAllDone.current) {
      successHaptic();
      Animated.sequence([
        Animated.spring(celebrate, { toValue: 1, useNativeDriver: true, bounciness: 14, speed: 12 }),
        Animated.delay(1100),
        Animated.timing(celebrate, { toValue: 0, duration: 350, useNativeDriver: true }),
      ]).start();
    }
    wasAllDone.current = allDone;
  }, [allDone, celebrate]);

  const renderCard = (habit: Habit) => {
    const done = isCompleted(completions, habit, today);
    const stats = habitStats(completions, habit, today);
    return (
      <View key={habit.id} style={styles.card}>
        <Pressable
          onPress={() => {
            toggle(habit, today);
            tickHaptic();
          }}
          accessibilityLabel={`Toggle ${habit.name}`}
          disabled={habit.archived}
          style={habit.archived && styles.dim}
        >
          <AnimatedCheck done={done} color={habit.color} />
        </Pressable>

        <Pressable
          style={styles.cardBody}
          onPress={() => setDetail(habit)}
          accessibilityLabel={`Open ${habit.name}`}
        >
          <Text style={[styles.habitName, done && styles.habitNameDone]}>
            {habit.name}
          </Text>
          <View style={styles.metaRow}>
            <View style={[styles.badge, { backgroundColor: habit.color + '33' }]}>
              <Text style={[styles.badgeText, { color: habit.color }]}>
                {FREQUENCY_LABELS[habit.frequency]}
              </Text>
            </View>
            {stats.current > 0 && (
              <View style={styles.streak}>
                <Ionicons name="flame" size={12} color={theme.textMuted} />
                <Text style={styles.streakText}>{stats.current}</Text>
              </View>
            )}
            <Text style={styles.schedule}>{scheduleDescription(habit)}</Text>
          </View>
        </Pressable>

        <Pressable
          style={styles.chev}
          onPress={() => setDetail(habit)}
          hitSlop={8}
          accessibilityLabel="Details"
        >
          <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
        </Pressable>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Habits</Text>
        <View style={styles.headerActions}>
          <Pressable
            style={styles.iconBtn}
            onPress={() => setSettingsOpen(true)}
            hitSlop={8}
            accessibilityLabel="Settings"
          >
            <Ionicons name="settings-outline" size={20} color={theme.text} />
          </Pressable>
          <Pressable style={styles.addBtn} onPress={openAdd} accessibilityLabel="New habit">
            <Ionicons name="add" size={20} color={theme.onPrimary} />
            <Text style={styles.addBtnText}>New</Text>
          </Pressable>
        </View>
      </View>

      {habits.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="leaf-outline" size={48} color={theme.textMuted} />
          <Text style={styles.emptyTitle}>No habits yet</Text>
          <Text style={styles.emptySubtitle}>
            Add daily, weekly, or monthly habits and tick them off as you go.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {active.map(renderCard)}
          {archived.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Paused</Text>
              {archived.map(renderCard)}
            </>
          )}
        </ScrollView>
      )}

      {/* All-done celebration */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.celebrate,
          {
            opacity: celebrate,
            transform: [
              { scale: celebrate.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) },
            ],
          },
        ]}
      >
        <View style={styles.celebratePill}>
          <Ionicons name="sparkles" size={18} color={theme.onPrimary} />
          <Text style={styles.celebrateText}>All done today!</Text>
        </View>
      </Animated.View>

      <HabitFormModal
        visible={formOpen}
        habit={editing}
        onClose={() => setFormOpen(false)}
      />
      <HabitDetailModal
        habit={detailHabit}
        visible={detailHabit !== null}
        onClose={() => setDetail(null)}
        onEdit={(h) => {
          setEditing(h);
          setFormOpen(true);
        }}
      />
      <SettingsModal visible={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 16 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
    },
    title: { fontSize: 24, fontFamily: font.bold, color: t.text },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    iconBtn: {
      width: 38,
      height: 38,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.border,
    },
    addBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: t.primary,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 10,
    },
    addBtnText: { color: t.onPrimary, fontFamily: font.semibold },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingHorizontal: 32,
    },
    emptyTitle: { fontSize: 18, fontFamily: font.bold, color: t.text },
    emptySubtitle: { fontSize: 14, color: t.textMuted, textAlign: 'center' },
    list: { paddingBottom: 130, gap: 10 },
    sectionLabel: {
      fontSize: 13,
      fontFamily: font.semibold,
      color: t.textMuted,
      marginTop: 14,
      marginBottom: 2,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: t.surface,
      borderRadius: 14,
      padding: 14,
      gap: 12,
    },
    dim: { opacity: 0.5 },
    cardBody: { flex: 1, gap: 4 },
    habitName: { fontSize: 16, fontFamily: font.semibold, color: t.text },
    habitNameDone: { textDecorationLine: 'line-through', color: t.textMuted },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
    badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    badgeText: { fontSize: 11, fontFamily: font.bold },
    streak: { flexDirection: 'row', alignItems: 'center', gap: 2 },
    streakText: { fontSize: 12, color: t.textMuted, fontFamily: font.semibold },
    schedule: { fontSize: 12, color: t.textMuted },
    chev: { padding: 4 },
    celebrate: {
      position: 'absolute',
      top: 80,
      left: 0,
      right: 0,
      alignItems: 'center',
    },
    celebratePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: t.primary,
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderRadius: 24,
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 8,
    },
    celebrateText: { color: t.onPrimary, fontFamily: font.bold, fontSize: 15 },
  });
