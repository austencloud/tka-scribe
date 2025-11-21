const fs = require('fs');

const data = JSON.parse(fs.readFileSync('eslint-current-results.json', 'utf8'));

const warnings = [];
const ruleCount = {};

data.forEach(file => {
  if (file.warningCount > 0) {
    file.messages.forEach(msg => {
      warnings.push({
        file: file.filePath.replace(/^F:\\_THE KINETIC ALPHABET\\_TKA-STUDIO\\/, ''),
        rule: msg.ruleId,
        line: msg.line,
        message: msg.message
      });
      ruleCount[msg.ruleId] = (ruleCount[msg.ruleId] || 0) + 1;
    });
  }
});

console.log('=== SUMMARY ===');
console.log('Total warnings:', warnings.length);
console.log('');
console.log('=== BY RULE ===');
Object.entries(ruleCount)
  .sort((a, b) => b[1] - a[1])
  .forEach(([rule, count]) => {
    console.log(`  ${rule}: ${count}`);
  });
console.log('');
console.log('=== FIRST 100 WARNINGS ===');
warnings.slice(0, 100).forEach((w, i) => {
  console.log(`${i + 1}. [${w.rule}] ${w.file}:${w.line}`);
  console.log(`   ${w.message}`);
});
