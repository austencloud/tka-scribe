<!-- PropTypeTab.svelte - Prop type selection with actual desktop app files -->
<script lang="ts">
  import type { AppSettings, IHapticFeedbackService } from "$shared";
  import { resolve, TYPES } from "$shared";
  import { onMount } from "svelte";

  let { settings, onUpdate } = $props<{
    settings: AppSettings;
    onUpdate?: (event: { key: string; value: unknown }) => void;
  }>();

  // Services
  let hapticService: IHapticFeedbackService;

  // Grid container tracking for responsive sizing
  let gridContainerElement: HTMLDivElement | null = null;
  let containerWidth = $state(0);
  let containerHeight = $state(0);

  // Track image dimensions for smart rotation
  let imageDimensions = $state(
    new Map<string, { width: number; height: number }>()
  );

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );

    // Setup ResizeObserver to track container dimensions
    if (!gridContainerElement) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.borderBoxSize?.[0]) {
          containerWidth = entry.borderBoxSize[0].inlineSize;
          containerHeight = entry.borderBoxSize[0].blockSize;
        } else {
          containerWidth = entry.contentRect.width;
          containerHeight = entry.contentRect.height;
        }
      }
    });

    resizeObserver.observe(gridContainerElement);

    return () => {
      resizeObserver.disconnect();
    };
  });

  // All available prop types with animated versions
  const propTypes = [
    { id: "Staff", label: "Staff", image: "/images/props/staff.svg" },
    {
      id: "Simplestaff",
      label: "Simple Staff",
      image: "/images/props/simple_staff.svg",
    },
    { id: "Club", label: "Club", image: "/images/props/club.svg" },
    { id: "Fan", label: "Fan", image: "/images/props/fan.svg" },
    { id: "Triad", label: "Triad", image: "/images/props/triad.svg" },
    { id: "Minihoop", label: "Mini Hoop", image: "/images/props/minihoop.svg" },
    { id: "Buugeng", label: "Buugeng", image: "/images/props/buugeng.svg" },
    {
      id: "Triquetra",
      label: "Triquetra",
      image: "/images/props/triquetra.svg",
    },
    {
      id: "Triquetra2",
      label: "Triquetra 2",
      image: "/images/props/triquetra2.svg",
    },
    { id: "Sword", label: "Sword", image: "/images/props/sword.svg" },
    { id: "Chicken", label: "Chicken", image: "/images/props/chicken.svg" },
    { id: "Hand", label: "Hand", image: "/images/props/hand.svg" },
    { id: "Guitar", label: "Guitar", image: "/images/props/guitar.svg" },
    { id: "Ukulele", label: "Ukulele", image: "/images/props/ukulele.svg" },
    {
      id: "Doublestar",
      label: "Double Star",
      image: "/images/props/doublestar.svg",
    },
    {
      id: "Eightrings",
      label: "Eight Rings",
      image: "/images/props/eightrings.svg",
    },
    {
      id: "Fractalgeng",
      label: "Fractal Geng",
      image: "/images/props/fractalgeng.svg",
    },
    { id: "Quiad", label: "Quiad", image: "/images/props/quiad.svg" },
    { id: "Staff_v2", label: "Staff V2", image: "/images/props/staff_v2.svg" },
    {
      id: "Bigbuugeng",
      label: "Big Buugeng",
      image: "/images/props/bigbuugeng.svg",
    },
    {
      id: "Bigdoublestar",
      label: "Big Double Star",
      image: "/images/props/bigdoublestar.svg",
    },
    {
      id: "Bigeightrings",
      label: "Big Eight Rings",
      image: "/images/props/bigeightrings.svg",
    },
    { id: "Bigfan", label: "Big Fan", image: "/images/props/bigfan.svg" },
    { id: "Bighoop", label: "Big Hoop", image: "/images/props/bighoop.svg" },
    { id: "Bigstaff", label: "Big Staff", image: "/images/props/bigstaff.svg" },
    { id: "Bigtriad", label: "Big Triad", image: "/images/props/bigtriad.svg" },
  ];

  let selectedPropType = $state(settings.propType || "Staff");

  // Calculate optimal grid layout based on container size
  const gridLayout = $derived(() => {
    const totalItems = propTypes.length; // 26 items

    // Determine columns based on container width - optimized for all screen sizes
    let columns = 3; // Default to 3 columns (9 rows for 26 items)
    if (containerWidth >= 1200)
      columns = 6; // 5 rows for very large screens
    else if (containerWidth >= 900)
      columns = 6; // 5 rows for large screens
    else if (containerWidth >= 650)
      columns = 4; // 7 rows for medium screens
    else if (containerWidth >= 450)
      columns = 4; // 7 rows for tablets
    else if (containerWidth >= 300) columns = 3; // 9 rows for phones

    const rows = Math.ceil(totalItems / columns);

    return { columns, rows };
  });

  function selectPropType(propType: string) {
    // Trigger selection haptic feedback for prop type selection
    hapticService?.trigger("selection");

    selectedPropType = propType;
    onUpdate?.({ key: "propType", value: propType });
  }

  // Handle image load to detect natural dimensions
  function handleImageLoad(event: Event, propId: string) {
    const img = event.target as HTMLImageElement;
    if (img.naturalWidth && img.naturalHeight) {
      imageDimensions.set(propId, {
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
      // Force reactivity update
      imageDimensions = new Map(imageDimensions);
    }
  }

  // Calculate if an image should be rotated based on aspect ratio mismatch
  function shouldRotate(propId: string): boolean {
    const dimensions = imageDimensions.get(propId);
    if (!dimensions || !gridLayout().columns) return false;

    // Calculate image aspect ratio
    const imageAspectRatio = dimensions.width / dimensions.height;
    const imageIsLandscape = imageAspectRatio > 1;

    // Estimate button aspect ratio from grid
    // Each button's aspect ratio changes based on the grid layout
    // We use a heuristic: if we have more columns, buttons tend to be taller (portrait)
    const columns = gridLayout().columns;
    const rows = gridLayout().rows;

    // If container width and height are available, use actual measurements
    if (containerWidth && containerHeight) {
      // Rough estimate of single button dimensions
      const buttonWidth = containerWidth / columns;
      const buttonHeight = containerHeight / rows;
      const buttonAspectRatio = buttonWidth / buttonHeight;
      const buttonIsLandscape = buttonAspectRatio > 1;

      // Rotate if orientations don't match
      return imageIsLandscape !== buttonIsLandscape;
    }

    return false;
  }
</script>

<div class="prop-type-content">
  <div class="prop-container" bind:this={gridContainerElement}>
    <div
      class="prop-grid"
      style:--grid-columns={`repeat(${gridLayout().columns}, 1fr)`}
      style:--grid-rows={`repeat(${gridLayout().rows}, 1fr)`}
    >
      {#each propTypes as prop}
        <button
          class="prop-button"
          class:selected={selectedPropType === prop.id}
          onclick={() => selectPropType(prop.id)}
          onkeydown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              selectPropType(prop.id);
            }
          }}
          aria-label={`Select ${prop.label} prop type`}
          aria-pressed={selectedPropType === prop.id}
          title={`${prop.label} - Click to select this prop type`}
        >
          <div class="prop-image-container">
            <img
              src={prop.image}
              alt={prop.label}
              class="prop-image"
              class:rotated={shouldRotate(prop.id)}
              loading="lazy"
              onload={(e) => handleImageLoad(e, prop.id)}
            />
          </div>
          <span class="prop-label">{prop.label}</span>

          <!-- iOS checkmark indicator for selected prop -->
          {#if selectedPropType === prop.id}
            <div class="ios-checkmark">
              <i class="fas fa-check"></i>
            </div>
          {/if}
        </button>
      {/each}
    </div>
  </div>
</div>

<style>
  .prop-type-content {
    width: 100%;
    height: 100%; /* Fill parent */
    margin: 0 auto;
    container-type: inline-size;
    display: flex; /* Make it a flex container */
    flex-direction: column;
    /* No max-width - let it use all available space */
  }

  .prop-container {
    width: 100%;
    height: 100%;
    flex: 1; /* Grow to fill available space */
    min-height: 0; /* Critical for flex child */
    display: flex;
    flex-direction: column;
    justify-content: center; /* Center the grid vertically */
    align-items: center; /* Center the grid horizontally */
  }

  .prop-grid {
    display: grid;
    width: 100%;
    /* Don't use flex: 1 - let grid be content-sized */

    /* Use CSS variables calculated from JavaScript */
    grid-template-columns: var(--grid-columns, repeat(3, 1fr));
    /* Use auto rows with consistent sizing */
    grid-auto-rows: auto;

    /* Fluid gap using container query units - scales smoothly with container size */
    gap: clamp(12px, 2cqi, 20px);

    /* Let items fill their cells */
    align-items: stretch;
    justify-items: stretch;
    align-content: center; /* Center rows within grid */
  }

  /* Grid items: fill cells but with reasonable max sizes */
  .prop-grid > .prop-button {
    min-height: 0; /* Allow shrinking below content size */
    min-width: 0;
    width: 100%;
    height: 100%;
    /* No max constraints on mobile/tablet - let grid control size */
  }

  /* iOS-native prop button - Pixel Perfect */
  .prop-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between; /* Changed from center to space-between */
    background: rgba(255, 255, 255, 0.04);
    border: 0.33px solid rgba(255, 255, 255, 0.16); /* iOS hairline border */
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.36, 0.66, 0.04, 1); /* iOS spring */
    color: rgba(255, 255, 255, 0.85);
    position: relative;
    padding: clamp(
      6px,
      1.8cqi,
      12px
    ); /* Slightly more padding for breathing room */
    gap: clamp(4px, 1cqi, 8px); /* Slightly more gap */
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
    font-size: clamp(10px, 2.5cqi, 14px); /* Slightly larger for readability */
    font-weight: 600; /* iOS semibold */
    letter-spacing: -0.08px; /* iOS footnote tracking - exact spec */
    line-height: 1.3; /* Proportional line height for better scaling */
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
      background: rgba(0, 122, 255, 0.2); /* Stronger tint in light mode */
      border-color: rgba(0, 122, 255, 0.6); /* More visible border */
      box-shadow:
        0 6px 20px rgba(0, 122, 255, 0.3),
        0 2px 6px rgba(0, 122, 255, 0.2),
        inset 0 0 0 1px rgba(0, 122, 255, 0.25);
    }
  }

  /* Desktop: Better spacing and sizing */
  @media (min-width: 769px) {
    .prop-type-content {
      padding: 0; /* Remove padding on desktop for maximum space utilization */
    }

    .prop-container {
      padding: clamp(16px, 2vw, 24px); /* Add padding to container instead */
    }

    .prop-grid {
      gap: clamp(
        20px,
        3vw,
        36px
      ); /* Larger gaps on desktop for better separation */
      /* Use consistent row sizing on desktop */
      grid-auto-rows: minmax(160px, auto);
    }

    .prop-button {
      min-height: 160px; /* Taller minimum for better content display */
      padding: clamp(10px, 2vw, 18px);
    }

    .prop-image-container {
      min-height: 100px; /* More space for images on desktop */
    }

    .prop-label {
      font-size: clamp(12px, 1.2vw, 15px); /* Better desktop sizing */
    }
  }

  /* Large screens: constrain individual buttons to prevent gigantic sizes */
  @media (min-width: 1200px) {
    .prop-grid > .prop-button {
      /* Allow buttons to be rectangular to fit content better */
      max-width: min(100%, 240px);
      max-height: min(100%, 280px);
      /* Don't force square - let content determine shape */
    }
  }

  /* Very large screens: tighter constraints to prevent absurd button sizes */
  @media (min-width: 1600px) {
    .prop-grid > .prop-button {
      max-width: min(100%, 220px);
      max-height: min(100%, 260px);
    }
  }
</style>
