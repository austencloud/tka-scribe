/**
 * Release Script
 *
 * Automates version releases with proper branch workflow:
 *
 * Branch Workflow:
 * 1. Verify you're on develop branch (or main with --from-main flag)
 * 2. Stash any uncommitted changes
 * 3. Switch to main branch
 * 4. Merge develop into main
 * 5. Create release commit and tag on main
 * 6. Push main and tags
 * 7. Switch back to develop
 * 8. Restore stashed changes
 *
 * Feedback Mode (preferred):
 * - Check completed feedback count
 * - Determine version number from feedback types
 * - Generate changelog from feedback items
 * - Archive feedback and create version record in Firestore
 *
 * Git History Mode (fallback):
 * - Parse commits since last tag
 * - Determine version from conventional commit types
 * - Generate changelog from commit messages
 * - Skip Firestore operations
 *
 * Usage:
 *   node scripts/release.js                    - Interactive flow
 *   node scripts/release.js -p                 - Quick preview (for /fb workflow)
 *   node scripts/release.js --preview          - Quick preview (same as -p)
 *   node scripts/release.js --dry-run          - Full preview with details
 *   node scripts/release.js --show-last        - Show what was in the last release
 *   node scripts/release.js --last             - Show what was in the last release (same as --show-last)
 *   node scripts/release.js --version 0.2.0    - Manual version
 *   node scripts/release.js --confirm          - Execute release (requires prior preview)
 *   node scripts/release.js --changelog file.json - Use custom changelog entries (user-friendly)
 *   node scripts/release.js --skip-announcement - Don't create the "What's New" popup
 *   node scripts/release.js --from-main        - Release directly from main (skip branch workflow)
 */

import admin from 'firebase-admin';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

// Load service account key
const serviceAccount = JSON.parse(
  readFileSync('./serviceAccountKey.json', 'utf8')
);

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

/**
 * Get completed feedback items ready for release
 */
