<script lang="ts">
    import '../app.css';
    import NavBar from '../components/NavBar.svelte';
    import Footer from '../components/Footer.svelte';
    import SimpleBackgroundCanvas from '../lib/components/Backgrounds/simple/SimpleBackgroundCanvas.svelte';

    // Default to deep ocean background - can be changed via settings
    let currentBackground: 'deepOcean' | 'snowfall' | 'nightSky' | 'static' = 'deepOcean';

    function handleBackgroundChange(background: string) {
      currentBackground = background as 'deepOcean' | 'snowfall' | 'nightSky' | 'static';
    }
  </script>

  <!-- Simplified Background System - Direct Canvas -->
  <div class="app-content" data-background={currentBackground}>
    <!-- Direct Enhanced Background Canvas -->
    <SimpleBackgroundCanvas
      backgroundType={currentBackground}
      quality="medium"
      appIsLoading={false}
    />

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
