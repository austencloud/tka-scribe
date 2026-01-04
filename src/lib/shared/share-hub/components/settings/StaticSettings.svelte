<!--
  StaticSettings.svelte

  Settings panel for static image export.
  Currently minimal as we use sensible defaults.

  Future options could include:
  - Include start position toggle
  - Include beat numbers toggle
  - Include word toggle

  Domain: Share Hub - Settings - Static Image Format
-->
<script lang="ts">
  // Currently no user-adjustable settings
  // Export uses sensible defaults:
  // - White background
  // - High quality PNG
  // - Beat numbers included
  // - Word included
</script>

<div class="static-settings">
  <div class="info-section">
    <i class="fas fa-info-circle" aria-hidden="true"></i>
    <div class="info-content">
      <h4>Export Settings</h4>
      <p>
        Images are exported as high-quality PNG files with a white background.
      </p>
      <ul>
        <li>Beat numbers included</li>
        <li>Sequence word displayed</li>
        <li>Start position included</li>
      </ul>
    </div>
  </div>
</div>

<style>
  .static-settings {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .info-section {
    display: flex;
    gap: 16px;
    padding: 16px;
    background: var(--theme-card-bg);
    border: 1px solid var(--theme-stroke);
    border-radius: 12px;
  }

  .info-section i {
    font-size: var(--font-size-2xl);
    color: var(--theme-accent);
    opacity: 0.8;
    flex-shrink: 0;
    margin-top: 4px;
  }

  .info-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .info-content h4 {
    font-size: var(--font-size-min);
    font-weight: 600;
    color: var(--theme-text, white);
    margin: 0;
  }

  .info-content p {
    font-size: var(--font-size-min);
    color: var(--theme-text-dim, var(--theme-text-dim));
    margin: 0;
    line-height: 1.5;
  }

  .info-content ul {
    margin: 8px 0 0 0;
    padding-left: 20px;
    font-size: var(--font-size-min);
    color: var(--theme-text-dim, var(--theme-text-dim));
  }

  .info-content li {
    margin-bottom: 4px;
  }
</style>
