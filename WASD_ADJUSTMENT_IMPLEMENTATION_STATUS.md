# WASD Arrow Adjustment System - Implementation Status

## ✅ COMPLETED (UI Layer - Session B)

### 1. Arrow Selection System
**Files Modified:**
- `src/lib/shared/pictograph/arrow/rendering/components/ArrowSvg.svelte`
  - Added `isClickable` prop support
  - Integrated `selectedArrowState` for selection tracking
  - Added visual selection feedback (glow animation + selection circle)
  - Click handler with haptic feedback

- `src/lib/shared/pictograph/shared/components/Pictograph.svelte`
  - Added `arrowsClickable` prop to enable/disable arrow interaction
  - Passes `isClickable` down to all ArrowSvg components
  - Passes `color` and `pictographData` for selection context

**Files Created:**
- `src/lib/modules/build/shared/state/selected-arrow-state.svelte.ts` (TEMPORARY STUB)
  - Reactive Svelte 5 rune-based state management
  - Methods: `selectArrow()`, `clearSelection()`, `isSelected()`
  - **NOTE:** This is a stub! Session A needs to replace this with real implementation that integrates with persistence

### 2. Pictograph Adjustment Editor Panel
**File Created:**
- `src/lib/modules/build/edit/components/PictographAdjustmentEditorPanel.svelte`
  - Full-screen modal for arrow adjustment
  - Clickable pictograph with arrows (using `arrowsClickable={true}`)
  - Real-time WASD keyboard event handling
  - Modifier key detection (Shift = 20px, Shift+Ctrl = 200px)
  - Visual feedback:
    - Selected arrow info display (color, type)
    - Current increment indicator (5px/20px/200px)
    - Last adjustment values display
    - Hotkey legend
  - **NOTE:** WASD movements are logged to console only - needs Session A's KeyboardArrowAdjustmentService for actual persistence

### 3. Edit Slide Panel Integration
**File Modified:**
- `src/lib/modules/build/edit/components/EditSlidePanel.svelte`
  - Added "Adjust Arrows" button (purple gradient, crosshairs icon)
  - Button appears when valid beat data exists (not blank)
  - Opens/closes PictographAdjustmentEditorPanel
  - Button positioned next to RemoveBeatButton in header

### 4. Bug Fixes
**File Fixed:**
- `src/lib/shared/navigation/state/profile-settings-state.svelte.ts`
  - Fixed Svelte 5 `$derived` export error
  - Changed `export const isCompactMode = $derived(...)` to `export function isCompactMode() { return ... }`
  - Updated all usages in PersonalTab, AccountTab, ProfilePhotoUpload

---

## ⏳ PENDING (Infrastructure Layer - Session A)

### 1. Firebase Firestore Setup
**File to Modify:**
- `src/lib/shared/auth/firebase.ts`

**Requirements:**
- Initialize Firestore (currently only Auth is set up)
- Create Firestore data structure:
  ```
  /arrow_adjustments
    /{gridMode}          // "diamond" or "box"
      /{oriKey}          // "from_layer1", "from_layer2", "from_layer3_blue1_red2", etc.
        /{letter}        // "A", "B", "C", etc.
          /{turnsTuple}  // "1.0-1.0-1.0", "2.0-1.5", etc.
            /{attrKey}   // "blue", "red", "pro", "dash_from_layer2", etc.
              - adjustment: {x: number, y: number}
              - userId: string
              - timestamp: Timestamp
              - approved: boolean
  ```

### 2. TurnsTupleKeyGenerator Complete Rewrite
**File to Modify:**
- `src/lib/shared/pictograph/arrow/positioning/key-generation/services/implementations/TurnsTupleKeyGenerator.ts`

**Current Problem:**
- Currently returns `[1.0, 1.0]` (number array)
- **NEEDS:** Return `"1.0-1.0-1.0"` (string) to match JSON keys

**Requirements:**
- Port complex logic from legacy: `archive/_LEGACY_APP/_DESKTOP/legacy/src/main_window/main_widget/turns_tuple_generator/turns_tuple_generator.py`
- Handle different letter types:
  - Type1Hybrid
  - Type2, Type3, Type4, Type5/6
  - Special letters: S, T, Λ, Λ-, Γ
- Generate proper string tuples that match special placement JSON keys exactly

**Reference Implementation:** See `TurnsTupleGenerator` class in legacy Python code

### 3. Selected Arrow State (Real Implementation)
**File to Replace:**
- `src/lib/modules/build/shared/state/selected-arrow-state.svelte.ts`

