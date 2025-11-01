<!-- PropTypeTab.svelte - Prop type selection with actual desktop app files -->
<script lang="ts">
  import type { AppSettings, IHapticFeedbackService } from "$shared";
  import { resolve, TYPES } from "$shared";
  import { onMount } from "svelte";
  import SettingCard from "../SettingCard.svelte";

  let { settings, onUpdate } = $props<{
    settings: AppSettings;
    onUpdate?: (event: { key: string; value: unknown }) => void;
  }>();

  // Services
  let hapticService: IHapticFeedbackService;

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
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

  function selectPropType(propType: string) {
    // Trigger selection haptic feedback for prop type selection
    hapticService?.trigger("selection");

    selectedPropType = propType;
    onUpdate?.({ key: "propType", value: propType });
  }
</script>

<div class="tab-content">
  <SettingCard
    title="Select Prop"
    helpText="Your prop type determines the visual appearance of movements in pictographs. Different props have unique shapes and rotation patterns."
  >
    <div class="prop-grid">
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
        </button>
      {/each}
    </div>
  </SettingCard>
</div>

<style>
  .tab-content {
    width: 100%;
    max-width: var(--max-content-width, 100%);
    margin: 0 auto;
    container-type: inline-size;
  }

  .prop-grid {
    display: grid;
    width: 100%;
    margin-top: clamp(12px, 2cqi, 20px);

    /*
      Intelligent grid sizing strategy:
      - Use container query units (cqi) for true container-relative sizing
      - Calculate optimal columns based on container width
      - Ensure all 12 buttons fit without scrolling
    */

    /* Default: 3 columns for narrow containers */
    grid-template-columns: repeat(3, 1fr);
    gap: clamp(8px, 1.5cqi, 16px);
  }

  /*
    Container-based responsive grid (pure CSS, no JavaScript needed)
    These breakpoints ensure optimal button sizing for all 12 props
  */

  /* Small containers: 3 columns (4 rows of 3) */
  @container (min-width: 300px) {
    .prop-grid {
      grid-template-columns: repeat(3, 1fr);
      gap: clamp(10px, 2cqi, 14px);
    }
  }

  /* Medium containers: 4 columns (3 rows of 4) */
  @container (min-width: 450px) {
    .prop-grid {
      grid-template-columns: repeat(4, 1fr);
      gap: clamp(12px, 2.5cqi, 18px);
    }
  }

  /* Large containers: 6 columns (2 rows of 6) - optimal for 12 items */
  @container (min-width: 650px) {
    .prop-grid {
      grid-template-columns: repeat(6, 1fr);
      gap: clamp(14px, 2.8cqi, 20px);
    }
  }

  /* Extra large containers: 6 columns with more spacing */
  @container (min-width: 900px) {
    .prop-grid {
      grid-template-columns: repeat(6, 1fr);
      gap: clamp(16px, 3cqi, 24px);
    }
  }

  .prop-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.06);
    border: 2px solid rgba(255, 255, 255, 0.15);
    cursor: pointer;
    transition: all 0.2s ease-out;
    color: rgba(255, 255, 255, 0.85);
    position: relative;

    /*
      Fully responsive sizing using container query units
      - Maintains square aspect ratio
      - Adapts padding and spacing to container size
      - No fixed minimum sizes that could cause overflow
    */
    aspect-ratio: 1;
    width: 100%;
    padding: clamp(6px, 2cqi, 14px);
    gap: clamp(4px, 1cqi, 10px);
    border-radius: clamp(8px, 1.5cqi, 14px);

    /* Ensure minimum touch target size on mobile */
    min-height: 70px;
  }

  /* Container-based button sizing for optimal fit */
  @container (min-width: 300px) {
    .prop-button {
      min-height: 75px;
      padding: clamp(8px, 2.2cqi, 12px);
    }
  }

  @container (min-width: 450px) {
    .prop-button {
      min-height: 80px;
      padding: clamp(10px, 2.5cqi, 14px);
    }
  }

  @container (min-width: 650px) {
    .prop-button {
      min-height: 85px;
      padding: clamp(10px, 2.8cqi, 16px);
    }
  }

  @container (min-width: 900px) {
    .prop-button {
      min-height: 90px;
      padding: clamp(12px, 3cqi, 18px);
    }
  }

  .prop-button:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.35);
    color: #ffffff;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .prop-button.selected {
    background: rgba(99, 102, 241, 0.25);
    border-color: #6366f1;
    color: #ffffff;
    box-shadow: 0 0 15px rgba(99, 102, 241, 0.4);
  }

  .prop-button:focus-visible {
    outline: 2px solid #6366f1;
    outline-offset: 2px;
    border-color: rgba(99, 102, 241, 0.6);
  }

  .prop-button:active {
    transform: scale(0.98);
  }

  .prop-image-container {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    /* Responsive sizing using container units */
    width: clamp(50%, 12cqi, 70%);
    height: clamp(50%, 12cqi, 70%);
    min-width: 32px;
    min-height: 32px;
  }

  /* Adjust image size for different container widths */
  @container (min-width: 650px) {
    .prop-image-container {
      width: clamp(55%, 14cqi, 75%);
      height: clamp(55%, 14cqi, 75%);
    }
  }

  .prop-image {
    max-width: 100%;
    max-height: 100%;
    opacity: 0.85;
    transition: opacity 0.2s ease;
  }

  .prop-button:hover .prop-image {
    opacity: 1;
  }

  .prop-button.selected .prop-image {
    opacity: 1;
  }

  .prop-label {
    text-align: center;
    line-height: 1.2;
    word-break: break-word;
    white-space: normal;
    max-width: 100%;

    /* Responsive font sizing using container units */
    font-size: clamp(9px, 2.5cqi, 14px);
    font-weight: 500;
    margin-top: clamp(2px, 0.5cqi, 4px);
  }

  /* Adjust label size for different container widths */
  @container (min-width: 450px) {
    .prop-label {
      font-size: clamp(10px, 2.8cqi, 13px);
      font-weight: 500;
    }
  }

  @container (min-width: 650px) {
    .prop-label {
      font-size: clamp(10px, 2.5cqi, 12px);
      font-weight: 500;
      letter-spacing: 0.01em;
    }
  }

  @container (min-width: 900px) {
    .prop-label {
      font-size: clamp(11px, 2.8cqi, 14px);
      font-weight: 500;
    }
  }
</style>
