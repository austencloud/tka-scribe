<!--
  OverviewTab.svelte - Account Overview Tab

  Shows user profile info, stats, and achievements summary.
  For guests: prompts to sign in or continue as guest.
-->
<script lang="ts">
  import { authStore } from "../../../shared/auth/stores/authStore.svelte";
  import { libraryState } from "../../library/state/library-state.svelte";
  import { onMount } from "svelte";

  // Stats derived from library state
  const sequenceCount = $derived(libraryState.sequences.length);
  const favoriteCount = $derived(
    libraryState.sequences.filter((s) => s.isFavorite).length
  );

  // Load library data on mount if authenticated
  onMount(() => {
    if (authStore.effectiveUserId) {
      libraryState.loadSequences();
    }
  });
</script>

<div class="overview-tab">
  {#if authStore.isAuthenticated && authStore.user}
    <!-- Authenticated User View -->
    <div class="profile-header">
      <!-- Avatar -->
      <div class="avatar-container">
        {#if authStore.user.photoURL}
          <img
            src={authStore.user.photoURL}
            alt={authStore.user.displayName || "User"}
            class="avatar-image"
            crossorigin="anonymous"
            referrerpolicy="no-referrer"
          />
        {:else}
          <div class="avatar-placeholder">
            {(authStore.user.displayName || authStore.user.email || "?")
              .charAt(0)
              .toUpperCase()}
          </div>
        {/if}
      </div>

      <!-- User Info -->
      <div class="user-info">
        {#if authStore.user.displayName}
          <h1 class="user-name">{authStore.user.displayName}</h1>
        {/if}
        {#if authStore.user.email}
          <p class="user-email">{authStore.user.email}</p>
        {/if}
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-layer-group"></i>
        </div>
        <div class="stat-content">
          <span class="stat-value">{sequenceCount}</span>
          <span class="stat-label">Sequences</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon favorites">
          <i class="fas fa-star"></i>
        </div>
        <div class="stat-content">
          <span class="stat-value">{favoriteCount}</span>
          <span class="stat-label">Favorites</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon collections">
          <i class="fas fa-folder"></i>
        </div>
        <div class="stat-content">
          <span class="stat-value">0</span>
          <span class="stat-label">Collections</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon achievements">
          <i class="fas fa-trophy"></i>
        </div>
        <div class="stat-content">
          <span class="stat-value">0</span>
          <span class="stat-label">Achievements</span>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <h3 class="section-title">Quick Actions</h3>
      <div class="action-buttons">
        <button class="action-btn" onclick={() => window.location.hash = '#create'}>
          <i class="fas fa-plus"></i>
          Create Sequence
        </button>
        <button class="action-btn" onclick={() => window.location.hash = '#discover'}>
          <i class="fas fa-compass"></i>
          Discover
        </button>
      </div>
    </div>
  {:else}
    <!-- Guest View -->
    <div class="guest-view">
      <div class="guest-icon">
        <i class="fas fa-user-circle"></i>
      </div>
      <h2>Welcome to TKA Studio</h2>
      <p>Sign in to save your sequences, sync across devices, and track your progress.</p>

      <div class="guest-options">
        <p class="guest-note">
          <i class="fas fa-info-circle"></i>
          You can still use the app as a guest. Your preferences will be saved locally.
        </p>
      </div>
    </div>
  {/if}
</div>

<style>
  .overview-tab {
    padding: 24px;
    max-width: 800px;
    margin: 0 auto;
    overflow-y: auto;
    height: 100%;
  }

  /* Profile Header */
  .profile-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 32px 24px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    margin-bottom: 24px;
  }

  .avatar-container {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    overflow: hidden;
    border: 3px solid rgba(255, 255, 255, 0.2);
  }

  .avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
    font-weight: 700;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .user-info {
    text-align: center;
  }

  .user-name {
    margin: 0 0 4px 0;
    font-size: 24px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
  }

  .user-email {
    margin: 0;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
  }

  /* Stats Grid */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    background: rgba(99, 102, 241, 0.15);
    color: #6366f1;
    font-size: 18px;
  }

  .stat-icon.favorites {
    background: rgba(245, 158, 11, 0.15);
    color: #f59e0b;
  }

  .stat-icon.collections {
    background: rgba(16, 185, 129, 0.15);
    color: #10b981;
  }

  .stat-icon.achievements {
    background: rgba(236, 72, 153, 0.15);
    color: #ec4899;
  }

  .stat-content {
    display: flex;
    flex-direction: column;
  }

  .stat-value {
    font-size: 24px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    line-height: 1.2;
  }

  .stat-label {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
  }

  /* Quick Actions */
  .quick-actions {
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 20px;
  }

  .section-title {
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
  }

  .action-buttons {
    display: flex;
    gap: 12px;
  }

  .action-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 16px;
    background: rgba(99, 102, 241, 0.15);
    border: 1px solid rgba(99, 102, 241, 0.3);
    border-radius: 10px;
    color: #a5b4fc;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .action-btn:hover {
    background: rgba(99, 102, 241, 0.25);
    border-color: rgba(99, 102, 241, 0.5);
  }

  /* Guest View */
  .guest-view {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 48px 24px;
    min-height: 400px;
  }

  .guest-icon {
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(118, 75, 162, 0.15));
    border: 2px solid rgba(99, 102, 241, 0.3);
    margin-bottom: 24px;
  }

  .guest-icon i {
    font-size: 40px;
    color: rgba(99, 102, 241, 0.9);
  }

  .guest-view h2 {
    margin: 0 0 12px 0;
    font-size: 24px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
  }

  .guest-view p {
    margin: 0;
    font-size: 15px;
    color: rgba(255, 255, 255, 0.6);
    max-width: 400px;
    line-height: 1.5;
  }

  .guest-options {
    margin-top: 32px;
  }

  .guest-note {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
  }

  .guest-note i {
    color: rgba(99, 102, 241, 0.7);
  }

  /* Responsive */
  @media (max-width: 480px) {
    .overview-tab {
      padding: 16px;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .action-buttons {
      flex-direction: column;
    }
  }
</style>
