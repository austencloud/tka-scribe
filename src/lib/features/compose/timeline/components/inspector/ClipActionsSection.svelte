<script lang="ts">
  /**
   * ClipActionsSection - Lock, mute, duplicate, and delete actions
   */

  interface Props {
    locked: boolean;
    muted: boolean;
    onToggleLock: () => void;
    onToggleMute: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
  }

  let {
    locked,
    muted,
    onToggleLock,
    onToggleMute,
    onDuplicate,
    onDelete,
  }: Props = $props();
</script>

<section class="section">
  <div class="section-header">
    <i class="fa-solid fa-bolt" aria-hidden="true"></i>
    <span>Actions</span>
  </div>

  <div class="action-buttons">
    <button class="action-btn" class:active={locked} onclick={onToggleLock}>
      <i class="fa-solid {locked ? 'fa-lock' : 'fa-lock-open'}" aria-hidden="true"></i>
      {locked ? "Unlock" : "Lock"}
    </button>

    <button class="action-btn" class:active={muted} onclick={onToggleMute}>
      <i class="fa-solid {muted ? 'fa-volume-xmark' : 'fa-volume-high'}" aria-hidden="true"></i>
      {muted ? "Unmute" : "Mute"}
    </button>
  </div>

  <div class="action-buttons">
    <button class="action-btn" onclick={onDuplicate}>
      <i class="fa-solid fa-copy" aria-hidden="true"></i>
      Duplicate
    </button>

    <button class="action-btn danger" onclick={onDelete}>
      <i class="fa-solid fa-trash" aria-hidden="true"></i>
      Delete
    </button>
  </div>
</section>

<style>
  .section {
    margin-bottom: 20px;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-bottom: 8px;
    margin-bottom: 12px;
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    font-size: var(--font-size-compact, 12px);
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.85));
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .section-header i {
    font-size: 12px;
    opacity: 0.6;
  }

  .action-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 12px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 6px;
    font-size: 12px;
    color: var(--theme-text, rgba(255, 255, 255, 0.8));
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .action-btn:hover {
    background: var(--theme-card-bg-hover, rgba(255, 255, 255, 0.1));
  }

  .action-buttons {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
  }

  .action-btn.active {
    background: var(--theme-accent, #4a9eff);
    border-color: var(--theme-accent, #4a9eff);
    color: white;
  }

  .action-btn.danger:hover {
    background: rgba(255, 68, 68, 0.2);
    border-color: rgba(255, 68, 68, 0.4);
    color: #ff6b6b;
  }

  .action-btn i {
    font-size: 12px;
  }
</style>
