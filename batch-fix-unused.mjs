import { readFile, writeFile } from 'fs/promises';

// Manual list of files and variables to fix based on svelte-check output
const fixes = [
  { file: 'src/lib/modules/create/construct/start-position-picker/components/StartPositionPicker.svelte', line: 43, var: 'isAnimating' },
  { file: 'src/lib/modules/animate/components/GlyphRenderer.svelte', line: 53, var: 'currentTurnsTuple' },
  { file: 'src/lib/modules/animate/components/AnimatorCanvas.svelte', line: 97, var: 'pathCacheData' },
  { file: 'src/lib/modules/animate/components/AnimatorCanvas.svelte', line: 98, var: 'isCachePrecomputing' },
  { file: 'src/lib/modules/animate/components/AnimatorCanvas.svelte', line: 472, var: 'x' },
  { file: 'src/lib/modules/animate/components/AnimatorCanvas.svelte', line: 473, var: 'y' },
  { file: 'src/lib/modules/animate/components/AnimatorCanvas.svelte', line: 492, var: 'lastFrameTime' },
  { file: 'src/lib/modules/animate/components/SwipeAdjuster.svelte', line: 42, var: 'swipeContainer' },
  { file: 'src/lib/modules/animate/components/TrailSettings.svelte', line: 17, var: 'SwipeAdjuster' },
  { file: 'src/lib/modules/animate/components/TrailSettings.svelte', line: 69, var: 'handlePreviewModeToggle' },
  { file: 'src/lib/modules/animate/components/AnimationControlsPanel.svelte', line: 27, var: 'scrollContainerRef' },
  { file: 'src/lib/modules/create/shared/components/coordinators/AnimationCoordinator.svelte', line: 30, var: 'animatingBeatNumber' },
  { file: 'src/lib/modules/create/shared/components/coordinators/AnimationCoordinator.svelte', line: 40, var: 'animationCanvas' },
  { file: 'src/lib/modules/create/shared/components/coordinators/EditCoordinator.svelte', line: 22, var: 'shouldUseSideBySideLayout' },
  { file: 'src/lib/modules/create/shared/components/coordinators/ShareCoordinator.svelte', line: 43, var: 'options' },
];

async function fixFile(filePath, lineNum, varName) {
  const fullPath = `F:\\_THE KINETIC ALPHABET\\_TKA-STUDIO\\${filePath}`;

  try {
    const content = await readFile(fullPath, 'utf-8');
    const lines = content.split('\n');
    const lineIdx = lineNum - 1;

    if (lineIdx >= lines.length) {
      console.log(`⚠️ Line ${lineNum} out of range in ${filePath}`);
      return false;
    }

    const line = lines[lineIdx];

    // Only replace if it's actually a declaration (const/let/var/function param)
    const patterns = [
      { regex: new RegExp(`(const\\s+)${varName}\\b`), replace: `$1_${varName}` },
      { regex: new RegExp(`(let\\s+)${varName}\\b`), replace: `$1_${varName}` },
      { regex: new RegExp(`(var\\s+)${varName}\\b`), replace: `$1_${varName}` },
      { regex: new RegExp(`(\\s)${varName}(\\s*[=:])`), replace: `$1_${varName}$2` },
      { regex: new RegExp(`(import\\s+)${varName}(\\s+from)`), replace: `$1_${varName}$2` },
    ];

    let newLine = line;
    for (const pattern of patterns) {
      const replaced = line.replace(pattern.regex, pattern.replace);
      if (replaced !== line) {
        newLine = replaced;
        break;
      }
    }

    if (newLine !== line) {
      lines[lineIdx] = newLine;
      await writeFile(fullPath, lines.join('\n'), 'utf-8');
      return true;
    }

    return false;
  } catch (error) {
    console.log(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

async function main() {
  let fixed = 0;

  for (const fix of fixes) {
    const success = await fixFile(fix.file, fix.line, fix.var);
    if (success) {
      console.log(`✅ Fixed '${fix.var}' in ${fix.file}:${fix.line}`);
      fixed++;
    }
  }

  console.log(`\n✅ Fixed ${fixed}/${fixes.length} unused variables`);
}

main().catch(console.error);
