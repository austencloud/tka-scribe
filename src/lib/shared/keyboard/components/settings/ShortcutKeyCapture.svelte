<!--
  ShortcutKeyCapture.svelte

  Key binding capture interface for editing shortcuts.
  - Desktop: Inline editor with immediate capture
  - Mobile: Bottom sheet with larger touch targets

  Captures keyboard events and converts them to key combo strings.
-->
<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import KeyboardKeyDisplay from "./KeyboardKeyDisplay.svelte";
  import ConflictWarning from "./ConflictWarning.svelte";
  import Drawer from "$lib/shared/foundation/ui/Drawer.svelte";
  import type { ShortcutWithBinding } from "../../services/contracts/IShortcutCustomizationService";
  import type {
    ShortcutConflict,
    ParsedKeyCombo,
  } from "../../domain/types/keyboard-types";
  import {
    keyComboFromEvent,
    buildKeyCombo,
    parseKeyCombo,
  } from "../../utils/key-combo-utils";

  let {
    isOpen = $bindable(false),
    item,
    isMobile = false,
    onSave = () => {},
    onCancel = () => {},
    onClear = () => {},
    detectConflict = () => null,
  }: {
    isOpen?: boolean;
    item: ShortcutWithBinding | null;
    isMobile?: boolean;
    onSave?: (keyCombo: string) => void;
    onCancel?: () => void;
    onClear?: () => void;
    detectConflict?: (keyCombo: string) => ShortcutConflict | null;
  } = $props();

  let capturedCombo = $state<string>("");
  let parsedCapture = $state<ParsedKeyCombo | null>(null);
  let isCapturing = $state(false);
  let conflict = $state<ShortcutConflict | null>(null);
  let inputRef = $state<HTMLInputElement | null>(null);

  // Reset state when item changes or opens
  $effect(() => {
    if (isOpen && item) {
      capturedCombo = "";
      parsedCapture = null;
      conflict = null;
      isCapturing = false;
    }
  });

  function handleKeydown(e: KeyboardEvent) {
    if (!isCapturing) return;

    // Ignore Tab for accessibility
    if (e.key === "Tab") return;

    e.preventDefault();
    e.stopPropagation();

    // Escape cancels capture mode
    if (e.key === "Escape") {
      isCapturing = false;
      return;
    }

    // Build key combo from event
    const combo = keyComboFromEvent(e);
    if (!combo) return; // Modifier-only press

    capturedCombo = combo;
    parsedCapture = parseKeyCombo(combo);
    isCapturing = false;

    // Check for conflicts
    if (item) {
      conflict = detectConflict(combo);
    }
  }

  function startCapture() {
    isCapturing = true;
    capturedCombo = "";
    parsedCapture = null;
    conflict = null;
    inputRef?.focus();
  }

  function handleSave() {
    if (!capturedCombo || (conflict && conflict.severity === "error")) return;
    onSave(capturedCombo);
    isOpen = false;
  }

  function handleCancel() {
    isOpen = false;
    onCancel();
  }

  function handleClear() {
    onClear();
    isOpen = false;
  }

  // Focus input when modal opens
  $effect(() => {
    if (isOpen && inputRef) {
      setTimeout(() => inputRef?.focus(), 100);
    }
  });

  const hasCapture = $derived(!!capturedCombo && parsedCapture);
  const canSave = $derived(
    hasCapture && (!conflict || conflict.severity !== "error")
  );
</script>

