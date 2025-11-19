<!-- Module Button Component -->
<!-- Button for a module that can expand/collapse to show sections -->
<script lang="ts">
  import type { ModuleDefinition } from "../../domain/types";

  let { module, isActive, isExpanded, isCollapsed, onClick } = $props<{
    module: ModuleDefinition;
    isActive: boolean;
    isExpanded: boolean;
    isCollapsed: boolean;
    onClick: () => void;
  }>();

  const isDisabled = $derived(module.disabled ?? false);
</script>

<button
  class="module-button"
  class:active={isActive}
  class:expanded={isExpanded}
  class:disabled={isDisabled}
  class:sidebar-collapsed={isCollapsed}
  onclick={onClick}
  aria-label={module.label}
  aria-expanded={isExpanded}
  aria-current={isActive ? "page" : undefined}
  aria-disabled={isDisabled}
  disabled={isDisabled}
>
  <span class="module-icon">{@html module.icon}</span>
  {#if !isCollapsed}
    <span class="module-label">{module.label}</span>
    {#if isDisabled && module.disabledMessage}
      <span class="disabled-badge">{module.disabledMessage}</span>
    {:else}
      <span class="expand-icon">
        <i class="fas fa-chevron-{isExpanded ? 'down' : 'right'}"></i>
      </span>
    {/if}
  {/if}
</button>

<style>
  /* ============================================================================
     MODULE BUTTON
     ============================================================================ */
  .module-button {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: transparent;
    border: none;
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }

  .module-button.sidebar-collapsed {
    justify-content: center;
    padding: 10px 6px;
  }

  .module-button::before {
    content: "";
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.05);
    opacity: 0;
    transition: opacity 0.25s ease;
    border-radius: 12px;
  }

  .module-button:hover::before {
    opacity: 1;
  }

  .module-button:hover {
    color: rgba(255, 255, 255, 0.95);
    transform: translateX(2px);
  }

  /* Module buttons are just expand/collapse controls, not primary navigation */
  /* Keep them subtle - only tabs should have strong active states */
  .module-button.expanded {
    color: rgba(255, 255, 255, 0.85);
  }

  /* Active module indicator - shows which module you're currently in */
  .module-button.active {
    color: rgba(255, 255, 255, 0.95);
    position: relative;
  }

  .module-button.active::after {
    content: "";
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 60%;
    background: linear-gradient(
      135deg,
      rgba(103, 126, 234, 0.8) 0%,
      rgba(118, 75, 162, 0.8) 100%
    );
    border-radius: 0 2px 2px 0;
    box-shadow: 0 0 8px rgba(103, 126, 234, 0.4);
  }

  .module-button.sidebar-collapsed.active::after {
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60%;
    height: 3px;
    border-radius: 2px;
  }

  .module-icon {
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    transition: transform 0.25s ease;
  }

  .module-button:hover .module-icon {
    transform: scale(1.05);
  }

  .module-label {
    flex: 1;
    text-align: left;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  .expand-icon {
    font-size: 12px;
    opacity: 0.5;
    transition: all 0.25s ease;
  }

  .module-button.expanded .expand-icon {
    opacity: 0.8;
  }

  .module-button:hover .expand-icon {
    opacity: 1;
  }

  /* Disabled module styles */
  .module-button.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .module-button.disabled:hover {
    transform: none;
    color: rgba(255, 255, 255, 0.7);
  }

  .module-button.disabled::before {
    display: none;
  }

  .disabled-badge {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    padding: 2px 8px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.15);
    letter-spacing: 0.5px;
  }

  /* Focus styles for keyboard navigation */
  .module-button:focus-visible {
    outline: 2px solid rgba(102, 126, 234, 0.6);
    outline-offset: 2px;
  }

  /* ============================================================================
     ANIMATIONS & TRANSITIONS
     ============================================================================ */
  @media (prefers-reduced-motion: reduce) {
    * {
      transition: none !important;
      animation: none !important;
    }
  }
</style>
