<script lang="ts">
  /**
   * PanelButton - Button component with primary/secondary variants
   */

  import type { Snippet } from "svelte";

  type ButtonVariant = "primary" | "secondary";

  interface Props {
    /** Button variant */
    variant?: ButtonVariant;
    /** Content to render */
    children: Snippet;
    /** Click handler */
    onclick?: () => void;
    /** Disabled state */
    disabled?: boolean;
    /** Button type */
    type?: "button" | "submit" | "reset";
    /** Full width */
    fullWidth?: boolean;
  }

  let {
    variant = "secondary",
    children,
    onclick,
    disabled = false,
    type = "button",
    fullWidth = false,
  }: Props = $props();
</script>

<button
  class="panel-btn panel-btn--{variant}"
  class:panel-btn--full-width={fullWidth}
  {onclick}
  {disabled}
  {type}
>
  {@render children()}
</button>

<style>
  .panel-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: var(--min-touch-target);
  }

  .panel-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .panel-btn--full-width {
    width: 100%;
  }

  /* Primary variant - uses theme accent */
  .panel-btn--primary {
    background: var(--theme-accent, #06b6d4);
    border: 1px solid var(--theme-accent, #06b6d4);
    color: white;
  }

  .panel-btn--primary:hover:not(:disabled) {
    filter: brightness(0.9);
  }

  /* Secondary variant - ghost style */
  .panel-btn--secondary {
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.08));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.2));
    color: var(--theme-text, white);
  }

  .panel-btn--secondary:hover:not(:disabled) {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.12));
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.3));
  }

  @media (prefers-reduced-motion: reduce) {
    .panel-btn {
      transition: none;
    }
  }
</style>
