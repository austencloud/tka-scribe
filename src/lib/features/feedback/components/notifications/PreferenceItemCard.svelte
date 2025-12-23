<script lang="ts">
  export let label: string;
  export let description: string;
  export let enabled = false;
  export let isBusy = false;
  export let onToggle: () => void;
</script>

<button
  class="preference-item"
  class:enabled
  onclick={onToggle}
  aria-label={`Toggle ${label}`}
  aria-pressed={enabled}
  aria-busy={isBusy}
>
  <div class="item-content">
    <div class="item-header">
      <span class="item-label">{label}</span>
      <span class="item-status" aria-hidden="true"
        >{enabled ? "On" : "Off"}</span
      >
    </div>
    <p class="item-description">{description}</p>
  </div>
</button>

<style>
  .preference-item {
    width: 100%;
    padding: 14px 14px;
    background: linear-gradient(
      150deg,
      var(--theme-card-bg, #111728),
      var(--theme-panel-bg, #0d1324)
    );
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    border-radius: 14px;
    cursor: pointer;
    transition:
      background 180ms ease,
      border-color 180ms ease,
      transform 180ms ease;
    text-align: left;
    box-shadow: var(--theme-shadow, 0 6px 16px rgba(0, 0, 0, 0.28));
    -webkit-tap-highlight-color: transparent;
  }

  .preference-item:hover {
    background: linear-gradient(
      150deg,
      var(--theme-card-hover-bg, #131a2e),
      var(--theme-panel-bg, #0e1426)
    );
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.12));
    box-shadow: var(--theme-shadow, 0 10px 20px rgba(0, 0, 0, 0.32));
    transform: translateY(-1px);
  }

  .preference-item:active {
    transform: translateY(0) scale(0.98);
    transition-duration: 0.1s;
  }

  .preference-item[aria-busy="true"] {
    opacity: 0.7;
    cursor: wait;
  }

  .preference-item.enabled {
    background: linear-gradient(
      150deg,
      color-mix(
        in srgb,
        var(--theme-card-bg, #111728) 80%,
        var(--theme-accent, #34d399)
      ),
      var(--theme-card-bg, #111728)
    );
    border-color: var(--theme-accent, rgba(110, 231, 183, 0.5));
    box-shadow: var(--theme-shadow, 0 10px 20px rgba(0, 0, 0, 0.32));
  }

  .preference-item.enabled:hover:not(:disabled) {
    background: linear-gradient(
      150deg,
      color-mix(
        in srgb,
        var(--theme-card-hover-bg, #131a2e) 75%,
        var(--theme-accent, #34d399)
      ),
      var(--theme-panel-bg, #0e1426)
    );
    border-color: var(--theme-accent-strong, rgba(110, 231, 183, 0.6));
  }

  .item-content {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .item-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .item-label {
    font-size: 13px;
    font-weight: 500;
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
    line-height: 1.2;
    letter-spacing: -0.08px;
    flex: 1;
  }

  .preference-item.enabled .item-label {
    color: var(--theme-accent, #6ee7b7);
  }

  .item-status {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.12));
    border-radius: 999px;
  }

  .preference-item.enabled .item-status {
    color: #0d1b2a;
    background: linear-gradient(
      135deg,
      var(--theme-accent, #6ee7b7),
      var(--theme-accent-strong, #2dd4bf)
    );
    border-color: transparent;
    box-shadow: none;
  }

  .item-description {
    font-size: 11px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    margin: 0;
    line-height: 1.4;
  }

  .preference-item.enabled .item-description {
    color: var(--theme-text, rgba(255, 255, 255, 0.7));
  }
</style>
