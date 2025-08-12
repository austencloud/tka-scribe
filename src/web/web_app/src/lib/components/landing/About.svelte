<script lang="ts">
  import { onMount } from 'svelte';

  let isVisible = $state(false);

  onMount(() => {
    isVisible = true;
  });
</script>

<svelte:head>
  <title>About - The Kinetic Alphabet</title>
  <meta name="description" content="Learn about The Kinetic Alphabet project, its philosophy, and the innovative approach to flow arts education and choreography." />
</svelte:head>

<main class="about-container">
  <!-- Hero Section -->
  <section class="hero" class:visible={isVisible}>
    <div class="hero-content">
      <h1 class="hero-title">About The Kinetic Alphabet</h1>
      <p class="hero-subtitle">Innovation in Flow Arts Education</p>
    </div>
  </section>

  <!-- Philosophy Section -->
  <section class="philosophy">
    <div class="container">
      <h2>Philosophy</h2>
      <div class="philosophy-content">
        <p>
          The Kinetic Alphabet represents a paradigm shift in how flow artists approach their craft. 
          By providing a systematic framework for understanding movement, we enable practitioners 
          to develop deeper technical skills while preserving the artistic freedom that defines flow arts.
        </p>
        <p>
          Our approach combines rigorous technical methodology with creative expression, 
          allowing artists to build a solid foundation while exploring infinite possibilities 
          for personal artistic development.
        </p>
      </div>
    </div>
  </section>

  <!-- Project Overview -->
  <section class="project-overview">
    <div class="container">
      <h2>The Project</h2>
      <div class="overview-grid">
        <div class="overview-card">
          <h3>🎯 Mission</h3>
          <p>
            To provide systematic tools and methodologies that enhance technical precision 
            and creative expression in flow arts through structured learning approaches.
          </p>
        </div>

        <div class="overview-card">
          <h3>🔬 Methodology</h3>
          <p>
            The system breaks down complex movements into understandable components, 
            creating a notation system that enables precise communication and analysis.
          </p>
        </div>

        <div class="overview-card">
          <h3>🌟 Vision</h3>
          <p>
            A global community of flow artists connected through shared language 
            and collaborative tools for sequence creation and knowledge sharing.
          </p>
        </div>

        <div class="overview-card">
          <h3>🛠️ Tools</h3>
          <p>
            Digital applications that support visualization, creation, and sharing 
            of choreographic sequences across multiple flow art disciplines.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- Development History -->
  <section class="development">
    <div class="container">
      <h2>Development Journey</h2>
      <div class="timeline">
        <div class="timeline-item">
          <div class="timeline-marker"></div>
          <div class="timeline-content">
            <h3>Conceptual Foundation</h3>
            <p>
              Initial development of systematic approaches to movement analysis 
              and the foundational principles of the notation system.
            </p>
          </div>
        </div>

        <div class="timeline-item">
          <div class="timeline-marker"></div>
          <div class="timeline-content">
            <h3>Level 1 Documentation</h3>
            <p>
              Creation of comprehensive educational materials establishing 
              core concepts and practical applications of the system.
            </p>
          </div>
        </div>

        <div class="timeline-item">
          <div class="timeline-marker"></div>
          <div class="timeline-content">
            <h3>Digital Tool Development</h3>
            <p>
              Development of The Kinetic Constructor and related software 
              tools for sequence visualization and creation.
            </p>
          </div>
        </div>

        <div class="timeline-item">
          <div class="timeline-marker"></div>
          <div class="timeline-content">
            <h3>Community Platform</h3>
            <p>
              Building platforms for community engagement, collaboration, 
              and sharing of sequences and educational resources.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Technical Innovation -->
  <section class="innovation">
    <div class="container">
      <h2>Technical Innovation</h2>
      <div class="innovation-content">
        <div class="innovation-text">
          <h3>Advanced Visualization</h3>
          <p>
            The Kinetic Constructor represents cutting-edge web technology, 
            providing real-time visualization of complex movement sequences 
            through sophisticated rendering systems.
          </p>
          
          <h3>Cross-Platform Compatibility</h3>
          <p>
            Our tools work seamlessly across desktop and web platforms, 
            ensuring accessibility for practitioners regardless of their 
            preferred devices or operating systems.
          </p>
          
          <h3>Data-Driven Approach</h3>
          <p>
            Sequences are stored as structured data, enabling powerful 
            analysis, transformation, and sharing capabilities while 
            maintaining precision and consistency.
          </p>
        </div>
      </div>
    </div>
  </section>
