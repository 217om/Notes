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
import { Theme, font, ratioColor, useTheme } from '../lib/theme';
import {
  MONTH_NAMES,
  dateKey,
  isSameDay,
  monthMatrix,
  startOfToday,
  weekdayLabels,
} from '../lib/dates';
import { dayStatus } from '../lib/habits';
import DayDetailModal from './DayDetailModal';

export default function CalendarScreen() {
  const { habits, completions, settings } = useStore();
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const today = startOfToday();

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<Date | null>(null);

  const weeks = useMemo(
    () => monthMatrix(viewYear, viewMonth, settings.weekStart),
    [viewYear, viewMonth, settings.weekStart],
  );
  const labels = useMemo(
    () => weekdayLabels(settings.weekStart),
    [settings.weekStart],
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
        <Pressable onPress={goPrev} style={styles.navBtn} hitSlop={8} accessibilityLabel="Previous month">
          <Ionicons name="chevron-back" size={22} color={theme.text} />
        </Pressable>
        <Pressable onPress={goToday} accessibilityLabel="Jump to current month">
          <Text style={styles.monthLabel}>
            {MONTH_NAMES[viewMonth]} {viewYear}
          </Text>
        </Pressable>
        <Pressable onPress={goNext} style={styles.navBtn} hitSlop={8} accessibilityLabel="Next month">
          <Ionicons name="chevron-forward" size={22} color={theme.text} />
        </Pressable>
      </View>

      <View style={styles.weekHeader}>
        {labels.map((d) => (
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

              const showStatus = !isFuture && status.total > 0;
              const bg = showStatus
                ? ratioColor(status.ratio, settings.colorblind)
                : 'transparent';
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
                  accessibilityLabel={`${dateKey(day)}, ${status.completed} of ${status.total} done`}
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
                  ) : showStatus ? (
                    <Text style={styles.dayMeta}>
                      {status.completed}/{status.total}
                    </Text>
                  ) : isFuture && status.total > 0 ? (
                    <View style={styles.dotRow}>
                      {status.due.slice(0, 4).map((h) => (
                        <View
                          key={h.id}
                          style={[styles.dueDot, { backgroundColor: h.color }]}
                        />
                      ))}
                    </View>
                  ) : (
                    <View style={styles.dayMetaSpacer} />
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}
      </ScrollView>

      <DayDetailModal
        day={selected}
        visible={selected !== null}
        onClose={() => setSelected(null)}
      />
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 12 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
    },
    navBtn: { padding: 6, borderRadius: 8 },
    monthLabel: { fontSize: 20, fontFamily: font.bold, color: t.text },
    weekHeader: { flexDirection: 'row', marginBottom: 6 },
    weekHeaderCell: {
      flex: 1,
      textAlign: 'center',
      color: t.textMuted,
      fontSize: 12,
      fontFamily: font.semibold,
    },
    scroll: { paddingBottom: 130 },
    weekRow: { flexDirection: 'row' },
    dayCell: {
      flex: 1,
      aspectRatio: 1,
      margin: 2,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.border,
    },
    dayCellOutside: { opacity: 0.35 },
    dayCellToday: { borderWidth: 2, borderColor: t.primary },
    dayNumber: { fontSize: 14, fontFamily: font.semibold, color: t.text },
    dayNumberOutside: { color: t.textMuted },
    dayNumberOnColor: { color: '#0b1220' },
    dayMeta: { fontSize: 10, color: '#0b1220', fontFamily: font.bold },
    dayMetaSpacer: { height: 12 },
    dotRow: { flexDirection: 'row', gap: 3, height: 12, alignItems: 'center' },
    dueDot: { width: 5, height: 5, borderRadius: 3 },
  });
