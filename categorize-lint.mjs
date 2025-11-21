import { readFileSync } from 'fs';

const data = JSON.parse(readFileSync('./eslint-output.json', 'utf8'));

// Separate errors and warnings
const allMessages = data.flatMap(f => f.messages.map(m => ({
  ...m,
  file: f.filePath.replace(/^.*\\src\\/, 'src/'),
  isError: m.severity === 2
})));

const errors = allMessages.filter(m => m.isError);
const warnings = allMessages.filter(m => !m.isError);

// Group errors by rule
const errorsByRule = errors.reduce((acc, e) => {
  if (!acc[e.ruleId]) acc[e.ruleId] = [];
  acc[e.ruleId].push(e);
  return acc;
}, {});

const sorted = Object.entries(errorsByRule).sort((a, b) => b[1].length - a[1].length);

console.log(`Total messages: ${allMessages.length}`);
console.log(`  Errors: ${errors.length}`);
console.log(`  Warnings: ${warnings.length}`);
console.log('\n=== ERROR BREAKDOWN ===\n');

sorted.forEach(([rule, items]) => {
  console.log(`${String(items.length).padStart(4)} - ${rule}`);
});

console.log('\n=== HIGH PRIORITY FIXES ===\n');

// Show critical errors that break functionality
const critical = [
  'no-undef',
  'svelte/valid-compile',
  'no-redeclare',
  '@typescript-eslint/no-unsafe-member-access'
].filter(rule => errorsByRule[rule]);

critical.forEach(rule => {
  const items = errorsByRule[rule] || [];
  console.log(`\n${rule} (${items.length} errors):`);
  items.slice(0, 5).forEach(item => {
    console.log(`  ${item.file}:${item.line} - ${item.message}`);
  });
  if (items.length > 5) {
    console.log(`  ... and ${items.length - 5} more`);
  }
});
