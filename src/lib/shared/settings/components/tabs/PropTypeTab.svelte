<!-- PropTypeTab.svelte - Prop type selection with responsive full-screen picker -->
<script lang="ts">
  import type { AppSettings } from "../../domain/AppSettings";
  import { resolve } from "../../../inversify";
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
    CatDogToggle,
    PropSelectionCard,
    PropTypePicker,
    loadPropSvg,
  } from "./prop-type";
  import { MotionColor } from "../../../pictograph/shared/domain/enums/pictograph-enums";

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
  });

  // Get all available prop types (filter out variants - they're accessible via variation toggle)
  const propTypes = getAllPropTypes().filter(
    (pt) => !VARIANT_PROP_TYPES.includes(pt)
  );

  // Current selections - use $derived to stay in sync with settings
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

  // Watch for settings changes from external sources (Firebase sync, etc.)
  $effect(() => {
    const newBlueProp =
      settings.bluePropType || settings.propType || PropType.STAFF;
    const newRedProp =
      settings.redPropType || settings.propType || PropType.STAFF;
    const newCatDogMode = settings.catDogMode ?? false;

    // Update local state if settings changed externally
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

  // SVG content for selection cards
  let blueSvgContent = $state("");
  let redSvgContent = $state("");
  let blueViewBox = $state("0 0 100 100");
  let redViewBox = $state("0 0 100 100");

  // Load SVGs for selection cards
  $effect(() => {
    loadSelectionCardSvgs();
  });

  async function loadSelectionCardSvgs() {
    // When CatDog mode is off, both colors show the same prop type
    const blueProp = selectedBluePropType;
    const redProp = catDogMode ? selectedRedPropType : selectedBluePropType;

    const blueResult = await loadPropSvg(blueProp, MotionColor.BLUE);
    if (blueResult) {
      blueSvgContent = blueResult.content;
      blueViewBox = blueResult.viewBox;
    }

    const redResult = await loadPropSvg(redProp, MotionColor.RED);
    if (redResult) {
      redSvgContent = redResult.content;
      redViewBox = redResult.viewBox;
    }
  }

  // Prop variation helpers (works for all props with variations: Triquetra, size variants, etc.)
  function togglePropVariation(hand: "blue" | "red") {
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
</script>

<div class="prop-type-content">
  <CatDogToggle {catDogMode} onToggle={toggleCatDogMode} />

  <div class="current-selections">
    {#if !catDogMode}
      <!-- Single selection card -->
      <PropSelectionCard
        propType={selectedBluePropType}
        svgContent={blueSvgContent}
        svgContentRed={redSvgContent}
        viewBox={blueViewBox}
        viewBoxRed={redViewBox}
        isSingleMode={true}
        onSelect={() => openPicker()}
        onToggleVariation={togglePropVariation}
      />
    {:else}
      <!-- Dual selection cards -->
      <PropSelectionCard
        propType={selectedBluePropType}
        svgContent={blueSvgContent}
        viewBox={blueViewBox}
        hand="blue"
        onSelect={() => openPicker("blue")}
        onToggleVariation={togglePropVariation}
      />
      <PropSelectionCard
        propType={selectedRedPropType}
        svgContent={redSvgContent}
        viewBox={redViewBox}
        hand="red"
        onSelect={() => openPicker("red")}
        onToggleVariation={togglePropVariation}
      />
    {/if}
  </div>
</div>

<PropTypePicker
  isOpen={showPicker}
  {catDogMode}
  {currentHand}
  {selectedBluePropType}
  {selectedRedPropType}
  {propTypes}
  onSelect={(pt, hand) => {
    handlePropTypeSelect(pt, hand);
    closePicker();
  }}
  onClose={closePicker}
  {shouldRotate}
  onImageLoad={handleImageLoad}
/>

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

  .current-selections {
    display: flex;
    flex-direction: column;
    gap: clamp(16px, 2cqh, 20px);
    flex-shrink: 0;
  }
</style>
