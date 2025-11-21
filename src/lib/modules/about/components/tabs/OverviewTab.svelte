<script lang="ts">
  import { navigationState } from "$lib/shared/navigation/state/navigation-state.svelte";

  // Module information extracted from navigation state
  const modules = [
    {
      id: "create",
      name: "Create",
      icon: "🛠️",
      color: "#f59e0b",
      description: "Build movement sequences using three powerful tools",
      tabs: [
        {
          name: "Assemble",
          desc: "Build sequences one hand at a time with 6 simple choices - perfect for beginners",
        },
        {
          name: "Construct",
          desc: "Create sequences step by step with all options available - full control",
        },
        {
          name: "Generate",
          desc: "Auto-generate sequences based on your preferences - quick exploration",
        },
      ],
    },
    {
      id: "animate",
      name: "Animate",
      icon: "▶️",
      color: "#ec4899",
      description: "Visualize sequences with advanced animation modes",
      tabs: [
        {
          name: "Single",
          desc: "Animate one sequence - clear, focused practice",
        },
        {
          name: "Tunnel",
          desc: "Overlay two sequences - compare movements side-by-side",
        },
        {
          name: "Mirror",
          desc: "Side-by-side mirrored view - perfect for partner practice",
        },
        {
          name: "Grid",
          desc: "2×2 rotated grid - see all four orientations at once",
        },
      ],
    },
    {
      id: "explore",
      name: "Explore",
      icon: "🧭",
      color: "#a855f7",
      description: "Discover and browse movement sequences",
      tabs: [
        {
          name: "Gallery",
          desc: "Browse all available sequences - find inspiration",
        },
        {
          name: "Collections",
          desc: "Explore curated playlists - themed sequence sets",
        },
      ],
    },
    {
      id: "learn",
      name: "Learn",
      icon: "🎓",
      color: "#3b82f6",
      description: "Study TKA notation and improve your skills",
      tabs: [
        {
          name: "Concepts",
          desc: "Progressive concept mastery path - structured learning",
        },
        {
          name: "Drills",
          desc: "Quick pictograph flash card quizzes - test your knowledge",
        },
      ],
    },
    {
      id: "collect",
      name: "Collect",
      icon: "📦",
      color: "#10b981",
      description: "Your personal library and achievements",
      tabs: [
        {
          name: "Gallery",
          desc: "Your saved sequences - easy access to favorites",
        },
        {
          name: "Achievements",
          desc: "Progress, stats, and unlocked achievements - track your journey",
        },
        {
          name: "Challenges",
          desc: "Daily challenges and active quests - stay motivated",
        },
      ],
    },
    {
      id: "community",
      name: "Community",
      icon: "👥",
      color: "#06b6d4",
      description: "Connect with other flow artists",
      tabs: [
        {
          name: "Leaderboards",
          desc: "Top performers and rankings - see who's leading",
        },
        {
          name: "Creators",
          desc: "Discover community members - find collaborators",
        },
        {
          name: "Achievements",
          desc: "Community achievement showcase - get inspired",
        },
      ],
    },
  ];
</script>

