<!-- PropTypeTab.svelte - Prop type selection with responsive full-screen picker -->
<script lang="ts">
  import type { AppSettings } from "../../domain/AppSettings";
  import { resolve } from "../../../inversify";
  import { TYPES } from "../../../inversify/types";
  import { PropType } from "../../../pictograph/prop/domain/enums/PropType";
  import type { IHapticFeedbackService } from "../../../application/services/contracts/IHapticFeedbackService";
  import { onMount } from "svelte";
  import {
    PropTypeButton,
    getAllPropTypes,
    getPropTypeDisplayInfo,
  } from "./prop-type";
  import type { IDeviceDetector } from "../../../device/services/contracts/IDeviceDetector";
  import { MotionColor } from "../../../pictograph/shared/domain/enums/pictograph-enums";

  let { settings, onUpdate } = $props<{
    settings: AppSettings;
    onUpdate?: (event: { key: string; value: unknown }) => void;
  }>();

  // Services
  let hapticService: IHapticFeedbackService;
  let deviceDetector: IDeviceDetector | null = null;

  onMount(async () => {
    hapticService = await resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
    deviceDetector = resolve<IDeviceDetector>(TYPES.IDeviceDetector);
  });

  // Get all available prop types (filter out TRIQUETRA2 - it's a variation)
  const propTypes = getAllPropTypes().filter(
    (pt) => pt !== PropType.TRIQUETRA2
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

  // Full-screen picker state
  let showPicker = $state(false);

  // Watch for settings changes
  $effect(() => {
    const newCatDogMode = settings.catDogMode ?? false;
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
      // Turning CatDog mode ON - restore previous red prop if we have one
      if (rememberedRedProp !== null) {
        selectedRedPropType = rememberedRedProp;
        onUpdate?.({ key: "redPropType", value: rememberedRedProp });
        rememberedRedProp = null; // Clear the memory after restoring
      }
    } else {
      // Turning CatDog mode OFF - remember current red prop, then sync to blue
      if (selectedRedPropType !== selectedBluePropType) {
        rememberedRedProp = selectedRedPropType;
      }
      selectedRedPropType = selectedBluePropType;
      onUpdate?.({ key: "redPropType", value: selectedBluePropType });
    }

    catDogMode = newCatDogMode;
    onUpdate?.({ key: "catDogMode", value: catDogMode });
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

  function openPicker(hand?: "blue" | "red") {
    hapticService?.trigger("selection");
    showPicker = true;
    // Store which hand is being selected if in CatDog mode
    if (catDogMode && hand) {
      currentHand = hand;
    } else {
      currentHand = null;
    }
  }

  function closePicker() {
    showPicker = false;
    currentHand = null;
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

  // Track which hand is being selected in CatDog mode
  let currentHand = $state<"blue" | "red" | null>(null);

  // Determine if device is mobile
  let isMobile = $state(false);

  // SVG content for selection cards
  let blueSvgContent = $state("");
  let redSvgContent = $state("");
  let blueViewBox = $state("0 0 100 100");
  let redViewBox = $state("0 0 100 100");

  onMount(() => {
    const checkMobile = () => {
      isMobile = window.innerWidth < 768;
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  });

  // Load SVGs for selection cards
  $effect(() => {
    loadSelectionCardSvgs();
  });

  async function loadSelectionCardSvgs() {
    // When CatDog mode is off, both colors show the same prop type
    const blueProp = selectedBluePropType;
    const redProp = catDogMode ? selectedRedPropType : selectedBluePropType;

    await loadPropSvg(blueProp, MotionColor.BLUE);
    await loadPropSvg(redProp, MotionColor.RED);
  }

  async function loadPropSvg(propType: PropType, color: MotionColor) {
    try {
      const displayInfo = getPropTypeDisplayInfo(propType);
      const response = await fetch(displayInfo.image);
      if (!response.ok) return;

      let svgText = await response.text();
      svgText = applyColorToSvg(svgText, color);

      const parser = new DOMParser();
      const doc = parser.parseFromString(svgText, "image/svg+xml");
      const svgElement = doc.querySelector("svg");

      if (svgElement) {
        const viewBoxAttr = svgElement.getAttribute("viewBox") || "0 0 100 100";
        const content = svgElement.innerHTML;

        if (color === MotionColor.BLUE) {
          blueSvgContent = content;
          blueViewBox = viewBoxAttr;
        } else {
          redSvgContent = content;
          redViewBox = viewBoxAttr;
        }
      }
    } catch (error) {
      console.error("Failed to load prop SVG:", error);
    }
  }

  function applyColorToSvg(svgText: string, motionColor: MotionColor): string {
    const colorMap: Record<MotionColor, string> = {
      [MotionColor.BLUE]: "#2E3192",
      [MotionColor.RED]: "#ED1C24",
    };

    const targetColor = colorMap[motionColor] || colorMap[MotionColor.BLUE];
    const ACCENT_COLORS_TO_PRESERVE = ["#c9ac68"];

    let coloredSvg = svgText.replace(
      /fill="(#[0-9A-Fa-f]{3,6})"/gi,
      (match, capturedColor) => {
        const colorLower = capturedColor.toLowerCase();
        if (
          ACCENT_COLORS_TO_PRESERVE.some(
            (accent) => accent.toLowerCase() === colorLower
          )
        ) {
          return match;
        }
        return `fill="${targetColor}"`;
      }
    );

    coloredSvg = coloredSvg.replace(
      /fill:\s*(#[0-9A-Fa-f]{3,6})/gi,
      (match, capturedColor) => {
        const colorLower = capturedColor.toLowerCase();
        if (
          ACCENT_COLORS_TO_PRESERVE.some(
            (accent) => accent.toLowerCase() === colorLower
          )
        ) {
          return match;
        }
        return `fill:${targetColor}`;
      }
    );

    coloredSvg = coloredSvg.replace(
      /stroke="(#[0-9A-Fa-f]{3,6})"/gi,
      (match, capturedColor) => {
        const colorLower = capturedColor.toLowerCase();
        if (
          ACCENT_COLORS_TO_PRESERVE.some(
            (accent) => accent.toLowerCase() === colorLower
          )
        ) {
          return match;
        }
        return `stroke="${targetColor}"`;
      }
    );

    coloredSvg = coloredSvg.replace(
      /stroke:\s*(#[0-9A-Fa-f]{3,6})/gi,
      (match, capturedColor) => {
        const colorLower = capturedColor.toLowerCase();
        if (
          ACCENT_COLORS_TO_PRESERVE.some(
            (accent) => accent.toLowerCase() === colorLower
          )
        ) {
          return match;
        }
        return `stroke:${targetColor}`;
      }
    );

    const colorSuffix = motionColor.toLowerCase();
    coloredSvg = coloredSvg.replace(/\.st(\d+)/g, `.st$1-${colorSuffix}`);
    coloredSvg = coloredSvg.replace(
      /class="st(\d+)"/g,
      `class="st$1-${colorSuffix}"`
    );

    coloredSvg = coloredSvg.replace(
      /<circle[^>]*id="centerPoint"[^>]*\/?>/,
      ""
    );

    return coloredSvg;
  }

  // Triquetra variation helpers
  function isTriquetra(propType: PropType): boolean {
    return (
      propType === PropType.TRIQUETRA || propType === PropType.TRIQUETRA2
    );
  }

  function toggleTriquetraVariation(hand: "blue" | "red") {
    hapticService?.trigger("selection");
    const currentProp =
      hand === "blue" ? selectedBluePropType : selectedRedPropType;

    if (!isTriquetra(currentProp)) return;

    const newProp =
      currentProp === PropType.TRIQUETRA
        ? PropType.TRIQUETRA2
        : PropType.TRIQUETRA;

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

  function getTriquetraVariation(propType: PropType): "1" | "2" {
    return propType === PropType.TRIQUETRA2 ? "2" : "1";
  }
</script>

<div class="prop-type-content">
  <!-- Minimal CatDog Toggle -->
  <div class="catdog-toggle-minimal">
    <span class="toggle-label-text"
      >Cat Dog Mode <span class="toggle-subtitle">(Different props per hand)</span
      ></span
    >
    <button
      class="ios-switch"
      class:active={catDogMode}
      onclick={toggleCatDogMode}
      role="switch"
      aria-checked={catDogMode}
      aria-label="Toggle CatDog Mode"
    >
      <span class="switch-thumb"></span>
    </button>
  </div>

  {#if isMobile}
    <!-- MOBILE: Current selection cards -->
    <div class="current-selections">
      {#if !catDogMode}
        <!-- Single selection card -->
        <button class="selection-card" onclick={() => openPicker()}>
          <div class="prop-preview-container">
            {#if blueSvgContent && redSvgContent}
              <svg
                class="prop-preview blue"
                viewBox={blueViewBox}
                preserveAspectRatio="xMidYMid meet"
              >
                {@html blueSvgContent}
              </svg>
              <svg
                class="prop-preview red"
                viewBox={redViewBox}
                preserveAspectRatio="xMidYMid meet"
              >
                {@html redSvgContent}
              </svg>
            {/if}
          </div>
          <div class="card-content">
            <span class="card-label">Current Prop</span>
            <span class="card-value"
              >{isTriquetra(selectedBluePropType)
                ? "Triquetra"
                : selectedBluePropType}</span
            >
            {#if isTriquetra(selectedBluePropType)}
              <button
                class="variation-toggle"
                onclick={(e) => {
                  e.stopPropagation();
                  toggleTriquetraVariation("blue");
                }}
              >
                Variation {getTriquetraVariation(selectedBluePropType)}
                <i class="fas fa-exchange-alt"></i>
              </button>
            {/if}
          </div>
          <i class="fas fa-chevron-right"></i>
        </button>
      {:else}
        <!-- Dual selection cards -->
        <button class="selection-card blue" onclick={() => openPicker("blue")}>
          <div class="prop-preview-container single">
            {#if blueSvgContent}
              <svg
                class="prop-preview blue"
                viewBox={blueViewBox}
                preserveAspectRatio="xMidYMid meet"
              >
                {@html blueSvgContent}
              </svg>
            {/if}
          </div>
          <div class="card-content">
            <div class="card-header">
              <span class="color-dot blue"></span>
              <span class="card-label">Blue (Left)</span>
            </div>
            <span class="card-value"
              >{isTriquetra(selectedBluePropType)
                ? "Triquetra"
                : selectedBluePropType}</span
            >
            {#if isTriquetra(selectedBluePropType)}
              <button
                class="variation-toggle"
                onclick={(e) => {
                  e.stopPropagation();
                  toggleTriquetraVariation("blue");
                }}
              >
                Variation {getTriquetraVariation(selectedBluePropType)}
                <i class="fas fa-exchange-alt"></i>
              </button>
            {/if}
          </div>
          <i class="fas fa-chevron-right"></i>
        </button>
        <button class="selection-card red" onclick={() => openPicker("red")}>
          <div class="prop-preview-container single">
            {#if redSvgContent}
              <svg
                class="prop-preview red"
                viewBox={redViewBox}
                preserveAspectRatio="xMidYMid meet"
              >
                {@html redSvgContent}
              </svg>
            {/if}
          </div>
          <div class="card-content">
            <div class="card-header">
              <span class="color-dot red"></span>
              <span class="card-label">Red (Right)</span>
            </div>
            <span class="card-value"
              >{isTriquetra(selectedRedPropType)
                ? "Triquetra"
                : selectedRedPropType}</span
            >
            {#if isTriquetra(selectedRedPropType)}
              <button
                class="variation-toggle"
                onclick={(e) => {
                  e.stopPropagation();
                  toggleTriquetraVariation("red");
                }}
              >
                Variation {getTriquetraVariation(selectedRedPropType)}
                <i class="fas fa-exchange-alt"></i>
              </button>
            {/if}
          </div>
          <i class="fas fa-chevron-right"></i>
        </button>
      {/if}
    </div>
  {:else}
    <!-- DESKTOP: Selection cards (same as mobile) -->
    <div class="current-selections">
      {#if !catDogMode}
        <!-- Single selection card -->
        <button class="selection-card" onclick={() => openPicker()}>
          <div class="prop-preview-container">
            {#if blueSvgContent && redSvgContent}
              <svg
                class="prop-preview blue"
                viewBox={blueViewBox}
                preserveAspectRatio="xMidYMid meet"
              >
                {@html blueSvgContent}
              </svg>
              <svg
                class="prop-preview red"
                viewBox={redViewBox}
                preserveAspectRatio="xMidYMid meet"
              >
                {@html redSvgContent}
              </svg>
            {/if}
          </div>
          <div class="card-content">
            <span class="card-label">Current Prop</span>
            <span class="card-value"
              >{isTriquetra(selectedBluePropType)
                ? "Triquetra"
                : selectedBluePropType}</span
            >
            {#if isTriquetra(selectedBluePropType)}
              <button
                class="variation-toggle"
                onclick={(e) => {
                  e.stopPropagation();
                  toggleTriquetraVariation("blue");
                }}
              >
                Variation {getTriquetraVariation(selectedBluePropType)}
                <i class="fas fa-exchange-alt"></i>
              </button>
            {/if}
          </div>
          <i class="fas fa-chevron-right"></i>
        </button>
      {:else}
        <!-- Dual selection cards -->
        <button class="selection-card blue" onclick={() => openPicker("blue")}>
          <div class="prop-preview-container single">
            {#if blueSvgContent}
              <svg
                class="prop-preview blue"
                viewBox={blueViewBox}
                preserveAspectRatio="xMidYMid meet"
              >
                {@html blueSvgContent}
              </svg>
            {/if}
          </div>
          <div class="card-content">
            <div class="card-header">
              <span class="color-dot blue"></span>
              <span class="card-label">Blue (Left)</span>
            </div>
            <span class="card-value"
              >{isTriquetra(selectedBluePropType)
                ? "Triquetra"
                : selectedBluePropType}</span
            >
            {#if isTriquetra(selectedBluePropType)}
              <button
                class="variation-toggle"
                onclick={(e) => {
                  e.stopPropagation();
                  toggleTriquetraVariation("blue");
                }}
              >
                Variation {getTriquetraVariation(selectedBluePropType)}
                <i class="fas fa-exchange-alt"></i>
              </button>
            {/if}
          </div>
          <i class="fas fa-chevron-right"></i>
        </button>
        <button class="selection-card red" onclick={() => openPicker("red")}>
          <div class="prop-preview-container single">
            {#if redSvgContent}
              <svg
                class="prop-preview red"
                viewBox={redViewBox}
                preserveAspectRatio="xMidYMid meet"
              >
                {@html redSvgContent}
              </svg>
            {/if}
          </div>
          <div class="card-content">
            <div class="card-header">
              <span class="color-dot red"></span>
              <span class="card-label">Red (Right)</span>
            </div>
            <span class="card-value"
              >{isTriquetra(selectedRedPropType)
                ? "Triquetra"
                : selectedRedPropType}</span
            >
            {#if isTriquetra(selectedRedPropType)}
              <button
                class="variation-toggle"
                onclick={(e) => {
                  e.stopPropagation();
                  toggleTriquetraVariation("red");
                }}
              >
                Variation {getTriquetraVariation(selectedRedPropType)}
                <i class="fas fa-exchange-alt"></i>
              </button>
            {/if}
          </div>
          <i class="fas fa-chevron-right"></i>
        </button>
      {/if}
    </div>
  {/if}
</div>

<!-- Full-screen picker modal -->
{#if showPicker}
  <div class="picker-overlay" onclick={closePicker}>
    <div class="picker-panel" onclick={(e) => e.stopPropagation()}>
      <!-- Header -->
      <div class="picker-header">
        <h2>
          {#if !catDogMode}
            Select Prop
          {:else if currentHand === "blue"}
            Select Blue Prop (Left Hand)
          {:else}
            Select Red Prop (Right Hand)
          {/if}
        </h2>
        <button class="close-button" onclick={closePicker}>
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Grid -->
      <div class="picker-grid">
        {#each propTypes as propType}
          {@const isTriquetraType = propType === PropType.TRIQUETRA}
          {@const blueMatches =
            selectedBluePropType === propType ||
            (isTriquetraType && isTriquetra(selectedBluePropType))}
          {@const redMatches =
            selectedRedPropType === propType ||
            (isTriquetraType && isTriquetra(selectedRedPropType))}
          <PropTypeButton
            {propType}
            selected={!catDogMode && (blueMatches || redMatches)}
            selectedBlue={catDogMode && currentHand === "blue" && blueMatches}
            selectedRed={catDogMode && currentHand === "red" && redMatches}
            shouldRotate={shouldRotate(propType)}
            color={currentHand || "blue"}
            onSelect={(pt) => {
              handlePropTypeSelect(pt, currentHand || undefined);
              closePicker();
            }}
            onImageLoad={handleImageLoad}
          />
        {/each}
      </div>
    </div>
  </div>
{/if}

<style>
  .prop-type-content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: clamp(16px, 2.5cqh, 24px);
    padding: clamp(16px, 2cqh, 24px) clamp(16px, 3cqw, 24px);
    overflow-y: auto;
  }

  /* Minimal iOS-style toggle */
  .catdog-toggle-minimal {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    background: rgba(255, 255, 255, 0.04);
    border: 0.33px solid rgba(255, 255, 255, 0.16);
    border-radius: 12px;
    flex-shrink: 0;
  }

  .toggle-label-text {
    font-size: 15px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui,
      sans-serif;
  }

  .toggle-subtitle {
    font-size: 13px;
    font-weight: 400;
    font-style: italic;
    color: rgba(255, 255, 255, 0.6);
  }

  /* iOS-style switch - 48px minimum touch target */
  .ios-switch {
    position: relative;
    width: 51px;
    height: 31px;
    background: rgba(120, 120, 128, 0.32);
    border: none;
    border-radius: 15.5px;
    cursor: pointer;
    transition: background-color 0.3s cubic-bezier(0.36, 0.66, 0.04, 1);
    /* Extend touch target with padding */
    padding: 8px 0;
  }

  .ios-switch.active {
    background: #34c759; /* iOS green */
  }

  .switch-thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 27px;
    height: 27px;
    background: white;
    border-radius: 50%;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15), 0 1px 1px rgba(0, 0, 0, 0.06);
    transition: transform 0.3s cubic-bezier(0.36, 0.66, 0.04, 1);
  }

  .ios-switch.active .switch-thumb {
    transform: translateX(20px);
  }

  /* Current selections (mobile) */
  .current-selections {
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex-shrink: 0;
  }

  .selection-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 20px 16px;
    background: rgba(255, 255, 255, 0.04);
    border: 0.33px solid rgba(255, 255, 255, 0.16);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.36, 0.66, 0.04, 1);
    color: white;
    text-align: center;
    position: relative;
    min-height: 280px;
  }

  .prop-preview-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    width: 100%;
    min-height: 100px;
    flex-shrink: 0;
  }

  .prop-preview-container.single {
    min-height: 80px;
  }

  .prop-preview {
    width: auto;
    height: 100%;
    max-height: 80px;
    max-width: 60px;
    opacity: 0.9;
  }

  .prop-preview-container.single .prop-preview {
    max-height: 70px;
    max-width: 70px;
  }

  .selection-card:active {
    transform: scale(0.98);
    background: rgba(255, 255, 255, 0.06);
  }

  .selection-card.blue {
    border-top: 3px solid #2e3192;
  }

  .selection-card.red {
    border-top: 3px solid #ed1c24;
  }

  .card-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
    align-items: center;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .color-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  .color-dot.blue {
    background: #2e3192;
  }

  .color-dot.red {
    background: #ed1c24;
  }

  .card-label {
    font-size: 13px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.6);
    letter-spacing: -0.08px;
  }

  .card-value {
    font-size: 17px;
    font-weight: 600;
    color: white;
    letter-spacing: -0.41px;
    text-transform: capitalize;
  }

  .variation-toggle {
    margin-top: 8px;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.1);
    border: 0.33px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.36, 0.66, 0.04, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 48px;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui,
      sans-serif;
  }

  .variation-toggle:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .variation-toggle:active {
    transform: scale(0.96);
  }

  .variation-toggle i {
    position: static;
    font-size: 11px;
    opacity: 0.8;
  }

  .variation-toggle.small {
    padding: 4px 8px;
    font-size: 11px;
    margin-top: 6px;
  }

  .selection-card > i {
    position: absolute;
    top: 16px;
    right: 16px;
    color: rgba(255, 255, 255, 0.3);
    font-size: 14px;
  }


  /* Full-screen picker overlay */
  .picker-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    z-index: 1000;
    display: flex;
    align-items: flex-end;
    animation: fade-in 0.2s ease-out;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .picker-panel {
    width: 100%;
    max-height: 85vh;
    background: #1a1a1a;
    border-radius: 16px 16px 0 0;
    display: flex;
    flex-direction: column;
    animation: slide-up 0.3s cubic-bezier(0.36, 0.66, 0.04, 1);
  }

  @keyframes slide-up {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }

  /* Desktop: Center the picker */
  @media (min-width: 768px) {
    .picker-overlay {
      align-items: center;
      justify-content: center;
      padding: 40px;
    }

    .picker-panel {
      max-width: 800px;
      max-height: 80vh;
      border-radius: 16px;
      animation: scale-in 0.3s cubic-bezier(0.36, 0.66, 0.04, 1);
    }

    @keyframes scale-in {
      from {
        transform: scale(0.9);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }
  }

  .picker-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    border-bottom: 0.33px solid rgba(255, 255, 255, 0.16);
    flex-shrink: 0;
  }

  .picker-header h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: white;
    letter-spacing: -0.45px;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui,
      sans-serif;
  }

  .close-button {
    min-width: 48px;
    min-height: 48px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 16px;
  }

  .close-button:active {
    transform: scale(0.95);
    background: rgba(255, 255, 255, 0.15);
  }

  .picker-grid {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 16px;
    align-content: start;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .picker-overlay,
    .picker-panel,
    .ios-switch,
    .switch-thumb,
    .selection-card {
      animation: none;
      transition: none;
    }
  }
</style>
