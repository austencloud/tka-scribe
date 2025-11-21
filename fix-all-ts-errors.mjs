import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';

// Parse svelte-check output and extract errors
async function parseErrors() {
  const output = await readFile('svelte-check-full.txt', 'utf-8');
  const lines = output.split('\n');

  const errors = [];
  let currentFile = null;
  let currentLine = null;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Remove ANSI color codes
    line = line.replace(/\x1b\[[0-9;]*m/g, '');

    // Match file:line:col pattern
    const fileMatch = line.match(/src[\\\/](.+\.(?:svelte|ts)):(\d+):(\d+)/);
    if (fileMatch) {
      currentFile = 'src/' + fileMatch[1].replace(/\\/g, '/');
      currentLine = parseInt(fileMatch[2]);
    }

    // Match error messages
    if (line.includes("is declared but its value is never read")) {
      const varMatch = line.match(/'([^']+)' is declared/);
      if (varMatch && currentFile && currentLine) {
        errors.push({
          file: currentFile,
          line: currentLine,
          variable: varMatch[1],
          type: 'unused'
        });
      }
    }

    if (line.includes("is of type 'unknown'")) {
      const varMatch = line.match(/'([^']+)' is of type 'unknown'/);
      if (varMatch && currentFile && currentLine) {
        errors.push({
          file: currentFile,
          line: currentLine,
          variable: varMatch[1],
          type: 'unknown'
        });
      }
    }
  }

  return errors;
}

// Fix unused variables by prefixing with _
async function fixUnusedVariables(errors) {
  const fileGroups = {};

  // Group by file
  errors.forEach(err => {
    if (err.type === 'unused') {
      if (!fileGroups[err.file]) fileGroups[err.file] = [];
      fileGroups[err.file].push(err);
    }
  });

  let totalFixed = 0;

  for (const [filePath, fileErrors] of Object.entries(fileGroups)) {
    const fullPath = `F:\\_THE KINETIC ALPHABET\\_TKA-STUDIO\\${filePath}`;
    if (!existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      continue;
    }

    let content = await readFile(fullPath, 'utf-8');
    const lines = content.split('\n');

    // Sort by line number descending to avoid offset issues
    fileErrors.sort((a, b) => b.line - a.line);

    let fixedInFile = 0;
    for (const err of fileErrors) {
      const lineIdx = err.line - 1;
      if (lineIdx >= lines.length) continue;

      const line = lines[lineIdx];
      const variable = err.variable;

      // Skip if already prefixed
      if (variable.startsWith('_')) continue;

      // Replace the variable declaration with _ prefix
      // Handle different patterns: const/let/var name, { name }, destructuring, etc.
      const patterns = [
        // Destructuring: const { foo, bar } = ...
        new RegExp(`(\\{[^}]*\\b)${variable}(\\b[^}]*\\})`, 'g'),
        // Regular declaration: const foo = ...
        new RegExp(`(\\b(?:const|let|var)\\s+)${variable}\\b`, 'g'),
        // Function parameter: (foo, bar) =>
        new RegExp(`(\\([^)]*\\b)${variable}(\\b[^)]*)\\)`, 'g'),
        // Standalone in destructuring: const name = ...
        new RegExp(`(\\s+)${variable}(\\s*[,=:])`,'g'),
      ];

      let replaced = false;
      for (const pattern of patterns) {
        const newLine = line.replace(pattern, `$1_${variable}$2`);
        if (newLine !== line) {
          lines[lineIdx] = newLine;
          replaced = true;
          fixedInFile++;
          break;
        }
      }

      if (!replaced) {
        // Fallback: simple replacement
        const newLine = line.replace(new RegExp(`\\b${variable}\\b`), `_${variable}`);
        if (newLine !== line) {
          lines[lineIdx] = newLine;
          fixedInFile++;
        }
      }
    }

    if (fixedInFile > 0) {
      await writeFile(fullPath, lines.join('\n'), 'utf-8');
      console.log(`✅ Fixed ${fixedInFile} unused variables in ${filePath}`);
      totalFixed += fixedInFile;
    }
  }

  return totalFixed;
}

// Main
async function main() {
  console.log('Parsing errors...');
  const errors = await parseErrors();

  const unusedErrors = errors.filter(e => e.type === 'unused');
  const unknownErrors = errors.filter(e => e.type === 'unknown');

  console.log(`\nFound ${unusedErrors.length} unused variable errors`);
  console.log(`Found ${unknownErrors.length} unknown type errors`);

  console.log('\nFixing unused variables...');
  const fixed = await fixUnusedVariables(errors);

  console.log(`\n✅ Total fixed: ${fixed} unused variables`);
  console.log('\nRemaining errors need manual fixes:');
  console.log('- exactOptionalPropertyTypes errors (add | undefined to optional props)');
  console.log('- unknown type errors (add type assertions)');
}

main().catch(console.error);
