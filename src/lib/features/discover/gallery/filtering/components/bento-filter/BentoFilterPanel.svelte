<!--
BentoFilterPanel.svelte - Modern Bento box style filter panel
Displays filter cards in a responsive grid with scope toggle
Uses shared parameter cards from $lib/shared/components/parameter-cards
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import { tryResolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import { onMount } from "svelte";
  import type { ExploreFilterValue } from "$lib/shared/persistence/domain/types/FilteringTypes";
  import type { DifficultyLevel } from "$lib/shared/domain/models/sequence-parameters";

  // Shared parameter cards
  import {
    LevelCard,
    LetterCard,
    LengthCard,
    FavoritesCard,
    OptionsCard,
  } from "$lib/shared/components/parameter-cards";
  import type { PictographData } from "$lib/shared/pictograph/shared/domain/models/PictographData";

  let {
    currentFilter = { type: "all", value: null },
    scope = "community",
    startPosition = null,
    endPosition = null,
    onFilterChange = () => {},
    onScopeChange = () => {},
    onOpenLetterSheet = () => {},
    onOpenOptionsSheet = () => {},
  } = $props<{
    currentFilter?: { type: string; value: ExploreFilterValue };
    scope?: "community" | "library";
    startPosition?: PictographData | null;
    endPosition?: PictographData | null;
    onFilterChange?: (type: string, value?: ExploreFilterValue) => void;
    onScopeChange?: (scope: "community" | "library") => void;
    onOpenLetterSheet?: () => void;
    onOpenOptionsSheet?: () => void;
  }>();

  // Count active position options
  const activeOptionsCount = $derived(
    (startPosition !== null ? 1 : 0) + (endPosition !== null ? 1 : 0)
  );

  let hapticService: IHapticFeedbackService | null = null;

  onMount(() => {
    hapticService = tryResolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  // Derived filter values
  const currentLevel = $derived(
    currentFilter.type === "difficulty"
      ? (currentFilter.value as DifficultyLevel)
      : null
  );
  const currentLetter = $derived(
    currentFilter.type === "startingLetter"
      ? (currentFilter.value as string)
      : null
  );
  const currentLength = $derived(
    currentFilter.type === "length" ? (currentFilter.value as number) : null
  );
  const isFavoritesActive = $derived(currentFilter.type === "favorites");

  // Handlers
  function handleScopeChange(newScope: "community" | "library") {
    hapticService?.trigger("selection");
    onScopeChange(newScope);
  }

  function handleLevelChange(level: DifficultyLevel | null) {
    if (level === null) {
      onFilterChange("all");
    } else {
      onFilterChange("difficulty", level);
    }
  }

  function handleFavoritesToggle(active: boolean) {
    if (active) {
      onFilterChange("favorites");
    } else {
      onFilterChange("all");
    }
  }

  function handleLengthChange(length: number | null) {
    if (length === null) {
      onFilterChange("all");
    } else {
      onFilterChange("length", length);
    }
  }
</script>

<div class="bento-filter-panel">
  <!-- Scope Toggle -->
  <div class="scope-section">
    <div class="scope-toggle">
      <div
        class="scope-slider"
        style="transform: translateX({scope === 'library' ? '100%' : '0'})"
      ></div>
      <button
        class="scope-option"
        class:active={scope === "community"}
        onclick={() => handleScopeChange("community")}
      >
        Community
      </button>
      <button
        class="scope-option"
        class:active={scope === "library"}
        onclick={() => handleScopeChange("library")}
      >
        My Library
      </button>
    </div>
  </div>

  <!-- Filter Cards Grid -->
  <div class="cards-grid">
    <LevelCard
      value={currentLevel}
      allowNull={true}
      onChange={handleLevelChange}
      gridColumnSpan={2}
      cardIndex={0}
    />

    <OptionsCard
      activeCount={activeOptionsCount}
      onOpenSheet={onOpenOptionsSheet}
      gridColumnSpan={2}
      cardIndex={1}
    />

    <FavoritesCard
      isActive={isFavoritesActive}
      onToggle={handleFavoritesToggle}
      gridColumnSpan={2}
      cardIndex={2}
    />

    <LetterCard
      value={currentLetter}
      onOpenSheet={onOpenLetterSheet}
      gridColumnSpan={3}
      cardIndex={3}
    />

    <LengthCard
      value={currentLength}
      mode="stepper"
      allowNull={true}
      onChange={handleLengthChange}
      gridColumnSpan={3}
      cardIndex={4}
    />
  </div>
</div>

<style>
  .bento-filter-panel {
    display: flex;
    flex-direction: column;
    gap: clamp(12px, 3cqi, 20px);
    padding: clamp(12px, 3cqi, 20px);
    background: #1a1a24;
    container-type: inline-size;
    container-name: bento-filter;
    height: 100%;
    overflow-y: auto;
  }

  /* Scope Toggle */
  .scope-section {
    flex-shrink: 0;
  }

  .scope-toggle {
    position: relative;
    display: flex;
    background: #252532;
    border-radius: 12px;
    padding: 4px;
  }

  .scope-slider {
    position: absolute;
    top: 4px;
    left: 4px;
    width: calc(50% - 4px);
    height: calc(100% - 8px);
    background: #3b82f6;
    border-radius: 8px;
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .scope-option {
    position: relative;
    z-index: 1;
    flex: 1;
    min-height: 52px;
    padding: 0 16px;
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    font-size: clamp(13px, 3cqi, 15px);
    font-weight: 500;
    cursor: pointer;
    transition: color 0.2s ease;
  }

  .scope-option.active {
    color: #fff;
  }

  /* Cards Grid - Default: 3 columns (6 sub-columns, cards span 2) */
  .cards-grid {
    container-type: inline-size;
    container-name: filter-cards;
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    /* Content-based rows with max height cap - prevents stretching in tall panels */
    grid-auto-rows: minmax(auto, 140px);
    gap: clamp(8px, 2cqi, 12px);
    /* Don't stretch to fill - let cards be natural size */
    align-content: start;
  }

  /* Narrow panel (< 320px): 2 columns */
  @container bento-filter (max-width: 320px) {
    .cards-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
      grid-auto-rows: minmax(auto, 120px);
    }
  }

  /* Wide panel (mobile landscape / tablet): can use more height */
  @container bento-filter (min-width: 500px) {
    .cards-grid {
      grid-template-columns: repeat(6, minmax(0, 1fr));
      grid-auto-rows: minmax(auto, 160px);
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .scope-slider {
      transition: none;
    }
    .scope-option {
      transition: none;
    }
  }
</style>
