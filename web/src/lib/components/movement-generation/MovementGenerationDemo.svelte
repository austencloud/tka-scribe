<!-- Movement Generation Demo Component -->
<!-- 
  Demonstrates the TKA movement generation system.
  Shows how AI can easily understand and generate movements like generateB(), generateZDash(), etc.
-->

<script lang="ts">
  import { createMovementGenerationState } from "$lib/state/movement-generation.svelte";
  import type { MovementSet } from "$lib/domain/MovementData";

  // Create reactive state
  const state = createMovementGenerationState();

  // Example data for demonstration
  const exampleLetters = ["A", "B", "C", "W", "X-", "Z-", "Σ", "α"];

  async function handleGenerateExample(letter: string) {
    const result = await state.generateMovementSet(letter);
    if (result) {
      console.log(`Generated ${letter}:`, result);
    }
  }

  async function handleGenerateAll() {
    await state.generateAllMovements();
    console.log("Generated all movements:", state.movementSets);
  }
</script>

<div class="p-6 max-w-4xl mx-auto">
  <h1 class="text-3xl font-bold mb-6">TKA Movement Generation System</h1>

  <div class="mb-8">
    <h2 class="text-xl font-semibold mb-4">AI-Friendly Movement Generation</h2>
    <p class="text-gray-700 mb-4">
      The system provides simple functions like <code
        class="bg-gray-100 px-2 py-1 rounded">generateB()</code
      >,
      <code class="bg-gray-100 px-2 py-1 rounded">generateZDash()</code>, etc.
      that an AI can easily understand and use.
    </p>
  </div>

  <!-- Generation Controls -->
  <div class="mb-8 p-4 border rounded-lg">
    <h3 class="text-lg font-semibold mb-4">Generate Movements</h3>

    <div class="grid grid-cols-4 gap-2 mb-4">
      {#each exampleLetters as letter}
        <button
          class="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          onclick={() => handleGenerateExample(letter)}
          disabled={state.isGenerating}
        >
          Generate {letter}
        </button>
      {/each}
    </div>

    <button
      class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
      onclick={handleGenerateAll}
      disabled={state.isGenerating}
    >
      Generate All Movements
    </button>

    <button
      class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 ml-2"
      onclick={() => state.clearMovements()}
    >
      Clear All
    </button>
  </div>

  <!-- Filter Controls -->
  <div class="mb-6 p-4 border rounded-lg">
    <h3 class="text-lg font-semibold mb-4">Filter & Search</h3>

    <div class="flex gap-4 items-center">
      <input
        type="text"
        placeholder="Filter by letter..."
        class="px-3 py-2 border rounded flex-1"
        value={state.filterText}
        oninput={(e) =>
          state.setFilter((e.target as HTMLInputElement)?.value || "")}
      />

      <label class="flex items-center gap-2">
        <input
          type="checkbox"
          checked={state.showOnlyGenerated}
          onchange={() => state.toggleShowOnlyGenerated()}
        />
        Show only generated
      </label>
    </div>
  </div>

  <!-- Status Display -->
  {#if state.isGenerating}
    <div class="mb-4 p-3 bg-blue-100 border border-blue-300 rounded">
      <p class="text-blue-800">Generating movements...</p>
    </div>
  {/if}

  {#if state.error}
    <div class="mb-4 p-3 bg-red-100 border border-red-300 rounded">
      <p class="text-red-800">Error: {state.error}</p>
      <button
        class="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        onclick={() => state.clearError()}
      >
        Clear Error
      </button>
    </div>
  {/if}

  <!-- Statistics -->
  <div class="mb-6 p-4 bg-gray-50 rounded-lg">
    <h3 class="text-lg font-semibold mb-2">Statistics</h3>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
      <div>
        <span class="font-medium">Total Sets:</span>
        {state.generationStats().totalSets}
      </div>
      <div>
        <span class="font-medium">Total Movements:</span>
        {state.generationStats().totalMovements}
      </div>
      <div>
        <span class="font-medium">Filtered:</span>
        {state.generationStats().filteredCount}
      </div>
      <div>
        <span class="font-medium">Last Generated:</span>
        {state.lastGenerated || "None"}
      </div>
    </div>
  </div>

  <!-- Generated Movements Display -->
  <div class="space-y-4">
    <h3 class="text-lg font-semibold">Generated Movement Sets</h3>

    {#if state.filteredMovementSets.length === 0}
      <p class="text-gray-500">
        No movement sets generated yet. Try generating some movements above!
      </p>
    {:else}
      <div class="grid gap-4">
        {#each state.filteredMovementSets() as movementSet}
          <div class="p-4 border rounded-lg">
            <h4 class="text-lg font-semibold mb-2">
              Letter: {movementSet.letter}
            </h4>

            <div class="mb-3 text-sm text-gray-600">
              <span class="mr-4">Timing: {movementSet.pattern.timing}</span>
              <span class="mr-4"
                >Direction: {movementSet.pattern.direction}</span
              >
              <span class="mr-4"
                >System: {movementSet.pattern.positionSystem}</span
              >
              <span>Movements: {movementSet.movements.length}</span>
            </div>

            <details>
              <summary class="cursor-pointer text-blue-600 hover:text-blue-800"
                >View Movements</summary
              >
              <div class="mt-3 space-y-2">
                {#each movementSet.movements as movement, i}
                  <div class="p-3 bg-gray-50 rounded text-sm">
                    <div class="font-medium mb-1">Movement {i + 1}</div>
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <div>
                          <strong>Position:</strong>
                          {movement.startPosition} → {movement.endPosition}
                        </div>
                        <div><strong>Timing:</strong> {movement.timing}</div>
                        <div>
                          <strong>Direction:</strong>
                          {movement.direction}
                        </div>
                      </div>
                      <div>
                        <div>
                          <strong>Blue Hand:</strong>
                          {movement.blueHand.motionType}
                          {movement.blueHand.rotationDirection}
                        </div>
                        <div>
                          <strong>Red Hand:</strong>
                          {movement.redHand.motionType}
                          {movement.redHand.rotationDirection}
                        </div>
                        <div>
                          <strong>Locations:</strong>
                          {movement.blueHand.startLocation}→{movement.blueHand
                            .endLocation} | {movement.redHand
                            .startLocation}→{movement.redHand.endLocation}
                        </div>
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            </details>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- API Example -->
  <div class="mt-8 p-4 bg-gray-50 rounded-lg">
    <h3 class="text-lg font-semibold mb-2">Example API Usage</h3>
    <pre
      class="text-sm bg-gray-800 text-green-400 p-3 rounded overflow-x-auto"><code
        >// Generate specific movements
const movementB = await state.generateMovementSet('B');
const movementZDash = await state.generateMovementSet('Z-');
const movementSigma = await state.generateMovementSet('Σ');

// Generate all movements at once
await state.generateAllMovements();

// Access generated data
const allSets = state.movementSets;
const filteredSets = state.filteredMovementSets;
const stats = state.generationStats;</code
      ></pre>
  </div>
</div>

<style>
  code {
    font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  }
</style>
