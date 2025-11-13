# Gallery Cache Clearing Guide

## Problem: Cached Difficulty Levels

After implementing the new difficulty calculator, gallery sequences are still showing **incorrect difficulty levels** because of multiple caching layers serving stale data.

## Caching Layers Identified

1. **sequence-index.json** (304KB) - Pre-cached static file with old metadata
2. **OptimizedExploreService** - Map cache of paginated sequences
3. **ExploreCacheService** - In-memory cache of all sequences
4. **Browser HTTP Cache** - Caching the sequence-index.json file
5. **IndexedDB/Dexie** - Persistent storage (if used)
6. **localStorage** - Gallery state persistence

## Solution: Three-Step Cache Clear

### Option 1: Browser Console (Quick)

1. Open browser DevTools (F12)
2. Go to Console tab
3. Run:
```javascript
await window.__clearGalleryCache();
location.reload();
```

### Option 2: Manual Browser Clear (Thorough)

1. **Hard Refresh**: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
2. **Clear Application Storage**:
   - Open DevTools → Application tab
   - Under "Storage" → Click "Clear site data"
   - Refresh the page

3. **Clear Network Cache**:
   - DevTools → Network tab
   - Check "Disable cache" checkbox
   - Refresh the page

### Option 3: Dev Server Restart

```bash
# Stop the dev server (Ctrl+C)
# Start fresh
npm run dev
```

## How It's Fixed

### 1. Cache Busting in ExploreLoader
```typescript
// Now adds timestamp to prevent browser caching
const url = `${SEQUENCE_INDEX_URL}?v=${Date.now()}`;
const response = await fetch(url, {
  cache: 'no-store',
});
```

### 2. Utility Function Created
New file: `src/lib/shared/utils/clear-gallery-cache.ts`

Clears all caching layers programmatically:
- ExploreCacheService
- OptimizedExploreService
- IndexedDB
- localStorage gallery entries

### 3. Difficulty Now Calculated Fresh
The `ExploreMetadataExtractor` now:
- Parses motion data from sequence metadata
- Calls `SequenceDifficultyCalculator.calculateDifficultyLevel(beats)`
- Returns correct difficulty based on **actual turns and orientations**

## Verifying the Fix

After clearing caches, check a sequence in the gallery:

1. **Level 1 (Beginner)** - Should show light gray/white gradient
   - No turns (all 0)
   - Only radial orientations (IN/OUT)

2. **Level 2 (Intermediate)** - Should show blue/gray gradient
   - Has turns (1, 2, or 3)
   - Only radial orientations (IN/OUT)

3. **Level 3 (Advanced)** - Should show gold/yellow gradient
   - Has non-radial orientations (CLOCK/COUNTER)
   - OR has float turns ("fl")
   - OR has half-turns (0.5, 1.5, 2.5)

## Future Prevention

The cache-busting code ensures fresh loads going forward. Old difficulty values in `sequence-index.json` will be ignored as the extractor now **calculates** difficulty from sequence content instead of reading stored values.

## Still Seeing Wrong Values?

If difficulties are still incorrect after clearing all caches:

1. Check browser console for errors
2. Verify `SequenceDifficultyCalculator` is registered in DI container
3. Ensure metadata extractor is parsing motion data correctly
4. Check that beat data contains `blue_attributes` and `red_attributes`

## Summary

✅ **Root cause**: Multiple caching layers serving old difficulty values
✅ **Solution**: Cache busting + dynamic difficulty calculation
✅ **Clear caches**: Use browser console utility or hard refresh
✅ **Prevention**: Difficulty is now calculated on-the-fly, never stored