**Current:** Temporary stub that just logs to console
**Needs:** Real implementation that:
- Stores selected arrow globally
- Integrates with ArrowAdjustmentPersistenceService
- Triggers re-renders when adjustments are saved

### 4. Arrow Adjustment Persistence Service
**Files to Create:**
- `src/lib/shared/pictograph/arrow/positioning/services/implementations/ArrowAdjustmentPersistenceService.ts`
- `src/lib/shared/pictograph/arrow/positioning/services/contracts/IArrowAdjustmentPersistenceService.ts`

**Interface:**
```typescript
interface IArrowAdjustmentPersistenceService {
  saveAdjustment(
    pictographData: PictographData,
    motionData: MotionData,
    color: string,
    adjustment: {x: number, y: number}
  ): Promise<void>;

  loadAdjustments(pictographData: PictographData): Promise<Map<string, {x: number, y: number}>>;

  hasAdjustment(
    pictographData: PictographData,
    motionData: MotionData,
    color: string
  ): Promise<boolean>;

  removeAdjustment(
    pictographData: PictographData,
    motionData: MotionData,
    color: string
  ): Promise<void>;
}
```

**Responsibilities:**
- Write adjustments to Firestore
- Read adjustments from Firestore
- Merge with static JSON default placements
- Cache management
- Offline support (IndexedDB fallback)

### 5. SpecialPlacementService Write Capability
**File to Modify:**
- `src/lib/shared/pictograph/arrow/positioning/placement/services/implementations/SpecialPlacementService.ts`

**Add Method:**
```typescript
async setSpecialAdjustment(
  motionData: MotionData,
  pictographData: PictographData,
  color: string,
  attrKey: string,
  adjustment: Point
): Promise<void> {
  // Delegate to ArrowAdjustmentPersistenceService
  // Invalidate cache after write
}
```

### 6. Keyboard Arrow Adjustment Service
**Files to Create:**
- `src/lib/modules/build/edit/services/implementations/KeyboardArrowAdjustmentService.ts`
- `src/lib/modules/build/edit/services/contracts/IKeyboardArrowAdjustmentService.ts`

**Interface:**
```typescript
interface IKeyboardArrowAdjustmentService {
  handleWASDMovement(
    key: 'w' | 'a' | 's' | 'd',
    shiftHeld: boolean,
    ctrlHeld: boolean
  ): Promise<void>;
}
```

**Responsibilities:**
- Get selected arrow from selectedArrowState
- Calculate increment (5/20/200)
- Calculate adjustment vector
- Save to Firestore via ArrowAdjustmentPersistenceService
- Update mirrored entries via MirroredPlacementService
- Trigger pictograph re-render

**Integration Point:**
- `PictographAdjustmentEditorPanel.svelte` line 70-75: Replace stub with real service call

### 7. Mirrored Placement Service
**Files to Create:**
- `src/lib/shared/pictograph/arrow/positioning/services/implementations/MirroredPlacementService.ts`
- `src/lib/shared/pictograph/arrow/positioning/services/contracts/IMirroredPlacementService.ts`

**Interface:**
```typescript
interface IMirroredPlacementService {
  updateMirroredEntry(
    pictographData: PictographData,
    motionData: MotionData,
    color: string,
    adjustment: {x: number, y: number}
  ): Promise<void>;

  generateMirroredTurnsTuple(
    pictographData: PictographData,
    motionData: MotionData
  ): string;

  getOtherLayer3OriKey(oriKey: string): string;
}
```

**Reference:** `archive/_LEGACY_APP/_DESKTOP/legacy/src/main_window/main_widget/sequence_workbench/graph_editor/hotkey_graph_adjuster/data_updater/mirrored_entry_manager/`

**Responsibilities:**
- Detect when mirrored entry is needed
- Generate mirrored turns tuple
- Swap layer3 ori_keys: `"from_layer3_blue1_red2"` ↔ `"from_layer3_blue2_red1"`
- Handle rotation override mirroring for DASH/STATIC arrows

### 8. Dependency Injection Setup
**Files to Modify:**
- `src/lib/shared/inversify/types.ts`

**Add TYPES:**
```typescript
IArrowAdjustmentPersistenceService: Symbol.for('IArrowAdjustmentPersistenceService'),
IMirroredPlacementService: Symbol.for('IMirroredPlacementService'),
IKeyboardArrowAdjustmentService: Symbol.for('IKeyboardArrowAdjustmentService'),
```

