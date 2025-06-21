<script lang="ts">
  import { onMount } from 'svelte';
  import CallToAction from '../../components/CallToAction.svelte';

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
  <!-- Hero Section -->
  <section class="hero-section">
    <div class="hero">
      <div class="hero-content">
      <div class="hero-badge">
        <span class="badge-text">Coming Soon</span>
      </div>
      <h1 class="hero-title">Kinetic Constructor</h1>
      <p class="hero-subtitle">The Revolutionary Flow Arts Creation Tool</p>
      <p class="hero-description">
        Transform your flow arts practice with the most advanced sequence creation,
        visualization, and sharing platform ever built. Design complex movements,
        analyze patterns, and collaborate with the global flow community.
      </p>
      <div class="hero-actions">
        <CallToAction
          text="Join Early Access"
          link="mailto:info@thekineticalphabet.com?subject=Kinetic Constructor Early Access"
          primary={true}
        />
        <CallToAction
          text="Watch Preview"
          link="https://youtube.com/@thekineticalphabet"
          primary={false}
        />
      </div>
    </div>
    <div class="hero-visual">
      <div class="constructor-preview">
        <div class="preview-screen">
          <div class="preview-header">
            <div class="preview-title-section">
              <div class="app-icon">🎨</div>
              <span class="preview-title">Kinetic Constructor v0.2.0</span>
            </div>
            <div class="preview-controls">
              <button class="control-button minimize" aria-label="Minimize">
                <span class="control-icon">−</span>
              </button>
              <button class="control-button maximize" aria-label="Maximize">
                <span class="control-icon">□</span>
              </button>
              <button class="control-button close" aria-label="Close">
                <span class="control-icon">×</span>
              </button>
            </div>
          </div>
          <div class="preview-content">
            <div class="sequence-grid">
              <div class="sequence-block active"></div>
              <div class="sequence-block"></div>
              <div class="sequence-block"></div>
              <div class="sequence-block active"></div>
              <div class="sequence-block"></div>
              <div class="sequence-block active"></div>
            </div>
            <div class="timeline">
              <div class="timeline-track"></div>
              <div class="timeline-progress"></div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <section class="features">
    <div class="container">
      <h2>Revolutionary Features</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">🎨</div>
          <h3>Visual Sequence Builder</h3>
          <p>Drag-and-drop interface for creating complex flow sequences with real-time 3D visualization and physics simulation.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">🧠</div>
          <h3>AI-Powered Analysis</h3>
          <p>Advanced pattern recognition analyzes your sequences for flow optimization, difficulty assessment, and creative suggestions.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">🌐</div>
          <h3>Global Collaboration</h3>
          <p>Share sequences with the community, collaborate on choreographies, and discover new patterns from artists worldwide.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">📊</div>
          <h3>Performance Analytics</h3>
          <p>Track your progress, analyze movement efficiency, and receive personalized training recommendations based on your style.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">🎵</div>
          <h3>Music Integration</h3>
          <p>Sync sequences to music with beat detection, tempo matching, and automatic choreography suggestions for any track.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">📱</div>
          <h3>Cross-Platform Sync</h3>
          <p>Seamlessly work across desktop, tablet, and mobile devices with cloud synchronization and offline capabilities.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Coming Soon Section -->
  <section class="coming-soon">
    <div class="container">
      <div class="coming-soon-content">
        <h2>Early Access Program</h2>
        <p class="coming-soon-description">
          The Kinetic Constructor is currently in development with a select group of professional flow artists
          and educators. Join our early access program to be among the first to experience the future of flow arts creation.
        </p>

        <div class="timeline-preview">
          <div class="timeline-item completed">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <h4>Alpha Testing</h4>
              <p>Core functionality with professional testers</p>
              <span class="timeline-status">Completed</span>
            </div>
          </div>

          <div class="timeline-item active">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <h4>Beta Release</h4>
              <p>Extended features for early access members</p>
              <span class="timeline-status">Q2 2024</span>
            </div>
          </div>

          <div class="timeline-item">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <h4>Public Launch</h4>
              <p>Full release with all features available</p>
              <span class="timeline-status">Q3 2024</span>
            </div>
          </div>
        </div>

        <div class="early-access-actions">
          <CallToAction
            text="Request Early Access"
            link="mailto:info@thekineticalphabet.com?subject=Kinetic Constructor Early Access Request"
            primary={true}
          />
        </div>
      </div>
    </div>
  </section>

  <!-- Newsletter Section -->
  <section class="newsletter-section">
    <div class="container">
      <div class="newsletter-content">
        <h2>Stay Updated</h2>
        <p>Be the first to know about Kinetic Constructor updates, new features, and release announcements.</p>
        <!-- Newsletter component would go here if we had one -->
        <div class="newsletter-placeholder">
          <CallToAction
            text="Join Our Newsletter"
            link="mailto:info@thekineticalphabet.com?subject=Newsletter Signup"
            primary={false}
          />
        </div>
      </div>
    </div>
  </section>
