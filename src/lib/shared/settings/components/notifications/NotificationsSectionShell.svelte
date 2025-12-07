<script lang="ts">
  export let title: string;
  export let eyebrow: string;
</script>

<div class="panel">
  <div class="section-header">
    <div>
      <p class="eyebrow">{eyebrow}</p>
      <h3>{title}</h3>
    </div>
  </div>
  <slot />
</div>

<style>
  .panel {
    background: linear-gradient(
      145deg,
      var(--theme-panel-bg, #0e1324),
      var(--theme-panel-elevated-bg, #0c1120)
    );
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.06));
    border-radius: 16px;
    padding: 16px;
    box-shadow: var(--theme-panel-shadow, 0 12px 28px rgba(0, 0, 0, 0.35));
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .eyebrow {
    margin: 0;
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
  }

  h3 {
    margin: 4px 0 0;
    font-size: 18px;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
  }

  @media (max-width: 640px) {
    .panel {
      padding: 14px;
    }
  }
</style>
