<!--
SequenceCardFavoriteButton - Favorite button component

Displays a star button that toggles favorite status.
Handles click events and accessibility.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { resolve, TYPES } from "$lib/shared/inversify/di";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";

  const { isFavorite = false, onToggle = () => {} } = $props<{
    isFavorite?: boolean;
    onToggle?: () => void;
  }>();

  let hapticService: IHapticFeedbackService | undefined;

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  function handleClick(e: MouseEvent) {
    e.stopPropagation();
    hapticService?.trigger("selection");
    onToggle();
  }
</script>

<div class="icon-slot">
  <button
    type="button"
    class="favorite"
    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    aria-pressed={isFavorite}
    onclick={handleClick}
  >
    {isFavorite ? "★" : "☆"}
  </button>
</div>

<style>
  .icon-slot {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .favorite {
    min-width: var(--min-touch-target);
    min-height: var(--min-touch-target);
    border: none;
    border-radius: 999px;
    background: color-mix(
      in srgb,
      var(--theme-panel-bg, #11111f) 70%,
      transparent
    );
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    color: var(--theme-text, white);
    font-size: 1.25rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px var(--theme-shadow, rgba(0, 0, 0, 0.3));
    transition:
      background 0.2s ease,
      transform 0.2s ease,
      box-shadow 0.2s ease;
  }

  .favorite:hover,
  .favorite:focus-visible {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.25));
    transform: scale(1.1);
    box-shadow: 0 6px 16px var(--theme-shadow, rgba(0, 0, 0, 0.4));
    outline: none;
  }

  .favorite:active {
    transform: scale(1.05);
  }

  /* Container query responsive sizing */
  @container sequence-card (max-width: 249px) {
    .favorite {
      min-width: 44px;
      min-height: 44px;
      font-size: 1rem;
    }
  }

  @container sequence-card (min-width: 250px) and (max-width: 299px) {
    .favorite {
      min-width: var(--min-touch-target);
      min-height: var(--min-touch-target);
      font-size: 1.15rem;
    }
  }
</style>
