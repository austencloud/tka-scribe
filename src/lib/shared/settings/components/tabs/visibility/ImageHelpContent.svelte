<!--
  ImageHelpContent.svelte - Educational content for image export visibility settings

  Layout: Hero preview on top, element descriptions below
  Explains elements included when exporting sequence images
-->
<script lang="ts">
  // Image composition element definitions
  const elements = [
    {
      id: "word",
      label: "Word/Title",
      description: "Sequence word at the top of the image.",
      icon: "fa-heading",
      color: "#818cf8",
    },
    {
      id: "beatNumbers",
      label: "Beat Numbers",
      description: "Numbered labels beneath each pictograph.",
      icon: "fa-list-ol",
      color: "#60a5fa",
    },
    {
      id: "startPosition",
      label: "Start Position",
      description: "Starting position (beat 0) at the beginning.",
      icon: "fa-play",
      color: "#34d399",
    },
    {
      id: "difficulty",
      label: "Difficulty Level",
      description: "Difficulty rating badge on the image.",
      icon: "fa-chart-line",
      color: "#fbbf24",
    },
    {
      id: "userInfo",
      label: "User Info",
      description: "Username or attribution watermark.",
      icon: "fa-user",
      color: "#f472b6",
    },
  ];
</script>

<div class="image-help">
  <!-- Hero Preview -->
  <div class="hero-preview">
    <div class="preview-visual">
      <i class="fas fa-file-image" aria-hidden="true"></i>
    </div>
    <div class="preview-info">
      <span class="preview-title">Image Export</span>
      <p class="preview-subtitle">
        Customize what's included in exported sequence images
      </p>
    </div>
  </div>

  <!-- Element Grid -->
  <div class="elements-section">
    <h4 class="section-title">Composition Options</h4>
    <div class="elements-grid">
      {#each elements as element (element.id)}
        <div class="element-card" style="--element-color: {element.color}">
          <div class="element-icon">
            <i class="fas {element.icon}" aria-hidden="true"></i>
          </div>
          <div class="element-info">
            <span class="element-label">{element.label}</span>
            <p class="element-description">{element.description}</p>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Use Cases -->
  <div class="use-cases">
    <i class="fas fa-share-alt" aria-hidden="true"></i>
    <div class="use-cases-content">
      <span class="use-cases-title">Sharing Tips</span>
      <div class="use-case-grid">
        <div class="use-case">
          <span class="use-case-label">For Teaching</span>
          <span class="use-case-desc"
            >Enable word, beat numbers, and start position</span
          >
        </div>
        <div class="use-case">
          <span class="use-case-label">For Social Media</span>
          <span class="use-case-desc"
            >Enable word and user info for attribution</span
          >
        </div>
        <div class="use-case">
          <span class="use-case-label">Clean Export</span>
          <span class="use-case-desc"
            >Disable everything for minimal pictograph-only images</span
          >
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .image-help {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  /* ========================================
     HERO PREVIEW
     ======================================== */
  .hero-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 32px 24px;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
  }

  @media (min-width: 500px) {
    .hero-preview {
      flex-direction: row;
      justify-content: center;
      gap: 24px;
    }
  }

  .preview-visual {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100px;
    height: 100px;
    background: color-mix(in srgb, #34d399 12%, transparent);
    border: 1px solid color-mix(in srgb, #34d399 25%, transparent);
    border-radius: 20px;
    flex-shrink: 0;
  }

  .preview-visual i {
    font-size: 48px;
    color: #34d399;
    filter: drop-shadow(0 0 16px rgba(52, 211, 153, 0.4));
  }

  .preview-info {
    text-align: center;
  }

  @media (min-width: 500px) {
    .preview-info {
      text-align: left;
    }
  }

  .preview-title {
    display: block;
    font-size: 18px;
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
    margin-bottom: 6px;
  }

  .preview-subtitle {
    font-size: 14px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    margin: 0;
    max-width: 280px;
    line-height: 1.5;
  }

  /* ========================================
     SECTION TITLE
     ======================================== */
  .section-title {
    margin: 0 0 16px 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* ========================================
     ELEMENTS GRID
     ======================================== */
  .elements-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
  }

  @media (min-width: 500px) {
    .elements-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: 800px) {
    .elements-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .element-card {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
  }

  .element-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    background: color-mix(in srgb, var(--element-color) 15%, transparent);
    border: 1px solid color-mix(in srgb, var(--element-color) 30%, transparent);
    border-radius: 10px;
    color: var(--element-color);
    font-size: 14px;
  }

  .element-info {
    flex: 1;
    min-width: 0;
  }

  .element-label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
    margin-bottom: 4px;
  }

  .element-description {
    font-size: 12px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    line-height: 1.4;
    margin: 0;
  }

  /* ========================================
     USE CASES
     ======================================== */
  .use-cases {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 16px;
    background: color-mix(in srgb, #34d399 10%, transparent);
    border: 1px solid color-mix(in srgb, #34d399 25%, transparent);
    border-radius: 12px;
  }

  .use-cases > i {
    color: #34d399;
    font-size: 16px;
    margin-top: 2px;
    flex-shrink: 0;
  }

  .use-cases-content {
    flex: 1;
    min-width: 0;
  }

  .use-cases-title {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #34d399;
    margin-bottom: 12px;
  }

  .use-case-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
  }

  @media (min-width: 600px) {
    .use-case-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .use-case {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.04);
    border-radius: 8px;
  }

  .use-case-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
  }

  .use-case-desc {
    font-size: 12px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    line-height: 1.4;
  }
</style>
