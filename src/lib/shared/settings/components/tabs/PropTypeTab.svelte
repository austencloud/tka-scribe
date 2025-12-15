<!--
  PropTypeTab.svelte - Prop Type Selection

  Clean button-based interface with bottom sheet prop picker.
-->
<script lang="ts">
  import type { AppSettings } from "../../domain/AppSettings";
  import { resolve } from "../../../inversify/di";
  import { TYPES } from "../../../inversify/types";
  import { PropType } from "../../../pictograph/prop/domain/enums/PropType";
  import type { IHapticFeedbackService } from "../../../application/services/contracts/IHapticFeedbackService";
  import { onMount } from "svelte";
  import {
    getPropTypeDisplayInfo,
    hasVariations,
    getNextVariation,
  } from "./prop-type/PropTypeRegistry";
  import CatDogToggle from "./prop-type/CatDogToggle.svelte";
  import PropSelectionSheet from "./prop-type/PropSelectionSheet.svelte";

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
    setTimeout(() => (isVisible = true), 30);
  });

  // Current selections
  let selectedBluePropType = $state(
    settings.bluePropType || settings.propType || PropType.STAFF
  );
  let selectedRedPropType = $state(
    settings.redPropType || settings.propType || PropType.STAFF
  );

  // CatDog Mode
  let catDogMode = $state(settings.catDogMode ?? false);
  let rememberedRedProp = $state<PropType | null>(null);

  // Sheet state
  let isSheetOpen = $state(false);
  let selectingHand = $state<"blue" | "red">("blue");

  // Watch for settings changes
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

    if (!catDogMode && selectedBluePropType !== selectedRedPropType) {
      selectedRedPropType = selectedBluePropType;
    }
  });

  function toggleCatDogMode() {
    hapticService?.trigger("selection");
    const newCatDogMode = !catDogMode;

    if (newCatDogMode) {
      if (rememberedRedProp !== null) {
        selectedRedPropType = rememberedRedProp;
        onUpdate?.({ key: "redPropType", value: rememberedRedProp });
        rememberedRedProp = null;
      }
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

  function handleChangeProp() {
    hapticService?.trigger("selection");
    selectingHand = "blue";
    isSheetOpen = true;
  }

  function handlePropSelect(propType: PropType) {
    if (selectingHand === "blue") {
      selectedBluePropType = propType;
      onUpdate?.({ key: "bluePropType", value: propType });
      if (!catDogMode) {
        selectedRedPropType = propType;
        onUpdate?.({ key: "redPropType", value: propType });
      }
      // In cat-dog mode, user clicks the red card directly to select red prop
      // No need for sequential selection flow
    } else {
      selectedRedPropType = propType;
      onUpdate?.({ key: "redPropType", value: propType });
    }
  }

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

  // Display info
  const blueInfo = $derived(getPropTypeDisplayInfo(selectedBluePropType));
  const redInfo = $derived(getPropTypeDisplayInfo(selectedRedPropType));
  const blueHasVariations = $derived(hasVariations(selectedBluePropType));
  const redHasVariations = $derived(hasVariations(selectedRedPropType));
</script>

<div class="prop-type-tab" class:visible={isVisible}>
  <section class="settings-panel">
    <header class="panel-header">
      <span class="panel-icon"><i class="fas fa-wand-sparkles"></i></span>
      <div class="panel-header-text">
        <h3 class="panel-title">Prop Type</h3>
        <p class="panel-subtitle">Choose your flow props</p>
      </div>
    </header>

    <!-- Cat Dog Toggle -->
    <div class="mode-section">
      <CatDogToggle {catDogMode} onToggle={toggleCatDogMode} />
      <p class="mode-hint">
        {catDogMode ? "Different props per hand" : "Same prop both hands"}
      </p>
    </div>

    <!-- Current Selection Display -->
    {#if catDogMode}
      <!-- Two prop display -->
      <div class="prop-display dual">
        <button
          class="prop-card blue"
          onclick={() => {
            hapticService?.trigger("selection");
            selectingHand = "blue";
            isSheetOpen = true;
          }}
        >
          <span class="hand-label">
            <span class="hand-dot blue"></span>
            Left
          </span>
          <img src={blueInfo.image} alt={blueInfo.label} class="prop-icon" />
          <span class="prop-name">{blueInfo.label}</span>
          {#if blueHasVariations}
            <span
              class="mini-variation-btn"
              onclick={(e) => {
                e.stopPropagation();
                toggleVariation("blue");
              }}
              onkeydown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleVariation("blue");
                }
              }}
              role="button"
              tabindex="0"
              aria-label="Toggle variation"
            >
              <i class="fas fa-sync-alt"></i>
            </span>
          {/if}
        </button>
        <button
          class="prop-card red"
          onclick={() => {
            hapticService?.trigger("selection");
            selectingHand = "red";
            isSheetOpen = true;
          }}
        >
          <span class="hand-label">
            <span class="hand-dot red"></span>
            Right
          </span>
          <img src={redInfo.image} alt={redInfo.label} class="prop-icon" />
          <span class="prop-name">{redInfo.label}</span>
          {#if redHasVariations}
            <span
              class="mini-variation-btn"
              onclick={(e) => {
                e.stopPropagation();
                toggleVariation("red");
              }}
              onkeydown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleVariation("red");
                }
              }}
              role="button"
              tabindex="0"
              aria-label="Toggle variation"
            >
              <i class="fas fa-sync-alt"></i>
            </span>
          {/if}
        </button>
      </div>
    {:else}
      <!-- Single prop display -->
      <div class="prop-display single">
        <button class="prop-card" onclick={handleChangeProp}>
          <img src={blueInfo.image} alt={blueInfo.label} class="prop-icon" />
          <span class="prop-name">{blueInfo.label}</span>
          {#if blueHasVariations}
            <span
              class="mini-variation-btn"
              onclick={(e) => {
                e.stopPropagation();
                toggleVariation("blue");
              }}
              onkeydown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleVariation("blue");
                }
              }}
              role="button"
              tabindex="0"
              aria-label="Toggle variation"
            >
              <i class="fas fa-sync-alt"></i>
            </span>
          {/if}
        </button>
      </div>
    {/if}
  </section>
