<!-- SettingsButton - Settings Button Component -->
<script lang="ts">
  import NavButton from "./NavButton.svelte";

  let {
    active = false,
    onClick = () => {},
  } = $props<{
    active?: boolean;
    onClick?: () => void;
  }>();
</script>

<NavButton
  icon='<i class="fas fa-cog"></i>'
  label="Settings"
  type="special"
  color="rgba(255, 255, 255, 1)"
  gradient="rgba(255, 255, 255, 1)"
  ariaLabel="Settings"
  {active}
  {onClick}
/>

<style>
  /* Additional styles specific to settings button can go here */
</style>
