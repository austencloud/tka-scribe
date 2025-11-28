<script lang="ts">
  import type { IHapticFeedbackService } from "../../../application/services/contracts/IHapticFeedbackService";
  import type { createShareState } from "../../state";

  let {
    shareState,
    hapticService = null,
  }: {
    shareState: ReturnType<typeof createShareState> | null;
    hapticService: IHapticFeedbackService | null;
  } = $props();

  const toggleOptions = [
    { key: "addWord" as const, label: "Word", icon: "fa-font" },
    { key: "addBeatNumbers" as const, label: "Beats", icon: "fa-list-ol" },
    {
      key: "addDifficultyLevel" as const,
      label: "Difficulty",
      icon: "fa-signal",
    },
    {
      key: "includeStartPosition" as const,
      label: "Start Pos",
      icon: "fa-play-circle",
    },
    { key: "addUserInfo" as const, label: "User Info", icon: "fa-user" },
  ];

  function handleToggle(
    key: keyof NonNullable<ReturnType<typeof createShareState>>["options"]
  ) {
    hapticService?.trigger("selection");
    if (!shareState) return;
    shareState.updateOptions({ [key]: !shareState.options[key] });
  }
</script>

{#if shareState?.options}
  <section class="options-section">
    <h4 class="options-heading">Include in Export</h4>
    <div class="toggle-options-grid">
      {#each toggleOptions as option}
        <button
          type="button"
          class="toggle-chip"
          class:active={shareState.options[option.key]}
          onclick={() => handleToggle(option.key)}
          aria-pressed={shareState.options[option.key]}
        >
          <i class="fas {option.icon}"></i>
          <span>{option.label}</span>
        </button>
      {/each}
    </div>
  </section>
{/if}

<style>
  .options-section {
    width: 100%;
    container-type: inline-size;
    container-name: options;
  }

  .options-heading {
    margin: 0 0 clamp(8px, 1.2cqw, 12px) 0;
    font-size: clamp(10px, 1cqw, 12px);
    font-weight: 600;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .toggle-options-grid {
    display: flex;
    flex-wrap: wrap;
    gap: clamp(6px, 1cqw, 10px);
    width: 100%;
  }

  .toggle-chip {
    display: flex;
    align-items: center;
    gap: clamp(6px, 0.8cqw, 8px);
    padding: clamp(14px, 1.4cqh, 16px) clamp(16px, 2cqw, 20px);
    min-height: 48px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 24px;
    cursor: pointer;
    transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
    user-select: none;
    font-family: inherit;
    outline: none;
  }

  .toggle-chip:focus-visible {
    outline: 2px solid rgba(59, 130, 246, 0.6);
    outline-offset: 2px;
  }

  .toggle-chip i {
    font-size: clamp(11px, 1.1cqw, 13px);
    color: rgba(255, 255, 255, 0.45);
    transition: all 0.2s ease;
  }

  .toggle-chip span {
    font-size: clamp(12px, 1.2cqw, 14px);
    font-weight: 500;
    color: rgba(255, 255, 255, 0.6);
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .toggle-chip:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.15);
  }

  .toggle-chip:hover i,
  .toggle-chip:hover span {
    color: rgba(255, 255, 255, 0.85);
  }

  /* Active state */
  .toggle-chip.active {
    background: linear-gradient(
      135deg,
      rgba(59, 130, 246, 0.2) 0%,
      rgba(59, 130, 246, 0.1) 100%
    );
    border-color: rgba(59, 130, 246, 0.4);
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
  }

  .toggle-chip.active i {
    color: #60a5fa;
  }

  .toggle-chip.active span {
    color: rgba(255, 255, 255, 0.95);
    font-weight: 600;
  }

  .toggle-chip:active {
    transform: scale(0.96);
  }

  /* Compact on very narrow containers - still maintain accessibility */
  @container options (max-width: 280px) {
    .toggle-chip {
      padding: 12px 14px;
      min-height: 48px;
    }

    .toggle-chip span {
      font-size: 11px;
    }

    .toggle-chip i {
      font-size: 10px;
    }
  }
</style>
