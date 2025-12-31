<!--
  AnimationHelpContent.svelte - Educational content for animation visibility settings

  Layout: Hero preview on top, element descriptions below
  Explains overlay and display options during sequence playback
-->
<script lang="ts">
  // Animation element definitions
  const elements = [
    {
      id: "grid",
      label: "Grid Overlay",
      description: "Diamond or box grid behind the animation.",
      icon: "fa-border-all",
      color: "#64748b",
    },
    {
      id: "beatNumbers",
      label: "Beat Numbers",
      description: "Current beat number during playback.",
      icon: "fa-hashtag",
      color: "var(--semantic-info)",
    },
    {
      id: "trails",
      label: "Motion Trails",
      description: "Visual trails showing prop motion paths.",
      icon: "fa-route",
      color: "#f472b6",
    },
    {
      id: "tka",
      label: "TKA Glyph",
      description: "Letter identifier with turn numbers during animation.",
      icon: "fa-font",
      color: "#818cf8",
    },
    {
      id: "reversals",
      label: "Reversal Indicators",
      description: "Direction change markers.",
      icon: "fa-undo",
      color: "var(--semantic-warning)",
    },
  ];
</script>

<div class="animation-help">
  <!-- Hero Preview -->
  <div class="hero-preview">
    <div class="preview-visual">
      <i class="fas fa-play-circle" aria-hidden="true"></i>
    </div>
    <div class="preview-info">
      <span class="preview-title">Animation Preview</span>
      <p class="preview-subtitle">
        Control what's visible during sequence playback
      </p>
    </div>
  </div>

  <!-- Element Grid -->
  <div class="elements-section">
    <h4 class="section-title">Overlay Options</h4>
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

  <!-- Tips -->
  <div class="tips-section">
    <i class="fas fa-lightbulb" aria-hidden="true"></i>
    <div class="tips-content">
      <span class="tips-title">Tips</span>
      <ul class="tips-list">
        <li>Enable <strong>trails</strong> when learning new sequences</li>
        <li>Turn off <strong>grid</strong> for cleaner video exports</li>
        <li>Use <strong>beat numbers</strong> when practicing timing</li>
      </ul>
    </div>
  </div>
</div>

<style>
  .animation-help {
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
    background: color-mix(in srgb, #f472b6 12%, transparent);
    border: 1px solid color-mix(in srgb, #f472b6 25%, transparent);
    border-radius: 20px;
    flex-shrink: 0;
  }

  .preview-visual i {
    font-size: var(--font-size-3xl);
    color: #f472b6;
    filter: drop-shadow(0 0 16px rgba(244, 114, 182, 0.4));
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
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--theme-text);
    margin-bottom: 6px;
  }

  .preview-subtitle {
    font-size: var(--font-size-sm);
    color: var(--theme-text-dim, var(--theme-text-dim));
    margin: 0;
    max-width: 280px;
    line-height: 1.5;
  }

  /* ========================================
     SECTION TITLE
     ======================================== */
  .section-title {
    margin: 0 0 16px 0;
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--theme-text);
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
    font-size: var(--font-size-sm);
  }

  .element-info {
    flex: 1;
    min-width: 0;
  }

  .element-label {
    display: block;
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--theme-text);
    margin-bottom: 4px;
  }

  .element-description {
    font-size: var(--font-size-compact);
    color: var(--theme-text-dim, var(--theme-text-dim));
    line-height: 1.4;
    margin: 0;
  }

  /* ========================================
     TIPS SECTION
     ======================================== */
  .tips-section {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 16px;
    background: color-mix(in srgb, #f472b6 10%, transparent);
    border: 1px solid color-mix(in srgb, #f472b6 25%, transparent);
    border-radius: 12px;
  }

  .tips-section > i {
    color: #f472b6;
    font-size: var(--font-size-base);
    margin-top: 2px;
    flex-shrink: 0;
  }

  .tips-content {
    flex: 1;
    min-width: 0;
  }

  .tips-title {
    display: block;
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: #f472b6;
    margin-bottom: 8px;
  }

  .tips-list {
    margin: 0;
    padding-left: 18px;
    font-size: var(--font-size-compact);
    color: var(--theme-text-dim, var(--theme-text-dim));
    line-height: 1.6;
  }

  .tips-list li {
    margin-bottom: 4px;
  }

  .tips-list li:last-child {
    margin-bottom: 0;
  }

  .tips-list strong {
    color: var(--theme-text, var(--theme-text));
  }
</style>
