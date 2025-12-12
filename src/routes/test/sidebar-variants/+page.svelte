<script lang="ts">
  // Mock data for the sidebar variants
  const module = {
    id: "discover",
    label: "Discover",
    icon: '<i class="fas fa-compass"></i>',
    color: "#a855f7",
  };

  const sections = [
    { id: "gallery", label: "Gallery", icon: '<i class="fas fa-layer-group"></i>', color: "#a855f7" },
    { id: "collections", label: "Collections", icon: '<i class="fas fa-folder"></i>', color: "#d946ef" },
    { id: "creators", label: "Creators", icon: '<i class="fas fa-users"></i>', color: "#06b6d4" },
  ];

  let activeSection = $state("gallery");

  // Theme color picker
  let themeColor = $state("#a855f7");
  const themePresets = [
    { label: "Purple", value: "#a855f7" },
    { label: "Pink", value: "#ec4899" },
    { label: "Blue", value: "#3b82f6" },
    { label: "Teal", value: "#14b8a6" },
    { label: "Orange", value: "#f97316" },
    { label: "Red", value: "#ef4444" },
  ];
</script>

<div class="test-page">
  <header class="page-header">
    <h1>Sidebar Design Variants</h1>
    <p>Compare different approaches to reduce visual noise</p>

    <div class="theme-picker">
      <span>Test with color:</span>
      {#each themePresets as preset}
        <button
          class="color-btn"
          class:active={themeColor === preset.value}
          style="--color: {preset.value}"
          onclick={() => themeColor = preset.value}
        >
          {preset.label}
        </button>
      {/each}
    </div>
  </header>

  <div class="variants-grid">
    <!-- OPTION A: Flattened (VS Code style) -->
    <div class="variant-card">
      <h2>Option A: Flattened</h2>
      <p class="description">VS Code style - just indicator bar, no cards</p>

      <div class="sidebar-mock" style="--module-color: {themeColor}">
        <button class="variant-a-module">
          <span class="indicator-bar"></span>
          <span class="icon">{@html module.icon}</span>
          <span class="label">{module.label}</span>
          <i class="fas fa-chevron-down chevron"></i>
        </button>

        <div class="variant-a-sections">
          {#each sections as section}
            <button
              class="variant-a-section"
              class:active={activeSection === section.id}
              onclick={() => activeSection = section.id}
              style="--section-color: {section.color}"
            >
              <span class="icon">{@html section.icon}</span>
              <span class="label">{section.label}</span>
            </button>
          {/each}
        </div>
      </div>
    </div>

    <!-- OPTION B: Simplified tabs -->
    <div class="variant-card">
      <h2>Option B: Simplified Tabs</h2>
      <p class="description">Keep module card, remove inner tab cards</p>

      <div class="sidebar-mock" style="--module-color: {themeColor}">
        <div class="variant-b-container">
          <button class="variant-b-module">
            <span class="indicator-bar"></span>
            <span class="icon">{@html module.icon}</span>
            <span class="label">{module.label}</span>
            <i class="fas fa-chevron-down chevron"></i>
          </button>

          <div class="variant-b-sections">
            {#each sections as section}
              <button
                class="variant-b-section"
                class:active={activeSection === section.id}
                onclick={() => activeSection = section.id}
                style="--section-color: {section.color}"
              >
                <span class="icon">{@html section.icon}</span>
                <span class="label">{section.label}</span>
              </button>
            {/each}
          </div>
        </div>
      </div>
    </div>

    <!-- OPTION C: No nesting visual -->
    <div class="variant-card">
      <h2>Option C: Header Style</h2>
      <p class="description">Module as header, no dropdown look, no outer card</p>

      <div class="sidebar-mock" style="--module-color: {themeColor}">
        <div class="variant-c-module">
          <span class="icon">{@html module.icon}</span>
          <span class="label">{module.label}</span>
        </div>

        <div class="variant-c-sections">
          {#each sections as section}
            <button
              class="variant-c-section"
              class:active={activeSection === section.id}
              onclick={() => activeSection = section.id}
              style="--section-color: {section.color}"
            >
              <span class="active-indicator"></span>
              <span class="icon">{@html section.icon}</span>
              <span class="label">{section.label}</span>
            </button>
          {/each}
        </div>
      </div>
    </div>

    <!-- OPTION D: Monochrome approach -->
    <div class="variant-card">
      <h2>Option D: Monochrome</h2>
      <p class="description">Neutral cards, only icons carry color</p>

      <div class="sidebar-mock" style="--module-color: {themeColor}">
        <div class="variant-d-container">
          <button class="variant-d-module">
            <span class="icon">{@html module.icon}</span>
            <span class="label">{module.label}</span>
            <i class="fas fa-chevron-down chevron"></i>
          </button>

          <div class="variant-d-sections">
            {#each sections as section}
              <button
                class="variant-d-section"
                class:active={activeSection === section.id}
                onclick={() => activeSection = section.id}
                style="--section-color: {section.color}"
              >
                <span class="icon">{@html section.icon}</span>
                <span class="label">{section.label}</span>
              </button>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .test-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
    padding: 40px;
    color: white;
  }

  .page-header {
    text-align: center;
    margin-bottom: 40px;
  }

  .page-header h1 {
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 8px;
  }

  .page-header p {
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 20px;
  }

  .theme-picker {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .theme-picker span {
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
  }

  .color-btn {
    padding: 14px 20px;
    min-height: 52px;
    border-radius: 10px;
    border: 2px solid transparent;
    background: color-mix(in srgb, var(--color) 20%, transparent);
    color: var(--color);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .color-btn:hover {
    background: color-mix(in srgb, var(--color) 30%, transparent);
  }

  .color-btn.active {
    border-color: var(--color);
    background: color-mix(in srgb, var(--color) 25%, transparent);
  }

  .variants-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
    max-width: 1400px;
    margin: 0 auto;
  }

  .variant-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 24px;
  }

  .variant-card h2 {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 6px;
  }

  .variant-card .description {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 20px;
  }

  .sidebar-mock {
    background: rgba(12, 12, 20, 0.8);
    border-radius: 12px;
    padding: 12px;
    min-height: 280px;
  }

  /* ============================================================================
     OPTION A: Flattened (VS Code style)
     ============================================================================ */
  .variant-a-module {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 12px;
    min-height: 52px;
    background: transparent;
    border: none;
    border-radius: 10px;
    color: white;
    cursor: pointer;
    position: relative;
    transition: background 0.2s ease;
  }

  .variant-a-module:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .variant-a-module .indicator-bar {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 28px;
    background: var(--module-color);
    border-radius: 0 2px 2px 0;
  }

  .variant-a-module .icon {
    font-size: 18px;
    color: var(--module-color);
  }

  .variant-a-module .icon :global(i) {
    color: var(--module-color);
  }

  .variant-a-module .label {
    flex: 1;
    text-align: left;
    font-size: 15px;
    font-weight: 600;
  }

  .variant-a-module .chevron {
    font-size: 12px;
    opacity: 0.5;
  }

  .variant-a-sections {
    margin-top: 4px;
    padding-left: 8px;
  }

  .variant-a-section {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 12px;
    min-height: 52px;
    background: transparent;
    border: none;
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .variant-a-section:hover {
    background: rgba(255, 255, 255, 0.05);
    color: white;
  }

  .variant-a-section.active {
    background: rgba(255, 255, 255, 0.08);
    color: white;
  }

  .variant-a-section .icon {
    font-size: 16px;
    width: 24px;
    text-align: center;
  }

  .variant-a-section .icon :global(i) {
    color: var(--section-color);
  }

  .variant-a-section .label {
    font-size: 14px;
  }

  /* ============================================================================
     OPTION B: Simplified tabs (module card, no inner cards)
     ============================================================================ */
  .variant-b-container {
    background: color-mix(in srgb, var(--module-color) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--module-color) 20%, transparent);
    border-radius: 12px;
    padding: 8px;
  }

  .variant-b-module {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 12px;
    min-height: 52px;
    background: transparent;
    border: none;
    border-radius: 10px;
    color: white;
    cursor: pointer;
    position: relative;
    transition: background 0.2s ease;
  }

  .variant-b-module:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .variant-b-module .indicator-bar {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 28px;
    background: var(--module-color);
    border-radius: 0 2px 2px 0;
  }

  .variant-b-module .icon {
    font-size: 18px;
  }

  .variant-b-module .icon :global(i) {
    color: var(--module-color);
  }

  .variant-b-module .label {
    flex: 1;
    text-align: left;
    font-size: 15px;
    font-weight: 600;
  }

  .variant-b-module .chevron {
    font-size: 12px;
    opacity: 0.5;
  }

  .variant-b-sections {
    margin-top: 4px;
  }

  .variant-b-section {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 12px;
    min-height: 52px;
    background: transparent;
    border: none;
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    transition: all 0.2s ease;
    border-left: 3px solid transparent;
  }

  .variant-b-section:hover {
    background: rgba(255, 255, 255, 0.05);
    color: white;
  }

  .variant-b-section.active {
    color: white;
    border-left-color: var(--section-color);
    background: rgba(255, 255, 255, 0.03);
  }

  .variant-b-section .icon {
    font-size: 16px;
    width: 24px;
    text-align: center;
  }

  .variant-b-section .icon :global(i) {
    color: var(--section-color);
  }

  .variant-b-section .label {
    font-size: 14px;
  }

  /* ============================================================================
     OPTION C: Header style (no dropdown, no outer card)
     ============================================================================ */
  .variant-c-module {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 12px 8px;
    color: rgba(255, 255, 255, 0.5);
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .variant-c-module .icon {
    font-size: 12px;
  }

  .variant-c-module .icon :global(i) {
    color: var(--module-color);
  }

  .variant-c-sections {
    margin-top: 4px;
  }

  .variant-c-section {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 12px;
    min-height: 52px;
    background: transparent;
    border: none;
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
  }

  .variant-c-section:hover {
    background: rgba(255, 255, 255, 0.05);
    color: white;
  }

  .variant-c-section.active {
    background: rgba(255, 255, 255, 0.08);
    color: white;
  }

  .variant-c-section .active-indicator {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 28px;
    background: var(--section-color);
    border-radius: 0 2px 2px 0;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .variant-c-section.active .active-indicator {
    opacity: 1;
  }

  .variant-c-section .icon {
    font-size: 16px;
    width: 24px;
    text-align: center;
  }

  .variant-c-section .icon :global(i) {
    color: var(--section-color);
  }

  .variant-c-section .label {
    font-size: 14px;
    font-weight: 500;
  }

  /* ============================================================================
     OPTION D: Monochrome (neutral cards, colored icons only)
     ============================================================================ */
  .variant-d-container {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 8px;
  }

  .variant-d-module {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 12px;
    min-height: 52px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 10px;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .variant-d-module:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .variant-d-module .icon {
    font-size: 18px;
  }

  .variant-d-module .icon :global(i) {
    color: var(--module-color);
  }

  .variant-d-module .label {
    flex: 1;
    text-align: left;
    font-size: 15px;
    font-weight: 600;
  }

  .variant-d-module .chevron {
    font-size: 12px;
    opacity: 0.5;
  }

  .variant-d-sections {
    margin-top: 6px;
  }

  .variant-d-section {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 12px;
    min-height: 52px;
    background: transparent;
    border: none;
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .variant-d-section:hover {
    background: rgba(255, 255, 255, 0.04);
    color: white;
  }

  .variant-d-section.active {
    background: rgba(255, 255, 255, 0.06);
    color: white;
  }

  .variant-d-section .icon {
    font-size: 16px;
    width: 24px;
    text-align: center;
  }

  .variant-d-section .icon :global(i) {
    color: var(--section-color);
  }

  .variant-d-section .label {
    font-size: 14px;
  }
</style>
