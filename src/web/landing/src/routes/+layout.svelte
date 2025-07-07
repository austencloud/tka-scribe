<script lang="ts">
    import '../app.css';
    import NavBar from '../components/NavBar.svelte';
    import Footer from '../components/Footer.svelte';
    import SimpleNightSkyCanvas from '../lib/components/Backgrounds/SimpleNightSkyCanvas.svelte';
    import { onMount } from 'svelte';
    import type { LayoutData } from './$types.js';
    import { initializePictographData } from '$lib/constructor/stores/pictograph/pictographStore.js';
    import { browser } from '$app/environment';

    // Props from layout server
    export let data: LayoutData;

    // Default to night sky background - full system with constellations and moon
    let currentBackground: 'deepOcean' | 'snowfall' | 'nightSky' | 'static' = 'nightSky';
    let initialized = false;

    function handleBackgroundChange(background: string) {
      currentBackground = background as 'deepOcean' | 'snowfall' | 'nightSky' | 'static';
    }

    onMount(() => {
        if (browser && !initialized) {
            // Check if the load function returned data successfully
            if (data?.csvData && !data.error) {
                try {
                    initializePictographData(data.csvData);
                    initialized = true; // Mark as initialized
                } catch (initError) {
                    console.error('Layout onMount: Error calling initializePictographData:', initError);
                    // Optionally display an error message to the user here
                }
            } else if (data?.error) {
                console.error('Layout onMount: Error from server load function:', data.error);
                // Optionally display an error message to the user here
            } else {
                console.warn('Layout onMount: No CSV data received from server');
            }
        }
    });
  </script>

  <!-- Simplified Night Sky System -->
  <div class="app-content" data-background="nightSky">
    <!-- Direct NightSkyBackgroundSystem implementation -->
    <SimpleNightSkyCanvas />

    <header>
      <NavBar {currentBackground} onBackgroundChange={handleBackgroundChange} />
    </header>

    <main>
      <slot />  <!-- This is where child pages will be rendered -->
    </main>

    <footer>
      <Footer />
    </footer>
  </div>

  <style>
    .app-content {
      position: relative;
      z-index: 1; /* Ensure content is above background */
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    header {
      /* Remove background to let NavBar handle its own styling */
      padding: 0;
      color: white;
      position: relative;
      z-index: 10; /* Ensure navbar is above everything */
    }

    main {
      padding: var(--container-padding);
      min-height: 80vh;
      flex: 1;
      position: relative;
    }

    footer {
      margin-top: 20px;
      position: relative;
    }
  </style>
