# Multi-Select Architecture Design
## The Kinetic Alphabet - Beat Grid Batch Operations

**Status:** Architecture Design (Not Yet Implemented)
**Created:** January 2025
**Purpose:** Future-proof architecture for batch beat editing

---

## Executive Summary

This document outlines the architecture for adding advanced multi-select and batch editing capabilities to the beat grid, while maintaining the current simple single-select workflow. The design uses **progressive disclosure** to hide complexity from beginners while enabling power users to edit multiple beats simultaneously.

### Key Goals

1. **Keep current UX unchanged** - Single tap continues to work exactly as it does now
2. **Add long-press for multi-select** - Industry standard activation pattern
3. **Enable row/column selection** - Select entire rows/columns for batch turn value editing
4. **Support arbitrary multi-select** - Select any combination of beats across the grid
5. **Future-proof state management** - Architecture that scales to advanced operations

---

## Current State Analysis

### Current Selection Model (Single-Select)

```typescript
interface SequenceSelectionStateData {
  selectedBeatNumber: number | null;    // 0=start, 1=first beat, etc.
  selectedStartPosition: PictographData | null;
  hasStartPosition: boolean;
}
```

**Current Behavior:**
- ✅ Single tap → Select beat → Open edit panel
- ✅ Transparent backdrop → Click other beats → Switch selection
- ✅ Gold selection border with glassmorphism
- ✅ ESC key / swipe / X button to close panel

**This works perfectly for single-item editing and should remain the default behavior.**

---

## Proposed Architecture

### Phase 1: Extended State Model (Backward Compatible)

**Extend selection state to support both modes:**

```typescript
// Selection mode
type SelectionMode = 'single' | 'multi';

// Selection scope (for "select all" variants)
type SelectionScope = 'none' | 'all' | 'row' | 'column' | 'custom';

// Extended selection state (backward compatible)
interface ExtendedSelectionState {
  // Mode
  mode: SelectionMode;                    // 'single' | 'multi'

  // Single-select (current behavior)
  selectedBeatNumber: number | null;      // Stays for backward compatibility

  // Multi-select (new)
  selectedBeatNumbers: Set<number>;       // Multiple beat numbers
  selectionAnchor: number | null;         // For range selection
  lastSelected: number | null;            // For shift-click ranges

  // Scope
  selectionScope: SelectionScope;         // What kind of selection
  selectedRow: number | null;             // If row selected
  selectedColumn: number | null;          // If column selected

  // Start position (unchanged)
  selectedStartPosition: PictographData | null;
  hasStartPosition: boolean;
}
```

**Key Design Principles:**

1. **Backward Compatibility**: `selectedBeatNumber` remains for all existing code
2. **Mode Separation**: Clear distinction between single and multi mode
3. **Incremental Adoption**: Can add multi-select without breaking existing features

### Getter Properties

```typescript
// For backward compatibility
get selectedBeatNumber(): number | null {
  if (this.mode === 'single') {
    return this._singleSelectedBeat;
  }
  // In multi mode, return first selected for legacy code
  return this.selectedBeatNumbers.size > 0
    ? Array.from(this.selectedBeatNumbers)[0]
    : null;
}

// New multi-select getters
get hasMultipleSelection(): boolean {
  return this.mode === 'multi' && this.selectedBeatNumbers.size > 1;
}

get selectionCount(): number {
  return this.mode === 'multi'
    ? this.selectedBeatNumbers.size
    : (this.selectedBeatNumber !== null ? 1 : 0);
}

get isMultiSelectMode(): boolean {
  return this.mode === 'multi';
}
```

---

## User Interaction Patterns

### Pattern 1: Single-Select (Current - Unchanged)

**Behavior:** Default mode, optimized for speed

```
User Action:
1. Tap beat → Select + open edit panel immediately
2. Tap another beat → Switch selection, panel updates
3. Close panel → Return to normal state

Mode: 'single'
Visual: Gold border with glassmorphism (current)
Panel: Opens immediately on tap
```

**Code remains unchanged** - all existing behavior preserved.

### Pattern 2: Multi-Select Activation

**Behavior:** Long-press to enter multi-select mode

