<script lang="ts">
  import type { PropType } from "$shared";
  import { getPropTypeDisplayInfo } from "./PropTypeRegistry";

  let {
    propType,
    selected = false,
    shouldRotate = false,
    onSelect,
    onImageLoad,
  } = $props<{
    propType: PropType;
    selected?: boolean;
    shouldRotate?: boolean;
    onSelect?: (propType: PropType) => void;
    onImageLoad?: (propType: PropType, width: number, height: number) => void;
  }>();

  const displayInfo = getPropTypeDisplayInfo(propType);

  function handleClick() {
    onSelect?.(propType);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect?.(propType);
    }
  }

  function handleImageLoad(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img.naturalWidth && img.naturalHeight) {
      onImageLoad?.(propType, img.naturalWidth, img.naturalHeight);
    }
  }
</script>

<button
  class="prop-button"
  class:selected
  onclick={handleClick}
  onkeydown={handleKeydown}
  aria-label={`Select ${displayInfo.label} prop type`}
  aria-pressed={selected}
  title={`${displayInfo.label} - Click to select this prop type`}
>
  <div class="prop-image-container">
    <img
      src={displayInfo.image}
      alt={displayInfo.label}
      class="prop-image"
      class:rotated={shouldRotate}
      loading="lazy"
      onload={handleImageLoad}
    />
  </div>
  <span class="prop-label">{displayInfo.label}</span>

  <!-- iOS checkmark indicator for selected prop -->
  {#if selected}
    <div class="ios-checkmark">
      <i class="fas fa-check"></i>
    </div>
  {/if}
</button>

<style>
  /* iOS-native prop button - Pixel Perfect */
  .prop-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    background: rgba(255, 255, 255, 0.04);
    border: 0.33px solid rgba(255, 255, 255, 0.16); /* iOS hairline border */
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.36, 0.66, 0.04, 1); /* iOS spring */
    color: rgba(255, 255, 255, 0.85);
    position: relative;
    padding: clamp(6px, 1.8cqi, 12px);
    gap: clamp(4px, 1cqi, 8px);
    border-radius: 12px; /* iOS medium corner radius */
    box-sizing: border-box;
    min-height: 0; /* Allow shrinking */
    overflow: hidden; /* Prevent image overflow */
    /* iOS precise shadow - matches Photos.app */
    box-shadow:
      0 3px 12px rgba(0, 0, 0, 0.12),
      0 1px 3px rgba(0, 0, 0, 0.08);
  }

  .prop-button:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.22);
    color: #ffffff;
    transform: translateY(-1px) scale(1.01); /* iOS subtle lift */
    box-shadow:
      0 6px 18px rgba(0, 0, 0, 0.14),
      0 2px 4px rgba(0, 0, 0, 0.1);
  }

  /* Selected - More Obvious iOS selection - Enhanced Visibility */
  .prop-button.selected {
    background: rgba(0, 122, 255, 0.15); /* Stronger tint for visibility */
    border-color: rgba(0, 122, 255, 0.5); /* Much more visible border */
    color: #ffffff;
    transform: scale(1.02); /* Slightly larger when selected */
    box-shadow:
      0 6px 20px rgba(0, 122, 255, 0.25),
      /* Stronger glow */ 0 2px 6px rgba(0, 122, 255, 0.15),
      inset 0 0 0 1px rgba(0, 122, 255, 0.2); /* Stronger inner glow */
  }

  .prop-button.selected:hover {
    background: rgba(0, 122, 255, 0.2);
    transform: translateY(-1px) scale(1.03);
  }

  .prop-button:focus-visible {
    outline: 2px solid #007aff; /* iOS system blue */
    outline-offset: 2px;
  }

  .prop-button:active {
    transform: scale(0.98);
    transition-duration: 0.1s; /* iOS immediate feedback */
  }

  .prop-image-container {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1; /* Take up all available space */
    width: 100%;
    min-height: 60px; /* Ensure images have minimum display space */
    overflow: hidden; /* Prevent overflow */
    position: relative;
  }

  .prop-image {
    max-width: 100%;
    max-height: 100%;
    width: auto; /* Don't force width - let aspect ratio determine it */
    height: auto; /* Don't force height - let aspect ratio determine it */
    object-fit: contain; /* Maintain aspect ratio while fitting */
    opacity: 0.85;
    transition:
      opacity 0.2s ease,
      transform 0.3s cubic-bezier(0.36, 0.66, 0.04, 1);
  }

  /* Rotate image 90 degrees counterclockwise when aspect ratios don't match */
  .prop-image.rotated {
    transform: rotate(-90deg);
  }

  .prop-button:hover .prop-image {
    opacity: 1;
  }

  .prop-button.selected .prop-image {
    opacity: 1;
  }

  /* iOS-perfect typography */
  .prop-label {
    text-align: center;
    word-break: break-word;
    white-space: normal;
    max-width: 100%;
    width: 100%;
    font-size: clamp(10px, 2.5cqi, 14px);
    font-weight: 600; /* iOS semibold */
    letter-spacing: -0.08px; /* iOS footnote tracking - exact spec */
    line-height: 1.3;
    flex-shrink: 0; /* Don't allow label to shrink - it needs to be readable */
    overflow: hidden; /* Hide overflow */
    text-overflow: ellipsis; /* Show ... if text too long */
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
  }

  /* iOS checkmark - Larger and More Visible */
  .ios-checkmark {
    position: absolute;
    top: 4px; /* iOS standard inset */
    right: 4px; /* iOS standard inset */
    width: 24px; /* Larger for better visibility */
    height: 24px;
    border-radius: 50%;
    background: #007aff; /* iOS system blue - exact hex */
    backdrop-filter: blur(10px) saturate(180%);
    -webkit-backdrop-filter: blur(10px) saturate(180%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 12px; /* Larger checkmark icon */
    font-weight: 700; /* Bolder checkmark */
    box-shadow:
      0 3px 10px rgba(0, 122, 255, 0.5),
      /* Stronger glow */ 0 1px 3px rgba(0, 0, 0, 0.3);
    /* iOS spring animation */
    animation: ios-checkmark-pop 0.4s cubic-bezier(0.36, 0.66, 0.04, 1);
    z-index: 10;
  }

  @keyframes ios-checkmark-pop {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  /* iOS Accessibility - Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    .prop-button,
    .prop-image,
    .ios-checkmark {
      transition: none;
      animation: none;
    }

    .prop-button:hover,
    .prop-button:active {
      transform: none;
    }

    /* Keep rotation but remove transition animation */
    .prop-image {
      transition: none;
    }
  }

  /* iOS Accessibility - High Contrast */
  @media (prefers-contrast: high) {
    .prop-button {
      border: 2px solid rgba(255, 255, 255, 0.4);
    }

    .prop-button.selected {
      border: 2px solid #0a84ff;
      background: rgba(10, 132, 255, 0.15);
    }
  }

  /* Light mode support */
  @media (prefers-color-scheme: light) {
    .prop-button {
      background: rgba(0, 0, 0, 0.04);
      border-color: rgba(0, 0, 0, 0.12);
      color: rgba(0, 0, 0, 0.85);
    }

    .prop-button:hover {
      background: rgba(0, 0, 0, 0.08);
      border-color: rgba(0, 0, 0, 0.18);
      color: #000000;
    }

    .prop-button.selected {
      background: rgba(0, 122, 255, 0.2);
      border-color: rgba(0, 122, 255, 0.6);
      box-shadow:
        0 6px 20px rgba(0, 122, 255, 0.3),
        0 2px 6px rgba(0, 122, 255, 0.2),
        inset 0 0 0 1px rgba(0, 122, 255, 0.25);
    }
  }

  /* Desktop: Better spacing and sizing */
  @media (min-width: 769px) {
    .prop-button {
      min-height: 160px;
      padding: clamp(10px, 2vw, 18px);
    }

    .prop-image-container {
      min-height: 100px;
    }

    .prop-label {
      font-size: clamp(12px, 1.2vw, 15px);
    }
  }
</style>
