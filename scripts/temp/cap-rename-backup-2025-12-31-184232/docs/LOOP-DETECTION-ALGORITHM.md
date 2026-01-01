# LOOP Detection Algorithm

> How to determine what Continuous Assembly Pattern (LOOP) type a sequence follows.

---

## Overview

A **LOOP** (Continuous Assembly Pattern) is a sequence that returns to its starting position AND follows a structured transformation pattern between its halves (or quarters). The detection algorithm analyzes a sequence to determine:

1. Is it circular? (ends where it starts)
2. What transformation components does it exhibit?
3. At what slice granularity do these transformations operate?

**Important**: The LOOP type is determined by the **beat data** (positions, motion types, colors), not by the word or letters. The same letters arranged differently could produce different LOOP types.

---

## Core Concepts

### Circularity

A sequence is **circular** if the ending position matches the starting position. This is a prerequisite for being a LOOP - if a sequence doesn't return home, it's not a LOOP.

### Slices

LOOPs are analyzed by comparing beats at different "slice" intervals:

- **HALVED (½)**: Compare beat `i` to beat `i + halfLength`
  - A 16-beat sequence compares: 1↔9, 2↔10, 3↔11, etc.
  - Net rotation between halves: 180°

- **QUARTERED (¼)**: Compare beats at quarter intervals
  - A 16-beat sequence has quarters: Q1(1-4), Q2(5-8), Q3(9-12), Q4(13-16)
  - Compare Q1→Q2, Q2→Q3, Q3→Q4, Q4→Q1
  - Rotation per quarter: 90°

### Transformation Components

Each component describes HOW positions/colors change between compared beats:

| Component | Description | Position Transform | Color Transform |
|-----------|-------------|-------------------|-----------------|
| **ROTATED** | 180° position rotation | n↔s, e↔w, ne↔sw, nw↔se | Same colors |
| **SWAPPED** | Colors exchange | Same positions | Blue↔Red |
| **MIRRORED** | Vertical mirror (left/right) | e↔w, ne↔nw, se↔sw | Same colors |
| **FLIPPED** | Horizontal flip (top/bottom) | n↔s, ne↔se, nw↔sw | Same colors |
| **INVERTED** | Motion type inversion | Same positions | pro↔anti |
| **REPEATED** | Exact copy | Identical | Identical |

### Compound Components

Multiple components can combine:

- **ROTATED+SWAPPED**: Positions rotate 180° AND colors swap
- **MIRRORED+SWAPPED**: Positions mirror AND colors swap
- **FLIPPED+INVERTED**: Positions flip AND motion types invert
- **MIRRORED+SWAPPED+INVERTED**: All three transformations

---

## Detection Algorithm

### Step 1: Check Circularity

```
IF last beat's end position ≠ start position:
    RETURN "Not circular, not a LOOP"
```

### Step 2: Check Beat Count

```
IF beat count is odd:
    RETURN "Cannot be a structured LOOP" (halved comparison impossible)

IF beat count % 4 ≠ 0:
    Skip quartered detection (only check halved)
```

### Step 3: Halved Detection

For each beat pair `(i, i + halfLength)`:

1. **Check ROTATED**: Are positions rotated 180°?
   ```
   blue1.startLoc → ROTATE_180 → blue2.startLoc?
   blue1.endLoc → ROTATE_180 → blue2.endLoc?
   red1.startLoc → ROTATE_180 → red2.startLoc?
   red1.endLoc → ROTATE_180 → red2.endLoc?
   ```

2. **Check SWAPPED**: Are colors exchanged (with same positions)?
   ```
   blue1 positions = red2 positions?
   red1 positions = blue2 positions?
   blue1 motionType = red2 motionType?
   red1 motionType = blue2 motionType?
   ```

   **IMPORTANT**: Swap is only meaningful if hands have DIFFERENT motion types.
   If blue and red both do `pro`, swapping them changes nothing choreographically.

3. **Check MIRRORED**: Are positions mirrored left/right?
   ```
   Apply MIRROR_VERTICAL map (e↔w)
   ```

4. **Check FLIPPED**: Are positions flipped top/bottom?
   ```
   Apply FLIP_HORIZONTAL map (n↔s)
   ```

5. **Check INVERTED**: Are motion types inverted?
   ```
   Same positions, but pro↔anti
   ```

6. **Check REPEATED**: Are beats identical?
   ```
   All positions and motion types match exactly
   ```

7. **Check Compound Patterns**: Apply transforms in sequence
   - ROTATED+SWAPPED: `new_blue = ROTATE_180(old_red)`, `new_red = ROTATE_180(old_blue)`
   - MIRRORED+SWAPPED: `new_blue = MIRROR(old_red)`, `new_red = MIRROR(old_blue)`
   - etc.

### Step 4: Determine Halved Components

A component is detected if ALL beat pairs match:

```
IF rotated matches = halfLength:
    ADD "rotated" to components

IF swapped matches = halfLength AND swap is meaningful:
    ADD "swapped" to components

// ... etc for each component
```

### Step 5: Quartered Detection (if applicable)

For sequences divisible by 4, check 90° rotation patterns:

**Check each quarter transition (Q1→Q2, Q2→Q3, Q3→Q4, Q4→Q1):**

1. **Pure 90° Rotation** (no swap):
   ```
   blue1 positions → ROTATE_90_CCW → blue2 positions?
   red1 positions → ROTATE_90_CCW → red2 positions?
   Colors stay same
   ```

2. **90° Rotation + Swap**:
   ```
   red1 positions → ROTATE_90_CCW → blue2 positions?
   blue1 positions → ROTATE_90_CCW → red2 positions?
   Colors exchange
   ```

