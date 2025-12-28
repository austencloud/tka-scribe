<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import type { ContentType, ContentTypeConfig } from "./sharePanelTypes";

  export let contentTypes: ContentTypeConfig[] = [];
  export let selectedTypes: ContentType[] = [];

  const dispatch = createEventDispatcher<{ toggleType: ContentType }>();

  function handleToggle(type: ContentType) {
    const disabled = contentTypes.find((ct) => ct.type === type)?.disabled;
    if (disabled) return;

    dispatch("toggleType", type);
  }
</script>

<section class="content-section">
  <div class="content-type-selector">
    <h3>Select Content Types</h3>
    <div class="type-grid">
      {#each contentTypes as contentType}
        <button
          class="type-button"
          class:selected={selectedTypes.includes(contentType.type)}
          class:disabled={contentType.disabled}
          onclick={() => handleToggle(contentType.type)}
          style={`--type-color: ${contentType.color}`}
        >
          <div class="type-icon">
            <i class={contentType.icon}></i>
          </div>
          <div class="type-info">
            <span class="type-label">{contentType.label}</span>
            <span class="type-description">{contentType.description}</span>
          </div>
          {#if contentType.comingSoon}
            <span class="coming-soon-badge">Soon</span>
          {/if}
          <div class="selection-indicator">
            <i class="fas fa-check"></i>
          </div>
        </button>
      {/each}
    </div>
  </div>
</section>

<style>
  .content-section {
    animation: fadeIn 0.4s ease-out backwards;
    animation-delay: 0.05s;
  }

  .content-type-selector h3 {
    margin: 0 0 18px 0;
    font-size: 15px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
    text-transform: uppercase;
    letter-spacing: 1.2px;
    font-size: 13px;
  }

  .type-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .type-button {
    position: relative;
    display: grid;
    grid-template-columns: auto 1fr auto auto;
    align-items: center;
    gap: 18px;
    padding: 18px 22px;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.06),
      rgba(255, 255, 255, 0.03)
    );
    border: 2px solid rgba(255, 255, 255, 0.12);
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 var(--theme-stroke);
  }

  .type-button:hover:not(.disabled) {
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.1),
      var(--theme-card-bg)
    );
    border-color: var(--type-color);
    transform: translateY(-3px);
    box-shadow:
      0 6px 20px rgba(0, 0, 0, 0.15),
      0 0 30px color-mix(in srgb, var(--type-color) 20%, transparent),
      inset 0 1px 0 var(--theme-stroke-strong);
  }

  .type-button.selected {
    background: linear-gradient(
      135deg,
      var(--theme-card-hover-bg),
      rgba(255, 255, 255, 0.06)
    );
    border-color: var(--type-color);
    border-width: 2px;
    box-shadow:
      0 4px 16px var(--theme-shadow),
      0 0 40px color-mix(in srgb, var(--type-color) 25%, transparent),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  .type-button.selected::before {
    content: "";
    position: absolute;
    inset: -2px;
    border-radius: 16px;
    padding: 2px;
    background: linear-gradient(
      135deg,
      var(--type-color),
      color-mix(in srgb, var(--type-color) 70%, transparent)
    );
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    mask-composite: exclude;
    opacity: 0.6;
    pointer-events: none;
  }

  .type-button.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .type-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.15),
      var(--theme-card-bg)
    );
    border-radius: 14px;
    font-size: 26px;
    color: var(--type-color);
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    transition: all 0.2s ease;
  }

  .type-button:hover:not(.disabled) .type-icon {
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.2),
      var(--theme-card-hover-bg)
    );
    transform: scale(1.05);
  }

  .type-button.selected .type-icon {
    background: var(--type-color);
    color: white;
    box-shadow:
      0 4px 12px var(--theme-shadow),
      0 0 20px var(--type-color);
  }

  .type-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    text-align: left;
  }

  .type-label {
    font-size: 16px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }

  .type-description {
    font-size: 13px;
    color: var(--theme-text-dim);
  }

  .selection-indicator {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--type-color);
    color: white;
    opacity: 0;
    transform: scale(0.8);
    transition: all 0.2s ease;
  }

  .type-button.selected .selection-indicator {
    opacity: 1;
    transform: scale(1);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
