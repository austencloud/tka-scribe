# Terminology: Start Position vs Beat

## The Problem

Throughout the codebase, there's confusion between **start positions** and **beats**. The start position is NOT a beat - it's where the user is positioned BEFORE the sequence begins. However, in many places, we refer to it as "beat 0" or include it in beat counts.

## The Mental Model (Correct)

```
[Start Position]  →  [Beat 1]  →  [Beat 2]  →  [Beat 3]  →  ...
     ↑                   ↑            ↑            ↑
  Where you          First       Second       Third
  begin from         beat        beat         beat
  (not a beat)
```

**Start Position**:

- Where the performer begins
- Shows initial prop locations and orientations
- NOT part of the sequence
- NOT counted in "total beats"
- Sometimes called "beat 0" (WRONG!)
- Sometimes called "start tile" or "start position tile" (CORRECT!)

**Beats**:

- The actual movements in the sequence
- Numbered 1, 2, 3, ...
- What gets counted when you say "this is a 10-beat sequence"
- Each beat is a pictograph representing motion

## Current Issues

### 1. SequenceData Model Confusion

In `src/lib/shared/foundation/domain/models/SequenceData.ts`:

```typescript
export interface SequenceData {
  readonly beats: readonly BeatData[];

  // THREE different fields for start position! 😱
  readonly startingPositionBeat?: BeatData; // "beat" is wrong term
  readonly startingPositionGroup?: GridPositionGroup;
  readonly startPosition?: BeatData; // Also calls it "beat"
}
```

**Issues**:

- Uses `BeatData` type for start position (should be different type)
- Three different optional fields - unclear which to use
- Field names use both "beat" and "position" inconsistently

### 2. URL Encoding Comments

In `src/lib/shared/navigation/utils/sequence-url-encoder.ts:111-114`:

```typescript
/**
 * Encode entire sequence into compact URL string
 * Format: "startPositionBeat|beat1|beat2|beat3..."  // ← "startPositionBeat" is confusing
 *
 * The first encoded beat is the start position, followed by the sequence beats
 */
```

**Issue**: Comment says "first encoded beat" but it's not a beat!

### 3. BeatNumber = 0 Convention

In `sequence-url-encoder.ts:120-126`:

```typescript
// Check if beat 0 exists in the beats array (Generator puts start position at beats[0])
const beat0 = sequence.beats.find((b) => b.beatNumber === 0);

if (beat0) {
  // Generator format: start position is in beats array at index 0
  startPositionBeat = beat0;
  actualBeats = sequence.beats.filter((b) => b.beatNumber !== 0);
}
```

**Issues**:

- beatNumber=0 is used to represent start position
- Start position gets mixed into beats array
- Have to filter it out: "actual beats" vs "beats including start position"

### 4. Test Output

In `scripts/test-url-restoration.mjs:110`:

```javascript
console.log("📊 Found", beats.length, "beats (including start position)");
```

And then:

```javascript
Beat 0: sosoiix0s:nonoiix0s  // ← This is the START POSITION, not beat 0!
Beat 1: sosoiix0s:noeaiku1.5a
Beat 2: soweiou0a:easokoxfl
```

**Issue**: Says "17 beats" when there are really only 16 beats + 1 start position

### 5. Beat Grid Config

In `src/lib/modules/create/shared/workspace-panel/sequence-display/domain/models/beat-grid-models.ts`:

```typescript
export interface BeatGridConfig {
  /** Number of columns allocated for BEATS (excludes the Start tile column) */
  columns: number;

  /** Whether to reserve the first column for the Start Position tile */
  hasStartTile: boolean; // ← Good! Uses "tile" not "beat"
}
```

**Good Example**: This correctly distinguishes "start tile" from beats!

## Recommended Solution

### 1. Create Distinct Types

```typescript
// New type specifically for start position
export interface StartPositionData {
  readonly id: string;
  readonly motions: {
    readonly blue: MotionData | undefined;
    readonly red: MotionData | undefined;
  };
  readonly group?: GridPositionGroup; // "alpha", "beta", "gamma"
  readonly isStartPosition: true; // Type discriminator
}

// BeatData remains for actual beats
export interface BeatData {
  readonly beatNumber: number; // Always >= 1, never 0
  readonly motions: { ... };
  readonly letter: string | null;
  readonly isBeat: true; // Type discriminator
  // ... other beat-specific fields
}
```

### 2. Update SequenceData Model

```typescript
export interface SequenceData {
  readonly id: string;
  readonly name: string;
  readonly word: string;

  // Clear separation:
  readonly startPosition: StartPositionData; // Required, not optional
  readonly beats: readonly BeatData[]; // Only actual beats, never includes start position

  readonly beatCount: number; // Explicit count, always === beats.length
  // ... other fields
}
```

### 3. Update URL Encoding

