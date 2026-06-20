import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../lib/store';
import { Theme, font, useTheme } from '../lib/theme';
import { WEEKDAY_LABELS } from '../lib/dates';
import { FREQUENCY_LABELS, HABIT_COLORS } from '../lib/habits';
import { Frequency, Habit } from '../lib/types';

const FREQUENCIES: Frequency[] = ['daily', 'weekly', 'monthly'];

export default function HabitFormModal({
  visible,
  habit,
  onClose,
}: {
  visible: boolean;
  habit: Habit | null;
  onClose: () => void;
}) {
  const { addHabit, updateHabit } = useStore();
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('daily');
  const [color, setColor] = useState(HABIT_COLORS[6]);
  const [weekday, setWeekday] = useState(1);
  const [monthDay, setMonthDay] = useState(1);

  // Reset form whenever it opens (either blank for add, or filled for edit).
  useEffect(() => {
    if (!visible) return;
    setName(habit?.name ?? '');
    setFrequency(habit?.frequency ?? 'daily');
    setColor(habit?.color ?? HABIT_COLORS[6]);
    setWeekday(habit?.weekday ?? 1);
    setMonthDay(habit?.monthDay ?? 1);
  }, [visible, habit]);

  const canSave = name.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    const payload = {
      name: name.trim(),
      frequency,
      color,
      weekday: frequency === 'weekly' ? weekday : undefined,
      monthDay: frequency === 'monthly' ? monthDay : undefined,
    };
    if (habit) {
      updateHabit(habit.id, payload);
    } else {
      addHabit(payload);
    }
    onClose();
  };

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
            <Text style={styles.title}>
              {habit ? 'Edit habit' : 'New habit'}
            </Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={24} color={theme.textMuted} />
            </Pressable>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Drink water"
              placeholderTextColor={theme.textMuted}
              autoFocus
            />

            <Text style={styles.label}>Frequency</Text>
            <View style={styles.segment}>
              {FREQUENCIES.map((f) => (
                <Pressable
                  key={f}
                  style={[
                    styles.segmentItem,
                    frequency === f && styles.segmentItemActive,
                  ]}
                  onPress={() => setFrequency(f)}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      frequency === f && styles.segmentTextActive,
                    ]}
                  >
                    {FREQUENCY_LABELS[f]}
                  </Text>
                </Pressable>
              ))}
            </View>

            {frequency === 'weekly' && (
              <>
                <Text style={styles.label}>Day of week</Text>
                <View style={styles.chipRow}>
                  {WEEKDAY_LABELS.map((d, i) => (
                    <Pressable
                      key={d}
                      style={[styles.chip, weekday === i && styles.chipActive]}
                      onPress={() => setWeekday(i)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          weekday === i && styles.chipTextActive,
                        ]}
                      >
                        {d}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}

            {frequency === 'monthly' && (
              <>
                <Text style={styles.label}>Day of month</Text>
                <View style={styles.chipWrap}>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <Pressable
                      key={d}
                      style={[
                        styles.dayChip,
                        monthDay === d && styles.chipActive,
                      ]}
                      onPress={() => setMonthDay(d)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          monthDay === d && styles.chipTextActive,
                        ]}
                      >
                        {d}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <Text style={styles.hint}>
                  Days beyond a month's length fall on its last day.
                </Text>
              </>
            )}

            <Text style={styles.label}>Colour</Text>
            <View style={styles.chipRow}>
              {HABIT_COLORS.map((c) => (
                <Pressable
                  key={c}
                  style={[
                    styles.colorDot,
                    { backgroundColor: c },
                    color === c && styles.colorDotActive,
                  ]}
                  onPress={() => setColor(c)}
                />
              ))}
            </View>

            <Pressable
              style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={!canSave}
            >
              <Text style={styles.saveBtnText}>
                {habit ? 'Save changes' : 'Add habit'}
              </Text>
            </Pressable>
          </ScrollView>
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
      maxHeight: '88%',
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
      marginBottom: 8,
    },
    title: { fontSize: 18, fontFamily: font.bold, color: t.text },
    label: {
      color: t.textMuted,
      fontSize: 13,
      fontFamily: font.semibold,
      marginTop: 16,
      marginBottom: 8,
    },
    input: {
      backgroundColor: t.bg,
      borderRadius: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.border,
      paddingHorizontal: 14,
      paddingVertical: 12,
      color: t.text,
      fontSize: 16,
      fontFamily: font.regular,
    },
    segment: {
      flexDirection: 'row',
      backgroundColor: t.bg,
      borderRadius: 10,
      padding: 4,
      gap: 4,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.border,
    },
    segmentItem: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: 'center',
    },
    segmentItemActive: { backgroundColor: t.primary },
    segmentText: { color: t.textMuted, fontFamily: font.semibold },
    segmentTextActive: { color: t.onPrimary },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: t.bg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.border,
    },
    dayChip: {
      width: 38,
      paddingVertical: 8,
      borderRadius: 8,
      alignItems: 'center',
      backgroundColor: t.bg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.border,
    },
    chipActive: { backgroundColor: t.primary, borderColor: t.primary },
    chipText: { color: t.text, fontFamily: font.semibold, fontSize: 13 },
    chipTextActive: { color: t.onPrimary },
    colorDot: {
      width: 34,
      height: 34,
      borderRadius: 17,
      borderWidth: 3,
      borderColor: 'transparent',
    },
    colorDotActive: { borderColor: t.text },
    hint: { color: t.textMuted, fontSize: 12, marginTop: 8 },
    saveBtn: {
      backgroundColor: t.primary,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 24,
      marginBottom: 12,
    },
    saveBtnDisabled: { opacity: 0.4 },
    saveBtnText: { color: t.onPrimary, fontFamily: font.bold, fontSize: 16 },
  });
