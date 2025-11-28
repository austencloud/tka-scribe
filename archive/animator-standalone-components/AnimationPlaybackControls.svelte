<script lang="ts">
  import type { IHapticFeedbackService } from "../../src/lib/shared/application/services/contracts/IHapticFeedbackService";
  import { resolve } from "../../src/lib/shared/inversify/container";
  import { TYPES } from "../../src/lib/shared/inversify/types";
  import { onMount } from "svelte";

  let {
    isPlaying,
    isEngineInitialized,
    onPlayToggle,
    onReset,
  }: {
    isPlaying: boolean;
    isEngineInitialized: boolean;
    onPlayToggle: () => void;
    onReset: () => void;
  } = $props();

  // Services
  let hapticService: IHapticFeedbackService | null = null;

  onMount(async () => {
    try {
      hapticService = await resolve<IHapticFeedbackService>(
        TYPES.IHapticFeedbackService
      );
    } catch (error) {
      console.error("Failed to resolve haptic service", error);
      hapticService = null;
    }
  });

  let playButtonLabel = $derived(
    isPlaying ? "Pause animation" : "Play animation"
  );

  function handlePlayToggle() {
    hapticService?.trigger("selection");
    onPlayToggle();
  }

  function handleReset() {
    hapticService?.trigger("selection");
    onReset();
  }
</script>

<div class="playback-controls">
  <button
    class="control-btn play-btn"
    onclick={handlePlayToggle}
    disabled={!isEngineInitialized}
    aria-label={playButtonLabel}
    title={playButtonLabel}
  >
    <span class="btn-icon" aria-hidden="true">
      {isPlaying ? "⏸️" : "▶️"}
    </span>
  </button>

  <button
    class="control-btn reset-btn"
    onclick={handleReset}
    disabled={!isEngineInitialized}
    aria-label="Reset animation to beginning"
    title="Reset animation"
  >
    <span class="btn-icon" aria-hidden="true">⏹️</span>
  </button>
</div>

<style>
  .playback-controls {
    display: flex;
    gap: 8px;
    justify-content: center;
  }

  .control-btn {
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    color: #c7d2fe;
    padding: 8px 12px;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 40px;
  }

  .control-btn:hover:not(:disabled) {
    background: rgba(139, 92, 246, 0.2);
    border-color: rgba(139, 92, 246, 0.4);
    color: white;
  }

  .control-btn:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.5);
  }

  .control-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
