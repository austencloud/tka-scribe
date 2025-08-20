<!--
Pictograph Generation Test Page

This page tests the algorithmic pictograph generation system.
It provides buttons to generate specific letters and displays the results
to validate that the generation functions work correctly.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { resolve } from "$lib/services/bootstrap";
  import { IPictographGeneratorServiceInterface } from "$lib/services/interfaces/pictograph-generator-interfaces";
  import type { IPictographGeneratorService } from "$lib/services/interfaces/pictograph-generator-interfaces";
  import type { PictographData } from "$lib/domain/PictographData";
  import Pictograph from "$lib/components/pictograph/Pictograph.svelte";

  // State
  let generatorService: IPictographGeneratorService | null = null;
  let currentLetter: string | null = null;
  let generatedPictographs: PictographData[] = [];
  let isLoading = false;
  let error: string | null = null;
  let movementCounts: Record<string, number> = {};

  // Initialize service
  onMount(async () => {
    try {
      generatorService = resolve(IPictographGeneratorServiceInterface);
      movementCounts = generatorService.getMovementCounts();
      console.log("🎯 Pictograph Generator Service initialized");
      console.log("📊 Movement counts:", movementCounts);
    } catch (err) {
      error = `Failed to initialize generator service: ${err}`;
      console.error("❌", error);
    }
  });

  // Generate pictographs for a specific letter
  async function generateLetter(letter: string) {
    if (!generatorService) {
      error = "Generator service not initialized";
      return;
    }

    isLoading = true;
    error = null;
    currentLetter = letter;

    try {
      console.log(`🔄 Generating pictographs for letter ${letter}...`);

      let pictographs: PictographData[] = [];

      switch (letter) {
        case "A":
          pictographs = generatorService.generateA();
          break;
        case "B":
          pictographs = generatorService.generateB();
          break;
        case "C":
          pictographs = generatorService.generateC();
          break;
        case "D":
          pictographs = generatorService.generateD();
          break;
        case "E":
          pictographs = generatorService.generateE();
          break;
        case "F":
          pictographs = generatorService.generateF();
          break;
        default:
          throw new Error(`Letter ${letter} not implemented`);
      }

      generatedPictographs = pictographs;
      console.log(
        `✅ Generated ${pictographs.length} pictographs for letter ${letter}`
      );
    } catch (err) {
      error = `Failed to generate letter ${letter}: ${err}`;
      console.error("❌", error);
      generatedPictographs = [];
    } finally {
      isLoading = false;
    }
  }

  // Clear results
  function clearResults() {
    currentLetter = null;
    generatedPictographs = [];
    error = null;
  }

  // Get available letters
  $: availableLetters = generatorService?.getAvailableLetters() || [];
</script>

<svelte:head>
  <title>Pictograph Generation Test - TKA</title>
</svelte:head>

<div class="test-page">
  <header class="test-header">
    <h1>🧪 Pictograph Generation Test</h1>
    <p>Test the algorithmic pictograph generation system</p>
  </header>

  <!-- Generation Controls -->
  <section class="controls-section">
    <h2>Generate Pictographs</h2>
    <div class="letter-buttons">
      {#each availableLetters as letter}
        <button
          class="letter-btn"
          class:active={currentLetter === letter}
          onclick={() => generateLetter(letter)}
          disabled={isLoading || !generatorService}
        >
          Generate {letter}
        </button>
      {/each}

      <button
        class="clear-btn"
        onclick={clearResults}
        disabled={isLoading || generatedPictographs.length === 0}
      >
        Clear Results
      </button>
    </div>
  </section>

  <!-- Results Display -->
  <section class="results-section">
    <h2>Results</h2>

    {#if isLoading}
      <div class="loading-state">
        🔄 Generating pictographs for letter {currentLetter}...
      </div>
    {:else if error}
      <div class="error-state">
        ❌ {error}
      </div>
    {:else if generatedPictographs.length > 0}
      <div class="results-header">
        <h3>
          Letter {currentLetter}: {generatedPictographs.length} pictographs generated
        </h3>
      </div>

      <div class="pictograph-grid">
        {#each generatedPictographs as pictograph, index}
          <div class="pictograph-item">
            <div class="pictograph-wrapper">
              <Pictograph
                pictographData={pictograph}
                width={200}
                height={200}
                debug={false}
              />
            </div>
            <div class="pictograph-info">
              <div class="index">#{index + 1}</div>
              <div class="positions">
                {pictograph.startPosition} → {pictograph.endPosition}
              </div>
              <div class="timing">
                {pictograph.timing} | {pictograph.direction}
              </div>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="empty-state">
        <div class="empty-icon">🎭</div>
        <p>Click a letter button above to generate pictographs</p>
      </div>
    {/if}
  </section>
</div>

<style>
  .test-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    font-family:
      -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  .test-header {
    text-align: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #e5e7eb;
  }

  .test-header h1 {
    color: #1f2937;
    margin-bottom: 0.5rem;
  }

  .test-header p {
    color: #6b7280;
    font-size: 1.1rem;
  }



  /* Controls Section */
  .controls-section {
    margin-bottom: 2rem;
  }

  .letter-buttons {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    align-items: center;
  }

  .letter-btn {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .letter-btn:hover:not(:disabled) {
    background: #2563eb;
    transform: translateY(-1px);
  }

  .letter-btn:disabled {
    background: #9ca3af;
    cursor: not-allowed;
    transform: none;
  }

  .letter-btn.active {
    background: #059669;
  }

  .clear-btn {
    background: #ef4444;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .clear-btn:hover:not(:disabled) {
    background: #dc2626;
  }

  .clear-btn:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }

  /* Results Section */
  .results-section h2 {
    margin-bottom: 1rem;
  }

  .loading-state,
  .error-state,
  .empty-state {
    text-align: center;
    padding: 3rem;
    color: #6b7280;
  }

  .error-state {
    color: #dc2626;
    background: #fee2e2;
    border-radius: 8px;
  }

  .empty-state .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .results-header {
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: #f0f9ff;
    border-radius: 6px;
    border-left: 4px solid #0ea5e9;
  }

  .results-header h3 {
    margin: 0;
    color: #0c4a6e;
  }

  /* Pictograph Grid */
  .pictograph-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
  }

  .pictograph-item {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition:
      transform 0.2s,
      box-shadow 0.2s;
  }

  .pictograph-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .pictograph-wrapper {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
    background: #f9fafb;
    border-radius: 6px;
    padding: 0.5rem;
  }

  .pictograph-info {
    text-align: center;
    font-size: 0.875rem;
    color: #6b7280;
  }

  .pictograph-info .index {
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.25rem;
  }

  .pictograph-info .positions {
    font-family: monospace;
    margin-bottom: 0.25rem;
  }

  .pictograph-info .timing {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
</style>
