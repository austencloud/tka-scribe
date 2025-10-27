# Mobile UX/UI Design Patterns Research: Selection & Editing Workflows (2024-2025)

**Research Date:** October 26, 2025
**Focus:** Modern mobile-first selection and editing patterns for beat/card/grid interfaces

---

## Executive Summary

Modern mobile applications (2024-2025) have converged on several key patterns for selection and editing workflows:

1. **Bottom sheets** have become the dominant pattern for mobile editing interfaces
2. **Long-press** remains the standard for entering selection mode, with **single tap** for primary actions
3. **Immediate feedback** with contextual editing is preferred over deferred/modal approaches
4. Platform guidelines (iOS HIG, Material Design 3) emphasize accessibility, touch targets (44-48px), and progressive disclosure

**Recommended Pattern for Mobile-First Beat Editor:**
- Single tap on beat → Open bottom sheet editor (immediate edit mode)
- Long-press on beat → Enter multi-selection mode with batch actions
- Bottom sheet with medium detent (~50% screen height) for quick edits
- Swipe down + explicit close button for dismissal
- Maintain beat grid context visibility while editing

---

## 1. Selection Patterns: Current Best Practices

### 1.1 Immediate Edit Panel vs Separate Selection State

#### **Immediate Edit Pattern** (Recommended for Single Items)
**When to Use:**
- Single-item editing workflows
- Quick property adjustments
- Users want to see changes in real-time
- Creative/experimental tools (music, photo, design)

**Characteristics:**
- Tap item → Editor opens immediately
- Live preview of changes
- Minimal friction, faster workflow
- Better for "tweak and iterate" use cases

**Examples:**
- **Instagram Edits:** Tap photo → Editing tools appear in bottom sheet
- **iOS Photos:** Tap Edit → Immediate access to adjustment controls
- **CapCut:** Tap clip → Timeline + editing controls appear instantly

**Pros:**
- Fast, direct manipulation
- Encourages experimentation
- Reduces cognitive load (no mode switching)
- Aligns with "select to edit" mental model

**Cons:**
- Can't perform batch operations easily
- May overwhelm with too many options at once
- Accidental taps open editor unnecessarily

---

#### **Deferred Selection Pattern** (Better for Batch Operations)
**When to Use:**
- Multi-select/batch editing needed
- Operations on multiple items simultaneously
- Destructive actions (delete, move, share)
- Complex selection criteria

**Characteristics:**
- Long-press → Enter selection mode
- Visual indicators (checkboxes appear)
- Action bar/toolbar shows available batch actions
- Explicit "Done" or "Cancel" to exit mode

**Examples:**
- **Google Photos:** Long-press photo → Selection mode → Checkboxes appear → Share/Delete/Album actions
- **iOS Photos:** Long-press → Select Photos → Batch actions toolbar
- **Notion Mobile:** Tap-and-hold block → Selection menu appears

**Pros:**
- Clear visual state (selection mode vs normal mode)
- Enables batch operations
- Prevents accidental actions
- Better for destructive operations

**Cons:**
- Extra step to enter mode
- Discoverability issues (users may not know about long-press)
- Longer workflow for single-item edits

---

### 1.2 Mobile-Specific Patterns

#### **iOS (Apple Human Interface Guidelines)**

**Touch Targets:**
- Minimum: **44pt × 44pt** for all tappable elements
- Recommended spacing: 8-16pt between targets

**Selection Patterns:**
- **Single tap:** Primary action (select/activate)
- **Long-press:** Secondary actions, context menus
- **Double-tap:** Avoided in favor of single gestures (accessibility)

**Sheets (iOS 15+ Bottom Sheet Pattern):**
- **Medium detent:** ~50% screen height (progressive disclosure)
- **Large detent:** Full-height expansion
- Swipe gesture on handle to resize
- Optional dimming view (can be removed for non-modal interaction)
- **Not called "bottom sheet"** in Apple docs—referred to as "resizable sheets" or "detents"

**Apple's Recommendation:**
> "A sheet helps people perform a scoped task that's closely related to their current context."

---

#### **Android (Material Design 3)**

**Touch Targets:**
- Minimum: **48dp × 48dp** for all touch elements
- Enforced by accessibility guidelines

**Selection Patterns:**
- **Long-press:** Standard for entering selection mode
- **Single tap:** Select/deselect while in selection mode
- Visual feedback: Ripple effect + selection overlay

**Bottom Sheets:**
Two primary types:
1. **Standard (Non-Modal):**
   - User can interact with rest of screen
   - Persistent, can be collapsed/expanded
   - Good for supplementary content (e.g., Google Maps location details)

2. **Modal:**
   - Blocks interaction with background
   - Requires action or dismissal
   - Used for focused tasks, forms, options

**Material Design 3 Guidance:**
> "Modal bottom sheets are primarily a mobile component, where they span full screen width in both portrait and landscape views."

