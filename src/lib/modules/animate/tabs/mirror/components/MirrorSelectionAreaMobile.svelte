<!--
  MirrorSelectionAreaMobile.svelte

  Mobile-optimized empty state UI for mirror mode.
  Condensed layout with larger touch targets for small screens.
-->
<script lang="ts">
  let {
    onSelectSequence,
  }: {
    onSelectSequence: () => void;
  } = $props();
</script>

<div class="mobile-empty-state">
  <!-- Compact Hero -->
  <div class="hero">
    <div class="hero-icon">
      <i class="fas fa-clone"></i>
    </div>
    <h1>Mirror Mode</h1>
    <p>Compare your sequence with its mirrored reflection</p>
  </div>

  <!-- Primary Action - Large Touch Target -->
  <button class="action-btn" onclick={onSelectSequence}>
    <i class="fas fa-folder-open"></i>
    <span>Select Sequence</span>
  </button>

  <!-- Compact Mirror Type Indicators -->
  <div class="mirror-types">
    <div class="mirror-type">
      <div class="type-icon">
        <i class="fas fa-arrows-left-right"></i>
      </div>
      <div class="type-info">
        <span class="type-label">Vertical Mirror</span>
        <span class="type-desc"
          >Flips the sequence horizontally, like looking in a mirror</span
        >
      </div>
    </div>
    <div class="mirror-type">
      <div class="type-icon">
        <i class="fas fa-arrows-up-down"></i>
      </div>
      <div class="type-info">
        <span class="type-label">Horizontal Mirror</span>
        <span class="type-desc"
          >Flips the sequence vertically, top to bottom reflection</span
        >
      </div>
    </div>
  </div>

  <!-- Minimal Tip -->
  <div class="tip">
    <i class="fas fa-lightbulb"></i>
    <span>Great for practicing ambidextrous movements</span>
  </div>
</div>

<style>
  .mobile-empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.25rem;
    width: 100%;
    height: 100%;
    padding: 1rem;
    padding-bottom: env(safe-area-inset-bottom, 1rem);
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  /* Compact Hero */
  .hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.5rem;
  }

  .hero-icon {
    width: 64px;
    height: 64px;
    background: linear-gradient(
      135deg,
      rgba(6, 182, 212, 0.25) 0%,
      rgba(59, 130, 246, 0.25) 100%
    );
    border: 2px solid rgba(6, 182, 212, 0.4);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.75rem;
    color: #06b6d4;
  }

  .hero h1 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    background: linear-gradient(
      135deg,
      #fff 0%,
      rgba(255, 255, 255, 0.85) 100%
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero p {
    margin: 0;
    font-size: 0.9rem;
    opacity: 0.6;
    max-width: 280px;
    line-height: 1.4;
  }

  /* Large Touch-Friendly Button */
  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    width: 100%;
    max-width: 300px;
    min-height: 56px;
    padding: 1rem 1.5rem;
    background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
    border: none;
    border-radius: 14px;
    color: white;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .action-btn:active {
    transform: scale(0.98);
  }

  .action-btn i {
    font-size: 1.2rem;
  }

  /* Compact Mirror Types */
  .mirror-types {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
    max-width: 320px;
  }

  .mirror-type {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.85rem;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(6, 182, 212, 0.15);
    border-radius: 12px;
  }

  .type-icon {
    width: 48px;
    height: 48px;
    background: rgba(6, 182, 212, 0.15);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #22d3ee;
    font-size: 1rem;
    flex-shrink: 0;
  }

  .type-info {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .type-label {
    font-size: 0.9rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }

  .type-desc {
    font-size: 0.75rem;
    opacity: 0.6;
    line-height: 1.3;
  }

  /* Minimal Tip */
  .tip {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1rem;
    background: rgba(251, 191, 36, 0.1);
    border: 1px solid rgba(251, 191, 36, 0.2);
    border-radius: 8px;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.75);
  }

  .tip i {
    color: #fbbf24;
    font-size: 0.9rem;
    flex-shrink: 0;
  }

  /* Extra small screens */
  @media (max-height: 600px) {
    .mobile-empty-state {
      gap: 1rem;
      justify-content: flex-start;
      padding-top: 0.75rem;
    }

    .hero-icon {
      width: 52px;
      height: 52px;
      font-size: 1.4rem;
    }

    .hero h1 {
      font-size: 1.3rem;
    }

    .hero p {
      font-size: 0.85rem;
    }

    .type-desc {
      display: none;
    }

    .tip {
      display: none;
    }
  }
</style>
