<script lang="ts">
  /**
   * PanelHeader - Shared panel header component
   *
   * Provides consistent header styling across all panel components.
   */

  interface Props {
    /** Panel title */
    title: string;
    /** Optional subtitle */
    subtitle?: string;
    /** Optional FontAwesome icon class (e.g., "fa-trophy") */
    icon?: string;
  }

  let { title, subtitle, icon }: Props = $props();
</script>

<div class="panel-header">
  <div class="panel-header__title">
    {#if icon}
      <i class="fas {icon} panel-header__icon" aria-hidden="true"></i>
    {/if}
    <h2 class="panel-header__text">{title}</h2>
  </div>
  {#if subtitle}
    <p class="panel-header__subtitle">{subtitle}</p>
  {/if}
</div>

<style>
  .panel-header {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 20px 20px 0;
    flex-shrink: 0;
  }

  .panel-header__title {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .panel-header__icon {
    font-size: 24px;
    color: var(--theme-accent, #06b6d4);
  }

  .panel-header__text {
    font-size: 28px;
    font-weight: 700;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
    margin: 0;
  }

  .panel-header__subtitle {
    font-size: 14px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    margin: 0;
    padding-left: 36px;
  }

  @media (max-width: 640px) {
    .panel-header {
      padding: 16px 16px 0;
    }

    .panel-header__text {
      font-size: 24px;
    }

    .panel-header__subtitle {
      font-size: 13px;
      padding-left: 32px;
    }
  }
</style>
