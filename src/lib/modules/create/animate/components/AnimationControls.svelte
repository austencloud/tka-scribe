<!--
  AnimationControls.svelte

  Reusable animation controls component with speed slider.
-->
<script lang="ts">
  // Props
  let {
    speed = 1,
    onSpeedChange = () => {},
  }: {
    speed?: number;
    onSpeedChange?: (event: Event) => void;
  } = $props();
</script>

<div class="controls-container">
  <div class="speed-control">
    <label for="speed-slider" class="speed-label">Speed</label>
    <input
      id="speed-slider"
      type="range"
      min="0.25"
      max="2"
      step="0.25"
      value={speed}
      oninput={onSpeedChange}
      aria-label="Animation speed"
    />
    <span class="speed-value">{speed.toFixed(2)}x</span>
  </div>
</div>

<style>
  .controls-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex-shrink: 0;
    padding: 0 clamp(12px, 3vw, 24px);
    box-sizing: border-box;
  }

  .speed-control {
    display: flex;
    align-items: center;
    gap: clamp(8px, 2vw, 16px);
    padding: clamp(10px, 2.5vw, 16px) clamp(12px, 3vw, 20px);
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: clamp(12px, 3vw, 16px);
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
    box-sizing: border-box;
    backdrop-filter: blur(8px);
    transition: all 0.2s ease;
    -webkit-tap-highlight-color: transparent; /* Remove tap highlight on mobile */
  }

  /* Only apply hover effects on devices with hover capability (not touch) */
  @media (hover: hover) and (pointer: fine) {
    .speed-control:hover {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.25);
    }

    #speed-slider::-webkit-slider-thumb:hover {
      transform: scale(1.15);
      box-shadow:
        0 3px 8px rgba(0, 0, 0, 0.4),
        0 0 0 4px rgba(59, 130, 246, 0.2);
    }

    #speed-slider::-moz-range-thumb:hover {
      transform: scale(1.15);
      box-shadow:
        0 3px 8px rgba(0, 0, 0, 0.4),
        0 0 0 4px rgba(59, 130, 246, 0.2);
    }
  }

  /* Active states work on all devices */
  .speed-control:active {
    background: rgba(255, 255, 255, 0.1);
  }

  .speed-label {
    font-size: clamp(10px, 2.5vw, 12px);
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    white-space: nowrap;
    flex-shrink: 0;
  }

  #speed-slider {
    flex: 1;
    min-width: 0; /* Allow flex shrinking */
    height: 6px;
    -webkit-appearance: none;
    appearance: none;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
    outline: none;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent; /* Remove tap highlight on mobile */
  }

  #speed-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    border-radius: 50%;
    cursor: pointer;
    box-shadow:
      0 2px 6px rgba(0, 0, 0, 0.3),
      0 0 0 0 rgba(59, 130, 246, 0.4);
    transition: all 0.2s ease;
    -webkit-tap-highlight-color: transparent; /* Remove tap highlight on mobile */
  }

  #speed-slider::-webkit-slider-thumb:active {
    transform: scale(1.05);
  }

  #speed-slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    box-shadow:
      0 2px 6px rgba(0, 0, 0, 0.3),
      0 0 0 0 rgba(59, 130, 246, 0.4);
    transition: all 0.2s ease;
  }

  #speed-slider::-moz-range-thumb:active {
    transform: scale(1.05);
  }

  .speed-value {
    font-size: clamp(11px, 2.8vw, 13px);
    font-weight: 700;
    color: #ffffff;
    min-width: clamp(35px, 8vw, 45px);
    text-align: right;
    flex-shrink: 0;
    font-variant-numeric: tabular-nums;
  }

  /* Mobile responsive adjustments */
  @media (max-width: 768px) {
    .controls-container {
      padding: 0 16px;
    }
  }

  @media (max-width: 480px) {
    .controls-container {
      padding: 0 12px;
    }

    .speed-control {
      gap: clamp(6px, 2vw, 12px);
    }
  }

  /* Very narrow viewports */
  @media (max-width: 360px) {
    .speed-label {
      font-size: 9px;
      letter-spacing: 0.3px;
    }

    .speed-value {
      font-size: 10px;
      min-width: 32px;
    }
  }

  /* Landscape mobile: More compact */
  @media (max-height: 500px) and (orientation: landscape) {
    .speed-control {
      padding: 8px 12px;
      gap: 8px;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .speed-control,
    #speed-slider::-webkit-slider-thumb,
    #speed-slider::-moz-range-thumb {
      transition: none;
    }

    #speed-slider::-webkit-slider-thumb:active,
    #speed-slider::-moz-range-thumb:active {
      transform: none;
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .speed-control {
      border-width: 2px;
      border-color: rgba(255, 255, 255, 0.4);
    }

    .speed-label,
    .speed-value {
      color: #ffffff;
    }
  }
</style>
