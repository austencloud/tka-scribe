import { readFileSync } from 'fs';

const data = JSON.parse(readFileSync('./eslint-output.json', 'utf8'));
const errors = data.flatMap(f => f.messages
  .filter(m => m.ruleId === 'no-redeclare' && m.severity === 2)
  .map(m => ({
    file: f.filePath.replace(/^.*\\src\\/, 'src/'),
    line: m.line,
    message: m.message
  }))
);

console.log(`Found ${errors.length} no-redeclare errors:\n`);
errors.forEach((err, idx) => {
  console.log(`${idx + 1}. ${err.file}:${err.line}`);
  console.log(`   ${err.message}\n`);
});
