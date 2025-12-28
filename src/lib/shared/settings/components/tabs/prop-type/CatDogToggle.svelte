<!-- CatDogToggle.svelte - Chip toggle for CatDog mode (different props per hand) -->
<script lang="ts">
  let {
    catDogMode = false,
    onToggle,
  }: {
    catDogMode: boolean;
    onToggle: () => void;
  } = $props();
</script>

<button
  class="catdog-chip"
  class:active={catDogMode}
  onclick={onToggle}
  role="switch"
  aria-checked={catDogMode}
  aria-label="Toggle CatDog Mode - different props per hand"
>
  <span class="chip-icons">
    <i class="fas fa-cat" aria-hidden="true"></i>
    <i class="fas fa-dog" aria-hidden="true"></i>
  </span>
  <span class="chip-label">Cat Dog</span>
</button>

<style>
  .catdog-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.08));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.12));
    border-radius: 100px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    font-size: 15px;
    font-weight: 500;
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-tap-highlight-color: transparent;
    flex-shrink: 0;
    align-self: flex-start;
  }

  .catdog-chip:hover:not(.active) {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.12));
    color: var(--theme-text, rgba(255, 255, 255, 0.8));
  }

  .catdog-chip:active {
    transform: scale(0.97);
  }

  .catdog-chip.active {
    background: color-mix(
      in srgb,
      var(--theme-accent, #34c759) 20%,
      transparent
    );
    border-color: color-mix(
      in srgb,
      var(--theme-accent, #34c759) 40%,
      transparent
    );
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
    box-shadow:
      0 0 12px color-mix(in srgb, var(--theme-accent, #34c759) 15%, transparent),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .chip-icons {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 14px;
    line-height: 1;
    color: inherit;
  }

  .chip-icons i {
    transition: transform 0.2s ease;
  }

  .catdog-chip.active .chip-icons i:first-child {
    color: var(--prop-blue, #2e3192);
  }

  .catdog-chip.active .chip-icons i:last-child {
    color: var(--prop-red, #ed1c24);
  }

  .chip-label {
    font-size: inherit;
    font-weight: inherit;
    letter-spacing: -0.2px;
  }

  @media (prefers-reduced-motion: reduce) {
    .catdog-chip {
      transition: none;
    }
  }
</style>
