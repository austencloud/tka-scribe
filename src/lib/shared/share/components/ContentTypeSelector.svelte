<!--
ContentTypeSelector - Content Type Selection Buttons
Compact horizontal row of buttons for selecting content types (Video, Animation, Image)
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "$shared";
  import { resolve, TYPES } from "$shared";
  import { onMount } from "svelte";

  type ContentType = "video" | "animation" | "image";

  let {
    selectedTypes = $bindable<ContentType[]>([]),
  }: {
    selectedTypes?: ContentType[];
  } = $props();

  let hapticService: IHapticFeedbackService;

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  // Content types configuration
  const contentTypes: {
    type: ContentType;
    icon: string;
    label: string;
    color: string;
    disabled: boolean;
  }[] = [
    {
      type: "video",
      icon: "fa-solid fa-video",
      label: "Video",
      color: "#ef4444",
      disabled: true,
    },
    {
      type: "animation",
      icon: "fa-solid fa-film",
      label: "Animation",
      color: "#8b5cf6",
      disabled: true,
    },
    {
      type: "image",
      icon: "fa-solid fa-image",
      label: "Image",
      color: "#3b82f6",
      disabled: false,
    },
  ];

  function toggleContentType(type: ContentType) {
    const disabled = contentTypes.find((ct) => ct.type === type)?.disabled;
    if (disabled) return;

    hapticService?.trigger("selection");

    selectedTypes = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type];
  }
</script>

<section class="content-type-selector">
  <h3>Select Content Types</h3>
  <div class="type-grid">
    {#each contentTypes as contentType}
      <button
        class="type-button"
        class:selected={selectedTypes.includes(contentType.type)}
        class:disabled={contentType.disabled}
        onclick={() => toggleContentType(contentType.type)}
        style="--type-color: {contentType.color}"
        type="button"
      >
        <div class="type-icon">
          <i class={contentType.icon}></i>
        </div>
        <span class="type-label">{contentType.label}</span>
        <div class="selection-indicator">
          <i class="fas fa-check"></i>
        </div>
      </button>
    {/each}
  </div>
</section>

<style>
  .content-type-selector h3 {
    margin: 0 0 20px 0;
    font-size: 16px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.9);
    text-transform: uppercase;
    letter-spacing: 1.4px;
  }

  .type-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }

  .type-button {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 18px 12px;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.06),
      rgba(255, 255, 255, 0.03)
    );
    border: 1.5px solid rgba(255, 255, 255, 0.15);
    border-radius: 14px;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
  }

  .type-button:hover:not(.disabled) {
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.1),
      rgba(255, 255, 255, 0.05)
    );
    border-color: rgba(255, 255, 255, 0.25);
    transform: translateY(-2px) scale(1.02);
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.12);
  }

  .type-button.selected {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--type-color) 20%, transparent),
      color-mix(in srgb, var(--type-color) 12%, transparent)
    );
    border-color: var(--type-color);
    border-width: 2px;
    box-shadow:
      0 4px 16px color-mix(in srgb, var(--type-color) 35%, transparent),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }

  .type-button.selected:hover:not(.disabled) {
    transform: translateY(-2px) scale(1.03);
  }

  .type-button.disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none !important;
  }

  .type-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    font-size: 22px;
    color: color-mix(in srgb, var(--type-color) 80%, white);
    transition: all 0.25s ease;
    background: color-mix(in srgb, var(--type-color) 10%, transparent);
    border-radius: 10px;
  }

  .type-button.selected .type-icon {
    color: var(--type-color);
    background: color-mix(in srgb, var(--type-color) 15%, transparent);
    transform: scale(1.1);
  }

  .type-label {
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.75);
    transition: all 0.25s ease;
    text-align: center;
  }

  .type-button.selected .type-label {
    color: rgba(255, 255, 255, 0.98);
    font-weight: 700;
  }

  .selection-indicator {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--type-color);
    color: white;
    font-size: 11px;
    opacity: 0;
    transform: scale(0.3) rotate(-90deg);
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 2px 8px color-mix(in srgb, var(--type-color) 50%, black);
  }

  .type-button.selected .selection-indicator {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }

  /* Mobile adjustments */
  @media (max-width: 768px) {
    .type-button {
      padding: 16px 10px;
    }

    .type-icon {
      width: 36px;
      height: 36px;
      font-size: 20px;
    }

    .type-label {
      font-size: 13px;
    }
  }
</style>
