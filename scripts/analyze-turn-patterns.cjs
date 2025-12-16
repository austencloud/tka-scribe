/**
 * Analyze Turn Patterns from Gallery Sequences
 *
 * This script extracts turn patterns from all sequences in the gallery,
 * identifies common patterns, and generates templates based on real usage.
 */

const fs = require('fs');
const path = require('path');

// Read sequence index
const indexPath = path.join(__dirname, '../static/data/sequence-index.json');
const sequenceIndex = JSON.parse(fs.readFileSync(indexPath, 'utf8'));

console.log(`\n🔍 Analyzing ${sequenceIndex.totalSequences} sequences...\n`);

// Pattern storage
const patternsByLength = new Map(); // length -> Map<patternHash, count>
const turnHistogram = new Map(); // turnValue -> count
const patternExamples = new Map(); // patternHash -> { pattern, sequences[], count }

/**
 * Extract turn pattern from a sequence
 */
function extractTurnPattern(sequence) {
  if (!sequence.fullMetadata?.sequence) return null;

  // Filter out beat 0 (start position) and only get actual beats
  const beats = sequence.fullMetadata.sequence.filter(item => item.beat !== undefined && item.beat > 0);
  if (beats.length === 0) return null;

  const pattern = {
    beatCount: beats.length,
    entries: [],
    sequenceId: sequence.id,
    sequenceName: sequence.name,
    word: sequence.word
  };

  beats.forEach((beat, index) => {
    const blueTurns = beat.blue_attributes?.turns ?? null;
    const redTurns = beat.red_attributes?.turns ?? null;

    pattern.entries.push({
      beatIndex: index,
      blue: blueTurns,
      red: redTurns
    });

    // Track individual turn values
    if (blueTurns !== null) {
      turnHistogram.set(blueTurns, (turnHistogram.get(blueTurns) || 0) + 1);
    }
    if (redTurns !== null) {
      turnHistogram.set(redTurns, (turnHistogram.get(redTurns) || 0) + 1);
    }
  });

  return pattern;
}

/**
 * Create a hash for a turn pattern (ignoring sequence metadata)
 */
function hashPattern(pattern) {
  return pattern.entries
    .map(e => `${e.blue ?? 'x'}|${e.red ?? 'x'}`)
    .join(',');
}

/**
 * Check if pattern is symmetric (blue and red have same turns)
 */
function isSymmetric(pattern) {
  return pattern.entries.every(e => e.blue === e.red);
}

/**
 * Calculate pattern statistics
 */
function analyzePattern(pattern) {
  const turns = pattern.entries.flatMap(e => [e.blue, e.red]).filter(t => t !== null);
  const numericTurns = turns.filter(t => typeof t === 'number');
  const uniqueTurns = new Set(turns);
  const maxTurn = numericTurns.length > 0 ? Math.max(...numericTurns) : 0;
  const minTurn = numericTurns.length > 0 ? Math.min(...numericTurns) : 0;
  const avgTurn = numericTurns.length > 0 ? numericTurns.reduce((a, b) => a + b, 0) / numericTurns.length : 0;

  return {
    uniqueTurnCount: uniqueTurns.size,
    maxTurn,
    minTurn,
    avgTurn: avgTurn.toFixed(2),
    hasFloats: turns.includes('fl'),
    isSymmetric: isSymmetric(pattern)
  };
}

// Process all sequences
let processedCount = 0;
sequenceIndex.sequences.forEach(sequence => {
  const pattern = extractTurnPattern(sequence);
  if (!pattern) return;

  processedCount++;

  const hash = hashPattern(pattern);
  const length = pattern.beatCount;

  // Track by length
  if (!patternsByLength.has(length)) {
    patternsByLength.set(length, new Map());
  }
  const lengthPatterns = patternsByLength.get(length);

  if (!lengthPatterns.has(hash)) {
    lengthPatterns.set(hash, 0);
    patternExamples.set(hash, {
      pattern,
      sequences: [],
      count: 0,
      stats: analyzePattern(pattern)
    });
  }

  lengthPatterns.set(hash, lengthPatterns.get(hash) + 1);
  const example = patternExamples.get(hash);
  example.count++;
  example.sequences.push({
    id: sequence.id,
    name: sequence.name,
    word: sequence.word
  });
});

console.log(`✅ Processed ${processedCount} sequences with turn data\n`);

// ========== STATISTICS ==========

console.log('📊 TURN VALUE DISTRIBUTION');
console.log('═'.repeat(50));
const sortedTurns = Array.from(turnHistogram.entries()).sort((a, b) => b[1] - a[1]);
sortedTurns.forEach(([turn, count]) => {
  const percent = ((count / Array.from(turnHistogram.values()).reduce((a, b) => a + b, 0)) * 100).toFixed(1);
  console.log(`  ${String(turn).padEnd(4)} : ${count.toString().padStart(5)} occurrences (${percent}%)`);
});

