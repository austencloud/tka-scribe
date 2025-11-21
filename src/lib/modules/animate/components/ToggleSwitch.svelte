<!--
  ToggleSwitch.svelte

  Modern 2026-style toggle switch component.
  iOS/Material Design 3 inspired with smooth animations.
-->
<script lang="ts">
  let {
    checked = $bindable(false),
    label = "",
    disabled = false,
    onToggle = () => {},
  }: {
    checked?: boolean;
    label?: string;
    disabled?: boolean;
    onToggle?: (checked: boolean) => void;
  } = $props();

  function handleToggle() {
    if (disabled) return;
    checked = !checked;
    onToggle(checked);
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      handleToggle();
    }
  }
</script>

<button
  class="toggle-switch"
  class:checked
  class:disabled
  onclick={handleToggle}
  onkeydown={handleKeyDown}
  role="switch"
  aria-checked={checked}
  aria-label={label || undefined}
  {disabled}
  type="button"
>
  {#if label}
    <span class="toggle-label">{label}</span>
  {/if}
  <div class="toggle-track">
    <div class="toggle-thumb">
      <div class="toggle-shine"></div>
    </div>
  </div>
</button>

<style>
  /* ===========================
     TOGGLE SWITCH - 2026 Design
     iOS/Material Design 3 inspired
     =========================== */

  .toggle-switch {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: clamp(8px, 1.6vw, 12px);
    width: 100%;
    padding: clamp(8px, 1.6vw, 10px) clamp(10px, 2vw, 12px);
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: clamp(8px, 1.6vw, 12px);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-tap-highlight-color: transparent;
    position: relative;
    overflow: hidden;
  }

  .toggle-switch::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.05) 0%,
      transparent 100%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  @media (hover: hover) and (pointer: fine) {
    .toggle-switch:not(.disabled):hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.15);
      transform: translateX(2px);
    }

    .toggle-switch:not(.disabled):hover::before {
      opacity: 1;
    }
  }

  .toggle-switch:not(.disabled):active {
    transform: scale(0.98);
  }

  .toggle-switch.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .toggle-label {
    font-size: clamp(11px, 2.2vw, 13px);
    font-weight: 600;
    color: rgba(255, 255, 255, 0.85);
    flex: 1;
    text-align: left;
    transition: color 0.3s ease;
  }

  .toggle-switch.checked .toggle-label {
    color: rgba(255, 255, 255, 0.95);
  }

  /* ===========================
     TOGGLE TRACK
     =========================== */

  .toggle-track {
    position: relative;
    width: clamp(42px, 8.4vw, 52px);
    height: clamp(24px, 4.8vw, 28px);
    background: rgba(255, 255, 255, 0.15);
    border-radius: clamp(12px, 2.4vw, 14px);
    flex-shrink: 0;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .toggle-switch.checked .toggle-track {
    background: linear-gradient(
      135deg,
      rgba(59, 130, 246, 0.8) 0%,
      rgba(37, 99, 235, 0.8) 100%
    );
    box-shadow:
      inset 0 1px 3px rgba(0, 0, 0, 0.3),
      0 0 12px rgba(59, 130, 246, 0.4);
  }

  /* ===========================
     TOGGLE THUMB
     =========================== */

  .toggle-thumb {
    position: absolute;
    top: clamp(2px, 0.4vw, 3px);
    left: clamp(2px, 0.4vw, 3px);
    width: clamp(20px, 4vw, 22px);
    height: clamp(20px, 4vw, 22px);
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.95) 0%,
      rgba(240, 240, 240, 0.95) 100%
    );
    border-radius: 50%;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow:
      0 2px 6px rgba(0, 0, 0, 0.25),
      0 1px 2px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .toggle-switch.checked .toggle-thumb {
    transform: translateX(clamp(18px, 3.6vw, 24px));
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 1) 0%,
      rgba(248, 250, 252, 1) 100%
    );
    box-shadow:
      0 3px 8px rgba(0, 0, 0, 0.3),
      0 1px 3px rgba(0, 0, 0, 0.2);
  }

  /* ===========================
     SHINE EFFECT - Premium detail
     =========================== */

  .toggle-shine {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 60%;
    height: 60%;
    background: radial-gradient(
      circle at 30% 30%,
      rgba(255, 255, 255, 0.5) 0%,
      transparent 70%
    );
    border-radius: 50%;
    pointer-events: none;
  }

  /* ===========================
     DESKTOP CONTAINER QUERY UNITS
     =========================== */

  @container (min-aspect-ratio: 5/4) {
    .toggle-switch {
      padding: 0.4cqh 0.5cqw;
      gap: 0.5cqw;
    }

    .toggle-label {
      font-size: 1cqh;
    }

    .toggle-track {
      width: 3.6cqh;
      height: 2cqh;
      border-radius: 1cqh;
    }

    .toggle-thumb {
      top: 0.2cqh;
      left: 0.2cqh;
      width: 1.6cqh;
      height: 1.6cqh;
    }

    .toggle-switch.checked .toggle-thumb {
      transform: translateX(1.6cqh);
    }
  }

  /* ===========================
     ACCESSIBILITY
     =========================== */

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .toggle-switch,
    .toggle-switch::before,
    .toggle-track,
    .toggle-thumb,
    .toggle-label {
      transition: none;
    }

    .toggle-switch:hover,
    .toggle-switch:active {
      transform: none;
    }
  }

  /* High contrast */
  @media (prefers-contrast: high) {
    .toggle-switch {
      border-width: 2px;
      border-color: rgba(255, 255, 255, 0.4);
    }

    .toggle-label {
      color: #ffffff;
    }

    .toggle-track {
      background: rgba(255, 255, 255, 0.3);
    }

    .toggle-switch.checked .toggle-track {
      background: rgba(59, 130, 246, 1);
    }
  }

  /* Focus visible for keyboard navigation */
  .toggle-switch:focus-visible {
    outline: 2px solid rgba(59, 130, 246, 0.8);
    outline-offset: 2px;
  }
</style>
