<!--
  PropTypeTab.svelte - Prop Type Selection

  Inline grid selection - no modals, direct manipulation.
  Tap any prop to select it instantly.
-->
<script lang="ts">
  import type { AppSettings } from "../../domain/AppSettings";
  import { resolve } from "../../../inversify/di";
  import { TYPES } from "../../../inversify/types";
  import { PropType } from "../../../pictograph/prop/domain/enums/PropType";
  import type { IHapticFeedbackService } from "../../../application/services/contracts/IHapticFeedbackService";
  import { onMount } from "svelte";
  import {
    getAllPropTypes,
    VARIANT_PROP_TYPES,
    hasVariations,
    getNextVariation,
    getBasePropType,
    getVariationLabel,
    getAllVariations,
    getVariationIndex,
  } from "./prop-type/PropTypeRegistry";
  import CatDogToggle from "./prop-type/CatDogToggle.svelte";
  import PropTypeButton from "./prop-type/PropTypeButton.svelte";

  // Entry animation
  let isVisible = $state(false);

  let { settings, onUpdate } = $props<{
    settings: AppSettings;
    onUpdate?: (event: { key: string; value: unknown }) => void;
  }>();

  // Services
  let hapticService: IHapticFeedbackService;

  onMount(async () => {
    hapticService = await resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );

    // Entry animation
    setTimeout(() => (isVisible = true), 30);
  });

  // Get all available prop types (filter out variants - they're accessible via variation toggle)
  const propTypes = getAllPropTypes().filter(
    (pt) => !VARIANT_PROP_TYPES.includes(pt)
  );

  // Current selections
  let selectedBluePropType = $state(
    settings.bluePropType || settings.propType || PropType.STAFF
  );
  let selectedRedPropType = $state(
    settings.redPropType || settings.propType || PropType.STAFF
  );

  // CatDog Mode
  let catDogMode = $state(settings.catDogMode ?? false);

  // Remember the red prop when CatDog mode is turned off
  let rememberedRedProp = $state<PropType | null>(null);

  // Active hand selection for CatDog mode (simple tab switcher)
  let activeHand = $state<"blue" | "red">("blue");

  // Watch for settings changes from external sources (Firebase sync, etc.)
  $effect(() => {
    const newBlueProp =
      settings.bluePropType || settings.propType || PropType.STAFF;
    const newRedProp =
      settings.redPropType || settings.propType || PropType.STAFF;
    const newCatDogMode = settings.catDogMode ?? false;

    if (newBlueProp !== selectedBluePropType) {
      selectedBluePropType = newBlueProp;
    }
    if (newRedProp !== selectedRedPropType) {
      selectedRedPropType = newRedProp;
    }
    if (newCatDogMode !== catDogMode) {
      catDogMode = newCatDogMode;
    }

    // Ensure both props match when CatDog mode is off
    if (!catDogMode && selectedBluePropType !== selectedRedPropType) {
      selectedRedPropType = selectedBluePropType;
    }
  });

  // Track image dimensions for rotation
  let imageDimensions = $state(
    new Map<PropType, { width: number; height: number }>()
  );

  function toggleCatDogMode() {
    hapticService?.trigger("selection");
    const newCatDogMode = !catDogMode;

    if (newCatDogMode) {
      if (rememberedRedProp !== null) {
        selectedRedPropType = rememberedRedProp;
        onUpdate?.({ key: "redPropType", value: rememberedRedProp });
        rememberedRedProp = null;
      }
      activeHand = "blue"; // Reset to blue when enabling
    } else {
      if (selectedRedPropType !== selectedBluePropType) {
        rememberedRedProp = selectedRedPropType;
      }
      selectedRedPropType = selectedBluePropType;
      onUpdate?.({ key: "redPropType", value: selectedBluePropType });
    }

    catDogMode = newCatDogMode;
    onUpdate?.({ key: "catDogMode", value: catDogMode });
  }

  function switchHand(hand: "blue" | "red") {
    hapticService?.trigger("selection");
    activeHand = hand;
  }

  function handlePropTypeSelect(propType: PropType, hand?: "blue" | "red") {
    hapticService?.trigger("selection");

    if (!catDogMode || !hand) {
      // Not in CatDog mode - update both
      selectedBluePropType = propType;
      selectedRedPropType = propType;
      onUpdate?.({ key: "bluePropType", value: propType });
      onUpdate?.({ key: "redPropType", value: propType });
    } else if (hand === "blue") {
      selectedBluePropType = propType;
      onUpdate?.({ key: "bluePropType", value: propType });
    } else if (hand === "red") {
      selectedRedPropType = propType;
      onUpdate?.({ key: "redPropType", value: propType });
    }
  }

  function handleImageLoad(propType: PropType, width: number, height: number) {
    imageDimensions.set(propType, { width, height });
    imageDimensions = new Map(imageDimensions);
  }

  function shouldRotate(propType: PropType): boolean {
    const dimensions = imageDimensions.get(propType);
    if (!dimensions) return false;
    const imageAspectRatio = dimensions.width / dimensions.height;
    return imageAspectRatio > 1.5;
  }

  // Variation helpers
  function toggleVariation(hand: "blue" | "red") {
    hapticService?.trigger("selection");
    const currentProp =
      hand === "blue" ? selectedBluePropType : selectedRedPropType;

    if (!hasVariations(currentProp)) return;

    const newProp = getNextVariation(currentProp);
    if (!newProp) return;

    if (hand === "blue") {
      selectedBluePropType = newProp;
      onUpdate?.({ key: "bluePropType", value: newProp });
      if (!catDogMode) {
        selectedRedPropType = newProp;
        onUpdate?.({ key: "redPropType", value: newProp });
      }
    } else {
      selectedRedPropType = newProp;
      onUpdate?.({ key: "redPropType", value: newProp });
    }
  }

  // Derived: Check if current selection has variations
  const blueHasVariations = $derived(hasVariations(selectedBluePropType));
  const redHasVariations = $derived(hasVariations(selectedRedPropType));
  const blueVariationLabel = $derived(getVariationLabel(selectedBluePropType));
  const redVariationLabel = $derived(getVariationLabel(selectedRedPropType));
  const blueVariations = $derived(getAllVariations(selectedBluePropType));
  const redVariations = $derived(getAllVariations(selectedRedPropType));
  const blueVariationIndex = $derived(getVariationIndex(selectedBluePropType));
  const redVariationIndex = $derived(getVariationIndex(selectedRedPropType));
