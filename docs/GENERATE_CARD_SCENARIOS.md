# Generate Panel Card Layout Scenarios

## All Possible Card Count Scenarios

Based on the conditional rendering logic, here are all possible card count scenarios:

### Card Visibility Rules

**Always Visible (5 cards):**
1. Level
2. Length
3. Generation Mode
4. Grid Mode
5. Prop Continuity

**Conditionally Visible:**
- **Turn Intensity:** Visible when `level !== BEGINNER` (Level 2 or 3)
- **Slice Size:** Visible when `!isFreeformMode` (Circular mode only)
- **CAP Type:** Visible when `!isFreeformMode` (Circular mode only)

---

## Complete Scenario Matrix

| # | Mode | Level | Cards Shown | Total | Layout (3 per row @ 2 cols) | Empty Cells |
|---|------|-------|-------------|-------|------------------------------|-------------|
| 1 | Freeform | Beginner | Base 5 | **5** | Row 1: 3 cards<br>Row 2: 2 cards | ✅ 1 empty |
| 2 | Freeform | Intermediate | Base 5 + Turn | **6** | Row 1: 3 cards<br>Row 2: 3 cards | ✅ 0 empty |
| 3 | Freeform | Advanced | Base 5 + Turn | **6** | Row 1: 3 cards<br>Row 2: 3 cards | ✅ 0 empty |
| 4 | Circular | Beginner | Base 5 + Slice + CAP | **7** | Row 1: 3 cards<br>Row 2: 3 cards<br>Row 3: 1 card | ⚠️ 2 empty |
| 5 | Circular | Intermediate | Base 5 + Turn + Slice + CAP | **8** | Row 1: 3 cards<br>Row 2: 3 cards<br>Row 3: 2 cards | ⚠️ 1 empty (FIXED ✅) |
| 6 | Circular | Advanced | Base 5 + Turn + Slice + CAP | **8** | Row 1: 3 cards<br>Row 2: 3 cards<br>Row 3: 2 cards | ⚠️ 1 empty (FIXED ✅) |

---

## Optimization Status

### ✅ **Optimized Scenarios**

#### **8-Card Layout (Circular + Intermediate/Advanced)**
**Implementation:**
```typescript
// When visibleCardCount === 8:
gridColumnSpan={3}  // SliceSize and CAP each span 3 columns (50% of 6-column grid)
```

**Result:**
```
Row 1: [Level (2)] [Length (2)] [TurnIntensity (2)]
Row 2: [GenMode (2)] [Grid (2)] [PropContinuity (2)]
Row 3: [SliceSize (3)] [CAP (3)]  ← Perfectly filled row ✅
```

---

### ⚠️ **Scenarios Needing Optimization**

#### **7-Card Layout (Circular + Beginner)**
**Current State:**
```
Row 1: [Level (2)] [Length (2)] [GenMode (2)]
Row 2: [Grid (2)] [PropContinuity (2)] [SliceSize (2)]
Row 3: [CAP (2)] [EMPTY] [EMPTY]  ← 2 empty cells
```

**Proposed Optimization:**
Make CAP card span 6 columns (full row width) for better visual balance:
```
Row 1: [Level (2)] [Length (2)] [GenMode (2)]
Row 2: [Grid (2)] [PropContinuity (2)] [SliceSize (2)]
Row 3: [CAP (6)]  ← Full width ✅
```

---

#### **5-Card Layout (Freeform + Beginner)**
**Current State:**
```
Row 1: [Level (2)] [Length (2)] [GenMode (2)]
Row 2: [Grid (2)] [PropContinuity (2)] [EMPTY]  ← 1 empty cell
```

**Proposed Optimization:**
Make PropContinuity span 4 columns to fill row:
```
Row 1: [Level (2)] [Length (2)] [GenMode (2)]
Row 2: [Grid (2)] [PropContinuity (4)]  ← Fills remaining space ✅
```

**Alternative:**
Make Grid and PropContinuity each span 3 columns:
```
Row 1: [Level (2)] [Length (2)] [GenMode (2)]
Row 2: [Grid (3)] [PropContinuity (3)]  ← Balanced layout ✅
```

---

### ✅ **Scenarios Already Optimal**

#### **6-Card Layout (Freeform + Intermediate/Advanced)**
```
Row 1: [Level (2)] [Length (2)] [TurnIntensity (2)]
Row 2: [GenMode (2)] [Grid (2)] [PropContinuity (2)]
```
Perfect 2-row layout with no empty cells. **No optimization needed.**

---

## Implementation Priority

1. **✅ COMPLETED:** 8-card scenario (Circular + Intermediate/Advanced)
2. **NEXT:** 7-card scenario (Circular + Beginner) - 2 empty cells
3. **THEN:** 5-card scenario (Freeform + Beginner) - 1 empty cell
4. **SKIP:** 6-card scenarios - already optimal

---

## Technical Implementation Notes

### Grid System
- **Total columns:** 6 subcolumns
- **Default card span:** 2 columns (3 cards per row)
- **Flexible spanning:** Cards can span 2, 3, 4, or 6 columns

### Dynamic Calculation
```typescript
let visibleCardCount = $derived.by(() => {
  let count = 5; // Base cards
  if (shouldShowTurnIntensity) count++; // Level 2-3
  if (!isFreeformMode) count += 2; // Circular mode (Slice + CAP)
  return count;
});
```

### Applying Custom Spans
```svelte
<SliceSizeCard
  gridColumnSpan={visibleCardCount === 8 ? 3 : 2}
  ...
/>
```

---

## Portrait Mobile Layout Considerations

The user specifically mentioned targeting **portrait mobile layout** where:
- Workbench is on top
- Generate panel is on bottom
- Vertical space is limited
- Horizontal space should be maximally utilized

Container queries handle responsive adjustments:
```css
/* Portrait mode: Cards span 3 columns (2 per row) */
@container settings-grid (aspect-ratio < 1) {
  .card-settings-container > :global(*) {
    grid-column: span 3;
  }
}
```

**Important:** Our optimizations use inline `grid-column` styles which take precedence over container query rules, so they work correctly in all viewport modes.

---

## Desktop Layout

Desktop optimizations will be handled separately after mobile optimizations are complete. Desktop typically has more horizontal space, so different spanning strategies may be more appropriate.