```
User Action:
1. Long-press beat (500ms) → Enter multi-select mode
   - Haptic feedback
   - Beat shows checkbox (checked)
   - Bottom toolbar appears
   - Mode changes to 'multi'

2. Tap other beats → Add/remove from selection
   - Toggle checkbox
   - Update counter in toolbar

3. Tap "Done" or "Edit" → Process batch operation

Mode: 'multi'
Visual: Checkboxes on beats, selection counter, toolbar
Panel: Doesn't open on tap (taps toggle selection)
```

**Prevention of Accidental Activation:**
- 500ms duration (not instant)
- Visual progress indicator during long-press
- Haptic feedback confirms activation
- Clear toolbar with "Cancel" button

### Pattern 3: Row Selection

**Behavior:** Select entire horizontal row of beats

```
User Action:
1. Enter multi-select mode (long-press any beat)
2. Tap "Select Row" button in toolbar
3. Tap on any beat in desired row
4. All beats in that row are selected

OR (advanced):
1. Long-press beat (500ms)
2. Swipe horizontally → Selects entire row
3. Release → Row selected

Use Case: Set all beats in a row to same turn value
Example: Set all beat 3's across sequences to "turn 2"
```

### Pattern 4: Column Selection

**Behavior:** Select entire vertical column of beats

```
User Action:
1. Enter multi-select mode (long-press any beat)
2. Tap "Select Column" button in toolbar
3. Tap on any beat in desired column
4. All beats in that column are selected

OR (advanced):
1. Long-press beat (500ms)
2. Swipe vertically → Selects entire column
3. Release → Column selected

Use Case: Modify sequence of beats
Example: Select all beats in sequence 2, change motion properties
```

### Pattern 5: Range Selection

**Behavior:** Select continuous range of beats

```
User Action:
1. Enter multi-select mode (long-press first beat)
2. Tap "Select Range" from toolbar menu
3. Tap last beat in range
4. All beats between (inclusive) are selected

Visual: Rectangular selection area highlights during selection
```

---

## Visual Design Specifications

### Single-Select Mode (Current - Unchanged)

```
Beat Cell:
  - Default: Normal appearance
  - Selected:
    - 3px gold gradient border
    - Transparent background with gold gradient
    - 12px border radius
    - Gold glow shadow
    - Scale 1.08
    - z-index: 10
```

**No changes to current styling.**

### Multi-Select Mode (New)

**Unselected Beat:**
```css
.beat-cell.multi-mode {
  /* Checkbox appears in top-right */
  position: relative;
}

.beat-cell.multi-mode::before {
  content: '';
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  z-index: 5;

  /* Large touch target */
  cursor: pointer;
  touch-action: manipulation;
}
```

**Selected Beat (Multi-Mode):**
```css
.beat-cell.multi-mode.selected {
  /* Lighter selection than single-select */
  border: 2px solid rgba(251, 191, 36, 0.6);
  background: rgba(251, 191, 36, 0.1);

  /* Checkbox checked */
}

.beat-cell.multi-mode.selected::before {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border-color: transparent;

  /* Checkmark icon */
  background-image: url('data:image/svg+xml,...');
}
```

**Selection Counter & Toolbar:**
```
Mobile (Bottom Sheet):
┌─────────────────────────────────┐
│ ┌─────────────────────────────┐ │
│ │  [Cancel]  5 beats selected │ │
│ ├─────────────────────────────┤ │
│ │  [Edit Properties]          │ │
│ │  [Delete]                   │ │
│ │  [Select All]               │ │
│ │  [Select Row]               │ │
│ │  [Select Column]            │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘

Desktop (Contextual Action Bar):
┌──────────────────────────────────────┐
│ [X]  5 beats selected  [Edit] [Del] │
└──────────────────────────────────────┘
```

---

## Batch Editing UI

### Bottom Sheet Structure (Mobile)

When user taps "Edit Properties" in multi-select toolbar:

```
┌─────────────────────────────────────┐
│ ═══  (drag handle)                  │
│ Edit 5 Beats                        │
├─────────────────────────────────────┤
│                                     │
│ Red Prop Rotation:    [Mixed ▼]    │
│ Blue Prop Rotation:   [Mixed ▼]    │
│                                     │
│ Red Turn Amount:      [  2   ]     │
│ Blue Turn Amount:     [Mixed ▼]    │
│                                     │
│ Motion:               [Mixed ▼]    │
│                                     │
│ Duration:             [1000ms]     │
│                                     │
├─────────────────────────────────────┤
│ [Cancel]            [Apply Changes] │
└─────────────────────────────────────┘
```

