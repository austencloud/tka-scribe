/**
 * Backfill GitHub Releases
 *
 * Creates GitHub releases for existing git tags that don't have releases yet.
 * Pulls changelog from Firestore version records if available, otherwise uses git tag message.
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
 * Get all git tags
 */
function getAllTags() {
  try {
    const output = execSync('git tag -l', { encoding: 'utf8' }).trim();
    return output ? output.split('\n') : [];
  } catch (error) {
    console.error('Error getting git tags:', error.message);
    return [];
  }
}

/**
 * Get existing GitHub releases
 */
function getExistingReleases() {
  try {
    const output = execSync('gh release list --limit 1000', { encoding: 'utf8' }).trim();
    if (!output) return [];

    return output.split('\n').map(line => {
      const parts = line.split('\t');
      return parts[0]; // First column is the tag
    });
  } catch (error) {
    console.error('Error getting GitHub releases:', error.message);
    return [];
  }
}

/**
 * Get version record from Firestore
 */
async function getVersionRecord(version) {
  try {
    const doc = await db.collection('versions').doc(version).get();
    return doc.exists ? doc.data() : null;
  } catch (error) {
    console.error(`Error getting version record for ${version}:`, error.message);
    return null;
  }
}

/**
 * Get git tag message
 */
function getTagMessage(tag) {
  try {
    const message = execSync(`git tag -l --format="%(contents)" ${tag}`, { encoding: 'utf8' }).trim();
    return message;
  } catch (error) {
    console.error(`Error getting tag message for ${tag}:`, error.message);
    return '';
  }
}

/**
 * Format changelog from Firestore version record
 */
function formatChangelogFromVersion(versionData) {
  const entries = versionData.changelogEntries || [];

  const fixed = entries.filter(e => e.category === 'fixed');
  const added = entries.filter(e => e.category === 'added');
  const improved = entries.filter(e => e.category === 'improved');

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

  return releaseNotes;
}

/**
 * Format release notes from git tag message
 */
function formatReleaseNotesFromTag(tagMessage) {
  // Parse the tag message and convert to markdown
  let notes = tagMessage;

  // If it looks like it already has a title line, skip it
  const lines = notes.split('\n');
  if (lines[0].startsWith('Release ')) {
    lines.shift();
    notes = lines.join('\n').trim();
  }

  return notes;
}

/**
 * Create GitHub release for a tag
 */
async function createReleaseForTag(tag) {
  console.log(`\n📦 Creating release for ${tag}...`);

  // Remove 'v' prefix for version lookup
  const version = tag.replace(/^v/, '');

  // Try to get version record from Firestore
  const versionData = await getVersionRecord(version);

  let releaseNotes = '';

  if (versionData) {
    console.log(`  ✓ Found version record in Firestore`);
    releaseNotes = formatChangelogFromVersion(versionData);
  } else {
    console.log(`  ⚠️  No version record in Firestore, using git tag message`);
    const tagMessage = getTagMessage(tag);
    releaseNotes = formatReleaseNotesFromTag(tagMessage);
  }

  releaseNotes += '\n\n---\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code)';

  // Write to temp file
  writeFileSync('.release-notes.tmp', releaseNotes);

  try {
    execSync(`gh release create ${tag} --title "${tag}" --notes-file .release-notes.tmp`, {
      stdio: 'inherit'
    });
    console.log(`  ✓ Created GitHub release for ${tag}`);
    return true;
  } catch (error) {
    console.error(`  ❌ Failed to create release for ${tag}:`, error.message);
    return false;
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
 * Main backfill function
 */
async function main() {
  console.log('🔍 Checking for tags without GitHub releases...\n');

  // Get all tags
  const allTags = getAllTags();
  console.log(`Found ${allTags.length} git tags`);

  if (allTags.length === 0) {
    console.log('No tags found. Nothing to backfill.');
    process.exit(0);
  }

  // Get existing releases
  const existingReleases = getExistingReleases();
  console.log(`Found ${existingReleases.length} existing GitHub releases`);

  // Find tags without releases
  const tagsToBackfill = allTags.filter(tag => !existingReleases.includes(tag));

  if (tagsToBackfill.length === 0) {
    console.log('\n✓ All tags already have GitHub releases!');
    process.exit(0);
  }

  console.log(`\n📋 Tags to backfill (${tagsToBackfill.length}):`);
  tagsToBackfill.forEach(tag => console.log(`  - ${tag}`));

  // Create releases
  let successCount = 0;
  for (const tag of tagsToBackfill) {
    const success = await createReleaseForTag(tag);
    if (success) successCount++;
  }

  console.log(`\n🎉 Backfill complete!`);
  console.log(`   Created ${successCount} of ${tagsToBackfill.length} releases`);
}

main().catch(error => {
  console.error('❌ Backfill failed:', error.message);
  process.exit(1);
});
