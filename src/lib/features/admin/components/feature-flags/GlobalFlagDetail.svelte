<script lang="ts">
  import type { FeatureFlagConfig, UserRole } from "$lib/shared/auth/domain";
  import { ROLE_HIERARCHY, ROLE_DISPLAY } from "$lib/shared/auth/domain";
  import { AdminDetailPanel, AdminActionButton } from "$lib/shared/admin";
  import { getFeatureIconAndColor, getRoleColor, getRoleIcon } from "./utils";

  interface Props {
    selectedFlag: FeatureFlagConfig;
    editedMinimumRole: UserRole;
    editedEnabled: boolean;
    isSaving: boolean;
    onRoleChange: (role: UserRole) => void;
    onEnabledChange: (enabled: boolean) => void;
    onSave: () => void;
    onReset: () => void;
    onClose: () => void;
  }

  let {
    selectedFlag,
    editedMinimumRole,
    editedEnabled,
    isSaving,
    onRoleChange,
    onEnabledChange,
    onSave,
    onReset,
    onClose,
  }: Props = $props();

  const flagStyle = $derived(getFeatureIconAndColor(selectedFlag.id));
</script>

<AdminDetailPanel
  title={selectedFlag.name}
  subtitle={selectedFlag.id}
  icon={flagStyle.icon}
  {onClose}
