import fs from "fs/promises";
import path from "path";

// Map of file paths to fixes
const fixes = [
  // CallToAction.svelte - already fixed
  // LandingNavBar.svelte - already fixed

  // SettingsModal.svelte
  {
    file: "src/lib/modules/about/components/SettingsModal.svelte",
    changes: [
      {
        search: /onBackgroundChange\?\.\((background)\)/g,
        replace: "onBackgroundChange?.(_background)",
        params: ["background"],
      },
    ],
  },

  // ContactForm.svelte
  {
    file: "src/lib/modules/about/components/contact/forms/ContactForm.svelte",
    changes: [
      {
        pattern: "destructure",
        line: 27,
        remove: ["field", "value"],
      },
    ],
  },
];

// Read file content
async function readFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  return await fs.readFile(fullPath, "utf-8");
}

// Write file content
async function writeFile(filePath, content) {
  const fullPath = path.join(process.cwd(), filePath);
  await fs.writeFile(fullPath, content, "utf-8");
}

// Process all fixes
async function processFixes() {
  let fixCount = 0;
  let fileCount = 0;

  for (const fix of fixes) {
    try {
      let content = await readFile(fix.file);
      let modified = false;

      for (const change of fix.changes) {
        if (change.search && change.replace) {
          const newContent = content.replace(change.search, change.replace);
          if (newContent !== content) {
            content = newContent;
            modified = true;
            fixCount++;
          }
        }
      }

      if (modified) {
        await writeFile(fix.file, content);
        fileCount++;
        console.log(`✓ Fixed ${fix.file}`);
      }
    } catch (error) {
      console.error(`✗ Error fixing ${fix.file}:`, error.message);
    }
  }

  console.log(`\n✅ Fixed ${fixCount} errors in ${fileCount} files`);
}

processFixes().catch(console.error);
