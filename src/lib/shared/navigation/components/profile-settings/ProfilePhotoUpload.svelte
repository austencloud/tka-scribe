<!--
  ProfilePhotoUpload Component

  Displays user profile photo with upload functionality.
  Features horizontal layout with photo preview and upload button.
-->
<script lang="ts">
  import { authStore } from "$shared/auth";
  import type { IHapticFeedbackService } from "$shared";
  import {
    isCompactMode,
    isVeryCompactMode,
    uiState,
  } from "../../state/profile-settings-state.svelte";

  let { onPhotoUpload, hapticService } = $props<{
    onPhotoUpload: (file: File) => Promise<void>;
    hapticService: IHapticFeedbackService | null;
  }>();

  let displayName = $derived(authStore.user?.displayName || "");
  let email = $derived(authStore.user?.email || "");

  function triggerFileInput() {
    hapticService?.trigger("selection");
    document.getElementById("photo-upload")?.click();
  }

  async function handlePhotoUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    await onPhotoUpload(file);
  }
</script>

<div
  class="photo-container"
  class:compact={isCompactMode()}
  class:very-compact={isVeryCompactMode()}
>
  <div class="photo-wrapper">
    {#if authStore.user?.photoURL}
      <img
        src={authStore.user.photoURL}
        alt={authStore.user.displayName || "User"}
        class="photo"
      />
    {:else}
      <div class="photo-placeholder">
        {(displayName || email || "?").charAt(0).toUpperCase()}
      </div>
    {/if}
  </div>

  <div class="photo-info">
    <h4 class="photo-title">Profile Photo</h4>
    <p class="photo-hint">JPG, PNG or GIF. Max size 2MB.</p>
    <button
      class="photo-button"
      onclick={triggerFileInput}
      disabled={uiState.uploadingPhoto}
    >
      <i class="fas fa-camera"></i>
      {uiState.uploadingPhoto ? "Uploading..." : "Change Photo"}
    </button>
  </div>

  <input
    id="photo-upload"
    type="file"
    accept="image/*"
    onchange={handlePhotoUpload}
    style="display: none;"
  />
</div>

<style>
  .photo-container {
    display: flex;
    align-items: center;
    gap: 24px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    margin-bottom: 24px;
    transition: all 0.2s ease;
  }

  .photo-container.compact {
    gap: 16px;
    padding: 14px;
    margin-bottom: 16px;
  }

  .photo-container.very-compact {
    gap: 12px;
    padding: 10px;
    margin-bottom: 12px;
  }

  .photo-wrapper {
    flex-shrink: 0;
  }

  .photo {
    width: 96px;
    height: 96px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid rgba(255, 255, 255, 0.15);
    display: block;
    transition: all 0.2s ease;
  }

  .photo-container.compact .photo {
    width: 72px;
    height: 72px;
    border-width: 2px;
  }

  .photo-container.very-compact .photo {
    width: 60px;
    height: 60px;
    border-width: 2px;
  }

  .photo-placeholder {
    width: 96px;
    height: 96px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6366f1, #4f46e5);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    font-weight: 600;
    color: white;
    border: 3px solid rgba(255, 255, 255, 0.15);
    transition: all 0.2s ease;
  }

  .photo-container.compact .photo-placeholder {
    width: 72px;
    height: 72px;
    font-size: 28px;
    border-width: 2px;
  }

  .photo-container.very-compact .photo-placeholder {
    width: 60px;
    height: 60px;
    font-size: 24px;
    border-width: 2px;
  }

  .photo-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    transition: gap 0.2s ease;
  }

  .photo-container.compact .photo-info {
    gap: 6px;
  }

  .photo-container.very-compact .photo-info {
    gap: 4px;
  }

  .photo-title {
    font-size: 16px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    margin: 0;
    transition: font-size 0.2s ease;
  }

  .photo-container.compact .photo-title {
    font-size: 15px;
  }

  .photo-container.very-compact .photo-title {
    font-size: 14px;
  }

  .photo-hint {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
    margin: 0;
    transition: font-size 0.2s ease;
  }

  .photo-container.compact .photo-hint {
    font-size: 12px;
  }

  .photo-container.very-compact .photo-hint {
    font-size: 11px;
  }

  .photo-button {
    align-self: flex-start;
    padding: 10px 20px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
  }

  .photo-container.compact .photo-button {
    padding: 8px 16px;
    font-size: 13px;
    gap: 6px;
    border-radius: 6px;
    margin-top: 2px;
  }

  .photo-container.very-compact .photo-button {
    padding: 6px 14px;
    font-size: 12px;
    gap: 5px;
    border-radius: 6px;
    margin-top: 0;
  }

  .photo-button:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.25);
    transform: translateY(-1px);
  }

  .photo-button:active:not(:disabled) {
    transform: translateY(0);
  }

  .photo-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Mobile Responsive */
  @media (max-width: 480px) {
    .photo-container {
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 16px;
      gap: 16px;
    }

    .photo-info {
      align-items: center;
    }

    .photo-button {
      align-self: stretch;
    }
  }

  /* Accessibility */
  @media (prefers-reduced-motion: reduce) {
    .photo-button {
      transition: none;
    }

    .photo-button:hover,
    .photo-button:active {
      transform: none;
    }
  }
</style>
