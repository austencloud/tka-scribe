import fs from 'fs';

const data = JSON.parse(fs.readFileSync('eslint-current-analysis.json', 'utf8'));
const errorCounts = {};

data.forEach(file => {
  file.messages.forEach(msg => {
    if (msg.severity === 2) { // errors only
      const rule = msg.ruleId || 'unknown';
      errorCounts[rule] = (errorCounts[rule] || 0) + 1;
    }
  });
});

const sorted = Object.entries(errorCounts).sort((a, b) => b[1] - a[1]);
console.log('ERROR BREAKDOWN:');
console.log('================');
sorted.forEach(([rule, count]) => {
  console.log(`${count.toString().padStart(4)} - ${rule}`);
});
console.log('================');
console.log(`TOTAL: ${sorted.reduce((sum, [_, count]) => sum + count, 0)} errors`);
