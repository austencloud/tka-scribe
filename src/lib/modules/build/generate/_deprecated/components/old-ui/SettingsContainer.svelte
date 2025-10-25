<!--
SettingsContainer.svelte - Container for all settings controls
Handles the responsive layout and scrolling behavior
All individual controls are evenly spaced throughout the container
-->
<script lang="ts">
  import { DifficultyLevel, GenerationMode } from "../shared/domain";
  import type { UIGenerationConfig } from "../state/generate-config.svelte";
  import CAPTypeSelector from "./selectors/CAPTypeSelector.svelte";
  import GenerationModeToggle from "./selectors/GenerationModeToggle.svelte";
  import GridModeSelector from "./selectors/GridModeSelector.svelte";
  import LengthSelector from "./selectors/LengthSelector.svelte";
  import LetterTypeSelector from "./selectors/LetterTypeSelector.svelte";
  import LevelSelector from "./selectors/LevelSelector.svelte";
  import PropContinuityToggle from "./selectors/PropContinuityToggle.svelte";
  import SliceSizeSelector from "./selectors/SliceSizeSelector.svelte";
  import TurnIntensitySelector from "./selectors/TurnIntensitySelector.svelte";

  let { config, isFreeformMode } = $props<{
    config: UIGenerationConfig;
    isFreeformMode: boolean;
  }>();

  // Track current level for conditional rendering
  let currentLevel = $state<DifficultyLevel>(levelToDifficulty(config.level));

  // Convert number level to DifficultyLevel enum
  function levelToDifficulty(level: number): DifficultyLevel {
    switch (level) {
      case 1: return DifficultyLevel.BEGINNER;
      case 2: return DifficultyLevel.INTERMEDIATE;
      case 3: return DifficultyLevel.ADVANCED;
      default: return DifficultyLevel.INTERMEDIATE;
    }
  }

  // Handle level change
  function handleLevelChange(newLevel: DifficultyLevel) {
    currentLevel = newLevel;
    // Update config with new level value
    const levelNumber = newLevel === DifficultyLevel.BEGINNER ? 1
      : newLevel === DifficultyLevel.INTERMEDIATE ? 2
      : 3;
    config.level = levelNumber;
  }

  // Handle length change
  function handleLengthChange(newLength: number) {
    console.log(`📏 Length changed to: ${newLength}`);
    config.length = newLength;
  }

  // Handle turn intensity change
  function handleTurnIntensityChange(newIntensity: number) {
    config.turnIntensity = newIntensity;
  }

  // Handle prop continuity change
  function handlePropContinuityChange(newContinuity: string) {
    console.log(`🔗 Prop continuity changed to: ${newContinuity}`);
    config.propContinuity = newContinuity;
  }

  // Get allowed turn intensity values based on level
  function getAllowedIntensityValues(level: DifficultyLevel): number[] {
    switch (level) {
      case DifficultyLevel.BEGINNER:
        return []; // No turns for level 1
      case DifficultyLevel.INTERMEDIATE:
        return [1.0, 2.0, 3.0]; // Whole numbers for level 2
      case DifficultyLevel.ADVANCED:
        return [0.5, 1.0, 1.5, 2.0, 2.5, 3.0]; // All values for level 3
      default:
        return [1.0, 2.0, 3.0];
    }
  }

  // Derived values
  let shouldShowTurnIntensity = $derived(currentLevel !== DifficultyLevel.BEGINNER);
  let allowedIntensityValues = $derived(getAllowedIntensityValues(currentLevel));
</script>

<div
  class="settings-container"
  style="
    --control-gap: 12px;
    --control-padding: 8px 0;
    --label-size: 14px;
    --label-weight: 500;
    --label-color: rgba(255, 255, 255, 0.9);
    --value-size: 14px;
    --value-weight: bold;
    --value-color: white;
    --value-bg: rgba(255, 255, 255, 0.1);
    --value-border: 1px solid rgba(255, 255, 255, 0.2);
    --value-border-radius: 6px;
    --value-padding: 6px 12px;
    --value-min-width: 30px;
  "
>
  <!-- Core Sequence Settings -->
  <div class="setting-item">
    <LevelSelector
      initialValue={levelToDifficulty(config.level)}
      onvalueChanged={handleLevelChange}
    />
  </div>

  <div class="setting-item">
    <LengthSelector
      initialValue={config.length}
      onvalueChanged={handleLengthChange}
    />
  </div>

  {#if shouldShowTurnIntensity}
    <div class="setting-item turn-intensity-item">
      <TurnIntensitySelector
        initialValue={config.turnIntensity}
        allowedValues={allowedIntensityValues}
        onvalueChanged={handleTurnIntensityChange}
      />
    </div>
  {/if}

  <!-- Mode & Layout Settings -->
  <div class="setting-item">
    <GridModeSelector initialMode={config.gridMode} />
  </div>

  <div class="setting-item">
    <GenerationModeToggle
      initialMode={config.mode === GenerationMode.FREEFORM
        ? GenerationMode.FREEFORM
        : GenerationMode.CIRCULAR}
    />
  </div>

  <div class="setting-item">
    <PropContinuityToggle
      initialValue={config.propContinuity}
      onvalueChanged={handlePropContinuityChange}
    />
  </div>

  <!-- Mode-Specific Settings -->
  {#if isFreeformMode}
    <div class="setting-item">
      <LetterTypeSelector initialValue={config.letterTypes} />
    </div>
  {:else}
    <div class="setting-item">
      <SliceSizeSelector initialValue={config.sliceSize} />
    </div>

    <div class="setting-item">
      <CAPTypeSelector initialValue={config.capType} />
    </div>
  {/if}
</div>

<style>
  .settings-container {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    min-height: 0; /* Allow proper overflow handling */
    padding: calc(var(--element-spacing) * 1.5);

    /* Single glassmorphism card for the entire container */
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.05),
      rgba(255, 255, 255, 0.02)
    );
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .setting-item {
    /* Simple centered row - no individual cards */
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: var(--min-touch-target, 44px);
    transition: opacity 0.2s ease;
  }

  .setting-item:hover {
    opacity: 0.8;
  }

  /* Smooth transition for Turn Intensity appearing/disappearing */
  .turn-intensity-item {
    animation: slideIn 0.3s ease-out;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
      max-height: 0;
    }
    to {
      opacity: 1;
      transform: translateY(0);
      max-height: 200px;
    }
  }

  /* Responsive layouts */
  :global(.generate-panel[data-layout="spacious"]) .settings-container {
    padding: calc(var(--element-spacing) * 2);
  }

  :global(.generate-panel[data-layout="compact"]) .settings-container {
    padding: var(--element-spacing);
  }

  /* Ensure no scrolling is forced when not appropriate */
  :global(.generate-panel[data-allow-scroll="false"]) .settings-container {
    overflow: hidden;
    flex: 1;
    min-height: 0;
    /* Ensure flex doesn't expand beyond container */
    max-height: 100%;
  }
</style>
