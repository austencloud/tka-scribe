<!--
🎯 SIMPLIFIED ENHANCED START POSITION PICKER

A working enhanced start position picker that shows actual pictographs instead of placeholder symbols.
Uses existing TKA constructor infrastructure while providing visual pictograph previews.

This is a transitional implementation that works with current systems.
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import Pictograph from '$lib/constructor/components/Pictograph/Pictograph.svelte';
  import LoadingSpinner from '$lib/constructor/components/shared/LoadingSpinner.svelte';
  import { selectedStartPos } from '$lib/constructor/stores/sequence/selectionStore.js';
  import pictographDataStore from '$lib/constructor/stores/pictograph/pictographStore.js';
  import { pictographContainer } from '$lib/constructor/state/stores/pictograph/pictographContainer.js';
  import startPositionService from '$lib/constructor/services/StartPositionService.js';
  import { isSequenceEmpty } from '$lib/constructor/state/machines/sequenceMachine/persistence.js';
  import hapticFeedbackService from '$lib/constructor/services/HapticFeedbackService.js';
  import { browser } from '$app/environment';
  import type { PictographData } from '$lib/constructor/types/PictographData.js';

  // ============================================================================
  // COMPONENT STATE
  // ============================================================================

  let gridMode = 'diamond';
  let startPositionPictographs: PictographData[] = [];
  let filteredDataAvailable = false;
  let dataInitializationChecked = false;
  let isLoading = true;
  let loadingError = false;
  let initialDataTimeout: number | null = null;

  // Subscribe to pictograph data store (same as original StartPosPicker)
  const unsubscribe = pictographDataStore.subscribe((data: any) => {
    if (!browser) return;

    if (data && data.length > 0) {
      dataInitializationChecked = true;

      const pictographData = data as PictographData[];
      const defaultStartPosKeys =
        gridMode === 'diamond'
          ? ['alpha1_alpha1', 'beta5_beta5', 'gamma11_gamma11']
          : ['alpha2_alpha2', 'beta4_beta4', 'gamma12_gamma12'];

      const filteredPictographs = pictographData.filter(
        (entry) =>
          entry.redMotionData &&
          entry.blueMotionData &&
          defaultStartPosKeys.includes(`${entry.startPos}_${entry.endPos}`)
      );

      startPositionPictographs = filteredPictographs;
      filteredDataAvailable = filteredPictographs.length > 0;

      isLoading = false;
      if (initialDataTimeout) clearTimeout(initialDataTimeout);
    } else if (dataInitializationChecked) {
      startPositionPictographs = [];
      filteredDataAvailable = false;
      isLoading = false;
    }
  });

  // ============================================================================
  // LIFECYCLE HOOKS
  // ============================================================================

  onMount(() => {
    initialDataTimeout = window.setTimeout(() => {
      if (isLoading && !dataInitializationChecked) {
        isLoading = false;
        loadingError = true;
      }
    }, 5000);

    return () => {
      unsubscribe();
      if (initialDataTimeout) {
        clearTimeout(initialDataTimeout);
      }
    };
  });

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  function safeCopyPictographData(data: PictographData): PictographData {
    const safeCopy: PictographData = {
      letter: data.letter,
      startPos: data.startPos,
      endPos: data.endPos,
      timing: data.timing,
      direction: data.direction,
      gridMode: data.gridMode,
      grid: data.grid,

      redMotionData: data.redMotionData
        ? {
            id: data.redMotionData.id,
            handRotDir: data.redMotionData.handRotDir,
            color: data.redMotionData.color,
            leadState: data.redMotionData.leadState,
            motionType: data.redMotionData.motionType,
            startLoc: data.redMotionData.startLoc,
            endLoc: data.redMotionData.endLoc,
            startOri: data.redMotionData.startOri,
            endOri: data.redMotionData.endOri,
            propRotDir: data.redMotionData.propRotDir,
            turns: data.redMotionData.turns,
            prefloatMotionType: data.redMotionData.prefloatMotionType,
            prefloatPropRotDir: data.redMotionData.prefloatPropRotDir
          }
        : null,

      blueMotionData: data.blueMotionData
        ? {
            id: data.blueMotionData.id,
            handRotDir: data.blueMotionData.handRotDir,
            color: data.blueMotionData.color,
            leadState: data.blueMotionData.leadState,
            motionType: data.blueMotionData.motionType,
            startLoc: data.blueMotionData.startLoc,
            endLoc: data.blueMotionData.endLoc,
            startOri: data.blueMotionData.startOri,
            endOri: data.blueMotionData.endOri,
            propRotDir: data.blueMotionData.propRotDir,
            turns: data.blueMotionData.turns,
            prefloatMotionType: data.blueMotionData.prefloatMotionType,
            prefloatPropRotDir: data.blueMotionData.prefloatPropRotDir
          }
        : null,

      redPropData: null,
      bluePropData: null,
      redArrowData: null,
      blueArrowData: null,
      gridData: null,

      motions: [],
      redMotion: null,
      blueMotion: null,
      props: []
    };

    return safeCopy;
  }

  const handleSelect = async (startPosPictograph: PictographData) => {
    try {
      // Provide haptic feedback when selecting a start position
      if (browser) {
        hapticFeedbackService.trigger('selection');
      }

      await startPositionService.addStartPosition(startPosPictograph);

      const startPosCopy = safeCopyPictographData(startPosPictograph);

      startPosCopy.isStartPosition = true;

      if (startPosCopy.redMotionData) {
        startPosCopy.redMotionData.motionType = 'static';
        startPosCopy.redMotionData.endLoc = startPosCopy.redMotionData.startLoc;
        startPosCopy.redMotionData.endOri = startPosCopy.redMotionData.startOri;
        startPosCopy.redMotionData.turns = 0;
      }

      if (startPosCopy.blueMotionData) {
        startPosCopy.blueMotionData.motionType = 'static';
        startPosCopy.blueMotionData.endLoc = startPosCopy.blueMotionData.startLoc;
        startPosCopy.blueMotionData.endOri = startPosCopy.blueMotionData.startOri;
        startPosCopy.blueMotionData.turns = 0;
      }

      selectedStartPos.set(startPosCopy);
      pictographContainer.setData(startPosCopy);
      isSequenceEmpty.set(false);

      try {
        localStorage.setItem('start_position', JSON.stringify(startPosCopy));
      } catch (error) {
        console.error('Failed to save start position to localStorage:', error);
      }

      if (browser) {
        const customEvent = new CustomEvent('start-position-selected', {
          detail: {
            startPosition: startPosCopy,
            isTransitioning: true
          },
          bubbles: true
        });

        document.dispatchEvent(customEvent);
        hapticFeedbackService.trigger('success');
      }
    } catch (error) {
      console.error('Error adding start position:', error);
    }
  };
