# Sequence Restoration Testing Guide

This guide explains how to test sequence restoration from URLs to ensure that orientation calculations and all motion data are correctly preserved through the encode/decode cycle.

## Problem Statement

When sequences are encoded to URLs and then restored, we need to verify that:

1. All motion data is preserved (type, locations, orientations, rotations, turns)
2. Orientation calculations are correct (start orientation → end orientation)
3. Sequence continuity is maintained (end orientation of beat N = start orientation of beat N+1)
4. The animation displays correctly after restoration

## Testing Tools

### 1. Command Line Script

Test a specific URL from the command line:

```bash
# Test the default URL
node scripts/test-url-restoration.mjs

# Test a custom URL
node scripts/test-url-restoration.mjs "http://localhost:5173/?open=generate:z:..."
```

This script will:

- Parse the URL
- Decompress the data (if compressed with `z:` prefix)
- Decode the sequence
- Display all beats with their motion data
- Show orientation transitions

### 2. Browser Console Testing

The testing utilities are automatically loaded in development mode and available via `window`:

#### Test a Specific URL

```javascript
// Parse and decode a URL
const result = window.__parseDeepLink(
  "http://localhost:5173/?open=generate:z:..."
);
console.log(result);

// Decode compressed sequence data
const sequence = window.__decodeSequence("z:M4e1EtwDwBmA...");
console.log(sequence);
```

#### Test the Current Sequence

```javascript
// Get current sequence from Create module
const currentSequence = window.__createState?.sequence;

// Test restoration
const testResult = window.__testSequenceRestoration(currentSequence);

// View detailed report
console.log(window.__formatTestResult(testResult));
```

#### Test Multiple Sequences

```javascript
// Test 25 sequences
const sequences = [...]; // Array of SequenceData
const results = window.__testMultipleSequences(sequences);

// View summary report
console.log(window.__formatMultipleTestResults(results));
```

#### Using the Reactive Tester

```javascript
// Access the tester instance
const tester = window.__sequenceRestorationTester;

// Test current sequence
await tester.testCurrentSequence(() => window.__createState?.sequence);

// Test multiple sequences
await tester.testMultiple(sequences);

// View summary
console.log(tester.getSummary());

// Export results as JSON
const json = tester.exportResults();
console.log(json);
```

### 3. Automated Playwright Tests

Run the full test suite:

```bash
# Run all sequence restoration tests
npx playwright test sequence-restoration

# Run specific test
npx playwright test sequence-restoration -g "should restore a simple 3-beat sequence"
```

## Understanding Test Results

### Successful Test

```
════════════════════════════════════════════════════════════════════════════════
Sequence: My Test Sequence
URL: http://localhost:5173/?open=generate:z:M4e1EtwDwBmA...
URL Length: 250 chars (compressed)
Overall Result: ✅ PASS
════════════════════════════════════════════════════════════════════════════════

Metadata:
  ✅ Metadata matches

Summary:
  Total Beats: 10
  ✅ Matching Beats: 10
  ❌ Failed Beats: 0
  Total Motions: 20
  ✅ Matching Motions: 20
  ❌ Failed Motions: 0
════════════════════════════════════════════════════════════════════════════════
```

### Failed Test

```
════════════════════════════════════════════════════════════════════════════════
Sequence: Problematic Sequence
URL: http://localhost:5173/?open=generate:z:...
URL Length: 180 chars (compressed)
Overall Result: ❌ FAIL
════════════════════════════════════════════════════════════════════════════════

Metadata:
  ✅ Metadata matches

Summary:
  Total Beats: 5
  ✅ Matching Beats: 3
  ❌ Failed Beats: 2
  Total Motions: 10
  ✅ Matching Motions: 6
  ❌ Failed Motions: 4

Failed Beats:

  Beat 3:
    Blue Motion:
      ❌ blue.startOrientation: IN → OUT
      ❌ blue.endOrientation: OUT → IN
    Red Motion:
      ✅ Matches

  Beat 4:
    Blue Motion:
      ❌ blue.endOrientation: CLOCK → COUNTER
    Red Motion:
      ❌ red.startOrientation: OUT → IN
════════════════════════════════════════════════════════════════════════════════
```

## Common Issues and Solutions

### Issue 1: Orientation Mismatch

**Symptom**: End orientation doesn't match between original and restored sequence

**Likely Cause**: Orientation calculation service not being used during restoration

**Solution**: Check `MotionQueryHandler.transformPictographStartOrientation()` in:

- `src/lib/shared/pictograph/shared/services/implementations/MotionQueryHandler.ts:316`

### Issue 2: Continuity Break

**Symptom**: Beat N's end orientation ≠ Beat N+1's start orientation

**Likely Cause**: Orientation transformation not applied when loading from URL

**Solution**: Check `getNextOptionsForSequence()` in:

- `src/lib/shared/pictograph/shared/services/implementations/MotionQueryHandler.ts:192`

### Issue 3: Letter Mismatch

**Symptom**: Letter field is different after restoration

**Likely Cause**: Letter derivation hasn't completed yet

**Solution**: Letters are derived asynchronously after sequence loads. Check:

- `src/lib/shared/navigation/utils/letter-deriver-helper.ts`

## Manual Verification Steps

