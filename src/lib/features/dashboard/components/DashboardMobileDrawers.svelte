<script lang="ts">
  import Drawer from "$lib/shared/foundation/ui/Drawer.svelte";
  import TodayChallengeWidget from "./widgets/TodayChallengeWidget.svelte";
  import SupportWidget from "./widgets/SupportWidget.svelte";
  import ActivityWidget from "./widgets/ActivityWidget.svelte";

  interface Props {
    challengeDrawerOpen: boolean;
    supportDrawerOpen: boolean;
    activityDrawerOpen: boolean;
    onChallengeDrawerChange: (open: boolean) => void;
    onSupportDrawerChange: (open: boolean) => void;
    onActivityDrawerChange: (open: boolean) => void;
  }

  let {
    challengeDrawerOpen = $bindable(false),
    supportDrawerOpen = $bindable(false),
    activityDrawerOpen = $bindable(false),
    onChallengeDrawerChange,
    onSupportDrawerChange,
    onActivityDrawerChange,
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

<Drawer
  bind:isOpen={activityDrawerOpen}
  placement="bottom"
  ariaLabel="Your Activity"
>
  <div class="drawer-body">
    <ActivityWidget />
  </div>
</Drawer>

<style>
  .drawer-body {
    padding: 20px;
  }
</style>
