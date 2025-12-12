<script lang="ts">
  /**
   * SecuritySection
   *
   * MFA management section for settings ProfileTab.
   * Shows MFA status and allows enabling/disabling.
   * Note: The enrollment drawer is rendered in MainApplication.svelte
   * and controlled via mfaUIState for proper z-index stacking.
   */

  import ConfirmDialog from "$lib/shared/foundation/ui/ConfirmDialog.svelte";
  import type { IAuthService } from "../services/contracts/IAuthService";
  import type { IHapticFeedbackService } from "../../application/services/contracts/IHapticFeedbackService";
  import { mfaUIState } from "../state/mfa-ui-state.svelte";

  interface Props {
    authService: IAuthService;
    hapticService?: IHapticFeedbackService | null;
  }

  let { authService, hapticService = null }: Props = $props();

  let showDisableConfirm = $state(false);
  let isDisabling = $state(false);
  let disableError = $state<string | null>(null);

  // Reactive MFA status - uses statusVersion to trigger re-evaluation
  const isMFAEnabled = $derived.by(() => {
    // Read statusVersion to create reactive dependency
    void mfaUIState.statusVersion;
    return authService.isMFAEnabled();
  });
  const enrolledFactors = $derived.by(() => {
    void mfaUIState.statusVersion;
    return authService.getEnrolledFactors();
  });

  function handleEnableMFA() {
    // Open the drawer via global state (rendered in MainApplication)
    mfaUIState.openEnrollment();
  }

  function handleDisableMFAClick() {
    showDisableConfirm = true;
  }

  async function handleDisableMFAConfirm() {
    if (enrolledFactors.length === 0) return;

    isDisabling = true;
    disableError = null;

    try {
      // Unenroll all factors
      for (const factor of enrolledFactors) {
        await authService.unenrollFactor(factor.uid);
      }
      showDisableConfirm = false;
      hapticService?.trigger("success");
      // Trigger UI update
      mfaUIState.notifyStatusChange();
    } catch (error: unknown) {
      console.error("Failed to disable MFA:", error);
      disableError =
        error instanceof Error ? error.message : "Failed to disable MFA";
      hapticService?.trigger("error");
    } finally {
      isDisabling = false;
    }
  }
</script>

<section class="security-section">
  <div class="section-header">
    <div class="status-row">
      <span class="label">Status</span>
      <span class="status-badge" class:enabled={isMFAEnabled}>
        {#if isMFAEnabled}
          <i class="fas fa-check-circle"></i>
          Enabled
        {:else}
          <i class="fas fa-times-circle"></i>
          Disabled
        {/if}
      </span>
    </div>

    {#if isMFAEnabled && enrolledFactors.length > 0}
      <div class="factors-list">
        <span class="factors-label">Active methods:</span>
        {#each enrolledFactors as factor}
          <span class="factor-badge">
            <i class="fas fa-mobile-alt"></i>
            {factor.displayName || "Authenticator App"}
          </span>
        {/each}
      </div>
    {/if}
  </div>

  <div class="section-actions">
    {#if isMFAEnabled}
      <button
        type="button"
        class="disable-button"
        onclick={handleDisableMFAClick}
      >
        <i class="fas fa-shield-alt"></i>
        Disable 2FA
      </button>
    {:else}
      <button type="button" class="enable-button" onclick={handleEnableMFA}>
        <i class="fas fa-shield-alt"></i>
        Enable 2FA
      </button>
    {/if}
  </div>

  {#if disableError}
    <p class="error-message">
      <i class="fas fa-exclamation-circle"></i>
      {disableError}
    </p>
  {/if}
</section>

<!-- Disable Confirmation Dialog -->
<ConfirmDialog
  bind:isOpen={showDisableConfirm}
  title="Disable Two-Factor Authentication?"
  message="This will make your account less secure. You can always re-enable it later."
  confirmText={isDisabling ? "Disabling..." : "Disable 2FA"}
  variant="danger"
  onConfirm={handleDisableMFAConfirm}
  onCancel={() => (showDisableConfirm = false)}
/>

<style>
  .security-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .section-header {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .status-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .label {
    font-size: 14px;
    font-weight: 500;
    color: var(--theme-text-secondary, rgba(255, 255, 255, 0.7));
  }

  .status-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
    background: color-mix(
      in srgb,
      var(--semantic-error, #ef4444) 15%,
      transparent
    );
    color: var(--semantic-error, #ef4444);
  }

  .status-badge.enabled {
    background: color-mix(
      in srgb,
      var(--semantic-success, #22c55e) 15%,
      transparent
    );
    color: var(--semantic-success, #22c55e);
  }

  .factors-list {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  .factors-label {
    font-size: 13px;
    color: var(--theme-text-secondary, rgba(255, 255, 255, 0.6));
  }

  .factor-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 8px;
    font-size: 12px;
    color: var(--theme-text, #ffffff);
  }

  .factor-badge i {
    color: var(--theme-accent, #3b82f6);
  }

  .section-actions {
    display: flex;
    gap: 12px;
  }

  .enable-button {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 20px;
    background: linear-gradient(
      135deg,
      var(--theme-accent, #3b82f6),
      color-mix(in srgb, var(--theme-accent, #3b82f6) 80%, #000)
    );
    border: none;
    border-radius: 10px;
    color: #ffffff;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .enable-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px
      color-mix(in srgb, var(--theme-accent, #3b82f6) 40%, transparent);
  }

  .disable-button {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 20px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 10px;
    color: var(--theme-text, #ffffff);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .disable-button:hover {
    background: color-mix(
      in srgb,
      var(--semantic-error, #ef4444) 15%,
      transparent
    );
    border-color: var(--semantic-error, #ef4444);
    color: var(--semantic-error, #ef4444);
  }

  .error-message {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    padding: 12px 16px;
    background: color-mix(
      in srgb,
      var(--semantic-error, #ef4444) 15%,
      transparent
    );
    border: 1px solid var(--semantic-error, #ef4444);
    border-radius: 10px;
    color: var(--semantic-error, #ef4444);
    font-size: 14px;
  }
</style>
