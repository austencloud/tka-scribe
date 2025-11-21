<!--
  MotionVisibilityButtons.svelte

  Blue and Red motion visibility toggle buttons.
  Used inline in speed control row.
-->
<script lang="ts">
  let {
    blueMotionVisible = true,
    redMotionVisible = true,
    onToggleBlue = () => {},
    onToggleRed = () => {},
  }: {
    blueMotionVisible?: boolean;
    redMotionVisible?: boolean;
    onToggleBlue?: () => void;
    onToggleRed?: () => void;
  } = $props();
</script>

<!-- Blue Motion Visibility Button -->
<button
  class="vis-btn blue-vis-btn"
  class:active={blueMotionVisible}
  onclick={onToggleBlue}
  type="button"
  title={blueMotionVisible ? "Hide blue motion" : "Show blue motion"}
  aria-label={blueMotionVisible ? "Hide blue motion" : "Show blue motion"}
>
  <i class="fas {blueMotionVisible ? 'fa-eye' : 'fa-eye-slash'}" aria-hidden="true"></i>
</button>

<!-- Red Motion Visibility Button -->
<button
  class="vis-btn red-vis-btn"
  class:active={redMotionVisible}
  onclick={onToggleRed}
  type="button"
  title={redMotionVisible ? "Hide red motion" : "Show red motion"}
  aria-label={redMotionVisible ? "Hide red motion" : "Show red motion"}
>
  <i class="fas {redMotionVisible ? 'fa-eye' : 'fa-eye-slash'}" aria-hidden="true"></i>
</button>

<style>
  .vis-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 44px; /* Fixed minimum height for touch target */
    min-width: 36px; /* Reasonable minimum width for icon-only button */
    padding: 0; /* Minimal padding when in row with other buttons */
    width: 100%; /* Fill available flex space */
    background: rgba(0, 0, 0, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.15);
    border-radius: clamp(8px, 1.6vw, 10px);
    color: rgba(255, 255, 255, 0.5);
    font-size: clamp(16px, 3.2vw, 18px);
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-tap-highlight-color: transparent;
  }

  @media (hover: hover) and (pointer: fine) {
    .vis-btn:hover {
      background: rgba(0, 0, 0, 0.3);
      border-color: rgba(255, 255, 255, 0.25);
      transform: translateY(-1px);
    }
  }

  .vis-btn:active {
    transform: scale(0.98);
  }

  /* Blue visibility button */
  .vis-btn.active.blue-vis-btn {
    background: linear-gradient(
      135deg,
      rgba(46, 49, 146, 0.6) 0%,
      rgba(59, 130, 246, 0.6) 100%
    );
    border-color: rgba(59, 130, 246, 0.8);
    color: rgba(191, 219, 254, 1);
    box-shadow: 0 2px 12px rgba(59, 130, 246, 0.4);
  }

  @media (hover: hover) and (pointer: fine) {
    .vis-btn.active.blue-vis-btn:hover {
      background: linear-gradient(
        135deg,
        rgba(46, 49, 146, 0.7) 0%,
        rgba(59, 130, 246, 0.7) 100%
      );
      border-color: rgba(59, 130, 246, 1);
      box-shadow: 0 4px 16px rgba(59, 130, 246, 0.5);
    }
  }

  /* Red visibility button */
  .vis-btn.active.red-vis-btn {
    background: linear-gradient(
      135deg,
      rgba(237, 28, 36, 0.6) 0%,
      rgba(239, 68, 68, 0.6) 100%
    );
    border-color: rgba(239, 68, 68, 0.8);
    color: rgba(254, 202, 202, 1);
    box-shadow: 0 2px 12px rgba(239, 68, 68, 0.4);
  }

  @media (hover: hover) and (pointer: fine) {
    .vis-btn.active.red-vis-btn:hover {
      background: linear-gradient(
        135deg,
        rgba(237, 28, 36, 0.7) 0%,
        rgba(239, 68, 68, 0.7) 100%
      );
      border-color: rgba(239, 68, 68, 1);
      box-shadow: 0 4px 16px rgba(239, 68, 68, 0.5);
    }
  }
</style>