{#if isMobile}
  <!-- Mobile: Bottom Sheet -->
  <Drawer
    bind:isOpen
    placement="bottom"
    snapPoints={["60%", "85%"]}
    closeOnBackdrop={true}
    closeOnEscape={true}
    ariaLabel="Edit keyboard shortcut"
    showHandle={true}
  >
    <div class="capture-sheet">
      <header class="capture-header">
        <h3 class="capture-title">Edit Shortcut</h3>
        <button
          class="close-btn"
          onclick={handleCancel}
          type="button"
          aria-label="Close"
        >
          <i class="fas fa-times"></i>
        </button>
      </header>

      {#if item}
        <div class="capture-content">
          <div class="shortcut-info">
            <div class="shortcut-name">{item.shortcut.label}</div>
            {#if item.shortcut.description}
              <div class="shortcut-description">
                {item.shortcut.description}
              </div>
            {/if}
          </div>

          <div class="current-binding">
            <span class="binding-label">Current:</span>
            <KeyboardKeyDisplay parsed={item.effectiveBinding} />
          </div>

          <!-- Capture Area -->
          <button
            class="capture-area"
            class:capturing={isCapturing}
            class:has-value={hasCapture}
            onclick={startCapture}
            type="button"
          >
            {#if isCapturing}
              <span class="capture-prompt">Press any key combination...</span>
            {:else if parsedCapture}
              <KeyboardKeyDisplay parsed={parsedCapture} size="large" />
            {:else}
              <span class="capture-placeholder"
                >Tap to capture new shortcut</span
              >
            {/if}
          </button>

          <!-- Hidden input for keyboard capture -->
          <input
            bind:this={inputRef}
            type="text"
            class="capture-input"
            readonly
            onkeydown={handleKeydown}
            onblur={() => (isCapturing = false)}
          />

          {#if conflict}
            <ConflictWarning {conflict} />
          {/if}

          {#if item.isCustomized}
            <div class="default-hint">
              <span>Default:</span>
              <KeyboardKeyDisplay parsed={item.defaultBinding} size="small" />
            </div>
          {/if}
        </div>

        <footer class="capture-footer">
          <button class="btn btn-secondary" onclick={handleClear} type="button">
            Clear
          </button>
          <div class="footer-spacer"></div>
          <button
            class="btn btn-secondary"
            onclick={handleCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            class="btn btn-primary"
            onclick={handleSave}
            disabled={!canSave}
            type="button"
          >
            Save
          </button>
        </footer>
      {/if}
    </div>
  </Drawer>
{:else}
  <!-- Desktop: Inline Modal -->
  {#if isOpen && item}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="capture-overlay"
      onclick={handleCancel}
      onkeydown={(e) => e.key === "Escape" && handleCancel()}
    >
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <div class="capture-modal" onclick={(e) => e.stopPropagation()}>
        <header class="capture-header">
          <h3 class="capture-title">Edit Shortcut</h3>
          <button
            class="close-btn"
            onclick={handleCancel}
            type="button"
            aria-label="Close"
          >
            <i class="fas fa-times"></i>
          </button>
        </header>

        <div class="capture-content">
          <div class="shortcut-info">
            <div class="shortcut-name">{item.shortcut.label}</div>
            {#if item.shortcut.description}
              <div class="shortcut-description">
                {item.shortcut.description}
              </div>
            {/if}
          </div>

          <div class="current-binding">
            <span class="binding-label">Current:</span>
            <KeyboardKeyDisplay parsed={item.effectiveBinding} />
          </div>

          <!-- Capture Area -->
          <button
            class="capture-area"
            class:capturing={isCapturing}
            class:has-value={hasCapture}
            onclick={startCapture}
            type="button"
          >
            {#if isCapturing}
              <span class="capture-prompt">Press any key combination...</span>
            {:else if parsedCapture}
              <KeyboardKeyDisplay parsed={parsedCapture} size="large" />
            {:else}
              <span class="capture-placeholder"
                >Click to capture new shortcut</span
              >
            {/if}
          </button>

          <!-- Hidden input for keyboard capture -->
          <input
            bind:this={inputRef}
            type="text"
            class="capture-input"
            readonly
            onkeydown={handleKeydown}
            onblur={() => (isCapturing = false)}
          />

          {#if conflict}
            <ConflictWarning {conflict} />
          {/if}

          {#if item.isCustomized}
            <div class="default-hint">
              <span>Default:</span>
              <KeyboardKeyDisplay parsed={item.defaultBinding} size="small" />
            </div>
          {/if}
        </div>

        <footer class="capture-footer">
          <button class="btn btn-secondary" onclick={handleClear} type="button">
            Clear Binding
          </button>
          <div class="footer-spacer"></div>
          <button
            class="btn btn-secondary"
            onclick={handleCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            class="btn btn-primary"
            onclick={handleSave}
            disabled={!canSave}
            type="button"
          >
            Save
          </button>
        </footer>
      </div>
    </div>
  {/if}
{/if}

<style>
  /* Desktop Overlay */
  .capture-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }

  .capture-modal {
    width: 100%;
    max-width: 420px;
    /* Dark glass panel */
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    box-shadow: 0 24px 80px var(--theme-shadow, rgba(0, 0, 0, 0.5));
    overflow: hidden;
  }

  /* Mobile Sheet */
  .capture-sheet {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 0 20px 20px;
  }

  /* Shared Styles */
  .capture-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
  }

  .capture-sheet .capture-header {
    padding: 16px 0;
  }

  .capture-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
  }

  .close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    padding: 0;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 50%;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    cursor: pointer;
    transition: all 150ms ease;
  }

  .close-btn:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.1));
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
  }

  .capture-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px;
    flex: 1;
  }

  .capture-sheet .capture-content {
    padding: 20px 0;
  }

  .shortcut-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    text-align: center;
  }

  .shortcut-name {
    font-size: 16px;
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
  }

  .shortcut-description {
    font-size: 13px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    line-height: 1.4;
    max-width: 320px;
  }

  .current-binding {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }

  .binding-label {
    font-size: 13px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
  }

  .capture-area {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 80px;
    padding: 20px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.03));
    border: 2px dashed
      color-mix(in srgb, var(--theme-accent-strong, #8b5cf6) 40%, transparent);
    border-radius: 12px;
    cursor: pointer;
    transition: all 200ms ease;
  }

  .capture-area:hover {
    background: color-mix(
      in srgb,
      var(--theme-accent-strong, #8b5cf6) 5%,
      transparent
    );
    border-color: color-mix(
      in srgb,
      var(--theme-accent-strong, #8b5cf6) 60%,
      transparent
    );
  }

  .capture-area.capturing {
    border-style: solid;
    border-color: var(--theme-accent-strong, #8b5cf6);
    background: color-mix(
      in srgb,
      var(--theme-accent-strong, #8b5cf6) 8%,
      transparent
    );
    animation: pulse-glow 1.5s ease-in-out infinite;
  }

  @keyframes pulse-glow {
    0%,
    100% {
      box-shadow: 0 0 0 0
        color-mix(in srgb, var(--theme-accent-strong, #8b5cf6) 40%, transparent);
    }
    50% {
      box-shadow: 0 0 0 8px transparent;
    }
  }

  .capture-area.has-value {
    border-style: solid;
    border-color: color-mix(
      in srgb,
      var(--semantic-success, #22c55e) 50%,
      transparent
    );
    background: color-mix(
      in srgb,
      var(--semantic-success, #22c55e) 5%,
      transparent
    );
  }

  .capture-prompt {
    font-size: 14px;
    color: var(--theme-accent-strong, #8b5cf6);
    font-weight: 500;
  }

  .capture-placeholder {
    font-size: 14px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.4));
  }

  .capture-input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .default-hint {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    font-size: 12px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.4));
  }

  .capture-footer {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px 20px;
    border-top: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
  }

  .capture-sheet .capture-footer {
    padding: 16px 0 0;
  }

  .footer-spacer {
    flex: 1;
  }

  .btn {
    padding: 10px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 150ms ease;
  }

  .btn-primary {
    background: var(--theme-accent-strong, #8b5cf6);
    border: none;
    color: var(--theme-text, white);
  }

  .btn-primary:hover:not(:disabled) {
    background: color-mix(
      in srgb,
      var(--theme-accent-strong, #8b5cf6) 85%,
      #000
    );
  }

  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-secondary {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.08));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.15));
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
  }

  .btn-secondary:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.12));
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.25));
  }
</style>
