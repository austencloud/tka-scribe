<!--
  GridSelectionArea.svelte

  Empty state UI for grid mode with visual preview and features.
-->
<script lang="ts">
  let {
    onStartBuilding,
  }: {
    onStartBuilding: () => void;
  } = $props();

  const gridPositions = [
    { shortLabel: "TL", rotation: 0, color: "#ec4899" },
    { shortLabel: "TR", rotation: 90, color: "#8b5cf6" },
    { shortLabel: "BL", rotation: 180, color: "#06b6d4" },
    { shortLabel: "BR", rotation: 270, color: "#10b981" },
  ];

  const features = [
    {
      icon: "fa-rotate",
      title: "Rotation Offsets",
      description: "Each quadrant has a different rotation angle",
    },
    {
      icon: "fa-clone",
      title: "Same or Different",
      description: "Use one sequence 4 times or mix different ones",
    },
    {
      icon: "fa-sync",
      title: "Synchronized Play",
      description: "All animations play together in perfect sync",
    },
  ];
</script>

<div class="empty-state">
  <div class="empty-state-content">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-icon">
        <i class="fas fa-grip"></i>
      </div>
      <h1>Grid Mode</h1>
      <p>Create stunning 2×2 compositions with rotational variations</p>

      <button class="primary-action-btn" onclick={onStartBuilding}>
        <i class="fas fa-plus"></i>
        Start Building Grid
      </button>
    </div>

    <!-- Grid Preview -->
    <div class="grid-preview">
      <div class="preview-title">
        <i class="fas fa-eye"></i>
        Preview
      </div>
      <div class="preview-grid">
        {#each gridPositions as pos}
          <div class="preview-cell" style="--cell-color: {pos.color}">
            <div class="preview-rotation">{pos.rotation}°</div>
            <i
              class="fas fa-person-walking preview-icon"
              style="transform: rotate({pos.rotation}deg);"
            ></i>
            <div class="preview-label">{pos.shortLabel}</div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Features -->
    <div class="features-row">
      {#each features as feature}
        <div class="feature-item">
          <div class="feature-icon">
            <i class="fas {feature.icon}"></i>
          </div>
          <div class="feature-text">
            <h4>{feature.title}</h4>
            <p>{feature.description}</p>
          </div>
        </div>
      {/each}
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
    gap: 2rem;
    max-width: 800px;
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
    background: linear-gradient(135deg, rgba(251, 146, 60, 0.2) 0%, rgba(234, 88, 12, 0.2) 100%);
    border: 2px solid rgba(251, 146, 60, 0.3);
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    color: #fb923c;
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
    background: linear-gradient(135deg, #fb923c 0%, #ea580c 100%);
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
    box-shadow: 0 12px 32px rgba(251, 146, 60, 0.4);
  }

  .grid-preview {
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 1.25rem;
    width: 100%;
    max-width: 400px;
  }

  .preview-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    font-size: 0.9rem;
    opacity: 0.7;
  }

  .preview-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 8px;
    aspect-ratio: 1;
  }

  .preview-cell {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--cell-color, rgba(255, 255, 255, 0.1));
    border-radius: 12px;
    padding: 1rem;
    gap: 0.5rem;
  }

  .preview-rotation {
    position: absolute;
    top: 0.5rem;
    left: 0.5rem;
    padding: 0.2rem 0.5rem;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 4px;
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--cell-color);
  }

  .preview-icon {
    font-size: 2.5rem;
    opacity: 0.3;
    color: var(--cell-color);
  }

  .preview-label {
    font-size: 0.75rem;
    font-weight: 600;
    opacity: 0.5;
  }

  .features-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    width: 100%;
  }

  .feature-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.75rem;
    padding: 1.25rem 1rem;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    transition: all 0.2s ease;
  }

  .feature-item:hover {
    background: rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.12);
    transform: translateY(-2px);
  }

  .feature-icon {
    width: 44px;
    height: 44px;
    background: rgba(251, 146, 60, 0.15);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fb923c;
    font-size: 1.1rem;
  }

  .feature-text h4 {
    margin: 0;
    font-size: 0.9rem;
    font-weight: 600;
  }

  .feature-text p {
    margin: 0;
    font-size: 0.8rem;
    opacity: 0.6;
    line-height: 1.4;
  }

  @media (max-width: 768px) {
    .features-row {
      grid-template-columns: 1fr;
    }

    .grid-preview {
      max-width: 300px;
    }
  }

  @media (max-width: 480px) {
    .empty-state {
      padding: 1rem;
    }
  }
</style>
