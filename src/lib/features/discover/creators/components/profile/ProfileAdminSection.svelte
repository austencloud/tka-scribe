<script lang="ts">
  /**
   * ProfileAdminSection - Admin controls for user profile
   *
   * Self-contained admin actions that call Firestore directly.
   * Only visible to admins viewing another user's profile.
   */

  import { doc, updateDoc, writeBatch } from "firebase/firestore";
  import { getFirestoreInstance } from "$lib/shared/auth/firebase";
  import type { UserRole } from "$lib/shared/auth/domain/models/UserRole";
  import { ROLE_DISPLAY, ROLE_HIERARCHY } from "$lib/shared/auth/domain/models/UserRole";
  import type { EnhancedUserProfile } from "$lib/shared/community/domain/models/enhanced-user-profile";

  interface Props {
    userProfile: EnhancedUserProfile;
    onUserUpdated?: (updates: Partial<EnhancedUserProfile>) => void;
  }

  let { userProfile, onUserUpdated }: Props = $props();

  // State
  let isActionPending = $state(false);
  let actionError = $state<string | null>(null);
  let confirmAction = $state<{ type: string; message: string } | null>(null);

  async function changeRole(newRole: UserRole) {
    if (isActionPending || userProfile.role === newRole) return;

    isActionPending = true;
    actionError = null;

    try {
      const firestore = await getFirestoreInstance();
      const userRef = doc(firestore, "users", userProfile.id);
      await updateDoc(userRef, {
        role: newRole,
        isAdmin: newRole === "admin",
      });
      onUserUpdated?.({ role: newRole });
    } catch (err) {
      console.error("[ProfileAdminSection] Failed to change role:", err);
      actionError = "Failed to update role";
    } finally {
      isActionPending = false;
    }
  }

  async function toggleDisabled() {
    if (isActionPending) return;

    isActionPending = true;
    actionError = null;

    try {
      const firestore = await getFirestoreInstance();
      const currentlyDisabled = userProfile.isDisabled ?? false;
      const userRef = doc(firestore, "users", userProfile.id);
      await updateDoc(userRef, {
        isDisabled: !currentlyDisabled,
      });
      onUserUpdated?.({ isDisabled: !currentlyDisabled });
    } catch (err) {
      console.error("[ProfileAdminSection] Failed to toggle disabled:", err);
      actionError = "Failed to update account status";
    } finally {
      isActionPending = false;
      confirmAction = null;
    }
  }

  async function resetUserData() {
    if (isActionPending) return;

    isActionPending = true;
    actionError = null;

    try {
      const firestore = await getFirestoreInstance();
      const batch = writeBatch(firestore);

      // Reset user stats
      const userRef = doc(firestore, "users", userProfile.id);
      batch.update(userRef, {
        totalXP: 0,
        currentLevel: 1,
        achievementCount: 0,
        currentStreak: 0,
        longestStreak: 0,
      });

      // Delete XP document
      const xpRef = doc(firestore, `users/${userProfile.id}/xp/current`);
      batch.delete(xpRef);

      // Delete streak document
      const streakRef = doc(firestore, `users/${userProfile.id}/streak/current`);
      batch.delete(streakRef);

      await batch.commit();

      onUserUpdated?.({
        totalXP: 0,
        currentLevel: 1,
      });
    } catch (err) {
      console.error("[ProfileAdminSection] Failed to reset data:", err);
      actionError = "Failed to reset user data";
    } finally {
      isActionPending = false;
      confirmAction = null;
    }
  }

  function handleConfirm() {
    if (!confirmAction) return;

    switch (confirmAction.type) {
      case "disable":
        toggleDisabled();
        break;
      case "reset":
        resetUserData();
        break;
    }
  }
</script>

