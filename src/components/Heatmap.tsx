import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Theme } from '../lib/theme';

/**
 * A compact wrap of squares — one per recent scheduled occurrence, oldest
 * first. Filled with the habit colour when completed, muted when missed.
 */
export default function Heatmap({
  cells,
  color,
  theme,
}: {
  cells: { key: string; done: boolean }[];
  color: string;
  theme: Theme;
}) {
  if (cells.length === 0) return null;
  return (
    <View style={styles.wrap}>
      {cells.map((c) => (
        <View
          key={c.key}
          style={[
            styles.cell,
            {
              backgroundColor: c.done ? color : theme.surfaceAlt,
              borderColor: theme.border,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  cell: {
    width: 14,
    height: 14,
    borderRadius: 3,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
