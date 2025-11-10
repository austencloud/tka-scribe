<!--
SequenceCard.svelte

Prototype card for the Explore grid that focuses on a single primary action,
lightweight metadata, and a compact overflow menu for secondary operations.

Enhanced with Svelte 5 runes for reactive state management.
-->
<script lang="ts">
  import type { SequenceData } from "$shared";

  const {
    sequence,
    coverUrl = undefined,
    isFavorite = false,
    onPrimaryAction = () => {},
    onFavoriteToggle = () => {},
    onOverflowAction = () => {},
  }: {
    sequence: SequenceData;
    coverUrl?: string;
    isFavorite?: boolean;
    onPrimaryAction?: (sequence: SequenceData) => void;
    onFavoriteToggle?: (sequence: SequenceData) => void;
    onOverflowAction?: (action: string, sequence: SequenceData) => void;
  } = $props();

  // Extract image dimensions from metadata for layout shift prevention
  const imageDimensions = $derived({
    width: (sequence.metadata as any)?.width,
    height: (sequence.metadata as any)?.height,
  });

  let menuOpen = $state(false);
  let overflowId = $state(
    `sequence-menu-${sequence?.id ?? crypto.randomUUID()}-${Math.random().toString(36).slice(2, 6)}`
  );

  function handlePrimaryAction() {
    onPrimaryAction(sequence);
  }

  function handleFavoriteToggle() {
    onFavoriteToggle(sequence);
  }

  function handleOverflowClick() {
    menuOpen = !menuOpen;
  }

  function handleOverflowItem(action: string) {
    menuOpen = false;
    onOverflowAction(action, sequence);
  }

  function handleClickOutside(event: MouseEvent) {
    if (menuOpen && !(event.target as Element).closest(".icon-slot")) {
      menuOpen = false;
    }
  }

  const levelStyles: Record<number, { background: string; textColor: string }> =
    {
      1: {
        background: `linear-gradient(
        135deg,
        rgba(247, 249, 252, 0.98) 0%,
        rgba(232, 235, 240, 0.92) 40%,
        rgba(222, 228, 238, 0.9) 100%
      )`,
        textColor: "#0f172a",
      },
      2: {
        background: `linear-gradient(
        135deg,
        rgba(207, 216, 230, 0.95) 0%,
        rgba(175, 188, 209, 0.9) 45%,
        rgba(141, 154, 177, 0.88) 100%
      )`,
        textColor: "#f8fafc",
      },
      3: {
        background: `linear-gradient(
        135deg,
        rgba(255, 244, 214, 0.95) 0%,
        rgba(250, 221, 128, 0.9) 35%,
        rgba(236, 185, 67, 0.85) 70%,
        rgba(210, 149, 45, 0.8) 100%
      )`,
        textColor: "#1c1917",
      },
      4: {
        background: `linear-gradient(
        135deg,
        rgba(255, 229, 214, 0.95) 0%,
        rgba(247, 158, 129, 0.9) 40%,
        rgba(221, 88, 69, 0.85) 70%,
        rgba(163, 27, 45, 0.85) 100%
      )`,
        textColor: "#fff5f5",
      },
      5: {
        background: `linear-gradient(
        130deg,
        rgba(205, 180, 255, 0.95) 0%,
        rgba(124, 58, 237, 0.9) 45%,
        rgba(59, 130, 246, 0.85) 100%
      )`,
        textColor: "#f8fafc",
      },
    };

  const difficultyToLevel: Record<string, number> = {
    beginner: 1,
    intermediate: 2,
    advanced: 3,
    mythic: 4,
    legendary: 5,
  };

  const defaultStyle = {
    background: "linear-gradient(135deg, #1f2937, #111827)",
    textColor: "#f8fafc",
  };

  // Derived reactive values using $derived
  const sequenceLevel = $derived(
    sequence?.level ??
      difficultyToLevel[sequence?.difficultyLevel?.toLowerCase?.() ?? ""] ??
      0
  );

  const levelStyle = $derived(levelStyles[sequenceLevel] ?? defaultStyle);

  // Truncate title to 16 characters (excluding dashes)
  const displayTitle = $derived(() => {
    const word = sequence?.word ?? "";
    const withoutDashes = word.replace(/-/g, "");

    if (withoutDashes.length <= 16) {
      return word; // Return original including dashes
    }

    // Truncate to 16 non-dash characters
    let charCount = 0;
    let result = "";

    for (const char of word) {
      if (char === "-") {
        result += char;
      } else {
        if (charCount < 16) {
          result += char;
          charCount++;
        } else {
          break;
        }
      }
    }

    return result + "…";
  });

  // Effect to close menu when clicking outside
  $effect(() => {
    if (menuOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }
    return undefined;
  });
