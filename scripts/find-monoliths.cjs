#!/usr/bin/env node

/**
 * Monolith Detection Script
 *
 * Identifies files that are candidates for decomposition based on:
 * - Line count (primary factor)
 * - Complexity indicators ($effect count, import count, function count)
 *
 * Usage:
 *   node scripts/find-monoliths.cjs              # Show top 20 monoliths
 *   node scripts/find-monoliths.cjs --all        # Show all files over threshold
 *   node scripts/find-monoliths.cjs --threshold 300  # Custom threshold
 *   node scripts/find-monoliths.cjs --type svelte    # Only .svelte files
 *   node scripts/find-monoliths.cjs --type ts        # Only .ts files
 *   node scripts/find-monoliths.cjs --include-audited  # Include audited files in results
 *
 * Claiming (for multi-agent coordination):
 *   node scripts/find-monoliths.cjs --claim <path>   # Claim a file to work on
 *   node scripts/find-monoliths.cjs --release <path> # Release a claim
 *   node scripts/find-monoliths.cjs --claims         # Show all active claims
 *   node scripts/find-monoliths.cjs --clear-expired  # Clear claims older than 2 hours
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SRC_DIR = path.join(__dirname, '..', 'src');
const DEFAULT_THRESHOLD = 300; // Files over this are worth reviewing
const MONOLITH_THRESHOLD = 600; // Likely has multiple responsibilities

/**
 * AUDITED ORCHESTRATORS
 *
 * Files that have been manually reviewed and are intentionally complex.
 * These are orchestrators that coordinate multiple services - their size
 * reflects their coordination role, not poor factoring.
 *
 * To add a file: include its path relative to src/ and the audit date.
 */
const AUDITED_FILES = {
  'lib/shared/animation-engine/components/AnimatorCanvas.svelte': {
    auditDate: '2025-12-26',
    reason: 'Orchestrator coordinating 11+ animation services. Logic lives in services, this file is reactive glue.',
    services: [
      'AnimatorCanvasInitializer',
      'AnimationRenderLoopService',
      'PropTextureService',
      'GlyphTextureService',
      'AnimationVisibilitySyncService',
      'TrailSettingsSyncService',
      'PropTypeChangeService',
      'SequenceCacheService',
      'GlyphTransitionService',
      'CanvasResizer',
      'AnimationPrecomputationService',
    ],
  },
};

// Scoring weights
const WEIGHTS = {
  lines: 1,           // Base score = line count
  effects: 15,        // Each $effect adds complexity
  imports: 2,         // Each import = dependency
  functions: 3,       // Each function = responsibility
  deriveds: 5,        // Each $derived = reactive complexity
};

// Claims configuration
const CLAIMS_FILE = path.join(__dirname, '..', '.monolith-claims.json');
const CLAIM_EXPIRY_MS = 2 * 60 * 60 * 1000; // 2 hours

/**
 * Read claims from file
 */
