<!--
🎯 ENHANCED START POSITION PICKER

Simplified enhanced start position picker that shows actual pictographs instead of placeholder symbols.
Uses existing TKA constructor infrastructure while providing visual pictograph previews.

This is a transitional implementation that works with current systems while we complete schema consolidation.
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
  const unsubscribe = pictographDataStore.subscribe((data) => {
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
  // LIFECYCLE
  // ============================================================================

  onMount(async () => {
    if (!browser) return;
    
    try {
      await initializeStartPositions();
      await loadStartPositionPictographs();
    } catch (err) {
      console.error('Failed to initialize start position picker:', err);
      error = err instanceof Error ? err.message : 'Failed to load start positions';
    } finally {
      isLoading = false;
    }
  });

  onDestroy(() => {
    cleanup();
  });

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  async function initializeStartPositions(): Promise<void> {
    try {
      // Create application container with enterprise DI
      const container = ApplicationFactory.createProductionApp();
      
      // Resolve pictograph orchestrator
      pictographOrchestrator = container.resolve('IPictographOrchestrator');
      
      // Create start position data with pictographs
      startPositions = createStartPositionData(container);
      
    } catch (error) {
      console.error('Failed to initialize pictograph services:', error);
      throw error;
    }
  }

  async function loadStartPositionPictographs(): Promise<void> {
    if (!pictographOrchestrator) {
      throw new Error('Pictograph orchestrator not initialized');
    }

    try {
      // Create enhanced start position data with actual pictographs
      const enhancedPositions = await Promise.all(
        startPositions.map(async (position) => {
          // Create pictograph data for each start position
          const pictographData = await createStartPositionPictograph(position);
          
          return {
            ...position,
            pictographData,
            isEnhanced: true
          };
        })
      );

      startPositions = enhancedPositions;
      
    } catch (error) {
      console.error('Failed to load start position pictographs:', error);
      throw error;
    }
  }

  async function createStartPositionPictograph(position: any): Promise<any> {
    if (!pictographOrchestrator) {
      throw new Error('Pictograph orchestrator not initialized');
    }

    // Create a pictograph with the appropriate start position
    const pictographData = pictographOrchestrator.createPictograph();
    
    // Enhance with start position specific data
    const enhancedData = {
      ...pictographData,
      letter: position.letter,
      startPosition: position.startPosition,
      metadata: {
        ...pictographData.metadata,
        startPositionType: position.id,
        displayName: position.name
      }
    };

    return enhancedData;
  }

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  function selectPosition(position: any): void {
    selectedPosition = position;
    
    // Update global store
    selectedStartPos.set(position.startPosition || position.id);
    
    // Trigger haptic feedback
    if (browser) {
      hapticFeedbackService.trigger('selection');
    }
    
    // Dispatch custom event for parent components
    const event = new CustomEvent('start-position-selected', {
      detail: { position },
      bubbles: true
    });
    
    document.dispatchEvent(event);
  }

  function handlePictographClick(event: CustomEvent, position: any): void {
    selectPosition(position);
  }

  function handleKeydown(event: KeyboardEvent, position: any): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectPosition(position);
    }
  }

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  function cleanup(): void {
    pictographOrchestrator = null;
    startPositions = [];
    selectedPosition = null;
  }

  function getPositionDisplayName(position: any): string {
    return position.name || position.id || 'Unknown';
  }

  function getPositionLetter(position: any): string {
    return position.letter || position.id?.charAt(0)?.toUpperCase() || '?';
  }

  function isPositionSelected(position: any): boolean {
    return selectedPosition?.id === position.id;
  }

  // ============================================================================
  // REACTIVE STATEMENTS
  // ============================================================================

  $: if (browser && selectedStartPos) {
    // Sync with global store
    const matchingPosition = startPositions.find(
      pos => pos.startPosition === $selectedStartPos || pos.id === $selectedStartPos
    );
    
    if (matchingPosition && selectedPosition?.id !== matchingPosition.id) {
      selectedPosition = matchingPosition;
    }
  }
</script>

<!-- ============================================================================ -->
<!-- COMPONENT TEMPLATE -->
<!-- ============================================================================ -->

