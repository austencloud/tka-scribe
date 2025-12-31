# CAP Pattern Types

This document explains the different types of Circular Auto-generative Patterns (LOOPs) and how the detection system classifies them.

---

## Quick Reference

| Type | Definition | Example |
|------|------------|---------|
| **Strict CAP** | Single transformation applies uniformly to ALL beat pairs | All pairs are "Rotated 90° CCW + Swapped" |
| **Compound CAP** | Different transformations at different intervals | Rotation at 90° (quartered) + Swap at 180° (halved) |
| **Modular CAP** | Multiple distinct patterns within the SAME sequence at the SAME interval | Some pairs are "Rotated+Swapped", others are "Rotated+Swapped+Inverted" |
| **Freeform** | Circular but no recognizable CAP pattern | Beat pairs have unrelated or unknown transformations |

---

## Detailed Explanations

### Strict CAP

A **strict CAP** has ONE transformation that applies uniformly to ALL beat pairs at a given interval.

**Example:** A 12-beat "Rotated 90° CCW + Swapped" sequence:
- Beat 1→4: Rotated 90° CCW + Swapped ✓
- Beat 2→5: Rotated 90° CCW + Swapped ✓
- Beat 3→6: Rotated 90° CCW + Swapped ✓
- ... (all pairs have the exact same transformation)

**Key property:** You can describe the entire sequence with a single designation.

---

### Compound CAP

A **compound CAP** has different transformations occurring at different interval levels.

**Example:** "90° CCW Rotated + Swapped (180°)" means:
- At the **quartered interval** (every 90°): Rotation transformation
- At the **halved interval** (every 180°): Swap transformation

This is different from "Rotated + Swapped at quartered" because the swap only happens at the larger interval.

**Key property:** You need to specify which transformation happens at which interval.

---

### Modular CAP

A **modular CAP** is a circular sequence where different "columns" or position groups follow different transformation patterns at the SAME interval.

**Example:** A 12-beat sequence with beat groups:
- **Column 1** (beats 1, 4, 7, 10): Rotated 90° CCW + Swapped
- **Column 2** (beats 2, 5, 8, 11): Rotated 90° CCW + Swapped + Inverted
- **Column 3** (beats 3, 6, 9, 12): Rotated 90° CCW + Inverted

**What makes this modular:**
1. It's still circular (ends where it starts)
2. Each "column" follows a recognizable CAP pattern
3. But the columns have DIFFERENT patterns
4. You cannot describe it with a single designation

**Why it matters:**
- A modular sequence is not "wrong" or "freeform" - it's a valid circular pattern
- The patterns ARE recognizable, just not uniform
- You need to describe it by its distinct pattern groups

**How it happens:**
- Usually caused by deliberate variation in motion properties (e.g., mixing pro/anti spin)
- Changing beats 4 and 10 from anti to pro might convert a modular sequence to a strict CAP

---

### Freeform

A **freeform** sequence is circular but has no recognizable CAP transformation pattern.

**Characteristics:**
- Beat pairs show "UNKNOWN" transformations
- Or the transformations are so varied they don't form recognizable groups
- The sequence is still circular (mathematically valid)
- But it's not following any CAP rules

---

## Detection Logic Summary

```
Is it circular? (ends where it starts)
├── No → Not a CAP (linear sequence)
└── Yes → Check transformations
    ├── All pairs have SAME transformation → Strict CAP
    ├── Patterns differ by interval (quartered vs halved) → Compound CAP
    ├── Patterns differ by position within interval → Modular CAP
    └── Patterns are unrecognizable → Freeform
```

---

## Common Questions

### Q: Can a modular sequence have a single "auto-detected designation"?

**No.** A modular sequence has multiple valid patterns. The system should show:
- `isModular: true`
- The distinct pattern groups in `beatPairGroups`
- No single `candidateDesignation` (that would be misleading)

### Q: What if I want to make a modular sequence into a strict CAP?

Look at which beats break the pattern. Often it's a motion property (pro vs anti spin) or rotation direction that differs. Adjusting those specific beats can unify the pattern.

### Q: Is modular better or worse than strict?

Neither! They're different creative choices. Strict LOOPs have perfect mathematical symmetry. Modular sequences have intentional variation that creates visual interest while maintaining circularity.