**File to Modify/Create:**
- `src/lib/shared/inversify/modules/adjustment.module.ts` (new) OR
- `src/lib/shared/inversify/modules/pictograph.module.ts` (modify existing)

**Register all services as singletons**

---

## 🎯 Testing Checklist

### UI Layer (Already Working)
- [x] Arrows are clickable when `arrowsClickable={true}`
- [x] Selected arrow shows glow animation + selection circle
- [x] "Adjust Arrows" button appears in EditSlidePanel header
- [x] Clicking button opens PictographAdjustmentEditorPanel
- [x] Panel shows pictograph with clickable arrows
- [x] Clicking arrow selects it and shows info
- [x] WASD keys are detected and logged to console
- [x] Shift/Ctrl modifiers change increment display (5/20/200)
- [x] Esc key closes panel
- [x] Selection clears when panel closes

### Infrastructure Layer (Needs Session A)
- [ ] WASD movement actually saves to Firestore
- [ ] Adjustments persist across page reload
- [ ] Mirrored entries update automatically
- [ ] All matching pictographs in sequence update
- [ ] Offline mode works (IndexedDB fallback)
- [ ] TurnsTupleKeyGenerator generates correct string tuples
- [ ] Special placements load correctly with new adjustments

---

## 📋 How to Complete Implementation

### For Session A (Infrastructure Developer):

1. **Start with TurnsTupleKeyGenerator**
   - This is critical - everything depends on correct tuple generation
   - Test thoroughly against legacy data

2. **Set up Firebase Firestore**
   - Add Firestore initialization to `firebase.ts`
   - Create indexes for query performance

3. **Build ArrowAdjustmentPersistenceService**
   - Hybrid loading: static files + Firestore
   - Implement caching strategy

4. **Implement KeyboardArrowAdjustmentService**
   - This connects UI to persistence
   - Test with Session B's PictographAdjustmentEditorPanel

5. **Add MirroredPlacementService**
   - Port logic from legacy carefully
   - Test with layer3 pictographs

6. **Replace selectedArrowState stub**
   - Integrate with persistence service
   - Add reactive triggers for re-render

7. **Update SpecialPlacementService**
   - Add write capability
   - Invalidate cache on updates

8. **Register all services in DI container**

9. **Integration test:**
   ```
   - Open EditSlidePanel
   - Click "Adjust Arrows"
   - Click blue arrow
   - Press D (should move right 5px)
   - Check Firestore - adjustment saved
   - Reload page - adjustment persists
   - Check mirrored pictograph - also updated
   ```

---

## 🔗 Legacy Reference Files

**Must Read:**
- `archive/_LEGACY_APP/_DESKTOP/legacy/src/main_window/main_widget/turns_tuple_generator/turns_tuple_generator.py` - Turns tuple generation logic
- `archive/_LEGACY_APP/_DESKTOP/legacy/src/main_window/main_widget/sequence_workbench/graph_editor/hotkey_graph_adjuster/arrow_movement_manager.py` - WASD handling
- `archive/_LEGACY_APP/_DESKTOP/legacy/src/main_window/main_widget/sequence_workbench/graph_editor/hotkey_graph_adjuster/data_updater/special_placement_data_updater.py` - JSON persistence
- `archive/_LEGACY_APP/_DESKTOP/legacy/src/main_window/main_widget/sequence_workbench/graph_editor/hotkey_graph_adjuster/data_updater/mirrored_entry_manager/` - Mirrored entry logic

---

## ⚡ Quick Start for Testing UI

1. Open app in browser
2. Navigate to Build tab
3. Create or select a sequence beat
4. Click the beat to open EditSlidePanel
5. Click the purple "crosshairs" button (Adjust Arrows)
6. Click an arrow in the pictograph (should glow)
7. Press WASD keys (check console for logs)
8. Hold Shift and press D (increment should show 20px)
9. Hold Shift+Ctrl and press W (increment should show 200px)
10. Press Esc to close

**Expected:** Everything works except actual persistence (logs to console instead)

---

## 📝 Notes

- UI is 100% complete and ready for Session A infrastructure
- All visual feedback and keyboard handling is implemented
- TurnsTupleKeyGenerator is the critical blocker - fix this first!
- Firebase Firestore needs to be added (only Auth exists currently)
- The stub `selected-arrow-state.svelte.ts` should be replaced, not modified
- PictographAdjustmentEditorPanel has a TODO comment (line 70-75) marking where to inject KeyboardArrowAdjustmentService

---

**Status:** UI Layer Complete ✅ | Infrastructure Layer Pending ⏳
**Next:** Session A implements persistence, Firestore, services, DI
