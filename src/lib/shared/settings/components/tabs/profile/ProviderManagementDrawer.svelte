<!-- ProviderManagementDrawer.svelte - Mobile drawer for managing connected accounts -->
<script lang="ts">
  import Drawer from "../../../../foundation/ui/Drawer.svelte";
  import type { ProviderConfig } from "../../../../navigation/components/profile-settings/connectedAccounts.providers";

  interface Props {
    isOpen: boolean;
    providerConfig: ProviderConfig | null;
    providerEmail: string | null;
    canUnlink: boolean;
    onDisconnect: () => void;
    onCancel: () => void;
  }

  let { isOpen, providerConfig, providerEmail, canUnlink, onDisconnect, onCancel }: Props = $props();
</script>

<Drawer bind:isOpen={isOpen} placement="bottom" ariaLabel="Manage connected account">
  {#if providerConfig}
    <div class="provider-drawer-content">
      <div class="drawer-provider-header">
        <div
          class="drawer-provider-icon"
          style="--provider-color: {providerConfig.color}; --provider-bg: {providerConfig.bgColor};"
        >
          <i class={providerConfig.icon} aria-hidden="true"></i>
        </div>
        <div class="drawer-provider-info">
          <h3 class="drawer-provider-name">{providerConfig.name}</h3>
          {#if providerEmail}
            <p class="drawer-provider-email">{providerEmail}</p>
          {/if}
        </div>
        <span class="connected-badge-drawer">
          <i class="fas fa-check-circle" aria-hidden="true"></i>
          <span>Connected</span>
        </span>
      </div>

      <div class="drawer-actions">
        {#if canUnlink}
          <button class="disconnect-btn" onclick={onDisconnect}>
            <i class="fas fa-unlink" aria-hidden="true"></i>
            <span>Disconnect {providerConfig.name}</span>
          </button>
          <p class="disconnect-warning">
            You won't be able to sign in with {providerConfig.name} after
            disconnecting.
          </p>
        {:else}
          <p class="cannot-disconnect-msg">
            <i class="fas fa-info-circle" aria-hidden="true"></i>
            This is your only sign-in method. Link another account before
            disconnecting.
          </p>
        {/if}
      </div>

      <button class="cancel-btn" onclick={onCancel}> Cancel </button>
    </div>
  {/if}
</Drawer>

<style>
  .provider-drawer-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 8px 4px 16px;
  }

  .drawer-provider-header {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .drawer-provider-icon {
    width: var(--min-touch-target);
    height: var(--min-touch-target);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--provider-bg);
    border-radius: 12px;
    flex-shrink: 0;
  }

  .drawer-provider-icon i {
    font-size: 22px;
    color: var(--provider-color);
  }

  .drawer-provider-info {
    flex: 1;
    min-width: 0;
  }

  .drawer-provider-name {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
  }

  .drawer-provider-email {
    margin: 4px 0 0 0;
    font-size: 14px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .connected-badge-drawer {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    background: rgba(34, 197, 94, 0.15);
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    color: #4ade80;
    flex-shrink: 0;
  }

  .drawer-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .disconnect-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    min-height: var(--min-touch-target);
    padding: 14px 20px;
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.4);
    border-radius: 12px;
    color: #fca5a5;
    font-size: 15px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .disconnect-btn:hover {
    background: rgba(239, 68, 68, 0.25);
    border-color: rgba(239, 68, 68, 0.6);
    color: #fecaca;
  }

  .disconnect-btn:active {
    transform: scale(0.98);
  }

  .disconnect-warning {
    margin: 0;
    font-size: 13px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    text-align: center;
    line-height: 1.4;
  }

  .cannot-disconnect-msg {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0;
    padding: 14px 16px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    border-radius: 10px;
    font-size: 14px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    line-height: 1.4;
  }

  .cannot-disconnect-msg i {
    color: var(--theme-accent, #6366f1);
    font-size: 16px;
    flex-shrink: 0;
  }

  .cancel-btn {
    width: 100%;
    min-height: var(--min-touch-target);
    padding: 12px 20px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 12px;
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
    font-size: 15px;
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .cancel-btn:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.08));
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.15));
  }

  .cancel-btn:active {
    transform: scale(0.98);
  }
</style>
