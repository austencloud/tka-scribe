# CAP Taxonomy

## Overview

The CAP (Continuous Assembly Pattern) taxonomy defines how flow prop sequences achieve circularity through transformation patterns. This document provides the definitive reference for all CAP component types.

## Core Principles

A CAP sequence is **circular** - it ends where it began with matching orientations. This circularity is achieved through **transformation patterns** where the second half of the sequence relates to the first half in specific, predictable ways.

---

## CAP Component Types

### 1. Rotated
**Transformation:** Positions rotate 180° (halved) or 90° (quartered)
**Icon:** rotate
**Color:** #36c3ff (cyan)

**Example:** Beat 1 has props at N/S, Beat 9 (halfway) has props at S/N (180° rotation)

**Intervals:**
- **Halved (½)**: Rotation occurs at 180° (beat n+8 in 16-beat sequence)
- **Quartered (¼)**: Rotation occurs at 90° intervals (every 4 beats)

---

### 2. Swapped
**Transformation:** Blue and red hands swap roles
**Icon:** shuffle
**Color:** #26e600 (green)

**Example:** Beat 1 has blue at N and red at S, Beat 9 has blue at S (red's position) and red at N (blue's position)

**Intervals:**
- **Halved (½)**: Swap occurs at midpoint
- **Quartered (¼)**: Swap occurs every quarter

---

### 3. Mirrored
**Transformation:** Positions mirror vertically (left ↔ right)
**Icon:** left-right
**Color:** #6F2DA8 (purple)

**Example:** Beat 1 at W becomes E in beat 9, E becomes W

**Typically halved** - mirrors at the halfway point.

---

### 4. Flipped
**Transformation:** Positions mirror horizontally (top ↔ bottom)
**Icon:** up-down
**Color:** #14b8a6 (teal)

**Example:** Beat 1 at N becomes S in beat 9, S becomes N

**Typically halved** - flips at the halfway point.

---

### 5. Inverted
**Transformation:** Pro ↔ Anti motion types flip
**Icon:** yin-yang
**Color:** #eb7d00 (orange)

**Example:** Beat 1 uses pro motion, beat 9 uses anti motion with same positions

**Typically halved** - inverts at the halfway point.

---

### 6. Rewound
**Transformation:** Second half plays in reverse
**Icon:** backward
**Color:** #ec4899 (pink)

**Example:** Beats 9-16 are beats 1-8 in reverse order

**No interval concept** - inherently a halved pattern.

---

### 7. Repeated
**Transformation:** Sequence repeats 2-4x for true circularity (orientations match)
**Icon:** repeat
**Color:** #f59e0b (amber)

**Example:** A 4-beat phrase repeated 4 times to create a 16-beat circular sequence

**No interval concept** - describes repetition count, not transformation interval.

**Note:** This is for when the sequence doesn't return to home position with correct orientations until multiple repetitions.

---

### 8. Modular ⭐ NEW

**Transformation:** Multiple distinct motifs transform independently at different intervals
**Icon:** layer-group
**Color:** #8b5cf6 (violet)

**Definition:** A sequence composed of **multiple motifs** (sections/phrases) where **each motif follows its own independent transformation pattern** at **different intervals**. Different components of the sequence transform according to different rules.

#### Key Characteristics:

1. **Multiple Motifs**: The sequence contains 2+ distinct recurring phrases/sections
2. **Independent Transformations**: Each motif has its own transformation rule (rotated, swapped, mirrored, etc.)
3. **Different Intervals**: Motifs transform at different points (one at quarters, another at halves, etc.)
4. **Structural Coherence**: Despite independent transformations, the overall sequence remains circular

#### Example: AAKE

**Structure:**
- **Motif A**: AA (two "A" letters in sequence)
- **Motif B**: KE (K followed by E)

**Independent Transformations:**
- **AA rotation**: Alternates CCW/CW every **quarter** (every 4 beats)
  - Beats 1-2: AA (CCW)
  - Beats 5-6: AA (CW)
  - Beats 9-10: AA (CCW)
  - Beats 13-14: AA (CW)

