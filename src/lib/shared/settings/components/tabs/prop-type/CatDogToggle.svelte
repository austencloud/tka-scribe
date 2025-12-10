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
  <span class="chip-icon">🐱🐶</span>
  <span class="chip-label">Cat Dog</span>
</button>

<style>
  .catdog-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 100px;
    color: rgba(255, 255, 255, 0.6);
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
    background: rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.8);
  }

  .catdog-chip:active {
    transform: scale(0.97);
  }

  .catdog-chip.active {
    background: rgba(52, 199, 89, 0.2);
    border-color: rgba(52, 199, 89, 0.4);
    color: rgba(255, 255, 255, 0.95);
    box-shadow:
      0 0 12px rgba(52, 199, 89, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .chip-icon {
    font-size: 16px;
    line-height: 1;
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
