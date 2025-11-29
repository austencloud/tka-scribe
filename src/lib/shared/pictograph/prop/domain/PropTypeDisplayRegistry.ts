import { PropType } from "./enums/PropType";

/**
 * Display metadata for a prop type
 */
export interface PropTypeDisplayInfo {
  /** Display label for the prop type */
  label: string;
  /** Path to the prop's SVG image */
  image: string;
}

/**
 * Registry mapping PropType enum values to their display metadata.
 * This is the single source of truth for prop type UI display information.
 */
export const PROP_TYPE_DISPLAY_REGISTRY: Record<PropType, PropTypeDisplayInfo> =
  {
    // Core props
    [PropType.STAFF]: { label: "Staff", image: "/images/props/staff.svg" },
    [PropType.SIMPLESTAFF]: {
      label: "Simple Staff",
      image: "/images/props/simple_staff.svg",
    },
    [PropType.CLUB]: { label: "Club", image: "/images/props/club.svg" },
    [PropType.FAN]: { label: "Fan", image: "/images/props/fan.svg" },
    [PropType.TRIAD]: { label: "Triad", image: "/images/props/triad.svg" },
    [PropType.MINIHOOP]: {
      label: "Mini Hoop",
      image: "/images/props/minihoop.svg",
    },
    [PropType.BUUGENG]: {
      label: "Buugeng",
      image: "/images/props/buugeng.svg",
    },
    [PropType.HAND]: { label: "Hand", image: "/images/props/hand.svg" },

    // Extended props
    [PropType.TRIQUETRA]: {
      label: "Triquetra",
      image: "/images/props/triquetra.svg",
    },
    [PropType.TRIQUETRA2]: {
      label: "Triquetra 2",
      image: "/images/props/triquetra2.svg",
    },
    [PropType.SWORD]: { label: "Sword", image: "/images/props/sword.svg" },
    [PropType.CHICKEN]: {
      label: "Chicken",
      image: "/images/props/chicken.svg",
    },
    [PropType.GUITAR]: { label: "Guitar", image: "/images/props/guitar.svg" },
    [PropType.DOUBLESTAR]: {
      label: "Double Star",
      image: "/images/props/doublestar.svg",
    },
    [PropType.EIGHTRINGS]: {
      label: "Eight Rings",
      image: "/images/props/eightrings.svg",
    },
    [PropType.QUIAD]: { label: "Quiad", image: "/images/props/quiad.svg" },
  } as const;

/**
 * Gets all available prop types in display order.
 */
export function getAllPropTypes(): PropType[] {
  return Object.keys(PROP_TYPE_DISPLAY_REGISTRY) as PropType[];
}

/**
 * Gets display information for a specific prop type.
 */
export function getPropTypeDisplayInfo(
  propType: PropType
): PropTypeDisplayInfo {
  return PROP_TYPE_DISPLAY_REGISTRY[propType];
}

/**
 * Finds a prop type by its string value (case-insensitive).
 * Useful for parsing user input or legacy data.
 */
export function findPropTypeByValue(value: string): PropType | undefined {
  const normalized = value.toLowerCase();
  return getAllPropTypes().find((pt) => pt.toLowerCase() === normalized);
}

/**
 * Prop types that are variations of a base prop type.
 * These are displayed as toggle options on the base prop card.
 */
export const VARIANT_PROP_TYPES: PropType[] = [PropType.TRIQUETRA2];

/**
 * Mapping from variant prop types to their base prop types.
 */
const VARIANT_TO_BASE: Partial<Record<PropType, PropType>> = {
  [PropType.TRIQUETRA2]: PropType.TRIQUETRA,
};

/**
 * Mapping from base prop types to their variant prop types.
 */
const BASE_TO_VARIANTS: Partial<Record<PropType, PropType[]>> = {
  [PropType.TRIQUETRA]: [PropType.TRIQUETRA2],
};

/**
 * Checks if a prop type has variations available.
 */
export function hasVariations(propType: PropType): boolean {
  return (
    BASE_TO_VARIANTS[propType] !== undefined ||
    VARIANT_TO_BASE[propType] !== undefined
  );
}

/**
 * Gets the base prop type for a variant (or returns itself if not a variant).
 */
export function getBasePropType(propType: PropType): PropType {
  return VARIANT_TO_BASE[propType] ?? propType;
}

/**
 * Gets the next variation for a prop type (cycles through variants).
 */
export function getNextVariation(propType: PropType): PropType {
  const base = getBasePropType(propType);
  const variants = BASE_TO_VARIANTS[base];

  if (!variants || variants.length === 0) {
    return propType;
  }

  // If current is the base, return first variant
  if (propType === base) {
    return variants[0];
  }

  // Find current in variants and return next (or cycle back to base)
  const currentIndex = variants.indexOf(propType);
  if (currentIndex === variants.length - 1) {
    return base;
  }
  return variants[currentIndex + 1];
}

/**
 * Gets a display label for the variation (e.g., "Ver 2").
 */
export function getVariationLabel(propType: PropType): string {
  if (propType === PropType.TRIQUETRA) return "Ver 1";
  if (propType === PropType.TRIQUETRA2) return "Ver 2";
  return "";
}

/**
 * Gets the triquetra variation number (1 or 2).
 */
export function getTriquetraVariation(propType: PropType): number {
  if (propType === PropType.TRIQUETRA) return 1;
  if (propType === PropType.TRIQUETRA2) return 2;
  return 1;
}
