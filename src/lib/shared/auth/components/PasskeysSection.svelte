<script lang="ts">
  import type { IHapticFeedback } from "../../application/services/contracts/IHapticFeedback";
  import { listPasskeys, registerPasskey } from "../webauthn/passkeysClient";

  interface Props {
    hapticService?: IHapticFeedback | null;
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
        <i class="fas fa-fingerprint" aria-hidden="true"></i>
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
    <button
      class="primary"
      type="button"
      onclick={handleAdd}
      disabled={loading}
    >
      <i class="fas fa-plus" aria-hidden="true"></i>
      {loading ? "Working..." : "Add Passkey"}
    </button>
    <button
      class="secondary"
      type="button"
      onclick={refresh}
      disabled={loading}
    >
      <i class="fas fa-rotate" aria-hidden="true"></i>
      Refresh
    </button>
  </div>

  {#if error}
    <p class="error-message">
      <i class="fas fa-exclamation-circle" aria-hidden="true"></i>
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
    border-bottom: 1px solid var(--theme-stroke);
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
    color: var(--theme-text);
    font-weight: 600;
  }

  .title i {
    color: var(--semantic-success);
  }

  .subtitle {
    margin: 6px 0 0;
    font-size: var(--font-size-compact);
    color: var(--theme-text-dim);
    line-height: 1.4;
  }

  .status {
    padding: 6px 10px;
    border-radius: 999px;
    font-size: var(--font-size-compact);
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
    border: 1px solid var(--theme-stroke, var(--theme-stroke));
    background: var(--theme-card-bg, var(--theme-card-bg));
    color: var(--theme-text);
    font-weight: 600;
    flex: 1;
    min-width: 0;
  }

  .primary {
    border: none;
    background: linear-gradient(135deg, var(--semantic-success), #16a34a);
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
    background: color-mix(
      in srgb,
      var(--semantic-error, var(--semantic-error)) 15%,
      transparent
    );
    border: 1px solid var(--semantic-error, var(--semantic-error));
    color: var(--semantic-error, var(--semantic-error));
    font-size: var(--font-size-compact);
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
    border: 1px solid var(--theme-stroke);
  }

  .row-title {
    font-weight: 600;
    font-size: var(--font-size-compact);
    color: var(--theme-text);
  }

  .row-sub {
    font-size: var(--font-size-compact);
    color: var(--theme-text-secondary, var(--theme-text-dim));
    margin-top: 4px;
  }

  .badge {
    font-size: var(--font-size-compact);
    font-weight: 700;
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(34, 197, 94, 0.14);
    color: rgba(34, 197, 94, 0.95);
    white-space: nowrap;
  }
</style>
