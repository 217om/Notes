import React, { useMemo } from 'react';
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
import { tickHaptic } from '../lib/haptics';
import { MONTH_NAMES, WEEKDAY_LABELS } from '../lib/dates';
import {
  FREQUENCY_LABELS,
  dayStatus,
  isCompleted,
} from '../lib/habits';
import AnimatedCheck from './AnimatedCheck';

export default function DayDetailModal({
  day,
  visible,
  onClose,
}: {
  day: Date | null;
  visible: boolean;
  onClose: () => void;
}) {
  const { habits, completions, toggle } = useStore();
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  if (!day) return null;
  const status = dayStatus(habits, completions, day);
  const title = `${WEEKDAY_LABELS[day.getDay()]}, ${MONTH_NAMES[day.getMonth()]} ${day.getDate()}`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={24} color={theme.textMuted} />
            </Pressable>
          </View>

          {status.total === 0 ? (
            <Text style={styles.empty}>No habits scheduled for this day.</Text>
          ) : (
            <ScrollView style={styles.list}>
              {status.due.map((habit) => {
                const done = isCompleted(completions, habit, day);
                return (
                  <Pressable
                    key={habit.id}
                    style={styles.row}
                    onPress={() => {
                      toggle(habit, day);
                      tickHaptic();
                    }}
                    accessibilityLabel={`Toggle ${habit.name}`}
                  >
                    <AnimatedCheck done={done} color={habit.color} size={28} />
                    <View style={styles.rowText}>
                      <Text
                        style={[styles.habitName, done && styles.habitNameDone]}
                      >
                        {habit.name}
                      </Text>
                      <Text style={styles.habitFreq}>
                        {FREQUENCY_LABELS[habit.frequency]}
                        {habit.frequency !== 'daily'
                          ? ' · counts for the whole period'
                          : ''}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
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
      maxHeight: '75%',
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
      marginBottom: 12,
    },
    title: { fontSize: 18, fontFamily: font.bold, color: t.text },
    empty: {
      color: t.textMuted,
      paddingVertical: 24,
      textAlign: 'center',
    },
    list: { marginTop: 4 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      gap: 14,
    },
    checkbox: {
      width: 28,
      height: 28,
      borderRadius: 8,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowText: { flex: 1 },
    habitName: { fontSize: 16, color: t.text, fontFamily: font.medium },
    habitNameDone: {
      textDecorationLine: 'line-through',
      color: t.textMuted,
    },
    habitFreq: { fontSize: 12, color: t.textMuted, marginTop: 2 },
  });
