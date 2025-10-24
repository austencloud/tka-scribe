<!--
Animator Tab Bar - Internal navigation for animator sub-modes
-->
<script lang="ts">
  import { resolve, TYPES, type IHapticFeedbackService } from "$shared";

  const hapticService = resolve<IHapticFeedbackService>(
    TYPES.IHapticFeedbackService
  );

  type AnimatorSubMode = "sequence-player" | "beat-constructor";

  interface AnimatorTab {
    id: AnimatorSubMode;
    label: string;
    icon: string;
    description: string;
  }

  let { activeSubMode, onSubModeChange } = $props<{
    activeSubMode: AnimatorSubMode;
    onSubModeChange: (subMode: AnimatorSubMode) => void;
  }>();

  const tabs: AnimatorTab[] = [
    {
      id: "sequence-player",
      label: "Sequence Player",
      icon: "🎬",
      description: "Animate complete sequences",
    },
    {
      id: "beat-constructor",
      label: "Beat Constructor",
      icon: "🔧",
      description: "Build and test individual beats",
    },
  ];

  function handleTabClick(subMode: AnimatorSubMode) {
    hapticService?.trigger("selection");
    onSubModeChange(subMode);
  }
</script>

<div class="animator-tab-bar">
  {#each tabs as tab}
    <button
      class="tab-button"
      class:active={activeSubMode === tab.id}
      onclick={() => handleTabClick(tab.id)}
      aria-label={tab.description}
      title={tab.description}
    >
      <span class="tab-icon">{tab.icon}</span>
      <span class="tab-label">{tab.label}</span>
    </button>
  {/each}
</div>

<style>
  .animator-tab-bar {
    display: flex;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: rgba(0, 0, 0, 0.2);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    overflow-x: auto;
    scrollbar-width: thin;
  }

  .tab-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9375rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .tab-button:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.9);
    transform: translateY(-1px);
  }

  .tab-button.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-color: rgba(255, 255, 255, 0.3);
    color: white;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  }

  .tab-button:focus-visible {
    outline: 2px solid #667eea;
    outline-offset: 2px;
  }

  .tab-icon {
    font-size: 1.125rem;
    line-height: 1;
  }

  .tab-label {
    font-weight: 500;
  }

  /* Mobile - icon only */
  @media (max-width: 768px) {
    .animator-tab-bar {
      padding: 0.5rem;
      gap: 0.375rem;
      justify-content: center;
    }

    .tab-button {
      padding: 0.625rem;
      min-width: 44px;
      justify-content: center;
    }

    .tab-label {
      display: none;
    }

    .tab-icon {
      font-size: 1.25rem;
    }
  }

  /* Tablet - show labels again */
  @media (min-width: 769px) and (max-width: 1024px) {
    .tab-button {
      padding: 0.625rem 1rem;
      gap: 0.375rem;
    }

    .tab-label {
      font-size: 0.875rem;
    }
  }
</style>
