<!--
  GridSelectionAreaMobile.svelte

  Mobile-optimized empty state UI for grid mode.
  Compact layout with visual grid preview and touch-friendly button.
-->
<script lang="ts">
  let {
    onStartBuilding,
  }: {
    onStartBuilding: () => void;
  } = $props();

  const gridPositions = [
    { label: "TL", rotation: 0, color: "#ec4899" },
    { label: "TR", rotation: 90, color: "#8b5cf6" },
    { label: "BL", rotation: 180, color: "#06b6d4" },
    { label: "BR", rotation: 270, color: "#10b981" },
  ];
</script>

<div class="mobile-empty-state">
  <!-- Compact Hero -->
  <div class="hero">
    <div class="hero-icon">
      <i class="fas fa-grip"></i>
    </div>
    <h1>Grid Mode</h1>
    <p>Create 2×2 compositions with rotational variations</p>
  </div>

  <!-- Primary Action - Large Touch Target -->
  <button class="action-btn" onclick={onStartBuilding}>
    <i class="fas fa-plus"></i>
    <span>Start Building Grid</span>
  </button>

  <!-- Compact Grid Preview -->
  <div class="grid-preview">
    <div class="preview-label">
      <i class="fas fa-eye"></i>
      <span>Preview</span>
    </div>
    <div class="preview-grid">
      {#each gridPositions as pos}
        <div class="preview-cell" style="--cell-color: {pos.color}">
          <span class="rotation">{pos.rotation}°</span>
          <i
            class="fas fa-person-walking"
            style="transform: rotate({pos.rotation}deg);"
          ></i>
        </div>
      {/each}
    </div>
  </div>

  <!-- Compact Feature Pills -->
  <div class="features">
    <div class="feature">
      <i class="fas fa-rotate"></i>
      <span>Rotation Offsets</span>
    </div>
    <div class="feature">
      <i class="fas fa-clone"></i>
      <span>Same or Different</span>
    </div>
    <div class="feature">
      <i class="fas fa-sync"></i>
      <span>Synced Playback</span>
    </div>
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
    background: linear-gradient(135deg, rgba(251, 146, 60, 0.25) 0%, rgba(234, 88, 12, 0.25) 100%);
    border: 2px solid rgba(251, 146, 60, 0.4);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.75rem;
    color: #fb923c;
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
    background: linear-gradient(135deg, #fb923c 0%, #ea580c 100%);
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

  /* Compact Grid Preview */
  .grid-preview {
    width: 100%;
    max-width: 220px;
    padding: 0.85rem;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
  }

  .preview-label {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    margin-bottom: 0.75rem;
    font-size: 0.75rem;
    opacity: 0.6;
  }

  .preview-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    aspect-ratio: 1;
  }

  .preview-cell {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--cell-color, rgba(255, 255, 255, 0.1));
    border-radius: 8px;
    padding: 0.5rem;
  }

  .preview-cell .rotation {
    position: absolute;
    top: 4px;
    left: 4px;
    padding: 2px 5px;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 3px;
    font-size: 0.6rem;
    font-weight: 600;
    color: var(--cell-color);
  }

  .preview-cell i {
    font-size: 1.5rem;
    opacity: 0.3;
    color: var(--cell-color);
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

  .feature {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 0.75rem;
    background: rgba(251, 146, 60, 0.1);
    border: 1px solid rgba(251, 146, 60, 0.2);
    border-radius: 20px;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.8);
  }

  .feature i {
    font-size: 0.7rem;
    color: #fb923c;
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

    .grid-preview {
      max-width: 180px;
      padding: 0.6rem;
    }

    .preview-cell i {
      font-size: 1.2rem;
    }

    .features {
      display: none;
    }
  }
</style>
