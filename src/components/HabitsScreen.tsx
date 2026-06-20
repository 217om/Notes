import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../lib/store';
import { colors } from '../lib/theme';
import { startOfToday } from '../lib/dates';
import {
  FREQUENCY_LABELS,
  isCompleted,
  scheduleDescription,
} from '../lib/habits';
import { Habit } from '../lib/types';
import HabitFormModal from './HabitFormModal';

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
  const { habits, completions, toggle, removeHabit } = useStore();
  const today = startOfToday();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (habit: Habit) => {
    setEditing(habit);
    setFormOpen(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Habits</Text>
        <Pressable style={styles.addBtn} onPress={openAdd}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addBtnText}>New</Text>
        </Pressable>
      </View>

      {habits.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="leaf-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No habits yet</Text>
          <Text style={styles.emptySubtitle}>
            Add daily, weekly, or monthly habits and tick them off as you go.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {habits.map((habit) => {
            const done = isCompleted(completions, habit, today);
            return (
              <View key={habit.id} style={styles.card}>
                <Pressable
                  style={styles.checkArea}
                  onPress={() => toggle(habit, today)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      {
                        backgroundColor: done ? habit.color : 'transparent',
                        borderColor: habit.color,
                      },
                    ]}
                  >
                    {done && <Ionicons name="checkmark" size={18} color="#fff" />}
                  </View>
                </Pressable>

                <Pressable style={styles.cardBody} onPress={() => openEdit(habit)}>
                  <Text style={[styles.habitName, done && styles.habitNameDone]}>
                    {habit.name}
                  </Text>
                  <View style={styles.metaRow}>
                    <View
                      style={[styles.badge, { backgroundColor: habit.color + '33' }]}
                    >
                      <Text style={[styles.badgeText, { color: habit.color }]}>
                        {FREQUENCY_LABELS[habit.frequency]}
                      </Text>
                    </View>
                    <Text style={styles.schedule}>
                      {scheduleDescription(habit)}
                    </Text>
                  </View>
                  <Text style={styles.periodHint}>
                    {done ? 'Done' : 'Not done'} {currentPeriodLabel(habit)}
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.deleteBtn}
                  onPress={() => removeHabit(habit.id)}
                  hitSlop={8}
                >
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color={colors.textMuted}
                  />
                </Pressable>
              </View>
            );
          })}
        </ScrollView>
      )}

      <HabitFormModal
        visible={formOpen}
        habit={editing}
        onClose={() => setFormOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addBtnText: { color: '#fff', fontWeight: '600' },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 32,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  list: { paddingBottom: 24, gap: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  checkArea: {},
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1, gap: 4 },
  habitName: { fontSize: 16, fontWeight: '600', color: colors.text },
  habitNameDone: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
  schedule: { fontSize: 12, color: colors.textMuted },
  periodHint: { fontSize: 12, color: colors.textMuted },
  deleteBtn: { padding: 4 },
});