**Field States:**

1. **Same Value Across All:**
   - Shows actual value
   - Example: "Duration: 1000ms"

2. **Different Values (Mixed):**
   - Shows "[Mixed]" or "[Various values]"
   - Dropdown to select value applies to all
   - Leaving blank = no change

3. **Edited Field:**
   - Field label becomes bold
   - Value highlights
   - Only edited fields are applied

### Conflict Resolution Examples

**Scenario 1: Turn Amount Mixed**

```
Selected beats:
- Beat 1: Red turn = 2, Blue turn = 1
- Beat 2: Red turn = 2, Blue turn = 3
- Beat 3: Red turn = 1, Blue turn = 1

Batch Edit UI Shows:
Red Turn Amount:  [Mixed ▼]  (values: 1, 2)
Blue Turn Amount: [Mixed ▼]  (values: 1, 3)

User selects "Red Turn = 2":
Result: All beats set to Red turn = 2
        Blue turn unchanged (not edited)
```

**Scenario 2: Duration Same**

```
Selected beats:
- Beat 1: Duration = 1000ms
- Beat 2: Duration = 1000ms
- Beat 3: Duration = 1000ms

Batch Edit UI Shows:
Duration: [1000ms]

User changes to 1500ms:
Result: All beats set to 1500ms
```

---

## Implementation Phases

### Phase 1: State Foundation (Week 1)

**Goal:** Extend state model without breaking existing code

**Tasks:**
1. Add `mode`, `selectedBeatNumbers`, etc. to selection state
2. Add getters/setters for multi-select
3. Ensure backward compatibility (all existing code works)
4. Write unit tests

**Deliverable:** Extended state model, fully tested, zero breaking changes

### Phase 2: Multi-Select Activation (Week 2)

**Goal:** Basic multi-select with long-press

**Tasks:**
1. Implement long-press detection (500ms)
2. Add haptic feedback
3. Create selection toolbar component
4. Add checkbox overlay to beat cells
5. Implement "Cancel" to exit multi-select mode

**Deliverable:** Working multi-select activation and deactivation

### Phase 3: Selection Gestures (Week 3)

**Goal:** Multiple ways to select beats

**Tasks:**
1. Tap to toggle in multi-select mode
2. "Select All" button
3. "Select Row" feature
4. "Select Column" feature
5. Selection counter display

**Deliverable:** Full selection capabilities

### Phase 4: Batch Edit UI (Week 4)

**Goal:** Batch property editing

**Tasks:**
1. Batch edit bottom sheet component
2. Mixed value detection and display
3. Field-specific editors
4. Track edited fields
5. Apply changes to all selected beats

**Deliverable:** Working batch edit panel

### Phase 5: Advanced Features (Week 5)

**Goal:** Polish and power user features

**Tasks:**
1. Range selection
2. Undo/redo for batch operations
3. Progressive disclosure (tooltips)
4. Keyboard shortcuts (desktop)
5. Performance optimization

**Deliverable:** Polished, production-ready multi-select

---

## Code Structure

### New Files to Create

```
src/lib/modules/build/shared/state/selection/
├── SequenceSelectionState.svelte.ts           (existing - extend)
├── MultiSelectState.svelte.ts                 (new)
└── SelectionService.ts                        (new - service layer)

src/lib/modules/build/shared/components/
├── SelectionToolbar.svelte                    (new)
├── BatchEditSheet.svelte                      (new)
└── SelectableIndicator.svelte                 (new - checkbox overlay)

src/lib/modules/build/workspace-panel/core/
└── BeatCell.svelte                            (modify - add multi-select)

src/lib/modules/build/shared/services/
└── BatchEditService.ts                        (new)
```

### Service Architecture

