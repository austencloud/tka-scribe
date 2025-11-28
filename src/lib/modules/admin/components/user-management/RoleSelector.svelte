<script lang="ts">
  /**
   * RoleSelector
   * Grid of role options for changing user role
   */
  import type { UserRole } from "$shared/auth/domain/models/UserRole";
  import { ROLE_DISPLAY, ROLE_HIERARCHY } from "$shared/auth/domain/models/UserRole";
  import type { UserData } from "./types";

  interface Props {
    user: UserData;
    isDisabled?: boolean;
    onRoleChange: (newRole: UserRole) => void;
  }

  let { user, isDisabled = false, onRoleChange }: Props = $props();
</script>

<div class="role-selector">
  {#each ROLE_HIERARCHY as role}
    <button
      class="role-option"
      class:selected={user.role === role}
      style="--role-color: {ROLE_DISPLAY[role].color}"
      onclick={() => {
        if (user.role !== role) {
          onRoleChange(role);
        }
      }}
      disabled={isDisabled || user.role === role}
    >
      <i class="fas {ROLE_DISPLAY[role].icon}"></i>
      <span>{ROLE_DISPLAY[role].label}</span>
    </button>
  {/each}
</div>

<style>
  .role-selector {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .role-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 16px 12px;
    background: rgba(255, 255, 255, 0.03);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
    color: rgba(255, 255, 255, 0.7);
    font-size: 13px;
  }

  .role-option i {
    font-size: 20px;
    color: var(--role-color, rgba(255, 255, 255, 0.5));
    transition: all 0.2s;
  }

  .role-option:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.08);
    border-color: var(--role-color);
  }

  .role-option:hover:not(:disabled) i {
    transform: scale(1.1);
  }

  .role-option.selected {
    background: color-mix(in srgb, var(--role-color) 15%, transparent);
    border-color: var(--role-color);
    color: white;
  }

  .role-option.selected i {
    color: var(--role-color);
  }

  .role-option:disabled {
    cursor: default;
  }
</style>
