<!--
  ConfirmDialog.svelte - MIGRATED TO BITS UI

  A classy confirmation dialog with glassmorphism styling.
  Now built on Bits UI Dialog for better accessibility and maintainability.

  BENEFITS:
  - WCAG AAA compliant accessibility out of the box
  - Better focus management and keyboard navigation
  - Portal rendering (no z-index issues)
  - Automatic ARIA attributes
  - Better screen reader support
-->
<script lang="ts">
  import { Dialog as DialogPrimitive } from "bits-ui";
  import type { IHapticFeedback } from "../../application/services/contracts/IHapticFeedback";
  import { resolve } from "../../inversify/di";
  import { TYPES } from "../../inversify/types";
  import { onMount } from "svelte";

  let {
    isOpen = $bindable(false),
    title,
    message,
    confirmText = "Continue",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
    variant = "warning",
  } = $props<{
    isOpen?: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: "warning" | "danger" | "info";
  }>();

  // Services
  let hapticService: IHapticFeedback;

  onMount(async () => {
    hapticService = await resolve<IHapticFeedback>(
      TYPES.IHapticFeedback
    );
  });

  // Handle confirm button
  function handleConfirm() {
    // Trigger appropriate haptic feedback based on variant
    if (variant === "danger") {
      hapticService?.trigger("warning");
    } else {
      hapticService?.trigger("success");
    }

    onConfirm();
    isOpen = false;
  }

  // Handle cancel button
  function handleCancel() {
    // Trigger navigation haptic feedback for cancel
    hapticService?.trigger("selection");

    onCancel();
    isOpen = false;
  }

  // Handle open change from Bits UI
  function handleOpenChange(open: boolean) {
    if (!open && isOpen) {
      // User closed via escape or backdrop
      handleCancel();
    }
    isOpen = open;
  }
</script>

<DialogPrimitive.Root open={isOpen} onOpenChange={handleOpenChange}>
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay class="dialog-backdrop" />
    <DialogPrimitive.Content class="dialog-container {variant}">
      <!-- Icon -->
      <div class="dialog-icon">
        {#if variant === "warning"}
          <span class="icon">⚠️</span>
        {:else if variant === "danger"}
          <span class="icon">🗑️</span>
        {:else}
          <span class="icon">ℹ️</span>
        {/if}
      </div>

      <!-- Content -->
      <div class="dialog-content">
        <DialogPrimitive.Title class="dialog-title"
          >{title}</DialogPrimitive.Title
        >
        <DialogPrimitive.Description class="dialog-message">
          {message}
        </DialogPrimitive.Description>
      </div>

      <!-- Actions -->
      <div class="dialog-actions">
        <button class="dialog-button cancel-button" onclick={handleCancel}>
          {cancelText}
        </button>
        <button class="dialog-button confirm-button" onclick={handleConfirm}>
          {confirmText}
        </button>
      </div>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
</DialogPrimitive.Root>

<style>
  :global(.dialog-backdrop) {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
  }

  :global(.dialog-container) {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--theme-panel-bg);
    border: 1px solid var(--theme-stroke, var(--theme-stroke));
    border-radius: 16px;
    padding: 32px;
    max-width: 480px;
    width: 100%;
    box-shadow: var(--theme-shadow, 0 20px 60px rgba(0, 0, 0, 0.5));
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    z-index: 1001;
  }

  :global(.dialog-container.warning) {
    border-color: rgba(255, 193, 7, 0.3);
  }

  :global(.dialog-container.danger) {
    border-color: rgba(244, 67, 54, 0.3);
  }

  :global(.dialog-container.info) {
    border-color: rgba(33, 150, 243, 0.3);
  }

  .dialog-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
  }

  .icon {
    font-size: var(--font-size-3xl);
    line-height: 1;
  }

  .dialog-content {
    text-align: center;
    margin-bottom: 28px;
  }

  :global(.dialog-title) {
    margin: 0 0 12px 0;
    font-size: var(--font-size-2xl);
    font-weight: 600;
    color: var(--text-color, #ffffff);
    font-family:
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      Roboto,
      sans-serif;
  }

  :global(.dialog-message) {
    margin: 0;
    font-size: var(--font-size-base);
    line-height: 1.6;
    color: var(--theme-text-dim, var(--theme-text-dim));
  }

  .dialog-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
  }

  .dialog-button {
    padding: 12px 32px;
    border-radius: 8px;
    font-size: var(--font-size-base);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 2px solid transparent;
    min-width: 120px;
  }

  .cancel-button {
    background: var(--theme-card-bg);
    color: var(--theme-text, var(--theme-text));
    border-color: var(--theme-stroke);
  }

  .cancel-button:hover {
    background: var(--theme-card-hover-bg);
    border-color: var(--theme-stroke-strong);
    transform: translateY(-1px);
  }

  .confirm-button {
    background: linear-gradient(
      135deg,
      var(--theme-accent) 0%,
      var(--theme-accent-strong) 100%
    );
    color: white;
    border-color: var(--theme-stroke);
  }

  .confirm-button:hover {
    background: linear-gradient(
      135deg,
      var(--theme-accent-strong) 0%,
      var(--theme-accent) 100%
    );
    border-color: var(--theme-stroke-strong);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px
      color-mix(in srgb, var(--theme-accent) 40%, transparent);
  }

  :global(.dialog-container.warning) .confirm-button {
    background: linear-gradient(135deg, var(--semantic-warning) 0%, #d97706 100%);
  }

  :global(.dialog-container.warning) .confirm-button:hover {
    background: linear-gradient(135deg, var(--semantic-warning) 0%, var(--semantic-warning) 100%);
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
  }

  :global(.dialog-container.danger) .confirm-button {
    background: linear-gradient(135deg, var(--semantic-error) 0%, var(--semantic-error) 100%);
  }

  :global(.dialog-container.danger) .confirm-button:hover {
    background: linear-gradient(135deg, var(--semantic-error) 0%, var(--semantic-error) 100%);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    :global(.dialog-container) {
      padding: 24px;
      max-width: 90%;
    }

    :global(.dialog-title) {
      font-size: var(--font-size-xl);
    }

    :global(.dialog-message) {
      font-size: var(--font-size-sm);
    }

    .dialog-button {
      padding: 10px 24px;
      font-size: var(--font-size-sm);
      min-width: 100px;
    }

    .icon {
      font-size: var(--font-size-3xl);
    }
  }
</style>