```typescript
/**
 * Encode entire sequence into compact URL string
 * Format: "startPosition|beat1|beat2|beat3..."
 *
 * The first encoded part is the start position (where user begins),
 * followed by the actual sequence beats.
 */
export function encodeSequence(sequence: SequenceData): string {
  const encodedStartPosition = encodePosition(sequence.startPosition);
  const encodedBeats = sequence.beats.map(encodeBeat);
  return [encodedStartPosition, ...encodedBeats].join("|");
}
```

### 4. Update Test Output

```javascript
console.log("📊 Found start position + ", beats.length - 1, "beats");

// Or better:
console.log("📍 Start Position:");
console.log(startPosition);
console.log("\n🎵 Beats (", beats.length, "):");
for (let i = 0; i < beats.length; i++) {
  console.log(`  Beat ${i + 1}:`, beats[i]);
}
```

### 5. Terminology Standards

| Concept                | ✅ CORRECT Terms                                    | ❌ AVOID                             |
| ---------------------- | --------------------------------------------------- | ------------------------------------ |
| Where user starts      | "start position", "start tile", "starting position" | "beat 0", "start beat", "first beat" |
| Motion in sequence     | "beat", "sequence beat"                             | N/A                                  |
| All beats in sequence  | "sequence beats", "beats"                           | "all beats including start"          |
| Count of beats         | "10 beats", "sequence length: 10"                   | "10 beats + start position"          |
| Start position display | "start position tile", "start tile"                 | "beat 0 tile"                        |
| Beat numbering         | "beats 1-10"                                        | "beats 0-9"                          |

## Files That Need Updates

### High Priority (User-Facing)

1. **Test Output**
   - `scripts/test-url-restoration.mjs` - Fix "17 beats" → "start position + 16 beats"
   - `src/lib/shared/navigation/utils/sequence-restoration-test.ts` - Update result formatting
   - `docs/SEQUENCE-RESTORATION-TESTING.md` - Fix example outputs

2. **URL Encoder Comments**
   - `src/lib/shared/navigation/utils/sequence-url-encoder.ts` - Update JSDoc comments
   - Remove "beat 0" terminology
   - Use "start position" consistently

### Medium Priority (Internal Consistency)

3. **Data Models**
   - `src/lib/shared/foundation/domain/models/SequenceData.ts` - Consider type refactoring
   - Create `StartPositionData` type
   - Consolidate three start position fields into one

4. **State Management**
   - `src/lib/modules/create/shared/state/construct-tab-state.svelte.ts`
   - `src/lib/modules/explore/shared/state/explore-state-factory.svelte.ts`
   - Ensure consistent terminology in variable names

### Low Priority (Documentation)

5. **Code Comments**
   - Search for "beat 0" in comments and replace with "start position"
   - Update JSDoc for functions that handle start positions
   - Add terminology standards to CODING_STANDARDS.md

## Migration Strategy

Since this touches core data structures, we should migrate gradually:

### Phase 1: Documentation & Comments (Safe - Do Now)

- Update all comments and documentation
- Fix test output messages
- Create this terminology guide

### Phase 2: Non-Breaking Code Changes (Safe - Do Soon)

- Add `StartPositionData` type alongside existing fields
- Add helper functions that use correct terminology
- Deprecate old field names with JSDoc `@deprecated` tags

### Phase 3: Breaking Changes (Requires Migration - Do Later)

- Remove duplicate start position fields
- Make `startPosition` required (not optional)
- Enforce beatNumber >= 1 (never 0)
- Update all services to use new types

## Code Examples

### Before (Confusing)

```typescript
const sequence: SequenceData = {
  beats: [
    { beatNumber: 0, ... }, // ← Start position masquerading as beat
    { beatNumber: 1, ... },
    { beatNumber: 2, ... },
  ],
  startingPositionBeat: { ... }, // ← Duplicate!
  startPosition: { ... },         // ← Duplicate!
};

// User sees: "3 beats" but mentally thinks "2 beats + start position"
console.log(`${sequence.beats.length} beats`);
```

### After (Clear)

```typescript
const sequence: SequenceData = {
  startPosition: {
    id: "start-123",
    motions: { blue: ..., red: ... },
    group: "alpha",
    isStartPosition: true,
  },
  beats: [
    { beatNumber: 1, isBeat: true, ... },
    { beatNumber: 2, isBeat: true, ... },
  ],
  beatCount: 2,
};

// User sees: "2 beats" and mentally thinks "2 beats" ✅
console.log(`${sequence.beatCount} beats`);
console.log(`Starting from: ${sequence.startPosition.group} position`);
```

## Summary

**The Rule**: If it's not moving, it's not a beat. The start position is where you ARE, not where you're GOING.

- ✅ "This sequence has 10 beats"
- ✅ "Starting from alpha position"
- ✅ "The start tile shows your initial position"
- ❌ "This sequence has 11 beats (including start position)"
- ❌ "Beat 0 is the start position"
- ❌ "The first beat is where you start"
