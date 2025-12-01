<!--
  MobileHeader.svelte
  
  Compact header for mobile animation view.
  Displays sequence name and change button.
-->
<script lang="ts">
  import { ChangeButton } from "../../../../shared/components";

  let {
    sequenceName = "",
    onChangeSequence,
  }: {
    sequenceName?: string;
    onChangeSequence: () => void;
  } = $props();
</script>

<div class="mobile-header-compact">
  <span class="sequence-name">{sequenceName}</span>
  <ChangeButton onclick={onChangeSequence} variant="mobile" />
</div>

<style>
  .mobile-header-compact {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 8px;
    background: rgba(0, 0, 0, 0.3);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    flex-shrink: 0;
    min-height: 48px;
  }

  .sequence-name {
    font-size: 0.85rem;
    font-weight: 600;
    color: #a78bfa;
    white-space: nowrap;
    max-width: 250px;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
    margin-right: 8px;
  }

  /* Container query responsive styles */
  @container mobile-layout (max-width: 360px) {
    .mobile-header-compact {
      padding: 4px 6px;
      min-height: 48px;
    }

    .sequence-name {
      font-size: 0.75rem;
      max-width: 180px;
    }
  }

  @container mobile-layout (max-height: 600px) {
    .mobile-header-compact {
      padding: 4px 6px;
      min-height: 48px;
    }
  }

  @container mobile-layout (max-height: 500px) {
    .mobile-header-compact {
      padding: 3px 5px;
      min-height: 48px;
    }

    .sequence-name {
      font-size: 0.75rem;
    }
  }

  /* Landscape orientation */
  @media (orientation: landscape) and (max-width: 768px) {
    .mobile-header-compact {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      z-index: 10;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(12px);
    }
  }
</style>
