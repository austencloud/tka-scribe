<!--
  ContentTypeSelector.svelte

  Allows users to select which content types to include in their share package:
  - Video (placeholder for future - sequences will have videos attached)
  - Animation (GIF export)
  - Image (static image export)
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "$shared";
  import { resolve, TYPES } from "$shared";
  import { onMount } from "svelte";

  export type ContentType = "video" | "animation" | "image";

  let {
    selectedTypes = $bindable(["image"]),
    onSelectionChange,
  }: {
    selectedTypes?: ContentType[];
    onSelectionChange?: (selected: ContentType[]) => void;
  } = $props();

  // Services
  let hapticService: IHapticFeedbackService;

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  // Content type options
  const contentTypes: {
    type: ContentType;
    icon: string;
    label: string;
    description: string;
    color: string;
    disabled: boolean;
    comingSoon?: boolean;
  }[] = [
    {
      type: "video",
      icon: "fa-solid fa-video",
      label: "Video",
      description: "Recorded performance",
      color: "#ef4444", // red
      disabled: true,
      comingSoon: true,
    },
    {
      type: "animation",
      icon: "fa-solid fa-film",
      label: "Animation",
      description: "Animated GIF/WebP",
      color: "#8b5cf6", // purple
      disabled: false,
    },
    {
      type: "image",
      icon: "fa-solid fa-image",
      label: "Image",
      description: "Static sequence image",
      color: "#3b82f6", // blue
      disabled: false,
    },
  ];

  // Toggle content type selection
  function toggleContentType(type: ContentType, disabled: boolean) {
    if (disabled) return;

    hapticService?.trigger("selection");

    const newSelection = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type];

    selectedTypes = newSelection;
    onSelectionChange?.(newSelection);
  }

  // Check if a type is selected
  function isSelected(type: ContentType): boolean {
    return selectedTypes.includes(type);
  }
</script>

<div class="content-type-selector">
  <h3 class="selector-title">Select Content to Share</h3>
  <p class="selector-description">
    Choose one or more items to include in your share package
  </p>

  <div class="content-types">
    {#each contentTypes as contentType}
      <button
        type="button"
        class="content-type-btn"
        class:selected={isSelected(contentType.type)}
        class:disabled={contentType.disabled}
        style:--type-color={contentType.color}
        onclick={() => toggleContentType(contentType.type, contentType.disabled)}
        aria-label="{contentType.disabled ? 'Coming soon: ' : ''}Toggle {contentType.label}"
        disabled={contentType.disabled}
      >
        <div class="type-checkbox">
          <i
            class="fas {isSelected(contentType.type) && !contentType.disabled
              ? 'fa-check-square'
              : 'fa-square'}"
          ></i>
        </div>

        <div class="type-icon">
          <i class={contentType.icon}></i>
        </div>

        <div class="type-info">
          <div class="type-label">
            {contentType.label}
            {#if contentType.comingSoon}
              <span class="coming-soon-badge">Soon</span>
            {/if}
          </div>
          <div class="type-description">{contentType.description}</div>
        </div>
      </button>
    {/each}
  </div>

  {#if selectedTypes.length === 0}
    <div class="warning-message">
      <i class="fas fa-exclamation-triangle"></i>
      Please select at least one content type to share
    </div>
  {/if}
</div>

<style>
  .content-type-selector {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .selector-title {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    letter-spacing: -0.01em;
  }

  .selector-description {
    margin: -8px 0 0 0;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.4;
  }

  .content-types {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .content-type-btn {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 16px;
    background: rgba(0, 0, 0, 0.3);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
    user-select: none;
    text-align: left;
    width: 100%;
  }

  .content-type-btn:hover:not(.disabled) {
    background: rgba(0, 0, 0, 0.4);
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateY(-1px);
  }

  .content-type-btn:active:not(.disabled) {
    transform: translateY(0);
  }

  .content-type-btn.selected:not(.disabled) {
    background: linear-gradient(
      135deg,
      var(--type-color),
      color-mix(in srgb, var(--type-color) 70%, black)
    );
    border-color: rgba(255, 255, 255, 0.8);
    border-width: 3px;
    box-shadow: 0 0 20px color-mix(in srgb, var(--type-color) 40%, transparent);
  }

  .content-type-btn.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .content-type-btn:focus-visible {
    outline: 3px solid rgba(59, 130, 246, 0.4);
    outline-offset: 2px;
  }

  .type-checkbox {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    line-height: 1;
    color: white;
    flex-shrink: 0;
  }

  .type-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    line-height: 1;
    color: white;
    flex-shrink: 0;
  }

  .type-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .type-label {
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.2px;
    line-height: 1.2;
    color: white;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .coming-soon-badge {
    display: inline-block;
    padding: 2px 8px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .type-description {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.3;
  }

  .warning-message {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.4);
    border-radius: 8px;
    color: rgba(255, 200, 200, 0.95);
    font-size: 13px;
    font-weight: 500;
  }

  .warning-message i {
    font-size: 16px;
    flex-shrink: 0;
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .content-type-btn {
      transition: none;
    }

    .content-type-btn:hover:not(.disabled),
    .content-type-btn:active:not(.disabled) {
      transform: none;
    }
  }
</style>
