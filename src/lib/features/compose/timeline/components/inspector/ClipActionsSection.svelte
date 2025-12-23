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
    <i class="fa-solid fa-bolt"></i>
    <span>Actions</span>
  </div>

  <div class="action-buttons">
    <button class="action-btn" class:active={locked} onclick={onToggleLock}>
      <i class="fa-solid {locked ? 'fa-lock' : 'fa-lock-open'}"></i>
      {locked ? "Unlock" : "Lock"}
    </button>

    <button class="action-btn" class:active={muted} onclick={onToggleMute}>
      <i class="fa-solid {muted ? 'fa-volume-xmark' : 'fa-volume-high'}"></i>
      {muted ? "Unmute" : "Mute"}
    </button>
  </div>

  <div class="action-buttons">
    <button class="action-btn" onclick={onDuplicate}>
      <i class="fa-solid fa-copy"></i>
      Duplicate
    </button>

    <button class="action-btn danger" onclick={onDelete}>
      <i class="fa-solid fa-trash"></i>
      Delete
    </button>
  </div>
</section>

<style>
  @import "./inspector-styles.css";
</style>
