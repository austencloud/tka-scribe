<!--
  VTGModesGallery.svelte - Visual gallery of all 6 VTG modes

  VTG = Vulcan Tech Gospel
  Shows all 6 motion classification modes with their elemental associations:
  - SS (Split Same) → Water
  - SO (Split Opp) → Fire
  - TS (Together Same) → Earth
  - TO (Together Opp) → Air
  - QS (Quarter Same) → Sun
  - QO (Quarter Opp) → Moon
-->
<script lang="ts">
  interface VTGModeInfo {
    code: string;
    name: string;
    description: string;
    elemental: string;
    elementalColor: string;
  }

  const vtgModes: VTGModeInfo[] = [
    {
      code: "SS",
      name: "Split Same",
      description:
        "Hands split apart while moving in the same rotational direction",
      elemental: "Water",
      elementalColor: "#3b82f6",
    },
    {
      code: "SO",
      name: "Split Opposite",
      description:
        "Hands split apart while moving in opposite rotational directions",
      elemental: "Fire",
      elementalColor: "#ef4444",
    },
    {
      code: "TS",
      name: "Together Same",
      description: "Hands move together while rotating in the same direction",
      elemental: "Earth",
      elementalColor: "#84cc16",
    },
    {
      code: "TO",
      name: "Together Opposite",
      description: "Hands move together while rotating in opposite directions",
      elemental: "Air",
      elementalColor: "#a78bfa",
    },
    {
      code: "QS",
      name: "Quarter Same",
      description: "Quarter-turn motion with both hands in the same direction",
      elemental: "Sun",
      elementalColor: "#fbbf24",
    },
    {
      code: "QO",
      name: "Quarter Opposite",
      description: "Quarter-turn motion with hands in opposite directions",
      elemental: "Moon",
      elementalColor: "#94a3b8",
    },
  ];

  let selectedMode = $state<string | null>(null);

  function selectMode(code: string) {
    selectedMode = selectedMode === code ? null : code;
  }
</script>

<div class="vtg-gallery">
  <h4 class="gallery-title">VTG Modes</h4>
  <p class="gallery-subtitle">
    Six visual classifications for motion types, each linked to an elemental
    symbol
  </p>

  <div class="modes-grid">
    {#each vtgModes as mode (mode.code)}
      <button
        class="mode-card"
        class:selected={selectedMode === mode.code}
        onclick={() => selectMode(mode.code)}
        style="--elemental-color: {mode.elementalColor}"
        type="button"
      >
        <div class="mode-glyph">
          <img
            src="/images/vtg_glyphs/{mode.code}.svg"
            alt="{mode.name} VTG glyph"
          />
        </div>
        <span class="mode-code">{mode.code}</span>
        <span class="mode-elemental">{mode.elemental}</span>
      </button>
    {/each}
  </div>

  <!-- Selected mode details -->
  {#if selectedMode}
    {@const mode = vtgModes.find((m) => m.code === selectedMode)}
    {#if mode}
      <div
        class="mode-details"
        style="--elemental-color: {mode.elementalColor}"
      >
        <div class="details-header">
          <img
            src="/images/vtg_glyphs/{mode.code}.svg"
            alt={mode.name}
            class="details-glyph"
          />
          <div class="details-title">
            <span class="details-name">{mode.name}</span>
            <span class="details-elemental">{mode.elemental} Element</span>
          </div>
        </div>
        <p class="details-description">{mode.description}</p>
      </div>
    {/if}
  {:else}
    <p class="select-hint">Tap a mode to see details</p>
  {/if}
</div>

<style>
  .vtg-gallery {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .gallery-title {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
  }

  .gallery-subtitle {
    margin: 0;
    font-size: 13px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    line-height: 1.4;
  }

  /* ========================================
     MODES GRID - 3x2 layout
     ======================================== */
  .modes-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .mode-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 12px 8px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    cursor: pointer;
    transition: all 150ms ease;
    -webkit-tap-highlight-color: transparent;
  }

  .mode-card:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.15);
  }

  .mode-card.selected {
    background: color-mix(in srgb, var(--elemental-color) 15%, transparent);
    border-color: color-mix(in srgb, var(--elemental-color) 45%, transparent);
    box-shadow: 0 0 12px
      color-mix(in srgb, var(--elemental-color) 25%, transparent);
  }

  .mode-glyph {
    width: 48px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 150ms ease;
  }

  .mode-glyph img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: brightness(0) invert(1);
    opacity: 0.8;
    transition: all 150ms ease;
  }

  .mode-card.selected .mode-glyph img {
    filter: brightness(0) invert(1) drop-shadow(0 0 6px var(--elemental-color));
    opacity: 1;
  }

  .mode-card:hover .mode-glyph {
    transform: scale(1.05);
  }

  .mode-code {
    font-size: 14px;
    font-weight: 700;
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
    font-family: ui-monospace, SFMono-Regular, "SF Mono", monospace;
    letter-spacing: 1px;
    transition: color 150ms ease;
  }

  .mode-card.selected .mode-code {
    color: var(--elemental-color);
  }

  .mode-elemental {
    font-size: 11px;
    font-weight: 500;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: color 150ms ease;
  }

  .mode-card.selected .mode-elemental {
    color: var(--elemental-color);
  }

  /* ========================================
     MODE DETAILS
     ======================================== */
  .mode-details {
    padding: 14px;
    background: color-mix(in srgb, var(--elemental-color) 10%, transparent);
    border: 1px solid
      color-mix(in srgb, var(--elemental-color) 30%, transparent);
    border-radius: 12px;
    animation: fadeSlideIn 200ms ease;
  }

  @keyframes fadeSlideIn {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .details-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;
  }

  .details-glyph {
    width: 48px;
    height: 32px;
    object-fit: contain;
    filter: brightness(0) invert(1) drop-shadow(0 0 4px var(--elemental-color));
  }

  .details-title {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .details-name {
    font-size: 15px;
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
  }

  .details-elemental {
    font-size: 12px;
    font-weight: 500;
    color: var(--elemental-color);
  }

  .details-description {
    margin: 0;
    font-size: 13px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
    line-height: 1.5;
  }

  .select-hint {
    margin: 0;
    padding: 12px;
    text-align: center;
    font-size: 12px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.4));
    background: rgba(255, 255, 255, 0.02);
    border-radius: 8px;
  }

  /* ========================================
     FOCUS STATES
     ======================================== */
  .mode-card:focus-visible {
    outline: 2px solid var(--elemental-color);
    outline-offset: 2px;
  }

  /* ========================================
     RESPONSIVE
     ======================================== */
  @media (max-width: 320px) {
    .modes-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  /* ========================================
     REDUCED MOTION
     ======================================== */
  @media (prefers-reduced-motion: reduce) {
    .mode-card,
    .mode-glyph,
    .mode-glyph img,
    .mode-details {
      animation: none;
      transition: none;
    }
  }
</style>
