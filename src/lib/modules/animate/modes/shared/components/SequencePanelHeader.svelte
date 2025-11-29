<!--
  SequencePanelHeader.svelte

  Panel header for sequence in tunnel/mirror/grid modes.
  Shows sequence name, color indicators, transformation controls, and visibility toggles.
-->
<script lang="ts">
  type ColorIndicator = { color: string; label: string };

  // Props
  let {
    sequenceName,
    colors,
    visible = $bindable(true),
    blueVisible = $bindable(true),
    redVisible = $bindable(true),
    onMirror,
    onRotate,
    onColorSwap,
    onReverse,
  }: {
    sequenceName: string;
    colors: ColorIndicator[];
    visible?: boolean;
    blueVisible?: boolean;
    redVisible?: boolean;
    onMirror: () => void;
    onRotate: () => void;
    onColorSwap: () => void;
    onReverse: () => void;
  } = $props();
</script>

<div class="panel-header">
  <div class="panel-title">
    <span class="sequence-name">{sequenceName}</span>
    <div class="color-dots">
      {#each colors as colorInfo}
        <div
          class="mini-dot"
          style="background: {colorInfo.color};"
          title={colorInfo.label}
        ></div>
      {/each}
    </div>
  </div>

  <div class="action-controls">
    <button
      class="action-btn mirror"
      onclick={onMirror}
      aria-label="Mirror sequence"
      title="Mirror"
    >
      <i class="fas fa-left-right"></i>
    </button>
    <button
      class="action-btn rotate"
      onclick={onRotate}
      aria-label="Rotate sequence"
      title="Rotate 45°"
    >
      <i class="fas fa-redo"></i>
    </button>
    <button
      class="action-btn color-swap"
      onclick={onColorSwap}
      aria-label="Swap colors in sequence"
      title="Color Swap"
    >
      <i class="fas fa-palette"></i>
    </button>
    <button
      class="action-btn reverse"
      onclick={onReverse}
      aria-label="Reverse sequence"
      title="Reverse"
    >
      <i class="fas fa-backward"></i>
    </button>
  </div>

  <div class="toggle-controls">
    <button
      class="toggle-btn"
      class:active={visible}
      onclick={() => (visible = !visible)}
      aria-label="Toggle sequence visibility"
    >
      <i class="fas fa-eye{visible ? '' : '-slash'}"></i>
    </button>
    <button
      class="toggle-btn blue"
      class:active={blueVisible}
      onclick={() => (blueVisible = !blueVisible)}
      aria-label="Toggle blue prop"
      style="--toggle-color: {colors[0]?.color || '#3b82f6'}"
    >
      B
    </button>
    <button
      class="toggle-btn red"
      class:active={redVisible}
      onclick={() => (redVisible = !redVisible)}
      aria-label="Toggle red prop"
      style="--toggle-color: {colors[1]?.color || '#ef4444'}"
    >
      R
    </button>
  </div>
</div>

<style>
  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-sm) var(--spacing-md);
    background: rgba(255, 255, 255, 0.05);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    flex-shrink: 0;
  }

  .panel-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: 0.875rem;
    font-weight: 600;
  }

  .sequence-name {
    opacity: 0.9;
  }

  .color-dots {
    display: flex;
    gap: 4px;
  }

  .mini-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.5);
  }

  .action-controls {
    display: flex;
    gap: 4px;
    margin: 0 var(--spacing-sm);
  }

  .action-btn {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: var(--border-radius-sm);
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .action-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }

  .action-btn:active {
    transform: translateY(0);
  }

  .action-btn.mirror:hover {
    background: rgba(139, 92, 246, 0.2);
    border-color: rgba(139, 92, 246, 0.5);
    color: #a78bfa;
  }

  .action-btn.rotate:hover {
    background: rgba(236, 72, 153, 0.2);
    border-color: rgba(236, 72, 153, 0.5);
    color: #ec4899;
  }

  .action-btn.color-swap:hover {
    background: rgba(245, 158, 11, 0.2);
    border-color: rgba(245, 158, 11, 0.5);
    color: #fbbf24;
  }

  .action-btn.reverse:hover {
    background: rgba(16, 185, 129, 0.2);
    border-color: rgba(16, 185, 129, 0.5);
    color: #34d399;
  }

  .toggle-controls {
    display: flex;
    gap: 4px;
  }

  .toggle-btn {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: var(--border-radius-sm);
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .toggle-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .toggle-btn.active {
    background: var(--toggle-color, rgba(236, 72, 153, 0.3));
    border-color: var(--toggle-color, rgba(236, 72, 153, 0.5));
    color: white;
  }

  .toggle-btn i {
    font-size: 0.75rem;
  }
</style>
