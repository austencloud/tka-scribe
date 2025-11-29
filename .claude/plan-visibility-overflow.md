# Plan: Fix Visibility Settings Overflow on Mobile

## Problem Analysis

On iPhone SE (375×667), the Visibility Settings content overflows. Looking at the structure:

### Current Space Budget
- Drawer header: ~50px
- Back button: ~50px
- VisibilityTab header + description + Show Preview button: ~100-120px
- **Available for controls: ~450px**

### What Needs to Fit
- ElementVisibilityControls contains:
  - 3 section titles (Element Visibility, Motion Visibility, Grid Elements)
  - 9 ChipRow buttons (each has `min-height: 48px`)
  - 2 section dividers
  - Padding and margins

Current calculation:
- 9 chips × 48px = 432px (just the chips)
- Plus ~80px for titles, dividers, margins
- **Total: ~512px (overflows by ~60px)**

## Solution

Make ChipRow and ElementVisibilityControls height-aware using parent container queries.

### Files to Modify

1. **ChipRow.svelte**
   - Add `@container settings-content` queries for compact mode
   - Reduce `min-height` from 48px to 36-40px when height < 600px
   - Tighten padding: `padding: 8px 12px` in compact mode
   - Reduce margin-bottom between chips

2. **ElementVisibilityControls.svelte**
   - Reduce section divider margins when height-constrained
   - Compact the group titles
   - Tighten overall padding

### Target Result
All 9 toggles + 2 motion toggles + 1 grid toggle should fit without scrolling on iPhone SE.