To manually verify a sequence restoration:

1. **Generate a sequence** in the app
2. **Get the share URL** (either from the UI or URL bar after sequence is created)
3. **Copy the URL**
4. **Open a new browser tab** (or incognito window)
5. **Paste and open the URL**
6. **Compare the sequences visually**:
   - Check each beat's letter
   - Verify prop orientations (IN/OUT/CLOCK/COUNTER)
   - Ensure smooth animation transitions
   - Check that start positions match

## Testing 25 Sequences Autonomously

To test 25 sequences in a row:

### Option 1: Use the Generator + Browser Console

```javascript
// 1. Create an array to store sequences
const testSequences = [];

// 2. Generate sequences using the app's generator
// (Do this manually in the UI, adding each to testSequences)

// 3. Run the batch test
const results =
  await window.__sequenceRestorationTester.testMultiple(testSequences);

// 4. View the report
console.log(results.getSummary());
```

### Option 2: Use Playwright (Recommended)

```bash
# The test suite will generate and test 25 sequences automatically
npx playwright test sequence-restoration -g "should test 25 sequences"
```

## Understanding the Encoding Format

Sequences are encoded in this format:

```
startBeat|beat1|beat2|beat3|...
```

Each beat contains two motions (blue and red) separated by `:`:

```
blueMotion:redMotion
```

Each motion is encoded as (10-15 characters):

```
[startLoc(2)][endLoc(2)][startOri(1)][endOri(1)][rotDir(1)][turns(1+)][type(1)]
```

Example: `soweiou0a` decodes to:

- Start Location: `so` = SOUTH
- End Location: `we` = WEST
- Start Orientation: `i` = IN
- End Orientation: `o` = OUT
- Rotation Direction: `u` = COUNTER_CLOCKWISE
- Turns: `0` = 0 turns
- Motion Type: `a` = ANTI

### Compression

URLs with `z:` prefix use LZ-String compression:

```
http://localhost:5173/?open=generate:z:M4e1EtwDwBmA...
                                      ↑
                                      Compression flag
```

The compressed string is decompressed before decoding.

## API Reference

### Test Functions

```typescript
// Test a single sequence
function testSequenceRestoration(sequence: SequenceData): SequenceTestResult

// Test a URL against original sequence
function testURLRestoration(url: string, originalSequence: SequenceData): SequenceTestResult

// Format a test result as a readable report
function formatTestResult(result: SequenceTestResult): string

// Test multiple sequences
function testMultipleSequences(sequences: SequenceData[]): {
  results: SequenceTestResult[];
  passCount: number;
  failCount: number;
  totalTests: number;
  successRate: number;
}

// Format multiple test results
function formatMultipleTestResults(testResults: {...}): string
```

### Browser Console Utilities

```typescript
// Available on window in development mode:
window.__sequenceRestorationTester; // Reactive tester instance
window.__testSequenceRestoration; // Test a sequence
window.__parseDeepLink; // Parse a URL
window.__encodeSequence; // Encode a sequence
window.__decodeSequence; // Decode a sequence
```

## Files Reference

- **Test Harness**: `src/lib/shared/navigation/utils/sequence-restoration-test.ts`
- **Browser Tester**: `src/lib/shared/navigation/utils/test-sequence-restoration.svelte.ts`
- **CLI Script**: `scripts/test-url-restoration.mjs`
- **Playwright Tests**: `tests/sequence-restoration.spec.ts`
- **Encoder/Decoder**: `src/lib/shared/navigation/utils/sequence-url-encoder.ts`
- **Orientation Calculator**: `src/lib/shared/pictograph/shared/services/implementations/MotionQueryHandler.ts`

## Troubleshooting

### "Cannot find module 'lz-string'"

The CLI script requires lz-string to decompress URLs. It's already installed as a dependency, so this shouldn't happen. If it does:

```bash
npm install lz-string
```

### "window.\_\_sequenceRestorationTester is undefined"

This means the app is running in production mode. The tester only loads in development:

```bash
npm run dev
```

### "No current sequence found"

Make sure you have a sequence created before testing:

1. Navigate to Create module
2. Build a sequence (select start position, add beats)
3. Run the test

## Example: Complete Testing Workflow

```bash
# 1. Start the dev server
npm run dev

# 2. Open browser console (F12)

# 3. Create a sequence in the UI

# 4. Test the current sequence
const result = await window.__sequenceRestorationTester.testCurrentSequence(
  () => window.__createState?.sequence
);

# 5. View the report
console.log(result);

# 6. If there are issues, export the results
const json = window.__sequenceRestorationTester.exportResults();
console.log(json);

# 7. Test the URL directly
const url = window.location.href;
const testResult = window.__parseDeepLink(url);
console.log(testResult);
```

## Contributing

If you find issues with sequence restoration:

1. **Document the issue**: Use the test tools to capture the exact differences
2. **Export test results**: Use `exportResults()` to get JSON data
3. **Include the URL**: Share the problematic URL for reproduction
4. **File a bug report**: Include all the above information

## Performance Considerations

- Testing 25 sequences can take 5-10 seconds depending on sequence complexity
- The browser-based tester includes progress tracking
- Tests run in the background and won't block the UI
- Large sequences (50+ beats) may take longer to encode/decode
