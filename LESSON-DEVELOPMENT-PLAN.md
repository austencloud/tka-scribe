# TKA Lesson Development Plan

## Overview

Building 28 interactive concept lessons for The Kinetic Alphabet (TKA) learning system. Each lesson follows the existing Grid lesson pattern with interactive elements and a verification quiz.

## Lesson Structure Pattern (from Grid implementation)

Each lesson consists of:
1. **ConceptExperience component** - Multi-page interactive lesson
2. **Supporting visualizer components** - Interactive elements for each concept
3. **Quiz component** - Verification quiz at the end
4. **Integration** - Export from index.ts and wire into ConceptDetailView.svelte

## Progression Order (following Level 1 PDF)

### Foundation Phase
1. ✅ The Grid (BUILT - needs quiz completion)
2. Hand Positions (Alpha, Beta, Gamma)
3. Hand Motions (6 types)

### Letters Phase
4. Type 1 Letters (A-V)
5. Type 2 Letters (W, X, Y, Z, Σ, Δ, Θ, Ω)
6. Type 3 Letters (W-, X-, Y-, Z-, Σ-, Δ-, Θ-, Ω-)
7. Type 4 Letters (Φ, Ψ, Λ)
8. Type 5 Letters (Φ-, Ψ-, Λ-)
9. Type 6 Letters (α, β, Γ)

### Advanced Phase
10. Words (Letter combinations)
11. CAPs (Continuous Assembly Patterns)
12. Reversals (Hand, Prop, Full)

### VTG Parallel Track (separate section)
- VTG Fundamentals (timing/direction basics)
- Split vs Together timing
- Same vs Opposite direction
- Quarter timing concepts

---

## Agent Prompts for Parallel Development

### PROMPT 1: Grid Quiz Completion

```
TASK: Complete the Grid lesson quiz for TKA Studio

CONTEXT:
- Location: src/lib/modules/learn/components/grid/
- Existing files: GridConceptExperience.svelte, GridVisualizer.svelte, GridIdentificationQuiz.svelte, GridComparison.svelte
- The Grid lesson is 3 pages teaching diamond mode, box mode, and the combined 8-point grid

REQUIREMENTS:
1. Enhance GridIdentificationQuiz.svelte with TWO quiz types:
   a) Point Identification: Given a cardinal direction (N, NE, E, SE, S, SW, W, NW), user selects the correct point on an interactive grid
   b) Mode Identification: Show a grid configuration, user identifies if it's "Diamond" or "Box" mode

2. Quiz mechanics:
   - 5-10 questions per quiz type
   - Visual feedback (green/red) on answer
   - Progress indicator
   - Score at completion
   - "Try Again" or "Continue" options

3. Grid points reference:
   - Diamond mode: N, E, S, W (4 points)
   - Box mode: NE, SE, SW, NW (4 points)
   - Combined: All 8 points plus center

4. Use existing GridVisualizer component for interactive grid display

5. Match existing dark theme (rgb(20, 20, 28) background, white/rgba text)

FILES TO READ FIRST:
- src/lib/modules/learn/components/grid/GridVisualizer.svelte
- src/lib/modules/learn/components/grid/GridIdentificationQuiz.svelte
- src/lib/modules/learn/components/grid/GridConceptExperience.svelte
```

---

### PROMPT 2: Hand Positions Lesson

