# CAP Combinations Implementation Plan

## Overview

The legacy desktop app supports 11 CAP type combinations (4 strict + 7 combinations).
Currently implemented: 4 strict types. Need to implement: 7 combination types.

## Transformation Types

### 1. MIRRORED

- Mirror locations vertically (E↔W, N↔S unchanged)
- Flip prop rotation direction (CW↔CCW)
- Same letter, same motion type

### 2. SWAPPED

- Swap colors: Blue does what Red did, Red does what Blue did
- Locations/positions swap accordingly
- Same motion type, same prop rotation, same letter

### 3. ROTATED

- Rotate locations (CW: 90°, CCW: 270°, or 180° based on handpath)
- Supports both quartered (4 sections) and halved (2 sections)
- Derive new end position from rotated hand locations
- Same motion type, same prop rotation, same letter

### 4. COMPLEMENTARY

- Get complementary letter (A↔B, D↔E, G↔H, etc.)
- Flip motion type (PRO↔ANTI)
- Flip prop rotation direction (CW↔CCW)
- Same locations

## Implementation Status

### ✅ Strict Types (4/4 DONE)

1. ✅ `strict-rotated` - StrictRotatedCAPExecutor
2. ✅ `strict-mirrored` - StrictMirroredCAPExecutor
3. ✅ `strict-swapped` - StrictSwappedCAPExecutor
4. ✅ `strict-complementary` - StrictComplementaryCAPExecutor

### ❌ Dual Combinations (0/6 DONE)

#### 5. ❌ `mirrored-swapped` - MirroredSwappedCAPExecutor

**Combines:** MIRRORED + SWAPPED

- Swap colors (Blue does Red's actions)
- Mirror locations vertically (E↔W)
- Mirror prop rotation (CW↔CCW)
- Keep motion type same
- Keep letter same
- **Validation:** End position must be vertical mirror of start
- **Slice Size:** Always halved

**Legacy File:** `mirrored_swapped_CAP_executor.py`

**Key Logic (lines 68-73, 96-127):**

```python
BLUE_ATTRS: self.create_new_attributes(
  previous_entry[BLUE_ATTRS], previous_matching_beat[RED_ATTRS]  # ← SWAPPED
),
RED_ATTRS: self.create_new_attributes(
  previous_entry[RED_ATTRS], previous_matching_beat[BLUE_ATTRS]  # ← SWAPPED
),
```

Then in create_new_attributes:

- Mirror locations: `calculate_mirrored_CAP_new_loc()`
- Mirror prop rotation: `get_mirrored_prop_rot_dir()`

#### 6. ❌ `rotated-swapped` - RotatedSwappedCAPExecutor

**Combines:** ROTATED + SWAPPED

- Swap colors (Blue does Red's actions)
- Rotate locations based on handpath
- Keep prop rotation same
- Keep motion type same
- Keep letter same
- **Validation:** Must be valid rotated position pair
- **Slice Size:** Supports both quartered and halved

**Legacy File:** `rotated_swapped_CAP_executor.py`

#### 7. ❌ `swapped-complementary` - SwappedComplementaryCAPExecutor

**Combines:** SWAPPED + COMPLEMENTARY

- Swap colors (Blue does Red's actions)
- Get complementary letter
- Flip motion type (PRO↔ANTI)
- Flip prop rotation (CW↔CCW)
- Keep locations same (returns to start)
- **Validation:** End position must equal start position
- **Slice Size:** Always halved

**Legacy File:** `swapped_complementary_CAP_executor.py`

#### 8. ❌ `rotated-complementary` - RotatedComplementaryCAPExecutor

**Combines:** ROTATED + COMPLEMENTARY

- Get complementary letter (A↔B, etc.)
- Flip motion type (PRO↔ANTI)
- Flip prop rotation (CW↔CCW)
- Rotate locations based on handpath
- Keep colors same (Blue stays Blue, Red stays Red)
- **Validation:** Must be valid rotated position pair
- **Slice Size:** Supports both quartered and halved

**Legacy File:** `rotated_complementary_CAP_executor.py`

**Key Logic (lines 160-174, 282-299):**

```python
LETTER: ComplementaryLetterGetter().get_complimentary_letter()  # ← COMPLEMENTARY
BLUE_ATTRS: self.create_new_attributes(
  previous_entry[BLUE_ATTRS],
  previous_matching_beat[BLUE_ATTRS],  # ← NOT swapped
),
```

Then in create_new_attributes:

- Flip motion type: `get_other_motion_type()` (PRO↔ANTI)
- Flip prop rotation: `get_other_prop_rot_dir()` (CW↔CCW)
- Rotate location: `calculate_rotated_permutation_new_loc()`

#### 9. ❌ `mirrored-complementary` - MirroredComplementaryCAPExecutor

**Combines:** MIRRORED + COMPLEMENTARY

- Get complementary letter
- Flip motion type (PRO↔ANTI)
- Flip prop rotation TWICE (complementary flip + mirror flip = NO CHANGE)
  - **IMPORTANT:** Both transformations flip CW↔CCW, so they cancel out!
- Mirror locations vertically (E↔W)
- Keep colors same
- **Validation:** End position must be vertical mirror of start
- **Slice Size:** Always halved

**Legacy File:** `mirrored_complementary_CAP_executor.py`

#### 10. ❌ `mirrored-rotated` - Uses StrictMirroredCAPExecutor

**Note:** In legacy factory, this maps to StrictMirroredCAPExecutor (line 38)
This might be because mirrored-rotated behaves the same as strict mirrored for practical purposes.

### ❌ Triple Combination (0/1 DONE)

#### 11. ❌ `mirrored-complementary-rotated` - MirroredComplementaryCAPExecutor

**Note:** In legacy factory, this maps to MirroredComplementaryCAPExecutor (line 39)
This uses the same executor as mirrored-complementary, possibly with a different configuration.

**Legacy File:** `mirrored_complementary_rotated_CAP_executor.py`

## Implementation Order

### Phase 1: Simpler Dual Combinations

1. **Mirrored-Swapped** (simplest - we have both pieces)
2. **Swapped-Complementary** (simple - both return to start)
3. **Mirrored-Complementary** (interesting rotation flip cancellation)

### Phase 2: Rotated Combinations

4. **Rotated-Swapped** (more complex - supports quartered/halved)
5. **Rotated-Complementary** (most complex - supports quartered/halved)

### Phase 3: Special Cases

6. **Mirrored-Rotated** (verify if different from strict-mirrored)
7. **Mirrored-Complementary-Rotated** (triple combo)

## Testing Strategy

For each combination executor:

1. Verify transformation logic (use helper functions from strict executors)
2. Test with multiple start positions
3. Test continuity settings
4. Verify end position validation
5. Create regression tests similar to swapped CAP

## UI Updates Needed

Current UI only shows strict types. Need to:

1. Update CAP type picker to show all combinations
2. Add visual indicators for combination types
3. Update slice size logic (some combinations only support halved)
4. Update validation messages for each combination type