</script>

<article class="sequence-card">
  <div class="media">
    {#if coverUrl}
      <img
        src={coverUrl}
        alt={`Preview of ${sequence.word}`}
        width={imageDimensions.width}
        height={imageDimensions.height}
        loading="lazy"
      />
    {:else}
      <div class="media-placeholder" aria-label="Sequence preview missing">
        <span>{sequence.word.slice(0, 1) ?? "?"}</span>
      </div>
    {/if}
  </div>

  <div
    class="metadata"
    style="background: {levelStyle.background}; color: {levelStyle.textColor};"
  >
    <div class="title-row">
      <p class="title" title={sequence.word}>{displayTitle()}</p>
    </div>

    <div class="actions-row">
      <div class="icon-slot">
        <button
          type="button"
          class="overflow"
          aria-haspopup="true"
          aria-expanded={menuOpen}
          aria-controls={overflowId}
          onclick={handleOverflowClick}
        >
          ⋮
        </button>

        {#if menuOpen}
          <ul class="menu" role="menu" id={overflowId}>
            <li role="presentation">
              <button
                role="menuitem"
                onclick={() => handleOverflowItem("edit")}
              >
                Edit
              </button>
            </li>
            <li role="presentation">
              <button
                role="menuitem"
                onclick={() => handleOverflowItem("animate")}
              >
                Animate
              </button>
            </li>
            <li role="presentation">
              <button
                role="menuitem"
                onclick={() => handleOverflowItem("delete")}
              >
                Delete
              </button>
            </li>
          </ul>
        {/if}
      </div>

      <div class="primary-slot">
        <button
          type="button"
          class="primary-action"
          aria-label="Play sequence preview"
          onclick={handlePrimaryAction}
        >
          ▶ Play
        </button>
      </div>

      <div class="icon-slot">
        <button
          type="button"
          class="favorite"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={isFavorite}
          onclick={handleFavoriteToggle}
        >
          {isFavorite ? "★" : "☆"}
        </button>
      </div>
    </div>
  </div>
</article>

<style>
  .sequence-card {
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    background: rgba(8, 8, 12, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: #fff;
    display: flex;
    flex-direction: column;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
    max-width: 360px;
    height: 100%; /* Fill grid cell height */

    /* Enable container queries */
    container-type: inline-size;
    container-name: sequence-card;
  }

  .primary-action {
    width: 160px;
    min-height: 48px;
    border-radius: 999px;
    border: none;
    background: rgba(255, 255, 255, 0.95);
    color: #111;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
  }

  .primary-action:hover,
  .primary-action:focus-visible {
    transform: scale(1.05);
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.4);
    outline: none;
  }

  .primary-action:active {
    transform: scale(0.98);
  }

  .favorite {
    min-width: 44px;
    min-height: 44px;
    border: none;
    border-radius: 999px;
    background: rgba(17, 17, 23, 0.7);
    color: #fff;
    font-size: 1.25rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
      background 0.2s ease,
      transform 0.2s ease;
  }

  .overflow {
    min-width: 44px;
    min-height: 44px;
    border: none;
    border-radius: 999px;
    background: rgba(17, 17, 23, 0.7);
    color: #fff;
    font-size: 1.5rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
      background 0.2s ease,
      transform 0.2s ease;
  }

  .favorite:hover,
  .favorite:focus-visible,
  .overflow:hover,
  .overflow:focus-visible {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
    outline: none;
  }

  .favorite:active,
  .overflow:active {
    transform: translateY(0);
  }

  /* Desktop refinement for larger viewports - works with container queries */
  @media (min-width: 768px) {
    .sequence-card {
      /* Allow card to adapt to larger grid cells */
      max-width: 100%;
    }
  }

  .metadata {
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .title-row {
    display: flex;
    justify-content: center;
  }

  .title {
    font-size: 1.35rem;
    font-weight: 700;
    text-align: center;
    margin: 0;
    line-height: 1.2;
  }

  /* Container queries for responsive sizing */
  /* Small containers: compact sizing */
  @container sequence-card (max-width: 249px) {
    .title {
      font-size: 1rem;
    }

    .primary-action {
      width: 120px;
      min-height: 40px;
      font-size: 0.9rem;
    }

    .actions-row {
      grid-template-columns: 36px 1fr 36px;
      gap: 8px;
    }

    .favorite,
    .overflow {
      min-width: 36px;
      min-height: 36px;
      font-size: 1rem;
    }

    .overflow {
      font-size: 1.2rem;
    }

    .metadata {
      padding: 10px;
      gap: 6px;
    }

    .media-placeholder {
      font-size: 2.5rem;
    }
  }

  /* Medium containers: balanced sizing */
  @container sequence-card (min-width: 250px) and (max-width: 299px) {
    .title {
      font-size: 1.15rem;
    }

    .primary-action {
      width: 140px;
      min-height: 44px;
      font-size: 0.95rem;
    }

    .actions-row {
      grid-template-columns: 40px 1fr 40px;
      gap: 10px;
    }

    .favorite,
    .overflow {
      min-width: 40px;
      min-height: 40px;
    }

    .overflow {
      font-size: 1.35rem;
    }

    .favorite {
      font-size: 1.15rem;
    }

    .metadata {
      padding: 11px;
      gap: 7px;
    }

    .media-placeholder {
      font-size: 3.25rem;
    }
  }

  /* Large containers: default sizing (300px+) already defined above */
  @container sequence-card (min-width: 300px) {
    .title {
      font-size: 1.35rem;
    }

    .primary-action {
      width: 160px;
      min-height: 48px;
      font-size: 1rem;
    }
  }

  .media {
    position: relative;
    width: 100%;
    background: rgba(255, 255, 255, 0.05);
    /* Flex-grow to fill available space and push metadata to bottom */
    flex: 1;
    min-height: 0; /* Allow flexbox to shrink if needed */
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .media img {
    width: 100%;
    height: auto;
    display: block;
    max-width: 100%; /* Ensure image never exceeds container width */
  }

  .media-placeholder {
    width: 100%;
    aspect-ratio: 4 / 3;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #1f2937, #111827);
    font-size: 4rem;
    font-weight: 700;
  }

  .actions-row {
    display: grid;
    grid-template-columns: 44px 1fr 44px;
    align-items: center;
    gap: 12px;
  }

  .icon-slot {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .primary-slot {
    display: flex;
    justify-content: center;
  }

  .menu {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    background: rgba(10, 10, 14, 0.98);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    list-style: none;
    padding: 6px;
    margin: 0;
    min-width: 160px;
    z-index: 10;
    animation: menuSlideIn 0.15s ease-out;
  }

  @keyframes menuSlideIn {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .menu button {
    width: 100%;
    background: transparent;
    color: #fff;
    border: none;
    padding: 10px 14px;
    text-align: left;
    cursor: pointer;
    border-radius: 8px;
    font-size: 0.95rem;
    transition: background 0.15s ease;
  }

  .menu button:hover,
  .menu button:focus-visible {
    background: rgba(255, 255, 255, 0.12);
    outline: 2px solid rgba(255, 255, 255, 0.2);
    outline-offset: -2px;
  }

  .menu button:active {
    background: rgba(255, 255, 255, 0.08);
  }

  /* Badges removed */
</style>