<div class="start-pos-picker">
  <div class="picker-header">
    <h3 class="picker-title">Choose Start Position</h3>
    <p class="picker-description">Select your starting position for the sequence</p>
  </div>

  {#if isLoading}
    <div class="loading-container">
      <LoadingSpinner />
      <p class="loading-text">Loading start positions...</p>
    </div>
  {:else if error}
    <div class="error-container">
      <div class="error-icon">⚠️</div>
      <h4 class="error-title">Failed to Load</h4>
      <p class="error-message">{error}</p>
      <button 
        class="retry-button"
        on:click={() => window.location.reload()}
      >
        Retry
      </button>
    </div>
  {:else if startPositions.length === 0}
    <div class="empty-container">
      <div class="empty-icon">📍</div>
      <h4 class="empty-title">No Start Positions</h4>
      <p class="empty-message">No start positions are currently available</p>
    </div>
  {:else}
    <div class="positions-grid">
      {#each startPositions as position (position.id)}
        <div 
          class="position-card"
          class:selected={isPositionSelected(position)}
          role="button"
          tabindex="0"
          on:click={() => selectPosition(position)}
          on:keydown={(e) => handleKeydown(e, position)}
        >
          <div class="position-pictograph">
            {#if position.isEnhanced && position.pictographData}
              <EnhancedPictograph
                pictographData={position.pictographData}
                width={200}
                height={200}
                isInteractive={true}
                isSelected={isPositionSelected(position)}
                on:pictographClick={(e) => handlePictographClick(e, position)}
              />
            {:else}
              <!-- Fallback for non-enhanced positions -->
              <div class="fallback-pictograph">
                <div class="fallback-letter">{getPositionLetter(position)}</div>
              </div>
            {/if}
          </div>
          
          <div class="position-info">
            <h4 class="position-name">{getPositionDisplayName(position)}</h4>
            <p class="position-letter">Letter: {getPositionLetter(position)}</p>
          </div>
          
          <div class="selection-indicator">
            {#if isPositionSelected(position)}
              <div class="selected-checkmark">✓</div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- ============================================================================ -->
<!-- COMPONENT STYLES -->
<!-- ============================================================================ -->

<style>
  .start-pos-picker {
    padding: 24px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .picker-header {
    text-align: center;
    margin-bottom: 32px;
  }

  .picker-title {
    font-size: 24px;
    font-weight: 600;
    color: #1a202c;
    margin: 0 0 8px 0;
  }

  .picker-description {
    font-size: 16px;
    color: #718096;
    margin: 0;
  }

  /* Loading State */
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 24px;
  }

  .loading-text {
    margin-top: 16px;
    font-size: 16px;
    color: #718096;
  }

  /* Error State */
  .error-container {
    text-align: center;
    padding: 48px 24px;
  }

  .error-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .error-title {
    font-size: 20px;
    font-weight: 600;
    color: #e53e3e;
    margin: 0 0 8px 0;
  }

  .error-message {
    font-size: 16px;
    color: #718096;
    margin: 0 0 24px 0;
  }

  .retry-button {
    background: #007acc;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 12px 24px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .retry-button:hover {
    background: #005a9e;
  }

  /* Empty State */
  .empty-container {
    text-align: center;
    padding: 48px 24px;
  }

  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .empty-title {
    font-size: 20px;
    font-weight: 600;
    color: #4a5568;
    margin: 0 0 8px 0;
  }

  .empty-message {
    font-size: 16px;
    color: #718096;
    margin: 0;
  }

  /* Positions Grid */
  .positions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 24px;
    max-width: 900px;
    margin: 0 auto;
  }

  .position-card {
    position: relative;
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: center;
  }

  .position-card:hover {
    border-color: #007acc;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 122, 204, 0.15);
  }

  .position-card.selected {
    border-color: #007acc;
    background: #f7fafc;
    box-shadow: 0 0 0 3px rgba(0, 122, 204, 0.1);
  }

  .position-card:focus {
    outline: none;
    border-color: #007acc;
    box-shadow: 0 0 0 3px rgba(0, 122, 204, 0.2);
  }

  .position-pictograph {
    margin-bottom: 16px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .fallback-pictograph {
    width: 200px;
    height: 200px;
    background: #f7fafc;
    border: 2px dashed #cbd5e0;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .fallback-letter {
    font-size: 48px;
    font-weight: 600;
    color: #4a5568;
  }

  .position-info {
    margin-bottom: 12px;
  }

  .position-name {
    font-size: 18px;
    font-weight: 600;
    color: #1a202c;
    margin: 0 0 4px 0;
  }

  .position-letter {
    font-size: 14px;
    color: #718096;
    margin: 0;
  }

  .selection-indicator {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 24px;
    height: 24px;
  }

  .selected-checkmark {
    width: 24px;
    height: 24px;
    background: #007acc;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .start-pos-picker {
      padding: 16px;
    }

    .positions-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .position-card {
      padding: 16px;
    }

    .position-pictograph {
      margin-bottom: 12px;
    }

    .fallback-pictograph {
      width: 150px;
      height: 150px;
    }

    .fallback-letter {
      font-size: 36px;
    }
  }
</style>
