<!--
AnimateControls.svelte

Context-aware button panel for the Animate tab.
Provides animation playback controls (play/pause, navigation, speed, fullscreen).
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "$shared";
  import { resolve, TYPES } from "$shared";
  import { onMount } from "svelte";

  // Props interface
  const {
    // Animation state
    isPlaying = false,
    currentBeat = 0,
    totalBeats = 0,
    speed = 1.0,
    shouldLoop = false,

    // Event handlers
    onPlayPause,
    onPrevious,
    onNext,
    onSpeedChange,
    onLoopToggle,

    // Panel visibility
    visible = true
  }: {
    // Animation state
    isPlaying?: boolean;
    currentBeat?: number;
    totalBeats?: number;
    speed?: number;
    shouldLoop?: boolean;

    // Event handlers
    onPlayPause?: () => void;
    onPrevious?: () => void;
    onNext?: () => void;
    onSpeedChange?: (speed: number) => void;
    onLoopToggle?: () => void;

    // Panel visibility
    visible?: boolean;
  } = $props();

  // Services
  let hapticService: IHapticFeedbackService;

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(TYPES.IHapticFeedbackService);
  });

  // Button handlers
  function handlePlayPause() {
    hapticService?.trigger("selection");
    onPlayPause?.();
  }

  function handlePrevious() {
    hapticService?.trigger("selection");
    onPrevious?.();
  }

  function handleNext() {
    hapticService?.trigger("selection");
    onNext?.();
  }

  function handleSpeedInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const newSpeed = parseFloat(target.value);
    hapticService?.trigger("selection");
    onSpeedChange?.(newSpeed);
  }

  function handleLoopToggle() {
    hapticService?.trigger("selection");
    onLoopToggle?.();
  }
</script>

