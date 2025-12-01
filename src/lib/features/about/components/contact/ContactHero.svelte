<!-- ContactHero.svelte - Hero section for contact page -->
<script lang="ts">
  import { onMount } from "svelte";

  let isVisible = $state(false);

  onMount(() => {
    isVisible = true;
  });
</script>

<section class="hero" class:visible={isVisible}>
  <div class="hero-content">
    <h1 class="hero-title">Get In Touch</h1>
    <p class="hero-subtitle">We'd love to hear from the flow arts community</p>
  </div>
</section>

<style>
  .hero {
    text-align: center;
    padding: var(--spacing-4xl) var(--spacing-xl);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    opacity: 0;
    transform: translateY(-20px);
    transition:
      opacity 0.6s ease,
      transform 0.6s ease;
  }

  .hero.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .hero-content {
    max-width: 800px;
    margin: 0 auto;
  }

  .hero-title {
    font-size: 3.5rem;
    font-weight: 800;
    color: white;
    margin-bottom: var(--spacing-md);
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  }

  .hero-subtitle {
    font-size: 1.5rem;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 400;
  }

  @media (max-width: 768px) {
    .hero {
      padding: var(--spacing-3xl) var(--spacing-lg);
    }

    .hero-title {
      font-size: 2.5rem;
    }

    .hero-subtitle {
      font-size: 1.2rem;
    }
  }
</style>
