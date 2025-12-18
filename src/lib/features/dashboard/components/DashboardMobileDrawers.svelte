<script lang="ts">
  import Drawer from "$lib/shared/foundation/ui/Drawer.svelte";
  import TodayChallengeWidget from "./widgets/TodayChallengeWidget.svelte";

  interface Props {
    challengeDrawerOpen: boolean;
    onChallengeDrawerChange: (open: boolean) => void;
  }

  let {
    challengeDrawerOpen = $bindable(false),
    onChallengeDrawerChange,
  }: Props = $props();
</script>

<Drawer
  bind:isOpen={challengeDrawerOpen}
  placement="bottom"
  ariaLabel="Today's Challenge"
>
  <div class="drawer-body">
    <TodayChallengeWidget />
  </div>
</Drawer>

<style>
  .drawer-body {
    padding: 20px;
  }
</style>
