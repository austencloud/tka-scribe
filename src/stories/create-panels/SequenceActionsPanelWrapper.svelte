<script lang="ts">
  import { setContext } from "svelte";
  import SequenceActionsPanel from "../../lib/features/create/shared/components/sequence-actions/SequenceActionsPanel.svelte";

  let show = $state(true);

  // Provide mock CreateModule context
  setContext("createModuleContext", {
    layout: {
      shouldUseSideBySideLayout: false,
      isMobilePortrait: () => false,
    },
  });
</script>

<div style="width: 100vw; height: 100vh; background: #0a0e14;">
  <SequenceActionsPanel
    {show}
    onClose={() => {
      show = false;
      console.log("Close clicked");
    }}
  />
</div>
