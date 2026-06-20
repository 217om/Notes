import React, { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../lib/store';
import { Theme, font, useTheme } from '../lib/theme';
import { ThemePref, WeekStart } from '../lib/types';

function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  theme,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
  theme: Theme;
}) {
  const styles = makeStyles(theme);
  return (
    <View style={styles.segment}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            style={[styles.segmentItem, active && styles.segmentItemActive]}
            onPress={() => onChange(o.value)}
            accessibilityLabel={o.label}
          >
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function SettingsModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { settings, updateSettings } = useStore();
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>Settings</Text>
            <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="Close">
              <Ionicons name="close" size={24} color={theme.textMuted} />
            </Pressable>
          </View>

          <Text style={styles.label}>Appearance</Text>
          <Segmented<ThemePref>
            theme={theme}
            value={settings.theme}
            onChange={(v) => updateSettings({ theme: v })}
            options={[
              { label: 'System', value: 'system' },
              { label: 'Light', value: 'light' },
              { label: 'Dark', value: 'dark' },
            ]}
          />

          <Text style={styles.label}>Week starts on</Text>
          <Segmented<WeekStart>
            theme={theme}
            value={settings.weekStart}
            onChange={(v) => updateSettings({ weekStart: v })}
            options={[
              { label: 'Sunday', value: 0 },
              { label: 'Monday', value: 1 },
            ]}
          />
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
      paddingBottom: 32,
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
    title: { fontSize: 20, fontFamily: font.bold, color: t.text },
    label: {
      fontSize: 13,
      fontFamily: font.semibold,
      color: t.textMuted,
      marginTop: 20,
      marginBottom: 8,
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
  });