{#if visible}
  <div class="animate-controls">
    <!-- Primary Play/Pause Button - Hero CTA -->
    <button
      class="primary-play-button"
      onclick={handlePlayPause}
      aria-label={isPlaying ? "Pause animation" : "Play animation"}
      title={isPlaying ? "Pause" : "Play"}
    >
      {#if isPlaying}
        <i class="fa-solid fa-pause" aria-hidden="true"></i>
      {:else}
        <i class="fa-solid fa-play" aria-hidden="true"></i>
      {/if}
    </button>

    <!-- Speed Control + Loop Toggle - Inline -->
    <div class="controls-row">
      <div class="speed-control">
        <label for="speed-slider" class="speed-label">Speed</label>
        <input
          id="speed-slider"
          type="range"
          min="0.25"
          max="2"
          step="0.25"
          value={speed}
          oninput={handleSpeedInput}
          aria-label="Animation speed"
        />
        <span class="speed-value">{speed.toFixed(2)}x</span>
      </div>

      <button
        class="loop-button"
        class:active={shouldLoop}
        onclick={handleLoopToggle}
        aria-label={shouldLoop ? "Disable loop" : "Enable loop"}
        title={shouldLoop ? "Loop: On" : "Loop: Off"}
      >
        <i class="fa-solid fa-repeat" aria-hidden="true"></i>
      </button>
    </div>
  </div>
{/if}

<style>
  .animate-controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    max-width: 400px;
    box-sizing: border-box;
  }

  /* Primary Play Button - Hero CTA */
  .primary-play-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 32px;
    color: #ffffff;

    /* Eye-catching gradient */
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    border: 2px solid rgba(59, 130, 246, 0.5);
    box-shadow:
      0 8px 24px rgba(59, 130, 246, 0.5),
      0 0 40px rgba(59, 130, 246, 0.3),
      inset 0 2px 4px rgba(255, 255, 255, 0.2);
  }

  .primary-play-button:hover:not(:disabled) {
    transform: scale(1.1);
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    box-shadow:
      0 12px 32px rgba(59, 130, 246, 0.6),
      0 0 60px rgba(59, 130, 246, 0.4),
      inset 0 2px 4px rgba(255, 255, 255, 0.3);
  }

  .primary-play-button:active:not(:disabled) {
    transform: scale(1.05);
    transition: all 0.1s ease;
  }

  .primary-play-button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .primary-play-button:focus-visible {
    outline: 3px solid #818cf8;
    outline-offset: 4px;
  }

  /* Controls row - inline speed + loop */
  .controls-row {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
  }

  /* Speed control - grows to fill space */
  .speed-control {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    flex: 1;
    min-width: 0;
  }

  .speed-label {
    font-size: 11px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    white-space: nowrap;
  }

  #speed-slider {
    flex: 1;
    height: 6px;
    -webkit-appearance: none;
    appearance: none;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
    outline: none;
    min-width: 60px;
  }

  #speed-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    transition: all 0.2s ease;
  }

  #speed-slider::-webkit-slider-thumb:hover {
    transform: scale(1.2);
    box-shadow: 0 3px 8px rgba(59, 130, 246, 0.5);
  }

  #speed-slider::-moz-range-thumb {
    width: 18px;
    height: 18px;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    transition: all 0.2s ease;
  }

  #speed-slider::-moz-range-thumb:hover {
    transform: scale(1.2);
    box-shadow: 0 3px 8px rgba(59, 130, 246, 0.5);
  }

  .speed-value {
    font-size: 12px;
    font-weight: 700;
    color: #ffffff;
    min-width: 42px;
    text-align: right;
  }

  /* Loop button - compact, square-ish */
  .loop-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    padding: 0;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 18px;
    color: rgba(255, 255, 255, 0.8);
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    flex-shrink: 0;
  }

  .loop-button:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.25);
    color: #ffffff;
    transform: scale(1.05);
  }

  .loop-button.active {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border-color: rgba(16, 185, 129, 0.4);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    color: #ffffff;
  }

  .loop-button.active:hover {
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
  }

  .loop-button:focus-visible {
    outline: 2px solid #818cf8;
    outline-offset: 2px;
  }

  /* Mobile responsive adjustments */
  @media (max-width: 768px) {
    .animate-controls {
      gap: 6px;
      max-width: 350px;
    }

    .primary-play-button {
      width: 72px;
      height: 72px;
      font-size: 28px;
    }

    .controls-row {
      gap: 6px;
    }

    .speed-control {
      padding: 6px 10px;
    }

    .loop-button {
      width: 44px;
      height: 44px;
      font-size: 16px;
    }

    .speed-label {
      font-size: 10px;
    }

    .speed-value {
      font-size: 11px;
      min-width: 38px;
    }
  }

  @media (max-width: 480px) {
    .animate-controls {
      gap: 4px;
      max-width: 300px;
    }

    .primary-play-button {
      width: 64px;
      height: 64px;
      font-size: 24px;
    }

    .controls-row {
      gap: 4px;
    }

    .speed-control {
      padding: 5px 8px;
      gap: 6px;
    }

    .loop-button {
      width: 40px;
      height: 40px;
      font-size: 14px;
    }

    .speed-label {
      font-size: 9px;
    }

    .speed-value {
      font-size: 10px;
      min-width: 35px;
    }

    #speed-slider {
      min-width: 50px;
    }
  }

  /* Very narrow viewports - prioritize play button */
  @media (max-width: 400px) {
    .animate-controls {
      gap: 4px;
    }

    .primary-play-button {
      width: 56px;
      height: 56px;
      font-size: 20px;
    }

    .speed-control {
      padding: 4px 6px;
      gap: 4px;
    }

    .loop-button {
      width: 36px;
      height: 36px;
      font-size: 12px;
    }

    .speed-label {
      display: none; /* Hide label to save space */
    }

    .speed-value {
      font-size: 9px;
      min-width: 32px;
    }

    #speed-slider {
      min-width: 40px;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .primary-play-button,
    .loop-button,
    #speed-slider::-webkit-slider-thumb,
    #speed-slider::-moz-range-thumb {
      transition: none;
    }

    .primary-play-button:hover:not(:disabled),
    .primary-play-button:active:not(:disabled),
    .loop-button:hover:not(:disabled) {
      transform: none;
    }
  }
</style>
