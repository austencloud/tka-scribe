<!-- SettingsButton - Settings Button Component -->
<script lang="ts">
  import NavButton from "./NavButton.svelte";
  import { setSettingsPortalOrigin } from "../../../navigation-coordinator/navigation-coordinator.svelte";

  let { active = false, onClick = () => {} } = $props<{
    active?: boolean;
    onClick?: () => void;
  }>();

  function handleClick(event: MouseEvent) {
    // Capture click position for portal animation origin
    // Use the click coordinates directly - most accurate
    setSettingsPortalOrigin(event.clientX, event.clientY);
    onClick();
  }
</script>

<div class="settings-button-wrapper" onclick={handleClick}>
  <NavButton
    icon="<i class='fas fa-cog'></i>"
    label="Settings"
    type="special"
    color="rgba(255, 255, 255, 1)"
    gradient="rgba(255, 255, 255, 1)"
    ariaLabel="Settings"
    {active}
  />
</div>

<style>
  .settings-button-wrapper {
    display: contents;
  }
</style>