```
TASK: Build the Hand Positions lesson for TKA Studio

CONTEXT:
- This is the second concept in the TKA learning progression
- Teaches Alpha, Beta, and Gamma hand positions
- Location: Create in src/lib/modules/learn/components/positions/

HAND POSITIONS CONTENT:

1. ALPHA POSITION
   - Hands at OPPOSITE points on the grid
   - Examples: N↔S, E↔W, NE↔SW, NW↔SE
   - The hands form a straight line through center

2. BETA POSITION
   - Hands at the SAME point on the grid
   - Both hands occupy identical position
   - Examples: Both at N, both at E, both at SW, etc.

3. GAMMA POSITION
   - Hands at RIGHT ANGLE (90°) to each other
   - Examples: N+E, N+W, S+E, S+W, NE+NW, NE+SE, etc.
   - Quarter-turn relationship between hands

REQUIREMENTS:

1. Create PositionsConceptExperience.svelte with 4 pages:
   - Page 1: Alpha position (opposite points)
   - Page 2: Beta position (same point)
   - Page 3: Gamma position (right angle)
   - Page 4: Review/Quiz

2. Create PositionVisualizer.svelte:
   - Interactive 8-point grid display
   - Two hand indicators (different colors: blue/red or similar)
   - Animate hand positions to demonstrate each type
   - Click-to-place hands for interaction

3. Create PositionIdentificationQuiz.svelte:
   - Show two hand positions on grid
   - User identifies: Alpha, Beta, or Gamma
   - 8-10 questions with randomized positions
   - Score tracking and feedback

4. Visual style:
   - Use existing grid component or create consistent one
   - Dark theme matching app (rgb(20, 20, 28))
   - Category color for positions: #22D3EE (cyan)
   - Smooth animations between states

5. Export from index.ts and wire into ConceptDetailView.svelte

FILES TO READ FIRST:
- src/lib/modules/learn/components/grid/GridConceptExperience.svelte (for pattern)
- src/lib/modules/learn/components/grid/GridVisualizer.svelte (for grid rendering)
- src/lib/modules/learn/components/ConceptDetailView.svelte (for integration)
- src/lib/modules/learn/domain/concepts.ts (for concept definitions)
```

---

### PROMPT 3: Hand Motions Lesson

```
TASK: Build the Hand Motions lesson for TKA Studio

CONTEXT:
- Third concept in TKA progression
- Teaches 6 types of hand motions
- Location: Create in src/lib/modules/learn/components/motions/

HAND MOTIONS CONTENT:

The 6 motion types describe how hands move relative to the grid:

1. DUAL-SHIFT
   - Both hands move to NEW, DIFFERENT positions
   - Start: Alpha/Gamma → End: Alpha/Gamma (different points)
   - Example: N↔S shifting to E↔W

2. SHIFT
   - ONE hand moves, other stays put
   - Requires starting/ending in Gamma (90°)
   - Example: N+E → N+S (E hand moved to S)

3. CROSS-SHIFT
   - One hand CROSSES through the other's position
   - Hands swap roles/sides
   - Example: N hand crosses to S, S hand crosses to N

4. DASH
   - One hand moves to MEET the other
   - Alpha → Beta transition
   - Example: N↔S → Both at N (S dashed to N)

5. DUAL-DASH
   - Both hands move to MEET at center
   - Alpha → Beta at center
   - Example: N↔S → Both at center

6. STATIC
   - NO movement - hands stay in place
   - Position maintained from previous beat

REQUIREMENTS:

1. Create MotionsConceptExperience.svelte with 7 pages:
   - Page 1: Dual-Shift explanation + animation
   - Page 2: Shift explanation + animation
   - Page 3: Cross-Shift explanation + animation
   - Page 4: Dash explanation + animation
   - Page 5: Dual-Dash explanation + animation
   - Page 6: Static explanation
   - Page 7: Review/Quiz

2. Create MotionVisualizer.svelte:
   - Shows grid with two hands
   - Animates the motion when triggered
   - Before/After states clearly visible
   - Play/replay button for each motion

3. Create MotionIdentificationQuiz.svelte:
   - Show an animated motion
   - User identifies which of 6 types
   - 10-12 questions
   - Mix all motion types

4. Visual indicators:
   - Motion paths shown as dotted/dashed lines
   - Hands glow during movement
   - Clear start/end state markers

FILES TO READ FIRST:
- src/lib/modules/learn/components/grid/GridConceptExperience.svelte
- src/lib/modules/learn/components/positions/ (after Position lesson built)
- src/lib/modules/learn/domain/concepts.ts
```