console.log('\n📏 SEQUENCE LENGTHS');
console.log('═'.repeat(50));
const lengthCounts = new Map();
sequenceIndex.sequences.forEach(seq => {
  lengthCounts.set(seq.sequenceLength, (lengthCounts.get(seq.sequenceLength) || 0) + 1);
});
Array.from(lengthCounts.entries())
  .sort((a, b) => b[1] - a[1])
  .forEach(([length, count]) => {
    console.log(`  ${length.toString().padStart(2)} beats : ${count} sequences`);
  });

// ========== COMPLETE 8-BEAT BREAKDOWN ==========
console.log('\n\n' + '█'.repeat(70));
console.log('█  COMPLETE 8-BEAT PATTERN BREAKDOWN');
console.log('█'.repeat(70));

const eightBeatPatterns = patternsByLength.get(8) || new Map();
const all8Beat = Array.from(eightBeatPatterns.entries())
  .map(([hash, count]) => ({ hash, count, example: patternExamples.get(hash) }))
  .sort((a, b) => b.count - a.count);

console.log(`\nTotal 8-beat sequences: ${all8Beat.reduce((sum, p) => sum + p.count, 0)}`);
console.log(`Unique patterns: ${all8Beat.length}`);
console.log(`Patterns used multiple times: ${all8Beat.filter(p => p.count > 1).length}`);

console.log('\n--- ALL 8-BEAT PATTERNS (sorted by usage) ---\n');

all8Beat.forEach((p, index) => {
  const pattern = p.example.pattern.entries.map(e => `${e.blue ?? '_'}|${e.red ?? '_'}`).join(' ');
  const sym = p.example.stats.isSymmetric ? 'SYM' : 'ASYM';
  const flt = p.example.stats.hasFloats ? ' FL' : '';
  const words = p.example.sequences.map(s => s.word).join(', ');
  console.log(`${String(index + 1).padStart(2)}. [${String(p.count).padStart(2)}x] ${pattern}`);
  console.log(`    └─ max:${p.example.stats.maxTurn} avg:${p.example.stats.avgTurn} ${sym}${flt} | Words: ${words}`);
});

// ========== COMPLETE 16-BEAT BREAKDOWN ==========
console.log('\n\n' + '█'.repeat(70));
console.log('█  COMPLETE 16-BEAT PATTERN BREAKDOWN');
console.log('█'.repeat(70));

const sixteenBeatPatterns = patternsByLength.get(16) || new Map();
const all16Beat = Array.from(sixteenBeatPatterns.entries())
  .map(([hash, count]) => ({ hash, count, example: patternExamples.get(hash) }))
  .sort((a, b) => b.count - a.count);

console.log(`\nTotal 16-beat sequences: ${all16Beat.reduce((sum, p) => sum + p.count, 0)}`);
console.log(`Unique patterns: ${all16Beat.length}`);
console.log(`Patterns used multiple times: ${all16Beat.filter(p => p.count > 1).length}`);

console.log('\n--- ALL 16-BEAT PATTERNS (sorted by usage) ---\n');

all16Beat.forEach((p, index) => {
  const pattern = p.example.pattern.entries.map(e => `${e.blue ?? '_'}|${e.red ?? '_'}`).join(' ');
  const sym = p.example.stats.isSymmetric ? 'SYM' : 'ASYM';
  const flt = p.example.stats.hasFloats ? ' FL' : '';
  const words = p.example.sequences.slice(0, 3).map(s => s.word).join(', ');
  const more = p.example.sequences.length > 3 ? ` +${p.example.sequences.length - 3} more` : '';
  console.log(`${String(index + 1).padStart(3)}. [${String(p.count).padStart(2)}x] ${pattern}`);
  console.log(`     └─ max:${p.example.stats.maxTurn} avg:${p.example.stats.avgTurn} ${sym}${flt} | Words: ${words}${more}`);
});

// ========== OTHER LENGTHS ==========
console.log('\n\n' + '█'.repeat(70));
console.log('█  OTHER SEQUENCE LENGTHS');
console.log('█'.repeat(70));

const otherLengths = Array.from(patternsByLength.keys())
  .filter(len => len !== 8 && len !== 16)
  .sort((a, b) => a - b);