### Step 6: Mixed-Slice Detection

**Key insight**: Components can operate at DIFFERENT slice granularities!

**Rotated(¼) + Swapped(½)** means:
- Rotation happens at 90° per quarter (¼ slice)
- Swap happens only at the half boundary (½ slice)

This pattern occurs when quarter transitions alternate:
- Q1→Q2: 90° rotation only (no swap)
- Q2→Q3: 90° rotation + swap
- Q3→Q4: 90° rotation + swap
- Q4→Q1: 90° rotation only (no swap)

Detection:
```
IF all quarter transitions have 90° rotation (either pure OR with swap)
AND some transitions have swap
AND some transitions are pure (no swap)
THEN this is a mixed-slice pattern → Report as "rotated+swapped"
```

**Why this works mathematically:**

When comparing halves (beat i vs beat i+8 in a 16-beat sequence):
- Beats from Q1 reach Q3 by crossing ONE swap boundary (Q2→Q3)
  - Result: 180° rotation + 1 swap = **ROTATED+SWAPPED**
- Beats from Q2 reach Q4 by crossing TWO swap boundaries (Q2→Q3 and Q3→Q4)
  - Result: 180° rotation + 2 swaps = **ROTATED only** (swaps cancel out)

This causes inconsistent halved detection (some pairs show ROTATED+SWAPPED, others show just ROTATED), which is why we need the quartered analysis to properly detect it.

---

## Position Transform Maps

### ROTATE_180 (180° rotation)
```
n ↔ s
e ↔ w
ne ↔ sw
nw ↔ se
```

### ROTATE_90_CCW (90° counter-clockwise)
```
n → w → s → e → n
ne → nw → sw → se → ne
```

### MIRROR_VERTICAL (left/right mirror)
```
n → n, s → s
e ↔ w
ne ↔ nw
se ↔ sw
```

### FLIP_HORIZONTAL (top/bottom flip)
```
e → e, w → w
n ↔ s
ne ↔ se
nw ↔ sw
```

---

## When is Swap "Meaningful"?

Swap detection requires careful handling:

**Swap IS meaningful when:**
- Hands have DIFFERENT motion types (one pro, one anti)
- The swap actually exchanges distinct choreographic roles

**Swap is NOT meaningful when:**
- Both hands have the SAME motion type
- Swapping them produces identical choreography (coincidental match)

**Exception - Mixed-slice patterns:**
- For Rotated(¼)+Swapped(½) patterns, the swap IS meaningful even with same motion types
- The structural exchange of rotational paths creates distinct choreography
- The swap alternates at quarter boundaries, creating the pattern

---

## Detection Priority

When multiple patterns match, use this priority:

1. **Three-component compounds** (mirrored+swapped+inverted) override individual components
2. **Two-component compounds** (rotated+swapped) override individual rotated/swapped
3. **Mixed-slice patterns** take precedence when detected
4. **Quartered patterns** can override halved if more specific

---

## Abstract Examples

### Simple ROTATED (halved)

An 8-beat sequence where comparing beat pairs (1↔5, 2↔6, 3↔7, 4↔8):
```
Beat 1: blue s→w, red s→e
Beat 5: blue n→e, red n→w  (positions rotated 180°, colors same)
```
All pairs show 180° rotation → **ROTATED**

### ROTATED+SWAPPED (uniform quartered)

A 16-beat sequence where EVERY quarter transition shows 90° rotation + swap:
```
Q1→Q2: 90° rotation + swap
Q2→Q3: 90° rotation + swap
Q3→Q4: 90° rotation + swap
Q4→Q1: 90° rotation + swap
```
Consistent pattern across all quarters → **ROTATED+SWAPPED**

### ROTATED+SWAPPED (mixed-slice)

A 16-beat sequence where quarter transitions alternate:
```
Q1→Q2: 90° rotation only (no swap)
Q2→Q3: 90° rotation + swap
Q3→Q4: 90° rotation + swap
Q4→Q1: 90° rotation only (no swap)
```
Rotation at ¼ slice, swap at ½ slice → **ROTATED+SWAPPED**

### REPEATED

An 8-beat sequence where beats 1-4 are identical to beats 5-8:
```
Beat 1: blue s→w (pro), red s→e (anti)
Beat 5: blue s→w (pro), red s→e (anti)  (exact copy)
```
Second half repeats first half exactly → **REPEATED**

This occurs when a sequence needs to repeat itself to return to the original orientation.

---

## Summary Flowchart

```
┌─────────────────────────────────┐
│ Is sequence circular?           │
└─────────────┬───────────────────┘
              │ No → Not a LOOP
              │ Yes ↓
┌─────────────────────────────────┐
│ Check halved comparisons        │
│ (beat i vs beat i+half)         │
└─────────────┬───────────────────┘
              ↓
┌─────────────────────────────────┐
│ Count component matches         │
│ rotated, swapped, mirrored...   │
└─────────────┬───────────────────┘
              ↓
┌─────────────────────────────────┐
│ Beat count divisible by 4?      │
└─────────────┬───────────────────┘
              │ No → Use halved results
              │ Yes ↓
┌─────────────────────────────────┐
│ Check quartered patterns        │
│ (90° rotation at quarters)      │
└─────────────┬───────────────────┘
              ↓
┌─────────────────────────────────┐
│ Check mixed-slice patterns      │
│ (different slices for different │
│  components)                    │
└─────────────┬───────────────────┘
              ↓
┌─────────────────────────────────┐
│ Map components to LOOP type      │
└─────────────────────────────────┘
```

---

*Last updated: 2024-12-23*
