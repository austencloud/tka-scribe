<!--
SequenceSettingsSection.svelte - Core sequence configuration settings
Contains Level, Length, and Turn Intensity selectors with dynamic visibility
-->
<script lang="ts">
  import { DifficultyLevel } from "../shared/domain";
  import type { UIGenerationConfig } from "../state";
  import LengthSelector from "./selectors/LengthSelector.svelte";
  import LevelSelector from "./selectors/LevelSelector.svelte";
  import TurnIntensitySelector from "./selectors/TurnIntensitySelector.svelte";

  let { config } = $props<{
    config: UIGenerationConfig;
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

  // Handle level change
  function handleLevelChange(newLevel: DifficultyLevel) {
    currentLevel = newLevel;
  }

  // Derived values
  let shouldShowTurnIntensity = $derived(currentLevel !== DifficultyLevel.BEGINNER);
  let allowedIntensityValues = $derived(getAllowedIntensityValues(currentLevel));
</script>

<section class="settings-section">
  <h4 class="section-title">Sequence Settings</h4>
  <div class="settings-grid">
    <div class="setting-item">
      <LevelSelector
        initialValue={levelToDifficulty(config.level)}
        onvalueChanged={handleLevelChange}
      />
    </div>
    <div class="setting-item">
      <LengthSelector initialValue={config.length} />
    </div>
    {#if shouldShowTurnIntensity}
      <div class="setting-item turn-intensity-item">
        <TurnIntensitySelector
          initialValue={config.turnIntensity}
          allowedValues={allowedIntensityValues}
        />
      </div>
    {/if}
  </div>
</section>

<style>
  .settings-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: auto;
  }

  .section-title {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 6px;
  }

  .settings-grid {
    display: grid;
    gap: var(--element-spacing);
    grid-template-columns: 1fr;
    align-content: start;
  }

  .setting-item {
    border-radius: 6px;
    padding: var(--element-spacing);
    transition: background-color 0.2s ease;
    min-height: var(--min-touch-target);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .setting-item:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  /* Responsive layouts */
  :global(.generate-panel[data-layout="comfortable"]) .settings-grid {
    grid-template-columns: 1fr;
    gap: calc(var(--element-spacing) * 1.25);
  }

  :global(.generate-panel[data-layout="comfortable"]) .setting-item {
    padding: calc(var(--element-spacing) * 1.25);
    min-height: calc(var(--min-touch-target) * 1.2);
  }

  :global(.generate-panel[data-layout="spacious"]) .settings-grid {
    grid-template-columns: 1fr;
    gap: calc(var(--element-spacing) * 1.5);
  }

  :global(.generate-panel[data-layout="spacious"]) .setting-item {
    padding: calc(var(--element-spacing) * 1.5);
    min-height: calc(var(--min-touch-target) * 1.4);
  }

  :global(.generate-panel[data-layout="compact"]) .settings-grid {
    grid-template-columns: 1fr;
    gap: calc(var(--element-spacing) * 0.75);
  }

  :global(.generate-panel[data-layout="compact"]) .setting-item {
    padding: calc(var(--element-spacing) * 0.75);
    min-height: calc(var(--min-touch-target) * 0.8);
  }

  /* Large desktop optimization */
  @media (min-width: 1440px) {
    :global(.generate-panel[data-layout="compact"]) .settings-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    :global(.generate-panel[data-layout="spacious"]) .settings-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  /* Mobile adjustments */
  @media (max-width: 768px) {
    .settings-grid {
      grid-template-columns: 1fr !important;
    }
  }

  /* Child component styling */
  .setting-item :global(.level-selector),
  .setting-item :global(.length-selector),
  .setting-item :global(.turn-intensity-selector) {
    width: 100%;
  }

  .setting-item :global(.level-button) {
    min-height: calc(var(--min-touch-target) * 0.8);
    min-width: calc(var(--min-touch-target) * 0.8);
  }

  .setting-item :global(.value-display) {
    min-height: calc(var(--min-touch-target) * 0.6);
    min-width: calc(var(--min-touch-target) * 0.8);
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
</style>