</script>

<div class="enhanced-start-pos-picker">
  {#if isLoading}
    <div class="loading-container">
      <LoadingSpinner size="large" />
      <p class="loading-text">Loading Start Positions...</p>
    </div>
  {:else if loadingError}
    <div class="error-container">
      <p>Unable to load start positions. Please try refreshing the page.</p>
      <button
        onclick={() => {
          if (browser) window.location.reload();
        }}>Refresh</button
      >
    </div>
  {:else if !filteredDataAvailable}
    <div class="error-container">
      <p>No valid start positions found for the current configuration.</p>
    </div>
  {:else}
    <div class="pictograph-row">
      {#each startPositionPictographs as pictograph (pictograph.letter + '_' + pictograph.startPos + '_' + pictograph.endPos)}
        <div
          class="pictograph-container enhanced"
          role="button"
          tabindex="0"
          onclick={() => {
            handleSelect(pictograph);
          }}
          onkeydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleSelect(pictograph);
            }
          }}
        >
          <Pictograph pictographData={pictograph} showLoadingIndicator={false} debug={false} />
          <div class="position-label">
            {pictograph.letter || 'Start Position'}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .enhanced-start-pos-picker {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    min-height: 300px;
    padding: 20px 0;
    position: relative;
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    flex: 1;
  }

  .loading-text {
    margin-top: 20px;
    font-size: 1.2rem;
    color: #555;
    animation: pulse 1.5s infinite ease-in-out;
  }

  @keyframes pulse {
    0% {
      opacity: 0.6;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0.6;
    }
  }

  .error-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    background-color: rgba(255, 220, 220, 0.7);
    padding: 20px;
    border-radius: 10px;
    flex: 1;
  }

  .pictograph-row {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    width: 90%;
    gap: 3%;
    margin: auto;
    flex: 0 0 auto;
    padding: 2rem 0;
  }

  .pictograph-container {
    width: 25%;
    aspect-ratio: 1 / 1;
    height: auto;
    position: relative;
    cursor: pointer;
    transition: all 0.3s ease-in-out;
    border-radius: 12px;
    overflow: hidden;
  }

  .pictograph-container.enhanced {
    background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
    border: 2px solid rgba(255,255,255,0.2);
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  }

  .pictograph-container:hover {
    transform: scale(1.05) translateY(-5px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.2);
    border-color: rgba(255,255,255,0.4);
  }

  .position-label {
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.7);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 500;
    backdrop-filter: blur(5px);
  }
</style>
