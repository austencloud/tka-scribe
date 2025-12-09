/**
 * Feedback Queue Manager
 *
 * Usage:
 *   node fetch-feedback.js              - Auto-claim next "new" item (by priority)
 *   node fetch-feedback.js list         - List all feedback with status
 *   node fetch-feedback.js prioritize   - Auto-prioritize all unprioritized items
 *   node fetch-feedback.js prioritize --dry-run - Preview prioritization without changes
 *   node fetch-feedback.js <id>         - View specific feedback
 *   node fetch-feedback.js <id> <status> "notes" - Update status
 *   node fetch-feedback.js <id> title "new title" - Update title
 *   node fetch-feedback.js <id> priority <low|medium|high> - Update priority
 *   node fetch-feedback.js <id> resolution "notes" - Add resolution notes (summary of how it was fixed)
 *   node fetch-feedback.js <id> subtask add "title" "description" - Add subtask
 *   node fetch-feedback.js <id> subtask <subtaskId> <status> - Update subtask status
 *   node fetch-feedback.js <id> subtask list - List subtasks
 *   node fetch-feedback.js <id> defer "2026-03-15" "Reason" - Defer until date
 *   node fetch-feedback.js <id> internal-only true/false - Mark as internal-only (excluded from user changelog)
 *   node fetch-feedback.js delete <id>  - Delete feedback item
 *
 * Workflow:
 *   1. Agent runs with no args → claims next unclaimed feedback (prioritized: no priority > high > medium > low)
 *   2. If complex, agent adds subtasks to break it down
 *   3. Future agents see subtasks and can work on prerequisites first
 *   4. Agent resolves when all subtasks complete
 *   5. When moving to in-review/completed, add resolution notes to explain what was done
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';

// Load service account key
const serviceAccount = JSON.parse(
  readFileSync('./serviceAccountKey.json', 'utf8')
);

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Stale claim threshold (2 hours) - items claimed longer than this can be reclaimed
const STALE_CLAIM_MS = 2 * 60 * 60 * 1000;

/**
 * Download images from Firebase Storage for a feedback item
 * Returns array of local file paths
 */
async function downloadFeedbackImages(feedbackId, imageUrls) {
  if (!imageUrls || imageUrls.length === 0) {
    return [];
  }

  // Ensure feedback-images directory exists
  const imageDir = './feedback-images';
  if (!existsSync(imageDir)) {
    mkdirSync(imageDir);
  }

  const downloadedPaths = [];

  for (let i = 0; i < imageUrls.length; i++) {
    const url = imageUrls[i];
    const filename = `feedback-${feedbackId}-${i + 1}.png`;
    const filepath = `${imageDir}/${filename}`;

    try {
      // Use curl with --ssl-no-revoke to handle certificate issues
      execSync(`curl --ssl-no-revoke -s -o "${filepath}" "${url}"`, {
        stdio: 'pipe'
      });
      downloadedPaths.push(filepath);
    } catch (error) {
      console.error(`  ⚠️  Failed to download image ${i + 1}: ${error.message}`);
    }
  }

  return downloadedPaths;
}

/**
 * List all feedback with queue status summary
 */
