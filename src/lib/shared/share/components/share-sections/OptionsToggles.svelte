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
    <div class="toggle-options-compact">
      <label class="toggle-option-compact">
        <input
          type="checkbox"
          checked={shareState.options.addWord}
          onchange={() => handleToggle("addWord")}
        />
        <span class="toggle-switch-compact"></span>
        <span class="toggle-label-compact">Word</span>
      </label>

      <label class="toggle-option-compact">
        <input
          type="checkbox"
          checked={shareState.options.addBeatNumbers}
          onchange={() => handleToggle("addBeatNumbers")}
        />
        <span class="toggle-switch-compact"></span>
        <span class="toggle-label-compact">Beats</span>
      </label>

      <label class="toggle-option-compact">
        <input
          type="checkbox"
          checked={shareState.options.addDifficultyLevel}
          onchange={() => handleToggle("addDifficultyLevel")}
        />
        <span class="toggle-switch-compact"></span>
        <span class="toggle-label-compact">Difficulty</span>
      </label>

      <label class="toggle-option-compact">
        <input
          type="checkbox"
          checked={shareState.options.includeStartPosition}
          onchange={() => handleToggle("includeStartPosition")}
        />
        <span class="toggle-switch-compact"></span>
        <span class="toggle-label-compact">Start Pos</span>
      </label>

      <label class="toggle-option-compact">
        <input
          type="checkbox"
          checked={shareState.options.addUserInfo}
          onchange={() => handleToggle("addUserInfo")}
        />
        <span class="toggle-switch-compact"></span>
        <span class="toggle-label-compact">User Info</span>
      </label>
    </div>
  </section>
{/if}

<style>
  .options-section {
    width: 100%;
  }

  .toggle-options-compact {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
    gap: clamp(8px, 1.2vh, 12px);
    width: 100%;
  }

  .toggle-option-compact {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(4px, 0.8vh, 6px);
    padding: clamp(8px, 1.2vh, 12px);
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    user-select: none;
  }

  .toggle-option-compact:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.12);
  }

  .toggle-option-compact input[type="checkbox"] {
    display: none;
  }

  .toggle-switch-compact {
    position: relative;
    width: 38px;
    height: 20px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 10px;
    transition: all 0.2s ease;
  }

  .toggle-switch-compact::after {
    content: "";
    position: absolute;
    top: 2px;
    left: 2px;
    width: 16px;
    height: 16px;
    background: white;
    border-radius: 50%;
    transition: all 0.2s ease;
  }

  .toggle-option-compact
    input[type="checkbox"]:checked
    + .toggle-switch-compact {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  }

  .toggle-option-compact
    input[type="checkbox"]:checked
    + .toggle-switch-compact::after {
    left: 20px;
  }

  .toggle-label-compact {
    font-size: clamp(11px, 1vw, 13px);
    font-weight: 500;
    color: var(--text-secondary);
    text-align: center;
  }

  .toggle-option-compact:hover .toggle-label-compact {
    color: var(--text-color);
  }
</style>
