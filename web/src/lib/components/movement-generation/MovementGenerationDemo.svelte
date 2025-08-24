<!-- Movement Generation Demo Component -->
<!-- 
  Demonstrates the TKA movement generation system.
  Shows how AI can easily understand and generate movements like generateB(), generateZDash(), etc.
-->

<script lang="ts">
  import { MotionColor } from "$lib/domain/enums";
  import { createPictographGenerationState } from "$lib/state/pictograph-generation.svelte";

  // Create reactive state
  const state = createPictographGenerationState();

  // Example data for demonstration
  const exampleLetters = ["A", "B", "C", "W", "X-", "Z-", "Σ", "α"];

  async function handleGenerateExample(letter: string) {
    const result = await state.generatePictographs(letter);
    if (result) {
      console.log(`Generated ${letter}:`, result);
    }
  }

  async function handleGenerateAll() {
    await state.generateAllPictographs();
    console.log("Generated all pictographs:", state.pictographsByLetter);
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
      onclick={() => state.clearPictographs()}
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
        <span class="font-medium">Total Letters:</span>
        {state.generationStats().totalLetters}
      </div>
      <div>
        <span class="font-medium">Total Pictographs:</span>
        {state.generationStats().totalPictographs}
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
    <h3 class="text-lg font-semibold">Generated Pictographs</h3>

    {#if state.filteredLetters.length === 0}
      <p class="text-gray-500">
        No pictographs generated yet. Try generating some pictographs above!
      </p>
    {:else}
      <div class="grid gap-4">
        {#each state.filteredLetters() as letter}
          <div class="p-4 border rounded-lg">
            <h4 class="text-lg font-semibold mb-2">
              Letter: {letter}
            </h4>

            <div class="mb-3 text-sm text-gray-600">
              <span
                >Pictographs: {state.getPictographsByLetter(letter)?.length ||
                  0}</span
              >
            </div>

            <details>
              <summary class="cursor-pointer text-blue-600 hover:text-blue-800"
                >View Pictographs</summary
              >
              <div class="mt-3 space-y-2">
                {#each state.getPictographsByLetter(letter) || [] as pictograph, i}
                  <div class="p-3 bg-gray-50 rounded text-sm">
                    <div class="font-medium mb-1">Pictograph {i + 1}</div>
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <div>
                          <strong>ID:</strong>
                          {pictograph.id}
                        </div>
                        <div><strong>Letter:</strong> {pictograph.letter}</div>
                        <div>
                          <strong>Position:</strong>
                          {pictograph.startPosition} → {pictograph.endPosition}
                        </div>
                      </div>
                      <div>
                        <div>
                          <strong>Blue Motion:</strong>
                          {pictograph.motions?.[MotionColor.BLUE]?.motionType ||
                            "N/A"}
                          {pictograph.motions?.[MotionColor.BLUE]
                            ?.rotationDirection || ""}
                        </div>
                        <div>
                          <strong>Red Motion:</strong>
                          {pictograph.motions?.[MotionColor.RED]?.motionType ||
                            "N/A"}
                          {pictograph.motions?.[MotionColor.RED]
                            ?.rotationDirection || ""}
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
const movementB = await state.generatePictographData('B');
const movementZDash = await state.generatePictographData('Z-');
const movementSigma = await state.generatePictographData('Σ');

// Generate all movements at once
await state.generateAllMovements();

// Access generated data
const allSets = state.PictographDatas;
const filteredSets = state.filteredPictographDatas;
const stats = state.generationStats;</code
      ></pre>
  </div>
</div>

<style>
  code {
    font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  }
</style>
