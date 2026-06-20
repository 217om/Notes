/** Shared colours and the day-status colour scale. */

export const colors = {
  bg: '#0f172a',
  surface: '#1e293b',
  surfaceAlt: '#334155',
  border: '#334155',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  primary: '#6366f1',
  danger: '#ef4444',

  // Day-status scale
  none: '#ef4444', // red — nothing done
  partialLow: '#f97316', // orange
  partialHigh: '#eab308', // yellow
  complete: '#22c55e', // green — everything done
  empty: '#1e293b', // nothing scheduled
};

/** Linear interpolation between two hex colours. t in [0, 1]. */
function lerpColor(a: string, b: string, t: number): string {
  const pa = [parseInt(a.slice(1, 3), 16), parseInt(a.slice(3, 5), 16), parseInt(a.slice(5, 7), 16)];
  const pb = [parseInt(b.slice(1, 3), 16), parseInt(b.slice(3, 5), 16), parseInt(b.slice(5, 7), 16)];
  const c = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Maps a completion ratio to a colour:
 *   null -> empty (nothing scheduled)
 *   0    -> red
 *   ~0.5 -> orange
 *   ~0.9 -> yellow
 *   1    -> green
 */
export function ratioColor(ratio: number | null): string {
  if (ratio === null) return colors.empty;
  if (ratio <= 0) return colors.none;
  if (ratio >= 1) return colors.complete;
  // 0 -> red, 0.5 -> orange, 1 (exclusive) -> yellow→green-ish
  if (ratio < 0.5) {
    return lerpColor(colors.none, colors.partialLow, ratio / 0.5);
  }
  if (ratio < 0.8) {
    return lerpColor(colors.partialLow, colors.partialHigh, (ratio - 0.5) / 0.3);
  }
  return lerpColor(colors.partialHigh, colors.complete, (ratio - 0.8) / 0.2);
}
