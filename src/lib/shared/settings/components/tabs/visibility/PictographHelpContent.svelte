<!--
  PictographHelpContent.svelte - Educational content for pictograph visibility settings

  Layout: Hero preview on top, element descriptions below
  Interactive pictograph with element highlighting
-->
<script lang="ts">
  import PictographElementIndicator from "./PictographElementIndicator.svelte";

  type ElementId =
    | "tka"
    | "vtg"
    | "elemental"
    | "positions"
    | "reversals"
    | "turnNumbers"
    | "nonRadial"
    | null;

  let selectedElement = $state<ElementId>(null);

  // Element definitions with descriptions
  const elements: Array<{
    id: ElementId;
    label: string;
    description: string;
    icon: string;
    color: string;
  }> = [
    {
      id: "tka",
      label: "TKA Glyph",
      description: "The letter at the center identifying the pictograph.",
      icon: "fa-font",
      color: "#818cf8",
    },
    {
      id: "vtg",
      label: "VTG Mode",
      description: "Visual Type Glyph showing the motion's classification.",
      icon: "fa-shapes",
      color: "#a78bfa",
    },
    {
      id: "elemental",
      label: "Elemental Glyph",
      description: "Directional element indicator for the motion.",
      icon: "fa-compass",
      color: "#34d399",
    },
    {
      id: "positions",
      label: "Positions Glyph",
      description:
        "Start → End position indicator at the top of the pictograph.",
      icon: "fa-map-marker-alt",
      color: "#fbbf24",
    },
    {
      id: "reversals",
      label: "Reversal Indicators",
      description: "Markers when motion reverses direction.",
      icon: "fa-undo",
      color: "#f472b6",
    },
    {
      id: "turnNumbers",
      label: "Turn Numbers",
      description:
        "Rotation counts shown beside the TKA glyph. Only visible when glyph is on.",
      icon: "fa-hashtag",
      color: "#60a5fa",
    },
    {
      id: "nonRadial",
      label: "Non-radial Points",
      description: "Markers for off-grid positions.",
      icon: "fa-dot-circle",
      color: "#f97316",
    },
  ];

  function selectElement(id: ElementId) {
    selectedElement = selectedElement === id ? null : id;
  }
</script>

<div class="pictograph-help">
  <!-- Hero Preview -->
  <div class="hero-preview">
    <PictographElementIndicator
      indicatedElement={selectedElement}
      animate={true}
    />
    <p class="preview-hint">
      {#if selectedElement}
        Click element to deselect
      {:else}
        Click an element below to highlight it
      {/if}
    </p>
  </div>

  <!-- Element Grid -->
  <div class="elements-section">
    <h4 class="section-title">Pictograph Elements</h4>
    <div class="elements-grid">
      {#each elements as element (element.id)}
        <button
          class="element-card"
          class:selected={selectedElement === element.id}
          onclick={() => selectElement(element.id)}
          style="--element-color: {element.color}"
          type="button"
        >
          <div class="element-icon">
            <i class="fas {element.icon}"></i>
          </div>
          <div class="element-info">
            <span class="element-label">{element.label}</span>
            <p class="element-description">{element.description}</p>
          </div>
        </button>
      {/each}
    </div>
  </div>

  <!-- Learn More -->
  <div class="learn-more">
    <i class="fas fa-lightbulb"></i>
    <span
      >Visit the <strong>Learn</strong> module for detailed pictograph tutorials.</span
    >
  </div>
</div>

<style>
  .pictograph-help {
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
    gap: 12px;
    padding: 24px;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
  }

  .hero-preview :global(.element-indicator) {
    width: 100%;
    max-width: 320px;
  }

  @media (min-width: 640px) {
    .hero-preview :global(.element-indicator) {
      max-width: 360px;
    }
  }

  .preview-hint {
    font-size: 13px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    margin: 0;
    text-align: center;
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

  @media (min-width: 1000px) {
    .elements-grid {
      grid-template-columns: repeat(4, 1fr);
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
    cursor: pointer;
    text-align: left;
    transition: all 150ms ease;
    -webkit-tap-highlight-color: transparent;
  }

  .element-card:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.15);
  }

  .element-card.selected {
    background: color-mix(in srgb, var(--element-color) 18%, transparent);
    border-color: color-mix(in srgb, var(--element-color) 50%, transparent);
    box-shadow: 0 0 16px
      color-mix(in srgb, var(--element-color) 25%, transparent);
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
    transition: all 150ms ease;
  }

  .element-card.selected .element-icon {
    background: color-mix(in srgb, var(--element-color) 30%, transparent);
    border-color: var(--element-color);
    box-shadow: 0 0 10px
      color-mix(in srgb, var(--element-color) 50%, transparent);
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
    transition: color 150ms ease;
  }

  .element-card.selected .element-label {
    color: var(--element-color);
  }

  .element-description {
    font-size: 12px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    line-height: 1.4;
    margin: 0;
  }

  /* ========================================
     LEARN MORE
     ======================================== */
  .learn-more {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 16px;
    background: color-mix(
      in srgb,
      var(--theme-accent, #6366f1) 10%,
      transparent
    );
    border: 1px solid
      color-mix(in srgb, var(--theme-accent, #6366f1) 25%, transparent);
    border-radius: 12px;
    font-size: 13px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
  }

  .learn-more i {
    color: var(--theme-accent, #a78bfa);
    font-size: 14px;
  }

  .learn-more strong {
    color: var(--theme-accent, #a78bfa);
  }

  /* ========================================
     FOCUS STATES
     ======================================== */
  .element-card:focus-visible {
    outline: 2px solid var(--element-color);
    outline-offset: 2px;
  }

  /* ========================================
     REDUCED MOTION
     ======================================== */
  @media (prefers-reduced-motion: reduce) {
    .element-card,
    .element-icon {
      transition: none;
    }
  }
</style>
