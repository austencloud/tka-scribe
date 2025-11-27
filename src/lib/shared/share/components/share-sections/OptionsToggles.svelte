<script lang="ts">
  import type { IHapticFeedbackService } from "$shared";
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
    { key: "addDifficultyLevel" as const, label: "Difficulty", icon: "fa-signal" },
    { key: "includeStartPosition" as const, label: "Start Pos", icon: "fa-play-circle" },
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
        <label class="toggle-chip" class:active={shareState.options[option.key]}>
          <input
            type="checkbox"
            checked={shareState.options[option.key]}
            onchange={() => handleToggle(option.key)}
          />
          <i class="fas {option.icon}"></i>
          <span>{option.label}</span>
        </label>
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
    gap: clamp(5px, 0.8cqw, 8px);
    padding: clamp(6px, 0.9cqh, 10px) clamp(10px, 1.5cqw, 14px);
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    user-select: none;
  }

  .toggle-chip input[type="checkbox"] {
    display: none;
  }

  .toggle-chip i {
    font-size: clamp(10px, 1cqw, 12px);
    color: rgba(255, 255, 255, 0.45);
    transition: all 0.2s ease;
  }

  .toggle-chip span {
    font-size: clamp(11px, 1.1cqw, 13px);
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

  /* Compact on very narrow containers */
  @container options (max-width: 280px) {
    .toggle-chip {
      padding: 5px 10px;
    }

    .toggle-chip span {
      font-size: 10px;
    }

    .toggle-chip i {
      font-size: 9px;
    }
  }
</style>
