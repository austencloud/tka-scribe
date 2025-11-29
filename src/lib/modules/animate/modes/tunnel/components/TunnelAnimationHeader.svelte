<!--
  TunnelAnimationHeader.svelte

  Header bar for tunnel mode showing sequence badges and change button.
-->
<script lang="ts">
  // Props
  let {
    primaryWord,
    secondaryWord,
    onChangeSequences,
  }: {
    primaryWord: string;
    secondaryWord: string;
    onChangeSequences: () => void;
  } = $props();
</script>

<div class="animation-header">
  <div class="header-left">
    <div class="header-icon-badge">
      <i class="fas fa-layer-group"></i>
    </div>
    <div class="header-info">
      <h2>Tunnel Mode</h2>
      <div class="sequence-badges">
        <span class="badge primary-badge">
          <span class="badge-dot blue"></span>
          <span class="badge-dot red"></span>
          {primaryWord}
        </span>
        <span class="badge-plus">+</span>
        <span class="badge secondary-badge">
          <span class="badge-dot green"></span>
          <span class="badge-dot purple"></span>
          {secondaryWord}
        </span>
      </div>
    </div>
  </div>
  <button class="change-button" onclick={onChangeSequences}>
    <i class="fas fa-exchange-alt"></i>
    <span>Change</span>
  </button>
</div>

<style>
  .animation-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: linear-gradient(135deg, rgba(20, 184, 166, 0.08) 0%, rgba(6, 182, 212, 0.05) 100%);
    border-bottom: 1px solid rgba(20, 184, 166, 0.15);
    flex-shrink: 0;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .header-icon-badge {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    color: #14b8a6;
  }

  .header-info h2 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }

  .sequence-badges {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 2px;
  }

  .badge {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 12px 16px;
    min-height: 48px;
    border-radius: 24px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .primary-badge {
    background: rgba(59, 130, 246, 0.15);
    color: #60a5fa;
  }

  .secondary-badge {
    background: rgba(34, 197, 94, 0.15);
    color: #4ade80;
  }

  .badge-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  .badge-dot.blue { background: #3b82f6; }
  .badge-dot.red { background: #ef4444; }
  .badge-dot.green { background: #22c55e; }
  .badge-dot.purple { background: #a855f7; }

  .badge-plus {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.3);
  }

  .change-button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .change-button:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .change-button i {
    font-size: 0.75rem;
  }

  @media (max-width: 1024px) {
    .animation-header {
      flex-wrap: wrap;
      gap: 10px;
    }

    .sequence-badges {
      flex-wrap: wrap;
    }
  }
</style>
