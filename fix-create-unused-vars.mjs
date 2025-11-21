import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';

// Parse ESLint JSON output and extract unused-vars errors
async function getUnusedVarsErrors() {
  const eslintOutput = await readFile('create-lint-errors.json', 'utf-8');
  const results = JSON.parse(eslintOutput);

  const errors = [];
  for (const file of results) {
    const unusedVarsMessages = file.messages.filter(
      m => m.ruleId === 'no-unused-vars' || m.ruleId === '@typescript-eslint/no-unused-vars'
    );

    if (unusedVarsMessages.length > 0) {
      errors.push({
        filePath: file.filePath,
        messages: unusedVarsMessages,
        source: file.source
      });
    }
  }

  return errors;
}

// Fix unused variables in a file
async function fixUnusedVars(filePath, messages, source) {
  let content = source;
  let fixes = 0;

  // Sort messages by position (reverse order to maintain offsets)
  const sortedMessages = [...messages].sort((a, b) => b.line - a.line || b.column - a.column);

  for (const msg of sortedMessages) {
    const varName = msg.message.match(/'([^']+)'/)?.[1];
    if (!varName) continue;

    const lines = content.split('\n');
    const lineIndex = msg.line - 1;
    const line = lines[lineIndex];

    // Check if it's in a props destructure (looking for $props<{...}>)
    const propsMatch = line.includes('$props<{');

    if (propsMatch) {
      // For unused props, prefix parameter name with underscore
      // Look for patterns like: varName?: (param) => type
      // Replace with: varName?: (_param) => type

      // Match: varName?: (param) => type or varName?: (param: Type) => type
      const paramRegex = new RegExp(`(${varName}\\??):\\s*\\(([^_][^)]+)\\)\\s*=>`, 'g');
      const newLine = line.replace(paramRegex, (match, varNamePart, params) => {
        // Split params by comma and prefix each with _
        const fixedParams = params.split(',').map(p => {
          const trimmed = p.trim();
          // Check if it already has underscore
          if (trimmed.startsWith('_')) return trimmed;
          // Handle typed params like "param: Type"
          if (trimmed.includes(':')) {
            const [name, type] = trimmed.split(':').map(s => s.trim());
            return `_${name}: ${type}`;
          }
          return `_${trimmed}`;
        }).join(', ');

        return `${varNamePart}: (${fixedParams}) =>`;
      });

      if (newLine !== line) {
        lines[lineIndex] = newLine;
        content = lines.join('\n');
        fixes++;
        continue;
      }
    }

    // Check if it's a catch block parameter
    if (line.includes('catch') && line.includes('(') && line.includes(varName)) {
      // Replace catch (varName) with catch (_error)
      const newLine = line.replace(
        new RegExp(`catch\\s*\\(\\s*${varName}\\s*\\)`, 'g'),
        'catch (_error)'
      );

      if (newLine !== line) {
        lines[lineIndex] = newLine;
        content = lines.join('\n');
        fixes++;
        continue;
      }
    }

    // Check if it's a function parameter
    const functionParamPatterns = [
      // Arrow function: (param) =>
      new RegExp(`\\(\\s*${varName}\\s*\\)\\s*=>`),
      // Arrow function with type: (param: Type) =>
      new RegExp(`\\(\\s*${varName}:\\s*[^)]+\\)\\s*=>`),
      // Regular function: function name(param)
      new RegExp(`function\\s+\\w+\\s*\\([^)]*${varName}[^)]*\\)`),
      // Method: methodName(param)
      new RegExp(`\\w+\\s*\\([^)]*${varName}[^)]*\\)\\s*{`),
    ];

    const isFunctionParam = functionParamPatterns.some(pattern => pattern.test(line));

    if (isFunctionParam) {
      // Prefix with underscore
      const newLine = line.replace(
        new RegExp(`\\b${varName}\\b(?=\\s*[,):])`, 'g'),
        `_${varName}`
      );

      if (newLine !== line) {
        lines[lineIndex] = newLine;
        content = lines.join('\n');
        fixes++;
        continue;
      }
    }

    // Check if it's a destructured variable
    const destructurePatterns = [
      // const { varName } = ...
      new RegExp(`const\\s*{[^}]*\\b${varName}\\b[^}]*}\\s*=`),
      // let { varName } = ...
      new RegExp(`let\\s*{[^}]*\\b${varName}\\b[^}]*}\\s*=`),
      // { varName } in function params
      new RegExp(`\\(\\s*{[^}]*\\b${varName}\\b[^}]*}\\s*\\)`),
    ];

    const isDestructured = destructurePatterns.some(pattern => pattern.test(line));

    if (isDestructured) {
      // For destructured vars, check if they appear to be intentionally unused (like rest operators)
      // If so, prefix with underscore, otherwise remove

      // Check if part of object rest (e.g., { used, ...rest })
      if (line.includes('...')) {
        // Keep it, just prefix with underscore
        const newLine = line.replace(
          new RegExp(`\\b${varName}\\b`, 'g'),
          `_${varName}`
        );

        if (newLine !== line) {
          lines[lineIndex] = newLine;
          content = lines.join('\n');
          fixes++;
          continue;
        }
      } else {
        // Try to remove it from destructure
        // Handle: { a, varName, b } => { a, b }
        const newLine = line
          .replace(new RegExp(`,\\s*${varName}\\b`, 'g'), '') // Remove ", varName"
          .replace(new RegExp(`\\b${varName}\\s*,`, 'g'), '') // Remove "varName,"
          .replace(new RegExp(`{\\s*${varName}\\s*}`, 'g'), '{}'); // Handle only item: { varName }

        if (newLine !== line) {
          lines[lineIndex] = newLine;
          content = lines.join('\n');
          fixes++;
          continue;
        }
      }
    }

    // For standalone variables, try to remove them
    const standalonePatterns = [
      // const varName = ...;
      new RegExp(`^\\s*const\\s+${varName}\\s*=.*?;\\s*$`, 'm'),
      // let varName = ...;
      new RegExp(`^\\s*let\\s+${varName}\\s*=.*?;\\s*$`, 'm'),
      // var varName = ...;
      new RegExp(`^\\s*var\\s+${varName}\\s*=.*?;\\s*$`, 'm'),
    ];

    for (const pattern of standalonePatterns) {
      if (pattern.test(line)) {
        // Remove the entire line
        lines.splice(lineIndex, 1);
        content = lines.join('\n');
        fixes++;
        break;
      }
    }
  }

  return { content, fixes };
}

// Main execution
async function main() {
  console.log('Analyzing unused variables in create module...\n');

  const errors = await getUnusedVarsErrors();
  console.log(`Found ${errors.length} files with unused variable errors\n`);

  let totalFixes = 0;
  let filesModified = 0;

  for (const { filePath, messages, source } of errors) {
    console.log(`\nProcessing: ${filePath}`);
    console.log(`  - ${messages.length} unused variable(s)`);

    const { content, fixes } = await fixUnusedVars(filePath, messages, source);

    if (fixes > 0) {
      await writeFile(filePath, content, 'utf-8');
      console.log(`  ✓ Applied ${fixes} fix(es)`);
      totalFixes += fixes;
      filesModified++;
    } else {
      console.log(`  ⚠ Could not auto-fix errors`);
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Total fixes applied: ${totalFixes}`);
  console.log(`Files modified: ${filesModified}`);
  console.log(`${'='.repeat(50)}\n`);
}

main().catch(console.error);
