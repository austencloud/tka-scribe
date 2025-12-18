<!--
  TransformsGridMode.svelte

  Grid of transform action buttons: Mirror, Swap, Rotate, Reverse, Preview, Edit.
-->
<script lang="ts">
  interface Props {
    hasSequence: boolean;
    hasSelection: boolean;
    isTransforming: boolean;
    canAutocomplete?: boolean;
    isAutocompleting?: boolean;
    showEditInConstructor: boolean;
    onTurns: () => void;
    onMirror: () => void;
    onFlip: () => void;
    onInvert: () => void;
    onRotateCW: () => void;
    onRotateCCW: () => void;
    onSwap: () => void;
    onRewind: () => void;
    onPreview: () => void;
    onTurnPattern: () => void;
    onRotationDirection: () => void;
    onAutocomplete?: () => void;
    onEditInConstructor: () => void;
  }

  let {
    hasSequence,
    hasSelection = false,
    isTransforming,
    canAutocomplete = false,
    isAutocompleting = false,
    showEditInConstructor,
    onTurns,
    onMirror,
    onFlip,
    onInvert,
    onRotateCW,
    onRotateCCW,
    onSwap,
    onRewind,
    onPreview,
    onTurnPattern,
    onRotationDirection,
    onAutocomplete,
    onEditInConstructor,
  }: Props = $props();

  const disabled = $derived(isTransforming || isAutocompleting || !hasSequence);
</script>