</div>

<!-- Prop Selection Sheet -->
<PropSelectionSheet
  bind:isOpen={isSheetOpen}
  selectedPropType={selectingHand === "blue"
    ? selectedBluePropType
    : selectedRedPropType}
  color={selectingHand}
  title={selectingHand === "blue" ? "Select Left Hand Prop" : "Select Right Hand Prop"}
  onSelect={handlePropSelect}
/>

<style>
  .prop-type-tab {
    container-type: size;
    container-name: prop-type-tab;
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: clamp(8px, 2cqi, 16px);
    gap: clamp(10px, 1.5cqi, 14px);
    height: 100%;
    opacity: 0;
    transition: opacity 200ms ease;
  }

  .prop-type-tab.visible {
    opacity: 1;
  }

  .settings-panel {
    display: flex;
    flex-direction: column;
    gap: clamp(16px, 2cqi, 20px);
    padding: clamp(16px, 2.5cqi, 24px);
    background: var(--theme-card-bg);
    backdrop-filter: blur(12px);
    border: 1px solid var(--theme-stroke);
    border-radius: 20px;
  }

  /* Panel Header */
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
    background: color-mix(in srgb, var(--theme-accent, #a855f7) 20%, transparent);
    border: 1px solid color-mix(in srgb, var(--theme-accent, #a855f7) 35%, transparent);
    color: var(--theme-accent, #a855f7);
  }

  .panel-header-text {
    flex: 1;
  }

  .panel-title {
    font-size: 17px;
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
    margin: 0;
  }

  .panel-subtitle {
    font-size: 13px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    margin: 3px 0 0 0;
  }

  /* Mode Section */
  .mode-section {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .mode-hint {
    margin: 0;
    font-size: 13px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    font-style: italic;
  }

  /* Prop Display */
  .prop-display {
    display: flex;
    gap: 12px;
  }

  .prop-display.single {
    justify-content: center;
  }

  .prop-card {
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 20px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 16px;
    min-height: 140px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .prop-card:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.08));
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.2));
    transform: translateY(-2px);
  }

  .prop-card:active {
    transform: translateY(0) scale(0.98);
  }

  .prop-card.blue {
    border-color: color-mix(in srgb, var(--prop-blue, #2e3192) 30%, transparent);
    background: color-mix(in srgb, var(--prop-blue, #2e3192) 8%, transparent);
  }

  .prop-card.blue:hover {
    border-color: color-mix(in srgb, var(--prop-blue, #2e3192) 50%, transparent);
    background: color-mix(in srgb, var(--prop-blue, #2e3192) 15%, transparent);
  }

  .prop-card.red {
    border-color: color-mix(in srgb, var(--prop-red, #ed1c24) 30%, transparent);
    background: color-mix(in srgb, var(--prop-red, #ed1c24) 8%, transparent);
  }

  .prop-card.red:hover {
    border-color: color-mix(in srgb, var(--prop-red, #ed1c24) 50%, transparent);
    background: color-mix(in srgb, var(--prop-red, #ed1c24) 15%, transparent);
  }

  .hand-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 600;
    color: var(--theme-text-dim);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .hand-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .hand-dot.blue {
    background: var(--prop-blue, #2e3192);
  }

  .hand-dot.red {
    background: var(--prop-red, #ed1c24);
  }

  .prop-icon {
    width: clamp(90px, 20cqw, 160px);
    height: clamp(90px, 20cqw, 160px);
    object-fit: contain;
    filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
  }

  /* Color-code prop icons based on hand */
  .prop-card.blue .prop-icon {
    filter:
      drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3))
      saturate(1.1);
  }

  .prop-card.red .prop-icon {
    filter:
      drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3))
      hue-rotate(125deg) saturate(1.2);
  }

  .prop-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--theme-text);
  }

  .mini-variation-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--theme-card-bg);
    border: 1px solid var(--theme-stroke);
    border-radius: 8px;
    color: var(--theme-text-dim);
    cursor: pointer;
    font-size: 11px;
    transition: all 0.2s ease;
  }

  .mini-variation-btn:hover {
    background: var(--theme-card-hover-bg);
    border-color: var(--theme-stroke-strong);
    color: var(--theme-accent);
  }
</style>
