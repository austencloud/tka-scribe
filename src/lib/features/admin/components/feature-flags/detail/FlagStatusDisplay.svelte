<script lang="ts">
  import type { UserRole } from "$lib/shared/auth/domain/models/UserRole";
  import { ROLE_DISPLAY } from "$lib/shared/auth/domain/models/UserRole";
  import { getRoleColor, getRoleIcon } from "../utils";

  interface Props {
    enabled: boolean;
    minimumRole: UserRole;
  }

  let { enabled, minimumRole }: Props = $props();
</script>

<div class="status-display">
  <h3>Current Status</h3>
  <div class="status-info">
    <div class="status-item">
      <span class="status-label">Status:</span>
      <span class="status-value" class:enabled>
        {enabled ? "Enabled" : "Disabled"}
      </span>
    </div>
    <div class="status-item">
      <span class="status-label">Minimum Role:</span>
      <span class="status-value" style="color: {getRoleColor(minimumRole)}">
        <i class="fas {getRoleIcon(minimumRole)}"></i>
        {ROLE_DISPLAY[minimumRole].label}
      </span>
    </div>
  </div>
</div>

<style>
  .status-display h3 {
    margin: 0 0 var(--radius-2026-sm) 0;
    font-size: var(--text-2026-caption);
    font-weight: var(--settings-font-weight-semibold);
    color: var(--theme-text);
  }

  @media (min-width: 480px) {
    .status-display h3 {
      margin: 0 0 var(--space-2026-sm) 0;
      font-size: var(--text-2026-body);
    }
  }

  .status-info {
    display: flex;
    flex-direction: column;
    gap: var(--space-2026-sm);
  }

  .status-item {
    display: flex;
    align-items: center;
    gap: var(--space-2026-sm);
    padding: var(--space-2026-sm);
    background: var(--surface-2026);
    border-radius: var(--radius-2026-xs);
  }

  .status-label {
    font-size: var(--text-2026-caption);
    color: var(--theme-text-dim);
    font-weight: var(--settings-font-weight-medium);
  }

  .status-value {
    font-size: var(--text-2026-caption);
    color: var(--theme-text);
    font-weight: var(--settings-font-weight-medium);
    display: flex;
    align-items: center;
    gap: var(--space-2026-xs);
  }

  .status-value.enabled {
    color: var(--accent-2026-emerald);
  }
</style>
