<!--
  ChangeButton.svelte

  Reusable "Change" button for switching sequences.
  Supports desktop (with label) and mobile (icon-only) variants.
-->
<script lang="ts">
  let {
    onclick,
    variant = "default",
    ariaLabel = "Change sequence",
  }: {
    onclick: () => void;
    variant?: "default" | "mobile";
    ariaLabel?: string;
  } = $props();
</script>

<button
  class="change-btn"
  class:mobile={variant === "mobile"}
  {onclick}
  aria-label={ariaLabel}
>
  <i class="fas fa-exchange-alt"></i>
  {#if variant === "default"}
    <span class="label">Change</span>
  {/if}
</button>

<style>
  .change-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1rem;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 8px;
    color: white;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: 48px;
    min-width: 48px;
  }

  .change-btn:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.2);
  }

  /* Mobile variant - icon only, square button */
  .change-btn.mobile {
    width: 48px;
    height: 48px;
    min-width: 48px;
    min-height: 48px;
    padding: 0;
    justify-content: center;
    color: rgba(255, 255, 255, 0.6);
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.15);
    font-size: 0.875rem;
    -webkit-tap-highlight-color: transparent;
  }

  .change-btn.mobile:active {
    background: rgba(255, 255, 255, 0.15);
    transform: scale(0.9);
  }

  .label {
    white-space: nowrap;
  }

  @media (max-width: 480px) {
    .change-btn:not(.mobile) {
      flex: 1;
      justify-content: center;
    }
  }
</style>