</main>

<style>
  /*
   * Kinetic Constructor Page Styling
   *
   * Features:
   * - Consistent glassmorphism design system
   * - Engaging hero section with preview mockup
   * - Feature showcase with micro-interactions
   * - Development timeline visualization
   * - Mobile-first responsive design
   * - Accessibility compliance (WCAG 2.1 AA)
   */

  .constructor-page {
    min-height: 100vh;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    position: relative;
  }

  .container {
    width: 100%;
    max-width: var(--container-max-width-wide);
    margin: 0 auto;
    padding: 0 var(--container-padding);
  }

  /* Hero Section */
  .hero-section {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .hero {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-3xl);
    align-items: center;
    min-height: 80vh;
    padding: var(--spacing-3xl) 0;
    color: white;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
    box-sizing: border-box;
    padding-left: var(--spacing-lg);
    padding-right: var(--spacing-lg);
  }

  .hero-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
  }

  .hero-badge {
    display: inline-flex;
    align-self: flex-start;
    padding: var(--spacing-xs) var(--spacing-md);
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-radius: var(--border-radius-full);
    border: 1px solid rgba(255, 255, 255, 0.3);
    font-size: var(--font-size-sm);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .hero-title {
    font-size: clamp(2.5rem, 5vw, 4rem);
    font-weight: 800;
    margin: 0;
    line-height: 1.1;
    background: linear-gradient(135deg, #ffffff, #e0e0e0);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero-subtitle {
    font-size: var(--font-size-xl);
    font-weight: 600;
    margin: 0;
    opacity: 0.9;
  }

  .hero-description {
    font-size: var(--font-size-lg);
    line-height: 1.6;
    opacity: 0.8;
    max-width: 500px;
  }

  .hero-actions {
    display: flex;
    gap: var(--spacing-md);
    flex-wrap: wrap;
  }

  /* Constructor Preview Mockup */
  .hero-visual {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .constructor-preview {
    position: relative;
    transform: perspective(1000px) rotateY(-15deg) rotateX(5deg);
    transition: transform var(--transition-normal);
  }

  .constructor-preview:hover {
    transform: perspective(1000px) rotateY(-10deg) rotateX(2deg) scale(1.02);
  }

  .preview-screen {
    width: 400px;
    height: 300px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: var(--border-radius);
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow:
      0 20px 40px rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba(255, 255, 255, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    overflow: hidden;
  }

  .preview-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-sm) var(--spacing-md);
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05));
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .preview-title-section {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .app-icon {
    font-size: 1rem;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .preview-title {
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }

  .preview-controls {
    display: flex;
    gap: 1px;
  }

  .control-button {
    width: 32px;
    height: 24px;
    border: none;
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 400;
    transition: background-color var(--transition-fast);
    border-radius: 0;
  }

  .control-button:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .control-button.close:hover {
    background: #e81123;
    color: white;
  }

  .control-button.maximize:hover {
    background: rgba(255, 255, 255, 0.25);
  }

  .control-button.minimize:hover {
    background: rgba(255, 255, 255, 0.25);
  }

  .control-button:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.8);
    outline-offset: -2px;
  }

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
