<!--
  SingleSelectionAreaMobile.svelte

  Mobile-optimized empty state UI for single mode.
  Condensed layout with larger touch targets for small screens.
-->
<script lang="ts">
  let {
    onBrowseSequences,
  }: {
    onBrowseSequences: () => void;
  } = $props();

  // Condensed feature list for mobile
  const features = [
    { icon: "fa-play-circle", label: "Smooth Playback" },
    { icon: "fa-sliders-h", label: "BPM Control" },
    { icon: "fa-repeat", label: "Loop Mode" },
    { icon: "fa-download", label: "Export" },
  ];
</script>

<div class="mobile-empty-state">
  <!-- Compact Hero -->
  <div class="hero">
    <div class="hero-icon">
      <i class="fas fa-film"></i>
    </div>
    <h1>Single Mode</h1>
    <p>Animate your sequences with smooth, fluid motion</p>
  </div>

  <!-- Primary Action - Large Touch Target -->
  <button class="action-btn" onclick={onBrowseSequences}>
    <i class="fas fa-folder-open"></i>
    <span>Browse Sequences</span>
  </button>

  <!-- Compact Feature Pills -->
  <div class="features">
    {#each features as feature}
      <div class="feature-pill">
        <i class="fas {feature.icon}"></i>
        <span>{feature.label}</span>
      </div>
    {/each}
  </div>

  <!-- Minimal Tip -->
  <div class="tip">
    <i class="fas fa-lightbulb"></i>
    <span>Tap tempo to match your music's BPM</span>
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
    background: linear-gradient(135deg, rgba(236, 72, 153, 0.25) 0%, rgba(139, 92, 246, 0.25) 100%);
    border: 2px solid rgba(236, 72, 153, 0.4);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.75rem;
    color: #ec4899;
  }

  .hero h1 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.85) 100%);
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
    background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
    border: none;
    border-radius: 14px;
    color: white;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .action-btn:active {
    transform: scale(0.98);
  }

  .action-btn i {
    font-size: 1.2rem;
  }

  /* Compact Feature Pills */
  .features {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    max-width: 320px;
  }

  .feature-pill {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 0.75rem;
    background: rgba(139, 92, 246, 0.12);
    border: 1px solid rgba(139, 92, 246, 0.2);
    border-radius: 20px;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.85);
  }

  .feature-pill i {
    font-size: 0.7rem;
    color: #a78bfa;
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

    .tip {
      display: none;
    }
  }
</style>
