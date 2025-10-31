<!--
  PersonalTab Component

  Handles personal information editing: profile photo, display name, email.
  Features sticky footer with save button and adaptive layout.
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "$shared";
  import { authStore } from "$shared/auth";
  import {
    personalInfoState,
    uiState,
    isCompactMode,
    isVeryCompactMode,
  } from "../../state/profile-settings-state.svelte";
  import ProfilePhotoUpload from "./ProfilePhotoUpload.svelte";

  let { onSave, onPhotoUpload, hapticService } = $props<{
    onSave: () => Promise<void>;
    onPhotoUpload: (file: File) => Promise<void>;
    hapticService: IHapticFeedbackService | null;
  }>();

  // Sync with auth store
  $effect(() => {
    if (authStore.user) {
      personalInfoState.displayName = authStore.user.displayName || "";
      personalInfoState.email = authStore.user.email || "";
    }
  });
</script>

<section
  class="section section--with-footer"
  class:compact={isCompactMode()}
  class:very-compact={isVeryCompactMode()}
>
  <!-- Scrollable form content -->
  <div class="form-content">
    <h3 class="section-title">
      <i class="fas fa-user"></i>
      Personal Information
    </h3>

    <!-- Profile Photo -->
    <ProfilePhotoUpload {onPhotoUpload} {hapticService} />

    <!-- Display Name -->
    <div class="field">
      <label class="label" for="display-name">Display Name</label>
      <input
        id="display-name"
        type="text"
        class="input"
        bind:value={personalInfoState.displayName}
        placeholder="Enter your display name"
      />
    </div>

    <!-- Email (read-only) -->
    <div class="field">
      <label class="label" for="email">Email</label>
      <input
        id="email"
        type="email"
        class="input"
        value={personalInfoState.email}
        readonly
        disabled
      />
      <p class="hint">Email cannot be changed at this time</p>
    </div>
  </div>

  <!-- Sticky footer with save button -->
  <div class="footer">
    <button
      class="button button--primary"
      onclick={onSave}
      disabled={uiState.saving}
    >
      <i class="fas fa-save"></i>
      {uiState.saving ? "Saving..." : "Save Changes"}
    </button>
  </div>
</section>

<style>
  /* Section Layout */
  .section {
    min-height: 100%;
    display: flex;
    flex-direction: column;
  }

  .section--with-footer {
    height: 100%;
    min-height: 100%;
  }

  .section-title {
    display: none; /* Hide since tabs show the title */
  }

  .form-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 24px;
    min-height: 0;
    transition: padding 0.2s ease;
  }

  .section.compact .form-content {
    padding: 18px;
  }

  .section.very-compact .form-content {
    padding: 12px;
  }

  .footer {
    flex-shrink: 0;
    padding: 16px 24px;
    background: linear-gradient(
      to top,
      rgba(20, 25, 35, 0.98) 0%,
      rgba(20, 25, 35, 0.95) 50%,
      rgba(20, 25, 35, 0) 100%
    );
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    transition: padding 0.2s ease;
  }

  .section.compact .footer {
    padding: 14px 18px;
  }

  .section.very-compact .footer {
    padding: 10px 12px;
  }

  .footer :global(.button) {
    margin-top: 0;
  }

  /* Form Fields */
  :global(.field) {
    margin-bottom: 20px;
  }

  .section.compact :global(.field) {
    margin-bottom: 14px;
  }

  .section.very-compact :global(.field) {
    margin-bottom: 10px;
  }

  :global(.label) {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 8px;
    transition: all 0.2s ease;
  }

  .section.compact :global(.label) {
    font-size: 13px;
    margin-bottom: 6px;
  }

  .section.very-compact :global(.label) {
    font-size: 12px;
    margin-bottom: 4px;
  }

  :global(.input) {
    width: 100%;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.95);
    font-size: 15px;
    transition: all 0.2s ease;
  }

  .section.compact :global(.input) {
    padding: 10px 14px;
    font-size: 14px;
    border-radius: 6px;
  }

  .section.very-compact :global(.input) {
    padding: 8px 12px;
    font-size: 13px;
    border-radius: 6px;
  }

  :global(.input:focus) {
    outline: none;
    border-color: rgba(99, 102, 241, 0.6);
    background: rgba(255, 255, 255, 0.08);
  }

  :global(.input:disabled) {
    opacity: 0.5;
    cursor: not-allowed;
  }

  :global(.hint) {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
    margin: 6px 0 0 0;
    transition: all 0.2s ease;
  }

  .section.compact :global(.hint) {
    font-size: 12px;
    margin: 4px 0 0 0;
  }

  .section.very-compact :global(.hint) {
    font-size: 11px;
    margin: 3px 0 0 0;
  }

  /* Button */
  :global(.button) {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 14px 24px;
    min-height: 48px;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
    margin-top: 8px;
  }

  .section.compact :global(.button) {
    padding: 12px 20px;
    min-height: 42px;
    font-size: 14px;
    gap: 8px;
    border-radius: 8px;
    margin-top: 6px;
  }

  .section.very-compact :global(.button) {
    padding: 10px 18px;
    min-height: 38px;
    font-size: 13px;
    gap: 6px;
    border-radius: 8px;
    margin-top: 4px;
  }

  :global(.button i) {
    font-size: 16px;
    transition: font-size 0.2s ease;
  }

  .section.compact :global(.button i) {
    font-size: 14px;
  }

  .section.very-compact :global(.button i) {
    font-size: 13px;
  }

  :global(.button--primary) {
    background: linear-gradient(135deg, #6366f1, #4f46e5);
    color: white;
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
  }

  :global(.button--primary:hover:not(:disabled)) {
    background: linear-gradient(135deg, #4f46e5, #4338ca);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
  }

  :global(.button:active:not(:disabled)) {
    transform: scale(0.98);
  }

  :global(.button:disabled) {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }

  /* Mobile Responsive */
  @media (max-width: 480px) {
    .form-content {
      padding: 16px;
    }

    .footer {
      padding: 12px 16px;
    }
  }

  /* Accessibility */
  @media (prefers-reduced-motion: reduce) {
    :global(.button) {
      transition: none;
    }

    :global(.button:hover),
    :global(.button:active) {
      transform: none;
    }
  }
</style>
