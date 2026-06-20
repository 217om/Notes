import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/** Light selection tick. No-op on web (no haptics hardware). */
export function tickHaptic(): void {
  if (Platform.OS === 'web') return;
  Haptics.selectionAsync().catch(() => {});
}

/** Stronger success buzz, e.g. when a whole day is completed. */
export function successHaptic(): void {
  if (Platform.OS === 'web') return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
    () => {},
  );
}
