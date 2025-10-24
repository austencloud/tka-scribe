<!--
LevelSelectionModal.svelte - Modal for selecting difficulty level
Displays three large, clickable options for level selection
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "$shared";
  import { resolve, TYPES } from "$shared";
  import { onMount } from "svelte";
  import { DifficultyLevel } from "../../shared/domain";

  let { currentLevel, onLevelSelect, onClose } = $props<{
    currentLevel: DifficultyLevel;
    onLevelSelect: (level: DifficultyLevel) => void;
    onClose: () => void;
  }>();

  let hapticService: IHapticFeedbackService;
  let modalElement: HTMLElement;

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(TYPES.IHapticFeedbackService);

    // Focus the modal for accessibility
    modalElement?.focus();

    // Prevent body scroll
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  });

  // Level options data
  const levelOptions = [
    {
      level: DifficultyLevel.BEGINNER,
      number: "1",
      name: "No Turns",
      icon: "🟢",
      description: "Basic movements only - perfect for beginners",
      gradient: "linear-gradient(135deg, #4ade80, #22c55e)"
    },
    {
      level: DifficultyLevel.INTERMEDIATE,
      number: "2",
      name: "Whole Turns",
      icon: "🟡",
      description: "Full rotation movements - intermediate difficulty",
      gradient: "linear-gradient(135deg, #fbbf24, #f59e0b)"
    },
    {
      level: DifficultyLevel.ADVANCED,
      number: "3",
      name: "Half Turns",
      icon: "🔴",
      description: "Complex partial rotations - advanced techniques",
      gradient: "linear-gradient(135deg, #f87171, #ef4444)"
    }
  ];

  function selectLevel(level: DifficultyLevel) {
    hapticService?.trigger("selection");
    onLevelSelect(level);
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      onClose();
    }
  }
</script>

<div
  class="modal-backdrop"
  onclick={handleBackdropClick}
  onkeydown={handleKeydown}
  bind:this={modalElement}
  tabindex="-1"
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
>
  <div class="modal-content">
    <div class="modal-header">
      <h2 id="modal-title">Select Difficulty Level</h2>
      <button
        class="close-button"
        onclick={onClose}
        aria-label="Close modal"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    <div class="level-options">
      {#each levelOptions as option}
        <button
          class="level-option"
          class:selected={currentLevel === option.level}
          onclick={() => selectLevel(option.level)}
          style="background: {option.gradient}"
        >
          <div class="option-icon">{option.icon}</div>
          <div class="option-number">{option.number}</div>
          <div class="option-name">{option.name}</div>

          {#if currentLevel === option.level}
            <div class="selected-indicator">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20,6 9,17 4,12"></polyline>
              </svg>
            </div>
          {/if}
        </button>
      {/each}
    </div>
  </div>
</div>

<style>
  .modal-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 16px;
  }

  .modal-content {
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.15),
      rgba(255, 255, 255, 0.05)
    );
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 16px;
    max-width: 100%;
    width: 100%;
    max-height: 100%;
    overflow-y: auto;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    container-type: inline-size;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .modal-header h2 {
    color: white;
    font-size: 14px;
    font-weight: 700;
    margin: 0;
    line-height: 1.2;
  }

  .close-button {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    padding: 4px;
    border-radius: 6px;
    transition: all 0.2s ease;
    width: 24px;
    height: 24px;
    flex-shrink: 0;
  }

  .close-button:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  .close-button svg {
    width: 100%;
    height: 100%;
  }

  .level-options {
    display: flex;
    flex-direction: row;
    gap: 8px;
    justify-content: space-between;

    /* Only use column layout on very narrow containers */
    @container (max-width: 250px) {
      flex-direction: column;
    }
  }

  .level-option {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px 8px;
    border: 1px solid transparent;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    color: white;
    text-align: center;
    min-height: auto;
    justify-content: center;
    flex: 1 1 0;
    min-width: 0;
  }

  .level-option:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .level-option.selected {
    border-color: rgba(255, 255, 255, 0.5);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }

  .option-icon {
    font-size: 16px;
    margin-bottom: 2px;
    line-height: 1;
  }

  .option-number {
    font-size: 18px;
    font-weight: 900;
    line-height: 1;
    margin-bottom: 2px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }

  .option-name {
    font-size: 11px;
    font-weight: 700;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    line-height: 1.2;
  }

  .selected-indicator {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 24px;
    height: 24px;
    color: white;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .selected-indicator svg {
    width: 16px;
    height: 16px;
  }

  /* Mobile responsive - removed as panel-constrained modals use compact sizing by default */
</style>