**Best Use Cases:**
- Long lists of actions
- Items requiring descriptions + icons
- Alternative to inline menus on mobile
- Contextual options related to main content

---

### 1.3 Tap vs Long-Press vs Double-Tap

| Gesture | Primary Use | Discoverability | Accessibility | Platform Preference |
|---------|-------------|-----------------|---------------|---------------------|
| **Single Tap** | Primary action, selection, activation | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐⭐ Excellent | Universal |
| **Long-Press** | Secondary actions, enter selection mode, context menus | ⭐⭐⭐ Fair (requires discovery) | ⭐⭐ Poor (motor skill intensive) | More common on Android |
| **Double-Tap** | Zoom, like/favorite | ⭐⭐ Poor (often accidental) | ⭐ Very Poor | Avoid for critical actions |

**2024-2025 Best Practices:**
- **Use tap for primary, frequently-used actions**
- **Reserve long-press for secondary, less common functions**
- Provide visual affordances (e.g., "Tap to edit" hints)
- Always offer alternative to long-press for accessibility
- Consider tap-and-hold duration (iOS: ~0.5s, Android: ~0.5-1s)

**From UX Research:**
> "Long press is not very intuitive and needs a bit of discovery. In general, tap+hold and swipe are less intuitive to device newbies."

> "For accessibility, gestures that require several fingers at once, or tracing a path on the screen need to have an alternative, simple click/tap interaction."

---

## 2. Bottom Sheets vs Side Panels vs Modal Overlays

### 2.1 Bottom Sheets (Recommended for Mobile)

**Definition:**
UI component that slides up from bottom of screen, displaying contextual content while maintaining visibility of underlying information.

**When to Use:**
- ✅ Single-item editing interfaces
- ✅ Contextual actions related to selected item
- ✅ User needs to reference main content while editing
- ✅ Quick forms or settings adjustments
- ✅ Sharing options, filters, sorting
- ✅ Progressive disclosure (start small, expand if needed)

**Advantages:**
- **Thumb-friendly:** Easy to reach on large phones (one-handed use)
- **Context preservation:** Background content remains visible
- **Less intrusive:** Gentler than full-screen modals
- **Natural gesture:** Swipe down to dismiss feels intuitive
- **Space efficient:** Utilizes bottom of screen (near keyboard)

**Disadvantages:**
- Limited vertical space (especially on small phones)
- Can cover important content at bottom
- Swipe-down conflicts with scrolling inside sheet
- Discoverability of drag handle