async function listAllFeedback() {
  console.log('\n📋 Feedback Queue Status\n');
  console.log('='.repeat(70));

  try {
    const snapshot = await db.collection('feedback')
      .orderBy('createdAt', 'desc')
      .get();

    if (snapshot.empty) {
      console.log('\n  No feedback found in the database.\n');
      return;
    }

    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Count by status (4 kanban columns)
    const counts = { new: 0, 'in-progress': 0, 'in-review': 0, archived: 0 };
    items.forEach(item => {
      const status = item.status || 'new';
      // Map legacy statuses to current ones
      if (status === 'resolved' || status === 'deferred') {
        counts.archived++;
      } else if (counts.hasOwnProperty(status)) {
        counts[status]++;
      } else {
        counts.new++; // Fallback for unknown statuses
      }
    });

    console.log(`\n  Queue: ${counts.new} new | ${counts['in-progress']} in progress | ${counts['in-review']} in review | ${counts.archived} archived\n`);
    console.log('─'.repeat(70));

    // Show unclaimed (new) items first
    const newItems = items.filter(i => i.status === 'new' || !i.status);
    const inProgressItems = items.filter(i => i.status === 'in-progress');
    const inReviewItems = items.filter(i => i.status === 'in-review');
    const archivedItems = items.filter(i =>
      i.status === 'archived' || i.status === 'resolved' || i.status === 'deferred'
    );

    if (newItems.length > 0) {
      console.log('\n  🆕 UNCLAIMED (ready to work on):\n');
      newItems.forEach((item, idx) => {
        const title = (item.title || 'No title').substring(0, 50);
        console.log(`     ${item.id.substring(0, 8)}... | ${item.type || 'N/A'} | ${title}${item.title?.length > 50 ? '...' : ''}`);
      });
    }

    if (inProgressItems.length > 0) {
      console.log('\n  🔄 IN PROGRESS (being worked on):\n');
      inProgressItems.forEach(item => {
        const title = (item.title || 'No title').substring(0, 50);
        const claimedAt = item.claimedAt?.toDate?.() ? item.claimedAt.toDate().toLocaleString() : 'Unknown';
        const isStale = item.claimedAt?.toDate?.() && (Date.now() - item.claimedAt.toDate().getTime()) > STALE_CLAIM_MS;
        console.log(`     ${item.id.substring(0, 8)}... | ${item.type || 'N/A'} | ${title}${item.title?.length > 50 ? '...' : ''}`);
        console.log(`       └─ Claimed: ${claimedAt}${isStale ? ' ⚠️ STALE' : ''}`);
      });
    }

    if (inReviewItems.length > 0) {
      console.log('\n  👁️ IN REVIEW (awaiting tester confirmation):\n');
      inReviewItems.forEach(item => {
        const title = (item.title || 'No title').substring(0, 50);
        console.log(`     ${item.id.substring(0, 8)}... | ${item.type || 'N/A'} | ${title}${item.title?.length > 50 ? '...' : ''}`);
      });
    }

    if (archivedItems.length > 0) {
      console.log('\n  📦 ARCHIVED:\n');
      archivedItems.slice(0, 5).forEach(item => {
        const title = (item.title || 'No title').substring(0, 50);
        const note = item.adminNotes ? ` - ${item.adminNotes.substring(0, 30)}${item.adminNotes.length > 30 ? '...' : ''}` : '';
        console.log(`     ${item.id.substring(0, 8)}... | ${item.type || 'N/A'} | ${title}${item.title?.length > 50 ? '...' : ''}${note}`);
      });
      if (archivedItems.length > 5) {
        console.log(`     ... and ${archivedItems.length - 5} more`);
      }
    }

    console.log('\n' + '='.repeat(70) + '\n');

  } catch (error) {
    console.error('\n  Error listing feedback:', error.message);
    throw error;
  }
}

/**
 * Claim the next available feedback item
 * Returns the item details for the agent to work on
 */