</script>

<div class="prop-type-tab" class:visible={isVisible}>
  <section class="settings-panel">
    <header class="panel-header">
      <span class="panel-icon"><i class="fas fa-wand-sparkles"></i></span>
      <div class="panel-header-text">
        <h3 class="panel-title">Prop Type</h3>
        <p class="panel-subtitle">Tap to select your flow props</p>
      </div>
    </header>

    <!-- Mode Toggle -->
    <div class="mode-section">
      <CatDogToggle {catDogMode} onToggle={toggleCatDogMode} />
      <p class="mode-hint">
        {catDogMode
          ? "Different props for each hand"
          : "Same prop for both hands"}
      </p>
    </div>

    <!-- Hand Tabs (only in CatDog mode) -->
    {#if catDogMode}
      <div class="hand-tabs">
        <button
          class="hand-tab"
          class:active={activeHand === "blue"}
          onclick={() => switchHand("blue")}
        >
          <span class="tab-dot blue"></span>
          <span>Left Hand</span>
        </button>
        <button
          class="hand-tab"
          class:active={activeHand === "red"}
          onclick={() => switchHand("red")}
        >
          <span class="tab-dot red"></span>
          <span>Right Hand</span>
        </button>
      </div>
    {/if}

    <!-- Single Prop Grid (works for both modes) -->
    <div class="prop-grid-section">
      <div class="prop-grid">
        {#each propTypes as propType}
          {@const currentSelection = catDogMode
            ? (activeHand === "blue" ? selectedBluePropType : selectedRedPropType)
            : selectedBluePropType}
          {@const isSelected = getBasePropType(currentSelection) === propType}
          <PropTypeButton
            {propType}
            selected={isSelected}
            shouldRotate={shouldRotate(propType)}
            color={catDogMode ? activeHand : "blue"}
            onSelect={() => handlePropTypeSelect(propType, catDogMode ? activeHand : undefined)}
            onImageLoad={handleImageLoad}
          />
        {/each}
      </div>

      <!-- Variation toggle -->
      {#if catDogMode && activeHand === "blue" && blueHasVariations}
        <button class="variation-toggle" onclick={() => toggleVariation("blue")}>
          <span class="variation-indicator">
            {#each blueVariations as _, i}
              <span class="variation-dot" class:active={i === blueVariationIndex}></span>
            {/each}
          </span>
          <span class="variation-text">{blueVariationLabel}</span>
          <i class="fas fa-sync-alt"></i>
        </button>
      {:else if catDogMode && activeHand === "red" && redHasVariations}
        <button class="variation-toggle" onclick={() => toggleVariation("red")}>
          <span class="variation-indicator">
            {#each redVariations as _, i}
              <span class="variation-dot" class:active={i === redVariationIndex}></span>
            {/each}
          </span>
          <span class="variation-text">{redVariationLabel}</span>
          <i class="fas fa-sync-alt"></i>
        </button>
      {:else if !catDogMode && blueHasVariations}
        <button class="variation-toggle" onclick={() => toggleVariation("blue")}>
          <span class="variation-indicator">
            {#each blueVariations as _, i}
              <span class="variation-dot" class:active={i === blueVariationIndex}></span>
            {/each}
          </span>
          <span class="variation-text">{blueVariationLabel}</span>
          <i class="fas fa-sync-alt"></i>
        </button>
      {/if}
    </div>
  </section>
</div>

<style>
  /* ═══════════════════════════════════════════════════════════════════════════
     PROP TYPE TAB - Inline Grid Selection
     Direct manipulation, no modals
     ═══════════════════════════════════════════════════════════════════════════ */
  .prop-type-tab {
    container-type: inline-size;
    container-name: prop-type-tab;

    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 900px;
    margin: 0 auto;
    padding: clamp(16px, 3cqi, 24px);
    gap: clamp(14px, 2cqi, 20px);
    overflow-y: auto;
    overflow-x: hidden;

    opacity: 0;
    transition: opacity 200ms ease;
  }

  .prop-type-tab.visible {
    opacity: 1;
  }

  /* ========================================
     SETTINGS PANEL - Dark Glass Style
     ======================================== */
  .settings-panel {
    display: flex;
    flex-direction: column;
    gap: clamp(14px, 2cqi, 20px);
    padding: clamp(16px, 3cqi, 24px);
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    transition: border-color 0.2s ease;
  }

  .settings-panel:hover {
    border-color: rgba(255, 255, 255, 0.15);
  }

  /* ========================================
     PANEL HEADER
     ======================================== */
  .panel-header {
    display: flex;
    align-items: center;
    gap: 14px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .panel-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    font-size: 18px;
    flex-shrink: 0;
    background: color-mix(
      in srgb,
      var(--theme-accent, #a855f7) 20%,
      transparent
    );
    border: 1px solid
      color-mix(in srgb, var(--theme-accent, #a855f7) 35%, transparent);
    color: var(--theme-accent, #a855f7);
    box-shadow: 0 0 12px
      color-mix(in srgb, var(--theme-accent, #a855f7) 20%, transparent);
    transition: all 0.15s ease;
  }

  .settings-panel:hover .panel-icon {
    box-shadow: 0 0 16px
      color-mix(in srgb, var(--theme-accent, #a855f7) 30%, transparent);
  }

  .panel-header-text {
    flex: 1;
    min-width: 0;
  }

  .panel-title {
    font-size: 17px;
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui,
      sans-serif;
  }

  .panel-subtitle {
    font-size: 13px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    margin: 3px 0 0 0;
  }

  /* ========================================
     MODE SECTION (CatDog Toggle)
     ======================================== */
  .mode-section {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  .mode-hint {
    margin: 0;
    font-size: 13px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    font-style: italic;
  }

  /* ========================================
     PROP GRID - Inline Selection with Container Queries
     ======================================== */
  .prop-grid-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .prop-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: clamp(8px, 2cqi, 12px);
  }

  .prop-grid.compact {
    grid-template-columns: repeat(3, 1fr);
    gap: clamp(6px, 1.5cqi, 10px);
  }

  /* Responsive: 3 columns on smaller containers */
  @container prop-type-tab (max-width: 600px) {
    .prop-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  /* Very small: 2 columns */
  @container prop-type-tab (max-width: 400px) {
    .prop-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .prop-grid.compact {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  /* ========================================
     VARIATION TOGGLE
     ======================================== */
  .variation-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 40px;
    padding: 10px 16px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.06));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.12));
    border-radius: 10px;
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.36, 0.66, 0.04, 1);
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui,
      sans-serif;
    flex-shrink: 0;
  }

  .variation-toggle.compact {
    padding: 8px 12px;
    min-height: 36px;
    font-size: 12px;
    gap: 6px;
  }

  .variation-toggle:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.1));
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.2));
  }

  .variation-toggle:active {
    transform: scale(0.97);
  }

  .variation-toggle:focus-visible {
    outline: 2px solid
      color-mix(in srgb, var(--theme-accent, #6366f1) 50%, transparent);
    outline-offset: 2px;
  }

  .variation-indicator {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .variation-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--theme-text-dim, rgba(255, 255, 255, 0.25));
    transition: all 0.2s ease;
  }

  .variation-dot.active {
    background: var(--theme-accent, rgba(99, 102, 241, 0.9));
    box-shadow: 0 0 6px
      color-mix(in srgb, var(--theme-accent, #6366f1) 50%, transparent);
  }

  .variation-text {
    white-space: nowrap;
  }

  .variation-toggle i {
    font-size: 12px;
    opacity: 0.7;
  }

  /* ========================================
     HAND TABS (CatDog Mode)
     ======================================== */
  .hand-tabs {
    display: flex;
    gap: 8px;
    padding: 4px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
  }

  .hand-tab {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 16px;
    border: none;
    border-radius: 10px;
    background: transparent;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .hand-tab:hover {
    background: rgba(255, 255, 255, 0.05);
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
  }

  .hand-tab.active {
    background: rgba(255, 255, 255, 0.1);
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
  }

  .tab-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .tab-dot.blue {
    background: var(--prop-blue, #2e3192);
    box-shadow: 0 0 6px color-mix(in srgb, var(--prop-blue, #2e3192) 50%, transparent);
  }

  .tab-dot.red {
    background: var(--prop-red, #ed1c24);
    box-shadow: 0 0 6px color-mix(in srgb, var(--prop-red, #ed1c24) 50%, transparent);
  }

  .hand-tab.active .tab-dot.blue {
    box-shadow: 0 0 10px color-mix(in srgb, var(--prop-blue, #2e3192) 70%, transparent);
  }

  .hand-tab.active .tab-dot.red {
    box-shadow: 0 0 10px color-mix(in srgb, var(--prop-red, #ed1c24) 70%, transparent);
  }

  /* ========================================
     ACCESSIBILITY
     ======================================== */
  @media (prefers-reduced-motion: reduce) {
    .prop-type-tab,
    .settings-panel,
    .panel-icon,
    .variation-toggle {
      transition: none;
    }
  }

  @media (prefers-contrast: high) {
    .settings-panel {
      border-width: 2px;
    }

    .hand-section {
      border-width: 2px;
    }
  }
</style>
