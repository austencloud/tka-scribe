/**
 * Transform Help Content
 *
 * Static data for transform help UI: descriptions, icons, colors.
 * Separated from UI components for easy editing and testing.
 */

export interface TransformHelpItem {
  id: "mirror" | "rotate" | "swap" | "rewind";
  icon: string;
  name: string;
  color: string;
  shortDesc: string;
  fullDesc: string;
  warning?: string;
}

export const transformHelpContent: TransformHelpItem[] = [
  {
    id: "mirror",
    icon: "fa-left-right",
    name: "Mirror",
    color: "#a855f7",
    shortDesc: "Flip left & right",
    fullDesc:
      "Creates a mirror image of your sequence, as if mirrored across the vertical center line. All movements that go left now go right, and vice versa. Clockwise turns become counter-clockwise. You can combine this with other transforms for unique variations.",
  },
  {
    id: "rotate",
    icon: "fa-rotate-right",
    name: "Rotate",
    color: "#fb923c",
    shortDesc: "Pivot 45° clockwise or counter-clockwise",
    fullDesc:
      "Rotates the entire sequence 45° as if you physically turned your body. N becomes NE (clockwise) or NW (counter-clockwise). Tap the arrows to rotate clockwise or counter-clockwise. Rotate 4 times in the same direction for a full 180°.",
  },
  {
    id: "swap",
    icon: "fa-arrows-rotate",
    name: "Swap Hands",
    color: "#22c55e",
    shortDesc: "Switch which hand does what",
    fullDesc:
      "Exchanges all left-hand movements with right-hand movements. Your sequence looks the same, but the opposite hand now performs each movement. Great for creating mirror variations or practicing both sides.",
  },
  {
    id: "rewind",
    icon: "fa-backward",
    name: "Rewind",
    color: "#f43f5e",
    shortDesc: "Rewind the sequence backwards",
    fullDesc:
      "Like rewinding a video! Takes the end position as your new start, then plays every beat backwards. Turns flip direction (clockwise becomes counter-clockwise). Note: This will change the letters or word of your sequence!",
  },
];
