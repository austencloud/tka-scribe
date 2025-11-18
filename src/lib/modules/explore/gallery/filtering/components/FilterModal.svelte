<!--
FilterModal.svelte

Filter modal component for the Explore module.
Provides filtering options in a modal dialog, triggered by filter button.

Follows Svelte 5 runes + microservices architecture.
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "$shared";
  import { resolve, TYPES } from "$shared";
  import { onMount } from "svelte";
  import type { ExploreFilterValue } from "../../../shared/domain";

  // ✅ PURE RUNES: Props using modern Svelte 5 runes
  const {
    currentFilter = { type: "all", value: null },
    availableSequenceLengths = [],
    onFilterChange = () => {},
    onClose = () => {},
  } = $props<{
    currentFilter?: { type: string; value: ExploreFilterValue };
    availableSequenceLengths?: number[];
    onFilterChange?: (type: string, value?: ExploreFilterValue) => void;
    onClose?: () => void;
  }>();

  let hapticService: IHapticFeedbackService;
  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  // Filter sections matching actual data
  const filterSections = [
    { id: "all", label: "All Sequences" },
    { id: "favorites", label: "Favorites" },
    { id: "difficulty", label: "Difficulty Level" },
    { id: "startingPosition", label: "Starting Position" },
    { id: "startingLetter", label: "Starting Letter" },
    { id: "containsLetters", label: "Contains Letters" },
    { id: "length", label: "Sequence Length" },
    { id: "gridMode", label: "Grid Mode" },
    // Removed tag section - no tags exist yet
  ];

  // Difficulty levels (1-3 based on actual data)
  const difficultyLevels = [1, 2, 3];

  // Starting positions (actual grid positions)
  const startingPositions = ["alpha", "beta", "gamma"];

  // Grid modes (actual modes)
  const gridModes = ["diamond", "box"];

  // Use dynamic sequence lengths from props
  const sequenceLengths = $derived(() =>
    availableSequenceLengths.sort((a: number, b: number) => a - b)
  );

  // Letters for filtering
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  // State for multi-select filters
  let selectedLetters = $state<string[]>([]);

  // Apply a filter
  function applyFilter(type: string, value?: ExploreFilterValue) {
    hapticService?.trigger("selection");
    onFilterChange(type, value);
  }

  // Toggle letter selection for "Contains Letters" filter
  function toggleLetter(letter: string) {
    if (selectedLetters.includes(letter)) {
      selectedLetters = selectedLetters.filter((l) => l !== letter);
    } else {
      selectedLetters = [...selectedLetters, letter];
    }

    if (selectedLetters.length > 0) {
      applyFilter("containsLetters", selectedLetters);
    } else {
      applyFilter("all");
    }
  }

</script>

<!-- Filter content (used inside Drawer) -->
<div class="filter-panel">
  <!-- Filter sections -->
  <div class="filter-sections">
    {#each filterSections as section}
      <div class="filter-section">
        <h3>{section.label}</h3>
        <div class="section-content">
          {#if section.id === "all"}
              <button
                class="filter-button {currentFilter.type === 'all'
                  ? 'active'
                  : ''}"
                onclick={() => applyFilter("all")}
              >
                Show All Sequences
              </button>
            {:else if section.id === "favorites"}
              <button
                class="filter-button {currentFilter.type === 'favorites'
                  ? 'active'
                  : ''}"
                onclick={() => applyFilter("favorites")}
              >
                Show Favorites Only
              </button>
            {:else if section.id === "difficulty"}
              <div class="difficulty-buttons">
                {#each difficultyLevels as level}
                  <button
                    class="filter-button {currentFilter.type === 'difficulty' &&
                    currentFilter.value === level
                      ? 'active'
                      : ''}"
                    onclick={() => applyFilter("difficulty", level)}
                  >
                    Level {level}
                  </button>
                {/each}
              </div>
            {:else if section.id === "startingPosition"}
              <div class="position-buttons">
                {#each startingPositions as position}
                  <button
                    class="filter-button {currentFilter.type ===
                      'startingPosition' && currentFilter.value === position
                      ? 'active'
                      : ''}"
                    onclick={() => applyFilter("startingPosition", position)}
                  >
                    {position}
                  </button>
                {/each}
              </div>
            {:else if section.id === "startingLetter"}
              <div class="letter-grid">
                {#each letters as letter}
                  <button
                    class="letter-button {currentFilter.type ===
                      'startingLetter' && currentFilter.value === letter
                      ? 'active'
                      : ''}"
                    onclick={() => applyFilter("startingLetter", letter)}
                  >
                    {letter}
                  </button>
                {/each}
              </div>
            {:else if section.id === "containsLetters"}
              <div class="letter-grid">
                {#each letters as letter}
                  <button
                    class="letter-button {selectedLetters.includes(letter)
                      ? 'active'
                      : ''}"
                    onclick={() => toggleLetter(letter)}
                  >
                    {letter}
                  </button>
                {/each}
              </div>
            {:else if section.id === "length"}
              <div class="length-buttons">
                {#each sequenceLengths() as length}
                  <button
                    class="filter-button {currentFilter.type === 'length' &&
                    currentFilter.value === length
                      ? 'active'
                      : ''}"
                    onclick={() => applyFilter("length", length)}
                  >
                    {length} beats
                  </button>
                {/each}
              </div>
            {:else if section.id === "gridMode"}
              <div class="grid-mode-buttons">
                {#each gridModes as mode}
                  <button
                    class="filter-button {currentFilter.type === 'gridMode' &&
                    currentFilter.value === mode
                      ? 'active'
                      : ''}"
                    onclick={() => applyFilter("gridMode", mode)}
                  >
                    {mode}
                  </button>
                {/each}
              </div>
            {/if}
        </div>
      </div>
    {/each}
  </div>

  <!-- Footer actions -->
  <div class="filter-footer">
    <button class="clear-button" onclick={() => applyFilter("all")}>
      Clear All Filters
    </button>
    <button class="apply-button" onclick={onClose}>
      Apply Filters
    </button>
  </div>