otherLengths.forEach(len => {
  const patterns = patternsByLength.get(len);
  const allPatterns = Array.from(patterns.entries())
    .map(([hash, count]) => ({ hash, count, example: patternExamples.get(hash) }))
    .sort((a, b) => b.count - a.count);

  console.log(`\n--- ${len}-BEAT PATTERNS (${allPatterns.length} unique, ${allPatterns.reduce((s, p) => s + p.count, 0)} total) ---`);

  // Only show first 5 for each length
  allPatterns.slice(0, 5).forEach((p, index) => {
    const pattern = p.example.pattern.entries.map(e => `${e.blue ?? '_'}|${e.red ?? '_'}`).join(' ');
    const sym = p.example.stats.isSymmetric ? 'SYM' : 'ASYM';
    const words = p.example.sequences.slice(0, 2).map(s => s.word).join(', ');
    console.log(`  ${index + 1}. [${p.count}x] max:${p.example.stats.maxTurn} ${sym} | ${words}`);
    console.log(`     ${pattern}`);
  });
  if (allPatterns.length > 5) {
    console.log(`  ... and ${allPatterns.length - 5} more patterns`);
  }
});

// ========== SUMMARY STATISTICS ==========
console.log('\n\n' + '█'.repeat(70));
console.log('█  PATTERN SUMMARY STATISTICS');
console.log('█'.repeat(70));

// 8-beat stats
const symmetric8 = all8Beat.filter(p => p.example.stats.isSymmetric).length;
const asymmetric8 = all8Beat.filter(p => !p.example.stats.isSymmetric).length;
const withFloats8 = all8Beat.filter(p => p.example.stats.hasFloats).length;
const maxTurnDist8 = {};
all8Beat.forEach(p => {
  const max = p.example.stats.maxTurn;
  maxTurnDist8[max] = (maxTurnDist8[max] || 0) + p.count;
});

console.log('\n8-BEAT STATISTICS:');
console.log(`  Symmetric patterns: ${symmetric8}/${all8Beat.length} (${((symmetric8/all8Beat.length)*100).toFixed(1)}%)`);
console.log(`  Asymmetric patterns: ${asymmetric8}/${all8Beat.length} (${((asymmetric8/all8Beat.length)*100).toFixed(1)}%)`);
console.log(`  Patterns with floats: ${withFloats8}`);
console.log(`  Max turn distribution (by sequence count):`);
Object.entries(maxTurnDist8).sort((a,b) => Number(a[0]) - Number(b[0])).forEach(([turn, count]) => {
  console.log(`    max=${turn}: ${count} sequences`);
});

// 16-beat stats
const symmetric16 = all16Beat.filter(p => p.example.stats.isSymmetric).length;
const asymmetric16 = all16Beat.filter(p => !p.example.stats.isSymmetric).length;
const withFloats16 = all16Beat.filter(p => p.example.stats.hasFloats).length;
const maxTurnDist16 = {};
all16Beat.forEach(p => {
  const max = p.example.stats.maxTurn;
  maxTurnDist16[max] = (maxTurnDist16[max] || 0) + p.count;
});

console.log('\n16-BEAT STATISTICS:');
console.log(`  Symmetric patterns: ${symmetric16}/${all16Beat.length} (${((symmetric16/all16Beat.length)*100).toFixed(1)}%)`);
console.log(`  Asymmetric patterns: ${asymmetric16}/${all16Beat.length} (${((asymmetric16/all16Beat.length)*100).toFixed(1)}%)`);
console.log(`  Patterns with floats: ${withFloats16}`);
console.log(`  Max turn distribution (by sequence count):`);
Object.entries(maxTurnDist16).sort((a,b) => Number(a[0]) - Number(b[0])).forEach(([turn, count]) => {
  console.log(`    max=${turn}: ${count} sequences`);
});

// ========== NOTABLE PATTERNS ==========
console.log('\n\n' + '█'.repeat(70));
console.log('█  NOTABLE PATTERNS FOR TEMPLATES');
console.log('█'.repeat(70));

console.log('\n🔥 Patterns with turns >= 2:');
const highTurnPatterns = Array.from(patternExamples.values())
  .filter(p => p.stats.maxTurn >= 2)
  .sort((a, b) => b.stats.maxTurn - a.stats.maxTurn || b.count - a.count);

highTurnPatterns.forEach(p => {
  const pattern = p.pattern.entries.map(e => `${e.blue ?? '_'}|${e.red ?? '_'}`).join(' ');
  console.log(`\n  "${p.sequences[0].word}" (${p.pattern.beatCount} beats, max:${p.stats.maxTurn})`);
  console.log(`  ${pattern}`);
});

console.log('\n\n🌊 Float Patterns:');
const floatPatterns = Array.from(patternExamples.values())
  .filter(p => p.stats.hasFloats)
  .sort((a, b) => b.count - a.count);

floatPatterns.forEach(p => {
  const pattern = p.pattern.entries.map(e => `${e.blue ?? '_'}|${e.red ?? '_'}`).join(' ');
  console.log(`\n  "${p.sequences[0].word}" (${p.pattern.beatCount} beats)`);
  console.log(`  ${pattern}`);
});

console.log('\n\n✅ Analysis complete!\n');
