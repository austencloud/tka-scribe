<script lang="ts">
  import { onMount } from 'svelte';
  import ConstructTab from '../../lib/constructor/ConstructTab.svelte';

  let mounted = false;

  onMount(() => {
    mounted = true;
  });
</script>

<svelte:head>
  <title>Kinetic Constructor - The Kinetic Alphabet</title>
  <meta name="description" content="The revolutionary Kinetic Constructor tool for creating, visualizing, and sharing flow arts sequences. Coming soon with advanced features for flow artists." />
</svelte:head>

<main class="constructor-page">
  {#if mounted}
    <div class="constructor-container">
      <ConstructTab />
    </div>
  {:else}
    <div class="loading">
      <p>Loading constructor...</p>
    </div>
  {/if}


</main>

<style>
  .constructor-page {
    min-height: 100vh;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    position: relative;
    display: flex;
    flex-direction: column;
  }

  .constructor-container {
    flex: 1;
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }

  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
    color: white;
    font-size: 1.2rem;
  }
</style>


  .control-icon {
    line-height: 1;
    font-family: 'Segoe UI', system-ui, sans-serif;
  }

  .preview-content {
    padding: var(--spacing-lg);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .sequence-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-sm);
  }

  .sequence-block {
    aspect-ratio: 1;
    background: rgba(255, 255, 255, 0.1);
    border-radius: var(--border-radius);
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all var(--transition-fast);
  }

  .sequence-block.active {
    background: var(--primary-color);
    box-shadow: 0 0 20px rgba(168, 28, 237, 0.5);
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }

  .timeline {
    position: relative;
    height: 4px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    overflow: hidden;
  }

  .timeline-progress {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 60%;
    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
    border-radius: 2px;
    animation: progress 3s ease-in-out infinite;
  }

  @keyframes progress {
    0% { width: 0%; }
    50% { width: 80%; }
    100% { width: 60%; }
  }

  /* Features Section */
  .features {
    padding: var(--spacing-4xl) 0;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  .features h2 {
    text-align: center;
    font-size: var(--font-size-3xl);
    font-weight: 700;
    margin-bottom: var(--spacing-3xl);
    color: white;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: var(--spacing-xl);
  }

  .feature-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-xl);
    text-align: center;
    color: white;
    transition: all var(--transition-normal);
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .feature-card:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow:
      0 20px 40px rgba(0, 0, 0, 0.2),
      0 0 0 1px rgba(255, 255, 255, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  .feature-icon {
    font-size: 3rem;
    margin-bottom: var(--spacing-md);
    display: block;
  }

  .feature-card h3 {
    font-size: var(--font-size-xl);
    font-weight: 600;
    margin-bottom: var(--spacing-md);
    color: white;
  }

  .feature-card p {
    line-height: 1.6;
    opacity: 0.9;
  }

  /* Coming Soon Section */
  .coming-soon {
    padding: var(--spacing-4xl) 0;
    background: rgba(0, 0, 0, 0.2);
  }

  .coming-soon-content {
    text-align: center;
    color: white;
  }

  .coming-soon h2 {
    font-size: var(--font-size-3xl);
    font-weight: 700;
    margin-bottom: var(--spacing-lg);
  }

  .coming-soon-description {
    font-size: var(--font-size-lg);
    line-height: 1.6;
    opacity: 0.8;
    max-width: 600px;
    margin: 0 auto var(--spacing-3xl);
  }

  /* Development Timeline */
  .timeline-preview {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xl);
    max-width: 500px;
    margin: 0 auto var(--spacing-3xl);
  }

  .timeline-item {
    display: flex;
    gap: var(--spacing-lg);
    align-items: flex-start;
    position: relative;
  }

  .timeline-item:not(:last-child)::after {
    content: '';
    position: absolute;
    left: 15px;
    top: 40px;
    width: 2px;
    height: calc(100% + var(--spacing-xl));
    background: rgba(255, 255, 255, 0.2);
  }

  .timeline-marker {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.4);
    flex-shrink: 0;
    position: relative;
    z-index: 1;
  }

  .timeline-item.completed .timeline-marker {
    background: var(--primary-color);
    border-color: var(--primary-color);
    box-shadow: 0 0 20px rgba(168, 28, 237, 0.5);
  }

  .timeline-item.active .timeline-marker {
    background: var(--secondary-color);
    border-color: var(--secondary-color);
    box-shadow: 0 0 20px rgba(140, 11, 207, 0.5);
    animation: pulse 2s ease-in-out infinite;
  }

  .timeline-content {
    flex: 1;
    text-align: left;
  }

  .timeline-content h4 {
    font-size: var(--font-size-lg);
    font-weight: 600;
    margin-bottom: var(--spacing-xs);
  }

  .timeline-content p {
    opacity: 0.8;
    margin-bottom: var(--spacing-xs);
  }

  .timeline-status {
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--primary-color);
  }

  .early-access-actions {
    display: flex;
    justify-content: center;
  }

  /* Newsletter Section */
  .newsletter-section {
    padding: var(--spacing-4xl) 0;
    background: rgba(255, 255, 255, 0.05);
  }

  .newsletter-content {
    text-align: center;
    color: white;
  }

  .newsletter-content h2 {
    font-size: var(--font-size-2xl);
    font-weight: 600;
    margin-bottom: var(--spacing-md);
  }

  .newsletter-content p {
    font-size: var(--font-size-lg);
    opacity: 0.8;
    margin-bottom: var(--spacing-xl);
  }

  .newsletter-placeholder {
    display: flex;
    justify-content: center;
  }

  /* Reduced Motion Support */
  @media (prefers-reduced-motion: reduce) {
    .constructor-preview,
    .feature-card,
    .sequence-block,
    .timeline-progress {
      animation: none;
      transition: none;
    }

    .constructor-preview:hover,
    .feature-card:hover {
      transform: none;
    }
  }

  /* Desktop optimization */
  @media (min-width: 1200px) {
    .features-grid {
      gap: var(--spacing-2xl);
    }

    .hero {
      gap: var(--spacing-3xl);
    }
  }

  /* Mobile Responsive Design */
  @media (max-width: 768px) {
    .hero {
      grid-template-columns: 1fr;
      gap: var(--spacing-xl);
      text-align: center;
      padding: var(--spacing-xl) var(--container-padding);
      max-width: 100%;
    }

    .hero-visual {
      order: -1;
    }

    .constructor-preview {
      transform: none;
      scale: 0.8;
    }

    .constructor-preview:hover {
      transform: none;
    }

    .preview-screen {
      width: 300px;
      height: 225px;
    }

    .features-grid {
      grid-template-columns: 1fr;
      gap: var(--spacing-lg);
    }

    .feature-card {
      padding: var(--spacing-lg);
    }

    .timeline-preview {
      max-width: 100%;
    }

    .timeline-item {
      gap: var(--spacing-md);
    }

    .hero-actions {
      justify-content: center;
    }
  }

  /* High Contrast Mode Support */
  @media (prefers-contrast: high) {
    .feature-card,
    .preview-screen,
    .hero-badge {
      border: 2px solid white;
      background: rgba(0, 0, 0, 0.8);
    }

    .timeline-marker {
      border: 2px solid white;
      background: rgba(0, 0, 0, 0.8);
    }
  }
</style>
