<!--
SpellPanel.svelte - Word-to-Sequence Generation Panel

Allows users to type a word and generate a valid TKA sequence with bridge letters.
- Word input with autocomplete for Greek letters
- Letter palette for clicking to insert Greek symbols
- Preferences for generation constraints
- Result display showing original vs expanded word
-->
<script lang="ts">
  import type { SequenceState } from "$lib/features/create/shared/state/SequenceStateOrchestrator.svelte";
  import type { SpellTabState } from "../state/spell-tab-state.svelte";
  import { resolve } from "$lib/shared/inversify/di";
  import { SPELL_TYPES } from "../services/implementations/spell-types";
  import type { IWordSequenceGenerator } from "../services/contracts/IWordSequenceGenerator";
  import type { ILetterTransitionGraph } from "../services/contracts/ILetterTransitionGraph";
  import WordInput from "./WordInput.svelte";
  import LetterPalette from "./LetterPalette.svelte";
  import PreferencesPanel from "./PreferencesPanel.svelte";
  import ResultDisplay from "./ResultDisplay.svelte";

  // Props
  let {
    spellState,
    sequenceState,
    isDesktop = false,
  }: {
    spellState: SpellTabState;
    sequenceState: SequenceState | null;
    isDesktop?: boolean;
  } = $props();

  // Services (resolved on-demand)
  let wordGenerator: IWordSequenceGenerator | null = null;
  let transitionGraph: ILetterTransitionGraph | null = null;

  function getWordGenerator(): IWordSequenceGenerator {
    if (!wordGenerator) {
      wordGenerator = resolve<IWordSequenceGenerator>(
        SPELL_TYPES.IWordSequenceGenerator
      );
    }
    return wordGenerator;
  }

  async function getTransitionGraph(): Promise<ILetterTransitionGraph> {
    if (!transitionGraph) {
      transitionGraph = resolve<ILetterTransitionGraph>(
        SPELL_TYPES.ILetterTransitionGraph
      );
      if (!transitionGraph.isInitialized()) {
        await transitionGraph.initialize();
      }
    }
    return transitionGraph;
  }

  // Generate sequence from the input word
  async function handleGenerate() {
    if (!spellState.inputWord.trim()) return;

    spellState.setGenerating(true);
    spellState.clearError();

    try {
      // Ensure transition graph is initialized
      await getTransitionGraph();

      const generator = getWordGenerator();
      const result = await generator.generateFromWord({
        word: spellState.inputWord,
        preferences: spellState.preferences,
      });

      if (result.success && result.sequence) {
        // Update spell state with results
        spellState.setExpandedWord(result.expandedWord);
        spellState.setLetterSources(result.letterSources);

        // Push to sequence state
        if (sequenceState) {
          await sequenceState.setBeats(result.sequence.beats);
          if (result.sequence.startingPositionBeat) {
            await sequenceState.setStartPosition(
              result.sequence.startingPositionBeat
            );
          }
          // Update sequence name to the original word
          sequenceState.updateSequenceMetadata({
            name: result.originalWord,
            word: result.expandedWord,
          });
        }

        // Push undo snapshot
        spellState.pushUndoSnapshot("spell-generate", {
          word: result.originalWord,
        });
      } else {
        spellState.setError(result.error || "Failed to generate sequence");
      }
    } catch (error) {
      console.error("Failed to generate sequence:", error);
      spellState.setError(
        error instanceof Error ? error.message : "Unknown error"
      );
    } finally {
      spellState.setGenerating(false);
    }
  }

  // Handle letter insertion from palette
  function handleLetterInsert(letter: string) {
    spellState.insertLetter(letter);
  }

  // Handle regenerate - generates a new variation
  function handleRegenerate() {
    handleGenerate();
  }

  // Handle clear
  function handleClear() {
    spellState.clearSpellState();
    if (sequenceState) {
      sequenceState.clearSequenceCompletely();
    }
  }
</script>

