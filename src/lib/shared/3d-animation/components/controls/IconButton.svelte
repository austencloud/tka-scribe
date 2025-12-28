<script lang="ts">
  /**
   * IconButton - Touch-friendly icon button (48px minimum)
   * Uses --theme-* CSS variables for consistent theming.
   */

  interface Props {
    /** FontAwesome icon class */
    icon: string;
    /** Button label for accessibility */
    label: string;
    /** Whether button is in active/toggled state */
    active?: boolean;
    /** Whether button appears dimmed */
    dimmed?: boolean;
    /** Click handler */
    onclick: () => void;
  }

  let { icon, label, active = false, dimmed = false, onclick }: Props = $props();
</script>

<button
  type="button"
  class="icon-btn"
  class:active
  class:dimmed
  onclick={onclick}
  aria-label={label}
>
  <i class={icon} aria-hidden="true"></i>
</button>

<style>
  .icon-btn {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--theme-card-bg, rgba(0, 0, 0, 0.45));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    border-radius: 10px;
    color: var(--theme-text, rgba(255, 255, 255, 0.92));
    cursor: pointer;
    transition: all 0.15s;
    font-size: 1.1rem;
    flex-shrink: 0;
  }

  .icon-btn:hover {
    background: var(--theme-card-hover-bg, rgba(0, 0, 0, 0.55));
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.14));
  }

  .icon-btn.active {
    background: var(--theme-accent, #38bdf8);
    border-color: var(--theme-accent, #38bdf8);
    color: white;
  }

  .icon-btn.dimmed {
    opacity: 0.4;
  }
</style>