<div class="transforms-grid" class:disabled>
  <!-- Row 0: Edit Turns (full width, highlighted when beat selected) -->
  <button
    class="grid-btn turns-edit full-width"
    class:highlighted={hasSelection}
    onclick={onTurns}
    disabled={!hasSelection}
  >
    <div class="btn-icon"><i class="fas fa-sliders-h"></i></div>
    <div class="btn-text">
      <span class="btn-label">Edit Turns</span>
      <span class="btn-desc">
        {#if hasSelection}
          Adjust turns & rotation
        {:else}
          Select a beat first
        {/if}
      </span>
    </div>
  </button>

  <!-- Row 1: Mirror | Flip -->
  <button class="grid-btn mirror" onclick={onMirror} {disabled}>
    <div class="btn-icon"><i class="fas fa-left-right"></i></div>
    <div class="btn-text">
      <span class="btn-label">Mirror</span>
      <span class="btn-desc">Flip left & right</span>
    </div>
  </button>

  <button class="grid-btn flip" onclick={onFlip} {disabled}>
    <div class="btn-icon"><i class="fas fa-up-down"></i></div>
    <div class="btn-text">
      <span class="btn-label">Flip</span>
      <span class="btn-desc">Flip up & down</span>
    </div>
  </button>

  <!-- Row 2: Swap Hands | Invert -->
  <button class="grid-btn swap" onclick={onSwap} {disabled}>
    <div class="btn-icon"><i class="fas fa-arrows-rotate"></i></div>
    <div class="btn-text">
      <span class="btn-label">Swap Hands</span>
      <span class="btn-desc">Switch movements</span>
    </div>
  </button>

  <button class="grid-btn invert" onclick={onInvert} {disabled}>
    <div class="btn-icon"><i class="fas fa-repeat"></i></div>
    <div class="btn-text">
      <span class="btn-label">Invert</span>
      <span class="btn-desc">Reverse turns</span>
    </div>
  </button>

  <!-- Row 3: Rotate Left | Rotate Right -->
  <button class="grid-btn rotate" onclick={onRotateCCW} {disabled}>
    <div class="btn-icon"><i class="fas fa-rotate-left"></i></div>
    <div class="btn-text">
      <span class="btn-label">Rotate Left</span>
      <span class="btn-desc">Pivot 45°</span>
    </div>
  </button>

  <button class="grid-btn rotate" onclick={onRotateCW} {disabled}>
    <div class="btn-icon"><i class="fas fa-rotate-right"></i></div>
    <div class="btn-text">
      <span class="btn-label">Rotate Right</span>
      <span class="btn-desc">Pivot 45°</span>
    </div>
  </button>

  <!-- Row 4: Rewind | Preview -->
  <button class="grid-btn rewind" onclick={onRewind} {disabled}>
    <div class="btn-icon"><i class="fas fa-backward"></i></div>
    <div class="btn-text">
      <span class="btn-label">Rewind</span>
      <span class="btn-desc">Play backwards</span>
    </div>
  </button>

  <button class="grid-btn preview" onclick={onPreview} disabled={!hasSequence}>
    <div class="btn-icon"><i class="fas fa-eye"></i></div>
    <div class="btn-text">
      <span class="btn-label">Preview</span>
      <span class="btn-desc">View fullscreen</span>
    </div>
  </button>

  <!-- Row 5: Turn Pattern (full width) -->
  <button class="grid-btn turns full-width" onclick={onTurnPattern} disabled={!hasSequence}>
    <div class="btn-icon"><i class="fas fa-wand-magic-sparkles"></i></div>
    <div class="btn-text">
      <span class="btn-label">Turn Pattern</span>
      <span class="btn-desc">Save & apply turn patterns</span>
    </div>
  </button>

  <!-- Row 6: Rotation Direction (full width) -->
  <button class="grid-btn rotation-dir full-width" onclick={onRotationDirection} disabled={!hasSequence}>
    <div class="btn-icon"><i class="fas fa-compass"></i></div>
    <div class="btn-text">
      <span class="btn-label">Rotation Direction</span>
      <span class="btn-desc">Apply CW/CCW patterns</span>
    </div>
  </button>

  <!-- Row 7: Autocomplete (full width) - always shown, grayed out when not available -->
  {#if onAutocomplete}
    <button
      class="grid-btn autocomplete full-width"
      class:unavailable={!canAutocomplete}
      onclick={onAutocomplete}
      disabled={!hasSequence || isAutocompleting || !canAutocomplete}
    >
      <div class="btn-icon">
        {#if isAutocompleting}
          <i class="fas fa-spinner fa-spin"></i>
        {:else}
          <i class="fas fa-circle-check"></i>
        {/if}
      </div>
      <div class="btn-text">
        <span class="btn-label">{isAutocompleting ? "Completing..." : "Autocomplete"}</span>
        <span class="btn-desc">
          {#if !canAutocomplete}
            Complete a partial sequence first
          {:else}
            Complete sequence to start position
          {/if}
        </span>
      </div>
    </button>
  {/if}

  <!-- Row 6: Edit in Constructor (full width) -->
  {#if showEditInConstructor}
    <button class="grid-btn edit full-width" onclick={onEditInConstructor} disabled={!hasSequence} data-testid="edit-in-constructor">
      <div class="btn-icon"><i class="fas fa-pen-to-square"></i></div>
      <div class="btn-text">
        <span class="btn-label">Edit in Constructor</span>
        <span class="btn-desc">Open in full editor</span>
      </div>
    </button>
  {/if}
</div>

<style>
  .transforms-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: 1fr;
    gap: 8px;
    height: 100%;
    align-content: stretch;
  }

  .transforms-grid.disabled {
    opacity: 0.4;
    pointer-events: none;
  }

  .grid-btn {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.15s ease;
    text-align: left;
    width: 100%;
    height: 100%;
    min-height: var(--min-touch-target);
    container-type: size;
  }

  .grid-btn:disabled {
    cursor: not-allowed;
  }

  .grid-btn:active:not(:disabled) {
    transform: scale(0.97);
    transition-duration: 50ms;
  }

  .grid-btn.full-width {
    grid-column: span 2;
  }

  .btn-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    font-size: 16px;
    flex-shrink: 0;
  }

  .btn-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .btn-label {
    font-size: 0.85rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .btn-desc {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.5);
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* ===== RESPONSIVE LAYOUTS BASED ON BUTTON SIZE ===== */

  /* Tall buttons (120px+): Vertical layout for better space usage */
  @container (min-height: 120px) {
    .grid-btn {
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 12px;
      gap: 8px;
    }

    .btn-icon {
      width: 44px;
      height: 44px;
      font-size: 20px;
    }

    .btn-text {
      gap: 4px;
      width: 100%;
    }

    .btn-label {
      font-size: 0.9rem;
    }

    .btn-desc {
      font-size: 0.75rem;
      white-space: normal;
    }
  }

  /* Medium buttons (90px+): Horizontal with bigger text */
  @container (min-height: 90px) and (max-height: 119px) {
    .btn-icon {
      width: 40px;
      height: 40px;
      font-size: 18px;
    }

    .btn-label {
      font-size: 0.9rem;
    }

    .btn-desc {
      font-size: 0.75rem;
    }
  }

  /* Extra small (< 70px): Hide descriptions */
  @container (max-height: 69px) {
    .btn-desc {
      display: none;
    }

    .btn-icon {
      width: 32px;
      height: 32px;
      font-size: 14px;
    }

    .btn-label {
      font-size: 0.8rem;
    }
  }

  /* ===== RAINBOW COLORED GLASS BACKGROUNDS ===== */

  /* Mirror - Purple */
  .grid-btn.mirror {
    background: linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(168, 85, 247, 0.05));
    border: 1px solid rgba(168, 85, 247, 0.3);
  }
  .grid-btn.mirror:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(168, 85, 247, 0.1));
    border-color: rgba(168, 85, 247, 0.5);
    box-shadow: 0 4px 16px rgba(168, 85, 247, 0.2);
  }
  .grid-btn.mirror .btn-icon { background: #a855f7; color: white; }

  /* Flip - Indigo */
  .grid-btn.flip {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.05));
    border: 1px solid rgba(99, 102, 241, 0.3);
  }
  .grid-btn.flip:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(99, 102, 241, 0.1));
    border-color: rgba(99, 102, 241, 0.5);
    box-shadow: 0 4px 16px rgba(99, 102, 241, 0.2);
  }
  .grid-btn.flip .btn-icon { background: #6366f1; color: white; }

  /* Rotate - Orange */
  .grid-btn.rotate {
    background: linear-gradient(135deg, rgba(251, 146, 60, 0.15), rgba(251, 146, 60, 0.05));
    border: 1px solid rgba(251, 146, 60, 0.3);
  }
  .grid-btn.rotate:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(251, 146, 60, 0.25), rgba(251, 146, 60, 0.1));
    border-color: rgba(251, 146, 60, 0.5);
    box-shadow: 0 4px 16px rgba(251, 146, 60, 0.2);
  }
  .grid-btn.rotate .btn-icon { background: #fb923c; color: white; }

  /* Swap - Green */
  .grid-btn.swap {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05));
    border: 1px solid rgba(34, 197, 94, 0.3);
  }
  .grid-btn.swap:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.25), rgba(34, 197, 94, 0.1));
    border-color: rgba(34, 197, 94, 0.5);
    box-shadow: 0 4px 16px rgba(34, 197, 94, 0.2);
  }
  .grid-btn.swap .btn-icon { background: #22c55e; color: white; }

  /* Invert - Yellow */
  .grid-btn.invert {
    background: linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(234, 179, 8, 0.05));
    border: 1px solid rgba(234, 179, 8, 0.3);
  }
  .grid-btn.invert:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(234, 179, 8, 0.25), rgba(234, 179, 8, 0.1));
    border-color: rgba(234, 179, 8, 0.5);
    box-shadow: 0 4px 16px rgba(234, 179, 8, 0.2);
  }
  .grid-btn.invert .btn-icon { background: #eab308; color: white; }

  /* Rewind - Rose */
  .grid-btn.rewind {
    background: linear-gradient(135deg, rgba(244, 63, 94, 0.15), rgba(244, 63, 94, 0.05));
    border: 1px solid rgba(244, 63, 94, 0.3);
  }
  .grid-btn.rewind:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(244, 63, 94, 0.25), rgba(244, 63, 94, 0.1));
    border-color: rgba(244, 63, 94, 0.5);
    box-shadow: 0 4px 16px rgba(244, 63, 94, 0.2);
  }
  .grid-btn.rewind .btn-icon { background: #f43f5e; color: white; }

  /* Preview - Cyan */
  .grid-btn.preview {
    background: linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(6, 182, 212, 0.05));
    border: 1px solid rgba(6, 182, 212, 0.3);
  }
  .grid-btn.preview:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(6, 182, 212, 0.25), rgba(6, 182, 212, 0.1));
    border-color: rgba(6, 182, 212, 0.5);
    box-shadow: 0 4px 16px rgba(6, 182, 212, 0.2);
  }
  .grid-btn.preview .btn-icon { background: #06b6d4; color: white; }

  /* Turn Pattern - Teal */
  .grid-btn.turns {
    background: linear-gradient(135deg, rgba(20, 184, 166, 0.15), rgba(20, 184, 166, 0.05));
    border: 1px solid rgba(20, 184, 166, 0.3);
  }
  .grid-btn.turns:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(20, 184, 166, 0.25), rgba(20, 184, 166, 0.1));
    border-color: rgba(20, 184, 166, 0.5);
    box-shadow: 0 4px 16px rgba(20, 184, 166, 0.2);
  }
  .grid-btn.turns .btn-icon { background: #14b8a6; color: white; }

  /* Rotation Direction - Amber */
  .grid-btn.rotation-dir {
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05));
    border: 1px solid rgba(245, 158, 11, 0.3);
  }
  .grid-btn.rotation-dir:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(245, 158, 11, 0.1));
    border-color: rgba(245, 158, 11, 0.5);
    box-shadow: 0 4px 16px rgba(245, 158, 11, 0.2);
  }
  .grid-btn.rotation-dir .btn-icon { background: #f59e0b; color: white; }

  /* Edit - Blue */
  .grid-btn.edit {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05));
    border: 1px solid rgba(59, 130, 246, 0.3);
  }
  .grid-btn.edit:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(59, 130, 246, 0.1));
    border-color: rgba(59, 130, 246, 0.5);
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.2);
  }
  .grid-btn.edit .btn-icon { background: #3b82f6; color: white; }

  /* Autocomplete - Emerald */
  .grid-btn.autocomplete {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.08));
    border: 1px solid rgba(16, 185, 129, 0.4);
  }
  .grid-btn.autocomplete:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(16, 185, 129, 0.15));
    border-color: rgba(16, 185, 129, 0.6);
    box-shadow: 0 4px 16px rgba(16, 185, 129, 0.25);
  }
  .grid-btn.autocomplete .btn-icon { background: #10b981; color: white; }

  /* Edit Turns - Cyan (highlighted when beat selected) */
  .grid-btn.turns-edit {
    background: linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(6, 182, 212, 0.05));
    border: 1px solid rgba(6, 182, 212, 0.2);
  }
  .grid-btn.turns-edit:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(6, 182, 212, 0.1));
    border-color: rgba(6, 182, 212, 0.4);
    box-shadow: 0 4px 16px rgba(6, 182, 212, 0.15);
  }
  .grid-btn.turns-edit .btn-icon { background: rgba(6, 182, 212, 0.3); color: #06b6d4; }

  /* Highlighted state when beat is selected */
  .grid-btn.turns-edit.highlighted {
    background: linear-gradient(135deg, rgba(6, 182, 212, 0.25), rgba(6, 182, 212, 0.12));
    border: 2px solid rgba(6, 182, 212, 0.6);
    box-shadow: 0 0 20px rgba(6, 182, 212, 0.2);
  }
  .grid-btn.turns-edit.highlighted:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(6, 182, 212, 0.35), rgba(6, 182, 212, 0.18));
    border-color: rgba(6, 182, 212, 0.8);
    box-shadow: 0 4px 24px rgba(6, 182, 212, 0.3);
  }
  .grid-btn.turns-edit.highlighted .btn-icon { background: #06b6d4; color: white; }

  /* Disabled state for turns-edit */
  .grid-btn.turns-edit:disabled {
    opacity: 0.4;
  }
  .grid-btn.turns-edit:disabled .btn-icon {
    background: rgba(100, 100, 100, 0.3);
    color: rgba(255, 255, 255, 0.4);
  }

  /* Autocomplete unavailable state - grayed out */
  .grid-btn.autocomplete.unavailable {
    background: linear-gradient(135deg, rgba(100, 100, 100, 0.1), rgba(100, 100, 100, 0.05));
    border: 1px solid rgba(100, 100, 100, 0.2);
    opacity: 0.5;
  }
  .grid-btn.autocomplete.unavailable .btn-icon {
    background: rgba(100, 100, 100, 0.4);
    color: rgba(255, 255, 255, 0.5);
  }
  .grid-btn.autocomplete.unavailable .btn-label {
    color: rgba(255, 255, 255, 0.5);
  }
  .grid-btn.autocomplete.unavailable .btn-desc {
    color: rgba(255, 255, 255, 0.35);
  }

  /* Extra narrow: Reduce gaps */
  @media (max-width: 360px) {
    .transforms-grid {
      gap: 6px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .grid-btn { transition: none; }
    .grid-btn:active:not(:disabled) { transform: none; }
  }
</style>