<div class="spell-panel" data-is-desktop={isDesktop}>
  <div class="spell-panel-inner">
    <!-- Word Input Section -->
    <div class="input-section">
      <WordInput
        value={spellState.inputWord}
        onInput={(value) => spellState.setInputWord(value)}
        onPaletteToggle={() => spellState.toggleLetterPalette()}
        showPaletteButton={true}
        disabled={spellState.isGenerating}
      />
    </div>

    <!-- Letter Palette (collapsible) -->
    {#if spellState.showLetterPalette}
      <div class="palette-section">
        <LetterPalette onSelect={handleLetterInsert} />
      </div>
    {/if}

    <!-- Preferences Section -->
    <div class="preferences-section">
      <PreferencesPanel
        preferences={spellState.preferences}
        onUpdate={(key, value) => spellState.updatePreference(key, value)}
      />
    </div>

    <!-- Generate Button -->
    <div class="actions-section">
      <button
        class="generate-button"
        onclick={handleGenerate}
        disabled={!spellState.canGenerate}
      >
        {#if spellState.isGenerating}
          <span class="spinner"></span>
          Generating...
        {:else}
          Generate Sequence
        {/if}
      </button>

      {#if spellState.hasSequence()}
        <button class="secondary-button" onclick={handleRegenerate}>
          Regenerate
        </button>
        <button class="secondary-button danger" onclick={handleClear}>
          Clear
        </button>
      {/if}
    </div>

    <!-- Error Display -->
    {#if spellState.error}
      <div class="error-message">
        {spellState.error}
      </div>
    {/if}

    <!-- Result Display -->
    {#if spellState.expandedWord}
      <div class="result-section">
        <ResultDisplay
          originalWord={spellState.inputWord}
          expandedWord={spellState.expandedWord}
          letterSources={spellState.letterSources}
        />
      </div>
    {/if}
  </div>
</div>

<style>
  .spell-panel {
    container-type: size;
    container-name: spell-panel;
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: auto;
    padding: var(--settings-spacing-sm, 8px);
  }

  .spell-panel-inner {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--settings-spacing-md, 16px);
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
  }

  .input-section,
  .palette-section,
  .preferences-section,
  .actions-section,
  .result-section {
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1.5px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: var(--settings-radius-md, 12px);
    padding: var(--settings-spacing-md, 16px);
  }

  .actions-section {
    display: flex;
    gap: var(--settings-spacing-sm, 8px);
    flex-wrap: wrap;
    justify-content: center;
  }

  .generate-button {
    flex: 1;
    min-width: 200px;
    padding: var(--settings-spacing-md, 16px);
    background: var(--theme-accent, #6366f1);
    color: white;
    border: none;
    border-radius: var(--settings-radius-md, 12px);
    font-size: var(--font-size-md, 16px);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .generate-button:hover:not(:disabled) {
    background: var(--theme-accent-hover, #4f46e5);
    transform: translateY(-1px);
  }

  .generate-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .secondary-button {
    padding: var(--settings-spacing-sm, 8px) var(--settings-spacing-md, 16px);
    background: var(--theme-panel-bg, rgba(18, 18, 28, 0.98));
    color: var(--theme-text, #ffffff);
    border: 1.5px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: var(--settings-radius-sm, 8px);
    font-size: var(--font-size-min, 14px);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .secondary-button:hover {
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.2));
  }

  .secondary-button.danger:hover {
    border-color: var(--semantic-error, #ef4444);
    color: var(--semantic-error, #ef4444);
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .error-message {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid var(--semantic-error, #ef4444);
    border-radius: var(--settings-radius-sm, 8px);
    padding: var(--settings-spacing-sm, 8px) var(--settings-spacing-md, 16px);
    color: var(--semantic-error, #ef4444);
    font-size: var(--font-size-min, 14px);
  }

  /* Desktop layout */
  @media (min-width: 1024px) {
    .spell-panel-inner {
      justify-content: center;
    }
  }
</style>
