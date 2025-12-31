<!-- ProfileHeroSection.svelte - Profile avatar, name, email, and sign-out button -->
<script lang="ts">
  import RobustAvatar from "../../../../components/avatar/RobustAvatar.svelte";
  import { updateProfile, type User } from "firebase/auth";
  import { resolve, TYPES } from "../../../../inversify/di";
  import type { IHapticFeedback } from "../../../../application/services/contracts/IHapticFeedback";
  import { onMount } from "svelte";

  interface Props {
    user: User;
    onSignOut: () => void;
    disabled?: boolean;
  }

  let { user, onSignOut, disabled = false }: Props = $props();

  // Editing state
  let isEditing = $state(false);
  let editedName = $state(user.displayName || "");
  let inputElement: HTMLInputElement | null = $state(null);
  let isSaving = $state(false);
  let hapticService: IHapticFeedback | null = $state(null);

  onMount(() => {
    hapticService = resolve<IHapticFeedback>(TYPES.IHapticFeedback);
  });

  // Focus input when editing starts
  $effect(() => {
    if (isEditing && inputElement) {
      inputElement.focus();
      inputElement.select();
    }
  });

  function startEditing() {
    if (disabled) return;
    editedName = user.displayName || "";
    isEditing = true;
    hapticService?.trigger("selection");
  }

  function cancelEditing() {
    isEditing = false;
    editedName = user.displayName || "";
  }

  async function saveDisplayName() {
    const trimmedName = editedName.trim();
    if (!trimmedName || trimmedName === user.displayName) {
      cancelEditing();
      return;
    }

    isSaving = true;
    try {
      await updateProfile(user, { displayName: trimmedName });
      hapticService?.trigger("success");
      isEditing = false;
      // Force reactivity by updating local state
      // The user object is updated in place by Firebase
    } catch (error) {
      console.error("Failed to update display name:", error);
      hapticService?.trigger("error");
    } finally {
      isSaving = false;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      saveDisplayName();
    } else if (e.key === "Escape") {
      cancelEditing();
    }
  }
</script>