async function claimNextFeedback() {
  try {
    // First check if there's a stale in-progress item we should reclaim
    const staleSnapshot = await db.collection('feedback')
      .where('status', '==', 'in-progress')
      .get();

    let itemToClaim = null;
    let isReclaim = false;

    for (const doc of staleSnapshot.docs) {
      const data = doc.data();
      if (data.claimedAt?.toDate?.()) {
        const claimAge = Date.now() - data.claimedAt.toDate().getTime();
        if (claimAge > STALE_CLAIM_MS) {
          itemToClaim = { id: doc.id, ...data };
          isReclaim = true;
          break;
        }
      }
    }

    // If no stale items, get the highest priority "new" item
    // Priority order: no priority first (needs triage), then high, medium, low
    // Within same priority, oldest first
    if (!itemToClaim) {
      const newSnapshot = await db.collection('feedback')
        .where('status', '==', 'new')
        .get();

      if (!newSnapshot.empty) {
        // Sort by priority order, then by createdAt
        const priorityOrder = { '': 0, 'high': 1, 'medium': 2, 'low': 3 };
        const sortedItems = newSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => {
            const priorityA = priorityOrder[a.priority || ''] ?? 4;
            const priorityB = priorityOrder[b.priority || ''] ?? 4;
            if (priorityA !== priorityB) {
              return priorityA - priorityB;
            }
            // Within same priority, oldest first
            const timeA = a.createdAt?.toDate?.()?.getTime() || 0;
            const timeB = b.createdAt?.toDate?.()?.getTime() || 0;
            return timeA - timeB;
          });

        if (sortedItems.length > 0) {
          itemToClaim = sortedItems[0];
        }
      } else {
        // Also check items with no status field (legacy)
        const legacySnapshot = await db.collection('feedback')
          .orderBy('createdAt', 'asc')
          .get();

        const legacyItem = legacySnapshot.docs.find(doc => {
          const data = doc.data();
          return !data.status || data.status === 'new';
        });

        if (legacyItem) {
          itemToClaim = { id: legacyItem.id, ...legacyItem.data() };
        }
      }
    }

    if (!itemToClaim) {
      console.log('\n' + '='.repeat(70));
      console.log('\n  ✨ QUEUE EMPTY - No unclaimed feedback items!\n');
      console.log('  Run `node fetch-feedback.js list` to see all items.');
      console.log('\n' + '='.repeat(70) + '\n');
      return null;
    }

    // Claim the item (use hyphenated status to match UI)
    await db.collection('feedback').doc(itemToClaim.id).update({
      status: 'in-progress',
      claimedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Output the claimed item details
    const createdAt = itemToClaim.createdAt?.toDate?.()
      ? itemToClaim.createdAt.toDate().toLocaleString()
      : 'Unknown date';

    console.log('\n' + '='.repeat(70));
    console.log(`\n  ${isReclaim ? '🔄 RECLAIMED' : '🎯 CLAIMED'} FEEDBACK\n`);
    console.log('─'.repeat(70));
    console.log(`  ID: ${itemToClaim.id}`);
    console.log(`  Type: ${itemToClaim.type || 'N/A'}`);
    console.log(`  Priority: ${itemToClaim.priority || 'N/A'}`);
    console.log(`  User: ${itemToClaim.userDisplayName || itemToClaim.userEmail || 'Anonymous'}`);
    console.log(`  Created: ${createdAt}`);
    console.log('─'.repeat(70));
    console.log(`  Title: ${itemToClaim.title || 'No title'}`);
    console.log('─'.repeat(70));
    console.log(`  Description:\n`);
    console.log(`  ${itemToClaim.description || 'No description'}`);
    console.log('─'.repeat(70));
    console.log(`  Module: ${itemToClaim.capturedModule || itemToClaim.reportedModule || 'Unknown'}`);
    console.log(`  Tab: ${itemToClaim.capturedTab || itemToClaim.reportedTab || 'Unknown'}`);
    if (itemToClaim.adminNotes) {
      console.log('─'.repeat(70));
      console.log(`  Previous Notes: ${itemToClaim.adminNotes}`);
    }

    // Show subtasks if they exist
    if (itemToClaim.subtasks?.length > 0) {
      console.log('─'.repeat(70));
      const completed = itemToClaim.subtasks.filter(s => s.status === 'completed').length;
      console.log(`  📋 SUBTASKS (${completed}/${itemToClaim.subtasks.length} completed):\n`);
      itemToClaim.subtasks.forEach(s => {
        const statusIcon = s.status === 'completed' ? '✅' :
                          s.status === 'in-progress' ? '🔄' : '⬚';
        const deps = s.dependsOn?.length > 0 ? ` (depends: ${s.dependsOn.join(', ')})` : '';
        console.log(`     ${statusIcon} #${s.id} ${s.title}${deps}`);
      });

      // Find next available subtask (pending, with all dependencies completed)
      const nextSubtask = itemToClaim.subtasks.find(s => {
        if (s.status !== 'pending') return false;
        if (!s.dependsOn?.length) return true;
        return s.dependsOn.every(depId => {
          const dep = itemToClaim.subtasks.find(d => d.id === depId);
          return dep?.status === 'completed';
        });
      });

      if (nextSubtask) {
        console.log(`\n  ➡️ Next subtask: #${nextSubtask.id} ${nextSubtask.title}`);
      }
    }

    // Download and display images if they exist
    if (itemToClaim.imageUrls && itemToClaim.imageUrls.length > 0) {
      console.log('─'.repeat(70));
      console.log(`  📸 IMAGES (${itemToClaim.imageUrls.length}):\n`);

      const downloadedPaths = await downloadFeedbackImages(itemToClaim.id, itemToClaim.imageUrls);

      if (downloadedPaths.length > 0) {
        downloadedPaths.forEach((path, idx) => {
          console.log(`     [${idx + 1}] Downloaded to: ${path}`);
        });
        console.log(`\n  ✅ Images ready to view - use the Read tool on the paths above`);
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log(`\n  To resolve: node fetch-feedback.js ${itemToClaim.id} in-review "Your notes here"\n`);

    return itemToClaim;

  } catch (error) {
    console.error('\n  Error claiming feedback:', error.message);
    throw error;
  }
}

/**
 * Update feedback title by Firestore document ID
 */
async function updateFeedbackTitle(docId, title) {
  try {
    const docRef = db.collection('feedback').doc(docId);
    const doc = await docRef.get();

    if (!doc.exists) {
      console.log(`\n  ❌ Feedback not found: ${docId}\n`);
      return null;
    }

    await docRef.update({
      title: title,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('\n' + '='.repeat(70));
    console.log(`\n  ✅ TITLE UPDATED\n`);
    console.log('─'.repeat(70));
    console.log(`  ID: ${docId}`);
    console.log(`  New Title: ${title}`);
    console.log('\n' + '='.repeat(70) + '\n');

    return { id: docId, title };

  } catch (error) {
    console.error('\n  Error updating title:', error.message);
    throw error;
  }
}

/**
 * Update resolution notes
 */
async function updateResolutionNotes(docId, notes) {
  try {
    const docRef = db.collection('feedback').doc(docId);
    const doc = await docRef.get();

    if (!doc.exists) {
      console.log(`\n  ❌ Feedback not found: ${docId}\n`);
      return null;
    }

    await docRef.update({
      resolutionNotes: notes,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const item = doc.data();
    console.log('\n' + '='.repeat(70));
    console.log(`\n  ✅ RESOLUTION NOTES UPDATED\n`);
    console.log('─'.repeat(70));
    console.log(`  ID: ${docId}`);
    console.log(`  Title: ${item.title || 'No title'}`);
    console.log(`  Resolution Notes: ${notes}`);
    console.log('\n' + '='.repeat(70) + '\n');

    return { id: docId, resolutionNotes: notes };

  } catch (error) {
    console.error('\n  Error updating resolution notes:', error.message);
    throw error;
  }
}

/**
 * Update feedback status by Firestore document ID
 */
async function updateFeedbackById(docId, status, adminNotes) {
  try {
    const docRef = db.collection('feedback').doc(docId);
    const doc = await docRef.get();

    if (!doc.exists) {
      console.log(`\n  ❌ Feedback not found: ${docId}\n`);
      return null;
    }

    // Map common status aliases to correct format (4 valid statuses)
    const statusMap = {
      'in_progress': 'in-progress',
      'in_review': 'in-review',
      'inprogress': 'in-progress',
      'inreview': 'in-review',
      'resolved': 'archived',  // resolved is now archived
      'deferred': 'archived',  // deferred is now archived (use adminNotes to explain)
    };
    const normalizedStatus = statusMap[status] || status;

    // Validate status is one of the 5 valid values
    const validStatuses = ['new', 'in-progress', 'in-review', 'completed', 'archived'];
    if (!validStatuses.includes(normalizedStatus)) {
      console.log(`\n  ⚠️ Invalid status "${status}". Valid: ${validStatuses.join(', ')}\n`);
      return null;
    }

    const updateData = {
      status: normalizedStatus,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Clear claimedAt when archiving, completing, or moving to review
    if (['archived', 'completed', 'in-review'].includes(normalizedStatus)) {
      updateData.claimedAt = admin.firestore.FieldValue.delete();
    }
    if (normalizedStatus === 'archived') {
      updateData.resolvedAt = admin.firestore.FieldValue.serverTimestamp();
    }

    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    await docRef.update(updateData);

    const item = doc.data();
    console.log('\n' + '='.repeat(70));
    console.log(`\n  ✅ FEEDBACK UPDATED\n`);
    console.log('─'.repeat(70));
    console.log(`  ID: ${docId}`);
    console.log(`  Title: ${item.title || 'No title'}`);
    console.log(`  New Status: ${normalizedStatus}`);
    if (adminNotes) {
      console.log(`  Admin Notes: ${adminNotes}`);
    }
    console.log('\n' + '='.repeat(70) + '\n');

    return { id: docId, ...item };

  } catch (error) {
    console.error('\n  Error updating feedback:', error.message);
    throw error;
  }
}

/**
 * Add a subtask to a feedback item
 */
async function addSubtask(docId, title, description, dependsOn = []) {
  try {
    const docRef = db.collection('feedback').doc(docId);
    const doc = await docRef.get();

    if (!doc.exists) {
      console.log(`\n  ❌ Feedback not found: ${docId}\n`);
      return null;
    }

    const item = doc.data();
    const subtasks = item.subtasks || [];

    // Generate a simple numeric ID
    const newId = String(subtasks.length + 1);

    const newSubtask = {
      id: newId,
      title,
      description,
      status: 'pending'
    };

    // Only add dependsOn if there are dependencies
    if (dependsOn.length > 0) {
      newSubtask.dependsOn = dependsOn;
    }

    subtasks.push(newSubtask);

    await docRef.update({
      subtasks,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('\n' + '='.repeat(70));
    console.log(`\n  ✅ SUBTASK ADDED\n`);
    console.log('─'.repeat(70));
    console.log(`  Feedback: ${item.title || docId}`);
    console.log(`  Subtask #${newId}: ${title}`);
    if (dependsOn.length > 0) {
      console.log(`  Depends on: ${dependsOn.join(', ')}`);
    }
    console.log('\n' + '='.repeat(70) + '\n');

    return newSubtask;

  } catch (error) {
    console.error('\n  Error adding subtask:', error.message);
    throw error;
  }
}

/**
 * Update subtask status
 */
async function updateSubtaskStatus(docId, subtaskId, status) {
  try {
    const docRef = db.collection('feedback').doc(docId);
    const doc = await docRef.get();

    if (!doc.exists) {
      console.log(`\n  ❌ Feedback not found: ${docId}\n`);
      return null;
    }

    const item = doc.data();
    const subtasks = item.subtasks || [];

    const subtaskIndex = subtasks.findIndex(s => s.id === subtaskId);
    if (subtaskIndex === -1) {
      console.log(`\n  ❌ Subtask not found: ${subtaskId}\n`);
      return null;
    }

    const validStatuses = ['pending', 'in-progress', 'completed'];
    if (!validStatuses.includes(status)) {
      console.log(`\n  ⚠️ Invalid subtask status. Valid: ${validStatuses.join(', ')}\n`);
      return null;
    }

    subtasks[subtaskIndex].status = status;
    if (status === 'completed') {
      subtasks[subtaskIndex].completedAt = new Date();
    }

    await docRef.update({
      subtasks,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Show progress
    const completed = subtasks.filter(s => s.status === 'completed').length;
    const total = subtasks.length;

    console.log('\n' + '='.repeat(70));
    console.log(`\n  ✅ SUBTASK UPDATED\n`);
    console.log('─'.repeat(70));
    console.log(`  Feedback: ${item.title || docId}`);
    console.log(`  Subtask #${subtaskId}: ${subtasks[subtaskIndex].title}`);
    console.log(`  New Status: ${status}`);
    console.log(`  Progress: ${completed}/${total} subtasks completed`);
    console.log('\n' + '='.repeat(70) + '\n');

    return subtasks[subtaskIndex];

  } catch (error) {
    console.error('\n  Error updating subtask:', error.message);
    throw error;
  }
}

/**
 * List subtasks for a feedback item
 */
async function listSubtasks(docId) {
  try {
    const doc = await db.collection('feedback').doc(docId).get();

    if (!doc.exists) {
      console.log(`\n  ❌ Feedback not found: ${docId}\n`);
      return null;
    }

    const item = { id: doc.id, ...doc.data() };
    const subtasks = item.subtasks || [];

    console.log('\n' + '='.repeat(70));
    console.log(`\n  📋 SUBTASKS for: ${item.title || docId}\n`);
    console.log('─'.repeat(70));

    if (subtasks.length === 0) {
      console.log('  No subtasks defined.\n');
    } else {
      const completed = subtasks.filter(s => s.status === 'completed').length;
      console.log(`  Progress: ${completed}/${subtasks.length} completed\n`);

      subtasks.forEach(s => {
        const statusIcon = s.status === 'completed' ? '✅' :
                          s.status === 'in-progress' ? '🔄' : '⬚';
        const deps = s.dependsOn?.length > 0 ? ` (depends: ${s.dependsOn.join(', ')})` : '';
        console.log(`  ${statusIcon} #${s.id} ${s.title}${deps}`);
        console.log(`     ${s.description.substring(0, 70)}${s.description.length > 70 ? '...' : ''}`);
      });
    }

    console.log('\n' + '='.repeat(70) + '\n');

    return subtasks;

  } catch (error) {
    console.error('\n  Error listing subtasks:', error.message);
    throw error;
  }
}

/**
 * Delete a feedback item
 */
async function deleteFeedback(docId) {
  try {
    const docRef = db.collection('feedback').doc(docId);
    const doc = await docRef.get();

    if (!doc.exists) {
      console.log(`\n  ❌ Feedback not found: ${docId}\n`);
      return null;
    }

    const item = doc.data();
    await docRef.delete();

    console.log('\n' + '='.repeat(70));
    console.log(`\n  🗑️ FEEDBACK DELETED\n`);
    console.log('─'.repeat(70));
    console.log(`  ID: ${docId}`);
    console.log(`  Title: ${item.title || 'No title'}`);
    console.log('\n' + '='.repeat(70) + '\n');

    return { id: docId, deleted: true };

  } catch (error) {
    console.error('\n  Error deleting feedback:', error.message);
    throw error;
  }
}

/**
 * Get feedback by Firestore document ID
 */
async function getFeedbackById(docId) {
  try {
    const doc = await db.collection('feedback').doc(docId).get();

    if (!doc.exists) {
      console.log(`\n  ❌ Feedback not found: ${docId}\n`);
      return null;
    }

    const item = { id: doc.id, ...doc.data() };
    const createdAt = item.createdAt?.toDate?.()
      ? item.createdAt.toDate().toLocaleString()
      : 'Unknown date';

    console.log('\n' + '='.repeat(70));
    console.log(`\n  FEEDBACK DETAILS\n`);
    console.log('─'.repeat(70));
    console.log(`  ID: ${item.id}`);
    console.log(`  Type: ${item.type || 'N/A'}`);
    console.log(`  Status: ${item.status || 'new'}`);
    console.log(`  Priority: ${item.priority || 'N/A'}`);
    console.log(`  User: ${item.userDisplayName || item.userEmail || 'Anonymous'}`);
    console.log(`  Created: ${createdAt}`);
    console.log('─'.repeat(70));
    console.log(`  Title: ${item.title || 'No title'}`);
    console.log('─'.repeat(70));
    console.log(`  Description:\n`);
    console.log(`  ${item.description || 'No description'}`);
    console.log('─'.repeat(70));
    console.log(`  Module: ${item.capturedModule || item.reportedModule || 'Unknown'}`);
    console.log(`  Tab: ${item.capturedTab || item.reportedTab || 'Unknown'}`);
    if (item.adminNotes) {
      console.log('─'.repeat(70));
      console.log(`  Admin Notes: ${item.adminNotes}`);
    }

    // Show subtasks if they exist
    if (item.subtasks?.length > 0) {
      console.log('─'.repeat(70));
      const completed = item.subtasks.filter(s => s.status === 'completed').length;
      console.log(`  📋 SUBTASKS (${completed}/${item.subtasks.length} completed):\n`);
      item.subtasks.forEach(s => {
        const statusIcon = s.status === 'completed' ? '✅' :
                          s.status === 'in-progress' ? '🔄' : '⬚';
        const deps = s.dependsOn?.length > 0 ? ` (depends: ${s.dependsOn.join(', ')})` : '';
        console.log(`     ${statusIcon} #${s.id} ${s.title}${deps}`);
        console.log(`        ${s.description.substring(0, 60)}${s.description.length > 60 ? '...' : ''}`);
      });
    }

    // Download and display images if they exist
    if (item.imageUrls && item.imageUrls.length > 0) {
      console.log('─'.repeat(70));
      console.log(`  📸 IMAGES (${item.imageUrls.length}):\n`);

      const downloadedPaths = await downloadFeedbackImages(item.id, item.imageUrls);

      if (downloadedPaths.length > 0) {
        downloadedPaths.forEach((path, idx) => {
          console.log(`     [${idx + 1}] Downloaded to: ${path}`);
        });
        console.log(`\n  ✅ Images ready to view - use the Read tool on the paths above`);
      }
    }

    console.log('\n' + '='.repeat(70) + '\n');

    return item;

  } catch (error) {
    console.error('\n  Error fetching feedback:', error.message);
    throw error;
  }
}

/**
 * Defer feedback until a specific date
 */
async function deferFeedback(docId, deferUntilDate, reason) {
  try {
    const feedbackRef = db.collection('feedback').doc(docId);
    const doc = await feedbackRef.get();

    if (!doc.exists) {
      console.log(`\n  ❌ Feedback item ${docId} not found.\n`);
      return;
    }

    // Parse date (YYYY-MM-DD format)
    const parsedDate = new Date(deferUntilDate);
    if (isNaN(parsedDate.getTime())) {
      console.log(`\n  ❌ Invalid date format. Use YYYY-MM-DD (e.g., 2026-03-15)\n`);
      return;
    }

    // Set to end of day
    parsedDate.setHours(23, 59, 59, 999);

    await feedbackRef.update({
      status: 'archived',
      deferredUntil: admin.firestore.Timestamp.fromDate(parsedDate),
      adminNotes: reason || `Deferred until ${deferUntilDate}`,
      archivedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('\n' + '='.repeat(70));
    console.log(`\n  ⏰ DEFERRED until ${deferUntilDate}`);
    console.log(`\n  Item: ${docId}`);
    console.log(`  Reason: ${reason || 'No reason provided'}`);
    console.log(`\n  📌 This item will auto-reactivate on ${deferUntilDate}`);
    console.log(`     Run 'node scripts/reactivate-deferred.js' manually`);
    console.log(`     or wait for daily cron job to run.`);
    console.log('\n' + '='.repeat(70) + '\n');

  } catch (error) {
    console.error('\n  Error deferring feedback:', error.message);
    throw error;
  }
}

/**
 * Update feedback priority
 */
async function updateFeedbackPriority(docId, priority) {
  const validPriorities = ['low', 'medium', 'high'];
  if (!validPriorities.includes(priority)) {
    console.log(`\n  ⚠️ Invalid priority "${priority}". Valid: ${validPriorities.join(', ')}\n`);
    return null;
  }

  try {
    const docRef = db.collection('feedback').doc(docId);
    const doc = await docRef.get();

    if (!doc.exists) {
      console.log(`\n  ❌ Feedback not found: ${docId}\n`);
      return null;
    }

    await docRef.update({
      priority: priority,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const item = doc.data();
    console.log('\n' + '='.repeat(70));
    console.log(`\n  ✅ PRIORITY UPDATED\n`);
    console.log('─'.repeat(70));
    console.log(`  ID: ${docId}`);
    console.log(`  Title: ${item.title || 'No title'}`);
    console.log(`  Priority: ${priority.toUpperCase()}`);
    console.log('\n' + '='.repeat(70) + '\n');

    return { id: docId, priority };

  } catch (error) {
    console.error('\n  Error updating priority:', error.message);
    throw error;
  }
}

/**
 * Auto-prioritize feedback items based on type and description keywords
 * Priority rules:
 * - HIGH: bugs, crashes, data loss, security, blocking issues, "can't", "broken", "error"
 * - MEDIUM: core features, important UX issues, "should", "need", "want"
 * - LOW: polish, cosmetic, nice-to-haves, "could", "maybe", "minor"
 */
async function prioritizeFeedback(dryRun = false) {
  try {
    // Fetch all "new" items without a priority
    const snapshot = await db.collection('feedback')
      .where('status', '==', 'new')
      .get();

    const unprioritized = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(item => !item.priority);

    if (unprioritized.length === 0) {
      console.log('\n' + '='.repeat(70));
      console.log('\n  ✨ All feedback items already have priorities!\n');
      console.log('='.repeat(70) + '\n');
      return;
    }

    console.log('\n' + '='.repeat(70));
    console.log(`\n  🎯 AUTO-PRIORITIZING ${unprioritized.length} FEEDBACK ITEMS\n`);
    console.log('─'.repeat(70));

    // Keywords for priority detection
    const highKeywords = [
      'crash', 'broken', 'error', 'bug', 'fail', 'can\'t', 'cannot', 'doesn\'t work',
      'won\'t', 'stuck', 'freeze', 'hang', 'data loss', 'security', 'blocking',
      'urgent', 'critical', 'severe', 'major', 'unusable', 'impossible'
    ];
    const lowKeywords = [
      'could', 'maybe', 'minor', 'small', 'cosmetic', 'polish', 'nice to have',
      'nitpick', 'suggestion', 'idea', 'would be nice', 'eventually', 'someday',
      'tweak', 'slightly', 'little'
    ];

    const results = { high: [], medium: [], low: [] };

    for (const item of unprioritized) {
      const text = `${item.description || ''} ${item.title || ''}`.toLowerCase();
      const type = item.type || 'general';

      let priority = 'medium'; // Default

      // Type-based priority
      if (type === 'bug') {
        priority = 'high'; // Bugs start as high
      }

      // Keyword overrides
      const hasHighKeyword = highKeywords.some(kw => text.includes(kw));
      const hasLowKeyword = lowKeywords.some(kw => text.includes(kw));

      if (hasHighKeyword) {
        priority = 'high';
      } else if (hasLowKeyword && type !== 'bug') {
        priority = 'low';
      }

      // Feature requests without urgency keywords are medium
      if (type === 'feature' && !hasHighKeyword && !hasLowKeyword) {
        priority = 'medium';
      }

      // Enhancements are typically medium-low
      if (type === 'enhancement' && !hasHighKeyword) {
        priority = hasLowKeyword ? 'low' : 'medium';
      }

      // General feedback without keywords is low
      if (type === 'general' && !hasHighKeyword) {
        priority = 'low';
      }

      results[priority].push(item);

      const title = (item.title || item.description?.substring(0, 40) || 'Untitled').substring(0, 45);
      const icon = priority === 'high' ? '🔴' : priority === 'medium' ? '🟡' : '🟢';
      console.log(`  ${icon} ${priority.toUpperCase().padEnd(6)} | ${item.type?.padEnd(11) || 'general    '} | ${title}${title.length >= 45 ? '...' : ''}`);

      if (!dryRun) {
        await db.collection('feedback').doc(item.id).update({
          priority,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }

    console.log('\n' + '─'.repeat(70));
    console.log(`\n  Summary: ${results.high.length} high | ${results.medium.length} medium | ${results.low.length} low`);

    if (dryRun) {
      console.log('\n  ⚠️  DRY RUN - No changes made. Run without --dry-run to apply.');
    } else {
      console.log('\n  ✅ All items prioritized!');
    }

    console.log('\n' + '='.repeat(70) + '\n');

    return results;

  } catch (error) {
    console.error('\n  Error prioritizing feedback:', error.message);
    throw error;
  }
}

/**
 * Mark feedback as internal-only (excluded from user-facing changelog)
 */
async function setInternalOnly(docId, isInternalOnly) {
  try {
    const feedbackRef = db.collection('feedback').doc(docId);
    const doc = await feedbackRef.get();

    if (!doc.exists) {
      console.log(`\n  ❌ Feedback item ${docId} not found.\n`);
      return;
    }

    const value = isInternalOnly === 'true' || isInternalOnly === true;

    await feedbackRef.update({
      isInternalOnly: value
    });

    const item = doc.data();
    console.log('\n' + '='.repeat(70));
    console.log(`\n  ✅ UPDATED`);
    console.log(`\n  Item: ${item.title || docId}`);
    console.log(`  Internal Only: ${value ? 'YES (excluded from user changelog)' : 'NO (included in user changelog)'}`);
    console.log('\n' + '='.repeat(70) + '\n');

  } catch (error) {
    console.error('\n  Error updating feedback:', error.message);
    throw error;
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

async function main() {
  if (args.length === 0) {
    // No args: claim next item
    await claimNextFeedback();
  } else if (args[0] === 'list') {
    // List all feedback
    await listAllFeedback();
  } else if (args[0] === 'delete') {
    // Delete: delete <id>
    if (!args[1]) {
      console.log('\n  Usage: node fetch-feedback.js delete <id>\n');
      return;
    }
    await deleteFeedback(args[1]);
  } else if (args[0] === 'prioritize') {
    // Auto-prioritize all unprioritized feedback
    const dryRun = args.includes('--dry-run');
    await prioritizeFeedback(dryRun);
  } else if (args[0] === 'create') {
    // Create new feedback: create "title" "description" [type] [module] [tab]
    const title = args[1];
    const description = args[2];
    const type = args[3] || 'enhancement';
    const module = args[4] || 'Unknown';
    const tab = args[5] || 'Unknown';

    if (!title || !description) {
      console.log('\n  Usage: node fetch-feedback.js create "title" "description" [type] [module] [tab]');
      console.log('  Types: bug, feature, enhancement, general');
      console.log('  Example: node fetch-feedback.js create "Fix trail jank" "Trails appear janky..." enhancement compose playback\n');
      return;
    }

    const docRef = await db.collection('feedback').add({
      title,
      content: description,
      type,
      module,
      tab,
      status: 'new',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      userName: 'Claude Agent',
      userId: 'claude-agent'
    });

    console.log('\n======================================================================');
    console.log('\n  ✅ FEEDBACK CREATED\n');
    console.log('──────────────────────────────────────────────────────────────────────');
    console.log(`  ID: ${docRef.id}`);
    console.log(`  Title: ${title}`);
    console.log(`  Type: ${type}`);
    console.log(`  Module: ${module} / ${tab}`);
    console.log('\n======================================================================\n');
  } else if (args[1] === 'defer') {
    // Defer: <id> defer "YYYY-MM-DD" "Reason"
    if (!args[2]) {
      console.log('\n  Usage: node fetch-feedback.js <id> defer "YYYY-MM-DD" "Reason"\n');
      console.log('  Example: node fetch-feedback.js abc123 defer "2026-03-15" "Revisit after Q1"\n');
      return;
    }
    await deferFeedback(args[0], args[2], args[3]);
  } else if (args[1] === 'internal-only') {
    // Internal-only: <id> internal-only true/false
    if (!args[2]) {
      console.log('\n  Usage: node fetch-feedback.js <id> internal-only true/false\n');
      console.log('  Example: node fetch-feedback.js abc123 internal-only true\n');
      return;
    }
    await setInternalOnly(args[0], args[2]);
  } else if (args[1] === 'title') {
    // Update title: <id> title "new title"
    await updateFeedbackTitle(args[0], args[2]);
  } else if (args[1] === 'priority') {
    // Update priority: <id> priority <low|medium|high>
    await updateFeedbackPriority(args[0], args[2]);
  } else if (args[1] === 'resolution') {
    // Update resolution notes: <id> resolution "resolution notes"
    await updateResolutionNotes(args[0], args[2]);
  } else if (args[1] === 'subtask') {
    // Subtask commands: <id> subtask <command> [args...]
    const docId = args[0];
    const subCommand = args[2];

    if (subCommand === 'add') {
      // <id> subtask add "title" "description" [dependsOn...]
      const title = args[3];
      const description = args[4];
      const dependsOn = args.slice(5); // Remaining args are dependency IDs
      if (!title || !description) {
        console.log('\n  Usage: node fetch-feedback.js <id> subtask add "title" "description" [dependsOn...]\n');
        return;
      }
      await addSubtask(docId, title, description, dependsOn);
    } else if (subCommand === 'list') {
      // <id> subtask list
      await listSubtasks(docId);
    } else if (subCommand) {
      // <id> subtask <subtaskId> <status>
      // e.g., <id> subtask 1 completed
      const subtaskId = subCommand;
      const status = args[3];
      if (!status) {
        console.log('\n  Usage: node fetch-feedback.js <id> subtask <subtaskId> <status>\n');
        console.log('  Valid statuses: pending, in-progress, completed\n');
        return;
      }
      await updateSubtaskStatus(docId, subtaskId, status);
    } else {
      console.log('\n  Subtask commands:');
      console.log('    <id> subtask add "title" "description" [dependsOn...]');
      console.log('    <id> subtask list');
      console.log('    <id> subtask <subtaskId> <status>\n');
    }
  } else if (args[1]) {
    // Update: <id> <status> ["notes"]
    await updateFeedbackById(args[0], args[1], args[2]);
  } else {
    // View specific item by ID
    await getFeedbackById(args[0]);
  }
}

main()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
