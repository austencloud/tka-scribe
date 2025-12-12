<script lang="ts">
  import { PropType } from "../../../../pictograph/prop/domain/enums/PropType";
  import { MotionColor } from "../../../../pictograph/shared/domain/enums/pictograph-enums";
  import { getPropTypeDisplayInfo } from "./PropTypeRegistry";

  let {
    propType,
    selected = false,
    selectedBlue = false,
    selectedRed = false,
    shouldRotate = false,
    color = "blue",
    onSelect,
    onImageLoad,
  } = $props<{
    propType: PropType;
    selected?: boolean;
    selectedBlue?: boolean;
    selectedRed?: boolean;
    shouldRotate?: boolean;
    color?: "blue" | "red";
    onSelect?: (propType: PropType) => void;
    onImageLoad?: (propType: PropType, width: number, height: number) => void;
  }>();

  const displayInfo = getPropTypeDisplayInfo(propType);

  let svgContent = $state("");
  let viewBox = $state("0 0 100 100");
  let isLoading = $state(true);

  // Reactive loading based on color prop
  $effect(() => {
    // Watch both propType and color
    propType;
    color;
    loadAndTransformSvg();
  });

  async function loadAndTransformSvg() {
    isLoading = true;
    try {
      const response = await fetch(displayInfo.image);
      if (!response.ok)
        throw new Error(`Failed to fetch SVG: ${response.status}`);

      let svgText = await response.text();

      // Apply color transformation BEFORE parsing (transform the raw text)
      const targetColor = color === "red" ? MotionColor.RED : MotionColor.BLUE;
      svgText = applyColorToSvg(svgText, targetColor);

      // Now parse the transformed SVG
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgText, "image/svg+xml");
      const svgElement = doc.querySelector("svg");

      if (svgElement) {
        const viewBoxAttr = svgElement.getAttribute("viewBox");
        if (viewBoxAttr) {
          viewBox = viewBoxAttr;
        }

        // Report dimensions for rotation logic
        const [, , w, h] = viewBoxAttr?.split(" ").map(Number) || [
          0, 0, 100, 100,
        ];
        onImageLoad?.(propType, w || 100, h || 100);

        // Extract inner content from transformed SVG
        svgContent = svgElement.innerHTML;
      }

      isLoading = false;
    } catch (error) {
      console.error("Failed to load prop SVG:", error);
      isLoading = false;
    }
  }

  function applyColorToSvg(svgText: string, motionColor: MotionColor): string {
    const colorMap: Record<MotionColor, string> = {
      [MotionColor.BLUE]: "#2E3192",
      [MotionColor.RED]: "#ED1C24",
    };

    const targetColor = colorMap[motionColor] || colorMap[MotionColor.BLUE];

    // Accent colors to preserve
    const ACCENT_COLORS_TO_PRESERVE = ["#c9ac68"];

    // Replace fill attributes
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

    // Replace fill in CSS styles
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

    // Replace stroke attributes (important for line-based props)
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

    // Replace stroke in CSS styles
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

    // Make CSS class names unique for each color
    const colorSuffix = motionColor.toLowerCase();
    coloredSvg = coloredSvg.replace(/\.st(\d+)/g, `.st$1-${colorSuffix}`);
    coloredSvg = coloredSvg.replace(
      /class="st(\d+)"/g,
      `class="st$1-${colorSuffix}"`
    );

    // Remove centerPoint circle
    coloredSvg = coloredSvg.replace(
      /<circle[^>]*id="centerPoint"[^>]*\/?>/,
      ""
    );

    return coloredSvg;
  }

  function handleClick() {
    onSelect?.(propType);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect?.(propType);
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
    {#if isLoading}
      <div class="prop-loading">Loading...</div>
    {:else}
      <svg
        class="prop-image"
        class:rotated={shouldRotate}
        {viewBox}
        preserveAspectRatio="xMidYMid meet"
      >
        {@html svgContent}
      </svg>
    {/if}
  </div>
  <span class="prop-label">{displayInfo.label}</span>

  <!-- iOS checkmark indicators -->
  {#if selected || selectedBlue || selectedRed}
    <div class="checkmark-container">
      {#if selected || selectedBlue}
        <div class="ios-checkmark blue">
          <i class="fas fa-check"></i>
        </div>
      {/if}
      {#if selected || selectedRed}
        <div class="ios-checkmark red" class:offset={selectedBlue}>
          <i class="fas fa-check"></i>
        </div>
      {/if}
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
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 0.33px solid var(--theme-stroke, rgba(255, 255, 255, 0.16)); /* iOS hairline border */
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.36, 0.66, 0.04, 1); /* iOS spring */
    color: var(--theme-text, rgba(255, 255, 255, 0.85));
    position: relative;
    padding: clamp(6px, 1.8cqi, 12px);
    gap: clamp(4px, 1cqi, 8px);
    border-radius: 12px; /* iOS medium corner radius */
    box-sizing: border-box;
    min-height: 0; /* Allow shrinking */
    overflow: hidden; /* Prevent image overflow */
    /* iOS precise shadow - matches Photos.app */
    box-shadow: var(--theme-shadow, 0 3px 12px rgba(0, 0, 0, 0.12));
  }

  .prop-button:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.08));
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.22));
    color: var(--theme-text, #ffffff);
    transform: translateY(-1px) scale(1.01); /* iOS subtle lift */
    box-shadow:
      0 6px 18px rgba(0, 0, 0, 0.14),
      0 2px 4px rgba(0, 0, 0, 0.1);
  }

  /* Selected - Uses theme accent */
  .prop-button.selected {
    background: color-mix(in srgb, var(--theme-accent, #007aff) 15%, transparent);
    border-color: color-mix(in srgb, var(--theme-accent, #007aff) 50%, transparent);
    color: var(--theme-text, #ffffff);
    transform: scale(1.02); /* Slightly larger when selected */
    box-shadow:
      0 6px 20px color-mix(in srgb, var(--theme-accent, #007aff) 25%, transparent),
      0 2px 6px color-mix(in srgb, var(--theme-accent, #007aff) 15%, transparent),
      inset 0 0 0 1px color-mix(in srgb, var(--theme-accent, #007aff) 20%, transparent);
  }

  .prop-button.selected:hover {
    background: color-mix(in srgb, var(--theme-accent, #007aff) 20%, transparent);
    transform: translateY(-1px) scale(1.03);
  }

  .prop-button:focus-visible {
    outline: 2px solid var(--theme-accent, #007aff);
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

  .prop-loading {
    font-size: 10px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.4));
  }

  .prop-image {
    max-width: 100%;
    max-height: 100%;
    width: auto; /* Don't force width - let aspect ratio determine it */
    height: auto; /* Don't force height - let aspect ratio determine it */
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

  /* Checkmark container for dual indicators */
  .checkmark-container {
    position: absolute;
    top: 4px;
    right: 4px;
    display: flex;
    gap: 4px;
    z-index: 10;
  }

  /* iOS checkmark - Larger and More Visible */
  .ios-checkmark {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    backdrop-filter: blur(10px) saturate(180%);
    -webkit-backdrop-filter: blur(10px) saturate(180%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 12px;
    font-weight: 700;
    /* iOS spring animation */
    animation: ios-checkmark-pop 0.4s cubic-bezier(0.36, 0.66, 0.04, 1);
  }

  .ios-checkmark.blue {
    background: var(--prop-blue, #2e3192);
    box-shadow:
      0 3px 10px color-mix(in srgb, var(--prop-blue, #2e3192) 50%, transparent),
      0 1px 3px rgba(0, 0, 0, 0.3);
  }

  .ios-checkmark.red {
    background: var(--prop-red, #ed1c24);
    box-shadow:
      0 3px 10px color-mix(in srgb, var(--prop-red, #ed1c24) 50%, transparent),
      0 1px 3px rgba(0, 0, 0, 0.3);
  }

  /* When both checkmarks are present, offset the red one slightly */
  .ios-checkmark.red.offset {
    margin-left: -8px;
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
      border: 2px solid var(--theme-stroke-strong, rgba(255, 255, 255, 0.4));
    }

    .prop-button.selected {
      border: 2px solid var(--theme-accent, #0a84ff);
      background: color-mix(in srgb, var(--theme-accent, #0a84ff) 15%, transparent);
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
