<script lang="ts">
  import type { UserRole } from "$lib/shared/auth/domain/models/UserRole";
  import {
    ROLE_HIERARCHY,
    ROLE_DISPLAY,
  } from "$lib/shared/auth/domain/models/UserRole";
  import { getRoleColor, getRoleIcon } from "../utils";

  interface Props {
    selectedRole: UserRole;
    onRoleChange: (role: UserRole) => void;
  }

  let { selectedRole, onRoleChange }: Props = $props();
</script>

<div class="form-field" role="radiogroup" aria-labelledby="role-label">
  <span id="role-label" class="field-label">Minimum Role</span>
  <div class="role-chips">
    {#each ROLE_HIERARCHY as role}
      <button
        class="role-chip"
        class:selected={selectedRole === role}
        style="--role-color: {getRoleColor(role)}"
        onclick={() => onRoleChange(role)}
        type="button"
        role="radio"
        aria-checked={selectedRole === role}
      >
        <i class="fas {getRoleIcon(role)}"></i>
        <span>{ROLE_DISPLAY[role].label}</span>
      </button>
    {/each}
  </div>
</div>

<style>
  .form-field {
    display: flex;
    flex-direction: column;
    gap: var(--settings-space-sm);
  }

  .field-label {
    font-size: var(--text-2026-caption);
    font-weight: var(--settings-font-weight-semibold);
    color: var(--theme-text-dim);
  }

  .role-chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2026-xs);
  }

  @media (min-width: 480px) {
    .role-chips {
      gap: var(--settings-space-sm);
    }
  }

  .role-chip {
    display: flex;
    align-items: center;
    gap: var(--space-2026-xs);
    padding: var(--settings-space-sm) var(--space-2026-sm);
    border: 2px solid var(--border-2026);
    border-radius: var(--radius-2026-full);
    background: var(--surface-2026);
    color: var(--theme-text-dim);
    font-size: var(--text-2026-micro);
    font-weight: var(--settings-font-weight-medium);
    cursor: pointer;
    transition: all var(--transition-fast);
    min-height: 52px;
  }

  @media (min-width: 480px) {
    .role-chip {
      padding: var(--radius-2026-sm) var(--settings-space-md);
      font-size: var(--text-2026-caption);
    }
  }

  @media (hover: hover) {
    .role-chip:hover {
      border-color: var(--border-2026-hover);
      background: var(--surface-2026-hover);
      color: var(--theme-text);
    }
  }

  .role-chip:active {
    transform: scale(var(--active-scale));
  }

  .role-chip.selected {
    border-color: var(--role-color);
    background: color-mix(in srgb, var(--role-color) 15%, transparent);
    color: var(--role-color);
    box-shadow: 0 0 12px color-mix(in srgb, var(--role-color) 30%, transparent);
  }

  .role-chip i {
    font-size: var(--text-2026-caption);
  }

  @media (min-width: 480px) {
    .role-chip i {
      font-size: 14px;
    }
  }
</style>
