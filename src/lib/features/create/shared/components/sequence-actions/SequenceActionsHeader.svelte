<!--
  SequenceActionsHeader.svelte

  Mode toggle between "Turns" and "Transforms" with optional help button.
-->
<script lang="ts">
  type EditMode = "turns" | "transforms";

  interface Props {
    currentMode: EditMode;
    onModeChange: (mode: EditMode) => void;
    onShowHelp: () => void;
  }

  let { currentMode, onModeChange, onShowHelp }: Props = $props();
</script>

<div class="mode-toggle">
  <button class="mode-btn" class:active={currentMode === "turns"} onclick={() => onModeChange("turns")}>
    <i class="fas fa-sliders-h"></i>
    Turns
  </button>
  <button class="mode-btn" class:active={currentMode === "transforms"} onclick={() => onModeChange("transforms")}>
    <i class="fas fa-wand-magic-sparkles"></i>
    Transforms
  </button>
  {#if currentMode === "transforms"}
    <button class="help-btn" onclick={onShowHelp} aria-label="Learn about transforms">
      <i class="fas fa-circle-question"></i>
    </button>
  {/if}
</div>

<style>
  .mode-toggle {
    display: flex;
    gap: 4px;
    padding: 8px 12px;
    background: rgba(0, 0, 0, 0.2);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    flex-shrink: 0;
  }

  .mode-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 0 12px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid transparent;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.15s ease;
    height: 52px;
    min-width: 52px;
  }

  .mode-btn:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .mode-btn.active {
    background: rgba(6, 182, 212, 0.2);
    border-color: rgba(6, 182, 212, 0.5);
    color: #06b6d4;
  }

  .help-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    font-size: 18px;
    transition: all 0.15s ease;
    flex-shrink: 0;
  }

  .help-btn:hover {
    background: rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.9);
    border-color: rgba(255, 255, 255, 0.25);
  }

  @media (prefers-reduced-motion: reduce) {
    .mode-btn,
    .help-btn {
      transition: none;
    }
  }
</style>
