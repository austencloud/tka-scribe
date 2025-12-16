<!--
  TransformsGridMode.svelte

  Grid of transform action buttons: Mirror, Swap, Rotate, Reverse, Preview, Edit.
-->
<script lang="ts">
  interface Props {
    hasSequence: boolean;
    isTransforming: boolean;
    showEditInConstructor: boolean;
    onMirror: () => void;
    onRotateCW: () => void;
    onRotateCCW: () => void;
    onSwap: () => void;
    onRewind: () => void;
    onPreview: () => void;
    onTurnPattern: () => void;
    onEditInConstructor: () => void;
  }

  let {
    hasSequence,
    isTransforming,
    showEditInConstructor,
    onMirror,
    onRotateCW,
    onRotateCCW,
    onSwap,
    onRewind,
    onPreview,
    onTurnPattern,
    onEditInConstructor,
  }: Props = $props();

  const disabled = $derived(isTransforming || !hasSequence);
</script>

<div class="transforms-grid" class:disabled>
  <!-- Row 1: Mirror | Swap Hands -->
  <button class="grid-btn mirror" onclick={onMirror} {disabled}>
    <div class="btn-icon"><i class="fas fa-left-right"></i></div>
    <div class="btn-text">
      <span class="btn-label">Mirror</span>
      <span class="btn-desc">Flip left & right</span>
    </div>
  </button>

  <button class="grid-btn swap" onclick={onSwap} {disabled}>
    <div class="btn-icon"><i class="fas fa-arrows-rotate"></i></div>
    <div class="btn-text">
      <span class="btn-label">Swap Hands</span>
      <span class="btn-desc">Switch movements</span>
    </div>
  </button>

  <!-- Row 2: Rotate Left | Rotate Right -->
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

  <!-- Row 3: Rewind | Preview -->
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

  <!-- Row 4: Turn Pattern (full width) -->
  <button class="grid-btn turns full-width" onclick={onTurnPattern} disabled={!hasSequence}>
    <div class="btn-icon"><i class="fas fa-wand-magic-sparkles"></i></div>
    <div class="btn-text">
      <span class="btn-label">Turn Pattern</span>
      <span class="btn-desc">Save & apply turn patterns</span>
    </div>
  </button>

  <!-- Row 5: Edit in Constructor (full width) -->
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
    min-height: 52px;
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

  /* Mirror - Purple */
  .grid-btn.mirror {
    background: linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(168, 85, 247, 0.08) 100%);
    border: 1px solid rgba(168, 85, 247, 0.35);
  }
  .grid-btn.mirror .btn-icon { background: #a855f7; color: white; }
  .grid-btn.mirror:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(168, 85, 247, 0.15) 100%);
    border-color: rgba(168, 85, 247, 0.5);
    box-shadow: 0 4px 16px rgba(168, 85, 247, 0.25);
  }

  /* Rotate - Orange */
  .grid-btn.rotate {
    background: linear-gradient(135deg, rgba(251, 146, 60, 0.2) 0%, rgba(251, 146, 60, 0.08) 100%);
    border: 1px solid rgba(251, 146, 60, 0.35);
  }
  .grid-btn.rotate .btn-icon { background: #fb923c; color: white; }
  .grid-btn.rotate:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(251, 146, 60, 0.3) 0%, rgba(251, 146, 60, 0.15) 100%);
    border-color: rgba(251, 146, 60, 0.5);
    box-shadow: 0 4px 16px rgba(251, 146, 60, 0.25);
  }

  /* Swap - Green */
  .grid-btn.swap {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.08) 100%);
    border: 1px solid rgba(34, 197, 94, 0.35);
  }
  .grid-btn.swap .btn-icon { background: #22c55e; color: white; }
  .grid-btn.swap:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.3) 0%, rgba(34, 197, 94, 0.15) 100%);
    border-color: rgba(34, 197, 94, 0.5);
    box-shadow: 0 4px 16px rgba(34, 197, 94, 0.25);
  }

  /* Rewind - Rose */
  .grid-btn.rewind {
    background: linear-gradient(135deg, rgba(244, 63, 94, 0.2) 0%, rgba(244, 63, 94, 0.08) 100%);
    border: 1px solid rgba(244, 63, 94, 0.35);
  }
  .grid-btn.rewind .btn-icon { background: #f43f5e; color: white; }
  .grid-btn.rewind:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(244, 63, 94, 0.3) 0%, rgba(244, 63, 94, 0.15) 100%);
    border-color: rgba(244, 63, 94, 0.5);
    box-shadow: 0 4px 16px rgba(244, 63, 94, 0.25);
  }

  /* Preview - Cyan */
  .grid-btn.preview {
    background: linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(6, 182, 212, 0.08) 100%);
    border: 1px solid rgba(6, 182, 212, 0.35);
  }
  .grid-btn.preview .btn-icon { background: #06b6d4; color: white; }
  .grid-btn.preview:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(6, 182, 212, 0.3) 0%, rgba(6, 182, 212, 0.15) 100%);
    border-color: rgba(6, 182, 212, 0.5);
    box-shadow: 0 4px 16px rgba(6, 182, 212, 0.25);
  }

  /* Turns - Teal */
  .grid-btn.turns {
    background: linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(20, 184, 166, 0.08) 100%);
    border: 1px solid rgba(20, 184, 166, 0.35);
  }
  .grid-btn.turns .btn-icon { background: #14b8a6; color: white; }
  .grid-btn.turns:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(20, 184, 166, 0.3) 0%, rgba(20, 184, 166, 0.15) 100%);
    border-color: rgba(20, 184, 166, 0.5);
    box-shadow: 0 4px 16px rgba(20, 184, 166, 0.25);
  }

  /* Edit - Blue */
  .grid-btn.edit {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.08) 100%);
    border: 1px solid rgba(59, 130, 246, 0.35);
  }
  .grid-btn.edit .btn-icon { background: #3b82f6; color: white; }
  .grid-btn.edit:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0.15) 100%);
    border-color: rgba(59, 130, 246, 0.5);
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.25);
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
