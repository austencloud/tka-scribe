const fs = require('fs');
const results = JSON.parse(fs.readFileSync('./eslint-results.json', 'utf8'));

const warnings = [];
results.forEach(file => {
  file.messages.forEach(msg => {
    if (msg.ruleId === '@typescript-eslint/no-unsafe-assignment') {
      warnings.push({
        file: file.filePath.replace(/^.*[\\\/]src[\\\/]/, 'src/'),
        line: msg.line,
        col: msg.column,
        message: msg.message
      });
    }
  });
});

console.log('Total no-unsafe-assignment warnings:', warnings.length);
console.log('\nWarnings by file:');
warnings.forEach(w => {
  console.log(`${w.file}:${w.line}:${w.col} - ${w.message}`);
});