---

### PROMPT 4: VTG Fundamentals Track

```
TASK: Build VTG Fundamentals parallel learning track for TKA Studio

CONTEXT:
- VTG (Vulcan Tech Gospel) is the timing/direction notation system
- This is a SEPARATE track users can take anytime
- Foundational knowledge that enhances understanding of TKA
- Location: Create in src/lib/modules/learn/components/vtg/

VTG CONTENT:

1. TIMING (Together vs Split)
   - TOGETHER (Tog): Both hands move at same time
   - SPLIT: Hands move alternately (one then other)

2. DIRECTION (Same vs Opposite)
   - SAME: Both hands move in same direction (both CW or both CCW)
   - OPPOSITE (Opp): Hands move in opposite directions (one CW, one CCW)

3. QUARTER TIMING
   - Quarter-Opp (QO): 90° offset, opposite directions
   - Quarter-Same (QS): 90° offset, same direction

4. COMBINED NOTATION
   - SS = Split-Same
   - TS = Together-Same (Tog-Same)
   - SO = Split-Opposite (Split-Opp)
   - TO = Together-Opposite (Tog-Opp)
   - QO = Quarter-Opposite
   - QS = Quarter-Same

REQUIREMENTS:

1. Create new concept entries in domain/concepts.ts for VTG track:
   - vtg-timing: "Timing Basics" (Split vs Together)
   - vtg-direction: "Direction Basics" (Same vs Opposite)
   - vtg-combined: "Combined Timing" (SS, TS, SO, TO)
   - vtg-quarter: "Quarter Timing" (QO, QS)

2. Create VTGTimingExperience.svelte:
   - Animated visualization of two spinning objects
   - Toggle between Together and Split timing
   - User can see real-time difference

3. Create VTGDirectionExperience.svelte:
   - Same two objects showing direction
   - Toggle Same vs Opposite
   - Clear CW/CCW indicators

4. Create VTGCombinedQuiz.svelte:
   - Show animation of timing+direction
   - User identifies: SS, TS, SO, or TO
   - 8 questions covering all combinations

5. Add VTG section to ConceptPathView or create parallel navigation

FILES TO READ FIRST:
- src/lib/modules/learn/domain/concepts.ts
- src/lib/modules/learn/domain/types.ts
- src/lib/modules/learn/components/ConceptPathView.svelte
```

---

### PROMPT 5: Type 1 Letters Lesson

```
TASK: Build Type 1 Letters lesson for TKA Studio

CONTEXT:
- Type 1 letters are the primary alphabet (A-V)
- These are motion letters with standard timing
- Location: Create in src/lib/modules/learn/components/letters/

TYPE 1 LETTERS CONTENT:

Letters A-V organized by motion type:

DUAL-SHIFT LETTERS:
- A, B, C, D, E, F (6 letters)
- Both hands shift to new positions

SHIFT LETTERS:
- G, H, I, J, K, L (6 letters)
- One hand shifts, other stays

CROSS-SHIFT LETTERS:
- M, N, O, P (4 letters)
- One hand crosses through other

DASH LETTERS:
- Q, R, S (3 letters)
- One hand dashes to meet other

DUAL-DASH LETTERS:
- T, U (2 letters)
- Both hands dash to center

STATIC LETTER:
- V (1 letter)
- No movement

REQUIREMENTS:

1. Create LetterTypeOneExperience.svelte with sections:
   - Overview of Type 1 letters
   - Group by motion type (6 groups)
   - Interactive letter explorer
   - Quiz

2. Create LetterVisualizer.svelte:
   - Shows pictograph of letter
   - Animates the motion
   - Shows start/end positions
   - Labels motion type

3. Create LetterExplorer.svelte:
   - Grid of all 22 letters
   - Click to see animation
   - Color-coded by motion type
   - Search/filter capability

4. Create LetterQuiz.svelte:
   - Show letter pictograph
   - User identifies motion type
   - OR show motion, user picks letter
   - 15-20 questions

FILES TO READ FIRST:
- static/data/pictographs/ (for letter pictograph data)
- src/lib/modules/learn/components/grid/GridConceptExperience.svelte
- PDF Level 1 pages on letters
```