async function getCompletedFeedback() {
  const snapshot = await db.collection('feedback')
    .where('status', '==', 'completed')
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

/**
 * Generate changelog entries from feedback items
 * @param {Array} items - All completed feedback items
 * @param {boolean} includeInternalOnly - Whether to include internal-only items (default: false)
 * @returns {Object} - { userFacing: [...], developerNotes: [...] }
 */
function generateChangelogFromFeedback(items, includeInternalOnly = false) {
  const userFacing = [];
  const developerNotes = [];

  items.forEach(item => {
    let category;
    switch (item.type) {
      case 'bug':
        category = 'fixed';
        break;
      case 'feature':
        category = 'added';
        break;
      default:
        category = 'improved';
    }

    let text = item.title || item.description?.substring(0, 100) || 'Untitled change';

    // Add appropriate prefix if not already present
    const lowerText = text.toLowerCase();
    if (category === 'fixed' && !lowerText.startsWith('fixed')) {
      text = 'Fixed ' + text.charAt(0).toLowerCase() + text.slice(1);
    } else if (category === 'added' && !lowerText.startsWith('added') && !lowerText.startsWith('new')) {
      text = 'Added ' + text.charAt(0).toLowerCase() + text.slice(1);
    }

    const entry = { category, text, feedbackId: item.id };

    // Separate user-facing from internal-only changes
    if (item.isInternalOnly) {
      developerNotes.push(entry);
    } else {
      userFacing.push(entry);
    }
  });

  return { userFacing, developerNotes };
}

/**
 * Get most recent git tag
 */
function getLatestTag() {
  try {
    const tag = execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();
    return tag.replace(/^v/, '');
  } catch (error) {
    // No tags exist
    return null;
  }
}

/**
 * Generate changelog entries from git commits since last tag
 */
function generateChangelogFromGitHistory() {
  const latestTag = getLatestTag();
  const range = latestTag ? `v${latestTag}..HEAD` : 'HEAD';

  try {
    const commits = execSync(`git log ${range} --pretty=format:"%s" --no-merges`, {
      encoding: 'utf8'
    }).trim();

    if (!commits) return [];

    return commits.split('\n').map(commit => {
      let category = 'improved';
      let text = commit;

      // Parse conventional commit format
      const fixMatch = commit.match(/^fix(\(.+?\))?:\s*(.+)/i);
      const featMatch = commit.match(/^feat(\(.+?\))?:\s*(.+)/i);
      const refactorMatch = commit.match(/^refactor(\(.+?\))?:\s*(.+)/i);
      const styleMatch = commit.match(/^style(\(.+?\))?:\s*(.+)/i);
      const choreMatch = commit.match(/^chore(\(.+?\))?:\s*(.+)/i);

      if (fixMatch) {
        category = 'fixed';
        text = fixMatch[2];
      } else if (featMatch) {
        category = 'added';
        text = featMatch[2];
      } else if (refactorMatch || styleMatch || choreMatch) {
        category = 'improved';
        text = refactorMatch?.[2] || styleMatch?.[2] || choreMatch?.[2] || text;
      }

      // Ensure proper capitalization
      text = text.charAt(0).toUpperCase() + text.slice(1);

      return { category, text, commit };
    });
  } catch (error) {
    console.error('Warning: Could not read git history:', error.message);
    return [];
  }
}

/**
 * Determine suggested version based on changelog entries
 *
 * Pre-1.0 versioning strategy:
 * - PATCH (0.1.x): Bug fixes and small improvements only
 * - MINOR (0.x.0): New features or significant changes
 *
 * Significant change indicators:
 * - New modules, major UI changes, architectural shifts
 * - Keywords: "new module", "major", "refactor", "redesign", "architecture"
 */
function suggestVersion(currentVersion, changelogEntries) {
  const parts = currentVersion.replace('-beta', '').split('.');
  const major = parseInt(parts[0]) || 0;
  const minor = parseInt(parts[1]) || 0;
  const patch = parseInt(parts[2]) || 0;

  // Check if any features exist
  const hasFeatures = changelogEntries.some(entry => entry.category === 'added');

  if (!hasFeatures) {
    // Only bugs/improvements → patch bump
    return `${major}.${minor}.${patch + 1}`;
  }

  // Analyze feature significance
  const significantKeywords = [
    'new module', 'major', 'refactor', 'redesign', 'architecture',
    'new tab', 'new feature set', 'migration', 'overhaul'
  ];

  const allChangeText = changelogEntries
    .map(e => e.text.toLowerCase())
    .join(' ');

  const hasSignificantChange = significantKeywords.some(keyword =>
    allChangeText.includes(keyword)
  );

  if (hasSignificantChange) {
    // Significant feature → minor bump
    return `${major}.${minor + 1}.0`;
  }

  // Regular features but not significant → patch bump
  // (avoids version inflation from small features)
  return `${major}.${minor}.${patch + 1}`;
}

/**
 * Get current version from package.json
 */
function getCurrentVersion() {
  const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));
  return packageJson.version;
}

/**
 * Update package.json version
 */
function updatePackageVersion(newVersion) {
  const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));
  packageJson.version = newVersion;
  writeFileSync('./package.json', JSON.stringify(packageJson, null, 2) + '\n');
}

/**
 * Prepare release in Firestore
 * (archives completed feedback and creates version record)
 */