</div>

<style>
  /* Filter panel container */
  .filter-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 20px;
    overflow-y: auto;
    gap: 20px;
  }

  .filter-sections {
    display: grid;
    gap: 28px;
    flex: 1;
  }

  .filter-section {
    display: grid;
    gap: 12px;
  }

  .filter-section h3 {
    margin: 0;
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding-bottom: 4px;
  }

  /* Modern filter buttons - 2026 style */
  .filter-button {
    padding: 10px 16px;
    border: none;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.85);
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 14px;
    font-weight: 500;
    backdrop-filter: blur(8px);
    box-shadow: inset 0 0.5px 1px rgba(255, 255, 255, 0.08);
  }

  .filter-button:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.95);
    transform: translateY(-1px);
    box-shadow:
      inset 0 0.5px 1px rgba(255, 255, 255, 0.08),
      0 2px 4px rgba(0, 0, 0, 0.15);
  }

  .filter-button.active {
    background: rgba(255, 255, 255, 0.18);
    color: rgba(255, 255, 255, 0.98);
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.2),
      inset 0 0.5px 0.5px rgba(255, 255, 255, 0.15);
  }

  .filter-button:active {
    transform: scale(0.98);
  }

  .difficulty-buttons,
  .position-buttons,
  .length-buttons,
  .grid-mode-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .letter-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(42px, 1fr));
    gap: 6px;
  }

  .letter-button {
    padding: 10px 8px;
    border: none;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.85);
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 14px;
    font-weight: 600;
    text-align: center;
    backdrop-filter: blur(8px);
    box-shadow: inset 0 0.5px 1px rgba(255, 255, 255, 0.08);
  }

  .letter-button:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.95);
    transform: translateY(-1px);
    box-shadow:
      inset 0 0.5px 1px rgba(255, 255, 255, 0.08),
      0 2px 4px rgba(0, 0, 0, 0.15);
  }

  .letter-button.active {
    background: rgba(255, 255, 255, 0.18);
    color: rgba(255, 255, 255, 0.98);
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.2),
      inset 0 0.5px 0.5px rgba(255, 255, 255, 0.15);
  }

  .letter-button:active {
    transform: scale(0.96);
  }

  /* Footer actions - Modern pill buttons */
  .filter-footer {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding-top: 20px;
    margin-top: auto;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    flex-shrink: 0;
  }

  .clear-button,
  .apply-button {
    flex: 1;
    padding: 11px 20px;
    border: none;
    border-radius: 100px; /* Full pill */
    cursor: pointer;
    font-size: 14px;
    font-weight: 590;
    letter-spacing: -0.2px;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(12px);
  }

  .clear-button {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.85);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .clear-button:hover {
    background: rgba(255, 255, 255, 0.14);
    color: rgba(255, 255, 255, 0.98);
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  }

  .apply-button {
    background: rgba(59, 130, 246, 0.2);
    color: rgba(59, 130, 246, 1);
    box-shadow:
      0 1px 2px rgba(0, 0, 0, 0.1),
      inset 0 0.5px 0.5px rgba(255, 255, 255, 0.15);
  }

  .apply-button:hover {
    background: rgba(59, 130, 246, 0.3);
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  }

  .clear-button:active,
  .apply-button:active {
    transform: scale(0.97);
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .filter-button,
    .letter-button,
    .clear-button,
    .apply-button {
      transition: none;
    }
  }
</style>
