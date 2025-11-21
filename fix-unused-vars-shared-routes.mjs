import fs from 'fs';
import path from 'path';

const summary = JSON.parse(fs.readFileSync('unused-vars-summary.json', 'utf8'));

let fixedCount = 0;
let filesModified = 0;

function fixFile(filePath, errors) {
  const fullPath = path.join('F:\\_THE KINETIC ALPHABET\\_TKA-STUDIO', 'src', filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${fullPath}`);
    return 0;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');
  let modified = false;
  let fileFixCount = 0;

  // Sort errors by line number in reverse to avoid line number shifts
  const sortedErrors = errors.sort((a, b) => b.line - a.line);

  sortedErrors.forEach(err => {
    const lineIdx = err.line - 1;
    if (lineIdx < 0 || lineIdx >= lines.length) return;

    const line = lines[lineIdx];
    const msg = err.message;

    // Extract variable name from message
    const match = msg.match(/'([^']+)'/);
    if (!match) return;

    const varName = match[1];

    // Skip if already has underscore prefix (except for _e patterns that need fixing)
    if (varName.startsWith('_') && varName !== '_e') {
      // Check if it's in a pattern that should be fixed
      if (!line.includes('catch') && !msg.includes('defined but never used')) {
        return;
      }
    }

    // Case 1: Catch block parameters - rename to _error or _e
    if (line.includes('catch') && line.includes(varName)) {
      const newName = varName === 'error' || varName === 'err' || varName === '_e' ? '_error' : `_${varName}`;
      lines[lineIdx] = line.replace(new RegExp(`\\b${varName}\\b`, 'g'), newName);
      modified = true;
      fileFixCount++;
      console.log(`  Fixed catch parameter '${varName}' -> '${newName}' at line ${err.line}`);
      return;
    }

    // Case 2: Function parameters - prefix with underscore
    if (msg.includes('defined but never used') &&
        (line.includes('=>') || line.includes('function') || line.includes('on:') || line.includes('bind:'))) {
      // Handle arrow functions, regular functions, and event handlers
      const newName = varName.startsWith('_') ? varName : `_${varName}`;

      // Be careful with destructuring
      if (line.includes('{') && line.includes('}')) {
        // Destructured parameter
        lines[lineIdx] = line.replace(
          new RegExp(`([{,]\\s*)${varName}(\\s*[,}])`, 'g'),
          `$1${newName}$2`
        );
      } else {
        // Regular parameter
        lines[lineIdx] = line.replace(
          new RegExp(`\\b${varName}\\b`, 'g'),
          newName
        );
      }
      modified = true;
      fileFixCount++;
      console.log(`  Fixed parameter '${varName}' -> '${newName}' at line ${err.line}`);
      return;
    }

    // Case 3: Assigned but never used - prefix with underscore
    if (msg.includes('assigned a value but never used')) {
      const newName = varName.startsWith('_') ? varName : `_${varName}`;

      // Handle different declaration types
      if (line.includes('const') || line.includes('let') || line.includes('var')) {
        lines[lineIdx] = line.replace(
          new RegExp(`\\b${varName}\\b`, 'g'),
          newName
        );
      } else if (line.includes('{') && line.includes('}')) {
        // Destructured assignment
        lines[lineIdx] = line.replace(
          new RegExp(`([{,]\\s*)${varName}(\\s*[,}:])`, 'g'),
          `$1${newName}$2`
        );
      }
      modified = true;
      fileFixCount++;
      console.log(`  Fixed assigned variable '${varName}' -> '${newName}' at line ${err.line}`);
      return;
    }

    // Case 4: Destructured variables - try to prefix with underscore
    if (line.includes('{') && line.includes('}') && line.includes(varName)) {
      const newName = varName.startsWith('_') ? varName : `_${varName}`;
      lines[lineIdx] = line.replace(
        new RegExp(`([{,]\\s*)${varName}(\\s*[,}:])`, 'g'),
        `$1${newName}$2`
      );
      modified = true;
      fileFixCount++;
      console.log(`  Fixed destructured variable '${varName}' -> '${newName}' at line ${err.line}`);
      return;
    }

    // Case 5: Generic - prefix with underscore
    const newName = varName.startsWith('_') ? varName : `_${varName}`;
    lines[lineIdx] = line.replace(
      new RegExp(`\\b${varName}\\b`, 'g'),
      newName
    );
    modified = true;
    fileFixCount++;
    console.log(`  Fixed variable '${varName}' -> '${newName}' at line ${err.line}`);
  });

  if (modified) {
    fs.writeFileSync(fullPath, lines.join('\n'), 'utf8');
    filesModified++;
    fixedCount += fileFixCount;
    return fileFixCount;
  }

  return 0;
}

console.log('Starting to fix unused variable errors...\n');

Object.keys(summary).forEach(file => {
  console.log(`\nProcessing ${file}...`);
  const fixes = fixFile(file, summary[file]);
  if (fixes > 0) {
    console.log(`  Total fixes in file: ${fixes}`);
  } else {
    console.log(`  No changes made`);
  }
});

console.log(`\n\nSummary:`);
console.log(`Total fixes applied: ${fixedCount}`);
console.log(`Files modified: ${filesModified}`);
