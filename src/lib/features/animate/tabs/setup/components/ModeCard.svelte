<script lang="ts">
  /**
   * ModeCard - Individual animation mode selection card
   *
   * Bento-style card with gradient background, icon, and metadata
   */

  import type { AnimateMode } from "$lib/features/animate/shared/state/animate-module-state.svelte";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";

  interface Props {
    mode: AnimateMode;
    icon: string;
    title: string;
    description: string;
    slotCount: number;
    gradient: string;
    onclick: () => void;
  }

  let { mode, icon, title, description, slotCount, gradient, onclick }: Props = $props();

  // Haptic feedback
  let hapticService: IHapticFeedbackService | undefined;

  try {
    hapticService = resolve<IHapticFeedbackService>(TYPES.IHapticFeedbackService);
  } catch (error) {
    console.warn("ModeCard: Failed to resolve HapticFeedbackService", error);
  }

  function handleClick() {
    hapticService?.trigger("selection");
    onclick();
  }
</script>

<button
  class="mode-card"
  style="--mode-gradient: {gradient}"
  onclick={handleClick}
  aria-label="Select {title} animation mode"
>
  <div class="mode-icon">
    <i class="fas {icon}"></i>
  </div>

  <div class="mode-content">
    <h3 class="mode-title">{title}</h3>
    <p class="mode-description">{description}</p>
  </div>

  <div class="mode-meta">
    <span class="slot-count">
      <i class="fas fa-layer-group"></i>
      {slotCount} {slotCount === 1 ? 'sequence' : 'sequences'}
    </span>
  </div>
</button>

<style>
  .mode-card {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    min-height: 160px;
    padding: 20px;
    background: var(--mode-gradient);
    border: none;
    border-radius: 20px;
    cursor: pointer;
    transition: transform var(--duration-fast, 150ms) var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1)),
                box-shadow var(--duration-fast, 150ms) var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1));
    text-align: left;
    position: relative;
    overflow: hidden;
  }

  .mode-card::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, transparent 50%);
    pointer-events: none;
  }

  .mode-card:hover {
    transform: translateY(var(--hover-lift-md, -2px)) scale(var(--hover-scale-sm, 1.01));
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
  }

  .mode-card:active {
    transform: scale(var(--active-scale, 0.98));
    transition-duration: 50ms;
  }

  .mode-card:focus {
    outline: 3px solid white;
    outline-offset: 2px;
  }

  .mode-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 14px;
    font-size: 24px;
    color: white;
    flex-shrink: 0;
  }

  .mode-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .mode-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 700;
    color: white;
    line-height: 1.2;
  }

  .mode-description {
    margin: 0;
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.85);
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .mode-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: auto;
  }

  .slot-count {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.875rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    background: rgba(255, 255, 255, 0.15);
    padding: 6px 12px;
    border-radius: 12px;
  }

  .slot-count i {
    font-size: 12px;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .mode-card {
      min-height: 140px;
      padding: 16px;
      border-radius: 16px;
    }

    .mode-icon {
      width: 44px;
      height: 44px;
      font-size: 20px;
      border-radius: 12px;
    }

    .mode-title {
      font-size: 1.125rem;
    }

    .mode-description {
      font-size: 0.8125rem;
      -webkit-line-clamp: 1;
      line-clamp: 1;
    }
  }

  @media (max-width: 480px) {
    .mode-card {
      min-height: 120px;
      padding: 14px;
      gap: 10px;
    }

    .mode-icon {
      width: 40px;
      height: 40px;
      font-size: 18px;
      border-radius: 10px;
    }

    .mode-title {
      font-size: 1rem;
    }

    .slot-count {
      font-size: 0.75rem;
      padding: 5px 10px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .mode-card {
      transition: none;
    }

    .mode-card:hover {
      transform: none;
    }
  }
</style>
