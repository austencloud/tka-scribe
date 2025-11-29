<!--
  MirrorSelectionArea.svelte

  Empty state UI for mirror mode with mode explanation and features.
-->
<script lang="ts">
  let {
    onSelectSequence,
  }: {
    onSelectSequence: () => void;
  } = $props();
</script>

<div class="empty-state">
  <div class="empty-state-content">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-icon">
        <i class="fas fa-clone"></i>
      </div>
      <h1>Mirror Mode</h1>
      <p>Compare your sequence side-by-side with its mirrored reflection</p>

      <button class="primary-action-btn" onclick={onSelectSequence}>
        <i class="fas fa-folder-open"></i>
        Select Sequence
      </button>
    </div>

    <!-- How It Works -->
    <div class="info-section">
      <h3><i class="fas fa-info-circle"></i> How Mirror Mode Works</h3>
      <div class="info-cards">
        <div class="info-card">
          <div class="info-icon">
            <i class="fas fa-arrows-left-right"></i>
          </div>
          <div class="info-text">
            <h4>Vertical Mirror</h4>
            <p>Flips the sequence horizontally, like looking in a mirror</p>
          </div>
        </div>
        <div class="info-card">
          <div class="info-icon">
            <i class="fas fa-arrows-up-down"></i>
          </div>
          <div class="info-text">
            <h4>Horizontal Mirror</h4>
            <p>Flips the sequence vertically, top to bottom reflection</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Use Case -->
    <div class="use-case-tip">
      <i class="fas fa-lightbulb"></i>
      <span>Great for practicing ambidextrous movements or checking symmetry</span>
    </div>
  </div>
</div>

<style>
  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: 2rem;
    overflow-y: auto;
  }

  .empty-state-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2.5rem;
    max-width: 700px;
    width: 100%;
  }

  .hero-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1rem;
  }

  .hero-icon {
    width: 100px;
    height: 100px;
    background: linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%);
    border: 2px solid rgba(6, 182, 212, 0.3);
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    color: #06b6d4;
    margin-bottom: 0.5rem;
  }

  .hero-section h1 {
    margin: 0;
    font-size: 2rem;
    font-weight: 700;
    background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.8) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero-section p {
    margin: 0;
    font-size: 1.1rem;
    opacity: 0.6;
    max-width: 400px;
  }

  .primary-action-btn {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 2rem;
    background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
    border: none;
    border-radius: 12px;
    color: white;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 0.5rem;
  }

  .primary-action-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(6, 182, 212, 0.4);
  }

  .info-section {
    width: 100%;
  }

  .info-section h3 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0 0 1rem 0;
    font-size: 1rem;
    opacity: 0.8;
  }

  .info-cards {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .info-card {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.25rem;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    transition: all 0.2s ease;
  }

  .info-card:hover {
    background: rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.12);
    transform: translateY(-2px);
  }

  .info-icon {
    width: 44px;
    height: 44px;
    background: rgba(6, 182, 212, 0.15);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #22d3ee;
    font-size: 1.1rem;
    flex-shrink: 0;
  }

  .info-text h4 {
    margin: 0 0 0.25rem 0;
    font-size: 0.95rem;
    font-weight: 600;
  }

  .info-text p {
    margin: 0;
    font-size: 0.85rem;
    opacity: 0.6;
    line-height: 1.4;
  }

  .use-case-tip {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.85rem 1.25rem;
    background: rgba(251, 191, 36, 0.1);
    border: 1px solid rgba(251, 191, 36, 0.2);
    border-radius: 10px;
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.8);
  }

  .use-case-tip i {
    color: #fbbf24;
    font-size: 1.1rem;
  }

  @media (max-width: 768px) {
    .info-cards {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 480px) {
    .empty-state {
      padding: 1rem;
    }
  }
</style>
