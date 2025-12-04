/**
 * Release Script
 *
 * Automates version releases with two modes:
 *
 * Feedback Mode (preferred):
 * 1. Check completed feedback count
 * 2. Determine version number from feedback types
 * 3. Generate changelog from feedback items
 * 4. Archive feedback and create version record in Firestore
 *
 * Git History Mode (fallback):
 * 1. Parse commits since last tag (or all commits if no tags)
 * 2. Determine version from conventional commit types (feat/fix/etc)
 * 3. Generate changelog from commit messages
 * 4. Skip Firestore operations
 *
 * Both modes:
 * - Show preview and get confirmation
 * - Update package.json
 * - Create git commit and tag
 *
 * Usage:
 *   node scripts/release.js                    - Interactive flow
 *   node scripts/release.js --version 0.2.0    - Manual version
 *   node scripts/release.js --dry-run          - Preview only
 *   node scripts/release.js --confirm          - Execute release (requires prior preview)
 */

import admin from 'firebase-admin';
import { readFileSync, writeFileSync } from 'fs';
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
 */
function generateChangelogFromFeedback(items) {
  return items.map(item => {
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

    return { category, text, feedbackId: item.id };
  });
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
 */
function suggestVersion(currentVersion, changelogEntries) {
  const parts = currentVersion.replace('-beta', '').split('.');
  const major = parseInt(parts[0]) || 0;
  const minor = parseInt(parts[1]) || 0;
  const patch = parseInt(parts[2]) || 0;

  // Check if any features (added category)
  const hasFeatures = changelogEntries.some(entry => entry.category === 'added');

  if (hasFeatures) {
    // Minor bump for features
    return `${major}.${minor + 1}.0`;
  } else {
    // Patch bump for bugs/improvements
    return `${major}.${minor}.${patch + 1}`;
  }
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
 * Main release flow
 */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const manualVersionIndex = args.indexOf('--version');
  const manualVersion = manualVersionIndex >= 0 ? args[manualVersionIndex + 1] : null;

  console.log('📦 Starting release process...\n');

  // 1. Check completed feedback
  console.log('🔍 Checking completed feedback...');
  const feedbackItems = await getCompletedFeedback();

  let changelog;
  let useGitHistory = false;

  if (feedbackItems.length === 0) {
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
    console.log(`✓ Found ${feedbackItems.length} completed items`);
    const summary = { bugs: 0, features: 0, general: 0 };
    feedbackItems.forEach(item => {
      if (item.type === 'bug') summary.bugs++;
      else if (item.type === 'feature') summary.features++;
      else summary.general++;
    });
    console.log(`  (${summary.bugs} bugs, ${summary.features} features, ${summary.general} general)\n`);

    changelog = generateChangelogFromFeedback(feedbackItems);
  }

  // 2. Determine version
  const currentVersion = getCurrentVersion();
  const suggestedVersion = manualVersion || suggestVersion(currentVersion, changelog);

  console.log(`📌 Current version: ${currentVersion}`);
  console.log(`📌 New version: ${suggestedVersion}`);

  if (changelog.some(entry => entry.category === 'added')) {
    console.log('   (minor bump due to features)');
  } else {
    console.log('   (patch bump)');
  }
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

  if (dryRun) {
    console.log('🔍 Dry run complete. No changes made.');
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

  // Update package.json
  console.log('✓ Updating package.json...');
  updatePackageVersion(suggestedVersion);

  // Prepare Firestore (only if using feedback)
  if (!useGitHistory) {
    console.log('✓ Archiving feedback in Firestore...');
    await prepareFirestoreRelease(suggestedVersion, changelog, feedbackItems);
  } else {
    console.log('⏭️  Skipping Firestore operations (git history mode)');
  }

  // Create git commit and tag
  console.log('✓ Creating git commit and tag...');
  createGitRelease(suggestedVersion, changelog);

  console.log(`\n🎉 Release v${suggestedVersion} complete!\n`);
  console.log('   Next steps:');
  console.log('   - Review the commit: git show');
  console.log('   - Push to remote: git push && git push --tags');
  console.log('');

  process.exit(0);
}

main().catch(error => {
  console.error('❌ Release failed:', error.message);
  process.exit(1);
});