async function prepareFirestoreRelease(version, changelogEntries, feedbackItems) {
  const batch = db.batch();

  // Calculate summary counts
  const summary = { bugs: 0, features: 0, general: 0 };
  feedbackItems.forEach(item => {
    if (item.type === 'bug') summary.bugs++;
    else if (item.type === 'feature') summary.features++;
    else summary.general++;
  });

  // Update all completed feedback items
  feedbackItems.forEach(item => {
    const ref = db.collection('feedback').doc(item.id);
    batch.update(ref, {
      fixedInVersion: version,
      status: 'archived',
      archivedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });

  // Create version document
  const versionRef = db.collection('versions').doc(version);
  batch.set(versionRef, {
    version,
    feedbackCount: feedbackItems.length,
    feedbackSummary: summary,
    changelogEntries,
    releasedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // Commit batch
  await batch.commit();
}

/**
 * Create a "What's New" announcement for the release
 * This will show as a popup to all users when they next open the app
 *
 * IMPORTANT: Deletes any previous "What's New" announcements first,
 * so users who haven't opened the app in a while only see the latest.
 */
async function createReleaseAnnouncement(version, changelogEntries, adminUserId) {
  // First, delete any existing "What's New" announcements
  const announcementsRef = db.collection('announcements');
  const existingSnapshot = await announcementsRef
    .where('title', '>=', "What's New in v")
    .where('title', '<', "What's New in w")
    .get();

  if (!existingSnapshot.empty) {
    const batch = db.batch();
    existingSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log(`  🗑️  Deleted ${existingSnapshot.docs.length} previous release announcement(s)`);
  }

  // Build a clean, simple message from changelog
  const fixed = changelogEntries.filter(e => e.category === 'fixed');
  const added = changelogEntries.filter(e => e.category === 'added');
  const improved = changelogEntries.filter(e => e.category === 'improved');

  let message = '';

  if (added.length > 0) {
    message += `**✨ New**\n`;
    added.slice(0, 3).forEach(e => {
      message += `• ${e.text}\n`;
    });
    if (added.length > 3) {
      message += `• +${added.length - 3} more\n`;
    }
    message += '\n';
  }

  if (fixed.length > 0) {
    message += `**🐛 Fixed**\n`;
    message += `• ${fixed.length} bug${fixed.length > 1 ? 's' : ''} squashed\n\n`;
  }

  if (improved.length > 0) {
    message += `**🔧 Improved**\n`;
    improved.slice(0, 2).forEach(e => {
      message += `• ${e.text}\n`;
    });
    message += '\n';
  }

  // Footer encouraging feedback
  message += `---\n\n`;
  message += `💬 **Your feedback shapes TKA Scribe.**\n`;
  message += `Found a bug? Have an idea? Let us know in the Feedback tab!`;

  // Create announcement document
  const newDoc = announcementsRef.doc();

  await newDoc.set({
    title: `What's New in v${version}`,
    message,
    severity: 'info',
    targetAudience: 'all',
    showAsModal: true,
    createdBy: adminUserId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    actionUrl: '/settings?tab=ReleaseNotes',
    actionLabel: 'View Full Release Notes'
  });

  return newDoc.id;
}

/**
 * Check git status
 */
function checkGitStatus() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    return status.trim();
  } catch (error) {
    return '';
  }
}

/**
 * Get current git branch
 */
function getCurrentBranch() {
  try {
    return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  } catch (error) {
    return null;
  }
}

/**
 * Switch to a git branch
 */
function switchToBranch(branch) {
  execSync(`git checkout ${branch}`, { stdio: 'inherit' });
}

/**
 * Merge a branch into current branch
 */
function mergeBranch(sourceBranch) {
  execSync(`git merge ${sourceBranch} --no-edit`, { stdio: 'inherit' });
}

/**
 * Stash changes if there are any
 * Returns true if changes were stashed
 */
function stashChanges() {
  const status = checkGitStatus();
  if (status) {
    execSync('git stash push -m "release-script-auto-stash"', { stdio: 'inherit' });
    return true;
  }
  return false;
}

/**
 * Pop stashed changes
 */
function popStash() {
  try {
    execSync('git stash pop', { stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️  Could not restore stashed changes automatically.');
    console.log('   Run "git stash pop" manually if needed.');
  }
}

/**
 * Push branch and tags to remote
 */
function pushToRemote(branch) {
  execSync(`git push origin ${branch}`, { stdio: 'inherit' });
  execSync('git push --tags', { stdio: 'inherit' });
}

/**
 * Create git commit and tag
 */
function createGitRelease(version, changelog) {
  // Stage package.json
  execSync('git add package.json', { stdio: 'inherit' });

  // Create commit message
  const changelogSummary = changelog
    .slice(0, 5)
    .map(e => `- ${e.text}`)
    .join('\n');

  const commitMessage = `chore(release): v${version}

${changelogSummary}${changelog.length > 5 ? '\n...' : ''}

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>`;

  // Create commit
  execSync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`, { stdio: 'inherit' });

  // Create annotated tag
  const tagMessage = changelog.map(e => `- ${e.text}`).join('\n');
  execSync(`git tag -a v${version} -m "Release v${version}\n\n${tagMessage}"`, { stdio: 'inherit' });
}

/**
 * Create GitHub release
 */
function createGitHubRelease(version, changelog) {
  // Format release notes
  const fixed = changelog.filter(e => e.category === 'fixed');
  const added = changelog.filter(e => e.category === 'added');
  const improved = changelog.filter(e => e.category === 'improved');

  let releaseNotes = '';

  if (fixed.length > 0) {
    releaseNotes += '## 🐛 Bug Fixes\n\n';
    fixed.forEach(e => {
      releaseNotes += `- ${e.text}\n`;
    });
    releaseNotes += '\n';
  }

  if (added.length > 0) {
    releaseNotes += '## ✨ New Features\n\n';
    added.forEach(e => {
      releaseNotes += `- ${e.text}\n`;
    });
    releaseNotes += '\n';
  }

  if (improved.length > 0) {
    releaseNotes += '## 🔧 Improvements\n\n';
    improved.forEach(e => {
      releaseNotes += `- ${e.text}\n`;
    });
    releaseNotes += '\n';
  }

  releaseNotes += '\n---\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code)';

  // Write release notes to temp file to handle special characters
  writeFileSync('.release-notes.tmp', releaseNotes);

  try {
    // Create GitHub release
    execSync(`gh release create v${version} --title "v${version}" --notes-file .release-notes.tmp`, {
      stdio: 'inherit'
    });
  } finally {
    // Clean up temp file
    try {
      execSync('rm .release-notes.tmp', { stdio: 'ignore' });
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

/**
 * Display changelog preview
 */
function displayChangelog(entries) {
  const fixed = entries.filter(e => e.category === 'fixed');
  const added = entries.filter(e => e.category === 'added');
  const improved = entries.filter(e => e.category === 'improved');

  console.log('\n📋 Changelog Preview:\n');

  if (fixed.length > 0) {
    console.log('  🐛 Fixed:');
    fixed.forEach(e => console.log(`     - ${e.text}`));
    console.log('');
  }

  if (added.length > 0) {
    console.log('  ✨ Added:');
    added.forEach(e => console.log(`     - ${e.text}`));
    console.log('');
  }

  if (improved.length > 0) {
    console.log('  🔧 Improved:');
    improved.forEach(e => console.log(`     - ${e.text}`));
    console.log('');
  }
}

/**
 * Show what was released in the last version
 */
async function showLastRelease() {
  console.log('📦 Last Release Summary\n');
  console.log('='.repeat(70));

  try {
    // Get latest version from git tags
    const latestTag = getLatestTag();

    if (!latestTag) {
      console.log('\n⚠️  No releases found.');
      console.log('   Create your first release with /release\n');
      return;
    }

    const version = latestTag;
    console.log(`\n🏷️  Version: v${version}\n`);

    // Get tag date and message
    try {
      const tagInfo = execSync(`git tag -l -n99 v${version}`, { encoding: 'utf8' }).trim();
      const tagDate = execSync(`git log -1 --format=%ai v${version}`, { encoding: 'utf8' }).trim();

      console.log(`📅 Released: ${tagDate}\n`);
    } catch (e) {
      // Ignore if we can't get tag info
    }

    // Query Firestore for feedback items fixed in this version
    const snapshot = await db.collection('feedback')
      .where('fixedInVersion', '==', version)
      .get();

    if (snapshot.empty) {
      console.log('⚠️  No feedback items found for this version in Firestore.');
      console.log('   This might be a git-only release.\n');

      // Show git tag message as fallback
      try {
        const tagMessage = execSync(`git tag -l -n99 v${version} | tail -n +2`, { encoding: 'utf8' }).trim();
        if (tagMessage) {
          console.log('📋 Release Notes:\n');
          console.log(tagMessage);
          console.log('');
        }
      } catch (e) {
        // Ignore
      }
      return;
    }

    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Group by type
    const bugs = items.filter(i => i.type === 'bug');
    const features = items.filter(i => i.type === 'feature');
    const general = items.filter(i => i.type === 'general');

    console.log(`✅ Shipped ${items.length} items:`);
    console.log(`   🐛 ${bugs.length} bug fixes`);
    console.log(`   ✨ ${features.length} new features`);
    console.log(`   🔧 ${general.length} improvements\n`);

    console.log('─'.repeat(70));

    // Show details
    if (bugs.length > 0) {
      console.log('\n🐛 Bug Fixes:\n');
      bugs.forEach(item => {
        const title = item.title || item.description?.substring(0, 60) || 'Untitled';
        console.log(`   • ${title}${item.title ? '' : '...'}`);
        if (item.id) {
          console.log(`     └─ ID: ${item.id.substring(0, 8)}...`);
        }
      });
    }

    if (features.length > 0) {
      console.log('\n✨ New Features:\n');
      features.forEach(item => {
        const title = item.title || item.description?.substring(0, 60) || 'Untitled';
        console.log(`   • ${title}${item.title ? '' : '...'}`);
        if (item.id) {
          console.log(`     └─ ID: ${item.id.substring(0, 8)}...`);
        }
      });
    }

    if (general.length > 0) {
      console.log('\n🔧 Improvements:\n');
      general.forEach(item => {
        const title = item.title || item.description?.substring(0, 60) || 'Untitled';
        console.log(`   • ${title}${item.title ? '' : '...'}`);
        if (item.id) {
          console.log(`     └─ ID: ${item.id.substring(0, 8)}...`);
        }
      });
    }

    console.log('\n' + '─'.repeat(70));
    console.log(`\n💡 View on GitHub: gh release view v${version}`);
    console.log(`💡 View in app: Settings → What's New tab\n`);

  } catch (error) {
    console.error('❌ Error fetching last release:', error.message);
    process.exit(1);
  }
}

/**
 * Main release flow
 */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const quickPreview = args.includes('--preview') || args.includes('-p');
  const showLast = args.includes('--show-last') || args.includes('--last');
  const manualVersionIndex = args.indexOf('--version');
  const manualVersion = manualVersionIndex >= 0 ? args[manualVersionIndex + 1] : null;
  const changelogFileIndex = args.indexOf('--changelog');
  const changelogFile = changelogFileIndex >= 0 ? args[changelogFileIndex + 1] : null;
  const skipAnnouncement = args.includes('--skip-announcement');
  const fromMain = args.includes('--from-main');

  // Admin user ID for announcement creation (defaults to Austen's ID)
  const ADMIN_USER_ID = 'PBp3GSBO6igCKPwJyLZNmVEmamI3'; // austencloud

  // Show last release mode
  if (showLast) {
    await showLastRelease();
    process.exit(0);
  }

  // Check current branch
  const startingBranch = getCurrentBranch();
  const isOnDevelop = startingBranch === 'develop';
  const isOnMain = startingBranch === 'main';

  // Quick preview mode - minimal output
  if (quickPreview) {
    console.log('🔍 Quick Release Preview\n');
  } else {
    console.log('📦 Starting release process...\n');
  }

  // Branch check (skip for preview modes)
  if (!dryRun && !quickPreview) {
    console.log(`🌿 Current branch: ${startingBranch}`);

    if (!isOnDevelop && !isOnMain) {
      console.error(`\n❌ You must be on 'develop' or 'main' to release.`);
      console.error(`   Currently on: ${startingBranch}`);
      console.error(`   Switch to develop: git checkout develop\n`);
      process.exit(1);
    }

    if (isOnMain && !fromMain) {
      console.log(`\n⚠️  You're on 'main' branch.`);
      console.log(`   Releases should typically be made from 'develop'.`);
      console.log(`   Add --from-main flag to release directly from main.\n`);
      process.exit(1);
    }

    if (isOnDevelop) {
      console.log(`   ✓ Will merge develop → main, then release on main\n`);
    }
  }

  // 1. Check completed feedback
  console.log('🔍 Checking completed feedback...');
  const feedbackItems = await getCompletedFeedback();

  let changelog;
  let useGitHistory = false;
  let useCustomChangelog = false;

  // Check if a custom changelog file was provided (user-friendly entries from Claude)
  if (changelogFile && existsSync(changelogFile)) {
    try {
      changelog = JSON.parse(readFileSync(changelogFile, 'utf8'));
      useCustomChangelog = true;
      console.log(`✓ Using custom changelog from ${changelogFile}`);
      console.log(`  (${changelog.length} user-friendly entries)\n`);
    } catch (error) {
      console.error(`❌ Failed to parse changelog file: ${error.message}`);
      process.exit(1);
    }
  } else if (feedbackItems.length === 0) {
    console.log('⚠️  No completed feedback found.');
    console.log('📝 Using git commit history instead...\n');

    changelog = generateChangelogFromGitHistory();

    if (changelog.length === 0) {
      console.error('❌ No commits found to release.');
      console.error('   Either:');
      console.error('   1. Complete some feedback items, or');
      console.error('   2. Make some commits to include in the release');
      process.exit(1);
    }

    useGitHistory = true;
    console.log(`✓ Found ${changelog.length} commits since last release\n`);
  } else {
    const { userFacing, developerNotes } = generateChangelogFromFeedback(feedbackItems);

    // Count user-facing items only for summary
    const summary = { bugs: 0, features: 0, general: 0 };
    feedbackItems.filter(item => !item.isInternalOnly).forEach(item => {
      if (item.type === 'bug') summary.bugs++;
      else if (item.type === 'feature') summary.features++;
      else summary.general++;
    });

    console.log(`✓ Found ${userFacing.length} completed items`);
    console.log(`  (${summary.bugs} bugs, ${summary.features} features, ${summary.general} general)\n`);

    if (developerNotes.length > 0) {
      console.log(`📝 ${developerNotes.length} internal-only items (excluded from user changelog)\n`);
    }

    // Use only user-facing items for changelog
    changelog = userFacing;
  }

  // 2. Determine version
  const currentVersion = getCurrentVersion();
  const suggestedVersion = manualVersion || suggestVersion(currentVersion, changelog);

  console.log(`📌 Current version: ${currentVersion}`);
  console.log(`📌 Suggested version: ${suggestedVersion}`);

  // Explain the bump type
  const parts = currentVersion.split('.');
  const currentMinor = parseInt(parts[1]) || 0;
  const suggestedParts = suggestedVersion.split('.');
  const suggestedMinor = parseInt(suggestedParts[1]) || 0;

  if (suggestedMinor > currentMinor) {
    console.log('   (minor bump - significant features detected)');
  } else {
    console.log('   (patch bump - regular changes)');
  }

  console.log('   💡 Override with: --version X.Y.Z');
  console.log('');

  // 3. Display changelog
  displayChangelog(changelog);

  // 4. Check git status
  const gitStatus = checkGitStatus();
  if (gitStatus) {
    console.log('⚠️  Warning: Working directory has uncommitted changes:');
    console.log(gitStatus.split('\n').map(line => `   ${line}`).join('\n'));
    console.log('');
  }

  if (dryRun || quickPreview) {
    if (quickPreview) {
      console.log('\n💡 Tip: Run /release to create this release interactively.');
    } else {
      console.log('🔍 Dry run complete. No changes made.');
    }
    process.exit(0);
  }

  // In actual use, Claude will handle confirmation via AskUserQuestion
  // For now, require --confirm flag
  if (!args.includes('--confirm')) {
    console.log('💡 This is a preview. Add --confirm to execute the release.');
    console.log('   Or use the /release slash command for interactive flow.');
    process.exit(0);
  }

  // 5. Execute release
  console.log('🚀 Executing release...\n');

  let didStash = false;

  // Branch workflow: stash, switch to main, merge develop
  if (isOnDevelop) {
    // Stash any uncommitted changes
    const gitStatus = checkGitStatus();
    if (gitStatus) {
      console.log('📦 Stashing uncommitted changes...');
      didStash = stashChanges();
    }

    // Switch to main
    console.log('🔀 Switching to main branch...');
    switchToBranch('main');

    // Pull latest main (in case remote has changes)
    try {
      console.log('⬇️  Pulling latest main...');
      execSync('git pull origin main --no-edit', { stdio: 'inherit' });
    } catch (error) {
      console.log('   (No remote changes or not connected)');
    }

    // Merge develop into main
    console.log('🔀 Merging develop → main...');
    mergeBranch('develop');
  }

  // Update package.json
  console.log('✓ Updating package.json...');
  updatePackageVersion(suggestedVersion);

  // Prepare Firestore (only if using feedback or custom changelog with feedback)
  if (!useGitHistory && feedbackItems.length > 0) {
    console.log('✓ Archiving feedback in Firestore...');
    // Use custom changelog entries if provided, otherwise use generated ones
    await prepareFirestoreRelease(suggestedVersion, changelog, feedbackItems);
  } else if (useGitHistory) {
    console.log('⏭️  Skipping Firestore operations (git history mode)');
  }

  // Create git commit and tag
  console.log('✓ Creating git commit and tag...');
  createGitRelease(suggestedVersion, changelog);

  // Push main branch and tags
  console.log('✓ Pushing to remote...');
  pushToRemote('main');

  // Create GitHub release
  console.log('✓ Creating GitHub release...');
  createGitHubRelease(suggestedVersion, changelog);

  // Create "What's New" announcement (unless skipped)
  if (!skipAnnouncement && !useGitHistory) {
    console.log('✓ Creating release announcement...');
    const announcementId = await createReleaseAnnouncement(suggestedVersion, changelog, ADMIN_USER_ID);
    console.log(`  📢 Announcement created: ${announcementId}`);
  } else if (skipAnnouncement) {
    console.log('⏭️  Skipping announcement (--skip-announcement)');
  }

  // Switch back to develop and restore stash
  if (isOnDevelop) {
    console.log('🔀 Switching back to develop...');
    switchToBranch('develop');

    // Merge main back to develop (so develop has the version bump)
    console.log('🔀 Syncing main → develop...');
    mergeBranch('main');

    // Push develop
    console.log('✓ Pushing develop...');
    execSync('git push origin develop', { stdio: 'inherit' });

    // Restore stashed changes
    if (didStash) {
      console.log('📦 Restoring stashed changes...');
      popStash();
    }
  }

  console.log(`\n🎉 Release v${suggestedVersion} complete!\n`);
  console.log('   Summary:');
  console.log(`   - Version: v${suggestedVersion}`);
  console.log(`   - Branch: main (tagged and pushed)`);
  console.log(`   - Current branch: ${isOnDevelop ? 'develop' : 'main'}`);
  console.log('');
  console.log('   View the release:');
  console.log(`   - GitHub: gh release view v${suggestedVersion}`);
  console.log('   - In app: Settings → What\'s New tab');
  console.log('');

  process.exit(0);
}

main().catch(error => {
  console.error('❌ Release failed:', error.message);
  process.exit(1);
});
