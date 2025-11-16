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

  // Exact prop types from desktop app prop_type_tab.py
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
    { id: "Sword", label: "Sword", image: "/images/props/sword.svg" },
    { id: "Chicken", label: "Chicken", image: "/images/props/chicken.png" },
    { id: "Hand", label: "Hand", image: "/images/props/hand.svg" },
    { id: "Guitar", label: "Guitar", image: "/images/props/guitar.svg" },
  ];

  let selectedPropType = $state(settings.propType || "Staff");

  // Calculate optimal grid layout based on container size
  const gridLayout = $derived(() => {
    const totalItems = propTypes.length; // 12 items

    // Determine columns based on container width - optimized for small screens
    let columns = 4; // Default to 4 columns (3 rows for 12 items)
    if (containerWidth >= 900)
      columns = 6; // 2 rows
    else if (containerWidth >= 650)
      columns = 6; // 2 rows
    else if (containerWidth >= 450)
      columns = 4; // 3 rows
    else if (containerWidth >= 300) columns = 4; // 3 rows (better for small screens like iPhone SE)

    const rows = Math.ceil(totalItems / columns);

    return { columns, rows };
  });

  function selectPropType(propType: string) {
    // Trigger selection haptic feedback for prop type selection
    hapticService?.trigger("selection");

    selectedPropType = propType;
    onUpdate?.({ key: "propType", value: propType });
  }
</script>

<div class="tab-content">
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
              loading="lazy"
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
  .tab-content {
    width: 100%;
    height: 100%; /* Fill parent */
    max-width: var(--max-content-width, 100%);
    margin: 0 auto;
    container-type: inline-size;
    display: flex; /* Make it a flex container */
    flex-direction: column;
  }

  .prop-container {
    width: 100%;
    flex: 1; /* Grow to fill available space */
    min-height: 0; /* Critical for flex child */
    display: flex;
    flex-direction: column;
  }

  .prop-grid {
    display: grid;
    width: 100%;
    flex: 1; /* Fill parent flex container */
    min-height: 0; /* Critical: allows grid to shrink in flex container */

    /* Use CSS variables calculated from JavaScript */
    grid-template-columns: var(--grid-columns, repeat(3, 1fr));
    grid-template-rows: var(
      --grid-rows,
      repeat(4, 1fr)
    ); /* Equal-height rows */

    /* Fluid gap using container query units - scales smoothly with container size */
    gap: clamp(12px, 3cqi, 24px);

    /* Don't center - let items fill cells */
    align-items: stretch; /* Default, but explicit for clarity */
    justify-items: stretch;
  }

  /* Grid items stretch to fill their cells automatically */
  .prop-grid > .prop-button {
    min-height: 0; /* Allow shrinking below content size */
    min-width: 0;
    /* Don't set explicit width/height - let grid cells define size */
  }

  /* iOS-native prop button - Pixel Perfect */
  .prop-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.04);
    border: 0.33px solid rgba(255, 255, 255, 0.16); /* iOS hairline border */
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.36, 0.66, 0.04, 1); /* iOS spring */
    color: rgba(255, 255, 255, 0.85);
    position: relative;
    padding: clamp(4px, 1.5cqi, 8px); /* Reduced padding for better fit */
    gap: clamp(2px, 0.8cqi, 6px); /* Reduced gap */
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
    flex: 1;
    width: 100%;
    min-height: 0; /* Allow container to shrink */
    max-height: 100%; /* Don't exceed card height */
    overflow: hidden; /* Prevent overflow */
  }

  .prop-image {
    max-width: 100%;
    max-height: 100%;
    width: 100%; /* Fill width */
    height: 100%; /* Fill height */
    object-fit: contain; /* Maintain aspect ratio while fitting */
    opacity: 0.85;
    transition: opacity 0.2s ease;
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
    font-size: clamp(9px, 2.5cqi, 13px); /* Smaller minimum for tight spaces */
    font-weight: 600; /* iOS semibold */
    letter-spacing: -0.08px; /* iOS footnote tracking - exact spec */
    line-height: 1.3; /* Proportional line height for better scaling */
    flex-shrink: 1; /* Allow label to shrink if needed */
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
</style>