---

### PROMPT 6: Staff Positions & Rotations Lesson

```
TASK: Build Staff Positions & Rotations lesson for TKA Studio

CONTEXT:
- Props (staffs/poi) have their own position notation
- Prospin and Antispin are key rotation concepts
- Location: Create in src/lib/modules/learn/components/staff/

STAFF CONTENT:

STAFF POSITIONS:
- Based on clock positions (12, 3, 6, 9)
- Or compass (N, E, S, W)
- Describes where staff ends point

PROSPIN:
- Staff rotates while hands move
- Staff ends stay pointing same direction (isolation effect)
- Example: Staff points N, hands move, staff still points N

ANTISPIN:
- Staff rotates opposite to hand movement
- Staff ends swap positions during motion
- Example: Staff at 12/6 becomes 6/12

KEY INSIGHT:
- Prospin = isolation (staff orientation preserved)
- Antispin = ends swap

REQUIREMENTS:

1. Create StaffConceptExperience.svelte:
   - Page 1: Staff position notation
   - Page 2: Prospin visualization
   - Page 3: Antispin visualization
   - Page 4: Comparison and Quiz

2. Create StaffVisualizer.svelte:
   - Animated staff/poi prop
   - Show rotation clearly
   - Before/after states
   - Prospin vs Antispin toggle

3. Create StaffRotationQuiz.svelte:
   - Show staff animation
   - User identifies: Prospin or Antispin
   - 8-10 questions

FILES TO READ FIRST:
- src/lib/shared/pictograph/prop/ (for prop rendering)
- PDF Level 1 pages on staff notation
```

---

## Integration Checklist

For each lesson:
- [ ] Create experience component (multi-page)
- [ ] Create visualizer component (interactive)
- [ ] Create quiz component (verification)
- [ ] Add exports to index.ts
- [ ] Wire into ConceptDetailView.svelte
- [ ] Update concept definitions if needed
- [ ] Test progression flow

## File Structure

```
src/lib/modules/learn/components/
├── grid/           ✅ (needs quiz completion)
│   ├── GridConceptExperience.svelte
│   ├── GridVisualizer.svelte
│   ├── GridIdentificationQuiz.svelte
│   └── GridComparison.svelte
├── positions/      🔨 (to build)
│   ├── PositionsConceptExperience.svelte
│   ├── PositionVisualizer.svelte
│   └── PositionIdentificationQuiz.svelte
├── motions/        🔨 (to build)
│   ├── MotionsConceptExperience.svelte
│   ├── MotionVisualizer.svelte
│   └── MotionIdentificationQuiz.svelte
├── vtg/            🔨 (to build - parallel track)
│   ├── VTGTimingExperience.svelte
│   ├── VTGDirectionExperience.svelte
│   └── VTGCombinedQuiz.svelte
├── letters/        🔨 (to build)
│   ├── LetterTypeOneExperience.svelte
│   ├── LetterVisualizer.svelte
│   └── LetterQuiz.svelte
└── staff/          🔨 (to build)
    ├── StaffConceptExperience.svelte
    ├── StaffVisualizer.svelte
    └── StaffRotationQuiz.svelte
```

## Priority Order

1. **HIGH**: Grid Quiz Completion (PROMPT 1)
2. **HIGH**: Hand Positions (PROMPT 2)
3. **HIGH**: VTG Fundamentals (PROMPT 4) - parallel track
4. **MEDIUM**: Hand Motions (PROMPT 3)
5. **MEDIUM**: Staff Rotations (PROMPT 6)
6. **LATER**: Type 1 Letters (PROMPT 5)
7. **LATER**: Remaining letter types, words, CAPs, reversals
