<!--
  ShareHubHeader.svelte

  Header with back button and format title.
  Displayed when a format panel is active.
-->
<script lang="ts">
  let {
    title = 'Share',
    onBack,
  }: {
    title?: string;
    onBack: () => void;
  } = $props();
</script>

<header class="share-hub-header">
  <button
    class="back-button"
    onclick={onBack}
    aria-label="Back to format picker"
  >
    <i class="fas fa-arrow-left"></i>
  </button>

  <h1 class="title">{title}</h1>

  <div class="spacer"></div>
</header>

<style>
  .share-hub-header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
    background: var(--theme-panel-bg, rgba(0, 0, 0, 0.3));
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    backdrop-filter: blur(10px);
  }

  .back-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    min-width: var(--touch-target-min, 48px);
    min-height: var(--touch-target-min, 48px);
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .back-button i {
    font-size: 18px;
    color: var(--theme-text, white);
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .back-button:hover {
    background: var(--theme-card-bg-hover, rgba(255, 255, 255, 0.08));
    border-color: var(--theme-accent, rgba(255, 255, 255, 0.2));
    transform: translateX(-2px);
  }

  .back-button:hover i {
    transform: translateX(-2px);
  }

  .back-button:active {
    transform: scale(0.95);
  }

  .title {
    flex: 1;
    font-size: clamp(18px, 4.5cqi, 20px);
    font-weight: 700;
    color: var(--theme-text, white);
    margin: 0;
    letter-spacing: 0.5px;
  }

  .spacer {
    width: 40px; /* Balance the back button */
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .back-button,
    .back-button i {
      transition: none;
    }

    .back-button:hover,
    .back-button:hover i {
      transform: none;
    }
  }
</style>
