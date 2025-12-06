<!-- CatDogToggle.svelte - iOS-style toggle for CatDog mode -->
<script lang="ts">
  let {
    catDogMode = false,
    onToggle,
  }: {
    catDogMode: boolean;
    onToggle: () => void;
  } = $props();
</script>

<div class="catdog-toggle-minimal">
  <span class="toggle-label-text">
    Cat Dog Mode
    <span class="toggle-subtitle">(Different props per hand)</span>
  </span>
  <button
    class="ios-switch"
    class:active={catDogMode}
    onclick={onToggle}
    role="switch"
    aria-checked={catDogMode}
    aria-label="Toggle CatDog Mode"
  >
    <span class="switch-thumb"></span>
  </button>
</div>

<style>
  .catdog-toggle-minimal {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    background: rgba(255, 255, 255, 0.04);
    border: 0.33px solid rgba(255, 255, 255, 0.16);
    border-radius: 12px;
    flex-shrink: 0;
  }

  .toggle-label-text {
    font-size: 15px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
  }

  .toggle-subtitle {
    font-size: 13px;
    font-weight: 400;
    font-style: italic;
    color: rgba(255, 255, 255, 0.6);
  }

  /* iOS-style switch - 50px minimum touch target */
  .ios-switch {
    position: relative;
    width: 51px;
    height: 31px;
    background: rgba(120, 120, 128, 0.32);
    border: none;
    border-radius: 15.5px;
    cursor: pointer;
    transition: background-color 0.3s cubic-bezier(0.36, 0.66, 0.04, 1);
    padding: 8px 0;
  }

  .ios-switch.active {
    background: #34c759; /* iOS green */
  }

  .switch-thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 27px;
    height: 27px;
    background: white;
    border-radius: 50%;
    box-shadow:
      0 3px 8px rgba(0, 0, 0, 0.15),
      0 1px 1px rgba(0, 0, 0, 0.06);
    transition: transform 0.3s cubic-bezier(0.36, 0.66, 0.04, 1);
  }

  .ios-switch.active .switch-thumb {
    transform: translateX(20px);
  }

  @media (prefers-reduced-motion: reduce) {
    .ios-switch,
    .switch-thumb {
      transition: none;
    }
  }
</style>