```typescript
// SelectionService.ts
export class SelectionService {
  private state: ExtendedSelectionState;

  // Mode management
  enterMultiSelectMode(initialBeatNumber: number): void
  exitMultiSelectMode(): void

  // Selection operations
  toggleBeat(beatNumber: number): void
  selectRange(start: number, end: number): void
  selectRow(rowIndex: number, gridLayout: GridLayout): void
  selectColumn(colIndex: number, gridLayout: GridLayout): void
  selectAll(beatNumbers: number[]): void
  clearSelection(): void

  // Query methods
  isSelected(beatNumber: number): boolean
  getSelectedBeats(): number[]
  getSelectionCount(): number
  isMultiSelectActive(): boolean
}
```

```typescript
// BatchEditService.ts
export class BatchEditService {
  // Conflict detection
  detectMixedValues(
    beats: BeatData[],
    fields: string[]
  ): Map<string, Set<any>>

  // Apply changes
  applyBatchEdit(
    selectedBeats: BeatData[],
    changes: Partial<BeatData>,
    editedFields: Set<string>
  ): BeatData[]

  // Validation
  canApplyToAll(
    selectedBeats: BeatData[],
    operation: BatchOperation
  ): boolean
}
```

---

## Integration Points

### 1. BeatCell Component

**Changes needed:**

```typescript
// Add props
let {
  // ... existing props
  selectionMode = 'single',
  isMultiSelectMode = false,
  showCheckbox = false,
  onLongPress,
} = $props<{
  selectionMode?: 'single' | 'multi';
  isMultiSelectMode?: boolean;
  showCheckbox?: boolean;
  onLongPress?: () => void;
  // ... existing props
}>();

// Add long-press detection
let longPressTimer: number | null = null;

function handlePointerDown() {
  longPressTimer = setTimeout(() => {
    triggerHaptic();
    onLongPress?.();
  }, 500);
}

function handlePointerUp() {
  if (longPressTimer) {
    clearTimeout(longPressTimer);
  }
}
```

### 2. WorkspacePanel Integration

**Changes needed:**

```typescript
// Add selection service
const selectionService = new SelectionService();

// Add handlers
function handleBeatLongPress(beatNumber: number) {
  selectionService.enterMultiSelectMode(beatNumber);
  // Show selection toolbar
}

function handleBeatClick(beatNumber: number) {
  if (selectionService.isMultiSelectActive()) {
    // Toggle selection
    selectionService.toggleBeat(beatNumber);
  } else {
    // Current behavior - select and open panel
    sequenceState.selectBeat(beatNumber);
  }
}
```

### 3. Edit Panel Modifications

**No changes needed initially** - edit panel continues to work in single-select mode. Batch edit gets its own separate component (BatchEditSheet).

---

## Progressive Disclosure Strategy

### First-Time User Experience

**Goal:** Don't overwhelm beginners with multi-select

**Strategy:**
1. **Hidden by default** - Only single-select visible initially
2. **Subtle hints** - After 3-5 beat edits, show tooltip: "💡 Tip: Long-press to select multiple beats"
3. **Empty states** - Tutorial screen mentions multi-select as advanced feature
4. **Help docs** - Full documentation available but not forced

### Intermediate User Discovery

**Triggers for showing multi-select hints:**
- User has edited 10+ beats individually
- User has created 3+ sequences
- User spends 5+ minutes in edit mode
- User opens help/settings (show as feature)

**Hint format:**
```
┌─────────────────────────────────┐
│ 💡 Speed Tip                    │
│ Long-press beats to select      │
│ multiple at once!               │
│ [Show me] [Not now]             │
└─────────────────────────────────┘
```

### Power User Features

**Advanced users discover through:**
- Settings toggle: "Enable advanced selection features"
- Keyboard shortcuts (desktop)
- Long-press (standard mobile pattern)
- Help documentation

---

## Testing Strategy

### Unit Tests

```typescript
describe('SelectionService', () => {
  it('should enter multi-select mode on long-press', () => {
    service.enterMultiSelectMode(1);
    expect(service.isMultiSelectActive()).toBe(true);
    expect(service.getSelectedBeats()).toEqual([1]);
  });

  it('should toggle beat selection', () => {
    service.enterMultiSelectMode(1);
    service.toggleBeat(2);
    expect(service.getSelectedBeats()).toEqual([1, 2]);

    service.toggleBeat(1);
    expect(service.getSelectedBeats()).toEqual([2]);
  });

  it('should select entire row', () => {
    const grid = createMockGrid(3, 5); // 3 rows, 5 columns
    service.selectRow(1, grid);
    expect(service.getSelectionCount()).toBe(5);
  });
});
```

