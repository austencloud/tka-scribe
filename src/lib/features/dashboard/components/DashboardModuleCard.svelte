<script lang="ts">
  import { fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { ANIMATION_CONSTANTS } from "../domain/models/dashboard-config";
  import type { ModuleId } from "$lib/shared/navigation/domain/types";

  interface Props {
    id: ModuleId;
    label: string;
    description: string;
    icon: string;
    gradient: string;
    isLocked: boolean;
    index: number;
    onClick: (event: MouseEvent) => void;
  }

  const { id, label, description, icon, gradient, isLocked, index, onClick }: Props =
    $props();
</script>

<button
  class="module-card"
  class:locked={isLocked}
  style="--module-gradient: {gradient}"
  onclick={onClick}
  transition:fly={{
    y: ANIMATION_CONSTANTS.SLIDE.md,
    duration: ANIMATION_CONSTANTS.DURATION.normal,
    delay: 100 + index * ANIMATION_CONSTANTS.STAGGER.normal,
    easing: cubicOut,
  }}
>
  {#if isLocked}
    <div class="lock-badge" aria-label="Sign in required">
      <i class="fas fa-lock"></i>
    </div>
  {/if}
  <div class="module-icon">
    {@html icon}
  </div>
  <div class="module-text">
    <span class="module-label">{label}</span>
    <span class="module-desc">{description}</span>
  </div>
</button>

<style>
  .module-card {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    min-height: 140px;
    padding: 20px;
    background: var(--module-gradient);
    border: none;
    border-radius: 20px;
    cursor: pointer;
    transition:
      transform var(--duration-fast, 150ms)
        var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1)),
      box-shadow var(--duration-fast, 150ms)
        var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1));
    text-align: left;
    position: relative;
    overflow: hidden;
  }

  .module-card::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--theme-text, #ffffff) 18%, transparent) 0%,
      transparent 50%
    );
    pointer-events: none;
  }

  .module-card:hover {
    transform: translateY(var(--hover-lift-md, -2px))
      scale(var(--hover-scale-sm, 1.01));
    box-shadow: var(--theme-panel-shadow, 0 12px 32px rgba(0, 0, 0, 0.3));
  }

  .module-card:active {
    transform: scale(var(--active-scale, 0.98));
    transition-duration: 50ms;
  }

  .module-card:focus {
    outline: 3px solid color-mix(in srgb, var(--theme-text, #ffffff) 95%, transparent);
    outline-offset: 2px;
  }

  .module-card.locked {
    opacity: 0.7;
  }

  .module-card.locked::after {
    content: "";
    position: absolute;
    inset: 0;
    background: color-mix(in srgb, var(--theme-shadow, #000) 15%, transparent);
    border-radius: inherit;
    pointer-events: none;
  }

  .lock-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--theme-shadow, #000) 40%, transparent);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid color-mix(in srgb, var(--theme-stroke, rgba(255, 255, 255, 0.08)) 60%, transparent);
    border-radius: 8px;
    z-index: 2;
  }

  .lock-badge i {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.9);
  }

  .module-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    background: color-mix(in srgb, var(--theme-text, #ffffff) 20%, transparent);
    border-radius: 14px;
    font-size: 24px;
    color: white;
  }

  .module-icon :global(i) {
    color: white !important;
    -webkit-text-fill-color: white !important;
  }

  .module-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .module-label {
    font-size: 1.25rem;
    font-weight: 700;
    color: white;
  }

  .module-desc {
    font-size: 0.875rem;
    color: color-mix(in srgb, var(--theme-text, #ffffff) 85%, transparent);
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  @media (max-width: 768px) {
    .module-card {
      min-height: 120px;
      padding: 16px;
      border-radius: 16px;
    }

    .module-icon {
      width: 44px;
      height: 44px;
      font-size: 20px;
      border-radius: 12px;
    }

    .module-label {
      font-size: 1.125rem;
    }
  }

  @media (max-width: 480px) {
    .module-card {
      min-height: 100px;
      padding: 14px;
      gap: 10px;
    }

    .module-icon {
      width: 40px;
      height: 40px;
      font-size: 18px;
      border-radius: 10px;
    }

    .module-label {
      font-size: 1rem;
    }

    .module-desc {
      font-size: 0.75rem;
      -webkit-line-clamp: 1;
      line-clamp: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .module-card {
      transition: none;
    }

    .module-card:hover {
      transform: none;
    }
  }
</style>