**Design Recommendations:**
1. Provide **explicit close button** (don't rely only on swipe)
2. Use **drag handle** (horizontal pill/bar at top)
3. Support **detents** (medium ~50%, large ~90%)
4. Add **scrim/dimming** for modal sheets (75% opacity)
5. Avoid **tap-outside-to-dismiss** for complex/scrollable sheets (prevents accidental data loss)
6. Support **Back button** on Android
7. Make **scrollable** when content exceeds height

**Nielsen Norman Group Guidance:**
> "Bottom sheets preserve substantial visibility of the underlying information compared to other overlays. They are especially useful when users are likely to need to refer to the main, background information while interacting with the information or options presented in the sheet."

---

### 2.2 Side Panels / Navigation Drawers

**When to Use:**
- ✅ Primary navigation between app sections
- ✅ 5+ top-level destinations
- ✅ Secondary utility features (filters, settings)
- ✅ Larger screens (tablets, desktop)

**NOT Recommended for:**
- ❌ Mobile-first editing workflows
- ❌ Contextual item editing
- ❌ Single-item properties

**Key Difference:**
- **Side panels** = Navigation between sections
- **Bottom sheets** = Contextual actions/editing within current view

---

### 2.3 Modal Overlays (Full-Screen)

**When to Use:**
- ✅ Critical confirmations (delete, irreversible actions)
- ✅ Complex multi-step workflows
- ✅ Login/authentication
- ✅ Full-screen forms with many fields
- ✅ Content that demands undivided attention

**When to AVOID:**
- ❌ Quick edits/adjustments
- ❌ User needs to see context
- ❌ Frequently repeated actions

**Characteristics:**
- Blocks entire screen
- Requires explicit dismissal (button click)
- Most disruptive to workflow
- Should be used sparingly

---

### 2.4 Decision Matrix: Which Pattern to Use?

| Context | Recommended Pattern | Reasoning |
|---------|-------------------|-----------|
| Edit single beat properties | **Bottom Sheet (Medium)** | Quick access, see beat in context, thumb-friendly |
| Edit multiple beats | **Bottom Sheet (Large) or Modal** | Batch editing UI needs more space |
| Delete confirmation | **Dialog/Alert** | Critical, destructive action |
| Navigate to settings | **Navigation Drawer** | Top-level navigation |
| Quick filters/sort | **Bottom Sheet (Standard, Non-Modal)** | Can see results update in background |
| Complex sequence builder | **Full-Screen Modal/New Screen** | Needs full attention, many controls |

---

## 3. Real-World Examples Analysis

### 3.1 Google Photos

**Selection Pattern:**
- **Primary:** Single tap on photo → Opens full-screen view (not editing)
- **Edit:** Tap Edit button → Bottom sheet with tools
- **Multi-select:** Long-press photo → Selection mode with checkboxes

**Editing Interface:**
- Bottom-anchored toolbar (above keyboard area)
- Horizontal scrolling categories (Actions, Markup, Filters, Adjust)
- Real-time preview on main canvas
- Explicit "Save" button to commit changes

**Key UX Decisions:**
- Edit tools at bottom for thumb reach
- Categories above tools for organization
- Main image stays in view while editing
- Clear save/cancel actions

**2024 Update:**
> "Google Photos features a bottom sheet interface where users can access frequently-contacted people for sharing and recently edited albums to add selections to with a single tap."

---

### 3.2 Instagram (2024-2025)

**Instagram Edits App (New Video Editor):**
- **Direct integration:** Edit within Instagram ecosystem
- **Vertical-first:** All editing optimized for mobile portrait
- **Immediate feedback:** Real-time preview as you adjust
- **AI tools:** One-tap enhancements (cutout AI, green screen)

**Workflow:**
1. Record/upload clip
2. Timeline editing with bottom controls
3. Effects/filters in sliding panels
4. Direct post to Instagram

**Pattern Used:**
- Bottom-anchored editing controls
- Horizontal scrolling tool categories
- Tap tool → Expand options
- Modal overlays for complex effects

**Mobile Editing Philosophy:**
> "The goal behind Edits is to give creators an all-in-one editing platform they can use directly on their smartphones."

---

### 3.3 Figma Mobile

**Note:** Search results focused on design resources rather than app UX patterns.

**Inferred Pattern (Industry Standard):**
- Tap object → Properties panel appears
- Long-press → Context menu
- Multi-select via selection tool
- Bottom sheet for properties on mobile

---

### 3.4 Notion Mobile

**Block Selection:**
- **Single tap:** Places cursor in block
- **Tap block handle (⋮⋮):** Shows block menu
- **Long-press block:** Opens action menu
- **Double-tap text:** Text selection mode (extends across blocks)

**Editing Interface:**
- Toolbar above keyboard with block type options
- "+" button to add new blocks
- "More" button for advanced options
- Turn into → Convert block type

**Mobile-Specific Feature:**
- Page Lock mode removes block boundaries for easier text selection
- Scrollable toolbar to access all options

**Pattern:**
- Context menus for block actions
- Bottom toolbar for creation/formatting
- Long-press for contextual actions

---

### 3.5 CapCut & InShot (Mobile Video Editors)

#### **CapCut**
**Workflow:**
- Tap clip on timeline → Editing controls appear at bottom
- Horizontal scrolling categories (Edit, Audio, Text, Effects)
- Modal overlays for complex features
- Template-based approach (pre-built starting points)

**Learning Curve:** 15-30 minutes for polished results
**Philosophy:** Feature-rich, template-driven

**Interface:**
> "CapCut has a clean and well-organized interface that allows for easy navigation and quick searches for different elements, with its video timeline being visually appealing and color-coded for simplicity."

#### **InShot**
**Workflow:**
- Minimalistic layout, instant usability
- Tap-and-see editing (no tutorials needed)
- Bottom-anchored controls
- Mix-and-match filters/stickers (build your own style)

**Learning Curve:** 5-10 minutes for finished videos
**Philosophy:** Simple, fast, intuitive

**Key Difference:**
> "CapCut offers more features across your workflow, while InShot keeps it focused and simple."

**Takeaway for Beat Editor:**
- Start simple like InShot (fast results, low friction)
- Provide progressive disclosure like CapCut (advanced features when needed)
- Bottom controls are universal standard

---

### 3.6 iOS/Android Native Photo Editors

**Common Patterns:**
- Single tap photo → Full-screen view
- Tap "Edit" button → Bottom sheet with tools
- Horizontal scrolling tool categories
- Sliders for adjustments (brightness, contrast, etc.)
- Live preview while adjusting
- Explicit Save/Done button

**iOS Photos:**
- Clean, minimal interface
- Bottom toolbar with icons
- Tap icon → Expand tool options
- Sliders appear above toolbar
- Auto-enhance one-tap option

**Android (Google Photos):**
- Similar bottom toolbar approach
- Material Design ripple effects
- Floating action button patterns
- Collapsible tool sections

**Shared Design Principles:**
1. Bottom-anchored controls (thumb reach)
2. Horizontal tool selection (easy swipe)
3. Vertical sliders for adjustments (natural gesture)
4. Real-time preview (immediate feedback)
5. Non-destructive editing (can revert)
6. Clear save action (explicit commit)

---

## 4. Apple HIG & Material Design 3 Guidelines

### 4.1 Selection States on Mobile

#### **Material Design 3**
**Visual Indicators:**
- Checkboxes appear on selected items
- Color overlay (typically primary color at 12-16% opacity)
- Elevation change (optional)
- Ripple effect on tap

**Entering Selection Mode:**
- Long-press item
- Visual transition: checkbox fades in
- Action bar appears (typically at top with count)

**Exiting Selection Mode:**
- Deselect all items
- Tap back/close button
- Perform batch action (e.g., delete, share)

**Selection Controls:**
> "Selection components let people specify choices, including forms with checkboxes and radio buttons, filtering using chips, or toggling settings with switches and sliders."

---

#### **Apple iOS HIG**
**Selection on iOS:**
- Press and hold to enter selection mode
- Tap to toggle selection while in mode
- Selection state typically shown with checkmark overlay

**Sheets Pattern:**
> "A sheet helps people perform a scoped task that's closely related to their current context."

**Sheet Detents (iOS 15+):**
- **Medium detent:** ~50% screen height
- **Large detent:** ~90% screen height (near full screen)
- User can drag to resize
- Auto-snaps to detent points

**Best Practice:**
> "Use the medium height detents in an iPhone app to allow progressive disclosure of the sheet's content."

---

### 4.2 Editing Interfaces (Slide In/Out)

#### **Bottom Sheet Animation**
**Material Design:**
- Slide up from bottom (300-400ms duration)
- Easing curve: deceleration (starts fast, slows at end)
- Optional backdrop fade-in
- Drag handle for manual control

**iOS Sheets:**
- Spring animation (natural, bouncy feel)
- Drag gesture supported by default
- Rubber-banding at edges
- Velocity-aware snapping (fast swipe = dismiss)

---

### 4.3 Bottom Sheet Best Practices

**Material Design 3:**
1. **Modal vs Non-Modal:**
   - Modal: Use when action must be completed or cancelled
   - Non-Modal: Use when user can interact with background

2. **Dismiss Methods:**
   - Swipe down on handle
   - Tap scrim (backdrop) - only if non-destructive
   - Explicit close button (recommended)
   - Back button (Android)

3. **Content Guidelines:**
   - Keep content focused and task-oriented
   - Use clear headings
   - Don't nest modals
   - Avoid excessive scrolling (use detents instead)

4. **Accessibility:**
   - Announce when sheet opens (screen readers)
   - Trap focus within modal sheets
   - Provide keyboard navigation
   - Visible focus indicators

**Nielsen Norman Group:**
> "Provide a clear Close button (usually styled as an X or the word Close) at the top of bottom sheets rather than relying exclusively on the grab handle."

**Reasoning:**
> "An additional advantage of this button is that it facilitates screen-reader and keyboard access for users that cannot see or swipe on the screen."

---

### 4.4 Touch Target Considerations

**Minimum Sizes:**
- **iOS:** 44pt × 44pt
- **Android/Material Design:** 48dp × 48dp
- **Web (WCAG 2.1 AAA):** 44px × 44px

**Spacing:**
- Minimum 8px between adjacent targets
- Recommended 16px for comfortable tapping
- More spacing for frequently-used controls

**Accessibility Concerns:**
> "The dexterity challenge makes [small touch targets] inaccessible for users that cannot swipe with precision and error prone for users that don't have physical disabilities."

**Visual vs Interactive Area:**
- Visual button can be smaller
- Interactive area (padding) should meet minimum
- Example: 24px icon with 48px tap target

---

## 5. Specific Patterns for Beat Editor

### 5.1 "Select to Edit" Workflows

#### **Pattern A: Immediate Edit (Recommended)**
**Flow:**
1. User taps beat card/thumbnail
2. Bottom sheet slides up (medium detent, ~50% height)
3. Beat properties displayed (duration, sound, effects)
4. Real-time preview as user adjusts
5. Swipe down or tap close to commit and dismiss

**Advantages:**
- Fastest workflow for single-beat editing
- Encourages experimentation (low friction)
- Maintains context (can see beat in sequence)
- Familiar pattern (matches photo editors)

**Implementation:**
```
Tap Beat →
  BottomSheet.show({
    detent: 'medium',
    content: BeatEditor,
    beatId: selected.id,
    onDismiss: saveChanges
  })
```

**Visual Feedback:**
- Beat card highlights (primary color border)
- Bottom sheet slides up with spring animation
- Beat plays preview sound on tap
- Sliders/controls show current values

---

#### **Pattern B: Deferred Selection (Multi-Select)**
**Flow:**
1. User long-presses beat card
2. Selection mode activates (checkboxes appear)
3. User taps additional beats to select
4. Action bar shows batch options (Delete, Duplicate, Move)
5. Tap action → Confirm dialog → Execute
6. Exit selection mode automatically

**When to Use:**
- User explicitly wants to select multiple beats
- Batch operations needed (delete, copy, rearrange)
- Secondary workflow (not primary use case)

**Implementation:**
```
LongPress Beat →
  EnterSelectionMode()
  ShowCheckboxes()
  ShowActionBar()

Tap Additional Beats →
  ToggleSelection()
  UpdateActionBar()

Tap Action →
  ShowConfirmDialog()
  ExecuteBatchAction()
  ExitSelectionMode()
```

---

### 5.2 Batch Selection vs Single-Item Editing

**Recommendation: Optimize for single-item editing, support batch as secondary**

**Why:**
- Music creation is iterative (edit beat, listen, adjust, repeat)
- Batch operations less frequent (reorganizing, cleanup)
- Single-item flow should be fastest (one tap)

**Pattern Combination:**
- **Default (single tap):** Opens editor immediately
- **Alternate (long-press):** Enters multi-select mode
- **Mode indicator:** Visual cue showing current mode
- **Easy exit:** Clear way to leave selection mode

**From UX Research:**
> "Multi-select controls are one of the hardest to nail down on mobile due to screen size constraints."

**Solution:**
- Don't force mode switching for every action
- Make single-item editing the "happy path"
- Progressive disclosure: simple → advanced

---

### 5.3 Panel Dismissal Patterns

#### **Recommended: Multiple Dismissal Methods**

1. **Swipe Down Gesture:**
   - Drag handle at top of sheet
   - Velocity-aware (fast swipe = dismiss)
   - Visual feedback (sheet follows finger)

2. **Explicit Close Button:**
   - "X" or "Done" button in top-right
   - Always visible
   - Clear visual affordance

3. **Save/Apply Button:**
   - Explicit commit action
   - Useful for non-live preview scenarios
   - Provides safety net (can cancel)

4. **Back Button (Android):**
   - Hardware/gesture back
   - Standard Android behavior
   - Should dismiss sheet

**DO NOT:**
- ❌ Rely only on drag handle (discoverability issues)
- ❌ Use tap-outside-to-dismiss for complex editors (accidental data loss)
- ❌ Auto-dismiss without saving (frustrating for users)

**Best Practice:**
```
Bottom Sheet Dismissal Options:
1. Swipe down on handle → Save changes + dismiss
2. Tap "Done" button → Save changes + dismiss
3. Tap "Cancel" button → Discard changes + dismiss
4. Tap scrim (optional) → Confirm before dismiss if changes made
5. Back button → Save changes + dismiss
```

**Confirmation for Unsaved Changes:**
```
If (userMadeChanges && !saved) {
  ShowDialog({
    title: "Save changes?",
    options: ["Save", "Discard", "Cancel"]
  })
}
```

---

### 5.4 Maintaining Context While Editing

**Challenge:**
Users need to see the beat in context of the sequence while editing properties.

#### **Solution 1: Partial Overlay (Recommended)**
- Bottom sheet covers 40-60% of screen
- Beat sequence remains visible at top
- Currently editing beat highlighted in sequence
- Preview plays while adjusting (audio + visual)

**Implementation:**
```
┌─────────────────────────┐
│   Beat Sequence Grid    │ ← Still visible
│   [1][2][*3*][4][5]    │ ← Beat 3 highlighted
├─────────────────────────┤
│ ═══════════════════════ │ ← Drag handle
│                         │
│   Beat 3 Properties     │
│   Duration: [slider]    │
│   Sound: [dropdown]     │
│   Effect: [toggle]      │
│                         │
│        [Done]           │
└─────────────────────────┘
```

---

#### **Solution 2: Side-by-Side (Tablet/Landscape)**
- Beat editor in side panel (30-40% width)
- Sequence view in main panel (60-70% width)
- Both update in real-time
- More space for controls

**Implementation:**
```
Landscape / Tablet:
┌──────────────────┬──────────────┐
│                  │              │
│  Beat Sequence   │ Beat Editor  │
│                  │              │
│  [1] [2] [3]     │ Duration: □  │
│  [4] [5] [6]     │ Sound: ▼     │
│                  │ Effect: ◯    │
│                  │              │
│                  │   [Done]     │
└──────────────────┴──────────────┘
```

---

#### **Solution 3: Contextual Preview**
- Full-screen editor with preview window
- Mini-sequence view embedded in editor
- Tap preview to play in context
- "See in sequence" button to temporarily hide editor

**From UX Research:**
> "In-context editors allow users to edit content in the same page or space that they view it, rather than using a separate form or administration area. They establish a strong relationship between content and the tools used to manage it."

---

## 6. Industry Standards Summary (2024-2025)

### 6.1 Mobile-First Selection/Editing Standards

**Interaction Patterns:**
- ✅ **Single tap** for primary action (select/edit)
- ✅ **Long-press** for secondary actions (multi-select, context menu)
- ✅ **Bottom sheets** for editing interfaces (not full modals)
- ✅ **Immediate feedback** (live preview preferred)
- ✅ **Medium detent** sheets (~50% height) for quick edits
- ✅ **Explicit dismiss** buttons + swipe gestures
- ✅ **Touch targets** 44-48px minimum
- ✅ **Bottom-anchored** controls (thumb-friendly)

**Avoided Patterns:**
- ❌ Double-tap for critical actions (accessibility issues)
- ❌ Tap-outside-to-dismiss for complex forms
- ❌ Full-screen modals for quick edits
- ❌ Side panels on mobile (use for navigation only)
- ❌ Drag handles without explicit close buttons
- ❌ Small touch targets (<44px)

---

### 6.2 Pattern Names & Definitions

| Pattern Name | Definition | Example |
|--------------|------------|---------|
| **Bottom Sheet** | Sliding panel from bottom, partial screen coverage | Google Maps location details |
| **Modal Bottom Sheet** | Bottom sheet that blocks background interaction | Share options, filters |
| **Sheet Detent** | Predefined height where sheet rests (small/medium/large) | iOS Photos editor |
| **Selection Mode** | Temporary state for multi-select operations | Google Photos multi-select |
| **Immediate Edit** | Tap item → Editor opens instantly | Instagram Edits |
| **Deferred Edit** | Select first → Then choose action | Email multi-select |
| **Context Menu** | Popup menu from long-press | iOS text selection |
| **Action Bar** | Toolbar appearing during selection mode | Gmail selection actions |
| **Progressive Disclosure** | Start simple, reveal complexity on demand | CapCut tool categories |
| **In-Context Editing** | Edit while viewing in original location | Notion inline editing |

---

### 6.3 Pros/Cons Matrix

#### **Bottom Sheet (Medium Detent) - RECOMMENDED**
**Pros:**
- ✅ Maintains context (can see grid behind)
- ✅ Thumb-friendly (controls at bottom)
- ✅ Familiar pattern (widely used)
- ✅ Easy to dismiss (swipe down)
- ✅ Works one-handed
- ✅ Feels lightweight, fast

**Cons:**
- ❌ Limited vertical space
- ❌ Can cover bottom of grid
- ❌ Swipe conflicts with internal scrolling
- ❌ Complex UIs may need full screen

**Best For:** Single-beat editing with 5-10 properties

---

#### **Full-Screen Modal**
**Pros:**
- ✅ Maximum space for controls
- ✅ Focused attention (no distractions)
- ✅ Can fit complex UIs
- ✅ Clear entry/exit

**Cons:**
- ❌ Loses context (can't see grid)
- ❌ Feels heavy, slower
- ❌ More navigation (back to grid)
- ❌ Interrupts flow

**Best For:** Complex multi-beat sequencer, advanced settings

---

#### **Side Panel (Desktop/Tablet)**
**Pros:**
- ✅ Side-by-side view (best context)
- ✅ Efficient use of wide screens
- ✅ Can resize dynamically
- ✅ Persistent (doesn't hide grid)

**Cons:**
- ❌ Not mobile-friendly (too narrow)
- ❌ Awkward on portrait phones
- ❌ Conflicts with navigation drawers
- ❌ Thumb reach issues

**Best For:** Tablet/desktop versions, not mobile-first

---

#### **Inline Editing (Expand Card)**
**Pros:**
- ✅ Minimal mode switching
- ✅ Ultra-fast for simple edits
- ✅ Clear what you're editing
- ✅ No overlay needed

**Cons:**
- ❌ Disrupts grid layout
- ❌ Limited space for controls
- ❌ Hard to scroll to editing area
- ❌ Awkward for many properties

**Best For:** Very simple edits (rename, toggle), not recommended for beat editor

---

## 7. Clear Recommendation for Mobile-First Beat Editor App

### 7.1 Primary Pattern: Tap-to-Edit with Bottom Sheet

**User Flow:**
```
1. User browsing beat grid
   ↓
2. User taps beat card
   ↓
3. Bottom sheet slides up (medium detent, ~50% screen)
   ↓
4. Beat editor displays with properties
   - Duration slider
   - Sound selection
   - Effect toggles
   - Volume control
   ↓
5. User adjusts properties
   - Real-time preview (audio plays)
   - Visual feedback on grid (beat highlights)
   - Changes apply immediately (no "save" needed)
   ↓
6. User dismisses sheet
   - Swipe down handle
   - Tap "Done" button
   - Tap back button (Android)
   ↓
7. Return to grid with changes applied
```

---

### 7.2 Technical Specifications

**Bottom Sheet Design:**
- **Initial height:** 50% screen (medium detent)
- **Expandable:** Swipe up to 90% (large detent) for advanced controls
- **Collapsible:** Swipe down to dismiss
- **Backdrop:** 50% opacity black scrim
- **Handle:** 32px wide × 4px tall, centered, 12px from top
- **Close button:** "X" icon, 44px touch target, top-right corner
- **Radius:** 16px top corners

**Touch Targets:**
- All buttons: **48dp × 48dp minimum**
- Sliders: **44dp height**, full-width thumb
- Spacing: **16dp between controls**

**Animation:**
- Slide-up: 300ms, deceleration easing
- Dismiss: 250ms, acceleration easing
- Spring bounce on expand/snap

**Gestures:**
- Single tap beat → Open editor
- Long-press beat → Enter multi-select mode
- Swipe down sheet → Dismiss
- Tap backdrop → Dismiss (with confirmation if changes)
- Drag handle → Resize sheet

---

### 7.3 Visual Design

**Beat Card States:**
```css
/* Normal */
.beat-card {
  border: 2px solid transparent;
  background: #f5f5f5;
}

/* Hover/Press */
.beat-card:active {
  background: #e0e0e0;
  transform: scale(0.98);
}

/* Selected/Editing */
.beat-card.editing {
  border: 2px solid #007AFF; /* Primary color */
  background: #E3F2FD; /* Light primary */
  box-shadow: 0 4px 12px rgba(0,122,255,0.3);
}

/* Multi-Select Mode */
.beat-card.selectable {
  position: relative;
}
.beat-card.selectable::after {
  content: '';
  /* Checkbox overlay */
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border: 2px solid #666;
  border-radius: 4px;
  background: white;
}
.beat-card.selected::after {
  background: #007AFF;
  border-color: #007AFF;
  /* Checkmark icon */
}
```

---

### 7.4 Accessibility

**Screen Reader Support:**
- Announce when sheet opens: "Editing Beat 3"
- Announce changes: "Duration set to 2 seconds"
- Label all controls: "Beat duration slider"
- Provide hints: "Swipe down to close editor"

**Keyboard Navigation:**
- Tab through controls
- Enter to activate buttons
- Arrow keys for sliders
- Escape to dismiss sheet

**Focus Management:**
- Trap focus within modal sheet
- Return focus to beat card on dismiss
- Visible focus indicators (2px outline)

**Motor Accessibility:**
- Large touch targets (48dp)
- Alternative to long-press (edit button in card)
- Reduced motion option (disable animations)

---

### 7.5 Alternative Workflow (Multi-Select)

**User Flow:**
```
1. User long-presses beat card
   ↓
2. Selection mode activates
   - Checkboxes appear on all cards
   - Action bar appears at top
   - Selected count shown
   ↓
3. User taps additional beats to select
   - Visual feedback (checkmark, highlight)
   - Count updates
   ↓
4. User chooses batch action
   - Delete (trash icon)
   - Duplicate (copy icon)
   - Move (arrows icon)
   - Share (share icon)
   ↓
5. Confirmation dialog (for destructive actions)
   "Delete 3 beats?"
   [Cancel] [Delete]
   ↓
6. Action executes
   ↓
7. Selection mode exits automatically
```

**Action Bar:**
```
┌─────────────────────────────┐
│ ← [3 selected]    [Delete]  │
│                   [Copy]     │
│                   [Move]     │
└─────────────────────────────┘
```

---

### 7.6 Implementation Priority

**Phase 1: MVP (Core Pattern)**
- ✅ Single tap → Bottom sheet editor
- ✅ Medium detent (50% height)
- ✅ Swipe down to dismiss
- ✅ Close button
- ✅ Basic properties (duration, sound)
- ✅ Real-time preview

**Phase 2: Enhanced**
- ✅ Long-press → Multi-select mode
- ✅ Batch actions (delete, copy)
- ✅ Large detent (expandable)
- ✅ Advanced properties
- ✅ Undo/redo support

**Phase 3: Polish**
- ✅ Drag handle fine-tuning
- ✅ Spring animations
- ✅ Haptic feedback
- ✅ Accessibility audit
- ✅ Keyboard shortcuts (tablet)
- ✅ Landscape layout

---

### 7.7 Code Example (React Native)

```jsx
import { BottomSheet } from '@gorhom/bottom-sheet';

function BeatGrid() {
  const [selectedBeat, setSelectedBeat] = useState(null);
  const bottomSheetRef = useRef(null);

  const handleBeatTap = (beat) => {
    setSelectedBeat(beat);
    bottomSheetRef.current?.snapToIndex(0); // Medium detent
  };

  const handleDismiss = () => {
    setSelectedBeat(null);
    // Auto-save changes
  };

  return (
    <>
      <ScrollView>
        <Grid>
          {beats.map(beat => (
            <BeatCard
              key={beat.id}
              beat={beat}
              onPress={() => handleBeatTap(beat)}
              isEditing={selectedBeat?.id === beat.id}
            />
          ))}
        </Grid>
      </ScrollView>

      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={['50%', '90%']} // Medium, Large
        index={-1} // Start hidden
        onClose={handleDismiss}
        enablePanDownToClose
        backdropComponent={BottomSheetBackdrop}
      >
        <BeatEditor beat={selectedBeat} />
      </BottomSheet>
    </>
  );
}

function BeatEditor({ beat }) {
  const [duration, setDuration] = useState(beat.duration);

  // Real-time preview
  useEffect(() => {
    playBeatPreview(beat.id, duration);
  }, [duration]);

  return (
    <View style={styles.editor}>
      <View style={styles.handle} />
      <TouchableOpacity style={styles.closeButton}>
        <Icon name="close" size={24} />
      </TouchableOpacity>

      <Text style={styles.title}>Edit Beat {beat.number}</Text>

      <Slider
        label="Duration"
        value={duration}
        onValueChange={setDuration}
        minimumValue={0.5}
        maximumValue={4}
        step={0.1}
        accessibilityLabel="Beat duration"
      />

      <Picker
        label="Sound"
        items={soundOptions}
        selectedValue={beat.sound}
        onValueChange={updateSound}
      />

      <Button
        title="Done"
        onPress={() => bottomSheetRef.current?.close()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  editor: {
    padding: 24,
    paddingTop: 16,
  },
  handle: {
    width: 32,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
  },
});
```

---

## 8. Key Takeaways

### DO:
✅ Use bottom sheets for mobile editing (not full modals)
✅ Provide multiple dismissal methods (swipe + button)
✅ Maintain 44-48px touch targets
✅ Show immediate feedback (live preview)
✅ Keep context visible (partial overlay)
✅ Optimize for single-tap primary actions
✅ Support long-press for multi-select (secondary)
✅ Use medium detent (~50%) for quick edits
✅ Add explicit close buttons (don't rely on gestures)
✅ Provide real-time preview while editing

### DON'T:
❌ Use full-screen modals for simple edits
❌ Rely only on drag handles for dismissal
❌ Use tap-outside-to-dismiss for complex editors
❌ Make long-press the only way to edit
❌ Hide the context (beat grid) while editing
❌ Use double-tap for critical actions
❌ Force mode switching for every operation
❌ Use side panels on mobile (reserve for desktop)
❌ Auto-dismiss without confirmation if changes made
❌ Create touch targets smaller than 44px

---

## 9. Additional Resources

**Official Guidelines:**
- Material Design 3 Bottom Sheets: https://m3.material.io/components/bottom-sheets/overview
- Apple HIG Sheets: https://developer.apple.com/design/human-interface-guidelines/sheets
- Material Design Selection: https://m1.material.io/patterns/selection.html
- iOS Accessibility: https://developer.apple.com/accessibility/

**UX Research:**
- Nielsen Norman Group - Bottom Sheets: https://www.nngroup.com/articles/bottom-sheet/
- LogRocket - Bottom Sheet UX: https://blog.logrocket.com/ux-design/bottom-sheets-optimized-ux/
- Mobbin - Design Patterns: https://mobbin.com/glossary/bottom-sheet

**Libraries (React Native):**
- @gorhom/bottom-sheet (most popular)
- react-native-reanimated-bottom-sheet
- react-native-modal

**Libraries (Flutter):**
- showModalBottomSheet (built-in)
- modal_bottom_sheet package

**Libraries (Swift/iOS):**
- UISheetPresentationController (iOS 15+)
- Custom implementations for iOS 14-

**Libraries (Android/Kotlin):**
- ModalBottomSheet (Jetpack Compose Material3)
- BottomSheetDialogFragment (View system)

---

## 10. Conclusion

The mobile app landscape of 2024-2025 has standardized around **bottom sheets with immediate editing** for single-item workflows and **long-press multi-select** for batch operations. This pattern balances:

- **Speed:** One tap to edit (no mode switching)
- **Context:** Grid remains visible (users maintain orientation)
- **Ergonomics:** Bottom controls (thumb-friendly on large phones)
- **Familiarity:** Matches user expectations from popular apps
- **Accessibility:** Multiple interaction methods (tap, swipe, buttons)

For a mobile-first beat editor, the recommended approach is:
1. **Primary flow:** Tap beat → Bottom sheet (50% height) → Edit → Swipe/tap to dismiss
2. **Secondary flow:** Long-press → Multi-select mode → Batch actions
3. **Advanced:** Expand to 90% height for complex controls
4. **Context:** Keep beat grid visible and highlighted during editing

This pattern is proven across Instagram, Google Photos, CapCut, iOS/Android native editors, and aligns with both Apple HIG and Material Design 3 guidelines.

---

**Report compiled:** October 26, 2025
**Research sources:** 40+ articles, official design guidelines, UX case studies
**Pattern focus:** Mobile-first selection and editing workflows for grid/card interfaces
