# CAP Metadata Backfill Guide

## Overview

The `backfill-cap-metadata.js` script updates existing sequences in Firestore with CAP (Continuous Assembly Pattern) metadata:

- `isCircular`: Whether the sequence returns to starting position
- `orientationCycleCount`: How many repetitions needed to return to starting orientation (1, 2, or 4)
- `capType`: Specific CAP pattern (future enhancement)

## Prerequisites

1. **Firebase Admin SDK service account key**: `serviceAccountKey.json` in project root
2. **Node.js**: v18 or higher
3. **Dependencies**: `npm install` (firebase-admin)

## Usage

### Dry Run (Preview Changes)

```bash
node scripts/backfill-cap-metadata.js --dry-run
```

This will:
- ✅ Analyze all sequences
- ✅ Show what would be updated
- ✅ Display statistics
- ❌ **NOT** modify Firestore

### Live Update (Public Sequences)

```bash
node scripts/backfill-cap-metadata.js
```

Updates `publicSequences` collection (default).

### Live Update (User Library)

```bash
node scripts/backfill-cap-metadata.js --collection=users/USER_ID/sequences
```

Updates specific user's private library.

## How It Works

### 1. Circularity Detection

Compares first beat's starting position with last beat's ending position:
- **Circular**: Start position === End position
- **Non-Circular**: Positions differ

### 2. Orientation Cycle Detection

For circular sequences, simulates up to 4 repetitions tracking prop orientation:
- **Cycle 1**: Returns to starting orientation after 1 rep
- **Cycle 2**: Returns after 2 reps (e.g., 180° rotation per rep)
- **Cycle 4**: Returns after 4 reps (e.g., 90° rotation per rep)

### 3. Pagination & Quota Safety

- Processes 20 sequences per page
- 2-second delay between pages
- Auto-retries if quota exceeded (30s wait)
- Stable pagination using document IDs

## Output Example

```
📦 Starting CAP metadata backfill for publicSequences...
   Mode: LIVE UPDATE

📄 Page 1: Fetching up to 20 sequences...
   Found 20 documents
   15 sequences need metadata
   ✅ Updated 15 sequences (total: 15)
   Waiting 2000ms before next page...

📄 Page 2: Fetching up to 20 sequences...
   Found 20 documents
   12 sequences need metadata
   ✅ Updated 12 sequences (total: 27)
   ...

🎉 Backfill Complete!

📊 Statistics:
   Total processed: 1247
   Total updated: 823
   Circular sequences: 412
   Non-circular sequences: 411
   Orientation cycles:
     - Returns in 1 rep: 204
     - Returns in 2 reps: 156
     - Returns in 4 reps: 52
```

## Safety Features

1. **Dry run mode**: Test before modifying data
2. **Skip already processed**: Won't overwrite existing metadata
3. **Batch updates**: Efficient Firestore writes
4. **Error handling**: Graceful quota limit handling
5. **Progress tracking**: Real-time stats and counts

## Integration with App

Once backfilled, sequences will:
- ✅ Appear in CAP type filter in Discover gallery
- ✅ Display orientation cycle count in sequence details
- ✅ Enable filtering by circular vs non-circular
- ✅ Support filtering by specific CAP patterns (when capType is populated)

## Future Enhancements

The `capType` field (specific CAP pattern like "strict_rotated", "mirrored_swapped") requires more sophisticated detection logic. Current implementation focuses on `isCircular` and `orientationCycleCount` as the foundation.

To add CAP type detection:
1. Implement full CAP detection algorithm in script
2. Add CAP type to update metadata
3. Re-run backfill script

## Troubleshooting

**Error: "Cannot find module firebase-admin"**
```bash
npm install firebase-admin
```

**Error: "serviceAccountKey.json not found"**
- Download from Firebase Console → Project Settings → Service Accounts
- Place in project root
- Ensure `.gitignore` includes this file (it does)

**Error: "RESOURCE_EXHAUSTED"**
- Script auto-retries with 30s delay
- If persistent, increase DELAY_MS in script (default: 2000)

**Sequences not appearing in filter**
- Ensure app is reading from same collection
- Check browser console for data loading errors
- Verify sequences have `isCircular` field set
