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
    [PropType.STAFF_V2]: {
      label: "Staff V2",
      image: "/images/props/staff_v2.svg",
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
    [PropType.UKULELE]: {
      label: "Ukulele",
      image: "/images/props/ukulele.svg",
    },
    [PropType.DOUBLESTAR]: {
      label: "Double Star",
      image: "/images/props/doublestar.svg",
    },
    [PropType.EIGHTRINGS]: {
      label: "Eight Rings",
      image: "/images/props/eightrings.svg",
    },
    [PropType.FRACTALGENG]: {
      label: "Fractal Geng",
      image: "/images/props/fractalgeng.svg",
    },
    [PropType.QUIAD]: { label: "Quiad", image: "/images/props/quiad.svg" },

    // Big variants
    [PropType.BIGBUUGENG]: {
      label: "Big Buugeng",
      image: "/images/props/bigbuugeng.svg",
    },
    [PropType.BIGDOUBLESTAR]: {
      label: "Big Double Star",
      image: "/images/props/bigdoublestar.svg",
    },
    [PropType.BIGEIGHTRINGS]: {
      label: "Big Eight Rings",
      image: "/images/props/bigeightrings.svg",
    },
    [PropType.BIGFAN]: { label: "Big Fan", image: "/images/props/bigfan.svg" },
    [PropType.BIGHOOP]: {
      label: "Big Hoop",
      image: "/images/props/bighoop.svg",
    },
    [PropType.BIGSTAFF]: {
      label: "Big Staff",
      image: "/images/props/bigstaff.svg",
    },
    [PropType.BIGTRIAD]: {
      label: "Big Triad",
      image: "/images/props/bigtriad.svg",
    },
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
