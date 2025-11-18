<script lang="ts">
  /**
   * AchievementsShowcasePanel
   * Community-wide achievement showcase
   */
</script>

<div class="achievements-panel">
  <!-- Header -->
  <div class="panel-header">
    <div class="header-title">
      <i class="fas fa-award"></i>
      <h2>Achievement Showcase</h2>
    </div>
    <p class="header-subtitle">Celebrating community accomplishments</p>
  </div>

  <!-- Placeholder Content -->
  <div class="placeholder-content">
    <i class="fas fa-trophy"></i>
    <h3>Coming Soon</h3>
    <p>
      The achievement showcase will display rare achievements, recent unlocks,
      and top achievement holders across the community.
    </p>
  </div>
</div>

<style>
  .achievements-panel {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
    height: 100%;
    overflow-y: auto;
    padding: 20px;
  }

  /* ============================================================================
     HEADER
     ============================================================================ */
  .panel-header {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .header-title i {
    font-size: 24px;
    color: #a855f7;
  }

  .header-title h2 {
    font-size: 28px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    margin: 0;
  }

  .header-subtitle {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
    padding-left: 36px;
  }

  /* ============================================================================
     PLACEHOLDER
     ============================================================================ */
  .placeholder-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 60px 20px;
    text-align: center;
  }

  .placeholder-content i {
    font-size: 64px;
    color: rgba(255, 255, 255, 0.2);
  }

  .placeholder-content h3 {
    font-size: 24px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
  }

  .placeholder-content p {
    font-size: 15px;
    color: rgba(255, 255, 255, 0.5);
    margin: 0;
    max-width: 500px;
    line-height: 1.6;
  }
</style>
