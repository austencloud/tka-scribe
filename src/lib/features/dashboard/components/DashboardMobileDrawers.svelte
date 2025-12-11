<script lang="ts">
  import Drawer from "$lib/shared/foundation/ui/Drawer.svelte";
  import TodayChallengeWidget from "./widgets/TodayChallengeWidget.svelte";
  import SupportWidget from "./widgets/SupportWidget.svelte";

  interface Props {
    challengeDrawerOpen: boolean;
    supportDrawerOpen: boolean;
    onChallengeDrawerChange: (open: boolean) => void;
    onSupportDrawerChange: (open: boolean) => void;
  }

  let {
    challengeDrawerOpen = $bindable(false),
    supportDrawerOpen = $bindable(false),
    onChallengeDrawerChange,
    onSupportDrawerChange,
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

<Drawer
  bind:isOpen={supportDrawerOpen}
  placement="bottom"
  ariaLabel="Support TKA"
>
  <div class="drawer-body">
    <SupportWidget />
  </div>
</Drawer>

<style>
  .drawer-body {
    padding: 20px;
  }
</style>
