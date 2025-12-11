<!--
  Transform Actions Style Test Page
  Compare different styling approaches for the Sequence Actions panel
-->
<script lang="ts">
  interface TransformAction {
    id: string;
    icon: string;
    name: string;
    shortDesc: string;
    color: string;
  }

  const actions: TransformAction[] = [
    { id: "mirror", icon: "fa-left-right", name: "Mirror", shortDesc: "Flip left & right", color: "#a855f7" },
    { id: "rotate", icon: "fa-rotate-right", name: "Rotate", shortDesc: "Pivot 45°", color: "#f59e0b" },
    { id: "swap", icon: "fa-arrows-rotate", name: "Swap Hands", shortDesc: "Switch movements", color: "#10b981" },
    { id: "reverse", icon: "fa-backward", name: "Reverse", shortDesc: "Retrace to start", color: "#f43f5e" },
  ];

  let selectedStyle = $state<string | null>(null);
</script>

<div class="test-page">
  <h1>Transform Actions - Style Comparison</h1>
  <p class="subtitle">Click any panel to select it as your favorite</p>

  <div class="styles-grid">
    <!-- Style 1: Soft Gradient Fill -->
    <div class="style-panel" class:selected={selectedStyle === "gradient-soft"}>
      <button class="select-btn" onclick={() => selectedStyle = "gradient-soft"}>
        {selectedStyle === "gradient-soft" ? "✓ Selected" : "Select"}
      </button>
      <h2>1. Soft Gradient Fill</h2>
      <div class="demo-container style-gradient-soft">
        {#each actions as action}
          <button class="action-btn" style="--action-color: {action.color}">
            <div class="icon-box">
              <i class="fas {action.icon}"></i>
            </div>
            <div class="text">
              <span class="name">{action.name}</span>
              <span class="desc">{action.shortDesc}</span>
            </div>
          </button>
        {/each}
      </div>
    </div>

    <!-- Style 2: Colored Left Accent -->
    <div class="style-panel" class:selected={selectedStyle === "left-accent"}>
      <button class="select-btn" onclick={() => selectedStyle = "left-accent"}>
        {selectedStyle === "left-accent" ? "✓ Selected" : "Select"}
      </button>
      <h2>2. Colored Left Accent</h2>
      <div class="demo-container style-left-accent">
        {#each actions as action}
          <button class="action-btn" style="--action-color: {action.color}">
            <div class="icon-box">
              <i class="fas {action.icon}"></i>
            </div>
            <div class="text">
              <span class="name">{action.name}</span>
              <span class="desc">{action.shortDesc}</span>
            </div>
          </button>
        {/each}
      </div>
    </div>

    <!-- Style 3: Glassmorphism -->
    <div class="style-panel" class:selected={selectedStyle === "glass"}>
      <button class="select-btn" onclick={() => selectedStyle = "glass"}>
        {selectedStyle === "glass" ? "✓ Selected" : "Select"}
      </button>
      <h2>3. Glassmorphism</h2>
      <div class="demo-container style-glass">
        {#each actions as action}
          <button class="action-btn" style="--action-color: {action.color}">
            <div class="icon-box">
              <i class="fas {action.icon}"></i>
            </div>
            <div class="text">
              <span class="name">{action.name}</span>
              <span class="desc">{action.shortDesc}</span>
            </div>
          </button>
        {/each}
      </div>
    </div>

    <!-- Style 4: Full Color Cards -->
    <div class="style-panel" class:selected={selectedStyle === "full-color"}>
      <button class="select-btn" onclick={() => selectedStyle = "full-color"}>
        {selectedStyle === "full-color" ? "✓ Selected" : "Select"}
      </button>
      <h2>4. Full Color Cards</h2>
      <div class="demo-container style-full-color">
        {#each actions as action}
          <button class="action-btn" style="--action-color: {action.color}">
            <div class="icon-box">
              <i class="fas {action.icon}"></i>
            </div>
            <div class="text">
              <span class="name">{action.name}</span>
              <span class="desc">{action.shortDesc}</span>
            </div>
          </button>
        {/each}
      </div>
    </div>

    <!-- Style 5: Outlined Pills -->
    <div class="style-panel" class:selected={selectedStyle === "outlined"}>
      <button class="select-btn" onclick={() => selectedStyle = "outlined"}>
        {selectedStyle === "outlined" ? "✓ Selected" : "Select"}
      </button>
      <h2>5. Outlined Pills</h2>
      <div class="demo-container style-outlined">
        {#each actions as action}
          <button class="action-btn" style="--action-color: {action.color}">
            <div class="icon-box">
              <i class="fas {action.icon}"></i>
            </div>
            <div class="text">
              <span class="name">{action.name}</span>
              <span class="desc">{action.shortDesc}</span>
            </div>
          </button>
        {/each}
      </div>
    </div>

    <!-- Style 6: Compact Chips -->
    <div class="style-panel" class:selected={selectedStyle === "chips"}>
      <button class="select-btn" onclick={() => selectedStyle = "chips"}>
        {selectedStyle === "chips" ? "✓ Selected" : "Select"}
      </button>
      <h2>6. Compact Chips</h2>
      <div class="demo-container style-chips">
        {#each actions as action}
          <button class="action-btn" style="--action-color: {action.color}">
            <i class="fas {action.icon}"></i>
            <span class="name">{action.name}</span>
          </button>
        {/each}
      </div>
    </div>

    <!-- Style 7: Neumorphic -->
    <div class="style-panel" class:selected={selectedStyle === "neumorphic"}>
      <button class="select-btn" onclick={() => selectedStyle = "neumorphic"}>
        {selectedStyle === "neumorphic" ? "✓ Selected" : "Select"}
      </button>
      <h2>7. Neumorphic Soft</h2>
      <div class="demo-container style-neumorphic">
        {#each actions as action}
          <button class="action-btn" style="--action-color: {action.color}">
            <div class="icon-box">
              <i class="fas {action.icon}"></i>
            </div>
            <div class="text">
              <span class="name">{action.name}</span>
              <span class="desc">{action.shortDesc}</span>
            </div>
          </button>
        {/each}
      </div>
    </div>

    <!-- Style 8: Gradient Border -->
    <div class="style-panel" class:selected={selectedStyle === "gradient-border"}>
      <button class="select-btn" onclick={() => selectedStyle = "gradient-border"}>
        {selectedStyle === "gradient-border" ? "✓ Selected" : "Select"}
      </button>
      <h2>8. Gradient Border</h2>
      <div class="demo-container style-gradient-border">
        {#each actions as action}
          <button class="action-btn" style="--action-color: {action.color}">
            <div class="inner">
              <div class="icon-box">
                <i class="fas {action.icon}"></i>
              </div>
              <div class="text">
                <span class="name">{action.name}</span>
                <span class="desc">{action.shortDesc}</span>
              </div>
            </div>
          </button>
        {/each}
      </div>
    </div>
  </div>

  {#if selectedStyle}
    <div class="selection-banner">
      Selected: <strong>{selectedStyle}</strong>
    </div>
  {/if}
</div>

<style>
  .test-page {
    min-height: 100vh;
    padding: 40px;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    color: white;
  }

  h1 {
    text-align: center;
    margin: 0 0 8px;
    font-size: 2rem;
  }

  .subtitle {
    text-align: center;
    color: rgba(255,255,255,0.6);
    margin: 0 0 40px;
  }

  .styles-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 24px;
    max-width: 1400px;
    margin: 0 auto;
  }

  .style-panel {
    position: relative;
    background: rgba(255,255,255,0.03);
    border: 2px solid rgba(255,255,255,0.1);
    border-radius: 16px;
    padding: 20px;
    transition: all 0.2s ease;
  }

  .style-panel:hover {
    border-color: rgba(255,255,255,0.2);
  }

  .style-panel.selected {
    border-color: #10b981;
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
  }

  .select-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    padding: 6px 12px;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 20px;
    color: white;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .style-panel.selected .select-btn {
    background: #10b981;
    border-color: #10b981;
  }

  .style-panel h2 {
    margin: 0 0 16px;
    font-size: 1rem;
    font-weight: 600;
    color: rgba(255,255,255,0.9);
  }

  .demo-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  /* ========== Style 1: Soft Gradient Fill ========== */
  .style-gradient-soft .action-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    background: linear-gradient(135deg,
      color-mix(in srgb, var(--action-color) 15%, transparent) 0%,
      color-mix(in srgb, var(--action-color) 8%, transparent) 100%
    );
    border: 1px solid color-mix(in srgb, var(--action-color) 25%, transparent);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .style-gradient-soft .action-btn:hover {
    background: linear-gradient(135deg,
      color-mix(in srgb, var(--action-color) 25%, transparent) 0%,
      color-mix(in srgb, var(--action-color) 15%, transparent) 100%
    );
    transform: translateY(-1px);
  }

  .style-gradient-soft .icon-box {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--action-color);
    border-radius: 10px;
    color: white;
    font-size: 14px;
  }

  .style-gradient-soft .text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .style-gradient-soft .name {
    font-weight: 600;
    font-size: 0.9rem;
    color: white;
  }

  .style-gradient-soft .desc {
    font-size: 0.75rem;
    color: rgba(255,255,255,0.6);
  }

  /* ========== Style 2: Colored Left Accent ========== */
  .style-left-accent .action-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    background: rgba(255,255,255,0.04);
    border: none;
    border-left: 4px solid var(--action-color);
    border-radius: 0 12px 12px 0;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .style-left-accent .action-btn:hover {
    background: rgba(255,255,255,0.08);
  }

  .style-left-accent .icon-box {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--action-color) 20%, transparent);
    border-radius: 10px;
    color: var(--action-color);
    font-size: 14px;
  }

  .style-left-accent .text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .style-left-accent .name {
    font-weight: 600;
    font-size: 0.9rem;
    color: white;
  }

  .style-left-accent .desc {
    font-size: 0.75rem;
    color: rgba(255,255,255,0.6);
  }

  /* ========== Style 3: Glassmorphism ========== */
  .style-glass .action-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    background: rgba(255,255,255,0.08);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .style-glass .action-btn:hover {
    background: rgba(255,255,255,0.12);
    border-color: var(--action-color);
  }

  .style-glass .icon-box {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--action-color) 30%, transparent);
    border-radius: 10px;
    color: white;
    font-size: 14px;
  }

  .style-glass .text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .style-glass .name {
    font-weight: 600;
    font-size: 0.9rem;
    color: white;
  }

  .style-glass .desc {
    font-size: 0.75rem;
    color: rgba(255,255,255,0.6);
  }

  /* ========== Style 4: Full Color Cards ========== */
  .style-full-color .action-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    background: linear-gradient(135deg, var(--action-color) 0%, color-mix(in srgb, var(--action-color) 70%, black) 100%);
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .style-full-color .action-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px color-mix(in srgb, var(--action-color) 40%, transparent);
  }

  .style-full-color .icon-box {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255,255,255,0.2);
    border-radius: 10px;
    color: white;
    font-size: 14px;
  }

  .style-full-color .text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .style-full-color .name {
    font-weight: 600;
    font-size: 0.9rem;
    color: white;
  }

  .style-full-color .desc {
    font-size: 0.75rem;
    color: rgba(255,255,255,0.8);
  }

  /* ========== Style 5: Outlined Pills ========== */
  .style-outlined .action-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    background: transparent;
    border: 2px solid var(--action-color);
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .style-outlined .action-btn:hover {
    background: color-mix(in srgb, var(--action-color) 15%, transparent);
  }

  .style-outlined .icon-box {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--action-color);
    font-size: 14px;
  }

  .style-outlined .text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .style-outlined .name {
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--action-color);
  }

  .style-outlined .desc {
    font-size: 0.75rem;
    color: rgba(255,255,255,0.5);
  }

  /* ========== Style 6: Compact Chips ========== */
  .style-chips {
    flex-direction: row !important;
    flex-wrap: wrap;
    gap: 8px !important;
  }

  .style-chips .action-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: color-mix(in srgb, var(--action-color) 20%, transparent);
    border: 1px solid color-mix(in srgb, var(--action-color) 40%, transparent);
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.15s ease;
    color: var(--action-color);
    font-size: 13px;
  }

  .style-chips .action-btn:hover {
    background: color-mix(in srgb, var(--action-color) 30%, transparent);
  }

  .style-chips .name {
    font-weight: 600;
    color: white;
  }

  /* ========== Style 7: Neumorphic ========== */
  .style-neumorphic {
    background: #1e2235;
    padding: 16px;
    border-radius: 16px;
  }

  .style-neumorphic .action-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    background: #1e2235;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    box-shadow:
      6px 6px 12px rgba(0,0,0,0.3),
      -6px -6px 12px rgba(255,255,255,0.05);
    transition: all 0.15s ease;
  }

  .style-neumorphic .action-btn:hover {
    box-shadow:
      4px 4px 8px rgba(0,0,0,0.4),
      -4px -4px 8px rgba(255,255,255,0.06);
  }

  .style-neumorphic .icon-box {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--action-color) 15%, transparent);
    border-radius: 10px;
    color: var(--action-color);
    font-size: 14px;
  }

  .style-neumorphic .text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .style-neumorphic .name {
    font-weight: 600;
    font-size: 0.9rem;
    color: white;
  }

  .style-neumorphic .desc {
    font-size: 0.75rem;
    color: rgba(255,255,255,0.5);
  }

  /* ========== Style 8: Gradient Border ========== */
  .style-gradient-border .action-btn {
    position: relative;
    padding: 2px;
    background: linear-gradient(135deg, var(--action-color), color-mix(in srgb, var(--action-color) 50%, white));
    border: none;
    border-radius: 14px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .style-gradient-border .action-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px color-mix(in srgb, var(--action-color) 30%, transparent);
  }

  .style-gradient-border .inner {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    background: #1a1a2e;
    border-radius: 12px;
  }

  .style-gradient-border .icon-box {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--action-color);
    font-size: 16px;
  }

  .style-gradient-border .text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .style-gradient-border .name {
    font-weight: 600;
    font-size: 0.9rem;
    color: white;
  }

  .style-gradient-border .desc {
    font-size: 0.75rem;
    color: rgba(255,255,255,0.6);
  }

  /* Selection Banner */
  .selection-banner {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 24px;
    background: #10b981;
    border-radius: 50px;
    font-size: 0.9rem;
    color: white;
    box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
  }

  @media (max-width: 768px) {
    .test-page {
      padding: 20px;
    }

    .styles-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
