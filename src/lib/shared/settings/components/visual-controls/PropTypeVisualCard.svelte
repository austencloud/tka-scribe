<script lang="ts">
  import { PropType } from "../../../pictograph/prop/domain/enums/PropType";
  import { MotionColor } from "../../../pictograph/shared/domain/enums/pictograph-enums";
  import { getPropTypeDisplayInfo } from "../tabs/prop-type/PropTypeRegistry";
  import { spring } from "svelte/motion";

  interface Props {
    propType: PropType;
    selected?: boolean;
    color?: "blue" | "red";
    onSelect?: (propType: PropType) => void;
  }

  let {
    propType,
    selected = false,
    color = "blue",
    onSelect,
  }: Props = $props();

  const displayInfo = getPropTypeDisplayInfo(propType);

  let svgContent = $state("");
  let viewBox = $state("0 0 100 100");
  let isLoading = $state(true);

  // 3D rotation spring for smooth animation
  const rotateY = spring(0, { stiffness: 0.3, damping: 0.4 });
  const rotateX = spring(0, { stiffness: 0.3, damping: 0.4 });

  // Track mouse position for 3D tilt
  let tiltX = $state(0);
  let tiltY = $state(0);

  // Reactive loading based on color prop
  $effect(() => {
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

      // Apply color transformation
      const targetColor = color === "red" ? MotionColor.RED : MotionColor.BLUE;
      svgText = applyColorToSvg(svgText, targetColor);

      const parser = new DOMParser();
      const doc = parser.parseFromString(svgText, "image/svg+xml");
      const svgElement = doc.querySelector("svg");

      if (svgElement) {
        const viewBoxAttr = svgElement.getAttribute("viewBox");
        if (viewBoxAttr) {
          viewBox = viewBoxAttr;
        }
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
    const ACCENT_COLORS_TO_PRESERVE = ["#c9ac68"];

    let coloredSvg = svgText
      .replace(/fill="(#[0-9A-Fa-f]{3,6})"/gi, (match, capturedColor) => {
        if (
          ACCENT_COLORS_TO_PRESERVE.some(
            (accent) => accent.toLowerCase() === capturedColor.toLowerCase()
          )
        ) {
          return match;
        }
        return `fill="${targetColor}"`;
      })
      .replace(/stroke="(#[0-9A-Fa-f]{3,6})"/gi, (match, capturedColor) => {
        if (
          ACCENT_COLORS_TO_PRESERVE.some(
            (accent) => accent.toLowerCase() === capturedColor.toLowerCase()
          )
        ) {
          return match;
        }
        return `stroke="${targetColor}"`;
      })
      .replace(/<circle[^>]*id="centerPoint"[^>]*\/?>/g, "");

    const colorSuffix = motionColor.toLowerCase();
    coloredSvg = coloredSvg.replace(/\.st(\d+)/g, `.st$1-${colorSuffix}`);
    coloredSvg = coloredSvg.replace(
      /class="st(\d+)"/g,
      `class="st$1-${colorSuffix}"`
    );

    return coloredSvg;
  }

  function handleMouseMove(event: MouseEvent) {
    const card = event.currentTarget as HTMLElement;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate tilt based on mouse position (max 15 degrees)
    tiltY = ((x - centerX) / centerX) * 15;
    tiltX = ((centerY - y) / centerY) * 15;

    rotateY.set(tiltY);
    rotateX.set(tiltX);
  }

  function handleMouseLeave() {
    tiltX = 0;
    tiltY = 0;
    rotateY.set(0);
    rotateX.set(0);
  }

  function handleClick() {
    onSelect?.(propType);
  }
</script>

<button
  class="prop-visual-card"
  class:selected
  style="transform: perspective(1000px) rotateX({$rotateX}deg) rotateY({$rotateY}deg) scale({selected
    ? 1.05
    : 1})"
  onmousemove={handleMouseMove}
  onmouseleave={handleMouseLeave}
  onclick={handleClick}
  aria-label="Select {displayInfo.label}"
  aria-pressed={selected}
