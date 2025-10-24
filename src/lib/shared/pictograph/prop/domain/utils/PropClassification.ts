/**
 * Prop Classification System
 *
 * Based on desktop legacy implementation at:
 * F:\The Kinetic Alphabet\TKA APP\desktop\legacy\main\pictograph\prop_type.py
 *
 * Classifies props by:
 * - Unilateral (one-handed) vs Bilateral (two-handed)
 * - Big vs Small (affects beta offset size)
 */

/**
 * Big unilateral props (one-handed, large size)
 * Beta offset: 950/60 = 15.83px
 */
export const BIG_UNILATERAL_PROPS = ["bighoop", "guitar", "sword"];

/**
 * Small unilateral props (one-handed, small size)
 * Beta offset: 950/45 = 21.11px (default)
 */
export const SMALL_UNILATERAL_PROPS = [
  "fan",
  "club",
  "minihoop",
  "triad", // This is why triads shouldn't get beta adjustment!
  "ukulele",
  "triquetra",
  "triquetra2",
];

/**
 * Big bilateral props (two-handed, large size)
 * Beta offset: 950/60 = 15.83px
 */
export const BIG_BILATERAL_PROPS = [
  "bigstaff",
  "bigbuugeng",
  "bigdoublestar",
  "bigeightrings",
];

/**
 * Small bilateral props (two-handed, small size)
 * Beta offset varies by specific prop
 */
export const SMALL_BILATERAL_PROPS = [
  "staff",
  "simple_staff",
  "buugeng",
  "doublestar", // Uses 950/50 = 19px
  "eightrings",
  "bigfan",
  "chickenstick",
  "contact_poi",
  "contact_staff",
  "doublefan",
  "rope_dart",
];

/**
 * All unilateral props combined
 */
export const ALL_UNILATERAL_PROPS = [
  ...BIG_UNILATERAL_PROPS,
  ...SMALL_UNILATERAL_PROPS,
];

/**
 * All bilateral props combined
 */
export const ALL_BILATERAL_PROPS = [
  ...BIG_BILATERAL_PROPS,
  ...SMALL_BILATERAL_PROPS,
];

/**
 * Check if a prop is unilateral (one-handed)
 *
 * Unilateral props SKIP beta adjustment when they end with:
 * - Radial orientations (IN/OUT)
 * - Non-radial orientations (CLOCK/COUNTER)
 */
export function isUnilateralProp(propType: string): boolean {
  return ALL_UNILATERAL_PROPS.includes(propType);
}

/**
 * Check if a prop is bilateral (two-handed)
 *
 * Bilateral props ALWAYS receive beta adjustment regardless of orientation
 */
export function isBilateralProp(propType: string): boolean {
  return ALL_BILATERAL_PROPS.includes(propType);
}

/**
 * Check if a prop is "big" (affects beta offset size)
 */
export function isBigProp(propType: string): boolean {
  return [...BIG_UNILATERAL_PROPS, ...BIG_BILATERAL_PROPS].includes(propType);
}

/**
 * Check if a prop is "small" (affects beta offset size)
 */
export function isSmallProp(propType: string): boolean {
  return [...SMALL_UNILATERAL_PROPS, ...SMALL_BILATERAL_PROPS].includes(
    propType
  );
}

/**
 * Get the beta offset size for a prop type
 *
 * Based on desktop calculations:
 * - Large props: 950/60 = 15.83px
 * - Medium props (doublestar): 950/50 = 19px
 * - Default/small props: 950/45 = 21.11px
 */
export function getBetaOffsetSize(propType: string): number {
  // Large props
  if (propType === "club" || propType === "eightrings") {
    return 950 / 60; // 15.83px
  }

  // Medium props
  if (propType === "doublestar") {
    return 950 / 50; // 19px
  }

  // Default/small props
  return 950 / 45; // 21.11px
}
