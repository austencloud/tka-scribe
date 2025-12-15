/**
 * Migration Script: Normalize Start Position Data
 *
 * Fixes legacy sequence data formats where start position was stored inconsistently:
 * - Legacy format 1: Beat 0 mixed into beats array
 * - Legacy format 2: startingPositionBeat field (old name)
 * - Modern format: startPosition field separate from beats
 *
 * After this migration, ALL sequences will have:
 * - beats: Array of actual beats (no start position)
 * - startPosition: Separate start position data
 * - No legacy fields
 *
 * NOTE: This script works with IndexedDB (local browser storage).
 * Run this in a browser environment with the app loaded.
 */

import Dexie from 'dexie';

// Define the database schema (same as TKADatabase.ts)
const db = new Dexie('TKADatabase');
db.version(1).stores({
  sequences: 'id, word, author, level, isFavorite, *tags',
  settings: 'key',
  pictographs: 'id',
  userProjects: 'id, name, type, lastModified',
  userWork: 'id, projectId, type, lastModified',
  discoverState: 'id',
});

/**
 * Normalize sequence data - same logic as SequenceNormalizationService
 */
function separateBeatsFromStartPosition(sequence) {
  // Modern format - already normalized
  if (sequence.startPosition && Array.isArray(sequence.beats)) {
    const hasStartInBeats = sequence.beats.some(
      beat => beat?.beatNumber === 0 || beat?.isStartPosition === true
    );

    if (!hasStartInBeats) {
      return {
        beats: sequence.beats,
        startPosition: sequence.startPosition
      };
    }
  }

  // Legacy format 2: startingPositionBeat field
  if (sequence.startingPositionBeat) {
    const beats = Array.isArray(sequence.beats)
      ? sequence.beats.filter(beat =>
          beat && beat.beatNumber !== 0 && !beat.isStartPosition
        )
      : [];

    return {
      beats,
      startPosition: sequence.startingPositionBeat
    };
  }

  // Legacy format 1: Beat 0 in beats array
  if (Array.isArray(sequence.beats) && sequence.beats.length > 0) {
    const startPositionBeat = sequence.beats.find(
      beat => beat?.beatNumber === 0 || beat?.isStartPosition === true
    );

    if (startPositionBeat) {
      const beats = sequence.beats.filter(
        beat => beat && beat.beatNumber !== 0 && !beat.isStartPosition
      );

      return {
        beats,
        startPosition: startPositionBeat
      };
    }
  }

  // No start position found - return as-is
  return {
    beats: sequence.beats || [],
    startPosition: sequence.startPosition || null
  };
}

/**
 * Analyze sequence to determine if it needs migration
 */
function needsMigration(sequence) {
  // Has legacy startingPositionBeat field
  if (sequence.startingPositionBeat) {
    return true;
  }

  // Has beat 0 or isStartPosition in beats array
  if (Array.isArray(sequence.beats)) {
    const hasStartInBeats = sequence.beats.some(
      beat => beat?.beatNumber === 0 || beat?.isStartPosition === true
    );
    if (hasStartInBeats) {
      return true;
    }
  }

  return false;
}

/**
 * Main migration function
 */
async function migrateSequences(dryRun = true) {
  console.log('\n🔄 Starting sequence normalization migration...\n');
  console.log(`Mode: ${dryRun ? '🔍 DRY RUN (no changes)' : '✍️  LIVE (will update Firebase)'}\n`);

  try {
    // Fetch all sequences
    console.log('📥 Fetching sequences from Firebase...');
    const sequencesRef = collection(db, 'sequences');
    const snapshot = await getDocs(sequencesRef);

    console.log(`✅ Found ${snapshot.size} sequences\n`);

    let needsMigrationCount = 0;
    let alreadyCleanCount = 0;
    let errorCount = 0;
    const updates = [];

    // Analyze all sequences
    for (const docSnapshot of snapshot.docs) {
      const id = docSnapshot.id;
      const sequence = docSnapshot.data();

      if (needsMigration(sequence)) {
        needsMigrationCount++;

        try {
          const normalized = separateBeatsFromStartPosition(sequence);

          // Prepare update data
          const updateData = {
            beats: normalized.beats,
            startPosition: normalized.startPosition,
            // Remove legacy fields
            startingPositionBeat: null
          };

          updates.push({
            id,
            word: sequence.word || sequence.name || id,
            before: {
              beatsCount: sequence.beats?.length || 0,
              hasStartingPositionBeat: !!sequence.startingPositionBeat,
              hasStartPosition: !!sequence.startPosition
            },
            after: {
              beatsCount: normalized.beats.length,
              hasStartPosition: !!normalized.startPosition
            },
            updateData
          });

          console.log(`🔧 [${id}] "${sequence.word || sequence.name || 'Untitled'}"`);
          console.log(`   Before: ${sequence.beats?.length || 0} items in beats array`);
          console.log(`   After:  ${normalized.beats.length} beats + separate start position`);

        } catch (error) {
          errorCount++;
          console.error(`❌ [${id}] Error normalizing:`, error.message);
        }
      } else {
        alreadyCleanCount++;
      }
    }

    // Summary
    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Already clean: ${alreadyCleanCount}`);
    console.log(`   🔧 Needs migration: ${needsMigrationCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);

    // Apply updates if not dry run
    if (!dryRun && updates.length > 0) {
      console.log(`\n✍️  Applying ${updates.length} updates to Firebase...\n`);

      let successCount = 0;
      let failCount = 0;

      for (const update of updates) {
        try {
          const docRef = doc(db, 'sequences', update.id);
          await updateDoc(docRef, update.updateData);
          successCount++;
          console.log(`✅ [${update.id}] Updated successfully`);
        } catch (error) {
          failCount++;
          console.error(`❌ [${update.id}] Failed to update:`, error.message);
        }
      }

      console.log(`\n📊 Update Results:`);
      console.log(`   ✅ Success: ${successCount}`);
      console.log(`   ❌ Failed: ${failCount}`);
    } else if (dryRun && updates.length > 0) {
      console.log('\n🔍 DRY RUN: No changes were made.');
      console.log('   Run with --live flag to apply these changes.\n');
    } else {
      console.log('\n✨ All sequences are already normalized! No migration needed.\n');
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const isLive = args.includes('--live');

// Run migration
migrateSequences(!isLive)
  .then(() => {
    console.log('✅ Migration complete!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
