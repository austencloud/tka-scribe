<!-- Sidebar Footer Component -->
<!-- Contains unified account button for navigating to the Account module -->
<script lang="ts">
  import AccountSettingsButton from "../AccountSettingsButton.svelte";
  import { navigationState } from "../../state/navigation-state.svelte";

  let { isCollapsed, isSettingsActive, onDebugClick } = $props<{
    isCollapsed: boolean;
    isSettingsActive: boolean; // Deprecated - now checking Account module instead
    onSettingsClick?: () => void; // Deprecated, kept for backward compatibility
    onDebugClick?: () => void;
  }>();

  // Check if Account module is currently active
  const isAccountActive = $derived(navigationState.currentModule === "account");
</script>

<div class="sidebar-footer">
  <!-- Unified Account Button -->
  <AccountSettingsButton {isCollapsed} isActive={isAccountActive} />
</div>

<style>
  /* ============================================================================
     SIDEBAR FOOTER
     ============================================================================ */
  .sidebar-footer {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 16px 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    background: linear-gradient(0deg, rgba(0, 0, 0, 0.2) 0%, transparent 100%);
  }
</style>
