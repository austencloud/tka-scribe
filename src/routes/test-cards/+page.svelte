<script lang="ts">
  /**
   * Card Style Test Page
   * Compare different settings card styles side by side
   */

  const categories = [
    { title: "Profile", status: "Signed in", icon: "fa-user", gradient: "linear-gradient(135deg, var(--theme-accent, #6366f1), var(--theme-accent-strong, #8b5cf6))", color: "var(--theme-accent, #6366f1)" },
    { title: "Prop Type", status: "Fan", icon: "fa-tags", gradient: "linear-gradient(135deg, #ec4899, #f43f5e)", color: "#ec4899" },
    { title: "Background", status: "Deep Ocean", icon: "fa-image", gradient: "linear-gradient(135deg, #06b6d4, #0891b2)", color: "#06b6d4" },
  ];
</script>

<div class="test-page">
  <h1>Pick Your Favorite Card Style</h1>
  <p class="subtitle">Click anywhere outside this page to go back</p>

  <div class="styles-grid">
    <!-- Style A: Current Minimal -->
    <section class="style-section">
      <h2>A: Minimal Dark</h2>
      <p class="desc">Subdued, iOS Settings-like</p>
      <div class="cards">
        {#each categories as cat}
          <button class="card-a" style="--color: {cat.color}; --gradient: {cat.gradient}">
            <div class="icon"><i class="fas {cat.icon}"></i></div>
            <div class="content">
              <span class="title">{cat.title}</span>
              <span class="status">{cat.status}</span>
            </div>
            <div class="chevron"></div>
          </button>
        {/each}
      </div>
    </section>

    <!-- Style B: Glass Morphism -->
    <section class="style-section">
      <h2>B: Glass Morphism</h2>
      <p class="desc">Frosted glass with color tint</p>
      <div class="cards">
        {#each categories as cat}
          <button class="card-b" style="--color: {cat.color}; --gradient: {cat.gradient}">
            <div class="color-wash"></div>
            <div class="icon"><i class="fas {cat.icon}"></i></div>
            <div class="content">
              <span class="title">{cat.title}</span>
              <span class="status">{cat.status}</span>
            </div>
            <div class="chevron"></div>
          </button>
        {/each}
      </div>
    </section>

    <!-- Style C: Solid Bento -->
    <section class="style-section">
      <h2>C: Solid Gradient</h2>
      <p class="desc">Bold Bento-style colors</p>
      <div class="cards">
        {#each categories as cat}
          <button class="card-c" style="--color: {cat.color}; --gradient: {cat.gradient}">
            <div class="shine"></div>
            <div class="icon"><i class="fas {cat.icon}"></i></div>
            <div class="content">
              <span class="title">{cat.title}</span>
              <span class="status">{cat.status}</span>
            </div>
          </button>
        {/each}
      </div>
    </section>

    <!-- Style D: Accent Border -->
    <section class="style-section">
      <h2>D: Accent Border</h2>
      <p class="desc">Dark card, colored left edge</p>
      <div class="cards">
        {#each categories as cat}
          <button class="card-d" style="--color: {cat.color}; --gradient: {cat.gradient}">
            <div class="icon"><i class="fas {cat.icon}"></i></div>
            <div class="content">
              <span class="title">{cat.title}</span>
              <span class="status">{cat.status}</span>
            </div>
            <div class="chevron"></div>
          </button>
        {/each}
      </div>
    </section>

    <!-- Style E: Subtle Glow -->
    <section class="style-section">
      <h2>E: Subtle Glow</h2>
      <p class="desc">Dark card, soft colored glow</p>
      <div class="cards">
        {#each categories as cat}
          <button class="card-e" style="--color: {cat.color}; --gradient: {cat.gradient}">
            <div class="icon"><i class="fas {cat.icon}"></i></div>
            <div class="content">
              <span class="title">{cat.title}</span>
              <span class="status">{cat.status}</span>
            </div>
            <div class="chevron"></div>
          </button>
        {/each}
      </div>
    </section>

    <!-- Style F: Glass + Gradient Icon -->
    <section class="style-section">
      <h2>F: Glass + Bold Icon</h2>
      <p class="desc">Frosted card, gradient icon box</p>
      <div class="cards">
        {#each categories as cat}
          <button class="card-f" style="--color: {cat.color}; --gradient: {cat.gradient}">
            <div class="icon"><i class="fas {cat.icon}"></i></div>
            <div class="content">
              <span class="title">{cat.title}</span>
              <span class="status">{cat.status}</span>
            </div>
            <div class="chevron"></div>
          </button>
        {/each}
      </div>
    </section>
  </div>
</div>

<style>
  .test-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    padding: 40px 24px;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
  }

  h1 {
    text-align: center;
    color: white;
    font-size: 2rem;
    margin: 0 0 8px;
  }

  .subtitle {
    text-align: center;
    color: rgba(255,255,255,0.5);
    margin: 0 0 40px;
  }

  .styles-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 32px;
    max-width: 1400px;
    margin: 0 auto;
  }

  .style-section {
    background: rgba(0,0,0,0.3);
    border-radius: 20px;
    padding: 24px;
  }

  .style-section h2 {
    color: white;
    font-size: 1.25rem;
    margin: 0 0 4px;
  }

  .style-section .desc {
    color: rgba(255,255,255,0.5);
    font-size: 0.875rem;
    margin: 0 0 20px;
  }

  .cards {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  /* ========== STYLE A: Minimal Dark ========== */
  .card-a {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 16px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px;
    cursor: pointer;
    transition: all 150ms ease;
  }
  .card-a:hover {
    background: rgba(255,255,255,0.1);
    transform: translateX(4px);
  }
  .card-a .icon {
    width: 40px; height: 40px;
    background: var(--gradient);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: 18px;
  }
  .card-a .content { flex: 1; text-align: left; }
  .card-a .title { display: block; color: rgba(255,255,255,0.95); font-weight: 600; font-size: 0.9375rem; }
  .card-a .status { display: block; color: rgba(255,255,255,0.5); font-size: 0.8125rem; }
  .card-a .chevron {
    width: 8px; height: 8px;
    border-right: 2px solid rgba(255,255,255,0.3);
    border-bottom: 2px solid rgba(255,255,255,0.3);
    transform: rotate(-45deg);
  }

  /* ========== STYLE B: Glass Morphism ========== */
  .card-b {
    position: relative;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 16px;
    background: rgba(255,255,255,0.08);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 14px;
    cursor: pointer;
    overflow: hidden;
    transition: all 150ms ease;
  }
  .card-b .color-wash {
    position: absolute;
    inset: 0;
    background: var(--gradient);
    opacity: 0.12;
    pointer-events: none;
  }
  .card-b:hover {
    border-color: rgba(255,255,255,0.2);
    transform: translateX(4px);
  }
  .card-b:hover .color-wash { opacity: 0.18; }
  .card-b .icon {
    position: relative;
    width: 40px; height: 40px;
    background: rgba(255,255,255,0.15);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    color: var(--color); font-size: 18px;
  }
  .card-b .content { position: relative; flex: 1; text-align: left; }
  .card-b .title { display: block; color: rgba(255,255,255,0.95); font-weight: 600; font-size: 0.9375rem; }
  .card-b .status { display: block; color: rgba(255,255,255,0.6); font-size: 0.8125rem; }
  .card-b .chevron {
    position: relative;
    width: 8px; height: 8px;
    border-right: 2px solid rgba(255,255,255,0.3);
    border-bottom: 2px solid rgba(255,255,255,0.3);
    transform: rotate(-45deg);
  }

  /* ========== STYLE C: Solid Gradient ========== */
  .card-c {
    position: relative;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px 18px;
    background: var(--gradient);
    border: none;
    border-radius: 16px;
    cursor: pointer;
    overflow: hidden;
    transition: all 150ms ease;
  }
  .card-c .shine {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%);
    pointer-events: none;
  }
  .card-c:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 12px 32px rgba(0,0,0,0.3);
  }
  .card-c .icon {
    position: relative;
    width: 40px; height: 40px;
    background: rgba(255,255,255,0.2);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: 18px;
  }
  .card-c .content { position: relative; flex: 1; text-align: left; }
  .card-c .title { display: block; color: white; font-weight: 600; font-size: 0.9375rem; }
  .card-c .status { display: block; color: rgba(255,255,255,0.85); font-size: 0.8125rem; }

  /* ========== STYLE D: Accent Border ========== */
  .card-d {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 16px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.08);
    border-left: 3px solid var(--color);
    border-radius: 14px;
    cursor: pointer;
    transition: all 150ms ease;
  }
  .card-d:hover {
    background: rgba(255,255,255,0.1);
    transform: translateX(4px);
  }
  .card-d .icon {
    width: 40px; height: 40px;
    background: color-mix(in srgb, var(--color) 20%, transparent);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    color: var(--color); font-size: 18px;
  }
  .card-d .content { flex: 1; text-align: left; }
  .card-d .title { display: block; color: rgba(255,255,255,0.95); font-weight: 600; font-size: 0.9375rem; }
  .card-d .status { display: block; color: rgba(255,255,255,0.5); font-size: 0.8125rem; }
  .card-d .chevron {
    width: 8px; height: 8px;
    border-right: 2px solid rgba(255,255,255,0.3);
    border-bottom: 2px solid rgba(255,255,255,0.3);
    transform: rotate(-45deg);
  }

  /* ========== STYLE E: Subtle Glow ========== */
  .card-e {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 16px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px;
    cursor: pointer;
    transition: all 150ms ease;
    box-shadow: 0 0 20px -5px color-mix(in srgb, var(--color) 30%, transparent);
  }
  .card-e:hover {
    background: rgba(255,255,255,0.1);
    transform: translateX(4px);
    box-shadow: 0 0 30px -5px color-mix(in srgb, var(--color) 50%, transparent);
  }
  .card-e .icon {
    width: 40px; height: 40px;
    background: var(--gradient);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: 18px;
  }
  .card-e .content { flex: 1; text-align: left; }
  .card-e .title { display: block; color: rgba(255,255,255,0.95); font-weight: 600; font-size: 0.9375rem; }
  .card-e .status { display: block; color: rgba(255,255,255,0.5); font-size: 0.8125rem; }
  .card-e .chevron {
    width: 8px; height: 8px;
    border-right: 2px solid rgba(255,255,255,0.3);
    border-bottom: 2px solid rgba(255,255,255,0.3);
    transform: rotate(-45deg);
  }

  /* ========== STYLE F: Glass + Bold Icon ========== */
  .card-f {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 16px;
    background: rgba(255,255,255,0.08);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 14px;
    cursor: pointer;
    transition: all 150ms ease;
  }
  .card-f:hover {
    background: rgba(255,255,255,0.12);
    border-color: rgba(255,255,255,0.15);
    transform: translateX(4px);
  }
  .card-f .icon {
    width: 40px; height: 40px;
    background: var(--gradient);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: 18px;
    box-shadow: 0 4px 12px color-mix(in srgb, var(--color) 40%, transparent);
  }
  .card-f .content { flex: 1; text-align: left; }
  .card-f .title { display: block; color: rgba(255,255,255,0.95); font-weight: 600; font-size: 0.9375rem; }
  .card-f .status { display: block; color: rgba(255,255,255,0.55); font-size: 0.8125rem; }
  .card-f .chevron {
    width: 8px; height: 8px;
    border-right: 2px solid rgba(255,255,255,0.3);
    border-bottom: 2px solid rgba(255,255,255,0.3);
    transform: rotate(-45deg);
  }
</style>
