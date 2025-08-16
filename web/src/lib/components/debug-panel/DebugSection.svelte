<script lang="ts">
  import type { StepStatus } from "./stepManager";

  interface Props {
    title: string;
    stepNumber?: number;
    status?: StepStatus;
    icon?: string;
    isExpanded?: boolean;
    isVisible?: boolean;
    onToggle?: () => void;
    children?: any;
  }

  let {
    title,
    stepNumber,
    status,
    icon = "📄",
    isExpanded = false,
    isVisible = true,
    onToggle = () => {},
    children,
  }: Props = $props();

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onToggle();
    }
  }

  function getStatusClass(status?: StepStatus): string {
    if (!status) return "";
    return `status-${status}`;
  }
</script>

{#if isVisible}
  <section
    class="debug-section {stepNumber !== undefined ? 'step-section' : ''}"
    data-status={status}
  >
    <div
      class="section-header {getStatusClass(status)}"
      onclick={onToggle}
      onkeydown={handleKeydown}
      role="button"
      tabindex="0"
      aria-expanded={isExpanded}
    >
      <h3>
        {icon}
        {#if stepNumber !== undefined}
          Step {stepNumber}:
        {/if}
        {title}
      </h3>

      {#if status}
        <span class="step-status {getStatusClass(status)}">{status}</span>
      {/if}

      <span class="toggle-icon {isExpanded ? 'expanded' : ''}">▼</span>
    </div>

    {#if isExpanded}
      <div class="section-content">
        {@render children()}
      </div>
    {/if}
  </section>
{/if}

<style>
  .debug-section {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    margin-bottom: 16px;
    overflow: hidden;
    transition: all 0.2s ease;
  }

  .step-section[data-status="current"] {
    border-color: rgba(251, 191, 36, 0.5);
    box-shadow: 0 0 10px rgba(251, 191, 36, 0.2);
  }

  .step-section[data-status="completed"] {
    border-color: rgba(34, 197, 94, 0.5);
  }

  .step-section[data-status="pending"] {
    opacity: 0.7;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    cursor: pointer;
    background: rgba(0, 0, 0, 0.2);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    transition: background-color 0.2s ease;
  }

  .section-header:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .section-header:focus {
    outline: 2px solid rgba(167, 139, 250, 0.5);
    outline-offset: -2px;
  }

  .section-header h3 {
    margin: 0;
    color: #e2e8f0;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .step-status {
    padding: 4px 12px;
    border-radius: 16px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .status-completed {
    background: rgba(34, 197, 94, 0.2);
    color: #22c55e;
    border: 1px solid rgba(34, 197, 94, 0.3);
  }

  .status-current {
    background: rgba(251, 191, 36, 0.2);
    color: #fbbf24;
    border: 1px solid rgba(251, 191, 36, 0.3);
  }

  .status-pending {
    background: rgba(148, 163, 184, 0.2);
    color: #94a3b8;
    border: 1px solid rgba(148, 163, 184, 0.3);
  }

  .toggle-icon {
    transition: transform 0.2s ease;
    color: #94a3b8;
    font-size: 0.9rem;
  }

  .toggle-icon.expanded {
    transform: rotate(180deg);
  }

  .section-content {
    padding: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }
</style>
