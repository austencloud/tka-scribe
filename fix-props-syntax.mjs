import { readFile, writeFile } from 'fs/promises';
import { glob } from 'glob';

/**
 * Fix $props<{}> syntax by ensuring properties are properly separated
 */
async function fixPropsInFile(filePath) {
  try {
    let content = await readFile(filePath, 'utf-8');
    let modified = false;

    // Pattern to match $props<{ ... }>() blocks including multiline
    const propsRegex = /(\$props<\{)([\s\S]*?)(\}>)/g;

    content = content.replace(propsRegex, (match, openTag, innerContent, closeTag) => {
      let fixed = innerContent;

      // Step 1: Remove existing semicolons AND commas after lines
      // This normalizes everything
      fixed = fixed.replace(/[;,](\s*(?:\/\/[^\n]*)?(?:\r?\n|$))/g, '$1');

      // Step 2: Add commas only after property lines (lines that end with a type annotation)
      // Property lines should:
      // - End with: >, ], ), ", ', identifier, or ?
      // - NOT be empty or whitespace-only
      // - NOT be comment-only lines
      // - Be followed by another property (line starting with property name or comment)

      const lines = fixed.split(/\r?\n/);
      const result = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const nextLine = i < lines.length - 1 ? lines[i + 1] : null;

        // Check if this line is a property definition (not a comment, not empty)
        const isPropertyLine = /^\s*[a-zA-Z_][\w]*[?]?\s*:/.test(line);

        // Check if next line exists and is either a property or comment
        const hasNextProperty = nextLine && (
          /^\s*[a-zA-Z_][\w]*[?]?\s*:/.test(nextLine) || // next is property
          /^\s*\/\*\*/.test(nextLine) // next is JSDoc comment
        );

        // Add comma if this is a property line and there's another property coming
        if (isPropertyLine && hasNextProperty) {
          // Add comma at the end of the line (before any inline comment)
          const modifiedLine = line.replace(/(\S)(\s*(?:\/\/[^\n]*)?)$/, '$1,$2');
          result.push(modifiedLine);
        } else {
          result.push(line);
        }
      }

      fixed = result.join('\n');

      if (fixed !== innerContent) {
        modified = true;
      }

      return openTag + fixed + closeTag;
    });

    if (modified) {
      await writeFile(filePath, content, 'utf-8');
      console.log(`✓ Fixed: ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('Finding Svelte files with $props syntax...\n');

  const files = await glob('src/**/*.svelte', {
    absolute: true,
    windowsPathsNoEscape: true
  });

  console.log(`Found ${files.length} Svelte files\n`);

  let fixedCount = 0;

  for (const file of files) {
    const wasFixed = await fixPropsInFile(file);
    if (wasFixed) {
      fixedCount++;
    }
  }

  console.log(`\n✓ Fixed ${fixedCount} files`);
}

main().catch(console.error);