### Integration Tests

```typescript
describe('Multi-Select Integration', () => {
  it('should enter multi-select on long-press', async () => {
    const beat = screen.getByTestId('beat-1');

    // Simulate long-press
    fireEvent.pointerDown(beat);
    await wait(600); // > 500ms

    expect(screen.getByText(/1 beat selected/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should apply batch edit to all selected beats', async () => {
    // Select multiple beats
    await selectBeats([1, 2, 3]);

    // Open batch edit
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));

    // Change turn amount
    const turnInput = screen.getByLabelText(/red turn/i);
    fireEvent.change(turnInput, { target: { value: '2' } });

    // Apply
    fireEvent.click(screen.getByRole('button', { name: /apply/i }));

    // Verify all beats updated
    const beats = getBeats([1, 2, 3]);
    beats.forEach(beat => {
      expect(beat.redTurnAmount).toBe(2);
    });
  });
});
```

### User Testing

**Scenarios to test:**
1. Can first-time users edit beats without encountering multi-select?
2. Do intermediate users discover long-press naturally?
3. Can power users efficiently select rows/columns?
4. Is batch editing intuitive for mixed values?
5. Can users easily exit multi-select mode?

---

## Performance Considerations

### Large Grids

**Challenge:** Selecting 100+ beats at once

**Solutions:**
1. **Virtual scrolling** - Only render visible beats
2. **Debounced updates** - Batch selection changes
3. **Optimistic UI** - Show checkmarks immediately, apply later
4. **Background processing** - Apply batch edits asynchronously

### Memory Management

```typescript
// Use Set for O(1) lookups
selectedBeatNumbers: Set<number>

// Not array (O(n) lookups)
selectedBeatNumbers: number[] // ❌
```

### Render Optimization

```typescript
// Memoize selection state per beat
const isSelected = useMemo(
  () => selectionService.isSelected(beatNumber),
  [beatNumber, selectionService.state.selectedBeatNumbers]
);
```

---

## Migration Path

### Backward Compatibility Guarantee

**All existing code continues to work:**

```typescript
// Old code (still works)
sequenceState.selectBeat(1);
const selected = sequenceState.selectedBeatNumber;

// New code (added alongside)
selectionService.enterMultiSelectMode(1);
const selected = selectionService.getSelectedBeats();
```

### Gradual Rollout

1. **Phase 1:** Add multi-select state (no UI changes)
2. **Phase 2:** Enable for beta testers only (feature flag)
3. **Phase 3:** Soft launch with progressive disclosure
4. **Phase 4:** Full rollout with onboarding

### Feature Flag

```typescript
const ENABLE_MULTI_SELECT = false; // Feature flag

if (ENABLE_MULTI_SELECT) {
  // Show long-press hints
  // Enable multi-select toolbar
  // Show batch edit options
}
```

---

## Open Questions

1. **Grid Layout Awareness:**
   - How do we know which beats are in the same "row" or "column"?
   - Do we need to track beat positions explicitly?
   - Should row/column be based on visual grid or logical sequence structure?

2. **Start Position in Multi-Select:**
   - Can start position be included in multi-select?
   - Should it have special treatment?

3. **Cross-Sequence Selection:**
   - Should multi-select work across different sequences?
   - Or only within current sequence?

4. **Undo Granularity:**
   - Should batch edit be one undo action?
   - Or individual undo per beat?

---

## Next Steps

1. **Review this document** with team
2. **Answer open questions** about grid layout
3. **Create technical spike** for state extension
4. **Build prototype** of multi-select activation
5. **User testing** of prototype with 5-10 users
6. **Iterate** based on feedback
7. **Implement** in phases

---

## References

- Material Design 3: Selection Guidelines
- Apple HIG: Multi-Select Patterns
- Research Report: mobile-selection-editing-ux-research-2024-2025.md
- Research Report: (comprehensive multi-select research from Task agent)

---

**Document Version:** 1.0
**Last Updated:** January 2025
**Authors:** Claude (Architecture Design)
**Status:** Awaiting Review & Implementation
