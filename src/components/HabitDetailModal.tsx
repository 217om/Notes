import React, { useMemo, useState } from 'react';
import {
  Modal,
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
  recentHistory,
  scheduleDescription,
} from '../lib/habits';
import { Habit } from '../lib/types';
import Heatmap from './Heatmap';

export default function HabitDetailModal({
  habit,
  visible,
  onClose,
  onEdit,
}: {
  habit: Habit | null;
  visible: boolean;
  onClose: () => void;
  onEdit: (habit: Habit) => void;
}) {
  const { habits, completions, moveHabit, setArchived, removeHabit } = useStore();
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [confirming, setConfirming] = useState(false);

  const today = startOfToday();
  const stats = useMemo(
    () => (habit ? habitStats(completions, habit, today) : null),
    // today recomputed each open is fine; key on habit + completions
    [habit, completions], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const history = useMemo(
    () => (habit ? recentHistory(completions, habit, today, 30) : []),
    [habit, completions], // eslint-disable-line react-hooks/exhaustive-deps
  );

  if (!habit || !stats) return null;

  const index = habits.findIndex((h) => h.id === habit.id);
  const canUp = index > 0;
  const canDown = index >= 0 && index < habits.length - 1;
  const ratePct = stats.rate === null ? '—' : `${Math.round(stats.rate * 100)}%`;

  const close = () => {
    setConfirming(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={[styles.dot, { backgroundColor: habit.color }]} />
              <Text style={styles.title} numberOfLines={1}>
                {habit.name}
              </Text>
            </View>
            <Pressable onPress={close} hitSlop={10} accessibilityLabel="Close">
              <Ionicons name="close" size={24} color={theme.textMuted} />
            </Pressable>
          </View>

          <ScrollView>
            <Text style={styles.schedule}>
              {FREQUENCY_LABELS[habit.frequency]} · {scheduleDescription(habit)}
              {habit.archived ? ' · Paused' : ''}
            </Text>

            <View style={styles.statsRow}>
              <Stat label="Current streak" value={String(stats.current)} icon="flame" theme={theme} />
              <Stat label="Best streak" value={String(stats.best)} icon="trophy" theme={theme} />
              <Stat label="Completion" value={ratePct} icon="stats-chart" theme={theme} />
            </View>

            <Text style={styles.sectionLabel}>Recent history</Text>
            <Heatmap cells={history} color={habit.color} theme={theme} />

            <Text style={styles.sectionLabel}>Order</Text>
            <View style={styles.actionRow}>
              <ActionBtn
                label="Move up"
                icon="arrow-up"
                disabled={!canUp}
                theme={theme}
                onPress={() => moveHabit(habit.id, -1)}
              />
              <ActionBtn
                label="Move down"
                icon="arrow-down"
                disabled={!canDown}
                theme={theme}
                onPress={() => moveHabit(habit.id, 1)}
              />
            </View>

            <Text style={styles.sectionLabel}>Manage</Text>
            <View style={styles.actionRow}>
              <ActionBtn
                label="Edit"
                icon="create-outline"
                theme={theme}
                onPress={() => {
                  onClose();
                  onEdit(habit);
                }}
              />
              <ActionBtn
                label={habit.archived ? 'Unpause' : 'Pause'}
                icon={habit.archived ? 'play' : 'pause'}
                theme={theme}
                onPress={() => setArchived(habit.id, !habit.archived)}
              />
            </View>

            {!confirming ? (
              <Pressable
                style={styles.deleteBtn}
                onPress={() => setConfirming(true)}
                accessibilityLabel="Delete habit"
              >
                <Ionicons name="trash-outline" size={18} color={theme.danger} />
                <Text style={styles.deleteText}>Delete</Text>
              </Pressable>
            ) : (
              <View style={styles.confirmBox}>
                <Text style={styles.confirmText}>
                  Delete “{habit.name}” and all its history? This can't be undone.
                </Text>
                <View style={styles.confirmRow}>
                  <Pressable
                    style={[styles.confirmBtn, styles.cancelBtn]}
                    onPress={() => setConfirming(false)}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.confirmBtn, styles.confirmDelete]}
                    onPress={() => {
                      removeHabit(habit.id);
                      close();
                    }}
                  >
                    <Text style={styles.confirmDeleteText}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function Stat({
  label,
  value,
  icon,
  theme,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  theme: Theme;
}) {
  const styles = makeStyles(theme);
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={18} color={theme.text} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ActionBtn({
  label,
  icon,
  onPress,
  theme,
  disabled,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  theme: Theme;
  disabled?: boolean;
}) {
  const styles = makeStyles(theme);
  return (
    <Pressable
      style={[styles.actionBtn, disabled && styles.actionDisabled]}
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={label}
    >
      <Ionicons name={icon} size={18} color={theme.text} />
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: t.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      maxHeight: '85%',
      width: '100%',
      maxWidth: 720,
      alignSelf: 'center',
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: t.hairline,
      alignSelf: 'center',
      marginBottom: 12,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
    dot: { width: 14, height: 14, borderRadius: 7 },
    title: { fontSize: 20, fontFamily: font.bold, color: t.text, flexShrink: 1 },
    schedule: { fontSize: 13, color: t.textMuted, marginBottom: 16 },
    statsRow: { flexDirection: 'row', gap: 10 },
    stat: {
      flex: 1,
      backgroundColor: t.bg,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.border,
      paddingVertical: 14,
      alignItems: 'center',
      gap: 4,
    },
    statValue: { fontSize: 20, fontFamily: font.bold, color: t.text },
    statLabel: { fontSize: 11, color: t.textMuted, textAlign: 'center' },
    sectionLabel: {
      fontSize: 13,
      fontFamily: font.semibold,
      color: t.textMuted,
      marginTop: 20,
      marginBottom: 10,
    },
    actionRow: { flexDirection: 'row', gap: 10 },
    actionBtn: {
      flex: 1,
      flexDirection: 'row',
      gap: 6,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.bg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.border,
      borderRadius: 12,
      paddingVertical: 12,
    },
    actionDisabled: { opacity: 0.4 },
    actionLabel: { color: t.text, fontFamily: font.semibold, fontSize: 14 },
    deleteBtn: {
      flexDirection: 'row',
      gap: 6,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 20,
      marginBottom: 8,
      paddingVertical: 12,
    },
    deleteText: { color: t.danger, fontFamily: font.semibold, fontSize: 14 },
    confirmBox: {
      marginTop: 20,
      backgroundColor: t.bg,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.border,
      padding: 14,
    },
    confirmText: { color: t.text, fontSize: 14, marginBottom: 12 },
    confirmRow: { flexDirection: 'row', gap: 10 },
    confirmBtn: {
      flex: 1,
      paddingVertical: 11,
      borderRadius: 10,
      alignItems: 'center',
    },
    cancelBtn: {
      backgroundColor: 'transparent',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.border,
    },
    cancelText: { color: t.text, fontFamily: font.semibold },
    confirmDelete: { backgroundColor: t.danger },
    confirmDeleteText: { color: '#fff', fontFamily: font.bold },
  });
