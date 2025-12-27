<!--
ContentTypeSelector - Content Type Selection Buttons
Compact horizontal row of buttons for selecting content types (Video, Animation, Image)
-->
<script lang="ts">
  import type { IHapticFeedback } from "../../application/services/contracts/IHapticFeedback";
  import { resolve } from "../../inversify/di";
  import { TYPES } from "../../inversify/types";
  import { onMount } from "svelte";

  type ContentType = "video" | "animation" | "image";

  let {
    selectedTypes = $bindable<ContentType[]>([]),
  }: {
    selectedTypes?: ContentType[];
  } = $props();

  let hapticService: IHapticFeedback;

  onMount(() => {
    hapticService = resolve<IHapticFeedback>(
      TYPES.IHapticFeedback
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
        {#if selectedTypes.includes(contentType.type)}
          <div class="selection-indicator">
            <i class="fas fa-check"></i>
          </div>
        {/if}
      </button>
    {/each}
  </div>
</section>

<style>
  .content-type-selector {
    container-type: inline-size;
    container-name: content-selector;
  }

  .content-type-selector h3 {
    margin: 0 0 clamp(10px, 2cqw, 16px) 0;
    font-size: clamp(11px, 1.2cqw, 14px);
    font-weight: 700;
    color: rgba(255, 255, 255, 0.7);
    text-transform: uppercase;
    letter-spacing: 1.2px;
  }

  .type-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: clamp(8px, 1.5cqw, 12px);
  }

  .type-button {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: clamp(6px, 1cqw, 10px);
    padding: clamp(12px, 2cqw, 18px) clamp(8px, 1.5cqw, 12px);
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.05) 0%,
      rgba(255, 255, 255, 0.02) 100%
    );
    border: 1.5px solid rgba(255, 255, 255, 0.1);
    border-radius: clamp(10px, 1.5cqw, 14px);
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.06);
    overflow: hidden;
  }

  .type-button::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      transparent 0%,
      rgba(255, 255, 255, 0.05) 100%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  .type-button:hover:not(.disabled)::before {
    opacity: 1;
  }

  .type-button:hover:not(.disabled) {
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px) scale(1.02);
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .type-button.selected {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--type-color) 18%, transparent) 0%,
      color-mix(in srgb, var(--type-color) 10%, transparent) 100%
    );
    border-color: var(--type-color);
    border-width: 2px;
    box-shadow:
      0 4px 20px color-mix(in srgb, var(--type-color) 30%, transparent),
      0 0 0 1px color-mix(in srgb, var(--type-color) 20%, transparent),
      inset 0 1px 0 rgba(255, 255, 255, 0.12);
  }

  .type-button.selected:hover:not(.disabled) {
    transform: translateY(-2px) scale(1.03);
  }

  .type-button.disabled {
    opacity: 0.35;
    cursor: not-allowed;
    transform: none !important;
    filter: grayscale(40%);
  }

  .type-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: clamp(32px, 4cqw, 40px);
    height: clamp(32px, 4cqw, 40px);
    font-size: clamp(16px, 2cqw, 22px);
    color: color-mix(in srgb, var(--type-color) 75%, white);
    transition: all 0.25s ease;
    background: color-mix(in srgb, var(--type-color) 8%, transparent);
    border-radius: clamp(8px, 1cqw, 10px);
  }

  .type-button.selected .type-icon {
    color: var(--type-color);
    background: color-mix(in srgb, var(--type-color) 15%, transparent);
    transform: scale(1.08);
  }

  .type-label {
    font-size: clamp(11px, 1.2cqw, 14px);
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
    transition: all 0.25s ease;
    text-align: center;
  }

  .type-button.selected .type-label {
    color: rgba(255, 255, 255, 0.95);
    font-weight: 700;
  }

  .selection-indicator {
    position: absolute;
    top: clamp(5px, 0.8cqw, 8px);
    right: clamp(5px, 0.8cqw, 8px);
    width: clamp(16px, 2cqw, 20px);
    height: clamp(16px, 2cqw, 20px);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--type-color);
    color: white;
    font-size: clamp(8px, 1cqw, 11px);
    box-shadow: 0 2px 8px color-mix(in srgb, var(--type-color) 50%, black);
    animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes popIn {
    from {
      transform: scale(0.3) rotate(-90deg);
      opacity: 0;
    }
    to {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
  }

  /* Compact layout for narrow containers */
  @container content-selector (max-width: 320px) {
    .type-button {
      padding: 10px 6px;
      gap: 5px;
    }

    .type-icon {
      width: 28px;
      height: 28px;
      font-size: 14px;
    }

    .type-label {
      font-size: 10px;
    }

    .selection-indicator {
      width: 14px;
      height: 14px;
      font-size: 7px;
      top: 4px;
      right: 4px;
    }
  }
</style>