function readClaims() {
  try {
    if (fs.existsSync(CLAIMS_FILE)) {
      const data = fs.readFileSync(CLAIMS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Warning: Could not read claims file:', err.message);
  }
  return { claims: {} };
}

/**
 * Write claims to file
 */
function writeClaims(claimsData) {
  try {
    fs.writeFileSync(CLAIMS_FILE, JSON.stringify(claimsData, null, 2));
    return true;
  } catch (err) {
    console.error('Error writing claims file:', err.message);
    return false;
  }
}

/**
 * Check if a claim is expired
 */
function isExpired(claim) {
  const claimedAt = new Date(claim.claimedAt).getTime();
  return Date.now() - claimedAt > CLAIM_EXPIRY_MS;
}

/**
 * Normalize path for consistent keys (forward slashes, relative to src/)
 */
function normalizePath(filePath) {
  // Handle both absolute and relative paths
  let normalized = filePath;

  // If it's an absolute path, make it relative to src/
  if (path.isAbsolute(filePath)) {
    normalized = path.relative(SRC_DIR, filePath);
  }

  // Remove leading src/ or lib/ if present
  normalized = normalized.replace(/^src[\/\\]/, '');

  // Convert to forward slashes
  return normalized.replace(/\\/g, '/');
}

/**
 * Claim a file
 */
function claimFile(filePath) {
  const normalizedPath = normalizePath(filePath);
  const claimsData = readClaims();

  // Check if already claimed and not expired
  if (claimsData.claims[normalizedPath]) {
    const existing = claimsData.claims[normalizedPath];
    if (!isExpired(existing)) {
      console.log(`\n❌ File already claimed:`);
      console.log(`   Path: ${normalizedPath}`);
      console.log(`   Claimed at: ${existing.claimedAt}`);
      console.log(`   Status: ${existing.status}`);
      console.log(`\n   Use --release to free this claim if needed.\n`);
      return false;
    }
    // Claim is expired, will be overwritten
    console.log(`\n⏰ Previous claim expired, claiming file...\n`);
  }

  // Create new claim
  claimsData.claims[normalizedPath] = {
    claimedAt: new Date().toISOString(),
    status: 'in-progress',
    agentId: `agent-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  };

  if (writeClaims(claimsData)) {
    console.log(`\n✅ Claimed: ${normalizedPath}`);
    console.log(`   Status: in-progress`);
    console.log(`   Expires: ${new Date(Date.now() + CLAIM_EXPIRY_MS).toLocaleTimeString()}\n`);
    return true;
  }
  return false;
}

/**
 * Release a claim
 */
function releaseClaim(filePath) {
  const normalizedPath = normalizePath(filePath);
  const claimsData = readClaims();

  if (!claimsData.claims[normalizedPath]) {
    console.log(`\n⚠️  No claim found for: ${normalizedPath}\n`);
    return false;
  }

  delete claimsData.claims[normalizedPath];

  if (writeClaims(claimsData)) {
    console.log(`\n✅ Released claim: ${normalizedPath}\n`);
    return true;
  }
  return false;
}

/**
 * Show all active claims
 */
function showClaims() {
  const claimsData = readClaims();
  const claims = Object.entries(claimsData.claims);

  if (claims.length === 0) {
    console.log('\n📋 No active claims.\n');
    return;
  }

  console.log('\n📋 Active Claims:\n');

  let activeCount = 0;
  let expiredCount = 0;

  claims.forEach(([filePath, claim]) => {
    const expired = isExpired(claim);
    const icon = expired ? '⏰' : '🔒';
    const status = expired ? 'EXPIRED' : claim.status;

    if (expired) expiredCount++;
    else activeCount++;

    console.log(`${icon} ${filePath}`);
    console.log(`   Status: ${status}`);
    console.log(`   Claimed: ${new Date(claim.claimedAt).toLocaleString()}`);
    if (!expired) {
      const expiresIn = Math.round((CLAIM_EXPIRY_MS - (Date.now() - new Date(claim.claimedAt).getTime())) / 60000);
      console.log(`   Expires in: ${expiresIn} minutes`);
    }
    console.log('');
  });

  console.log(`Summary: ${activeCount} active, ${expiredCount} expired`);
  if (expiredCount > 0) {
    console.log(`Use --clear-expired to remove expired claims.\n`);
  }
}

/**
 * Clear expired claims
 */
function clearExpiredClaims() {
  const claimsData = readClaims();
  const before = Object.keys(claimsData.claims).length;

  for (const [filePath, claim] of Object.entries(claimsData.claims)) {
    if (isExpired(claim)) {
      delete claimsData.claims[filePath];
    }
  }

  const after = Object.keys(claimsData.claims).length;
  const removed = before - after;

  if (removed > 0) {
    writeClaims(claimsData);
    console.log(`\n🧹 Cleared ${removed} expired claim(s).\n`);
  } else {
    console.log('\n✨ No expired claims to clear.\n');
  }
}

/**
 * Get set of currently claimed (non-expired) file paths
 */
function getClaimedPaths() {
  const claimsData = readClaims();
  const claimed = new Set();

  for (const [filePath, claim] of Object.entries(claimsData.claims)) {
    if (!isExpired(claim)) {
      claimed.add(filePath);
    }
  }

  return claimed;
}

// Parse arguments
const args = process.argv.slice(2);
const showAll = args.includes('--all');
const includeAudited = args.includes('--include-audited');
const thresholdIdx = args.indexOf('--threshold');
const threshold = thresholdIdx !== -1 ? parseInt(args[thresholdIdx + 1]) : DEFAULT_THRESHOLD;
const typeIdx = args.indexOf('--type');
const fileType = typeIdx !== -1 ? args[typeIdx + 1] : null;
const limit = showAll ? Infinity : 20;

// Claim-related arguments
const claimIdx = args.indexOf('--claim');
const releaseIdx = args.indexOf('--release');
const showClaimsFlag = args.includes('--claims');
const clearExpiredFlag = args.includes('--clear-expired');

// Handle claim commands before main scan
if (showClaimsFlag) {
  showClaims();
  process.exit(0);
}

if (clearExpiredFlag) {
  clearExpiredClaims();
  process.exit(0);
}

if (claimIdx !== -1) {
  const pathToClaim = args[claimIdx + 1];
  if (!pathToClaim) {
    console.error('\n❌ Usage: --claim <file-path>\n');
    process.exit(1);
  }
  const success = claimFile(pathToClaim);
  process.exit(success ? 0 : 1);
}

if (releaseIdx !== -1) {
  const pathToRelease = args[releaseIdx + 1];
  if (!pathToRelease) {
    console.error('\n❌ Usage: --release <file-path>\n');
    process.exit(1);
  }
  const success = releaseClaim(pathToRelease);
  process.exit(success ? 0 : 1);
}

// File analysis
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const lineCount = lines.length;

  // Skip small files
  if (lineCount < threshold) return null;

  const relativePath = path.relative(SRC_DIR, filePath);
  // Normalize to forward slashes for cross-platform matching
  const normalizedPath = relativePath.replace(/\\/g, '/');

  // Check if file has been audited
  const auditInfo = AUDITED_FILES[normalizedPath];
  const isAudited = !!auditInfo;

  // Check if file is claimed
  const claimedPaths = getClaimedPaths();
  const isClaimed = claimedPaths.has(normalizedPath);

  // Count complexity indicators
  const effectCount = (content.match(/\$effect\s*\(/g) || []).length;
  const derivedCount = (content.match(/\$derived/g) || []).length;
  const importCount = (content.match(/^import\s/gm) || []).length;

  // Count functions (rough heuristic)
  const functionCount = (content.match(/(?:function\s+\w+|=>\s*{|\w+\s*\([^)]*\)\s*{)/g) || []).length;

  // Calculate score
  const score =
    lineCount * WEIGHTS.lines +
    effectCount * WEIGHTS.effects +
    derivedCount * WEIGHTS.deriveds +
    importCount * WEIGHTS.imports +
    functionCount * WEIGHTS.functions;

  // Determine severity
  let severity = 'candidate';
  if (lineCount >= MONOLITH_THRESHOLD) severity = 'monolith';
  if (lineCount >= 1000) severity = 'critical';
  if (isAudited) severity = 'audited';
  if (isClaimed) severity = 'claimed';

  return {
    path: relativePath,
    lines: lineCount,
    effects: effectCount,
    deriveds: derivedCount,
    imports: importCount,
    functions: functionCount,
    score,
    severity,
    isAudited,
    auditInfo,
    isClaimed,
  };
}

// Recursively find files
function findFiles(dir, extensions) {
  let results = [];

  try {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Skip node_modules, .git, etc.
        if (!item.startsWith('.') && item !== 'node_modules') {
          results = results.concat(findFiles(fullPath, extensions));
        }
      } else if (extensions.some(ext => item.endsWith(ext))) {
        results.push(fullPath);
      }
    }
  } catch (err) {
    // Skip unreadable directories
  }

  return results;
}

// Main
function main() {
  // Determine file extensions
  let extensions = ['.svelte', '.ts'];
  if (fileType === 'svelte') extensions = ['.svelte'];
  if (fileType === 'ts') extensions = ['.ts'];

  console.log('\n🔍 Scanning for monoliths...\n');
  console.log(`   Threshold: ${threshold} lines`);
  console.log(`   File types: ${extensions.join(', ')}`);
  if (!includeAudited) {
    console.log(`   Excluding: ${Object.keys(AUDITED_FILES).length} audited orchestrators`);
  }
  console.log('');

  // Find and analyze files
  const files = findFiles(SRC_DIR, extensions);
  const allAnalyses = files
    .map(analyzeFile)
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  // Separate audited files
  const auditedFiles = allAnalyses.filter(a => a.isAudited);
  const analyses = includeAudited
    ? allAnalyses
    : allAnalyses.filter(a => !a.isAudited);

  if (analyses.length === 0) {
    console.log('✅ No monoliths found above threshold!\n');
    if (auditedFiles.length > 0) {
      console.log(`   (${auditedFiles.length} audited orchestrators excluded)\n`);
    }
    return;
  }

  // Display results
  const toShow = analyses.slice(0, limit);

  console.log(`Found ${analyses.length} files over ${threshold} lines.\n`);
  console.log('┌─────────────────────────────────────────────────────────────────────────────────────────────────┐');
  console.log('│  #  │ Score │ Lines │ $eff │ $der │ Imp │ Func │ Severity  │ File                              │');
  console.log('├─────────────────────────────────────────────────────────────────────────────────────────────────┤');

  toShow.forEach((file, index) => {
    const severityIcon = {
      critical: '🔴',
      monolith: '🟠',
      candidate: '🟡',
      audited: '✅',
      claimed: '🔒',
    }[file.severity];

    const num = String(index + 1).padStart(3);
    const score = String(file.score).padStart(5);
    const lines = String(file.lines).padStart(5);
    const effects = String(file.effects).padStart(4);
    const deriveds = String(file.deriveds).padStart(4);
    const imports = String(file.imports).padStart(3);
    const funcs = String(file.functions).padStart(4);
    const severity = file.severity.padEnd(9);

    // Truncate long paths
    let displayPath = file.path;
    if (displayPath.length > 35) {
      displayPath = '...' + displayPath.slice(-32);
    }
    displayPath = displayPath.padEnd(35);

    console.log(`│ ${num} │ ${score} │ ${lines} │ ${effects} │ ${deriveds} │ ${imports} │ ${funcs} │ ${severityIcon} ${severity}│ ${displayPath}│`);
  });

  console.log('└─────────────────────────────────────────────────────────────────────────────────────────────────┘');

  // Summary
  const critical = analyses.filter(a => a.severity === 'critical').length;
  const monoliths = analyses.filter(a => a.severity === 'monolith').length;
  const candidates = analyses.filter(a => a.severity === 'candidate').length;
  const claimed = analyses.filter(a => a.severity === 'claimed').length;
  const audited = auditedFiles.length;

  console.log('\n📊 Summary:');
  console.log(`   🔴 Critical (1000+ lines): ${critical}`);
  console.log(`   🟠 Monolith (500+ lines):  ${monoliths}`);
  console.log(`   🟡 Candidate (${threshold}+ lines): ${candidates}`);
  if (claimed > 0) {
    console.log(`   🔒 Claimed (in progress):  ${claimed}`);
  }
  if (audited > 0 && !includeAudited) {
    console.log(`   ✅ Audited (excluded):     ${audited}`);
  }

  // Top recommendation - skip audited AND claimed files
  const availableToWork = toShow.filter(f => !f.isAudited && !f.isClaimed);
  if (availableToWork.length > 0) {
    const top = availableToWork[0];
    console.log('\n🎯 Top refactor candidate (available):');
    console.log(`   ${top.path}`);
    console.log(`   ${top.lines} lines, ${top.effects} $effects, ${top.imports} imports`);
    console.log(`   Score: ${top.score}`);
  } else if (toShow.length > 0) {
    console.log('\n⚠️  All top candidates are either audited or claimed.');
    console.log('   Use --claims to see active claims, or --include-audited to see audited files.');
  }

  // Show audited files summary if any
  if (auditedFiles.length > 0 && !includeAudited) {
    console.log('\n📋 Audited orchestrators (use --include-audited to show):');
    auditedFiles.forEach(f => {
      console.log(`   ✅ ${f.path} (${f.lines} lines, audited ${f.auditInfo.auditDate})`);
    });
  }

  console.log('');
}

main();
