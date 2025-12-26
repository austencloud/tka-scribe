<!--
  RotationDirectionDrawer.svelte

  Drawer for saving and applying rotation direction patterns.
  - Save: Extract rotation directions from current sequence and save
  - Apply: Browse and apply saved patterns or templates
-->
<script lang="ts">
  import Drawer from "$lib/shared/foundation/ui/Drawer.svelte";
  import { rotationDirectionPatternState } from "../../state/rotation-direction-pattern-state.svelte.ts";
  import { RotationDirectionPatternService } from "../../services/implementations/RotationDirectionPatternService";
  import { authState } from "$lib/shared/auth/state/authState.svelte";
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import type { RotationDirectionPattern } from "../../domain/models/RotationDirectionPatternData";
  import { formatRotationValue } from "../../domain/models/RotationDirectionPatternData";
  import {
    getTemplatesForBeatCount,
    getTemplatesByCategory,
    getCategoryInfo,
    templateToPattern,
    createUniformPattern,
    type TemplateCategory,
    type RotationDirectionTemplateDefinition,
  } from "../../domain/templates/rotation-direction-templates";

  interface Props {
    isOpen: boolean;
    sequence: SequenceData | null;
    onClose: () => void;
    onApply: (result: {
      sequence: SequenceData;
      warnings?: readonly string[];
    }) => void;
  }

  let { isOpen = $bindable(), sequence, onClose, onApply }: Props = $props();

  let mode: "save" | "apply" = $state("apply");
  let patternName = $state("");
  let savingPattern = $state(false);
  let applyingPattern = $state(false);
  let errorMessage = $state<string | null>(null);
  let categoryFilter = $state<TemplateCategory | "all">("all");

  const rotationPatternService = new RotationDirectionPatternService();

  // Load patterns when drawer opens
  $effect(() => {
    if (
      isOpen &&
      authState.user?.uid &&
      !rotationDirectionPatternState.initialized
    ) {
      rotationDirectionPatternState.loadPatterns(authState.user.uid);
    }
  });

  function handleSavePattern() {
    if (!sequence || !authState.user?.uid) return;

    savingPattern = true;
    errorMessage = null;

    // Auto-generate name if empty
    const finalName =
      patternName.trim() || `Rotation ${new Date().toLocaleTimeString()}`;

    rotationDirectionPatternState
      .savePattern(finalName, authState.user.uid, sequence)
      .then((saved) => {
        if (saved) {
          patternName = "";
          mode = "apply";
        } else {
          errorMessage =
            rotationDirectionPatternState.error ?? "Failed to save pattern";
        }
      })
      .finally(() => {
        savingPattern = false;
      });
  }

  async function handleApplyPattern(pattern: RotationDirectionPattern) {
    if (!sequence) return;

    applyingPattern = true;
    errorMessage = null;

    try {
      const result = await rotationPatternService.applyPattern(
        pattern,
        sequence
      );

      if (result.success && result.sequence) {
        onApply({
          sequence: result.sequence,
          warnings: result.warnings,
        });
        // Keep drawer open to allow applying multiple patterns
      } else {
        errorMessage = result.error ?? "Failed to apply pattern";
      }
    } catch (error) {
      errorMessage =
        error instanceof Error ? error.message : "Failed to apply pattern";
    } finally {
      applyingPattern = false;
    }
  }

  function handleApplyUniform(direction: "cw" | "ccw") {
    if (!sequence || !authState.user?.uid) return;

    const pattern = createUniformPattern(
      sequence.beats.length,
      direction,
      authState.user.uid
    );
    handleApplyPattern(pattern);
  }

  function handleApplyTemplate(template: RotationDirectionTemplateDefinition) {
    if (!sequence || !authState.user?.uid) return;

    const pattern = templateToPattern(
      template,
      authState.user.uid,
      sequence.beats.length
    );
    handleApplyPattern(pattern);
  }

  function handleDeletePattern(pattern: RotationDirectionPattern) {
    if (!authState.user?.uid) return;
    rotationDirectionPatternState.deletePattern(pattern.id, authState.user.uid);
  }

  function handleClose() {
    errorMessage = null;
    onClose();
  }

  // Get color class for rotation value display
  function getRotationColorClass(value: string): string {
    if (value === "CW") return "cw";
    if (value === "CC") return "ccw";
    return "none";
  }
</script>

<Drawer
  bind:isOpen
  placement="right"
  onclose={handleClose}
  class="rotation-direction-drawer"
