<script lang="ts">
  import type { ModuleUsageData } from "../../services/contracts/IAnalyticsDataService";

  interface Props {
    modules: ModuleUsageData[];
    loading?: boolean;
  }

  let { modules, loading = false }: Props = $props();

  const maxViews = $derived(Math.max(...modules.map(m => m.views), 1));
</script>

<section class="section">
  <h3><i class="fas fa-th-large"></i> Module Usage</h3>
  {#if loading}
    <div class="module-usage">
      {#each Array(5) as _, i}
        <div class="module-row">
          <div class="module-header">
            <div class="module-icon skeleton-icon"></div>
            <span class="skeleton-label"></span>
            <span class="skeleton-views"></span>
          </div>
          <div class="module-bar">
            <div class="module-bar-fill skeleton-bar" style="width: {80 - i * 12}%"></div>
          </div>
        </div>
      {/each}
    </div>
  {:else if modules.length > 0}
    <div class="module-usage">
      {#each modules as module}
        <div class="module-row">
          <div class="module-header">
            <div class="module-icon" style="background: {module.color}20; color: {module.color}">
              <i class="fas fa-cube"></i>
            </div>
            <span class="module-label">{module.label}</span>
            <span class="module-views">{module.views.toLocaleString()} views</span>
          </div>
          <div class="module-bar">
            <div
              class="module-bar-fill"
              style="width: {(module.views / maxViews) * 100}%; background: {module.color}"
            ></div>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="no-data-message">
      <i class="fas fa-info-circle"></i>
      <span>No module navigation data yet. Usage stats will appear as users navigate between modules.</span>
    </div>
  {/if}
</section>

<style>
  .section {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 20px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .section h3 {
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    color: rgba(255, 255, 255, 0.9);
  }

  .section h3 i {
    color: rgba(255, 255, 255, 0.5);
  }

  .module-usage {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .module-row {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .module-header {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .module-icon {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    flex-shrink: 0;
  }

  .module-label {
    flex: 1;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
  }

  .module-views {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
  }

  .module-bar {
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    overflow: hidden;
    margin-left: 38px;
  }

  .module-bar-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.5s ease;
  }

  .no-data-message {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 24px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.5);
    font-size: 14px;
  }

  .no-data-message i {
    font-size: 20px;
    color: rgba(255, 255, 255, 0.3);
  }

  /* Skeleton styles */
  .skeleton-icon {
    background: rgba(255, 255, 255, 0.1) !important;
    animation: pulse 1.5s ease-in-out infinite;
  }

  .skeleton-label {
    display: block;
    flex: 1;
    height: 14px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    animation: pulse 1.5s ease-in-out infinite;
  }

  .skeleton-views {
    display: block;
    width: 60px;
    height: 13px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 3px;
    animation: pulse 1.5s ease-in-out infinite;
  }

  .skeleton-bar {
    background: rgba(255, 255, 255, 0.1) !important;
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
</style>
