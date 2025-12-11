<!--
CardBasedSettingsContainer - Minimal card grid renderer
Delegates ALL logic to services (SRP compliant)
-->
<script lang="ts">
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import { onMount } from "svelte";
  import { flip } from "svelte/animate";
  import { quintOut } from "svelte/easing";
  import { scale } from "svelte/transition";
  import type { CardDescriptor } from "../shared/services/contracts/ICardConfigurationService";
  import type { ICAPParameterProvider } from "../shared/services/contracts/ICAPParameterProvider";
  import type { ICardConfigurationService } from "../shared/services/contracts/ICardConfigurationService";
  import type { IResponsiveTypographyService } from "../shared/services/contracts/IResponsiveTypographyService";
  import type { UIGenerationConfig } from "../state/generate-config.svelte";
  import type { CustomizeOptionsState } from "../state/customize-options-state.svelte";
  import type {
    DifficultyLevel,
    GenerationMode,
    PropContinuity,
  } from "../shared/domain/models/generate-models";
  import type {
    CAPType,
    SliceSize,
  } from "../circular/domain/models/circular-models";
  import { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
  // Card components
  import CAPCard from "./cards/CAPCard.svelte";
  import GenerationModeCard from "./cards/GenerationModeCard.svelte";
  import GridModeCard from "./cards/GridModeCard.svelte";
  import LengthCard from "./cards/LengthCard.svelte";
  import LevelCard from "./cards/LevelCard.svelte";
  import PropContinuityCard from "./cards/PropContinuityCard.svelte";
  import SliceSizeCard from "./cards/SliceSizeCard.svelte";
  import TurnIntensityCard from "./cards/TurnIntensityCard.svelte";
  import GenerateButtonCard from "./cards/GenerateButtonCard.svelte";
  import CustomizeCard from "./cards/CustomizeCard.svelte";

  // Props
  let {
    config,
    isFreeformMode,
    updateConfig,
    isGenerating,
    onGenerateClicked,
    customizeState,
    constrainSize = false,
  } = $props<{
    config: UIGenerationConfig;
    isFreeformMode: boolean;
    updateConfig: (updates: Partial<UIGenerationConfig>) => void;
    isGenerating: boolean;
    onGenerateClicked: (options: any) => Promise<void>;
    customizeState?: CustomizeOptionsState;
    /** When true, constrain max dimensions (used when workspace is empty) */
    constrainSize?: boolean;
  }>();

  // Services - use $state to make them reactive
  let typographyService = $state<IResponsiveTypographyService | null>(null);
  let cardConfigService = $state<ICardConfigurationService | null>(null);
  let capParamProvider = $state<ICAPParameterProvider | null>(null);

  // State
  let headerFontSize = $state("9px");
  let positionsResetTrigger = $state(0); // Increment to trigger reset animation

  // Derived values - now safe because services are reactive $state
  let currentLevel = $derived(
    capParamProvider?.numberToDifficulty(config.level) ?? null
  );
  let allowedIntensityValues = $derived(
    currentLevel && capParamProvider
      ? capParamProvider.getAllowedTurnsForLevel(currentLevel)
      : []
  );

  // Initialize services
  onMount(() => {
    typographyService = resolve<IResponsiveTypographyService>(
      TYPES.IResponsiveTypographyService
    );
    cardConfigService = resolve<ICardConfigurationService>(
      TYPES.ICardConfigurationService
    );
    capParamProvider = resolve<ICAPParameterProvider>(
      TYPES.ICAPParameterProvider
    );

    updateFontSize();
    window.addEventListener("resize", updateFontSize);

    return () => window.removeEventListener("resize", updateFontSize);
  });

  function updateFontSize() {
    if (!typographyService) return;
    // Desktop gets larger header text (11-18px) for better readability
    // Mobile/tablet stays at (9-14px)
    const isDesktop = window.innerWidth >= 1280;
    headerFontSize = isDesktop
      ? typographyService.calculateResponsiveFontSize(11, 18, 1.2)
      : typographyService.calculateResponsiveFontSize(9, 14, 1.2);
  }

  // Event handlers - safe because we check capParamProvider exists
  function handleLevelChange(level: DifficultyLevel) {
    if (!capParamProvider) return;
    updateConfig({ level: capParamProvider.difficultyToNumber(level) });
  }

  function handleLengthChange(length: number) {
    updateConfig({ length });
  }

  function handleTurnIntensityChange(turnIntensity: number) {
    updateConfig({ turnIntensity });
  }

  function handlePropContinuityChange(propContinuity: PropContinuity) {
    updateConfig({ propContinuity });
  }

  function handleGridModeChange(gridMode: GridMode) {
    updateConfig({ gridMode });

    // Check if we have positions to clear
    const hasPositions = customizeState?.options?.startPosition !== null ||
                         customizeState?.options?.endPosition !== null;

    if (hasPositions) {
      // Trigger animation FIRST
      positionsResetTrigger++;

      // Clear positions at animation midpoint (150ms into 300ms animation)
      // This makes the text change happen while it's invisible
      setTimeout(() => {
        customizeState?.clearPositions();
      }, 150);
    }
  }

  function handleGenerationModeChange(mode: GenerationMode) {
    updateConfig({ mode });
  }

  function handleCAPTypeChange(capType: CAPType) {
    updateConfig({ capType });
  }

  function handleSliceSizeChange(sliceSize: SliceSize) {
    updateConfig({ sliceSize });
  }

  // Customize options handler
  function handleCustomizeChange(options: any) {
    customizeState?.setOptions(options);
  }

  // Build cards using service - reactive to all dependencies
  let cards = $derived.by((): CardDescriptor[] => {
    if (!cardConfigService || !currentLevel) return [];

    return cardConfigService.buildCardDescriptors(
      config,
      currentLevel,
      isFreeformMode,
      {
        handleLevelChange,
        handleLengthChange,
        handleTurnIntensityChange,
        handlePropContinuityChange,
        handleGridModeChange,
        handleGenerationModeChange,
        handleCAPTypeChange,
        handleSliceSizeChange,
        handleCustomizeChange: customizeState
          ? handleCustomizeChange
          : undefined,
        customizeOptions: customizeState?.options,
        positionsResetTrigger,
        currentGridMode: config.gridMode,
        handleGenerateClick: onGenerateClicked,
      },
      headerFontSize,
      allowedIntensityValues,
      isGenerating
    );
  });
</script>

<div class="card-settings-container" class:constrained={constrainSize}>
  {#each cards as card (card.id)}
    <div
      class="card-wrapper"
      style:grid-column="span {card.gridColumnSpan}"
      animate:flip={{ duration: 300, easing: quintOut }}
      in:scale={{ start: 0.95, duration: 300, easing: quintOut }}
      out:scale={{ start: 0.95, duration: 250, easing: quintOut }}
    >
      <!-- Props are dynamically typed by CardConfigurationService - type assertion needed -->
      {#if card.id === "level"}
        <LevelCard {...card.props as any} />
      {:else if card.id === "length"}
        <LengthCard {...card.props as any} />
      {:else if card.id === "generation-mode"}
        <GenerationModeCard {...card.props as any} />
      {:else if card.id === "grid-mode"}
        <GridModeCard {...card.props as any} />
      {:else if card.id === "prop-continuity"}
        <PropContinuityCard {...card.props as any} />
      {:else if card.id === "slice-size"}
        <SliceSizeCard {...card.props as any} />
      {:else if card.id === "turn-intensity"}
        <TurnIntensityCard {...card.props as any} />
      {:else if card.id === "cap-type"}
        <CAPCard {...card.props as any} />
      {:else if card.id === "customize"}
        <CustomizeCard {...card.props as any} />
      {:else if card.id === "generate-button"}
        <GenerateButtonCard {...card.props as any} />
      {/if}
    </div>
  {/each}
</div>

<style>
  .card-settings-container {
    /* No position property - allows modals to escape and position relative to tool-panel */
    container-type: size; /* Enable both inline and block size container queries */
    container-name: settings-grid; /* Name the container for explicit targeting */
    display: grid;

    /* Fill available space - parent controls overall sizing */
    flex: 1 1 auto;
    width: 100%;
    margin: 0 auto; /* Center horizontally */
    align-self: center; /* Center vertically in flex container */

    /* Use programmatic element spacing from parent */
    gap: var(--element-spacing);

    /* 🎯 SHARED CARD TEXT STYLING - Consistent across all cards */
    --card-text-size: clamp(16px, 2.2vmin, 30px);
    --card-text-weight: 700;
    --card-text-spacing: 0.3px;
    --card-text-shadow:
      0 2px 6px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 255, 255, 0.2);

    min-height: 0; /* Allow flex to shrink */
    overflow: visible; /* Allow cards to pop over neighbors and modals to escape */

    /* 6-subcolumn grid for flexible last-row spanning
       - Normal cards span 2 subcolumns (2/6 = 1/3 width)
       - 1 card in last row spans 6 subcolumns (full width)
       - 2 cards in last row each span 3 subcolumns (half width each)
    */
    grid-template-columns: repeat(6, minmax(0, 1fr));
    grid-auto-rows: 1fr; /* Rows divide available space equally */
    grid-auto-flow: row;
    align-content: center;

    /* Smooth transition for size changes (syncs with workspace 450ms animation) */
    transition:
      max-width 450ms cubic-bezier(0.4, 0, 0.2, 1),
      max-height 450ms cubic-bezier(0.4, 0, 0.2, 1),
      padding 450ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  /*
   * CONSTRAINED MODE: When workspace is empty, limit card grid size
   * so cards don't become enormous filling the full screen.
   *
   * The aspect-ratio constraints from container queries still apply,
   * but we also cap absolute dimensions to prevent giant cards.
   */
  .card-settings-container.constrained {
    /* Use aspect-ratio based height limit that matches non-constrained behavior
       This prevents jarring jumps when transitioning between states */
    max-height: min(85%, 550px, 120cqw);
  }

  .card-wrapper {
    display: flex;
    flex-direction: column;
    min-height: 0;
    min-width: 0;
    overflow: visible; /* Allow cards to pop over neighbors */
    transition: grid-column 350ms ease;
  }

  .card-wrapper > :global(*) {
    flex: 1;
    min-height: 0;
    min-width: 0;
  }

  /*
   * ASPECT RATIO CONSTRAINTS: Keep grid roughly square (max 1.2:1 portrait)
   *
   * When container is too portrait-oriented (taller than 1.2× its width),
   * limit the grid's max-height to maintain roughly square cards.
   * Use width-based calculation: max-height = width × 1.2
   *
   * The grid with 3 rows of cards looks best when aspect ratio is close to 1:1.
   * Beyond 1.2:1 portrait, cards become uncomfortably tall rectangles.
   */

  /* Portrait containers: limit height to maintain card squareness */
  /* max-aspect-ratio: 1/1.2 means "when height/width > 1.2" */
  @container (max-aspect-ratio: 1 / 1.2) {
    .card-settings-container {
      /* Limit height to 120% of container width */
      max-height: 120cqw;
    }
  }

  /* Tighter constraint for very small screens (iPhone SE width)
     At <400px, every pixel matters - allow slightly more portrait ratio */
  @container (max-width: 400px) and (max-aspect-ratio: 1 / 1.3) {
    .card-settings-container {
      /* Allow up to 130% on tiny screens */
      max-height: 130cqw;
    }
  }

  /* Larger screens (tablets, foldables) can afford tighter aspect constraints */
  @container (min-width: 500px) and (max-aspect-ratio: 1 / 1.15) {
    .card-settings-container {
      /* Tighter constraint: 115% of width */
      max-height: 115cqw;
    }
  }

  /* Desktop constrained: Allow slightly larger limits */
  @media (min-width: 1024px) {
    .card-settings-container.constrained {
      max-width: min(650px, 95%);
      max-height: min(85%, 650px, 115cqw);
    }
  }

  /* Accessibility: Respect reduced motion preference */
  @media (prefers-reduced-motion: reduce) {
    .card-wrapper {
      transition: none;
    }
  }
</style>
