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
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SRC_DIR = path.join(__dirname, '..', 'src');
const DEFAULT_THRESHOLD = 300; // Files over this are worth reviewing
const MONOLITH_THRESHOLD = 600; // Likely has multiple responsibilities

// Scoring weights
const WEIGHTS = {
  lines: 1,           // Base score = line count
  effects: 15,        // Each $effect adds complexity
  imports: 2,         // Each import = dependency
  functions: 3,       // Each function = responsibility
  deriveds: 5,        // Each $derived = reactive complexity
};

// Parse arguments
const args = process.argv.slice(2);
const showAll = args.includes('--all');
const thresholdIdx = args.indexOf('--threshold');
const threshold = thresholdIdx !== -1 ? parseInt(args[thresholdIdx + 1]) : DEFAULT_THRESHOLD;
const typeIdx = args.indexOf('--type');
const fileType = typeIdx !== -1 ? args[typeIdx + 1] : null;
const limit = showAll ? Infinity : 20;

// File analysis
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const lineCount = lines.length;

  // Skip small files
  if (lineCount < threshold) return null;

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

  return {
    path: path.relative(SRC_DIR, filePath),
    lines: lineCount,
    effects: effectCount,
    deriveds: derivedCount,
    imports: importCount,
    functions: functionCount,
    score,
    severity,
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
  console.log('');

  // Find and analyze files
  const files = findFiles(SRC_DIR, extensions);
  const analyses = files
    .map(analyzeFile)
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  if (analyses.length === 0) {
    console.log('✅ No monoliths found above threshold!\n');
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

  console.log('\n📊 Summary:');
  console.log(`   🔴 Critical (1000+ lines): ${critical}`);
  console.log(`   🟠 Monolith (500+ lines):  ${monoliths}`);
  console.log(`   🟡 Candidate (${threshold}+ lines): ${candidates}`);

  // Top recommendation
  if (toShow.length > 0) {
    const top = toShow[0];
    console.log('\n🎯 Top refactor candidate:');
    console.log(`   ${top.path}`);
    console.log(`   ${top.lines} lines, ${top.effects} $effects, ${top.imports} imports`);
    console.log(`   Score: ${top.score}`);
  }

  console.log('');
}

main();
