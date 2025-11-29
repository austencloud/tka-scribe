<!--
  SingleSelectionArea.svelte

  Empty state UI for single mode when no sequence is selected.
  Shows hero section with call-to-action and feature highlights.
-->
<script lang="ts">
  // Props
  let {
    onBrowseSequences,
  }: {
    onBrowseSequences: () => void;
  } = $props();

  // Feature highlights for empty state
  const features = [
    {
      icon: "fa-play-circle",
      title: "Smooth Playback",
      description: "Watch your sequence animate with fluid transitions",
    },
    {
      icon: "fa-sliders-h",
      title: "BPM Control",
      description: "Tap tempo or adjust speed to match your rhythm",
    },
    {
      icon: "fa-repeat",
      title: "Loop Mode",
      description: "Practice by looping animations continuously",
    },
    {
      icon: "fa-download",
      title: "Export",
      description: "Save as GIF or video to share your work",
    },
  ];
</script>

<div class="empty-state">
  <div class="empty-state-content">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-icon">
        <i class="fas fa-film"></i>
      </div>
      <h1>Single Mode Animation</h1>
      <p>Bring your sequences to life with smooth, fluid animations</p>

      <button class="primary-action-btn" onclick={onBrowseSequences}>
        <i class="fas fa-folder-open"></i>
        Browse Sequences
      </button>
    </div>

    <!-- Feature Highlights -->
    <div class="features-grid">
      {#each features as feature}
        <div class="feature-card">
          <div class="feature-icon">
            <i class="fas {feature.icon}"></i>
          </div>
          <div class="feature-text">
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        </div>
      {/each}
    </div>

    <!-- Quick Tip -->
    <div class="quick-tip">
      <i class="fas fa-lightbulb"></i>
      <span>Tip: Use the tap tempo feature to match your music's BPM</span>
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
    max-width: 800px;
    width: 100%;
  }

  /* Hero Section */
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
    background: linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
    border: 2px solid rgba(236, 72, 153, 0.3);
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    color: #ec4899;
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
    background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
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
    box-shadow: 0 12px 32px rgba(236, 72, 153, 0.4);
  }

  /* Features Grid */
  .features-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    width: 100%;
  }

  .feature-card {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.25rem;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    transition: all 0.2s ease;
  }

  .feature-card:hover {
    background: rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.12);
    transform: translateY(-2px);
  }

  .feature-icon {
    width: 44px;
    height: 44px;
    background: rgba(139, 92, 246, 0.15);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #a78bfa;
    font-size: 1.1rem;
    flex-shrink: 0;
  }

  .feature-text h3 {
    margin: 0 0 0.25rem 0;
    font-size: 0.95rem;
    font-weight: 600;
  }

  .feature-text p {
    margin: 0;
    font-size: 0.85rem;
    opacity: 0.6;
    line-height: 1.4;
  }

  /* Quick Tip */
  .quick-tip {
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

  .quick-tip i {
    color: #fbbf24;
    font-size: 1.1rem;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .features-grid {
      grid-template-columns: 1fr;
    }

    .hero-section h1 {
      font-size: 1.6rem;
    }
  }

  @media (max-width: 480px) {
    .empty-state {
      padding: 1rem;
    }

    .feature-card {
      padding: 1rem;
    }
  }
</style>
