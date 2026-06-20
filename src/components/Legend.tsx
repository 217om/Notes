import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, ratioColor } from '../lib/theme';

const ITEMS: { label: string; ratio: number | null }[] = [
  { label: 'All done', ratio: 1 },
  { label: 'Most', ratio: 0.85 },
  { label: 'Partial', ratio: 0.5 },
  { label: 'None', ratio: 0 },
  { label: 'Nothing due', ratio: null },
];

export default function Legend() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Legend</Text>
      <View style={styles.row}>
        {ITEMS.map((item) => (
          <View key={item.label} style={styles.item}>
            <View
              style={[
                styles.swatch,
                {
                  backgroundColor:
                    item.ratio === null ? 'transparent' : ratioColor(item.ratio),
                  borderColor: colors.border,
                },
              ]}
            />
            <Text style={styles.label}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    padding: 14,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  title: {
    color: colors.text,
    fontWeight: '700',
    marginBottom: 10,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  swatch: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
  },
});
