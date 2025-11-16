<!-- ModuleSwitcherButton - Module Switcher Menu Button -->
<script lang="ts">
  import NavButton from "./NavButton.svelte";

  let { onClick = () => {} } = $props<{
    onClick?: () => void;
  }>();
</script>

<NavButton
  icon='<i class="fas fa-bars"></i>'
  label="Menu"
  type="special"
  color="rgba(255, 255, 255, 1)"
  gradient="rgba(255, 255, 255, 1)"
  ariaLabel="Switch module"
  {onClick}
/>

