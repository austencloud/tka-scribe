import { readFileSync, writeFileSync } from 'fs';
import { globSync } from 'glob';

// Find all TypeScript/Svelte files
const files = globSync('src/**/*.{ts,svelte}', {
  ignore: ['**/node_modules/**', '**/.svelte-kit/**', '**/dist/**', '**/build/**']
});

let fixedCount = 0;
const fixedFiles = [];

for (const file of files) {
  try {
    let content = readFileSync(file, 'utf8');
    const original = content;

    // Pattern 1: catch (_error) but uses "error" inside
    // Look for } catch (_error) followed by references to " error" (with space or at start of line)
    content = content.replace(
      /(\} catch \()_error(\))/g,
      '$1error$2'
    );

    // Pattern 2: catch (_err) but uses "err" inside
    content = content.replace(
      /(\} catch \()_err(\))/g,
      '$1err$2'
    );

    if (content !== original) {
      writeFileSync(file, content, 'utf8');
      fixedFiles.push(file);
      fixedCount++;
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
}

console.log(`Fixed ${fixedCount} files:`);
fixedFiles.forEach(f => console.log(`  - ${f}`));