<section class="glass-card profile-card">
  <div class="profile-hero">
    <div class="avatar-wrapper">
      <RobustAvatar
        src={user.photoURL}
        name={user.displayName || user.email}
        alt={user.displayName || "User"}
        size="xl"
      />
    </div>
    <div class="profile-info">
      {#if isEditing}
        <div class="name-edit-row">
          <input
            bind:this={inputElement}
            type="text"
            class="name-input"
            bind:value={editedName}
            onkeydown={handleKeydown}
            onblur={saveDisplayName}
            maxlength="50"
            placeholder="Your name"
            disabled={isSaving}
          />
          {#if isSaving}
            <div class="saving-indicator">
              <i class="fas fa-spinner fa-spin" aria-hidden="true"></i>
            </div>
          {/if}
        </div>
      {:else}
        <div class="name-row">
          <h2 class="profile-name">{user.displayName || "Add your name"}</h2>
          {#if !disabled}
            <button
              class="edit-name-btn"
              onclick={startEditing}
              aria-label="Edit display name"
            >
              <i class="fas fa-pen" aria-hidden="true"></i>
            </button>
          {/if}
        </div>
      {/if}
      {#if user.email}
        <p class="profile-email">{user.email}</p>
      {/if}
    </div>
    {#if !disabled}
      <button class="sign-out-btn" onclick={onSignOut}>
        <i class="fas fa-sign-out-alt" aria-hidden="true"></i>
        <span>Sign Out</span>
      </button>
    {/if}
  </div>
</section>

<style>
  /* ========================================
     GLASS CARD BASE
     ======================================== */
  .glass-card {
    display: flex;
    flex-direction: column;
    gap: clamp(12px, 2.5cqi, 16px);
    padding: clamp(14px, 2.5cqi, 24px);
    border-radius: clamp(12px, 3cqi, 16px);
    background: var(--theme-card-bg);
    border: 1px solid var(--theme-stroke);
    transition:
      background 0.2s ease,
      border-color 0.2s ease,
      box-shadow 0.2s ease,
      transform 0.2s ease;
  }

  .glass-card:hover {
    background: var(--theme-card-hover-bg);
    border-color: var(--theme-stroke-strong);
    transform: translateY(-1px);
    box-shadow: var(--theme-shadow);
  }

  /* ========================================
     PROFILE HERO
     ======================================== */
  .profile-hero {
    display: flex;
    align-items: center;
    gap: clamp(12px, 2.5cqi, 24px);
    flex-wrap: wrap;
  }

  .avatar-wrapper {
    width: clamp(64px, 14cqi, 100px);
    height: clamp(64px, 14cqi, 100px);
    border-radius: 50%;
    overflow: hidden;
    padding: 3px;
    background: linear-gradient(
      135deg,
      var(--theme-accent) 0%,
      var(--theme-accent-strong) 100%
    );
    box-shadow: 0 0 32px
      color-mix(in srgb, var(--theme-accent) 25%, transparent);
    flex-shrink: 0;
  }

  .avatar-wrapper :global(img),
  .avatar-wrapper :global(.avatar-fallback) {
    border-radius: 50%;
  }

  .profile-info {
    flex: 1;
    min-width: 140px;
  }

  .name-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .profile-name {
    font-size: clamp(18px, 3.5cqi, 28px);
    font-weight: 700;
    color: var(--theme-text);
    margin: 0;
    font-family:
      -apple-system,
      BlinkMacSystemFont,
      "SF Pro Display",
      system-ui,
      sans-serif;
  }

  .edit-name-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    color: var(--theme-text-dim);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.15s ease;
    flex-shrink: 0;
  }

  .edit-name-btn:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.25);
    color: var(--theme-text);
  }

  .edit-name-btn:active {
    transform: scale(0.95);
  }

  .name-edit-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }

  .name-input {
    flex: 1;
    min-width: 0;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.08);
    border: 2px solid var(--theme-accent, #8b5cf6);
    border-radius: 10px;
    color: var(--theme-text);
    font-size: clamp(16px, 3cqi, 22px);
    font-weight: 600;
    font-family: inherit;
    outline: none;
    transition: all 0.15s ease;
  }

  .name-input::placeholder {
    color: var(--theme-text-dim);
    opacity: 0.6;
  }

  .name-input:focus {
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--theme-accent) 25%, transparent);
  }

  .name-input:disabled {
    opacity: 0.6;
  }

  .saving-indicator {
    color: var(--theme-accent);
    font-size: 14px;
  }

  .profile-email {
    font-size: clamp(12px, 2cqi, 15px);
    color: var(--theme-text-dim);
    margin: 0;
  }

  .sign-out-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: var(--min-touch-target);
    padding: 12px 20px;
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.4);
    border-radius: 12px;
    color: #fca5a5;
    font-size: var(--font-size-sm);
    font-weight: 600;
    cursor: pointer;
    transition: all 150ms ease;
    flex-shrink: 0;
  }

  .sign-out-btn:hover {
    background: rgba(239, 68, 68, 0.25);
    border-color: rgba(239, 68, 68, 0.6);
    color: #fecaca;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(239, 68, 68, 0.2);
  }

  .sign-out-btn:active {
    transform: scale(0.97);
  }

  .sign-out-btn:focus-visible {
    outline: 2px solid var(--theme-accent);
    outline-offset: 2px;
  }

  /* Mobile: Stack profile */
  @container profile-tab (max-width: 420px) {
    .profile-hero {
      flex-direction: column;
      text-align: center;
      gap: 16px;
    }

    .profile-info {
      min-width: 100%;
    }

    .sign-out-btn {
      width: 100%;
    }
  }

  /* Very small screens: more compact */
  @container profile-tab (max-width: 360px) {
    .profile-hero {
      gap: 12px;
    }

    .profile-name {
      font-size: var(--font-size-base);
    }

    .profile-email {
      font-size: var(--font-size-compact);
    }
  }

  /* ========================================
     ACCESSIBILITY
     ======================================== */
  @media (prefers-reduced-motion: reduce) {
    .glass-card,
    .sign-out-btn {
      transition: none;
    }

    .glass-card:hover,
    .sign-out-btn:hover {
      transform: none;
    }
  }

  @media (prefers-contrast: high) {
    .glass-card,
    .sign-out-btn {
      border-width: 2px;
    }
  }
</style>
