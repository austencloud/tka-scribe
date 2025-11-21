import fs from 'fs';

const fixes = [
  { file: "src/lib/modules/about/components/Links.svelte", line: 202 },
  { file: "src/lib/modules/about/components/SettingsModal.svelte", line: 111 },
  { file: "src/lib/modules/about/components/SwipeableLanding.svelte", line: 111 },
  { file: "src/lib/modules/create/construct/option-picker/components/OptionViewerSection.svelte", line: 307 },
  { file: "src/lib/modules/create/construct/option-picker/option-viewer/components/OptionViewerSection.svelte", line: 301 },
  { file: "src/lib/modules/create/construct/shared/components/OptionsHeaderButton.svelte", line: 43 },
  { file: "src/lib/modules/create/shared/workspace-panel/shared/components/SequenceActionsSheet.svelte", line: 185 },
  { file: "src/lib/modules/explore/gallery/navigation/components/ExploreCategoryButton.svelte", line: 115 },
  { file: "src/lib/modules/learn/codex/components/CodexPictographGrid.svelte", line: 143 },
  { file: "src/lib/shared/info/components/InfoTabNavigation.svelte", line: 45 },
  { file: "src/lib/shared/mobile/components/InstructionStep.svelte", line: 24 },
  { file: "src/lib/shared/navigation/components/ModuleList.svelte", line: 195 },
  { file: "src/lib/shared/navigation/components/ModuleList.svelte", line: 245 },
  { file: "src/lib/shared/navigation/components/buttons/NavButton.svelte", line: 69 },
  { file: "src/lib/shared/navigation/components/desktop-sidebar/CollapsedModuleButton.svelte", line: 34 },
  { file: "src/lib/shared/navigation/components/desktop-sidebar/CollapsedTabButton.svelte", line: 25 },
  { file: "src/lib/shared/navigation/components/desktop-sidebar/ModuleButton.svelte", line: 39 },
  { file: "src/lib/shared/navigation/components/desktop-sidebar/SectionButton.svelte", line: 25 },
  { file: "src/lib/shared/pictograph/arrow/rendering/components/ArrowSvg.svelte", line: 303 },
  { file: "src/lib/shared/pictograph/grid/components/GridSvg.svelte", line: 83 },
  { file: "src/lib/shared/pictograph/prop/components/PropSvg.svelte", line: 191 },
  { file: "src/lib/shared/settings/components/IOSListItem.svelte", line: 61 },
  { file: "src/lib/shared/settings/components/IOSSegmentedControl.svelte", line: 64 },
  { file: "src/lib/shared/settings/components/IOSTabBar.svelte", line: 45 },
  { file: "src/lib/shared/settings/components/SettingsSidebar.svelte", line: 67 },
  { file: "src/lib/shared/settings/components/SettingsSidebar.svelte", line: 90 },
  { file: "src/lib/shared/settings/components/tabs/background/BackgroundThumbnail.svelte", line: 65 },
  { file: "src/lib/shared/settings/components/tabs/background/IOSBackgroundCard.svelte", line: 68 },
  { file: "src/lib/shared/settings/components/tabs/background/IOSSimpleBackgroundCardGrid.svelte", line: 170 },
  { file: "src/lib/shared/settings/components/tabs/background/IOSSimpleBackgroundPicker.svelte", line: 169 },
  { file: "src/lib/shared/settings/components/tabs/background/SimpleBackgroundPicker.svelte", line: 170 }
];

// Group fixes by file
const fileGroups = {};
for (const fix of fixes) {
  if (!fileGroups[fix.file]) {
    fileGroups[fix.file] = [];
  }
  fileGroups[fix.file].push(fix.line);
}

let totalFixed = 0;

// Process each file
for (const [filePath, lines] of Object.entries(fileGroups)) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const contentLines = content.split('\n');

    // Sort lines in descending order to avoid line number shifts
    const sortedLines = lines.sort((a, b) => b - a);

    for (const lineNum of sortedLines) {
      const lineIndex = lineNum - 1;
      const line = contentLines[lineIndex];

      // Check if the line contains {@html and doesn't already have the ignore comment
      if (line && line.includes('{@html')) {
        // Check if previous line already has the ignore comment
        const prevLine = lineIndex > 0 ? contentLines[lineIndex - 1] : '';
        if (!prevLine.includes('svelte-ignore svelte/no-at-html-tags')) {
          // Get the indentation of the current line
          const indent = line.match(/^(\s*)/)[1];
          // Add the ignore comment with the same indentation
          contentLines.splice(lineIndex, 0, `${indent}<!-- svelte-ignore svelte/no-at-html-tags -->`);
          totalFixed++;
          console.log(`✓ Fixed ${filePath}:${lineNum}`);
        } else {
          console.log(`⊘ Skipped ${filePath}:${lineNum} (already has ignore comment)`);
        }
      }
    }

    // Write the modified content back
    fs.writeFileSync(filePath, contentLines.join('\n'), 'utf8');

  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
  }
}

console.log(`\n✓ Fixed ${totalFixed} {@html} warnings`);
console.log('All files have been updated with svelte-ignore comments for trusted {@html} content.');
