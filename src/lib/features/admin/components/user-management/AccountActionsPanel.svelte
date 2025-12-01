<script lang="ts">
  /**
   * AccountActionsPanel
   * Action buttons for managing user accounts
   */
  import type { UserData, UserActionType } from "./types";

  interface Props {
    user: UserData;
    isDisabled?: boolean;
    onAction: (type: UserActionType) => void;
  }

  let { user, isDisabled = false, onAction }: Props = $props();
</script>

<div class="action-buttons">
  <button
    class="action-btn warning"
    class:active={user.isDisabled}
    onclick={() => onAction("toggleDisabled")}
    disabled={isDisabled}
  >
    <i class="fas fa-ban"></i>
    {user.isDisabled ? "Enable Account" : "Disable Account"}
  </button>

  <button
    class="action-btn warning"
    onclick={() => onAction("resetData")}
    disabled={isDisabled}
  >
    <i class="fas fa-eraser"></i>
    Reset Progress
  </button>

  <button
    class="action-btn danger"
    onclick={() => onAction("delete")}
    disabled={isDisabled}
  >
    <i class="fas fa-trash"></i>
    Delete User
  </button>
</div>

<style>
  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.9);
    cursor: pointer;
    transition: all 0.2s;
    font-size: 14px;
  }

  .action-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
  }

  .action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .action-btn.active {
    background: rgba(59, 130, 246, 0.2);
    border-color: rgba(59, 130, 246, 0.3);
  }

  .action-btn.warning:hover:not(:disabled) {
    background: rgba(245, 158, 11, 0.15);
    border-color: rgba(245, 158, 11, 0.3);
    color: #fbbf24;
  }

  .action-btn.danger:hover:not(:disabled) {
    background: rgba(239, 68, 68, 0.15);
    border-color: rgba(239, 68, 68, 0.3);
    color: #fca5a5;
  }
</style>
