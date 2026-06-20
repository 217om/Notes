import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../lib/store';
import { colors, ratioColor } from '../lib/theme';
import {
  MONTH_NAMES,
  WEEKDAY_LABELS,
  dateKey,
  isSameDay,
  monthMatrix,
  startOfToday,
} from '../lib/dates';
import { dayStatus } from '../lib/habits';
import DayDetailModal from './DayDetailModal';
import Legend from './Legend';

export default function CalendarScreen() {
  const { habits, completions } = useStore();
  const today = startOfToday();

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<Date | null>(null);

  const weeks = useMemo(
    () => monthMatrix(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const goPrev = () => {
    const d = new Date(viewYear, viewMonth - 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };
  const goNext = () => {
    const d = new Date(viewYear, viewMonth + 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };
  const goToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={goPrev} style={styles.navBtn} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Pressable onPress={goToday}>
          <Text style={styles.monthLabel}>
            {MONTH_NAMES[viewMonth]} {viewYear}
          </Text>
        </Pressable>
        <Pressable onPress={goNext} style={styles.navBtn} hitSlop={8}>
          <Ionicons name="chevron-forward" size={22} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.weekHeader}>
        {WEEKDAY_LABELS.map((d) => (
          <Text key={d} style={styles.weekHeaderCell}>
            {d}
          </Text>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {weeks.map((week, wi) => (
          <View key={wi} style={styles.weekRow}>
            {week.map((day) => {
              const inMonth = day.getMonth() === viewMonth;
              const isFuture = day > today;
              const isToday = isSameDay(day, today);
              const status = dayStatus(habits, completions, day);

              // Past / present days with scheduled habits get a status colour;
              // future days stay neutral (you can't have done them yet).
              const showStatus = !isFuture && status.total > 0;
              const bg = showStatus ? ratioColor(status.ratio) : 'transparent';
              const fullyDone = status.ratio === 1 && showStatus;

              return (
                <Pressable
                  key={dateKey(day)}
                  style={[
                    styles.dayCell,
                    { backgroundColor: bg },
                    !inMonth && styles.dayCellOutside,
                    isToday && styles.dayCellToday,
                  ]}
                  onPress={() => setSelected(day)}
                >
                  <Text
                    style={[
                      styles.dayNumber,
                      !inMonth && styles.dayNumberOutside,
                      showStatus && styles.dayNumberOnColor,
                    ]}
                  >
                    {day.getDate()}
                  </Text>
                  {fullyDone ? (
                    <Ionicons name="checkmark" size={12} color="#052e16" />
                  ) : !isFuture && status.total > 0 ? (
                    <Text style={styles.dayMeta}>
                      {status.completed}/{status.total}
                    </Text>
                  ) : isFuture && status.total > 0 ? (
                    <View style={styles.dueDot} />
                  ) : (
                    <View style={styles.dayMetaSpacer} />
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}

        <Legend />
      </ScrollView>

      <DayDetailModal
        day={selected}
        visible={selected !== null}
        onClose={() => setSelected(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 12 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  navBtn: {
    padding: 6,
    borderRadius: 8,
  },
  monthLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekHeaderCell: {
    flex: 1,
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  scroll: { paddingBottom: 24 },
  weekRow: {
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    margin: 2,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  dayCellOutside: {
    opacity: 0.35,
  },
  dayCellToday: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  dayNumberOutside: {
    color: colors.textMuted,
  },
  dayNumberOnColor: {
    color: '#0b1220',
  },
  dayMeta: {
    fontSize: 10,
    color: '#0b1220',
    fontWeight: '700',
  },
  dayMetaSpacer: {
    height: 12,
  },
  dueDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.textMuted,
    marginTop: 2,
  },
});
