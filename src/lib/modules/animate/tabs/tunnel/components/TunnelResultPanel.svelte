<!--
  TunnelResultPanel.svelte

  The tunnel view result panel showing the overlaid animation canvas.
-->
<script lang="ts">
  import type { Snippet } from "svelte";

  // Props
  let {
    primaryVisible = $bindable(true),
    secondaryVisible = $bindable(true),
    children,
  }: {
    primaryVisible: boolean;
    secondaryVisible: boolean;
    children: Snippet;
  } = $props();
</script>

<div class="tunnel-animation-panel">
  <div class="result-panel-header">
    <div class="result-title">
      <i class="fas fa-layer-group"></i>
      <span>Tunnel View</span>
    </div>
    <div class="layer-toggles">
      <button
        class="layer-toggle"
        class:active={primaryVisible}
        onclick={() => primaryVisible = !primaryVisible}
        title="Toggle Primary"
        aria-label="Toggle primary performer visibility"
        aria-pressed={primaryVisible}
      >
        <span class="toggle-dot blue"></span>
        <span class="toggle-dot red"></span>
      </button>
      <button
        class="layer-toggle"
        class:active={secondaryVisible}
        onclick={() => secondaryVisible = !secondaryVisible}
        title="Toggle Secondary"
        aria-label="Toggle secondary performer visibility"
        aria-pressed={secondaryVisible}
      >
        <span class="toggle-dot green"></span>
        <span class="toggle-dot purple"></span>
      </button>
    </div>
  </div>
  <div class="panel-content animation-content">
    {@render children()}
  </div>
</div>

<style>
  .tunnel-animation-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: linear-gradient(135deg, rgba(20, 184, 166, 0.03) 0%, rgba(6, 182, 212, 0.03) 100%);
    border: 1px solid rgba(20, 184, 166, 0.3);
    border-radius: 12px;
    overflow: hidden;
    min-width: 0;
  }

  .result-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    background: linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%);
    border-bottom: 1px solid rgba(20, 184, 166, 0.15);
    flex-shrink: 0;
  }

  .result-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.85rem;
    font-weight: 600;
    color: #14b8a6;
  }

  .layer-toggles {
    display: flex;
    gap: 6px;
  }

  .layer-toggle {
    display: flex;
    align-items: center;
    gap: 3px;
    padding: 4px 8px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    opacity: 0.4;
  }

  .layer-toggle:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  .layer-toggle.active {
    opacity: 1;
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .toggle-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .toggle-dot.blue { background: #3b82f6; }
  .toggle-dot.red { background: #ef4444; }
  .toggle-dot.green { background: #22c55e; }
  .toggle-dot.purple { background: #a855f7; }

  .panel-content {
    flex: 1;
    overflow: hidden;
    min-height: 0;
  }

  .animation-content {
    background: linear-gradient(135deg, rgba(15, 20, 30, 0.5) 0%, rgba(10, 15, 25, 0.5) 100%);
  }

  @media (max-width: 1024px) {
    .tunnel-animation-panel {
      min-height: 280px;
    }
  }
</style>
