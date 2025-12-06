<script lang="ts">
  /**
   * SettingsCategoryCard - Bento-style settings category card
   *
   * Modern solid gradient cards with bold visual identity
   * Replaces the 2021-era glass morphism approach
   */
  import { scale } from "svelte/transition";
  import { quintOut } from "svelte/easing";

  interface Props {
    id: string;
    title: string;
    icon: string;
    color: string;
    gradient: string;
    statusText: string;
    index?: number;
    onclick?: () => void;
    avatarUrl?: string | null;
  }

  let {
    id,
    title,
    icon,
    color,
    gradient,
    statusText,
    index = 0,
    onclick,
    avatarUrl,
  }: Props = $props();

  // Track avatar load errors to fallback to icon
  let avatarError = $state(false);
</script>

<button
  class="category-card"
  data-category-id={id}
  in:scale={{ delay: index * 60, duration: 350, easing: quintOut }}
  style="--category-gradient: {gradient}"
  {onclick}
>
  <!-- Gradient shine overlay -->
  <div class="card-shine"></div>

  <!-- Icon -->
  <div class="card-icon">
    {#if avatarUrl && !avatarError}
      <img
        src={avatarUrl}
        alt="Profile"
        class="card-avatar"
        crossorigin="anonymous"
        referrerpolicy="no-referrer"
        onerror={() => (avatarError = true)}
      />
    {:else}
      {@html icon}
    {/if}
  </div>

  <!-- Content -->
  <div class="card-content">
    <h3 class="card-title">{title}</h3>
    <p class="card-status">{statusText}</p>
  </div>
</button>

<style>
  /* Bento card - natural height, horizontal layout */
  .category-card {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: clamp(10px, 4cqi, 16px);
    width: 100%;
    padding: clamp(12px, 4cqi, 18px);
    background: var(--category-gradient);
    border: none;
    border-radius: clamp(12px, 4cqi, 16px);
    cursor: pointer;
    text-align: left;
    overflow: hidden;
    container-type: inline-size;
    container-name: card;
    transition:
      transform 150ms cubic-bezier(0.16, 1, 0.3, 1),
      box-shadow 150ms ease;
  }

  .category-card:hover {
    transform: translateY(-2px) scale(1.015);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  }

  .category-card:active {
    transform: scale(0.98);
    transition-duration: 50ms;
  }

  .category-card:focus-visible {
    outline: 2px solid white;
    outline-offset: 2px;
  }

  /* Subtle shine overlay */
  .card-shine {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.18) 0%,
      transparent 60%
    );
    pointer-events: none;
  }

  /* Icon */
  .card-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: clamp(36px, 14cqi, 50px);
    height: clamp(36px, 14cqi, 50px);
    background: rgba(255, 255, 255, 0.25);
    border-radius: clamp(10px, 3cqi, 14px);
    font-size: clamp(16px, 6cqi, 22px);
    color: white;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  .card-avatar {
    width: clamp(36px, 14cqi, 50px);
    height: clamp(36px, 14cqi, 50px);
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(255, 255, 255, 0.5);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  /* Content - tight grouping */
  .card-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    min-width: 0;
  }

  .card-title {
    margin: 0;
    font-size: clamp(0.875rem, 5cqi, 1.0625rem);
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.2;
  }

  .card-status {
    margin: 0;
    font-size: clamp(0.8125rem, 4.5cqi, 1rem);
    font-weight: 600;
    color: white;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Chevron - tap affordance */
  .category-card::after {
    content: "›";
    font-size: clamp(1.25rem, 6cqi, 1.75rem);
    font-weight: 300;
    color: rgba(255, 255, 255, 0.6);
    margin-left: auto;
    padding-left: 8px;
    transition: transform 150ms ease;
  }

  .category-card:hover::after {
    transform: translateX(3px);
    color: rgba(255, 255, 255, 0.9);
  }

  @media (prefers-reduced-motion: reduce) {
    .category-card {
      transition: none;
    }

    .category-card:hover {
      transform: none;
    }
  }
</style>
