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
  // === STAFF FAMILY ===
  STAFF = "staff",
  SIMPLESTAFF = "simple_staff",
  BIGSTAFF = "bigstaff",
  STAFF2 = "staff_v2",

  // === CLUB ===
  CLUB = "club",

  // === FAN FAMILY ===
  FAN = "fan",
  BIGFAN = "bigfan",

  // === TRIAD FAMILY ===
  TRIAD = "triad",
  BIGTRIAD = "bigtriad",

  // === HOOP FAMILY ===
  MINIHOOP = "minihoop",
  BIGHOOP = "bighoop",

  // === BUUGENG FAMILY ===
  BUUGENG = "buugeng",
  BIGBUUGENG = "bigbuugeng",
  FRACTALGENG = "fractalgeng",

  // === HAND ===
  HAND = "hand",

  // === TRIQUETRA FAMILY ===
  TRIQUETRA = "triquetra",
  TRIQUETRA2 = "triquetra2",

  // === SWORD ===
  SWORD = "sword",

  // === CHICKEN FAMILY ===
  CHICKEN = "chicken",
  BIGCHICKEN = "bigchicken",

  // === GUITAR FAMILY ===
  GUITAR = "guitar",
  UKULELE = "ukulele",

  // === DOUBLESTAR FAMILY ===
  DOUBLESTAR = "doublestar",
  BIGDOUBLESTAR = "bigdoublestar",

  // === EIGHTRINGS FAMILY ===
  EIGHTRINGS = "eightrings",
  BIGEIGHTRINGS = "bigeightrings",

  // === QUIAD ===
  QUIAD = "quiad",
}
