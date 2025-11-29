<script lang="ts">
  import { BackgroundType } from "$lib/shared/background";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import { resolve } from "../../../inversify/container";
  import { TYPES } from "../../../inversify/types";
  import { onMount } from "svelte";
  import { spring } from "svelte/motion";
  import type { BackgroundMetadata } from "../tabs/background/background-config";

  interface Props {
    background: BackgroundMetadata;
    selected?: boolean;
    onSelect?: (type: BackgroundType) => void;
  }

  let { background, selected = false, onSelect }: Props = $props();

  // Services
  let hapticService: IHapticFeedbackService;

  // 3D rotation spring for smooth animation
  const rotateY = spring(0, { stiffness: 0.3, damping: 0.4 });
  const rotateX = spring(0, { stiffness: 0.3, damping: 0.4 });

  // Track mouse position for 3D tilt
  let tiltX = $state(0);
  let tiltY = $state(0);

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  function handleMouseMove(event: MouseEvent) {
    const card = event.currentTarget as HTMLElement;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate tilt based on mouse position (max 10 degrees)
    tiltY = ((x - centerX) / centerX) * 10;
    tiltX = ((centerY - y) / centerY) * 10;

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
    hapticService?.trigger("selection");
    onSelect?.(background.type);
  }
</script>

<button
  class="background-large-card settings-glass-card"
  class:selected
  style="transform: perspective(1000px) rotateX({$rotateX}deg) rotateY({$rotateY}deg) scale({selected
    ? 1.03
    : 1})"
  onmousemove={handleMouseMove}
  onmouseleave={handleMouseLeave}
  onclick={handleClick}
  aria-label="Select {background.name}"
  aria-pressed={selected}
>
  <!-- Background preview (large size: 320x200px) -->
  <div
    class="background-preview"
    style={background.color
      ? `background: ${background.color};`
      : background.colors
        ? `background: linear-gradient(${background.direction || 135}deg, ${background.colors.join(", ")});`
        : ""}
  >
    <!-- Animated overlay pattern for texture -->
    <div class="preview-pattern"></div>
  </div>

  <!-- Content overlay with glassmorphic background -->
  <div class="card-content">
    <div class="card-icon">
      {@html background.icon}
    </div>
    <div class="card-info">
      <h4 class="card-name">{background.name}</h4>
      <p class="card-description">{background.description}</p>
    </div>

    {#if selected}
      <div class="selected-badge">
        <i class="fas fa-check"></i>
      </div>
    {/if}
  </div>

  <!-- Selection ring -->
  {#if selected}
    <div class="selection-ring"></div>
  {/if}
</button>

<style>
  .background-large-card {
    position: relative;
    width: 320px;
    height: 200px;
    cursor: pointer;
    border-radius: var(--settings-radius-lg);
    overflow: hidden;
    transform-style: preserve-3d;
    transition: all var(--settings-transition-base) var(--settings-ease-out);
    border: 2px solid var(--settings-glass-border);
    padding: 0;
  }

  .background-large-card:hover {
    border-color: var(--settings-glass-border-hover);
    box-shadow: var(--settings-shadow-xl), var(--settings-shadow-primary);
    transform: perspective(1000px) rotateX(var(--tilt-x, 0deg))
      rotateY(var(--tilt-y, 0deg)) scale(1.03);
  }

  .background-large-card.selected {
    border-color: transparent;
    box-shadow:
      var(--settings-shadow-xl), var(--settings-shadow-primary-strong);
  }

  .background-large-card:focus-visible {
    outline: 2px solid var(--settings-primary-indigo);
    outline-offset: 4px;
  }

  /* Background preview */
  .background-preview {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  .preview-pattern {
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      rgba(255, 255, 255, 0.02) 10px,
      rgba(255, 255, 255, 0.02) 20px
    );
    opacity: 0;
    transition: opacity var(--settings-transition-base);
  }

  .background-large-card:hover .preview-pattern {
    opacity: 1;
  }

  /* Card content overlay */
  .card-content {
    position: relative;
    z-index: 2;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: var(--settings-space-lg);
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.8) 0%,
      rgba(0, 0, 0, 0.4) 50%,
      transparent 100%
    );
    gap: var(--settings-space-xs);
    transform: translateZ(10px); /* 3D depth */
  }

  .card-icon {
    font-size: 32px;
    color: white;
    filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.5));
    margin-bottom: var(--settings-space-xs);
  }

  .card-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .card-name {
    font-size: var(--settings-font-size-h4);
    font-weight: var(--settings-font-weight-bold);
    color: white;
    margin: 0;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
    letter-spacing: var(--settings-letter-spacing-normal);
  }

  .card-description {
    font-size: var(--settings-font-size-caption);
    font-weight: var(--settings-font-weight-medium);
    color: rgba(255, 255, 255, 0.9);
    margin: 0;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
    letter-spacing: var(--settings-letter-spacing-wide);
  }

  .selected-badge {
    position: absolute;
    top: var(--settings-space-md);
    right: var(--settings-space-md);
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--settings-gradient-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    animation: badge-pop 0.3s var(--settings-ease-spring);
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
    border: 3px solid var(--settings-primary-indigo);
    border-radius: var(--settings-radius-lg);
    pointer-events: none;
    animation: pulse-ring 2s ease-in-out infinite;
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.6);
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
    .background-large-card {
      width: 100%;
      max-width: 320px;
      height: 180px;
    }

    .card-content {
      padding: var(--settings-space-md);
    }

    .card-icon {
      font-size: 28px;
    }

    .card-name {
      font-size: var(--settings-font-size-body);
    }

    .card-description {
      font-size: 11px;
    }

    /* Disable 3D tilt on mobile for performance */
    .background-large-card:hover {
      transform: scale(1.03);
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .background-large-card,
    .preview-pattern,
    .selected-badge,
    .selection-ring {
      animation: none !important;
      transition: none !important;
    }

    .background-large-card:hover {
      transform: none;
    }
  }
</style>
