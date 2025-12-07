<script lang="ts">
  import { onMount } from "svelte";
  import { container } from "$lib/shared/inversify/container";
  import { TYPES } from "$lib/shared/inversify/types";
  import { Letter } from "$lib/shared/foundation/domain/models/Letter";
  import { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
  import { PropType } from "$lib/shared/pictograph/prop/domain/enums/PropType";
  import {
    DifficultyLevel,
    GenerationMode,
  } from "$lib/features/create/generate/shared/domain/models/generate-models";
  import { loadFeatureModule } from "$lib/shared/inversify/container";
  import type { IGenerationOrchestrationService } from "$lib/features/create/generate/shared/services/contracts/IGenerationOrchestrationService";

  interface TestResult {
    letter: string;
    word?: string;
    duration: number;
    contains?: boolean;
    success: boolean;
    error?: string;
  }

  let testResults: TestResult[] = $state([]);
  let isRunning = $state(false);
  let summary = $state<{
    total: number;
    successful: number;
    failed: number;
    avgDuration: number;
    minDuration: number;
    maxDuration: number;
    allCorrect: boolean;
  } | null>(null);

  const TEST_LETTERS = [
    { letter: Letter.A, name: "A (Type 1: Dual-Shift)" },
    { letter: Letter.W, name: "W (Type 2: Shift)" },
    { letter: Letter.W_DASH, name: "W' (Type 3: Cross-Shift)" },
    { letter: Letter.PHI, name: "Φ (Type 4: Dash)" },
    { letter: Letter.ALPHA, name: "α (Type 6: Static)" },
  ];

  async function runTests() {
    isRunning = true;
    testResults = [];
    summary = null;

    try {
      // Ensure Tier 2 modules are loaded first (pictograph is needed by create)
      const { loadSharedModules } = await import(
        "$lib/shared/inversify/container"
      );
      await loadSharedModules();

      // Then load the create module
      await loadFeatureModule("create");

      const orchestrationService =
        container.get<IGenerationOrchestrationService>(
          TYPES.IGenerationOrchestrationService
        );

      for (const { letter, name } of TEST_LETTERS) {
        const startTime = Date.now();

        try {
          const sequence = await orchestrationService.generateSequence({
            mode: GenerationMode.FREEFORM,
            length: 16,
            gridMode: GridMode.DIAMOND,
            propType: PropType.FAN,
            difficulty: DifficultyLevel.INTERMEDIATE,
            mustContainLetters: [letter],
          });

          const endTime = Date.now();
          const word = sequence.word || "";
          const letterStr = letter.toString();
          const contains = word.includes(letterStr);

          testResults.push({
            letter: name,
            word,
            duration: endTime - startTime,
            contains,
            success: true,
          });
        } catch (error: any) {
          const endTime = Date.now();

          testResults.push({
            letter: name,
            duration: endTime - startTime,
            success: false,
            error: error.message,
          });
        }
      }

      // Calculate summary
      const successful = testResults.filter((r) => r.success && r.contains);
      const failed = testResults.filter((r) => !r.success || !r.contains);
      const durations = successful.map((r) => r.duration);

      summary = {
        total: testResults.length,
        successful: successful.length,
        failed: failed.length,
        avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
        minDuration: Math.min(...durations),
        maxDuration: Math.max(...durations),
        allCorrect: failed.length === 0,
      };
    } catch (error: any) {
      console.error("Test failed:", error);
      alert(`Test failed: ${error.message}`);
    } finally {
      isRunning = false;
    }
  }

  onMount(() => {
    // Auto-run tests on page load
    runTests();
  });
</script>

<div class="test-page">
  <h1>Letter Constraint Generation Test</h1>
  <p>Testing rejection sampling approach for mustContainLetters constraint.</p>

  <button onclick={runTests} disabled={isRunning}>
    {isRunning ? "Running tests..." : "Run Tests Again"}
  </button>

  {#if testResults.length > 0}
    <div class="results">
      <h2>Results:</h2>

      {#each testResults as result}
        <div
          class="test-result"
          class:error={!result.success || !result.contains}
        >
          <strong>{result.letter}</strong><br />
          {#if result.success}
            Generated: "{result.word}" ({result.duration}ms)<br />
            Contains required letter: {result.contains ? "✅ YES" : "❌ NO"}
          {:else}
            ❌ FAILED: {result.error} ({result.duration}ms)
          {/if}
        </div>
      {/each}
    </div>
  {/if}

  {#if summary}
    <div class="summary">
      <h2>Summary:</h2>
      <div>Total tests: {summary.total}</div>
      <div>
        Successful: {summary.successful}/{summary.total} ({(
          (summary.successful / summary.total) *
          100
        ).toFixed(1)}%)
      </div>
      <div>Failed: {summary.failed}/{summary.total}</div>
      <div>Average duration: {summary.avgDuration.toFixed(0)}ms</div>
      <div>Min duration: {summary.minDuration}ms</div>
      <div>Max duration: {summary.maxDuration}ms</div>
      <div>All correct: {summary.allCorrect ? "✅ YES" : "❌ NO"}</div>
    </div>
  {/if}
</div>

<style>
  .test-page {
    padding: 40px;
    max-width: 800px;
    margin: 0 auto;
    font-family: monospace;
  }

  h1 {
    color: #333;
    margin-bottom: 10px;
  }

  p {
    color: #666;
    margin-bottom: 30px;
  }

  button {
    background: #4ade80;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    font-family: monospace;
    font-size: 14px;
    cursor: pointer;
    margin-bottom: 30px;
  }

  button:hover:not(:disabled) {
    background: #22c55e;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .results {
    margin: 30px 0;
  }

  .test-result {
    background: #f0fdf4;
    border-left: 4px solid #4ade80;
    padding: 15px;
    margin: 10px 0;
    border-radius: 4px;
  }

  .test-result.error {
    background: #fef2f2;
    border-left-color: #f87171;
  }

  .summary {
    background: #f9fafb;
    border: 2px solid #e5e7eb;
    padding: 20px;
    border-radius: 8px;
    margin-top: 30px;
  }

  .summary h2 {
    margin-top: 0;
  }

  .summary div {
    margin: 8px 0;
  }
</style>
