/**
 * Design tokens. One place to change the whole look.
 *
 * The palette is drawn from traditional alpona materials and festival colours:
 * rice-paste ivory, turmeric gold, alta red, leaf green — set against a deep
 * night-indigo so glow and contrast read well on the SPECS display.
 */
export const THEME = {
  night: "#0B1020",
  surface: "#151B34",
  ivory: "#FFF6E3",
  mutedText: "#B9B3A3",
  gold: "#F2B544",
  teal: "#2EC4B6",
  success: "#6BBF59",
  warning: "#E8873B",
  /** Petal / brush colours, used in rotation. */
  petals: ["#FFF6E3", "#F2B544", "#D9593D", "#E85D8A", "#2EC4B6", "#6BBF59", "#8E9BFF"],
} as const;

export type RGBA = [number, number, number, number];

/** "#RRGGBB" or "#RRGGBBAA" -> [r, g, b, a] with each channel in 0..1. */
export function hexToRgba(hex: string): RGBA {
  const m = /^#?([0-9a-fA-F]{6})([0-9a-fA-F]{2})?$/.exec(hex.trim());
  if (!m) throw new Error(`Invalid hex colour: ${hex}`);
  const n = parseInt(m[1], 16);
  const a = m[2] ? parseInt(m[2], 16) / 255 : 1;
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, a];
}
