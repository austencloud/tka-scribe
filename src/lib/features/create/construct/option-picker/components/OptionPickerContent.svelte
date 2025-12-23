<!--
OptionPickerContent.svelte - Content layout for option picker

Single responsibility: Organize prepared options into sections and layout.
Uses organizer and sizer services for section grouping and sizing.
-->
<script lang="ts">
  import type { PreparedPictographData } from '../services/PictographPreparer';
  import type { IOptionOrganizer } from '../services/contracts/IOptionOrganizer';
  import type { IOptionSizer } from '../services/contracts/IOptionSizer';
  import OptionSection from './OptionSection.svelte';

  interface Props {
    options: PreparedPictographData[];
    organizerService: IOptionOrganizer | null;
    sizerService: IOptionSizer | null;
    isFading?: boolean;
    onSelect: (option: PreparedPictographData) => void;
  }

  const {
    options,
    organizerService,
    sizerService,
    isFading = false,
    onSelect
  }: Props = $props();

  // Track container dimensions with simple resize observer
  let containerElement: HTMLDivElement | null = $state(null);
  let containerWidth = $state(400);
  let containerHeight = $state(600);
  let sizingStable = $state(false);

  // Mobile detection based on width
  const isMobile = $derived(containerWidth < 768);
  const columns = $derived(isMobile ? 4 : 8);

  // Organize options into sections
  const organizedSections = $derived(() => {
    if (!organizerService || options.length === 0) {
      return [];
    }
    return organizerService.organizePictographs(options, 'type');
  });

  // Calculate sizing - use stable values
  const sizing = $derived(() => {
    // Use reasonable defaults until stable
    if (!sizingStable || !sizerService) {
      return { cardSize: 80, columns: columns, gap: '8px' };
    }

    try {
      const result = sizerService.calculatePictographSize({
        count: options.length,
        containerWidth: containerWidth,
        containerHeight: containerHeight,
        columns: columns,
        isMobileDevice: isMobile
      });

      return {
        cardSize: Math.max(60, Math.min(120, result.pictographSize)),
        columns: columns,
        gap: result.gridGap
      };
    } catch {
      return { cardSize: 80, columns: columns, gap: '8px' };
    }
  });

  // Simple resize observer - only update after stable
  $effect(() => {
    if (!containerElement) return;

    let timeoutId: number;
    const observer = new ResizeObserver((entries) => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        const entry = entries[0];
        if (entry) {
          const w = entry.contentRect.width;
          const h = entry.contentRect.height;
          if (w > 100 && h > 100) {
            containerWidth = w;
            containerHeight = h;
            sizingStable = true;
          }
        }
      }, 100); // Debounce 100ms
    });

    observer.observe(containerElement);

    // Initial measurement
    const rect = containerElement.getBoundingClientRect();
    if (rect.width > 100 && rect.height > 100) {
      containerWidth = rect.width;
      containerHeight = rect.height;
      sizingStable = true;
    }

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  });
</script>

<div class="option-picker-content" bind:this={containerElement}>
  {#if options.length === 0}
    <div class="empty-state">
      <p>No options available</p>
    </div>
  {:else}
    <div class="sections-container">
      {#each organizedSections() as section (section.title)}
        <OptionSection
          letterType={section.title}
          options={section.pictographs}
          cardSize={sizing().cardSize}
          columns={sizing().columns}
          gap={sizing().gap}
          showHeader={organizedSections().length > 1}
          {isFading}
          {onSelect}
        />
      {/each}
    </div>
  {/if}
</div>

<style>
  .option-picker-content {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    container-type: size;
  }

  .sections-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 8px;
  }

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--text-muted, #888);
    font-size: var(--font-size-min, 14px);
  }
</style>
