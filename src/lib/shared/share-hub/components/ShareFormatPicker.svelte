<!--
  ShareFormatPicker.svelte

  Grid of format selection cards (Image, Animation, Video, Composite).
  Staggered fade-in animation on mount.
-->
<script lang="ts">
  import FormatCard from './FormatCard.svelte';
  import { FORMAT_METADATA, getAllFormats } from '../utils/format-metadata';
  import type { ShareFormat } from '../domain/models/ShareFormat';

  let {
    onFormatSelect,
  }: {
    onFormatSelect: (format: ShareFormat) => void;
  } = $props();

  const formats = getAllFormats();
</script>

<div class="format-picker">
  <div class="header">
    <h2 class="title">Choose Export Format</h2>
    <p class="subtitle">Select how you'd like to share your sequence</p>
  </div>

  <div class="format-grid">
    {#each formats as format, index}
      <div class="card-wrapper" style:--delay="{index * 100}ms">
        <FormatCard
          format={FORMAT_METADATA[format]}
          onClick={() => onFormatSelect(format)}
        />
      </div>
    {/each}
  </div>
</div>

<style>
  .format-picker {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 24px;
    width: 100%;
    height: 100%;
    max-width: 900px;
    margin: 0 auto;
    overflow-y: auto;
  }

  .header {
    display: flex;
    flex-direction: column;
    gap: 8px;
    text-align: center;
    flex-shrink: 0;
  }

  .title {
    font-size: clamp(20px, 5cqi, 24px);
    font-weight: 700;
    color: var(--theme-text, white);
    margin: 0;
    letter-spacing: 0.5px;
  }

  .subtitle {
    font-size: clamp(13px, 3.5cqi, 14px);
    font-weight: 500;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
    margin: 0;
  }

  .format-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
    flex: 1;
    max-width: 700px;
    margin: 0 auto;
  }

  .card-wrapper {
    flex: 1;
    min-height: 120px;
    animation: fadeInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) both;
    animation-delay: var(--delay);
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Mobile optimization */
  @media (max-width: 600px) {
    .format-picker {
      padding: 16px;
      gap: 20px;
    }

    .format-grid {
      gap: 12px;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .card-wrapper {
      animation: none;
      opacity: 1;
      transform: none;
    }
  }
</style>