<!-- Overview Tab - Application Guide -->
<div class="overview-tab" role="main" aria-label="TKA Studio Application Guide">
  <!-- Hero Section -->
  <section class="hero-section" aria-labelledby="hero-heading">
    <h1 id="hero-heading">TKA Studio Guide</h1>
    <p class="tagline">
      Master the tools to build, animate, and explore flow art sequences
    </p>
    <p class="subtitle">
      Navigate between modules using the buttons at the top of the screen
    </p>
  </section>

  <!-- Quick Start Section -->
  <section class="quick-start-intro" aria-labelledby="quick-start-heading">
    <h2 id="quick-start-heading">Getting Started</h2>
    <article class="quick-summary">
      <div class="quick-tips">
        <div class="tip-item">
          <span class="tip-icon" aria-hidden="true">🎯</span>
          <div>
            <strong>New to TKA?</strong> Start with
            <strong>Create → Assemble</strong> to build your first sequence
          </div>
        </div>
        <div class="tip-item">
          <span class="tip-icon" aria-hidden="true">📖</span>
          <div>
            <strong>Want to learn?</strong> Visit
            <strong>Learn → Concepts</strong> for structured lessons
          </div>
        </div>
        <div class="tip-item">
          <span class="tip-icon" aria-hidden="true">✨</span>
          <div>
            <strong>Need inspiration?</strong> Browse
            <strong>Explore → Gallery</strong> for sequences
          </div>
        </div>
        <div class="tip-item">
          <span class="tip-icon" aria-hidden="true">▶️</span>
          <div>
            <strong>Ready to practice?</strong> Use <strong>Animate</strong> to visualize
            movements
          </div>
        </div>
      </div>
    </article>
  </section>

  <!-- Modules Section -->
  <section class="modules-guide" aria-labelledby="modules-heading">
    <h2 id="modules-heading">Application Modules</h2>
    <p class="section-intro">
      TKA Studio is organized into six main modules, each with specialized
      tools:
    </p>

    <div class="modules-grid" role="list" aria-label="Application Modules">
      {#each modules as module}
        <article class="module-card" role="listitem">
          <div class="module-header">
            <div
              class="module-icon"
              aria-hidden="true"
              style="color: {module.color}"
            >
              {module.icon}
            </div>
            <h3>{module.name}</h3>
          </div>
          <p class="module-description">{module.description}</p>

          <div class="module-tabs">
            <h4 class="tabs-heading">Available Tools:</h4>
            <ul class="tabs-list">
              {#each module.tabs as tab}
                <li class="tab-item">
                  <strong>{tab.name}:</strong>
                  {tab.desc}
                </li>
              {/each}
            </ul>
          </div>
        </article>
      {/each}
    </div>
  </section>

  <!-- Navigation Tips -->
  <section class="navigation-tips" aria-labelledby="tips-heading">
    <h2 id="tips-heading">Navigation Tips</h2>
    <div class="tips-grid">
      <article class="tip-card">
        <div class="tip-icon-large" aria-hidden="true">⌨️</div>
        <h3>Keyboard Shortcuts</h3>
        <p>
          Press <kbd>Tab</kbd> to navigate between elements. Press
          <kbd>Enter</kbd> to select.
        </p>
      </article>

      <article class="tip-card">
        <div class="tip-icon-large" aria-hidden="true">💾</div>
        <h3>Auto-Save</h3>
        <p>
          Your work is automatically saved. Return anytime to continue where you
          left off.
        </p>
      </article>

      <article class="tip-card">
        <div class="tip-icon-large" aria-hidden="true">🔗</div>
        <h3>Share Links</h3>
        <p>
          Created sequences can be shared via URL - perfect for collaboration
          and teaching.
        </p>
      </article>

      <article class="tip-card">
        <div class="tip-icon-large" aria-hidden="true">🎨</div>
        <h3>Customization</h3>
        <p>
          Adjust colors, backgrounds, and display settings in the settings
          panel.
        </p>
      </article>
    </div>
  </section>

  <!-- Other Tabs -->
  <section class="other-tabs" aria-labelledby="other-tabs-heading">
    <h2 id="other-tabs-heading">More Resources in About</h2>
    <div class="about-tabs-grid">
      <article class="about-tab-card">
        <div class="about-tab-icon" aria-hidden="true">📚</div>
        <h3>Historian</h3>
        <p>Explore flow arts resources, vendors, and community links</p>
      </article>

      <article class="about-tab-card">
        <div class="about-tab-icon" aria-hidden="true">❤️</div>
        <h3>Support</h3>
        <p>Help keep TKA alive through donations or contributions</p>
      </article>
    </div>
  </section>
</div>

<style>
  /* Spacing System - Consistent rhythm throughout */
  :root {
    --section-spacing: clamp(3rem, 6vw, 5rem);
    --section-header-spacing: clamp(1.25rem, 3vw, 2rem);
    --card-gap: clamp(1.25rem, 2.5vw, 1.75rem);
  }

  /* Base Layout */
  .overview-tab {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    padding: clamp(1.5rem, 4vw, 3rem) clamp(1rem, 2vw, 1.5rem)
      clamp(2rem, 5vw, 4rem);
    background: transparent;
    scroll-behavior: smooth;
  }

  /* Focus Indicators - Accessibility */
  .module-card:focus,
  .tip-card:focus,
  .about-tab-card:focus {
    outline: 3px solid rgba(102, 126, 234, 0.8);
    outline-offset: 4px;
    border-radius: 1rem;
  }

  /* Respect reduced motion preference */
  @media (prefers-reduced-motion: reduce) {
    .overview-tab {
      scroll-behavior: auto;
    }

    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  /* Section Separators - Subtle visual rhythm */
  section + section {
    margin-top: var(--section-spacing);
    position: relative;
  }

  section + section::before {
    content: "";
    position: absolute;
    top: calc(var(--section-spacing) / -2);
    left: 50%;
    transform: translateX(-50%);
    width: clamp(100px, 30%, 300px);
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(102, 126, 234, 0.2) 20%,
      rgba(102, 126, 234, 0.3) 50%,
      rgba(102, 126, 234, 0.2) 80%,
      transparent
    );
    opacity: 0.7;
  }

  /* No separator before hero */
  .hero-section::before {
    display: none;
  }

  /* Hero Section */
  .hero-section {
    text-align: center;
    padding-bottom: clamp(1rem, 3vw, 2rem);
    max-width: 1400px;
    margin-left: auto;
    margin-right: auto;
  }

  .hero-section h1 {
    font-size: clamp(2rem, 5vw, 3.5rem);
    margin-bottom: clamp(0.75rem, 2vw, 1.5rem);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 900;
    line-height: 1.2;
    letter-spacing: -0.02em;
  }

  .tagline {
    font-size: clamp(1.125rem, 2.5vw, 1.5rem);
    color: var(--text-secondary);
    margin-bottom: clamp(0.75rem, 2vw, 1rem);
    opacity: 0.95;
    line-height: 1.5;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
  }

  .subtitle {
    font-size: clamp(0.9375rem, 2vw, 1.125rem);
    color: var(--text-secondary);
    opacity: 0.8;
    font-style: italic;
    max-width: 600px;
    margin: 0 auto;
  }

  /* Shared Section Styles */
  section {
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
  }

  /* Shared Section Heading Styles */
  section h2 {
    text-align: center;
    margin-bottom: var(--section-header-spacing);
    font-size: clamp(1.75rem, 4vw, 2.5rem);
    color: var(--text-color);
    font-weight: 700;
    letter-spacing: -0.01em;
  }

  .quick-summary {
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 1.25rem;
    padding: clamp(1.5rem, 3vw, 2.5rem);
    max-width: 900px;
    margin-left: auto;
    margin-right: auto;
    box-shadow:
      0 4px 6px rgba(0, 0, 0, 0.1),
      0 10px 20px rgba(102, 126, 234, 0.05);
    position: relative;
    overflow: hidden;
  }

  .quick-summary::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(102, 126, 234, 0.5),
      transparent
    );
  }

  .quick-tips {
    display: grid;
    gap: clamp(0.875rem, 2vw, 1.25rem);
  }

  .tip-item {
    display: flex;
    align-items: flex-start;
    gap: clamp(0.875rem, 2vw, 1.25rem);
    padding: clamp(0.875rem, 2vw, 1.25rem);
    background: rgba(255, 255, 255, 0.02);
    border-radius: 0.875rem;
    border-left: 3px solid rgba(102, 126, 234, 0.3);
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .tip-item:hover {
    background: rgba(255, 255, 255, 0.04);
    border-left-color: rgba(102, 126, 234, 0.6);
    transform: translateX(4px);
  }

  .tip-icon {
    font-size: clamp(1.5rem, 3vw, 2rem);
    flex-shrink: 0;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  }

  .tip-item div {
    flex: 1;
    color: var(--text-secondary);
    font-size: clamp(0.9375rem, 2vw, 1.0625rem);
    line-height: 1.7;
  }

  .tip-item strong {
    color: var(--text-color);
    font-weight: 600;
  }

  /* Section Intro Text (appears under h2) */
  .section-intro {
    text-align: center;
    color: var(--text-secondary);
    font-size: clamp(1rem, 2vw, 1.125rem);
    margin-bottom: clamp(1.75rem, 3.5vw, 2.75rem);
    max-width: 700px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.65;
    opacity: 0.9;
  }

  .modules-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 350px), 1fr));
    gap: var(--card-gap);
  }

  .module-card {
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 1.25rem;
    padding: clamp(1.5rem, 3vw, 2rem);
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    position: relative;
    overflow: hidden;
    box-shadow:
      0 2px 4px rgba(0, 0, 0, 0.08),
      0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .module-card::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(102, 126, 234, 0.05),
      rgba(118, 75, 162, 0.05)
    );
    opacity: 0;
    transition: opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .module-card:hover::before,
  .module-card:focus::before {
    opacity: 1;
  }

  .module-card:hover,
  .module-card:focus {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-6px) scale(1.02);
    box-shadow:
      0 8px 16px rgba(0, 0, 0, 0.12),
      0 16px 32px rgba(102, 126, 234, 0.15);
    border-color: rgba(102, 126, 234, 0.3);
  }

  .module-header {
    display: flex;
    align-items: center;
    gap: clamp(0.75rem, 2vw, 1rem);
    margin-bottom: clamp(0.75rem, 2vw, 1rem);
  }

  .module-icon {
    font-size: clamp(2rem, 4vw, 2.5rem);
    flex-shrink: 0;
    transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  }

  .module-card:hover .module-icon,
  .module-card:focus .module-icon {
    transform: scale(1.15) rotate(5deg);
  }

  @media (prefers-reduced-motion: reduce) {
    .module-card:hover .module-icon,
    .module-card:focus .module-icon {
      transform: none;
    }
  }

  .module-header h3 {
    color: var(--text-color);
    font-size: clamp(1.25rem, 2.5vw, 1.5rem);
    font-weight: 700;
    margin: 0;
    line-height: 1.2;
  }

  .module-description {
    color: var(--text-secondary);
    line-height: 1.65;
    margin-bottom: clamp(1rem, 2vw, 1.5rem);
    font-size: clamp(0.9375rem, 2vw, 1rem);
  }

  .module-tabs {
    background: rgba(255, 255, 255, 0.02);
    border-radius: 0.75rem;
    padding: clamp(0.875rem, 2vw, 1.25rem);
    border-top: 2px solid rgba(102, 126, 234, 0.2);
  }

  .tabs-heading {
    color: var(--text-color);
    font-size: clamp(0.875rem, 2vw, 1rem);
    font-weight: 600;
    margin: 0 0 clamp(0.5rem, 1.5vw, 0.875rem) 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    opacity: 0.9;
  }

  .tabs-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: clamp(0.5rem, 1.5vw, 0.75rem);
  }

  .tab-item {
    color: var(--text-secondary);
    font-size: clamp(0.875rem, 1.8vw, 0.9375rem);
    line-height: 1.6;
    padding-left: clamp(0.75rem, 2vw, 1rem);
    position: relative;
  }

  .tab-item::before {
    content: "▸";
    position: absolute;
    left: 0;
    color: rgba(102, 126, 234, 0.6);
    font-size: 0.875em;
  }

  .tab-item strong {
    color: var(--text-color);
    font-weight: 600;
  }

  /* Navigation Tips Grid */
  .tips-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
    gap: var(--card-gap);
  }

  .tip-card {
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 1.25rem;
    padding: clamp(1.5rem, 3vw, 2rem);
    text-align: center;
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    position: relative;
    overflow: hidden;
    box-shadow:
      0 2px 4px rgba(0, 0, 0, 0.08),
      0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .tip-card::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .tip-card:hover::after,
  .tip-card:focus::after {
    transform: scaleX(1);
  }

  .tip-card:hover,
  .tip-card:focus {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-8px) scale(1.02);
    box-shadow:
      0 12px 24px rgba(0, 0, 0, 0.15),
      0 24px 48px rgba(102, 126, 234, 0.2);
    border-color: rgba(102, 126, 234, 0.3);
  }

  .tip-icon-large {
    font-size: clamp(2.5rem, 5vw, 3.5rem);
    margin-bottom: clamp(0.75rem, 2vw, 1.25rem);
    display: inline-block;
    transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  }

  .tip-card:hover .tip-icon-large,
  .tip-card:focus .tip-icon-large {
    transform: scale(1.2) rotate(-5deg);
  }

  @media (prefers-reduced-motion: reduce) {
    .tip-card:hover .tip-icon-large,
    .tip-card:focus .tip-icon-large {
      transform: none;
    }
  }

  .tip-card h3 {
    color: var(--text-color);
    margin-bottom: clamp(0.5rem, 1.5vw, 0.875rem);
    font-size: clamp(1.0625rem, 2.5vw, 1.25rem);
    font-weight: 600;
    line-height: 1.3;
  }

  .tip-card p {
    color: var(--text-secondary);
    line-height: 1.65;
    font-size: clamp(0.9375rem, 2vw, 1rem);
  }

  .tip-card kbd {
    background: rgba(255, 255, 255, 0.1);
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-family: ui-monospace, monospace;
    font-size: 0.875em;
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  /* Other About Tabs - Narrower width for better fit */
  .other-tabs {
    max-width: 900px;
  }

  .about-tabs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
    gap: var(--card-gap);
  }

  .about-tab-card {
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 1.25rem;
    padding: clamp(1.5rem, 3vw, 2rem);
    text-align: center;
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    position: relative;
    overflow: hidden;
    box-shadow:
      0 2px 4px rgba(0, 0, 0, 0.08),
      0 4px 12px rgba(0, 0, 0, 0.05);
    min-height: 180px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .about-tab-card::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(102, 126, 234, 0.05),
      rgba(118, 75, 162, 0.05)
    );
    opacity: 0;
    transition: opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .about-tab-card:hover::before,
  .about-tab-card:focus::before {
    opacity: 1;
  }

  .about-tab-card:hover,
  .about-tab-card:focus {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-6px) scale(1.02);
    box-shadow:
      0 8px 16px rgba(0, 0, 0, 0.12),
      0 16px 32px rgba(102, 126, 234, 0.15);
    border-color: rgba(102, 126, 234, 0.3);
  }

  .about-tab-icon {
    font-size: clamp(2.5rem, 5vw, 3.5rem);
    margin-bottom: clamp(0.75rem, 2vw, 1.25rem);
    display: inline-block;
    transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  }

  .about-tab-card:hover .about-tab-icon,
  .about-tab-card:focus .about-tab-icon {
    transform: scale(1.15) rotate(5deg);
  }

  @media (prefers-reduced-motion: reduce) {
    .about-tab-card:hover .about-tab-icon,
    .about-tab-card:focus .about-tab-icon {
      transform: none;
    }
  }

  .about-tab-card h3 {
    color: var(--text-color);
    margin-bottom: clamp(0.5rem, 1.5vw, 0.875rem);
    font-size: clamp(1.125rem, 2.5vw, 1.375rem);
    font-weight: 600;
    line-height: 1.3;
  }

  .about-tab-card p {
    color: var(--text-secondary);
    line-height: 1.65;
    font-size: clamp(0.9375rem, 2vw, 1rem);
    margin: 0;
  }

  /* Responsive Breakpoints */

  /* Extra small devices (phones, less than 576px) */
  @media (max-width: 575px) {
    :root {
      --section-spacing: clamp(2rem, 5vw, 3rem);
      --section-header-spacing: clamp(1rem, 2.5vw, 1.5rem);
      --card-gap: 1rem;
    }

    .overview-tab {
      padding: clamp(1rem, 3vw, 1.5rem) clamp(0.875rem, 2vw, 1rem)
        clamp(1.5rem, 4vw, 2rem);
    }

    .modules-grid,
    .tips-grid,
    .about-tabs-grid {
      grid-template-columns: 1fr;
    }

    /* Reduce separator visibility on mobile */
    section + section::before {
      opacity: 0.5;
    }
  }

  /* Small devices (landscape phones, 576px and up) */
  @media (min-width: 576px) and (max-width: 767px) {
    .modules-grid {
      grid-template-columns: 1fr;
    }

    .tips-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  /* Medium devices (tablets, 768px and up) */
  @media (min-width: 768px) and (max-width: 1023px) {
    .modules-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .tips-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  /* Large devices (desktops, 1024px and up) */
  @media (min-width: 1024px) {
    .modules-grid {
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    }

    .tips-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  /* Extra large devices (large desktops, 1440px and up) */
  @media (min-width: 1440px) {
    .overview-tab {
      max-width: 1600px;
      margin: 0 auto;
    }

    .hero-section,
    .quick-start-intro,
    .modules-guide,
    .navigation-tips {
      max-width: 1400px;
    }
  }

  /* Ultra wide screens (1920px and up) */
  @media (min-width: 1920px) {
    .overview-tab {
      max-width: 1800px;
    }
  }

  /* Touch device optimizations */
  @media (hover: none) and (pointer: coarse) {
    /* Ensure minimum touch targets */
    .module-card,
    .tip-card,
    .about-tab-card {
      min-height: 200px;
    }

    /* Remove hover-only effects on touch devices */
    .tip-item:hover {
      transform: none;
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .module-card,
    .tip-card,
    .about-tab-card,
    .quick-summary {
      border-width: 2px;
      border-color: currentColor;
    }
  }
</style>
