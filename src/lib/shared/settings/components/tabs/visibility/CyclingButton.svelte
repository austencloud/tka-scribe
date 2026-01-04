<!--
  CyclingButton.svelte

  3-state cycling button for visibility settings.
  Click to cycle through options (e.g., Off → Subtle → Vivid → Off).
  Shows current state with label and position indicators.
-->
<script lang="ts">
  interface Props {
    /** Current selected option */
    value: string;
    /** Available options in cycle order */
    options: string[];
    /** Callback when value changes */
    onValueChange: (newValue: string) => void;
    /** Optional aria-label for accessibility */
    ariaLabel?: string;
  }

  let { value, options, onValueChange, ariaLabel }: Props = $props();

  // Get current index (fallback to 0 if value is invalid)
  const currentIndex = $derived(
    value && options.includes(value) ? options.indexOf(value) : 0
  );

  // Cycle to next option
  function cycle() {
    const nextIndex = (currentIndex + 1) % options.length;
    onValueChange(options[nextIndex]!);
  }

  // Format label (capitalize first letter, fallback to first option if undefined)
  const displayLabel = $derived.by(() => {
    const labelValue = value || options[0] || "";
    return labelValue.charAt(0).toUpperCase() + labelValue.slice(1);
  });

  // Check if in active state (not "off" or "none")
  const isActive = $derived(value !== "off" && value !== "none");
</script>

<button
  class="cycling-btn"
  class:active={isActive}
  onclick={cycle}
  type="button"
  aria-label={ariaLabel || `${displayLabel} - Click to change`}
>
  <span class="label">{displayLabel}</span>
  <div class="position-indicators">
    {#each options as _, idx}
      <div class="dot" class:active={idx === currentIndex}></div>
    {/each}
  </div>
</button>

<style>
  .cycling-btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: var(--min-touch-target);
    padding: 12px 14px;
    background: color-mix(in srgb, var(--theme-card-bg) 70%, transparent);
    border: 1px solid var(--theme-stroke);
    border-radius: 12px;
    color: var(--theme-text);
    font-size: var(--font-size-compact);
    font-weight: 600;
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
    cursor: pointer;
    transition: all 150ms ease;
    -webkit-tap-highlight-color: transparent;
    gap: 8px;
  }

  .cycling-btn:hover {
    background: var(--theme-card-hover-bg);
    border-color: var(--theme-stroke-strong);
    transform: translateY(-1px);
  }

  .cycling-btn:active {
    transform: translateY(0) scale(0.97);
    transition-duration: 50ms;
  }

  /* Active state - theme accent with glow (matches toggle-btn.active) */
  .cycling-btn.active {
    background: color-mix(
      in srgb,
      var(--theme-accent, var(--theme-accent)) 25%,
      transparent
    );
    border-color: color-mix(
      in srgb,
      var(--theme-accent, var(--theme-accent)) 45%,
      transparent
    );
    color: white;
    box-shadow:
      0 0 0 1px
        color-mix(
          in srgb,
          var(--theme-accent, var(--theme-accent)) 15%,
          transparent
        ),
      0 4px 12px
        color-mix(
          in srgb,
          var(--theme-accent, var(--theme-accent)) 25%,
          transparent
        );
  }

  .cycling-btn.active:hover {
    background: color-mix(in srgb, var(--theme-accent) 35%, transparent);
    border-color: color-mix(
      in srgb,
      var(--theme-accent, var(--theme-accent)) 55%,
      transparent
    );
    box-shadow:
      0 0 0 1px
        color-mix(
          in srgb,
          var(--theme-accent, var(--theme-accent)) 20%,
          transparent
        ),
      0 4px 16px
        color-mix(
          in srgb,
          var(--theme-accent, var(--theme-accent)) 35%,
          transparent
        );
  }

  .label {
    flex: 1;
    text-align: left;
  }

  .position-indicators {
    display: flex;
    gap: 4px;
    align-items: center;
  }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--theme-text-dim);
    opacity: 0.3;
    transition: all 150ms ease;
  }

  .dot.active {
    background: var(--theme-accent, var(--theme-accent));
    opacity: 1;
    box-shadow: 0 0 8px
      color-mix(
        in srgb,
        var(--theme-accent, var(--theme-accent)) 50%,
        transparent
      );
  }

  /* Focus state */
  .cycling-btn:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--theme-accent) 50%, transparent);
    outline-offset: 2px;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .cycling-btn,
    .dot {
      transition: none;
    }
  }
</style>
