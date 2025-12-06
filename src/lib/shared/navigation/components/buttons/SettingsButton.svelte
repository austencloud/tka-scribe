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

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="settings-button-wrapper"
  onclick={handleClick}
  onkeydown={(e) =>
    e.key === "Enter" && handleClick(e as unknown as MouseEvent)}
  role="button"
  tabindex="0"
>
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