</main>

<style>
  .about-container {
    min-height: 100vh;
    padding: 0;
  }

  /* Hero Section */
  .hero {
    position: relative;
    color: var(--text-color);
    padding: var(--spacing-3xl) 0 var(--spacing-2xl) 0;
    text-align: center;
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.8s ease;
    z-index: 1;
    min-height: 40vh;
    display: flex;
    align-items: center;

    /* Glassmorphism styling */
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 2rem;
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    margin: var(--spacing-lg);
  }

  .hero.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .hero-content {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 var(--spacing-xl);
  }

  .hero-title {
    font-size: 3rem;
    margin-bottom: var(--spacing-md);
    font-weight: 900;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .hero-subtitle {
    font-size: 1.25rem;
    opacity: 0.9;
    font-weight: 300;
  }

  /* Content Sections */
  .philosophy,
  .project-overview,
  .development,
  .innovation {
    padding: var(--spacing-3xl) 0;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--spacing-lg);
  }

  h2 {
    text-align: center;
    margin-bottom: var(--spacing-2xl);
    color: var(--text-color);
    font-size: 2.5rem;
    font-weight: 700;
  }

  /* Philosophy Section */
  .philosophy-content {
    max-width: 800px;
    margin: 0 auto;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    padding: var(--spacing-xl);
    border-radius: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .philosophy-content p {
    font-size: 1.125rem;
    line-height: 1.8;
    margin-bottom: var(--spacing-lg);
    color: rgba(255, 255, 255, 0.9);
  }

  /* Project Overview */
  .overview-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--spacing-xl);
  }

  .overview-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    padding: var(--spacing-xl);
    border-radius: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;
  }

  .overview-card:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .overview-card h3 {
    color: var(--text-color);
    margin-bottom: var(--spacing-md);
    font-size: 1.25rem;
    font-weight: 600;
  }

  .overview-card p {
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.6;
  }

  /* Timeline */
  .timeline {
    max-width: 800px;
    margin: 0 auto;
    position: relative;
  }

  .timeline::before {
    content: '';
    position: absolute;
    left: 20px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(to bottom, #667eea, #764ba2);
  }

  .timeline-item {
    position: relative;
    margin-bottom: var(--spacing-2xl);
    padding-left: var(--spacing-3xl);
  }

  .timeline-marker {
    position: absolute;
    left: 0;
    top: 0;
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: 3px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  .timeline-content {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    padding: var(--spacing-lg);
    border-radius: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .timeline-content h3 {
    color: var(--text-color);
    margin-bottom: var(--spacing-md);
    font-weight: 600;
  }

  .timeline-content p {
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.6;
  }

  /* Innovation Section */
  .innovation-content {
    max-width: 900px;
    margin: 0 auto;
  }

  .innovation-text {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    padding: var(--spacing-xl);
    border-radius: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .innovation-text h3 {
    color: var(--text-color);
    margin-bottom: var(--spacing-md);
    margin-top: var(--spacing-lg);
    font-size: 1.25rem;
    font-weight: 600;
  }

  .innovation-text h3:first-child {
    margin-top: 0;
  }

  .innovation-text p {
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.7;
    font-size: 1.1rem;
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .hero {
      padding: var(--spacing-2xl) 0;
      min-height: 30vh;
      margin: var(--spacing-md);
    }

    .hero-title {
      font-size: 2.5rem;
    }

    .hero-subtitle {
      font-size: 1.125rem;
    }

    .philosophy,
    .project-overview,
    .development,
    .innovation {
      padding: var(--spacing-2xl) 0;
    }

    .container {
      padding: 0 var(--spacing-md);
    }

    h2 {
      font-size: 2rem;
    }

    .philosophy-content,
    .innovation-text {
      padding: var(--spacing-lg);
    }

    .overview-grid {
      grid-template-columns: 1fr;
      gap: var(--spacing-lg);
    }

    .timeline::before {
      left: 15px;
    }

    .timeline-item {
      padding-left: var(--spacing-2xl);
    }

    .timeline-marker {
      width: 30px;
      height: 30px;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .hero {
      transition: none;
      opacity: 1;
      transform: none;
    }

    .overview-card {
      transition: none;
    }

    .overview-card:hover {
      transform: none;
    }
  }
</style>
