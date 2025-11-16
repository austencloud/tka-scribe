<!-- IOSListItem.svelte - iOS-native list row component -->
<script lang="ts">
  import type { IHapticFeedbackService } from "$shared";
  import { resolve, TYPES } from "$shared";
  import { onMount } from "svelte";

  interface IOSListItemProps {
    title: string;
    subtitle?: string;
    icon?: string;
    accessory?: "disclosure" | "checkmark" | "none";
    isSelected?: boolean;
    disabled?: boolean;
    onSelect?: () => void;
    preview?: string; // Optional preview image/thumbnail
  }

  let {
    title,
    subtitle,
    icon,
    accessory = "disclosure",
    isSelected = false,
    disabled = false,
    onSelect,
    preview,
  } = $props<IOSListItemProps>();

  let hapticService: IHapticFeedbackService | null = null;

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  function handleClick() {
    if (disabled) return;

    // iOS uses selection haptic for list interactions
    hapticService?.trigger("selection");
    onSelect?.();
  }
</script>

<button
  class="ios-list-item"
  class:selected={isSelected}
  class:disabled={disabled}
  onclick={handleClick}
  disabled={disabled}
  type="button"
>
  <!-- Left Icon/Preview -->
  {#if preview}
    <div class="item-preview" aria-hidden="true">
      <img src={preview} alt="" />
    </div>
  {:else if icon}
    <div class="item-icon" aria-hidden="true">
      {@html icon}
    </div>
  {/if}

  <!-- Text Content -->
  <div class="item-content">
    <span class="item-title">{title}</span>
    {#if subtitle}
      <span class="item-subtitle">{subtitle}</span>
    {/if}
  </div>

  <!-- Right Accessory -->
  <div class="item-accessory" aria-hidden="true">
    {#if accessory === "checkmark" && isSelected}
      <i class="fas fa-check checkmark"></i>
    {:else if accessory === "disclosure"}
      <i class="fas fa-chevron-right disclosure"></i>
    {/if}
  </div>
</button>

<style>
  /* iOS List Item - HIG 2025 Specification */
  .ios-list-item {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 44px; /* iOS minimum touch target */
    padding: 11px 16px;
    background: transparent;
    border: none;
    border-bottom: 0.33px solid rgba(60, 60, 67, 0.36); /* iOS separator */
    width: 100%;
    text-align: left;
    cursor: pointer;
    transition: background-color 0.15s ease;
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
    position: relative;
  }

  /* Remove border from last item (handled by container) */
  .ios-list-item:last-child {
    border-bottom: none;
  }

  /* Hover State - Subtle iOS gray */
  .ios-list-item:hover:not(.disabled) {
    background: rgba(120, 120, 128, 0.08); /* iOS fill tertiary */
  }

  /* Active/Press State - iOS standard */
  .ios-list-item:active:not(.disabled) {
    background: rgba(120, 120, 128, 0.16); /* iOS fill secondary */
    transition: background-color 0s; /* Instant feedback */
  }

  /* Selected State */
  .ios-list-item.selected {
    background: rgba(0, 122, 255, 0.06); /* Subtle tint */
  }

  .ios-list-item.selected:hover:not(.disabled) {
    background: rgba(0, 122, 255, 0.1);
  }

  /* Disabled State */
  .ios-list-item.disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* Focus State for Keyboard Navigation */
  .ios-list-item:focus-visible {
    outline: none;
    background: rgba(0, 122, 255, 0.1);
  }

  .ios-list-item:focus-visible::before {
    content: "";
    position: absolute;
    inset: 2px;
    border-radius: 6px;
    border: 2px solid #007aff;
    pointer-events: none;
  }

  /* Left Icon */
  .item-icon {
    flex-shrink: 0;
    width: 29px;
    height: 29px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: rgba(235, 235, 245, 0.6); /* iOS label tertiary */
  }

  /* Left Preview Image */
  .item-preview {
    flex-shrink: 0;
    width: 60px;
    height: 45px;
    border-radius: 8px;
    overflow: hidden;
    background: rgba(120, 120, 128, 0.16); /* iOS fill secondary */
  }

  .item-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* Text Content */
  .item-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0; /* Allow text truncation */
  }

  .item-title {
    font-size: 17px; /* iOS body text size */
    font-weight: 400;
    color: rgba(255, 255, 255, 0.95); /* iOS label primary */
    letter-spacing: -0.41px; /* iOS tracking */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .item-subtitle {
    font-size: 15px; /* iOS footnote size */
    font-weight: 400;
    color: rgba(235, 235, 245, 0.6); /* iOS label tertiary */
    letter-spacing: -0.24px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Right Accessory */
  .item-accessory {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
  }

  /* Disclosure Indicator (›) */
  .disclosure {
    font-size: 14px;
    color: rgba(235, 235, 245, 0.3); /* iOS tertiary label, dimmed */
    font-weight: 600;
  }

  /* Checkmark (✓) */
  .checkmark {
    font-size: 17px;
    color: #007aff; /* iOS system blue */
    font-weight: 600;
  }

  /* Light Mode */
  @media (prefers-color-scheme: light) {
    .ios-list-item {
      border-bottom: 0.33px solid rgba(60, 60, 67, 0.36);
    }

    .ios-list-item:hover:not(.disabled) {
      background: rgba(120, 120, 128, 0.08);
    }

    .ios-list-item:active:not(.disabled) {
      background: rgba(120, 120, 128, 0.16);
    }

    .ios-list-item.selected {
      background: rgba(0, 122, 255, 0.06);
    }

    .ios-list-item.selected:hover:not(.disabled) {
      background: rgba(0, 122, 255, 0.1);
    }

    .item-icon {
      color: rgba(60, 60, 67, 0.6); /* iOS label tertiary light */
    }

    .item-title {
      color: rgba(0, 0, 0, 0.95); /* iOS label primary light */
    }

    .item-subtitle {
      color: rgba(60, 60, 67, 0.6); /* iOS label tertiary light */
    }

    .disclosure {
      color: rgba(60, 60, 67, 0.3);
    }

    .item-preview {
      background: rgba(120, 120, 128, 0.16);
    }
  }

  /* Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    .ios-list-item {
      transition: none;
    }
  }

  /* High Contrast */
  @media (prefers-contrast: high) {
    .ios-list-item {
      border-bottom: 0.5px solid rgba(255, 255, 255, 0.4);
    }

    .item-icon,
    .item-title {
      color: rgba(255, 255, 255, 0.95);
    }

    .item-subtitle,
    .disclosure {
      color: rgba(255, 255, 255, 0.7);
    }

    .checkmark {
      color: #0a84ff; /* Higher contrast blue */
    }
  }

  @media (prefers-contrast: high) and (prefers-color-scheme: light) {
    .ios-list-item {
      border-bottom: 0.5px solid rgba(0, 0, 0, 0.4);
    }

    .item-icon,
    .item-title {
      color: rgba(0, 0, 0, 0.95);
    }

    .item-subtitle,
    .disclosure {
      color: rgba(0, 0, 0, 0.7);
    }
  }
</style>
