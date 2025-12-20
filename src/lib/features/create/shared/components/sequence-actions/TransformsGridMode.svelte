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
    canShiftStart?: boolean;
    showEditInConstructor: boolean;
    onTurns: () => void;
    onMirror: () => void;
    onFlip: () => void;
    onInvert: () => void;
    onRotateCW: () => void;
    onRotateCCW: () => void;
    onSwap: () => void;
    onRewind: () => void;
    onTurnPattern: () => void;
    onRotationDirection: () => void;
    onAutocomplete?: () => void;
    onShiftStart?: () => void;
    onEditInConstructor: () => void;
  }

  let {
    hasSequence,
    hasSelection = false,
    isTransforming,
    canAutocomplete = false,
    isAutocompleting = false,
    canShiftStart = false,
    showEditInConstructor,
    onTurns,
    onMirror,
    onFlip,
    onInvert,
    onRotateCW,
    onRotateCCW,
    onSwap,
    onRewind,
    onTurnPattern,
    onRotationDirection,
    onAutocomplete,
    onShiftStart,
    onEditInConstructor,
  }: Props = $props();

  const disabled = $derived(isTransforming || isAutocompleting || !hasSequence);
</script>

<div class="actions-container" class:disabled>
  <!-- TRANSFORM Section -->
  <section class="section transform-section">
    <span class="section-label">Transform</span>
    <div class="section-grid">
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
      <button class="grid-btn swap" onclick={onSwap} {disabled}>
        <div class="btn-icon"><i class="fas fa-arrows-rotate"></i></div>
        <div class="btn-text">
          <span class="btn-label">Swap</span>
          <span class="btn-desc">Switch hands</span>
        </div>
      </button>
      <button class="grid-btn invert" onclick={onInvert} {disabled}>
        <div class="btn-icon"><i class="fas fa-repeat"></i></div>
        <div class="btn-text">
          <span class="btn-label">Invert</span>
          <span class="btn-desc">Reverse turns</span>
        </div>
      </button>
      <button class="grid-btn rotate-ccw" onclick={onRotateCCW} {disabled}>
        <div class="btn-icon"><i class="fas fa-rotate-left"></i></div>
        <div class="btn-text">
          <span class="btn-label">Rotate L</span>
          <span class="btn-desc">Pivot 45°</span>
        </div>
      </button>
      <button class="grid-btn rotate-cw" onclick={onRotateCW} {disabled}>
        <div class="btn-icon"><i class="fas fa-rotate-right"></i></div>
        <div class="btn-text">
          <span class="btn-label">Rotate R</span>
          <span class="btn-desc">Pivot 45°</span>
        </div>
      </button>
    </div>
  </section>

  <!-- PATTERNS Section -->
  <section class="section patterns-section">
    <span class="section-label">Patterns</span>
    <div class="section-grid">
      <button class="grid-btn turn-pattern" onclick={onTurnPattern} disabled={!hasSequence}>
        <div class="btn-icon"><i class="fas fa-wand-magic-sparkles"></i></div>
        <div class="btn-text">
          <span class="btn-label">Turn Pattern</span>
          <span class="btn-desc">Apply patterns</span>
        </div>
      </button>
      <button class="grid-btn direction" onclick={onRotationDirection} disabled={!hasSequence}>
        <div class="btn-icon"><i class="fas fa-compass"></i></div>
        <div class="btn-text">
          <span class="btn-label">Direction</span>
          <span class="btn-desc">CW/CCW patterns</span>
        </div>
      </button>
      {#if onAutocomplete}
        <button
          class="grid-btn autocomplete"
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
            <span class="btn-label">{isAutocompleting ? "..." : "Autocomplete"}</span>
            <span class="btn-desc">Complete to start</span>
          </div>
        </button>
      {/if}
      {#if onShiftStart}
        <button
          class="grid-btn shift-start"
          class:unavailable={!canShiftStart}
          onclick={onShiftStart}
          disabled={!hasSequence || isTransforming || !canShiftStart}
        >
          <div class="btn-icon">
            <i class="fas fa-forward"></i>
          </div>
          <div class="btn-text">
            <span class="btn-label">First Beat</span>
            <span class="btn-desc">Pick new beat 1</span>
          </div>
        </button>
      {/if}
      <button class="grid-btn rewind" onclick={onRewind} {disabled}>
        <div class="btn-icon"><i class="fas fa-backward"></i></div>
        <div class="btn-text">
          <span class="btn-label">Rewind</span>
          <span class="btn-desc">Add reverse to end</span>
        </div>
      </button>
    </div>
  </section>

  <!-- EDIT Section -->
  <section class="section edit-section">
    <span class="section-label">Edit</span>
    <div class="section-grid">
      <button
        class="grid-btn edit-turns"
        class:highlighted={hasSelection}
        onclick={onTurns}
        disabled={!hasSelection}
      >
        <div class="btn-icon"><i class="fas fa-sliders-h"></i></div>
        <div class="btn-text">
          <span class="btn-label">Edit Turns</span>
          <span class="btn-desc">{hasSelection ? "Adjust rotation" : "Select beat first"}</span>
        </div>
      </button>
      {#if showEditInConstructor}
        <button class="grid-btn constructor" onclick={onEditInConstructor} disabled={!hasSequence} data-testid="edit-in-constructor">
          <div class="btn-icon"><i class="fas fa-pen-to-square"></i></div>
          <div class="btn-text">
            <span class="btn-label">Constructor</span>
            <span class="btn-desc">Full editor</span>
          </div>
        </button>
      {/if}
    </div>
  </section>
</div>

<style>
  /* ===== CONTAINER - Flex column of sections ===== */
  .actions-container {
    display: flex;
    flex-direction: column;
    gap: 6px;
    height: 100%;
    overflow: hidden;
  }

  .actions-container.disabled {
    opacity: 0.4;
    pointer-events: none;
  }

  /* ===== SECTIONS - Proportional heights ===== */
  .section {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-height: 0;
  }

  /* Proportional flex values based on button count */
  .transform-section { flex: 3; } /* 6 buttons = 3 rows (desktop) or 2 rows (mobile) */
  .patterns-section { flex: 2; }  /* 5 buttons = 2 rows */
  .edit-section { flex: 1; }      /* 2 buttons = 1 row */

  .section-label {
    font-size: 9px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: rgba(255, 255, 255, 0.35);
    padding-left: 4px;
    flex-shrink: 0;
  }

  /* ===== SECTION GRID ===== */
  .section-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: 1fr;
    gap: 6px;
    flex: 1;
    min-height: 0;
  }

  /* Mobile: 3 columns */
  @media (max-width: 500px) {
    .section-grid {
      grid-template-columns: repeat(3, 1fr);
      gap: 4px;
    }
    .grid-btn.full-width {
      grid-column: span 3;
    }
  }

  .grid-btn.full-width {
    grid-column: span 2;
  }

  /* ===== BUTTON BASE STYLES ===== */
  .grid-btn {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.15s ease;
    text-align: left;
    min-height: var(--min-touch-target, 44px);
    container-type: size;
  }

  .grid-btn:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }

  .grid-btn:active:not(:disabled) {
    transform: scale(0.97);
    transition-duration: 50ms;
  }

  .btn-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    font-size: 14px;
    flex-shrink: 0;
    color: white;
  }

  .btn-text {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }

  .btn-label {
    font-size: 0.8rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .btn-desc {
    font-size: 0.65rem;
    color: rgba(255, 255, 255, 0.5);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Mobile: icon only, centered */
  @media (max-width: 500px) {
    .grid-btn {
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 6px;
      gap: 2px;
    }
    .btn-text {
      display: none;
    }
    .btn-icon {
      width: 28px;
      height: 28px;
      font-size: 14px;
    }
  }

  /* Taller buttons: larger icons */
  @container (min-height: 80px) {
    .btn-icon {
      width: 36px;
      height: 36px;
      font-size: 16px;
    }
  }

  /* ===== RAINBOW COLORS - Each button gets its own color ===== */

  /* Mirror - Purple */
  .grid-btn.mirror {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(139, 92, 246, 0.05));
    border: 1px solid rgba(139, 92, 246, 0.3);
  }
  .grid-btn.mirror:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(139, 92, 246, 0.1));
    border-color: rgba(139, 92, 246, 0.5);
    box-shadow: 0 4px 16px rgba(139, 92, 246, 0.2);
  }
  .grid-btn.mirror .btn-icon { background: #8b5cf6; }

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
  .grid-btn.flip .btn-icon { background: #6366f1; }

  /* Swap - Emerald */
  .grid-btn.swap {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05));
    border: 1px solid rgba(16, 185, 129, 0.3);
  }
  .grid-btn.swap:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(16, 185, 129, 0.1));
    border-color: rgba(16, 185, 129, 0.5);
    box-shadow: 0 4px 16px rgba(16, 185, 129, 0.2);
  }
  .grid-btn.swap .btn-icon { background: #10b981; }

  /* Invert - Amber */
  .grid-btn.invert {
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05));
    border: 1px solid rgba(245, 158, 11, 0.3);
  }
  .grid-btn.invert:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(245, 158, 11, 0.1));
    border-color: rgba(245, 158, 11, 0.5);
    box-shadow: 0 4px 16px rgba(245, 158, 11, 0.2);
  }
  .grid-btn.invert .btn-icon { background: #f59e0b; }

  /* Rotate CCW - Orange */
  .grid-btn.rotate-ccw {
    background: linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(249, 115, 22, 0.05));
    border: 1px solid rgba(249, 115, 22, 0.3);
  }
  .grid-btn.rotate-ccw:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(249, 115, 22, 0.25), rgba(249, 115, 22, 0.1));
    border-color: rgba(249, 115, 22, 0.5);
    box-shadow: 0 4px 16px rgba(249, 115, 22, 0.2);
  }
  .grid-btn.rotate-ccw .btn-icon { background: #f97316; }

  /* Rotate CW - Orange (same as CCW) */
  .grid-btn.rotate-cw {
    background: linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(249, 115, 22, 0.05));
    border: 1px solid rgba(249, 115, 22, 0.3);
  }
  .grid-btn.rotate-cw:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(249, 115, 22, 0.25), rgba(249, 115, 22, 0.1));
    border-color: rgba(249, 115, 22, 0.5);
    box-shadow: 0 4px 16px rgba(249, 115, 22, 0.2);
  }
  .grid-btn.rotate-cw .btn-icon { background: #f97316; }

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
  .grid-btn.rewind .btn-icon { background: #f43f5e; }

  /* Turn Pattern - Teal */
  .grid-btn.turn-pattern {
    background: linear-gradient(135deg, rgba(20, 184, 166, 0.15), rgba(20, 184, 166, 0.05));
    border: 1px solid rgba(20, 184, 166, 0.3);
  }
  .grid-btn.turn-pattern:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(20, 184, 166, 0.25), rgba(20, 184, 166, 0.1));
    border-color: rgba(20, 184, 166, 0.5);
    box-shadow: 0 4px 16px rgba(20, 184, 166, 0.2);
  }
  .grid-btn.turn-pattern .btn-icon { background: #14b8a6; }

  /* Direction - Sky */
  .grid-btn.direction {
    background: linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(14, 165, 233, 0.05));
    border: 1px solid rgba(14, 165, 233, 0.3);
  }
  .grid-btn.direction:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(14, 165, 233, 0.25), rgba(14, 165, 233, 0.1));
    border-color: rgba(14, 165, 233, 0.5);
    box-shadow: 0 4px 16px rgba(14, 165, 233, 0.2);
  }
  .grid-btn.direction .btn-icon { background: #0ea5e9; }

  /* Autocomplete - Green */
  .grid-btn.autocomplete {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05));
    border: 1px solid rgba(34, 197, 94, 0.3);
  }
  .grid-btn.autocomplete:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.25), rgba(34, 197, 94, 0.1));
    border-color: rgba(34, 197, 94, 0.5);
    box-shadow: 0 4px 16px rgba(34, 197, 94, 0.2);
  }
  .grid-btn.autocomplete .btn-icon { background: #22c55e; }

  /* Autocomplete unavailable state */
  .grid-btn.autocomplete.unavailable {
    background: linear-gradient(135deg, rgba(100, 100, 100, 0.1), rgba(100, 100, 100, 0.05));
    border-color: rgba(100, 100, 100, 0.2);
    opacity: 0.5;
  }
  .grid-btn.autocomplete.unavailable .btn-icon { background: rgba(100, 100, 100, 0.4); }

  /* Shift Start - Cyan */
  .grid-btn.shift-start {
    background: linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(6, 182, 212, 0.05));
    border: 1px solid rgba(6, 182, 212, 0.3);
  }
  .grid-btn.shift-start:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(6, 182, 212, 0.25), rgba(6, 182, 212, 0.1));
    border-color: rgba(6, 182, 212, 0.5);
    box-shadow: 0 4px 16px rgba(6, 182, 212, 0.2);
  }
  .grid-btn.shift-start .btn-icon { background: #06b6d4; }

  /* Shift Start unavailable state */
  .grid-btn.shift-start.unavailable {
    background: linear-gradient(135deg, rgba(100, 100, 100, 0.1), rgba(100, 100, 100, 0.05));
    border-color: rgba(100, 100, 100, 0.2);
    opacity: 0.5;
  }
  .grid-btn.shift-start.unavailable .btn-icon { background: rgba(100, 100, 100, 0.4); }

  /* Edit Turns - Blue */
  .grid-btn.edit-turns {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05));
    border: 1px solid rgba(59, 130, 246, 0.3);
  }
  .grid-btn.edit-turns:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(59, 130, 246, 0.1));
    border-color: rgba(59, 130, 246, 0.5);
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.2);
  }
  .grid-btn.edit-turns .btn-icon { background: #3b82f6; }

  /* Edit Turns highlighted state (beat selected) */
  .grid-btn.edit-turns.highlighted {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(59, 130, 246, 0.12));
    border: 2px solid rgba(59, 130, 246, 0.6);
    box-shadow: 0 0 16px rgba(59, 130, 246, 0.2);
  }
  .grid-btn.edit-turns.highlighted:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.35), rgba(59, 130, 246, 0.18));
    border-color: rgba(59, 130, 246, 0.8);
  }

  /* Constructor - Violet */
  .grid-btn.constructor {
    background: linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(124, 58, 237, 0.05));
    border: 1px solid rgba(124, 58, 237, 0.3);
  }
  .grid-btn.constructor:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(124, 58, 237, 0.25), rgba(124, 58, 237, 0.1));
    border-color: rgba(124, 58, 237, 0.5);
    box-shadow: 0 4px 16px rgba(124, 58, 237, 0.2);
  }
  .grid-btn.constructor .btn-icon { background: #7c3aed; }

  @media (prefers-reduced-motion: reduce) {
    .grid-btn { transition: none; }
    .grid-btn:active:not(:disabled) { transform: none; }
  }
</style>