>
  {#snippet children()}
    <div class="detail-content">
      <div class="type-indicator-section">
        <div class="type-indicator {selectedFlag.category}">
          <i
            class="fas {selectedFlag.category === 'module'
              ? 'fa-cubes'
              : selectedFlag.category === 'tab'
                ? 'fa-window-restore'
                : 'fa-magic'}"
          ></i>
          <span class="type-label">{selectedFlag.category}</span>
        </div>
      </div>

      <div class="detail-section">
        <h3>Description</h3>
        <p>{selectedFlag.description}</p>
      </div>

      <div class="detail-section">
        <h3>Access Control</h3>
        <div class="form-fields">
          <div
            class="form-field"
            role="radiogroup"
            aria-labelledby="role-label"
          >
            <span id="role-label" class="field-label">Minimum Role</span>
            <div class="role-chips">
              {#each ROLE_HIERARCHY as role}
                <button
                  class="role-chip"
                  class:selected={editedMinimumRole === role}
                  style="--role-color: {getRoleColor(role)}"
                  onclick={() => onRoleChange(role)}
                  type="button"
                  role="radio"
                  aria-checked={editedMinimumRole === role}
                >
                  <i class="fas {getRoleIcon(role)}"></i>
                  <span>{ROLE_DISPLAY[role].label}</span>
                </button>
              {/each}
            </div>
          </div>

          <div class="form-field">
            <span id="enabled-label" class="field-label">Enabled</span>
            <button
              aria-labelledby="enabled-label"
              class="flag-enabled-toggle"
              class:enabled={editedEnabled}
              onclick={() => onEnabledChange(!editedEnabled)}
              type="button"
              role="switch"
              aria-checked={editedEnabled}
            >
              <span class="toggle-track">
                <span class="toggle-thumb"></span>
              </span>
              <span class="toggle-label"
                >{editedEnabled ? "Enabled" : "Disabled"}</span
              >
            </button>
          </div>
        </div>
      </div>

      <div class="detail-section">
        <h3>Current Status</h3>
        <div class="status-info">
          <div class="status-item">
            <span class="status-label">Status:</span>
            <span class="status-value" class:enabled={selectedFlag.enabled}>
              {selectedFlag.enabled ? "Enabled" : "Disabled"}
            </span>
          </div>
          <div class="status-item">
            <span class="status-label">Minimum Role:</span>
            <span
              class="status-value"
              style="color: {getRoleColor(selectedFlag.minimumRole)}"
            >
              <i class="fas {getRoleIcon(selectedFlag.minimumRole)}"></i>
              {ROLE_DISPLAY[selectedFlag.minimumRole].label}
            </span>
          </div>
        </div>
      </div>
    </div>
  {/snippet}

  {#snippet actions()}
    <AdminActionButton variant="secondary" onclick={onReset}
      >Reset</AdminActionButton
    >
    <AdminActionButton
      variant="primary"
      icon="fa-save"
      loading={isSaving}
      onclick={onSave}
    >
      Save Changes
    </AdminActionButton>
  {/snippet}
</AdminDetailPanel>

<style>
  .detail-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  @media (min-width: 480px) {
    .detail-content {
      gap: 24px;
    }
  }

  .type-indicator-section {
    margin: -8px 0 0 0;
  }

  .type-indicator {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 13px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    border: 2px solid;
  }

  @media (min-width: 480px) {
    .type-indicator {
      gap: 10px;
      padding: 12px 20px;
      font-size: 15px;
    }
  }

  .type-indicator.module {
    background: rgba(139, 92, 246, 0.15);
    border-color: rgba(139, 92, 246, 0.4);
    color: #a78bfa;
  }

  .type-indicator.tab {
    background: rgba(59, 130, 246, 0.15);
    border-color: rgba(59, 130, 246, 0.4);
    color: #60a5fa;
  }

  .type-indicator.capability {
    background: rgba(245, 158, 11, 0.15);
    border-color: rgba(245, 158, 11, 0.4);
    color: #fbbf24;
  }

  .type-indicator i {
    font-size: 16px;
  }

  @media (min-width: 480px) {
    .type-indicator i {
      font-size: 18px;
    }
  }

  .type-label {
    font-weight: 700;
  }

  .detail-section h3 {
    margin: 0 0 10px 0;
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }

  @media (min-width: 480px) {
    .detail-section h3 {
      margin: 0 0 12px 0;
      font-size: 14px;
    }
  }

  .detail-section p {
    margin: 0;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.5;
  }

  @media (min-width: 480px) {
    .detail-section p {
      font-size: 14px;
    }
  }

  .form-fields {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  @media (min-width: 480px) {
    .form-fields {
      gap: 20px;
    }
  }

  .form-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .field-label {
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
  }

  .role-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .role-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.03);
    color: rgba(255, 255, 255, 0.7);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: 48px; /* Touch target */
  }

  @media (min-width: 480px) {
    .role-chips {
      gap: 8px;
    }

    .role-chip {
      padding: 10px 16px;
      border-radius: 24px;
      font-size: 13px;
    }
  }

  @media (hover: hover) {
    .role-chip:hover {
      border-color: rgba(255, 255, 255, 0.2);
      background: rgba(255, 255, 255, 0.06);
      color: rgba(255, 255, 255, 0.9);
    }
  }

  .role-chip:active {
    transform: scale(0.97);
  }

  .role-chip.selected {
    border-color: var(--role-color);
    background: color-mix(in srgb, var(--role-color) 15%, transparent);
    color: var(--role-color);
    box-shadow: 0 0 12px color-mix(in srgb, var(--role-color) 30%, transparent);
  }

  .role-chip i {
    font-size: 13px;
  }

  @media (min-width: 480px) {
    .role-chip i {
      font-size: 14px;
    }
  }

  .flag-enabled-toggle {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.7);
  }

  .toggle-track {
    position: relative;
    width: 52px;
    height: 48px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 14px;
    transition: background 0.2s ease;
  }

  .flag-enabled-toggle.enabled .toggle-track {
    background: rgba(16, 185, 129, 0.3);
  }

  .toggle-thumb {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 48px;
    height: 48px;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 50%;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .flag-enabled-toggle.enabled .toggle-thumb {
    left: 27px;
    background: #10b981;
    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
  }

  .toggle-label {
    font-size: 14px;
    font-weight: 500;
    transition: color 0.2s;
  }

  .flag-enabled-toggle.enabled .toggle-label {
    color: #34d399;
  }

  .status-info {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .status-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 6px;
  }

  .status-label {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
    font-weight: 500;
  }

  .status-value {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .status-value.enabled {
    color: #34d399;
  }
</style>
