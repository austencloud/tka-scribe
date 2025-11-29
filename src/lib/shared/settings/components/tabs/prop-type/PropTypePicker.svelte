<!-- PropTypePicker.svelte - Full-screen modal picker for prop types -->
<script lang="ts">
  import { PropType } from "../../../../pictograph/prop/domain/enums/PropType";
  import { PropTypeButton, getBasePropType } from "./index";

  type HandColor = "blue" | "red";

  let {
    isOpen = false,
    catDogMode = false,
    currentHand = null as HandColor | null,
    selectedBluePropType,
    selectedRedPropType,
    propTypes,
    onSelect,
    onClose,
    shouldRotate,
    onImageLoad,
  }: {
    isOpen: boolean;
    catDogMode: boolean;
    currentHand: HandColor | null;
    selectedBluePropType: PropType;
    selectedRedPropType: PropType;
    propTypes: PropType[];
    onSelect: (propType: PropType, hand?: HandColor) => void;
    onClose: () => void;
    shouldRotate: (propType: PropType) => boolean;
    onImageLoad: (propType: PropType, width: number, height: number) => void;
  } = $props();

  function getTitle(): string {
    if (!catDogMode) return "Select Prop";
    if (currentHand === "blue") return "Select Blue Prop (Left Hand)";
    return "Select Red Prop (Right Hand)";
  }

  function handleSelect(propType: PropType) {
    onSelect(propType, currentHand || undefined);
    onClose();
  }
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="picker-overlay" role="presentation" onclick={onClose}>
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <div
      class="picker-panel"
      role="dialog"
      aria-modal="true"
      aria-label="Select prop type"
      tabindex="-1"
      onclick={(e) => e.stopPropagation()}
    >
      <!-- Header -->
      <div class="picker-header">
        <h2>{getTitle()}</h2>
        <button class="close-button" onclick={onClose} aria-label="Close picker">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Grid -->
      <div class="picker-grid">
        {#each propTypes as propType}
          {@const blueBase = getBasePropType(selectedBluePropType)}
          {@const redBase = getBasePropType(selectedRedPropType)}
          {@const blueMatches = blueBase === propType}
          {@const redMatches = redBase === propType}
          <PropTypeButton
            {propType}
            selected={!catDogMode && (blueMatches || redMatches)}
            selectedBlue={catDogMode && currentHand === "blue" && blueMatches}
            selectedRed={catDogMode && currentHand === "red" && redMatches}
            shouldRotate={shouldRotate(propType)}
            color={currentHand || "blue"}
            onSelect={handleSelect}
            {onImageLoad}
          />
        {/each}
      </div>
    </div>
  </div>
{/if}

<style>
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
    max-height: 90vh;
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

  @media (prefers-reduced-motion: reduce) {
    .picker-overlay,
    .picker-panel,
    .close-button {
      animation: none;
      transition: none;
    }
  }
</style>
