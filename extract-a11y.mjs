import fs from 'fs';

const data = JSON.parse(fs.readFileSync('eslint-a11y-check.json', 'utf8'));
const a11yErrors = [];

data.forEach(file => {
  file.messages.forEach(msg => {
    if (msg.ruleId && (msg.ruleId.includes('a11y') || msg.ruleId.includes('svelte/no-at-html-tags'))) {
      a11yErrors.push({
        file: file.filePath.replace(/.*src\\/, 'src/').replace(/\\/g, '/'),
        line: msg.line,
        column: msg.column,
        rule: msg.ruleId,
        message: msg.message,
        severity: msg.severity === 2 ? 'error' : 'warning'
      });
    }
  });
});

console.log(JSON.stringify(a11yErrors, null, 2));
console.log('\n=== A11y Issues Summary ===');
console.log('Total a11y issues:', a11yErrors.length);
