<!-- Animator Route - MISSING FILE FIX -->
<script lang="ts">
  import { switchTab } from "$shared";
  import { onMount } from "svelte";
  import MainApplication from "../../lib/shared/application/components/MainApplication.svelte";

  onMount(async () => {
    // Navigate to animator tab
    switchTab("animator");
  });
</script>

<svelte:head>
  <title>Animator - TKA Development Tool | Flow Arts Animation Testing</title>
  <meta
    name="description"
    content="Development tool for testing motion parameters and animation sequences in TKA. Debug flow arts movements and kinetic patterns."
  />
  <meta property="og:title" content="Animator - TKA Development Tool" />
  <meta
    property="og:description"
    content="Test and debug motion parameters for flow arts animations with TKA's motion testing interface."
  />
  <meta property="og:type" content="website" />
  <link rel="canonical" href="https://thekineticalphabet.com/animator" />
</svelte:head>

<MainApplication />
