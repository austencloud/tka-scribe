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
    min-height: var(--min-touch-target);
    min-width: var(--min-touch-target);
    padding: 0;
    width: 100%;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1.5px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 12px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.4));
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
      background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.07));
      border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.18));
      color: var(--theme-text, rgba(255, 255, 255, 0.6));
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
      color-mix(in srgb, var(--prop-blue, #2e3192) 22%, transparent) 0%,
      color-mix(in srgb, var(--prop-blue, #2e3192) 16%, transparent) 100%
    );
    border-color: color-mix(
      in srgb,
      var(--prop-blue, #2e3192) 55%,
      transparent
    );
    color: color-mix(in srgb, var(--prop-blue, #2e3192) 35%, white);
    box-shadow:
      0 2px 12px color-mix(in srgb, var(--prop-blue, #2e3192) 22%, transparent),
      0 0 16px color-mix(in srgb, var(--prop-blue, #2e3192) 16%, transparent),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  @media (hover: hover) and (pointer: fine) {
    .vis-btn.active.blue-vis-btn:hover {
      background: linear-gradient(
        135deg,
        color-mix(in srgb, var(--prop-blue, #2e3192) 32%, transparent) 0%,
        color-mix(in srgb, var(--prop-blue, #2e3192) 24%, transparent) 100%
      );
      border-color: color-mix(
        in srgb,
        var(--prop-blue, #2e3192) 70%,
        transparent
      );
      box-shadow:
        0 4px 16px
          color-mix(in srgb, var(--prop-blue, #2e3192) 30%, transparent),
        0 0 20px color-mix(in srgb, var(--prop-blue, #2e3192) 22%, transparent),
        inset 0 1px 0 rgba(255, 255, 255, 0.12);
    }
  }

  /* Red visibility button */
  .vis-btn.active.red-vis-btn {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--prop-red, #ed1c24) 22%, transparent) 0%,
      color-mix(in srgb, var(--prop-red, #ed1c24) 16%, transparent) 100%
    );
    border-color: color-mix(in srgb, var(--prop-red, #ed1c24) 55%, transparent);
    color: color-mix(in srgb, var(--prop-red, #ed1c24) 35%, white);
    box-shadow:
      0 2px 12px color-mix(in srgb, var(--prop-red, #ed1c24) 22%, transparent),
      0 0 16px color-mix(in srgb, var(--prop-red, #ed1c24) 16%, transparent),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  @media (hover: hover) and (pointer: fine) {
    .vis-btn.active.red-vis-btn:hover {
      background: linear-gradient(
        135deg,
        color-mix(in srgb, var(--prop-red, #ed1c24) 32%, transparent) 0%,
        color-mix(in srgb, var(--prop-red, #ed1c24) 24%, transparent) 100%
      );
      border-color: color-mix(
        in srgb,
        var(--prop-red, #ed1c24) 70%,
        transparent
      );
      box-shadow:
        0 4px 16px color-mix(in srgb, var(--prop-red, #ed1c24) 30%, transparent),
        0 0 20px color-mix(in srgb, var(--prop-red, #ed1c24) 22%, transparent),
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
