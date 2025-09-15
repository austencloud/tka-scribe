<script lang="ts">
  import HeroSection from "./HeroSection.svelte";
  import QuickAccess from "./QuickAccess.svelte";
  import AboutTheSystem from "./AboutTheSystem.svelte";
  import GettingStarted from "./GettingStarted.svelte";
  import ResourcesHistorian from "./ResourcesHistorian.svelte";
  import ContactSection from "./ContactSection.svelte";
</script>

<!-- About Tab - Modular Architecture -->
<div class="about-container">
  <!-- Hero Section -->
  <section id="hero" class="section-container hero-section">
    <HeroSection />
  </section>

  <!-- Action Section -->
  <div class="section-group action-group">
    <section id="quick-access" class="section-container">
      <QuickAccess />
    </section>
    <section id="about-system" class="section-container">
      <AboutTheSystem />
    </section>
    <section id="getting-started" class="section-container">
      <GettingStarted />
    </section>
    <section id="resources" class="section-container">
      <ResourcesHistorian />
    </section>
  </div>

  <!-- Support Section -->
  <div class="section-group support-group">
    <section id="contact" class="section-container">
      <ContactSection />
    </section>
  </div>
</div>

<style>
  /* About Container */
  .about-container {
    min-height: 100vh;
    min-width: 100vw;
    background: var(--cosmic-gradient);
    color: var(--text-color);
    position: relative;
  }

  /* Section Containers */
  .section-container {
    scroll-margin-top: 80px; /* Account for sticky nav */
  }

  /* Section Groups */
  .section-group {
    position: relative;
    margin: var(--spacing-xl) 0;
  }

  .hero-section {
    margin-bottom: var(--spacing-lg);
  }

  .action-group {
    background: rgba(255, 255, 255, 0.02);
    border-radius: 1.5rem;
    padding: var(--spacing-lg);
    margin: var(--spacing-xl) auto;
    max-width: 1200px;
  }

  .support-group {
    background: rgba(255, 255, 255, 0.02);
    border-radius: 1.5rem;
    padding: var(--spacing-lg);
    margin: var(--spacing-xl) auto;
    max-width: 1200px;
  }

  /* Group Separators */
  .section-group:not(:last-child)::after {
    content: "";
    display: block;
    width: 150px;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      var(--primary-color) 50%,
      transparent 100%
    );
    margin: var(--spacing-lg) auto 0;
  }

  /* Mobile Responsive */
  @media (max-width: 768px) {
    .section-container {
      scroll-margin-top: 80px;
    }

    .section-group {
      margin: var(--spacing-lg) var(--spacing-md);
      padding: var(--spacing-md);
    }

    .hero-section {
      margin-bottom: var(--spacing-md);
    }
  }

  @media (max-width: 480px) {
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
  }
</style>
