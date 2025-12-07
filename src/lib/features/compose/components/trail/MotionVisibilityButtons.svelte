<!--
  MotionVisibilityButtons.svelte

  2026 Bento Box Design - Motion visibility toggles
  Blue and Red motion visibility toggle buttons.
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
  <i
    class="fas {blueMotionVisible ? 'fa-eye' : 'fa-eye-slash'}"
    aria-hidden="true"
  ></i>
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
  <i
    class="fas {redMotionVisible ? 'fa-eye' : 'fa-eye-slash'}"
    aria-hidden="true"
  ></i>
</button>

<style>
  /* ===========================
     2026 BENTO BOX DESIGN
     Motion Visibility Buttons
     =========================== */

  .vis-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 52px;
    min-width: 52px;
    padding: 0;
    width: 100%;
    background: rgba(255, 255, 255, 0.04);
    border: 1.5px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.4);
    font-size: 17px;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-tap-highlight-color: transparent;
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.03);
  }

  @media (hover: hover) and (pointer: fine) {
    .vis-btn:hover {
      background: rgba(255, 255, 255, 0.07);
      border-color: rgba(255, 255, 255, 0.18);
      color: rgba(255, 255, 255, 0.6);
      transform: translateY(-1px);
      box-shadow:
        0 2px 8px rgba(0, 0, 0, 0.12),
        inset 0 1px 0 rgba(255, 255, 255, 0.05);
    }
  }

  .vis-btn:active {
    transform: scale(0.97);
  }

  /* Blue visibility button */
  .vis-btn.active.blue-vis-btn {
    background: linear-gradient(
      135deg,
      rgba(59, 130, 246, 0.25) 0%,
      rgba(37, 99, 235, 0.2) 100%
    );
    border-color: rgba(59, 130, 246, 0.5);
    color: rgba(191, 219, 254, 1);
    box-shadow:
      0 2px 12px rgba(59, 130, 246, 0.2),
      0 0 16px rgba(59, 130, 246, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  @media (hover: hover) and (pointer: fine) {
    .vis-btn.active.blue-vis-btn:hover {
      background: linear-gradient(
        135deg,
        rgba(59, 130, 246, 0.35) 0%,
        rgba(37, 99, 235, 0.3) 100%
      );
      border-color: rgba(59, 130, 246, 0.7);
      box-shadow:
        0 4px 16px rgba(59, 130, 246, 0.3),
        0 0 20px rgba(59, 130, 246, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.12);
    }
  }

  /* Red visibility button */
  .vis-btn.active.red-vis-btn {
    background: linear-gradient(
      135deg,
      rgba(239, 68, 68, 0.25) 0%,
      rgba(220, 38, 38, 0.2) 100%
    );
    border-color: rgba(239, 68, 68, 0.5);
    color: rgba(254, 202, 202, 1);
    box-shadow:
      0 2px 12px rgba(239, 68, 68, 0.2),
      0 0 16px rgba(239, 68, 68, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  @media (hover: hover) and (pointer: fine) {
    .vis-btn.active.red-vis-btn:hover {
      background: linear-gradient(
        135deg,
        rgba(239, 68, 68, 0.35) 0%,
        rgba(220, 38, 38, 0.3) 100%
      );
      border-color: rgba(239, 68, 68, 0.7);
      box-shadow:
        0 4px 16px rgba(239, 68, 68, 0.3),
        0 0 20px rgba(239, 68, 68, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.12);
    }
  }

  /* ===========================
     ACCESSIBILITY
     =========================== */

  @media (prefers-reduced-motion: reduce) {
    .vis-btn {
      transition: none;
    }

    .vis-btn:hover,
    .vis-btn:active {
      transform: none;
    }
  }
</style>