>
  <div class="rotation-direction-drawer-content">
    <header class="drawer-header">
      <h2>Rotation Direction</h2>
      <button class="close-btn" onclick={handleClose} aria-label="Close">
        <i class="fas fa-times"></i>
      </button>
    </header>

    <!-- Mode tabs -->
    <div class="mode-tabs">
      <button
        class="tab"
        class:active={mode === "apply"}
        onclick={() => (mode = "apply")}
      >
        Apply
      </button>
      <button
        class="tab"
        class:active={mode === "save"}
        onclick={() => (mode = "save")}
      >
        Save Current
      </button>
    </div>

    {#if errorMessage}
      <div class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        {errorMessage}
      </div>
    {/if}

    {#if mode === "save"}
      <!-- Save mode -->
      <div class="save-section">
        {#if !sequence || sequence.beats.length === 0}
          <p class="empty-message">No sequence to save pattern from</p>
        {:else}
          <div class="pattern-preview">
            <h3>Current Pattern ({sequence.beats.length} beats)</h3>
            <div class="preview-grid">
              {#each sequence.beats as beat, i}
                {@const blueRotation = formatRotationValue(
                  beat.motions?.blue?.rotationDirection === "cw"
                    ? "cw"
                    : beat.motions?.blue?.rotationDirection === "ccw"
                      ? "ccw"
                      : beat.motions?.blue
                        ? "none"
                        : null
                )}
                {@const redRotation = formatRotationValue(
                  beat.motions?.red?.rotationDirection === "cw"
                    ? "cw"
                    : beat.motions?.red?.rotationDirection === "ccw"
                      ? "ccw"
                      : beat.motions?.red
                        ? "none"
                        : null
                )}
                <div class="preview-beat">
                  <span class="beat-num">{i + 1}</span>
                  <div class="rotation-pair">
                    <span
                      class="rotation-value {getRotationColorClass(
                        blueRotation
                      )} blue"
                    >
                      {blueRotation}
                    </span>
                    <span class="separator">|</span>
                    <span
                      class="rotation-value {getRotationColorClass(
                        redRotation
                      )} red"
                    >
                      {redRotation}
                    </span>
                  </div>
                </div>
              {/each}
            </div>
          </div>

          <div class="save-form">
            <input
              type="text"
              placeholder="Pattern name (optional - auto-generated if empty)"
              bind:value={patternName}
              maxlength={50}
            />
            <button
              class="save-btn"
              onclick={handleSavePattern}
              disabled={savingPattern}
            >
              {#if savingPattern}
                <i class="fas fa-spinner fa-spin"></i>
              {:else}
                <i class="fas fa-save"></i>
              {/if}
              Save Pattern
            </button>
          </div>
        {/if}
      </div>
    {:else}
      <!-- Apply mode -->
      <div class="apply-section">
        {#if rotationDirectionPatternState.isLoading}
          <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            Loading patterns...
          </div>
        {:else}
          <!-- Uniform Pattern Section -->
          {#if sequence && sequence.beats.length > 0}
            <div class="uniform-section">
              <h3>Uniform</h3>
              <p class="section-desc">Apply same direction to all beats</p>
              <div class="uniform-buttons">
                <button
                  class="uniform-btn cw"
                  onclick={() => handleApplyUniform("cw")}
                  disabled={applyingPattern}
                >
                  <i class="fas fa-rotate-right"></i>
                  All CW
                </button>
                <button
                  class="uniform-btn ccw"
                  onclick={() => handleApplyUniform("ccw")}
                  disabled={applyingPattern}
                >
                  <i class="fas fa-rotate-left"></i>
                  All CCW
                </button>
              </div>
            </div>
          {/if}

          <!-- Templates section -->
          {@const allTemplates = sequence
            ? getTemplatesForBeatCount(sequence.beats.length)
            : []}
          {@const nonUniformTemplates = allTemplates.filter(
            (t) => t.category !== "uniform"
          )}
          {@const filteredTemplates =
            categoryFilter === "all"
              ? nonUniformTemplates
              : nonUniformTemplates.filter(
                  (t) => t.category === categoryFilter
                )}

          {#if nonUniformTemplates.length > 0}
            <div class="templates-section">
              <div class="templates-header">
                <h3>Patterns</h3>
                <!-- Category filter -->
                <div class="category-filter">
                  <button
                    class="filter-btn"
                    class:active={categoryFilter === "all"}
                    onclick={() => (categoryFilter = "all")}>All</button
                  >
                  {#each ["alternating", "split-hand", "split-half"] as category}
                    {@const info = getCategoryInfo(
                      category as TemplateCategory
                    )}
                    {@const hasTemplates = nonUniformTemplates.some(
                      (t) => t.category === category
                    )}
                    {#if hasTemplates}
                      <button
                        class="filter-btn"
                        class:active={categoryFilter === category}
                        onclick={() =>
                          (categoryFilter = category as TemplateCategory)}
                        style="--filter-color: {info.color}"
                      >
                        <span
                          class="category-dot"
                          style="background: {info.color}"
                        ></span>
                        {info.label}
                      </button>
                    {/if}
                  {/each}
                </div>
              </div>

              <div class="patterns-list">
                {#each filteredTemplates as template}
                  {@const categoryInfo = getCategoryInfo(template.category)}
                  <div
                    class="pattern-item template"
                    style="--glass-color: {categoryInfo.color}"
                    onclick={() => handleApplyTemplate(template)}
                    role="button"
                    tabindex="0"
                    onkeydown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleApplyTemplate(template);
                      }
                    }}
                  >
                    <div class="pattern-info">
                      <span class="pattern-name">{template.name}</span>
                      <span class="pattern-desc">{template.description}</span>
                    </div>
                  </div>
                {/each}

                {#if filteredTemplates.length === 0}
                  <p class="empty-filter-message">
                    No {categoryFilter} patterns available
                  </p>
                {/if}
              </div>
            </div>
          {/if}

          <!-- User's saved patterns -->
          {#if rotationDirectionPatternState.patterns.length === 0}
            <p class="empty-message">
              No saved patterns yet. Save a pattern from the current sequence or
              try a template above.
            </p>
          {:else}
            <div class="saved-patterns-section">
              <h3>Your Patterns</h3>
              <div class="patterns-list">
                {#each rotationDirectionPatternState.patterns as pattern}
                  {@const isDisabled =
                    applyingPattern ||
                    !sequence ||
                    sequence.beats.length !== pattern.beatCount}
                  <div
                    class="pattern-item"
                    class:disabled={isDisabled}
                    onclick={() => !isDisabled && handleApplyPattern(pattern)}
                    role="button"
                    tabindex={isDisabled ? -1 : 0}
                    onkeydown={(e) => {
                      if (!isDisabled && (e.key === "Enter" || e.key === " ")) {
                        e.preventDefault();
                        handleApplyPattern(pattern);
                      }
                    }}
                    title={sequence &&
                    sequence.beats.length !== pattern.beatCount
                      ? `Requires ${pattern.beatCount} beats`
                      : "Apply pattern"}
                  >
                    <div class="pattern-info">
                      <span class="pattern-name">{pattern.name}</span>
                      <span class="pattern-beats"
                        >{pattern.beatCount} beats</span
                      >
                    </div>
                    <div class="pattern-actions">
                      <button
                        class="delete-btn"
                        onclick={(e) => {
                          e.stopPropagation();
                          handleDeletePattern(pattern);
                        }}
                        title="Delete pattern"
                        aria-label="Delete pattern"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        {/if}
      </div>
    {/if}
  </div>
</Drawer>

<style>
  .rotation-direction-drawer-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--theme-panel-bg, rgba(20, 20, 25, 0.95));
    color: var(--theme-text, #fff);
  }

  .drawer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
  }

  .drawer-header h2 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .close-btn {
    background: transparent;
    border: none;
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.6));
    font-size: 1.1rem;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .mode-tabs {
    display: flex;
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
  }

  .tab {
    flex: 1;
    padding: 12px;
    background: transparent;
    border: none;
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.6));
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.15s;
  }

  .tab.active {
    color: var(--theme-text, #fff);
    border-bottom: 2px solid #f59e0b;
  }

  .tab:hover:not(.active) {
    background: rgba(255, 255, 255, 0.05);
  }

  .error-message {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
    font-size: 0.85rem;
    margin: 8px 16px;
    border-radius: 8px;
  }

  .save-section,
  .apply-section {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }

  .empty-message {
    text-align: center;
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.5));
    padding: 32px 16px;
  }

  .pattern-preview {
    margin-bottom: 16px;
  }

  .pattern-preview h3 {
    font-size: 0.85rem;
    font-weight: 500;
    margin: 0 0 12px;
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.7));
  }

  .preview-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
    gap: 6px;
  }

  .preview-beat {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 6px 4px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    font-size: 0.75rem;
    gap: 4px;
  }

  .beat-num {
    font-weight: 600;
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.5));
  }

  .rotation-pair {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .separator {
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.3));
    font-size: 0.7rem;
  }

  .rotation-value {
    font-family: monospace;
    display: inline-block;
    min-width: 20px;
    text-align: center;
    font-size: 0.7rem;
    font-weight: 600;
  }

  .rotation-value.cw {
    color: #06b6d4; /* cyan */
  }

  .rotation-value.ccw {
    color: #f59e0b; /* amber */
  }

  .rotation-value.none {
    color: rgba(255, 255, 255, 0.4);
  }


  .save-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .save-form input {
    padding: 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.15));
    border-radius: 8px;
    color: var(--theme-text, #fff);
    font-size: 0.9rem;
  }

  .save-form input::placeholder {
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.4));
  }

  .save-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    border: none;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
  }

  .save-btn:hover:not(:disabled) {
    filter: brightness(1.1);
  }

  .save-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 32px;
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.6));
  }

  .patterns-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .pattern-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    cursor: pointer;
    transition: all 0.15s ease;
    user-select: none;
  }

  .pattern-item:hover:not(.disabled) {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(245, 158, 11, 0.4);
  }

  .pattern-item.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .pattern-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .pattern-name {
    font-weight: 500;
    font-size: 0.9rem;
  }

  .pattern-beats,
  .pattern-desc {
    font-size: 0.75rem;
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.5));
  }

  .pattern-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #f59e0b;
    font-size: 1rem;
  }

  .delete-btn {
    padding: 6px 10px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s;
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
  }

  .delete-btn:hover {
    background: rgba(239, 68, 68, 0.25);
  }

  /* Uniform section */
  .uniform-section {
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
  }

  .uniform-section h3 {
    font-size: 0.85rem;
    font-weight: 500;
    margin: 0 0 4px;
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.7));
  }

  .section-desc {
    font-size: 0.75rem;
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.5));
    margin: 0 0 12px;
  }

  .uniform-buttons {
    display: flex;
    gap: 8px;
  }

  .uniform-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 8px;
    font-size: 0.9rem;
    font-weight: 600;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .uniform-btn.cw {
    background: rgba(6, 182, 212, 0.15);
    border: 1px solid rgba(6, 182, 212, 0.3);
    color: var(--theme-text, #fff);
  }

  .uniform-btn.cw:hover:not(:disabled) {
    background: rgba(6, 182, 212, 0.25);
    border-color: rgba(6, 182, 212, 0.5);
  }

  .uniform-btn.ccw {
    background: rgba(245, 158, 11, 0.15);
    border: 1px solid rgba(245, 158, 11, 0.3);
    color: var(--theme-text, #fff);
  }

  .uniform-btn.ccw:hover:not(:disabled) {
    background: rgba(245, 158, 11, 0.25);
    border-color: rgba(245, 158, 11, 0.5);
  }

  .uniform-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Templates section */
  .templates-section,
  .saved-patterns-section {
    margin-bottom: 24px;
  }

  .templates-header {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 12px;
  }

  .templates-section h3,
  .saved-patterns-section h3 {
    font-size: 0.85rem;
    font-weight: 500;
    margin: 0;
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.7));
  }

  /* Category filter */
  .category-filter {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }

  .filter-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    font-size: 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 16px;
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.6));
    cursor: pointer;
    transition: all 0.15s;
  }

  .filter-btn:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  .filter-btn.active {
    background: rgba(255, 255, 255, 0.12);
    color: var(--theme-text, #fff);
    border-color: var(--filter-color, rgba(255, 255, 255, 0.3));
  }

  .category-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  /* Pattern items with colored glass effect */
  .pattern-item.template {
    background: color-mix(in srgb, var(--glass-color, #fff) 8%, transparent);
    border: 1px solid
      color-mix(in srgb, var(--glass-color, #fff) 20%, transparent);
  }

  .pattern-item.template:hover {
    background: color-mix(in srgb, var(--glass-color, #fff) 15%, transparent);
    border-color: color-mix(in srgb, var(--glass-color, #fff) 40%, transparent);
  }

  .empty-filter-message {
    text-align: center;
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.4));
    padding: 16px;
    font-size: 0.85rem;
  }
</style>
