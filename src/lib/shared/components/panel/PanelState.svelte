<script lang="ts">
  /**
   * PanelState - Loading, error, and empty state component
   *
   * Provides consistent state displays across panels.
   */

  import PanelSpinner from "./PanelSpinner.svelte";

  type StateType = "loading" | "error" | "empty" | "info";

  interface Props {
    /** Type of state to display */
    type: StateType;
    /** Optional title */
    title?: string;
    /** Optional message */
    message?: string;
    /** Optional icon override (FontAwesome class) */
    icon?: string;
    /** Optional retry callback for error state */
    onretry?: () => void;
  }

  let { type, title, message, icon, onretry }: Props = $props();

  const defaultIcons: Record<StateType, string> = {
    loading: "",
    error: "fa-exclamation-triangle",
    empty: "fa-inbox",
    info: "fa-info-circle",
  };

  const defaultTitles: Record<StateType, string> = {
    loading: "",
    error: "Something went wrong",
    empty: "Nothing here yet",
    info: "Information",
  };

  const resolvedIcon = $derived(icon ?? defaultIcons[type]);
  const resolvedTitle = $derived(title ?? defaultTitles[type]);
</script>

<div class="panel-state" class:panel-state--error={type === "error"}>
  {#if type === "loading"}
    <PanelSpinner />
  {:else if resolvedIcon}
    <i class="fas {resolvedIcon} panel-state__icon" aria-hidden="true"></i>
  {/if}

  {#if resolvedTitle}
    <h3 class="panel-state__title">{resolvedTitle}</h3>
  {/if}

  {#if message}
    <p class="panel-state__message">{message}</p>
  {/if}

  {#if type === "error" && onretry}
    <button class="panel-state__retry" onclick={onretry}> Try Again </button>
  {/if}
</div>

<style>
  .panel-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 60px 20px;
    text-align: center;
  }

  .panel-state__icon {
    font-size: 50px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.3));
  }

  .panel-state--error .panel-state__icon {
    color: var(--semantic-error, #ef4444);
  }

  .panel-state__title {
    font-size: 20px;
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.8));
    margin: 0;
  }

  .panel-state__message {
    font-size: 14px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    margin: 0;
    max-width: 300px;
  }

  .panel-state__retry {
    margin-top: 8px;
    padding: 10px 20px;
    background: color-mix(in srgb, var(--theme-accent, #8b5cf6) 15%, transparent);
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.2));
    border-radius: 8px;
    color: var(--theme-text, white);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .panel-state__retry:hover {
    background: color-mix(in srgb, var(--theme-accent, #8b5cf6) 25%, transparent);
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.3));
  }

  @media (prefers-reduced-motion: reduce) {
    .panel-state__retry {
      transition: none;
    }
  }
</style>
