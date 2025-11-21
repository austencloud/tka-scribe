import { readFileSync } from 'fs';

const data = JSON.parse(readFileSync('./eslint-output.json', 'utf8'));
const errors = data.flatMap(f => f.messages.map(m => ({...m, file: f.filePath})));
const byRule = errors.reduce((acc, e) => {
  acc[e.ruleId] = (acc[e.ruleId] || 0) + 1;
  return acc;
}, {});
const sorted = Object.entries(byRule).sort((a, b) => b[1] - a[1]);

console.log('Total errors:', errors.length);
console.log('\nTop 20 error types:');
sorted.slice(0, 20).forEach(([rule, count]) => {
  console.log(`  ${String(count).padStart(4)} - ${rule}`);
});
