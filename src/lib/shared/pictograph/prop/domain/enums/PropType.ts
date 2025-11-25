/**
 * TKA Supported Prop Types
 *
 * NOTE: TKA is a STATIC PROP system for manipulation arts.
 * Dynamic/spinning props like poi are NOT supported.
 *
 * Supported props are held and manipulated directly by the performer,
 * showing positions, orientations, and movements through space.
 *
 * This is the single source of truth for ALL prop types in the application.
 * Each enum value corresponds to an available prop SVG file in /images/props/
 */
export enum PropType {
  // Core props
  STAFF = "staff",
  SIMPLESTAFF = "simple_staff",
  STAFF_V2 = "staff_v2",
  CLUB = "club",
  FAN = "fan",
  TRIAD = "triad",
  MINIHOOP = "minihoop",
  BUUGENG = "buugeng",
  HAND = "hand",

  // Extended props
  TRIQUETRA = "triquetra",
  TRIQUETRA2 = "triquetra2",
  SWORD = "sword",
  CHICKEN = "chicken",
  GUITAR = "guitar",
  UKULELE = "ukulele",
  DOUBLESTAR = "doublestar",
  EIGHTRINGS = "eightrings",
  FRACTALGENG = "fractalgeng",
  QUIAD = "quiad",

  // Big variants
  BIGBUUGENG = "bigbuugeng",
  BIGDOUBLESTAR = "bigdoublestar",
  BIGEIGHTRINGS = "bigeightrings",
  BIGFAN = "bigfan",
  BIGHOOP = "bighoop",
  BIGSTAFF = "bigstaff",
  BIGTRIAD = "bigtriad",
}
