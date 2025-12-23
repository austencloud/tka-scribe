<!--
  FormatCard.svelte

  Individual format selection card with icon, label, description, and gradient background.
  Glass morphism design with hover effects.
-->
<script lang="ts">
  import type { FormatMetadata } from '../domain/models/ShareFormat';

  let {
    format,
    onClick = () => {},
  }: {
    format: FormatMetadata;
    onClick?: () => void;
  } = $props();

  function handleClick() {
    console.log('🎯 FormatCard clicked:', format.label);
    onClick();
  }
</script>

<button
  class="format-card"
  style:--gradient-from={format.gradient.from}
  style:--gradient-to={format.gradient.to}
  onclick={handleClick}
  aria-label={`Share as ${format.label}: ${format.description}`}
>
  <div class="icon-container">
    <i class="fas {format.icon}"></i>
  </div>
  <div class="content">
    <h3 class="label">{format.label}</h3>
    <p class="description">{format.description}</p>
  </div>
</button>

<style>
  .format-card {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 16px;
    padding: 20px 24px;
    height: 100%;
    width: 100%;
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--gradient-from) 15%, transparent) 0%,
      color-mix(in srgb, var(--gradient-to) 12%, transparent) 100%
    );
    border: 1.5px solid color-mix(in srgb, var(--gradient-from) 30%, transparent);
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    box-shadow:
      0 2px 8px color-mix(in srgb, var(--gradient-from) 12%, transparent),
      0 0 16px color-mix(in srgb, var(--gradient-from) 8%, transparent),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(10px);
  }

  .format-card:hover {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--gradient-from) 25%, transparent) 0%,
      color-mix(in srgb, var(--gradient-to) 20%, transparent) 100%
    );
    border-color: color-mix(in srgb, var(--gradient-from) 50%, transparent);
    transform: translateY(-2px) scale(1.02);
    box-shadow:
      0 4px 16px color-mix(in srgb, var(--gradient-from) 20%, transparent),
      0 0 24px color-mix(in srgb, var(--gradient-from) 15%, transparent),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .format-card:active {
    transform: scale(0.98);
  }

  .icon-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    background: linear-gradient(
      135deg,
      var(--gradient-from) 0%,
      var(--gradient-to) 100%
    );
    border-radius: 16px;
    box-shadow: 0 4px 12px color-mix(in srgb, var(--gradient-from) 30%, transparent);
  }

  .icon-container i {
    font-size: 28px;
    color: white;
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 4px;
    text-align: left;
    flex: 1;
  }

  .label {
    font-size: clamp(16px, 4cqi, 18px);
    font-weight: 700;
    color: var(--theme-text, white);
    margin: 0;
    letter-spacing: 0.3px;
  }

  .description {
    font-size: clamp(13px, 3cqi, 14px);
    font-weight: 500;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
    margin: 0;
    line-height: 1.5;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .format-card {
      transition: none;
    }

    .format-card:hover,
    .format-card:active {
      transform: none;
    }
  }
</style>
