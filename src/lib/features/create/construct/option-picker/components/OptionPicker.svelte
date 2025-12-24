<!--
OptionPicker.svelte - Main option picker orchestrator

Single responsibility: Coordinate option loading, preparation, and selection.
Delegates all rendering to child components.
-->
<script lang="ts">
  import type { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
  import type { PictographData } from "$lib/shared/pictograph/shared/domain/models/PictographData";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import { onMount } from "svelte";

  import { createFadeState } from "../state/fade-state.svelte";
  import { createOptionPickerState } from "../state/option-picker-state.svelte";
  import type { IOptionLoader } from "../services/contracts/IOptionLoader";
  import type { IOptionFilter } from "../services/contracts/IOptionFilter";
  import type { IOptionSorter } from "../services/contracts/IOptionSorter";
  import type { IOptionOrganizer } from "../services/contracts/IOptionOrganizer";
  import type { IOptionSizer } from "../services/contracts/IOptionSizer";
  import type {
    IPictographPreparer,
    PreparedPictographData,
  } from "../services/PictographPreparer";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import OptionPickerContent from "./OptionPickerContent.svelte";

  // Props
  interface Props {
    currentSequence: PictographData[];
    currentGridMode: GridMode;
    onOptionSelected: (option: PictographData) => void | Promise<void>;
    isContinuousOnly?: boolean;
    onToggleContinuous?: (value: boolean) => void;
    isSideBySideLayout?: () => boolean;
    isUndoingOption?: boolean;
  }

  const {
    currentSequence,
    currentGridMode,
    onOptionSelected,
    isContinuousOnly = false,
    onToggleContinuous,
    isSideBySideLayout = () => false,
    isUndoingOption = false,
  }: Props = $props();

  // State
  const fadeState = createFadeState();
  let pickerState = $state<ReturnType<typeof createOptionPickerState> | null>(
    null
  );
  let preparedOptions = $state<PreparedPictographData[]>([]);
  let isReady = $state(false);

  // Services
  let preparer: IPictographPreparer | null = null;
  let hapticService: IHapticFeedbackService | null = null;
  let sizerService: IOptionSizer | null = null;
  let organizerService: IOptionOrganizer | null = null;

  // Track if we're waiting for new options after a selection
  let pendingFadeIn = $state(false);

  // Load options when sequence changes (don't block on fade)
  $effect(() => {
    if (!pickerState || !isReady) return;

    if (currentSequence.length > 0) {
      pickerState.loadOptions(currentSequence, currentGridMode);
    } else {
      pickerState.reset();
    }
  });

  // Prepare options when filtered options change
  $effect(() => {
    const filtered = pickerState?.filteredOptions || [];
    if (filtered.length === 0 || !preparer) {
      preparedOptions = [];
      return;
    }

    preparer.prepareBatch(filtered).then((prepared) => {
      preparedOptions = prepared;
      // Fade in after new options are ready
      if (pendingFadeIn) {
        pendingFadeIn = false;
        fadeState.fadeIn();
      }
    });
  });

  // Sync continuous filter state
  $effect(() => {
    if (pickerState && pickerState.isContinuousOnly !== isContinuousOnly) {
      pickerState.setContinuousOnly(isContinuousOnly);
    }
  });

  // Handle option selection with fade
  async function handleSelect(option: PreparedPictographData) {
    if (!pickerState || fadeState.isFading) return;

    hapticService?.trigger("selection");

    // Mark that we need to fade in after new options load
    pendingFadeIn = true;

    // Fade out, wait, then notify parent
    await fadeState.fadeOut();
    onOptionSelected(option);
    pickerState.selectOption(option);
  }

  // Initialize services
  onMount(() => {
    try {
      const loader = resolve<IOptionLoader>(TYPES.IOptionLoader);
      const filter = resolve<IOptionFilter>(TYPES.IOptionFilter);
      const sorter = resolve<IOptionSorter>(TYPES.IOptionSorter);

      organizerService = resolve<IOptionOrganizer>(
        TYPES.IOptionOrganizerService
      );
      sizerService = resolve<IOptionSizer>(TYPES.IOptionPickerSizingService);
      preparer = resolve<IPictographPreparer>(TYPES.IPictographPreparer);
      hapticService = resolve<IHapticFeedbackService>(
        TYPES.IHapticFeedbackService
      );

      pickerState = createOptionPickerState({
        optionLoader: loader,
        filterService: filter,
        optionSorter: sorter,
      });
      isReady = true;
    } catch (error) {
      console.error("Failed to initialize option picker:", error);
    }
  });
</script>

{#if !isReady}
  <div class="loading">Initializing...</div>
{:else if pickerState?.error}
  <div class="error">
    <p>Error: {pickerState.error}</p>
    <button onclick={() => pickerState?.clearError()}>Retry</button>
  </div>
{:else}
  <OptionPickerContent
    options={preparedOptions}
    {organizerService}
    {sizerService}
    isFading={fadeState.isFading}
    onSelect={handleSelect}
    {isContinuousOnly}
    {onToggleContinuous}
    {isSideBySideLayout}
  />
{/if}

<style>
  .loading,
  .error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 1rem;
    text-align: center;
    color: var(--text-muted);
  }

  .error button {
    margin-top: 0.5rem;
    padding: 0.5rem 1rem;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: var(--border-radius);
    cursor: pointer;
  }
</style>
