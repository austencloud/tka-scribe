<script lang="ts">
  import type { Snippet } from "svelte";
  import { onMount, setContext } from "svelte";
  import "../app.css";
  import type { ServiceContainer } from "../lib/services/di/ServiceContainer";

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();

  // Application bootstrap
  let container: ServiceContainer | null = $state(null);
  let isInitialized = $state(false);
  let initializationError = $state<string | null>(null);

  // Set context immediately (will be null initially)
  setContext("di-container", () => {
    console.log("🔧 Layout: Context getter called, container:", !!container);
    return container;
  });

  onMount(async () => {
    try {
      try {
        console.log("🏗️ Layout: Starting DI container initialization...");
        // Import bootstrap function
        const { createWebApplication } = await import("$services/bootstrap");

        // Create DI container
        console.log("🏗️ Layout: Creating web application container...");
        container = await createWebApplication();
        console.log("🏗️ Layout: Container created successfully:", !!container);

        // Mark as initialized
        isInitialized = true;
        console.log("🏗️ Layout: Application marked as initialized");
      } catch (error) {
        console.error("❌ Failed to initialize application:", error);
        initializationError =
          error instanceof Error ? error.message : "Unknown error";
      }
    } catch (outerError) {
      console.error(
        "🚨 CRITICAL: Application initialization failed:",
        outerError
      );
      initializationError = "Critical initialization failure";
    }
  });
</script>

<svelte:head>
  <title>TKA - The Kinetic Constructor</title>
</svelte:head>

{#if initializationError}
  <div class="error-screen">
    <h1>Initialization Failed</h1>
    <p>{initializationError}</p>
    <button onclick={() => window.location.reload()}>Retry</button>
  </div>
{:else if !isInitialized}
  <div class="loading-screen">
    <div class="spinner"></div>
    <p>Initializing TKA...</p>
  </div>
{:else}
  <!-- Container is provided via context, children renders with access -->
  {@render children()}
{/if}

<style>
  .error-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
    text-align: center;
  }

  .loading-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
    text-align: center;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
