<!--
  PreviewModeBanner - Global banner shown when in debug/preview mode

  Displays persistently at the top of the app to make preview mode unmistakable.
  Shows for:
  - User preview mode (viewing another user's data)
  - Role override mode (testing as a different role)
-->
<script lang="ts">
  import {
    userPreviewState,
    clearUserPreview,
  } from "$lib/shared/debug/state/user-preview-state.svelte";
  import { featureFlagService } from "$lib/shared/auth/services/FeatureFlagService.svelte";

  // User preview state
  const isUserPreview = $derived(userPreviewState.isActive);
  const profile = $derived(userPreviewState.data.profile);
  const gamification = $derived(userPreviewState.data.gamification);

  // Role override state
  const debugOverride = $derived(featureFlagService.debugRoleOverride);
  const actualRole = $derived(featureFlagService.userRole);

  // Show banner if either mode is active
  const showBanner = $derived(isUserPreview || !!debugOverride);
  const isRoleOnlyMode = $derived(!isUserPreview && !!debugOverride);

  function handleClearUserPreview() {
    clearUserPreview();
  }

  function handleClearRoleOverride() {
    featureFlagService.clearDebugRoleOverride();
  }

  function handleClearAll() {
    clearUserPreview();
    featureFlagService.clearDebugRoleOverride();
  }
</script>

{#if showBanner}
  <div class="preview-banner" class:role-only={isRoleOnlyMode}>
    <div class="banner-content">
      <div class="banner-left">
        <div class="banner-icon">
          <i class="fas {isRoleOnlyMode ? 'fa-user-secret' : 'fa-eye'}"></i>
        </div>
        <div class="banner-info">
          {#if isRoleOnlyMode}
            <!-- Role Override Only -->
            <span class="banner-label">Role Override</span>
            <span class="banner-user">
              Testing as: <strong class="role-name">{debugOverride}</strong>
              <span class="actual-role">(actual: {actualRole})</span>
            </span>
          {:else if isUserPreview && profile}
            <!-- User Preview Mode -->
            <span class="banner-label">Preview Mode</span>
            <span class="banner-user">
              Viewing as: <strong>{profile.displayName || profile.email || profile.uid}</strong>
              {#if profile.role && profile.role !== "user"}
                <span class="role-badge">{profile.role}</span>
              {/if}
              {#if debugOverride}
                <span class="role-override-badge">+ {debugOverride} role</span>
              {/if}
            </span>
          {/if}
        </div>
      </div>

      {#if isUserPreview}
        <div class="banner-stats">
          {#if gamification}
            <div class="stat">
              <i class="fas fa-star"></i>
              <span>{gamification.totalXP} XP</span>
            </div>
            <div class="stat">
              <i class="fas fa-trophy"></i>
              <span>Lv {gamification.currentLevel}</span>
            </div>
          {/if}
          <div class="stat">
            <i class="fas fa-layer-group"></i>
            <span>{userPreviewState.data.sequences.length}</span>
          </div>
        </div>
      {/if}

      <div class="banner-actions">
        {#if isUserPreview}
          <span class="read-only-badge">
            <i class="fas fa-lock"></i>
            Read-Only
          </span>
        {:else}
          <span class="testing-badge">
            <i class="fas fa-flask"></i>
            Testing
          </span>
        {/if}

        {#if isUserPreview && debugOverride}
          <!-- Both active - show option to clear all -->
          <button class="clear-btn" onclick={handleClearAll}>
            <i class="fas fa-times"></i>
            Exit All
          </button>
        {:else if isUserPreview}
          <button class="clear-btn" onclick={handleClearUserPreview}>
            <i class="fas fa-times"></i>
            Exit Preview
          </button>
        {:else}
          <button class="clear-btn" onclick={handleClearRoleOverride}>
            <i class="fas fa-times"></i>
            Reset Role
          </button>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .preview-banner {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 56px; /* Fixed height for consistent spacing */
    z-index: 9998;
    background: linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%);
    border-bottom: 2px solid #3b82f6;
    box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
  }

  /* Role override only - amber/orange theme */
  .preview-banner.role-only {
    background: linear-gradient(135deg, #78350f 0%, #b45309 100%);
    border-bottom-color: #f59e0b;
    box-shadow: 0 4px 20px rgba(245, 158, 11, 0.3);
  }

  .preview-banner.role-only .banner-icon {
    background: rgba(251, 191, 36, 0.2);
    color: #fcd34d;
  }

  .preview-banner.role-only .banner-label {
    color: #fcd34d;
  }

  .banner-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    height: 100%;
    padding: 0 20px;
    max-width: 100%;
  }

  .banner-left {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }

  .banner-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 10px;
    color: #93c5fd;
    font-size: 16px;
    flex-shrink: 0;
  }

  .banner-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .banner-label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #93c5fd;
  }

  .banner-user {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.9);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .banner-user strong {
    color: white;
    font-weight: 600;
  }

  .role-badge {
    display: inline-flex;
    padding: 2px 6px;
    margin-left: 8px;
    background: rgba(251, 191, 36, 0.2);
    border: 1px solid rgba(251, 191, 36, 0.4);
    border-radius: 4px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    color: #fcd34d;
  }

  .role-name {
    text-transform: capitalize;
  }

  .actual-role {
    margin-left: 8px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    font-weight: 400;
  }

  .role-override-badge {
    display: inline-flex;
    padding: 2px 6px;
    margin-left: 8px;
    background: rgba(245, 158, 11, 0.2);
    border: 1px solid rgba(245, 158, 11, 0.4);
    border-radius: 4px;
    font-size: 10px;
    font-weight: 700;
    text-transform: capitalize;
    color: #fbbf24;
  }

  .banner-stats {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .stat {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
  }

  .stat i {
    color: #93c5fd;
    font-size: 11px;
  }

  .banner-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }

  .read-only-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 6px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    color: #fca5a5;
  }

  .testing-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    background: rgba(168, 85, 247, 0.15);
    border: 1px solid rgba(168, 85, 247, 0.3);
    border-radius: 6px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    color: #c4b5fd;
  }

  .clear-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: white;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
  }

  .clear-btn:hover {
    background: rgba(239, 68, 68, 0.3);
    border-color: rgba(239, 68, 68, 0.5);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .preview-banner {
      height: 48px; /* Smaller on mobile */
    }

    .banner-content {
      padding: 0 12px;
      gap: 10px;
    }

    .banner-stats {
      display: none;
    }

    .banner-icon {
      width: 32px;
      height: 32px;
      font-size: 14px;
    }

    .banner-user {
      font-size: 13px;
    }

    .read-only-badge {
      padding: 4px 8px;
      font-size: 10px;
    }

    .clear-btn {
      padding: 6px 10px;
      font-size: 12px;
    }
  }

  @media (max-width: 480px) {
    .clear-btn {
      padding: 8px;
    }
  }
</style>