>
  <!-- Color indicator glow -->
  <div
    class="color-glow"
    class:blue={color === "blue"}
    class:red={color === "red"}
  ></div>

  <!-- Prop SVG (large size) -->
  <div class="prop-svg-container">
    {#if isLoading}
      <div class="loading-skeleton"></div>
    {:else}
      <svg class="prop-svg" {viewBox}>
        {@html svgContent}
      </svg>
    {/if}
  </div>

  <!-- Prop label -->
  <div class="prop-label">
    <span class="label-text">{displayInfo.label}</span>
    {#if selected}
      <div class="selected-badge">
        <i class="fas fa-check"></i>
      </div>
    {/if}
  </div>

  <!-- Selection ring -->
  {#if selected}
    <div
      class="selection-ring"
      class:blue={color === "blue"}
      class:red={color === "red"}
    ></div>
  {/if}
</button>

<style>
  .prop-visual-card {
    position: relative;
    width: 180px;
    height: 240px;
    cursor: pointer;
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    transform-style: preserve-3d;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 2px solid var(--theme-stroke);
    overflow: hidden;
    background: var(--theme-card-bg);
    border-radius: 20px;
  }

  .prop-visual-card:hover {
    border-color: var(--theme-stroke-strong);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2),
      0 8px 32px color-mix(in srgb, var(--theme-accent) 30%, transparent);
    transform: perspective(1000px) rotateX(var(--tilt-x, 0deg))
      rotateY(var(--tilt-y, 0deg)) scale(1.05);
  }

  .prop-visual-card.selected {
    border-color: transparent;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2),
      0 12px 40px color-mix(in srgb, var(--theme-accent) 40%, transparent);
  }

  .prop-visual-card:focus-visible {
    outline: 2px solid var(--theme-accent);
    outline-offset: 4px;
  }

  /* Color glow effect */
  .color-glow {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
    border-radius: 20px;
  }

  .color-glow.blue {
    background: radial-gradient(
      circle at center,
      rgba(46, 49, 146, 0.2) 0%,
      transparent 70%
    );
  }

  .color-glow.red {
    background: radial-gradient(
      circle at center,
      rgba(237, 28, 36, 0.2) 0%,
      transparent 70%
    );
  }

  .prop-visual-card:hover .color-glow {
    opacity: 1;
  }

  .prop-visual-card.selected .color-glow {
    opacity: 1;
  }

  /* Prop SVG container */
  .prop-svg-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    position: relative;
    transform: translateZ(20px); /* 3D depth */
  }

  .prop-svg {
    width: 100%;
    height: 100%;
    max-width: 120px;
    max-height: 180px;
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
    transition: filter 0.3s;
  }

  .prop-visual-card:hover .prop-svg {
    filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.4));
  }

  .loading-skeleton {
    width: 120px;
    height: 180px;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.05) 25%,
      rgba(255, 255, 255, 0.1) 50%,
      rgba(255, 255, 255, 0.05) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 8px;
  }

  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }

  /* Prop label */
  .prop-label {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 15px;
    font-weight: 600;
    color: var(--theme-text);
    text-align: center;
    transform: translateZ(10px); /* 3D depth */
  }

  .label-text {
    text-transform: capitalize;
  }

  .selected-badge {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--theme-accent), var(--theme-accent-strong));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    color: white;
    animation: badge-pop 0.3s cubic-bezier(0.36, 0.66, 0.04, 1);
  }

  @keyframes badge-pop {
    0% {
      transform: scale(0);
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
    }
  }

  /* Selection ring */
  .selection-ring {
    position: absolute;
    inset: -2px;
    border: 3px solid transparent;
    border-radius: 20px;
    pointer-events: none;
    animation: pulse-ring 2s ease-in-out infinite;
  }

  .selection-ring.blue {
    border-color: #2e3192;
    box-shadow: 0 0 20px rgba(46, 49, 146, 0.6);
  }

  .selection-ring.red {
    border-color: #ed1c24;
    box-shadow: 0 0 20px rgba(237, 28, 36, 0.6);
  }

  @keyframes pulse-ring {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .prop-visual-card {
      width: 140px;
      height: 180px;
      padding: 16px;
    }

    .prop-svg {
      max-width: 80px;
      max-height: 120px;
    }

    .loading-skeleton {
      width: 80px;
      height: 120px;
    }

    .prop-label {
      font-size: 13px;
    }

    /* Disable 3D tilt on mobile for performance */
    .prop-visual-card:hover {
      transform: scale(1.05);
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .prop-visual-card,
    .prop-svg,
    .color-glow,
    .selected-badge,
    .selection-ring {
      animation: none !important;
      transition: none !important;
    }

    .prop-visual-card:hover {
      transform: none;
    }
  }
</style>
