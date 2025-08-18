<script lang="ts">
  import type { ArrowDebugState } from "../../types/ArrowDebugTypes";

  interface Props {
    sectionId: string;
    title: string;
    state: ArrowDebugState;
    stepNumber?: number;
    stepStatus?: "completed" | "current" | "pending";
    children?: any;
  }

  let { sectionId, title, state, stepNumber, stepStatus, children }: Props =
    $props();

  function handleToggle() {
    state.toggleSection(sectionId);
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleToggle();
    }
  }

  const isExpanded = $derived(state.expandedSections.has(sectionId));
  const sectionClasses = $derived(() => {
    let classes = "debug-section";
    if (stepNumber !== undefined) {
      classes += " step-section";
    }
    return classes;
  });
</script>

<section class={sectionClasses} data-status={stepStatus}>
  <div
    class="section-header"
    onclick={handleToggle}
    onkeydown={handleKeyDown}
    role="button"
    tabindex="0"
    aria-expanded={isExpanded}
  >
    <h3>{title}</h3>
    <div class="toggle-icon {isExpanded ? 'expanded' : ''}">▼</div>
  </div>

  {#if isExpanded}
    <div class="section-content">
      {@render children?.()}
    </div>
  {/if}
</section>

<style>
  .debug-section {
    background: rgba(30, 41, 59, 0.8);
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 8px;
    margin-bottom: 12px;
    overflow: hidden;
    transition: all 0.2s ease;
  }

  .step-section[data-status="completed"] {
    border-color: rgba(34, 197, 94, 0.4);
    background: rgba(34, 197, 94, 0.05);
  }

  .step-section[data-status="current"] {
    border-color: rgba(251, 191, 36, 0.6);
    background: rgba(251, 191, 36, 0.1);
    box-shadow: 0 0 20px rgba(251, 191, 36, 0.2);
  }

  .step-section[data-status="pending"] {
    opacity: 0.6;
    border-color: rgba(148, 163, 184, 0.2);
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    user-select: none;
  }

  .section-header:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .section-header h3 {
    margin: 0;
    color: #e2e8f0;
    font-size: 1rem;
    font-weight: 600;
  }

  .toggle-icon {
    color: #94a3b8;
    transition: transform 0.2s ease;
    font-size: 0.8rem;
  }

  .toggle-icon.expanded {
    transform: rotate(180deg);
  }

  .section-content {
    padding: 16px;
    border-top: 1px solid rgba(148, 163, 184, 0.1);
    background: rgba(0, 0, 0, 0.2);
  }
</style>
