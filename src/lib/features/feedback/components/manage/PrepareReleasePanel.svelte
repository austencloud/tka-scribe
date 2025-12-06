<!-- PrepareReleasePanel - Admin UI for preparing a new release version -->
<script lang="ts">
  import type { VersionState } from "../../state/version-state.svelte";
  import { PRE_RELEASE_VERSION } from "../../domain/models/version-models";

  const { versionState, onClose } = $props<{
    versionState: VersionState;
    onClose: () => void;
  }>();

  // Form state
  let version = $state("");
  let showConfirm = $state(false);

  // Validation
  const versionError = $derived.by(() => {
    if (!version.trim()) return "Version is required";
    // Basic semver validation
    if (!/^\d+\.\d+\.\d+(-\w+)?$/.test(version.trim())) {
      return "Use semver format (e.g., 0.2.0)";
    }
    // Must be greater than latest
    if (
      versionState.latestVersion &&
      version.trim() <= versionState.latestVersion
    ) {
      return `Must be greater than ${versionState.latestVersion}`;
    }
    return null;
  });

  const isValid = $derived(
    !versionError && versionState.generatedChangelog.length > 0
  );

  // Get icon for category
  function getCategoryIcon(category: string): string {
    switch (category) {
      case "fixed":
        return "fa-bug";
      case "added":
        return "fa-lightbulb";
      case "improved":
        return "fa-wrench";
      default:
        return "fa-circle";
    }
  }

  // Suggested next version
  const suggestedVersion = $derived.by(() => {
    if (!versionState.latestVersion) return "0.1.0";
    const parts = versionState.latestVersion.split(".");
    if (parts.length !== 3) return "0.1.0";
    // Increment minor version
    const major = parseInt(parts[0]) || 0;
    const minor = parseInt(parts[1]) || 0;
    return `${major}.${minor + 1}.0`;
  });

  // Auto-fill suggested version on mount
  $effect(() => {
    if (!version && suggestedVersion) {
      version = suggestedVersion;
    }
  });

  async function handleSubmit() {
    if (!isValid) return;
    showConfirm = true;
  }

  async function handleConfirm() {
    try {
      await versionState.prepareRelease(version.trim());
      onClose();
    } catch {
      showConfirm = false;
    }
  }

  async function handleTagPreRelease() {
    try {
      const count = await versionState.tagExistingAsPreRelease();
      if (count > 0) {
        alert(`Tagged ${count} items as ${PRE_RELEASE_VERSION}`);
      } else {
        alert("No unversioned items to tag");
      }
    } catch {
      // Error shown in state
    }
  }
</script>

