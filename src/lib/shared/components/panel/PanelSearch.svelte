<script lang="ts">
  /**
   * PanelSearch - Search input component
   *
   * Provides consistent search input styling.
   */

  interface Props {
    /** Current search value */
    value: string;
    /** Placeholder text */
    placeholder?: string;
    /** Input handler */
    oninput?: (value: string) => void;
    /** Optional max width */
    maxWidth?: string;
  }

  let {
    value = $bindable(""),
    placeholder = "Search...",
    oninput,
    maxWidth = "600px",
  }: Props = $props();

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    value = target.value;
    oninput?.(target.value);
  }
</script>

<div class="panel-search" style:max-width={maxWidth}>
  <i class="fas fa-search panel-search__icon" aria-hidden="true"></i>
  <input
    type="text"
    class="panel-search__input"
    {placeholder}
    {value}
    oninput={handleInput}
  />
</div>

<style>
  .panel-search {
    position: relative;
    width: 100%;
    padding: 0 20px;
  }

  .panel-search__icon {
    position: absolute;
    left: 32px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    pointer-events: none;
  }

  .panel-search__input {
    width: 100%;
    padding: 10px 12px 10px 40px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.06));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 12px;
    color: var(--theme-text, white);
    font-size: 14px;
    transition: all 0.2s ease;
  }

  .panel-search__input:focus {
    outline: none;
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.08));
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.2));
    box-shadow: 0 0 0 3px
      color-mix(in srgb, var(--theme-accent, #8b5cf6) 15%, transparent);
  }

  .panel-search__input::placeholder {
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.4));
  }

  @media (max-width: 640px) {
    .panel-search {
      padding: 0 16px;
    }

    .panel-search__icon {
      left: 28px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .panel-search__input {
      transition: none;
    }
  }
</style>