- **KE destination**: Swaps at **halfway** point (beat 8)
  - Beats 3-4: KE → beta1 (north)
  - Beats 7-8: KE → beta5 (south)
  - Beats 11-12: KE → beta5 (south)
  - Beats 15-16: KE → beta1 (north)

**Result:** Two transformation patterns running in parallel on different motifs at different intervals.

#### How Modular Differs:

**vs. Simple CAPs:**
- Simple: Entire sequence follows one transformation (all rotated, all swapped)
- Modular: Different parts follow different transformations

**vs. Section CAPs:**
- Section: Sections relate to each other with the same transformation type
- Modular: Sections contain motifs with independent transformation rules

**vs. Repeated:**
- Repeated: Same content repeats multiple times
- Modular: Different motifs transform independently (may include repetition as one component)

#### When to Use Modular:

Use "modular" when you observe:
1. ✅ Distinct recurring motifs/phrases within the sequence
2. ✅ Each motif transforms according to its own pattern
3. ✅ Transformation intervals differ between motifs
4. ✅ Cannot be cleanly described by a single whole-sequence CAP

**Do NOT use modular for:**
- ❌ Simple whole-sequence transformations
- ❌ Section relationships that all follow the same transformation type
- ❌ Beat pair relationships without motif-level structure
- ❌ True freeform (no recognizable patterns at all)

#### Labeling Modular Sequences:

1. Mark the sequence as **"modular"** in whole mode
2. **Optionally** add notes describing:
   - The distinct motifs
   - Each motif's transformation pattern
   - The interval for each transformation

**Example Note for AAKE:**
```
Modular: AA alternates rotation (quartered: CCW/CW/CCW/CW),
KE swaps destination (halved: beta1/beta5/beta5/beta1)
```

#### Future Expansion:

The modular designation opens the door for more complex pattern analysis:
- Multi-layer notation systems
- Motif-level interval tracking
- Transformation dependency graphs

---

## Combination Patterns

Components can combine when multiple transformations occur simultaneously:

- **rotated+swapped**: Positions rotate AND colors swap
- **mirrored+swapped**: Positions mirror AND colors swap
- **flipped+inverted**: Positions flip AND motion types invert
- **mirrored+swapped+inverted**: All three transformations occur

---

## Transformation Intervals

Transformations can occur at different intervals:

- **Halved (½)**: Transformation at 180° / midpoint (beat n/2)
- **Quartered (¼)**: Transformation at 90° intervals (every n/4 beats)

**Tracked for:** rotated, swapped, mirrored, flipped, inverted
**Not applicable:** rewound, repeated, modular

---

## Non-CAP Designations

### Freeform
No recognizable transformation pattern. Use **only when**:
- No whole-sequence transformations
- No section-level patterns
- No beat pair relationships
- Truly irregular/improvised structure

### Unknown
Pattern exists but cannot be currently categorized. Use for:
- Complex patterns not yet in taxonomy
- Patterns requiring further analysis
- Transitional placeholder during labeling

---

## Decision Tree

```
Does the sequence have recognizable patterns?
├─ NO → Freeform
└─ YES
   │
   Does the entire sequence follow one transformation?
   ├─ YES → Simple CAP (rotated, swapped, mirrored, etc.)
   └─ NO
      │
      Do sections relate with the same transformation?
      ├─ YES → Section CAP
      └─ NO
         │
         Do distinct motifs transform independently?
         ├─ YES → Modular
         └─ NO
            │
            Do individual beat pairs have relationships?
            ├─ YES → Beat Pair labeling
            └─ NO → Unknown or Freeform
```

---

## Version History

- **v1.1** (2025-12-23): Added "modular" component for multi-motif independent transformations
- **v1.0** (2025-12-15): Initial taxonomy with 7 base components

---

## Related Documentation

- [CAP Detection Algorithm](./CAP-DETECTION-ALGORITHM.md) - Automated detection implementation
- [Feedback Workflow](./FEEDBACK-WORKFLOW.md) - How CAP labeling fits into development workflow