<div class="prepare-panel">
  <header class="panel-header">
    <h2>
      <i class="fas fa-rocket"></i>
      Prepare Release
    </h2>
    <button
      type="button"
      class="close-btn"
      onclick={onClose}
      aria-label="Close"
    >
      <i class="fas fa-times"></i>
    </button>
  </header>

  {#if !showConfirm}
    <div class="panel-content">
      <!-- Stats -->
      <div class="stats-section">
        <div class="stat">
          <span class="stat-value">{versionState.unversionedCount}</span>
          <span class="stat-label">Completed items ready</span>
        </div>
        {#if versionState.latestVersion}
          <div class="stat">
            <span class="stat-value">{versionState.latestVersion}</span>
            <span class="stat-label">Current version</span>
          </div>
        {/if}
      </div>

      {#if versionState.unversionedCount === 0}
        <div class="empty-state">
          <i class="fas fa-check-circle"></i>
          <p>No completed feedback to release.</p>
          <p class="hint">
            Complete some feedback items first, then prepare a release.
          </p>
        </div>
      {:else}
        <!-- Form -->
        <form
          onsubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div class="form-group">
            <label for="version">Version Number</label>
            <input
              id="version"
              type="text"
              bind:value={version}
              placeholder="0.2.0"
              class:error={version && versionError}
            />
            {#if version && versionError}
              <span class="error-text">{versionError}</span>
            {/if}
            <p class="field-hint">
              Auto-generated changelog will be used for What's New display
            </p>
          </div>

          <!-- Auto-generated Changelog Preview -->
          <div class="form-group">
            <label>
              <i class="fas fa-magic"></i>
              Auto-Generated Changelog
            </label>

            {#if versionState.isGeneratingChangelog}
              <div class="changelog-loading">
                <i class="fas fa-spinner fa-spin"></i>
                Generating changelog...
              </div>
            {:else if versionState.generatedChangelog.length > 0}
              <div class="changelog-preview">
                {#each versionState.generatedChangelog as entry (entry.text)}
                  <div class="changelog-entry {entry.category}">
                    <i class="fas {getCategoryIcon(entry.category)}"></i>
                    <span class="entry-text">{entry.text}</span>
                  </div>
                {/each}
              </div>
              <p class="changelog-hint">
                Generated from {versionState.completedFeedback.length} completed
                feedback items
              </p>
            {:else}
              <div class="changelog-empty">
                <i class="fas fa-exclamation-circle"></i>
                No changelog entries could be generated
              </div>
            {/if}
          </div>

          <div class="actions">
            <button
              type="submit"
              class="primary-btn"
              disabled={!isValid || versionState.isPreparingRelease}
            >
              {#if versionState.isPreparingRelease}
                <i class="fas fa-spinner fa-spin"></i>
                Preparing...
              {:else}
                <i class="fas fa-tag"></i>
                Prepare Release
              {/if}
            </button>
          </div>
        </form>
      {/if}

      <!-- Pre-release migration (only show if no versions exist) -->
      {#if !versionState.latestVersion && versionState.unversionedCount > 0}
        <div class="migration-section">
          <h3>First Time Setup</h3>
          <p>
            Tag existing completed feedback as pre-release ({PRE_RELEASE_VERSION})?
          </p>
          <button
            type="button"
            class="secondary-btn"
            onclick={handleTagPreRelease}
            disabled={versionState.isLoading}
          >
            <i class="fas fa-history"></i>
            Tag as Pre-Release
          </button>
        </div>
      {/if}

      {#if versionState.error}
        <div class="error-banner">
          <i class="fas fa-exclamation-triangle"></i>
          {versionState.error}
        </div>
      {/if}
    </div>
  {:else}
    <!-- Confirmation -->
    <div class="confirm-content">
      <div class="confirm-icon">
        <i class="fas fa-tag"></i>
      </div>
      <h3>Confirm Release v{version}</h3>
      <p>This will:</p>
      <ul>
        <li>
          Archive <strong>{versionState.unversionedCount}</strong> completed
          items as v<strong>{version}</strong>
        </li>
        <li>
          Save the auto-generated changelog ({versionState.generatedChangelog
            .length} entries)
        </li>
        <li>Make this version visible in What's New</li>
      </ul>
      <p class="warning">This action cannot be undone.</p>

      <div class="confirm-actions">
        <button
          type="button"
          class="secondary-btn"
          onclick={() => (showConfirm = false)}
          disabled={versionState.isPreparingRelease}
        >
          Cancel
        </button>
        <button
          type="button"
          class="primary-btn"
          onclick={handleConfirm}
          disabled={versionState.isPreparingRelease}
        >
          {#if versionState.isPreparingRelease}
            <i class="fas fa-spinner fa-spin"></i>
            Creating...
          {:else}
            <i class="fas fa-check"></i>
            Confirm
          {/if}
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .prepare-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: rgba(12, 14, 24, 0.98);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    overflow: hidden;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    background: linear-gradient(
      135deg,
      rgba(139, 92, 246, 0.15),
      rgba(59, 130, 246, 0.1)
    );
  }

  .panel-header h2 {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }

  .panel-header h2 i {
    color: #8b5cf6;
  }

  .close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all 0.2s;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 0.95);
  }

  .panel-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .stats-section {
    display: flex;
    gap: 16px;
  }

  .stat {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .stat-value {
    font-size: 28px;
    font-weight: 700;
    color: #8b5cf6;
  }

  .stat-label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    text-align: center;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px;
    text-align: center;
    color: rgba(255, 255, 255, 0.7);
  }

  .empty-state i {
    font-size: 52px;
    color: #10b981;
    margin-bottom: 16px;
  }

  .empty-state p {
    margin: 0;
  }

  .empty-state .hint {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
    margin-top: 8px;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.8);
  }

  label i {
    color: #8b5cf6;
  }

  .required {
    color: #ef4444;
  }

  input,
  textarea {
    padding: 10px 12px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.95);
    font-size: 14px;
    font-family: inherit;
    transition: border-color 0.2s;
  }

  input:focus,
  textarea:focus {
    outline: none;
    border-color: #8b5cf6;
  }

  input.error,
  textarea.error {
    border-color: #ef4444;
  }

  textarea {
    resize: vertical;
    min-height: 60px;
  }

  .error-text {
    font-size: 12px;
    color: #ef4444;
  }

  .field-hint {
    margin: 4px 0 0 0;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.4);
  }

  /* Changelog preview */
  .changelog-preview {
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-height: 200px;
    overflow-y: auto;
    padding: 12px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .changelog-entry {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 8px 10px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 6px;
    border-left: 3px solid;
  }

  .changelog-entry.fixed {
    border-left-color: #ef4444;
  }

  .changelog-entry.fixed i {
    color: #ef4444;
  }

  .changelog-entry.added {
    border-left-color: #8b5cf6;
  }

  .changelog-entry.added i {
    color: #8b5cf6;
  }

  .changelog-entry.improved {
    border-left-color: #3b82f6;
  }

  .changelog-entry.improved i {
    color: #3b82f6;
  }

  .changelog-entry i {
    margin-top: 2px;
    font-size: 12px;
    flex-shrink: 0;
  }

  .changelog-entry .entry-text {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.85);
    line-height: 1.4;
  }

  .changelog-hint {
    margin: 4px 0 0 0;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.4);
  }

  .changelog-loading,
  .changelog-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 24px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.5);
    font-size: 13px;
  }

  .changelog-empty i {
    color: #f59e0b;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    padding-top: 8px;
  }

  .primary-btn,
  .secondary-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .primary-btn {
    background: linear-gradient(135deg, #8b5cf6, #6366f1);
    color: white;
  }

  .primary-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
  }

  .primary-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .secondary-btn {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .secondary-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
  }

  .secondary-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .migration-section {
    margin-top: 16px;
    padding: 16px;
    background: rgba(245, 158, 11, 0.1);
    border: 1px solid rgba(245, 158, 11, 0.3);
    border-radius: 12px;
  }

  .migration-section h3 {
    margin: 0 0 8px 0;
    font-size: 14px;
    font-weight: 600;
    color: #f59e0b;
  }

  .migration-section p {
    margin: 0 0 12px 0;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
  }

  .error-banner {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 8px;
    color: #fca5a5;
    font-size: 13px;
  }

  /* Confirmation view */
  .confirm-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px;
    text-align: center;
  }

  .confirm-icon {
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(
      135deg,
      rgba(139, 92, 246, 0.2),
      rgba(99, 102, 241, 0.1)
    );
    border-radius: 50%;
    margin-bottom: 16px;
  }

  .confirm-icon i {
    font-size: 28px;
    color: #8b5cf6;
  }

  .confirm-content h3 {
    margin: 0 0 12px 0;
    font-size: 20px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }

  .confirm-content p {
    margin: 0 0 8px 0;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
  }

  .confirm-content ul {
    margin: 12px 0;
    padding: 0;
    list-style: none;
    text-align: left;
  }

  .confirm-content li {
    position: relative;
    padding-left: 20px;
    margin-bottom: 8px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
  }

  .confirm-content li::before {
    content: "•";
    position: absolute;
    left: 0;
    color: #8b5cf6;
  }

  .confirm-content li strong {
    color: #8b5cf6;
  }

  .confirm-content .warning {
    margin-top: 16px;
    padding: 8px 12px;
    background: rgba(245, 158, 11, 0.1);
    border-radius: 6px;
    font-size: 13px;
    color: #f59e0b;
  }

  .confirm-actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;
  }
</style>