<section class="admin-section">
  <h3 class="section-title">
    <i class="fas fa-shield-halved"></i>
    Admin Controls
  </h3>

  {#if actionError}
    <div class="error-banner">
      <i class="fas fa-exclamation-triangle"></i>
      {actionError}
      <button onclick={() => (actionError = null)} aria-label="Dismiss">
        <i class="fas fa-times"></i>
      </button>
    </div>
  {/if}

  <!-- Role Management -->
  <div class="control-group" role="group" aria-labelledby="role-label">
    <span id="role-label" class="control-label">User Role</span>
    <div class="role-buttons">
      {#each ROLE_HIERARCHY as role}
        <button
          class="role-btn"
          class:active={userProfile.role === role}
          disabled={isActionPending}
          onclick={() => changeRole(role)}
          style="--role-color: {ROLE_DISPLAY[role].color}"
        >
          <i class="fas {ROLE_DISPLAY[role].icon}"></i>
          {ROLE_DISPLAY[role].label}
        </button>
      {/each}
    </div>
  </div>

  <!-- Account Actions -->
  <div class="control-group" role="group" aria-labelledby="actions-label">
    <span id="actions-label" class="control-label">Account Actions</span>
    <div class="action-buttons">
      <button
        class="action-btn"
        class:danger={!userProfile.isDisabled}
        class:success={userProfile.isDisabled}
        disabled={isActionPending}
        onclick={() => {
          confirmAction = {
            type: "disable",
            message: userProfile.isDisabled
              ? `Enable ${userProfile.displayName}'s account?`
              : `Disable ${userProfile.displayName}'s account? They won't be able to log in.`,
          };
        }}
      >
        <i class="fas {userProfile.isDisabled ? 'fa-check-circle' : 'fa-ban'}"></i>
        {userProfile.isDisabled ? "Enable Account" : "Disable Account"}
      </button>

      <button
        class="action-btn danger"
        disabled={isActionPending}
        onclick={() => {
          confirmAction = {
            type: "reset",
            message: `Reset all progress for ${userProfile.displayName}? This will clear XP, level, achievements, and streaks.`,
          };
        }}
      >
        <i class="fas fa-rotate-left"></i>
        Reset Progress
      </button>
    </div>
  </div>
</section>

<!-- Confirmation Modal -->
{#if confirmAction}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div class="modal-backdrop" onclick={() => (confirmAction = null)}>
    <div class="modal" onclick={(e) => e.stopPropagation()}>
      <p class="modal-message">{confirmAction.message}</p>
      <div class="modal-actions">
        <button
          class="modal-btn cancel"
          onclick={() => (confirmAction = null)}
          disabled={isActionPending}
        >
          Cancel
        </button>
        <button
          class="modal-btn confirm"
          onclick={handleConfirm}
          disabled={isActionPending}
        >
          {#if isActionPending}
            <i class="fas fa-spinner fa-spin"></i>
          {:else}
            Confirm
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .admin-section {
    margin-top: 24px;
    padding: 20px;
    background: rgba(239, 68, 68, 0.05);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 12px;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: 600;
    color: #fca5a5;
  }

  .error-banner {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    margin-bottom: 16px;
    background: rgba(239, 68, 68, 0.15);
    border-radius: 8px;
    color: #fca5a5;
    font-size: 13px;
  }

  .error-banner button {
    margin-left: auto;
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    padding: 4px;
  }

  .control-group {
    margin-bottom: 16px;
  }

  .control-group:last-child {
    margin-bottom: 0;
  }

  .control-label {
    display: block;
    margin-bottom: 8px;
    font-size: 12px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .role-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .role-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .role-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.08);
    border-color: var(--role-color, rgba(255, 255, 255, 0.2));
  }

  .role-btn.active {
    background: color-mix(in srgb, var(--role-color) 20%, transparent);
    border-color: var(--role-color);
    color: var(--role-color);
  }

  .role-btn:disabled {
    opacity: 0.6;
    cursor: wait;
  }

  .action-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .action-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.08);
  }

  .action-btn.danger:hover:not(:disabled) {
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.3);
    color: #fca5a5;
  }

  .action-btn.success:hover:not(:disabled) {
    background: rgba(34, 197, 94, 0.1);
    border-color: rgba(34, 197, 94, 0.3);
    color: #86efac;
  }

  .action-btn:disabled {
    opacity: 0.6;
    cursor: wait;
  }

  /* Modal */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
  }

  .modal {
    background: #1a1a2e;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 24px;
    max-width: 400px;
    width: 100%;
  }

  .modal-message {
    margin: 0 0 20px 0;
    font-size: 15px;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.9);
  }

  .modal-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }

  .modal-btn {
    padding: 10px 18px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .modal-btn.cancel {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.7);
  }

  .modal-btn.cancel:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .modal-btn.confirm {
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid rgba(239, 68, 68, 0.4);
    color: #fca5a5;
  }

  .modal-btn.confirm:hover {
    background: rgba(239, 68, 68, 0.3);
  }

  .modal-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
