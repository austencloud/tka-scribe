<script lang="ts">
  import type { IHapticFeedbackService } from "../../application/services/contracts/IHapticFeedbackService";
  import { listPasskeys, registerPasskey } from "../webauthn/passkeysClient";

  interface Props {
    hapticService?: IHapticFeedbackService | null;
  }

  let { hapticService = null }: Props = $props();

  let loading = $state(false);
  let error = $state<string | null>(null);
  let passkeys = $state<
    Array<{
      credentialId: string;
      name: string | null;
      createdAt: string | null;
      lastUsedAt: string | null;
    }>
  >([]);

  async function refresh() {
    loading = true;
    error = null;
    try {
      const res = await listPasskeys();
      passkeys = res.passkeys;
    } catch (e: unknown) {
      error = e instanceof Error ? e.message : "Failed to load passkeys";
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    void refresh();
  });

  async function handleAdd() {
    if (loading) return;
    hapticService?.trigger("selection");
    loading = true;
    error = null;
    try {
      await registerPasskey();
      hapticService?.trigger("success");
      await refresh();
    } catch (e: unknown) {
      hapticService?.trigger("error");
      error = e instanceof Error ? e.message : "Failed to add passkey";
    } finally {
      loading = false;
    }
  }

  const isEnabled = $derived(passkeys.length > 0);
</script>

<section class="passkeys">
  <div class="header">
    <div class="title-row">
      <div class="title">
        <i class="fas fa-fingerprint"></i>
        <span>Passkeys (recommended)</span>
      </div>
      <span class="status" class:enabled={isEnabled}>
        {#if isEnabled}
          Enabled
        {:else}
          Not set up
        {/if}
      </span>
    </div>
    <p class="subtitle">
      Uses Face ID / Touch ID / Windows Hello to verify sensitive actions.
    </p>
  </div>

  <div class="actions">
    <button class="primary" type="button" onclick={handleAdd} disabled={loading}>
      <i class="fas fa-plus"></i>
      {loading ? "Working..." : "Add Passkey"}
    </button>
    <button class="secondary" type="button" onclick={refresh} disabled={loading}>
      <i class="fas fa-rotate"></i>
      Refresh
    </button>
  </div>

  {#if error}
    <p class="error-message">
      <i class="fas fa-exclamation-circle"></i>
      {error}
    </p>
  {/if}

  {#if passkeys.length > 0}
    <div class="list">
      {#each passkeys as pk}
        <div class="row">
          <div class="row-main">
            <div class="row-title">{pk.name || "Passkey"}</div>
            <div class="row-sub">
              {#if pk.lastUsedAt}
                Last used {new Date(pk.lastUsedAt).toLocaleString()}
              {:else if pk.createdAt}
                Added {new Date(pk.createdAt).toLocaleString()}
              {/if}
            </div>
          </div>
          <div class="row-meta">
            <span class="badge">Step-up</span>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</section>

<style>
  .passkeys {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
  }

  .title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .title {
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--theme-text, #fff);
    font-weight: 600;
  }

  .title i {
    color: #22c55e;
  }

  .subtitle {
    margin: 6px 0 0;
    font-size: 13px;
    color: var(--theme-text-secondary, rgba(255, 255, 255, 0.65));
    line-height: 1.4;
  }

  .status {
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    background: rgba(239, 68, 68, 0.14);
    color: rgba(239, 68, 68, 0.95);
    white-space: nowrap;
  }

  .status.enabled {
    background: rgba(34, 197, 94, 0.14);
    color: rgba(34, 197, 94, 0.95);
  }

  .actions {
    display: flex;
    gap: 10px;
    max-width: 100%;
  }

  .primary,
  .secondary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 10px;
    cursor: pointer;
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    color: var(--theme-text, #fff);
    font-weight: 600;
    flex: 1;
    min-width: 0;
  }

  .primary {
    border: none;
    background: linear-gradient(135deg, #22c55e, #16a34a);
  }

  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .error-message {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    padding: 10px 12px;
    border-radius: 10px;
    background: color-mix(in srgb, var(--semantic-error, #ef4444) 15%, transparent);
    border: 1px solid var(--semantic-error, #ef4444);
    color: var(--semantic-error, #ef4444);
    font-size: 13px;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 12px;
    border-radius: 12px;
    background: rgba(0, 0, 0, 0.18);
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
  }

  .row-title {
    font-weight: 600;
    font-size: 13px;
    color: var(--theme-text, #fff);
  }

  .row-sub {
    font-size: 12px;
    color: var(--theme-text-secondary, rgba(255, 255, 255, 0.6));
    margin-top: 4px;
  }

  .badge {
    font-size: 11px;
    font-weight: 700;
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(34, 197, 94, 0.14);
    color: rgba(34, 197, 94, 0.95);
    white-space: nowrap;
  }
</style>

