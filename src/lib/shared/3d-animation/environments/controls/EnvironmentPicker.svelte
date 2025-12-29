<script lang="ts">
  /**
   * EnvironmentPicker
   *
   * UI control for selecting 3D environments.
   * Displays as a dropdown button in the scene overlay.
   */

  import { EnvironmentType } from "../domain/enums/environment-enums";
  import { environmentMetadata } from "../domain/models/environment-models";

  interface Props {
    /** Currently selected environment */
    value: EnvironmentType;
    /** Callback when environment changes */
    onchange: (type: EnvironmentType) => void;
  }

  let { value, onchange }: Props = $props();

  let isOpen = $state(false);

  function handleSelect(type: EnvironmentType) {
    onchange(type);
    isOpen = false;
  }

  function handleKeydown(event: KeyboardEvent, type: EnvironmentType) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSelect(type);
    }
  }

  function handleToggleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      isOpen = false;
    }
  }

  const currentEnv = $derived(
    environmentMetadata.find((e) => e.type === value) ?? environmentMetadata[0]
  );
</script>

<div class="env-picker" role="group" aria-label="Environment picker">
  <button
    class="env-toggle"
    onclick={() => (isOpen = !isOpen)}
    onkeydown={handleToggleKeydown}
    aria-expanded={isOpen}
    aria-haspopup="listbox"
  >
    <i class="fas {currentEnv.icon}" aria-hidden="true"></i>
    <span class="env-label">{currentEnv.name}</span>
    <i class="fas fa-chevron-down chevron" class:open={isOpen} aria-hidden="true"></i>
  </button>

  {#if isOpen}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
      class="env-dropdown"
      role="listbox"
      aria-label="Select environment"
      onclick={(e) => e.stopPropagation()}
    >
      {#each environmentMetadata as env}
        <button
          class="env-option"
          class:selected={env.type === value}
          role="option"
          aria-selected={env.type === value}
          onclick={() => handleSelect(env.type)}
          onkeydown={(e) => handleKeydown(e, env.type)}
        >
          <i class="fas {env.icon}" aria-hidden="true"></i>
          <div class="env-info">
            <span class="env-name">{env.name}</span>
            <span class="env-desc">{env.description}</span>
          </div>
        </button>
      {/each}
    </div>
  {/if}
</div>

<!-- Close dropdown when clicking outside -->
<svelte:window onclick={() => (isOpen = false)} />

<style>
  .env-picker {
    position: relative;
  }

  .env-toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    min-height: 48px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.08));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 8px;
    color: var(--theme-text, #ffffff);
    font-size: var(--font-size-sm, 14px);
    cursor: pointer;
    transition: all 0.15s;
  }

  .env-toggle:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.12));
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.2));
  }

  .env-label {
    font-weight: 500;
  }

  .chevron {
    font-size: 0.75rem;
    opacity: 0.7;
    transition: transform 0.2s;
  }

  .chevron.open {
    transform: rotate(180deg);
  }

  .env-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    min-width: 220px;
    background: var(--theme-panel-bg, rgba(18, 18, 28, 0.98));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 12px;
    padding: 0.5rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    z-index: 100;
  }

  .env-option {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.75rem;
    background: transparent;
    border: none;
    border-radius: 8px;
    color: var(--theme-text, #ffffff);
    text-align: left;
    cursor: pointer;
    transition: all 0.15s;
  }

  .env-option:hover {
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.08));
  }

  .env-option.selected {
    background: var(--theme-accent, #4f46e5);
  }

  .env-option i {
    font-size: 1rem;
    width: 20px;
    text-align: center;
    opacity: 0.8;
  }

  .env-info {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .env-name {
    font-size: var(--font-size-sm, 14px);
    font-weight: 500;
  }

  .env-desc {
    font-size: var(--font-size-xs, 12px);
    opacity: 0.6;
  }

  .env-option.selected .env-desc {
    opacity: 0.8;
  }
</style>
