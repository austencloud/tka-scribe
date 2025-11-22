import { readFile, writeFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fixes = [
  // AnimationCanvas.svelte - Line 22: onCanvasReady = (_canvas) => {}
  {
    file: "src/lib/modules/animate/components/AnimationCanvas.svelte",
    line: 22,
    from: "    onCanvasReady = (_canvas) => {},",
    to: "    onCanvasReady = () => {},",
  },

  // AnimationControls.svelte - Line 25: onSpeedChange = (_newSpeed) => {}
  {
    file: "src/lib/modules/animate/components/AnimationControls.svelte",
    line: 25,
    from: "    onSpeedChange = (_newSpeed) => {},",
    to: "    onSpeedChange = () => {},",
  },

  // AnimationControlsPanel.svelte - Line 28: const handleSpeedChange = (_newSpeed: number) => {}
  {
    file: "src/lib/modules/animate/components/AnimationControlsPanel.svelte",
    line: 28,
    from: "  const handleSpeedChange = (_newSpeed: number) => {",
    to: "  const handleSpeedChange = () => {",
  },

  // AnimationControlsPanel.svelte - Line 34: const handlePlay = (_e: MouseEvent) => {
  {
    file: "src/lib/modules/animate/components/AnimationControlsPanel.svelte",
    line: 34,
    from: "  const handlePlay = (_e: MouseEvent) => {",
    to: "  const handlePlay = () => {",
  },

  // AnimationControlsPanel.svelte - Line 35: const handlePause = (_e: MouseEvent) => {
  {
    file: "src/lib/modules/animate/components/AnimationControlsPanel.svelte",
    line: 35,
    from: "  const handlePause = (_e: MouseEvent) => {",
    to: "  const handlePause = () => {",
  },

  // AnimationControlsPanel.svelte - Line 36: const handleReset = (_e: MouseEvent) => {
  {
    file: "src/lib/modules/animate/components/AnimationControlsPanel.svelte",
    line: 36,
    from: "  const handleReset = (_e: MouseEvent) => {",
    to: "  const handleReset = () => {",
  },

  // AnimationControlsPanel.svelte - Line 52: const handlePlayClick = (e: MouseEvent) => {
  {
    file: "src/lib/modules/animate/components/AnimationControlsPanel.svelte",
    line: 52,
    from: "  const handlePlayClick = (e: MouseEvent) => {",
    to: "  const handlePlayClick = () => {",
  },

  // AnimationControlsPanel.svelte - Line 53: const handlePauseClick = (e: MouseEvent) => {
  {
    file: "src/lib/modules/animate/components/AnimationControlsPanel.svelte",
    line: 53,
    from: "  const handlePauseClick = (e: MouseEvent) => {",
    to: "  const handlePauseClick = () => {",
  },

  // AnimationControlsPanel.svelte - Line 54: const handleResetClick = (e: MouseEvent) => {
  {
    file: "src/lib/modules/animate/components/AnimationControlsPanel.svelte",
    line: 54,
    from: "  const handleResetClick = (e: MouseEvent) => {",
    to: "  const handleResetClick = () => {",
  },

  // AnimationExportDialog.svelte - Line 18: const handleExport = (_format: string) => {
  {
    file: "src/lib/modules/animate/components/AnimationExportDialog.svelte",
    line: 18,
    from: "  const handleExport = (_format: string) => {",
    to: "  const handleExport = () => {",
  },

  // AnimationExportSheet.svelte - Line 20: const handleExport = (_format: string) => {
  {
    file: "src/lib/modules/animate/components/AnimationExportSheet.svelte",
    line: 20,
    from: "  const handleExport = (_format: string) => {",
    to: "  const handleExport = () => {",
  },

  // AnimationPanel.svelte - Line 59: const handleSpeedChange = (_newSpeed: number) => {
  {
    file: "src/lib/modules/animate/components/AnimationPanel.svelte",
    line: 59,
    from: "  const handleSpeedChange = (_newSpeed: number) => {",
    to: "  const handleSpeedChange = () => {",
  },

  // AnimationPanel.svelte - Line 62: onCanvasReady = (_canvas) => {}
  {
    file: "src/lib/modules/animate/components/AnimationPanel.svelte",
    line: 62,
    from: "    onCanvasReady = (_canvas) => {},",
    to: "    onCanvasReady = () => {},",
  },

  // AnimatorCanvas.svelte - Line 59: onCanvasReady = (_canvas) => {}
  {
    file: "src/lib/modules/animate/components/AnimatorCanvas.svelte",
    line: 59,
    from: "    onCanvasReady = (_canvas) => {},",
    to: "    onCanvasReady = () => {},",
  },

  // AnimatorCanvas.svelte - Line 97: let _pathCacheData
  {
    file: "src/lib/modules/animate/components/AnimatorCanvas.svelte",
    line: 97,
    from: "  let _pathCacheData = $state<AnimationPathCacheData | null>(null);",
    to: "  // Unused variable removed: _pathCacheData",
  },

  // AnimatorCanvas.svelte - Line 98: let _isCachePrecomputing
  {
    file: "src/lib/modules/animate/components/AnimatorCanvas.svelte",
    line: 98,
    from: "  let _isCachePrecomputing = $state(false);",
    to: "  // Unused variable removed: _isCachePrecomputing",
  },

  // ModernSlider.svelte - Line 16: const handleChange = (_value: number) => {
  {
    file: "src/lib/modules/animate/components/ModernSlider.svelte",
    line: 16,
    from: "  const handleChange = (_value: number) => {",
    to: "  const handleChange = () => {",
  },

  // ModernStepper.svelte - Line 16: const handleChange = (_value: number) => {
  {
    file: "src/lib/modules/animate/components/ModernStepper.svelte",
    line: 16,
    from: "  const handleChange = (_value: number) => {",
    to: "  const handleChange = () => {",
  },

  // SwipeAdjuster.svelte - Line 22: const handleSwipe = (_newValue: number) => {
  {
    file: "src/lib/modules/animate/components/SwipeAdjuster.svelte",
    line: 22,
    from: "  const handleSwipe = (_newValue: number) => {",
    to: "  const handleSwipe = () => {",
  },

  // ToggleSwitch.svelte - Line 12: const handleToggle = (_checked: boolean) => {
  {
    file: "src/lib/modules/animate/components/ToggleSwitch.svelte",
    line: 12,
    from: "  const handleToggle = (_checked: boolean) => {",
    to: "  const handleToggle = () => {",
  },

  // TrailSettings.svelte - Line 68-70: function handlePreviewModeToggle
  {
    file: "src/lib/modules/animate/components/TrailSettings.svelte",
    line: 68,
    from: `  function handlePreviewModeToggle(_enabled: boolean) {
    settings.previewMode = _enabled;
  }`,
    to: "",
  },

  // SequenceBrowserPanel.svelte (modes) - Line 25: const handleSequenceSelect = (_sequence: SequenceData) => {
  {
    file: "src/lib/modules/animate/modes/components/SequenceBrowserPanel.svelte",
    line: 25,
    from: "  const handleSequenceSelect = (_sequence: SequenceData) => {",
    to: "  const handleSequenceSelect = () => {",
  },

  // SequenceBrowserPanel.svelte (shared) - Line 25: const handleSequenceSelect = (_sequence: SequenceData) => {
  {
    file: "src/lib/modules/animate/shared/components/SequenceBrowserPanel.svelte",
    line: 25,
    from: "  const handleSequenceSelect = (_sequence: SequenceData) => {",
    to: "  const handleSequenceSelect = () => {",
  },

  // PixiAnimationRenderer.ts - Line 325: } catch (_e) {
  {
    file: "src/lib/modules/animate/services/implementations/PixiAnimationRenderer.ts",
    line: 325,
    from: "      } catch (_e) {",
    to: "      } catch {",
  },

  // PixiApplicationManager.ts - Line 66: } catch (_e) {
  {
    file: "src/lib/modules/animate/services/implementations/pixi/PixiApplicationManager.ts",
    line: 66,
    from: "        } catch (_e) {",
    to: "        } catch {",
  },

  // PixiSpriteManager.ts - Line 200: } catch (_e) {
  {
    file: "src/lib/modules/animate/services/implementations/pixi/PixiSpriteManager.ts",
    line: 200,
    from: "      } catch (_e) {",
    to: "      } catch {",
  },

  // PixiTextureLoader.ts - Line 219: } catch (_e) {
  {
    file: "src/lib/modules/animate/services/implementations/pixi/PixiTextureLoader.ts",
    line: 219,
    from: "      } catch (_e) {",
    to: "      } catch {",
  },

  // PixiTrailRenderer.ts - Line 301: } catch (_e) {
  {
    file: "src/lib/modules/animate/services/implementations/pixi/PixiTrailRenderer.ts",
    line: 301,
    from: "      } catch (_e) {",
    to: "      } catch {",
  },
];

// Group fixes by file
const fileMap = new Map();
for (const fix of fixes) {
  if (!fileMap.has(fix.file)) {
    fileMap.set(fix.file, []);
  }
  fileMap.get(fix.file).push(fix);
}

let totalFixed = 0;
let filesModified = 0;

for (const [file, fileFixes] of fileMap.entries()) {
  try {
    const filePath = join(__dirname, file);
    let content = await readFile(filePath, "utf-8");
    const originalContent = content;

    for (const fix of fileFixes) {
      if (content.includes(fix.from)) {
        content = content.replace(fix.from, fix.to);
        totalFixed++;
      } else {
        console.log(`⚠ Pattern not found in ${file} at line ${fix.line}`);
      }
    }

    if (content !== originalContent) {
      await writeFile(filePath, content, "utf-8");
      filesModified++;
      console.log(`✓ Fixed ${fileFixes.length} issue(s) in ${file}`);
    }
  } catch (error) {
    console.error(`✗ Error processing ${file}:`, error.message);
  }
}

console.log(`\n==============================================`);
console.log(`Total unused variable errors fixed: ${totalFixed}`);
console.log(`Files modified: ${filesModified}`);
console.log(`==============================================\n`);
