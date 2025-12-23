<!-- Style Test Page - Compare different 2026 styling approaches -->
<script lang="ts">
  let selectedFilter = $state<string>("all");

  const approaches = [
    {
      name: "Subtle Gradients",
      description: "Solid backgrounds with gentle color shifts for depth",
    },
    {
      name: "Bold Borders",
      description: "Vibrant borders with strong accent colors",
    },
    {
      name: "Rich Colors",
      description: "Saturated, vibrant backgrounds with deep hues",
    },
    {
      name: "Dramatic Shadows",
      description: "Solid bases with layered shadow depth",
    },
    {
      name: "Mixed Approach",
      description: "Best of all worlds - gradients + borders + shadows",
    },
  ];

  const statuses = [
    {
      label: "All",
      color: "var(--theme-accent, #3b82f6)",
      icon: "fa-list",
      count: 24,
    },
    {
      label: "New",
      color: "var(--theme-accent, #3b82f6)",
      icon: "fa-inbox",
      count: 8,
    },
    { label: "In Progress", color: "#f59e0b", icon: "fa-spinner", count: 6 },
    {
      label: "In Review",
      color: "var(--theme-accent-strong, #8b5cf6)",
      icon: "fa-eye",
      count: 5,
    },
    { label: "Completed", color: "#10b981", icon: "fa-check-circle", count: 5 },
  ];
</script>

<div class="test-page">
  <header class="page-header">
    <h1>2026 Styling Test Lab</h1>
    <p>Pick your favorite approach for the opaque design system</p>
  </header>

  <div class="approaches-grid">
    {#each approaches as approach, index}
      <section class="approach-section approach-{index + 1}">
        <div class="approach-header">
          <h2>{approach.name}</h2>
          <p>{approach.description}</p>
        </div>

        <!-- Filter chips example -->
        <div class="chips-example">
          <h3>Filter Chips</h3>
          <div class="filter-bar">
            {#each statuses as status}
              <button
                class="filter-chip"
                class:active={selectedFilter === status.label.toLowerCase()}
                style="--status-color: {status.color}"
              >
                <i class="fas {status.icon}"></i>
                <span>{status.label}</span>
                <span class="count">{status.count}</span>
              </button>
            {/each}
          </div>
        </div>

        <!-- Card example -->
        <div class="card-example">
          <h3>Feedback Card</h3>
          <div class="feedback-card">
            <div class="card-type" style="--type-color: #ef4444">
              <i class="fas fa-bug"></i>
            </div>
            <div class="card-content">
              <div class="card-header">
                <h4 class="card-title">Animation playback stuttering</h4>
                <span class="status-badge" style="--badge-color: #f59e0b">
                  <i class="fas fa-spinner"></i>
                  In Progress
                </span>
              </div>
              <p class="card-description">
                When playing sequences with more than 20 beats, there's
                noticeable lag...
              </p>
            </div>
          </div>
        </div>
      </section>
    {/each}
  </div>
</div>

<style>
  .test-page {
    min-height: 100vh;
    background: #0a0a0f;
    color: white;
    padding: 32px;
    overflow-y: auto;
  }

  .page-header {
    text-align: center;
    margin-bottom: 48px;
  }

  .page-header h1 {
    font-size: 2.5rem;
    font-weight: 700;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 8px;
  }

  .page-header p {
    color: rgba(255, 255, 255, 0.6);
    font-size: 1.125rem;
  }

  .approaches-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 32px;
    max-width: 1800px;
    margin: 0 auto;
  }

  .approach-section {
    background: rgba(20, 20, 25, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .approach-header h2 {
    margin: 0 0 8px 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }

  .approach-header p {
    margin: 0;
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.875rem;
  }

  .chips-example h3,
  .card-example h3 {
    margin: 0 0 12px 0;
    font-size: 0.75rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.4);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .filter-bar {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  /* ============================================================================
     APPROACH 1: SUBTLE GRADIENTS
     ============================================================================ */
  .approach-1 .filter-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: linear-gradient(
      135deg,
      rgba(30, 30, 40, 0.95) 0%,
      rgba(40, 40, 50, 0.95) 100%
    );
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 20px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.8125rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .approach-1 .filter-chip:hover {
    background: linear-gradient(
      135deg,
      rgba(40, 40, 50, 0.98) 0%,
      rgba(50, 50, 60, 0.98) 100%
    );
    border-color: rgba(255, 255, 255, 0.25);
  }

  .approach-1 .filter-chip.active {
    background: linear-gradient(
      135deg,
      var(--status-color) 0%,
      color-mix(in srgb, var(--status-color) 80%, black) 100%
    );
    border-color: var(--status-color);
    color: white;
  }

  .approach-1 .feedback-card {
    position: relative;
    display: flex;
    gap: 12px;
    padding: 14px;
    background: linear-gradient(
      135deg,
      rgba(25, 25, 35, 0.95) 0%,
      rgba(30, 30, 40, 0.95) 100%
    );
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .approach-1 .feedback-card:hover {
    background: linear-gradient(
      135deg,
      rgba(30, 30, 40, 0.98) 0%,
      rgba(35, 35, 45, 0.98) 100%
    );
  }

  .approach-1 .card-type {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--type-color) 30%, rgba(20, 20, 25, 0.9)),
      color-mix(in srgb, var(--type-color) 20%, rgba(15, 15, 20, 0.9))
    );
  }

  .approach-1 .status-badge {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--badge-color) 35%, rgba(20, 20, 25, 0.9)),
      color-mix(in srgb, var(--badge-color) 25%, rgba(15, 15, 20, 0.9))
    );
  }

  /* ============================================================================
     APPROACH 2: BOLD BORDERS
     ============================================================================ */
  .approach-2 .filter-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: rgba(25, 25, 30, 0.95);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.8125rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .approach-2 .filter-chip:hover {
    border-color: rgba(255, 255, 255, 0.4);
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1);
  }

  .approach-2 .filter-chip.active {
    background: rgba(20, 20, 25, 0.98);
    border: 2px solid var(--status-color);
    color: var(--status-color);
    box-shadow: 0 0 16px
      color-mix(in srgb, var(--status-color) 30%, transparent);
  }

  .approach-2 .feedback-card {
    position: relative;
    display: flex;
    gap: 12px;
    padding: 14px;
    background: rgba(25, 25, 30, 0.95);
    border: 2px solid rgba(255, 255, 255, 0.15);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .approach-2 .feedback-card:hover {
    border-color: rgba(255, 255, 255, 0.3);
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1);
  }

  .approach-2 .card-type {
    background: rgba(20, 20, 25, 0.95);
    border: 2px solid var(--type-color);
  }

  .approach-2 .status-badge {
    background: rgba(20, 20, 25, 0.95);
    border: 2px solid var(--badge-color);
    padding: 2px 8px;
  }

  /* ============================================================================
     APPROACH 3: RICH COLORS
     ============================================================================ */
  .approach-3 .filter-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: rgba(30, 35, 50, 0.95);
    border: 1px solid
      color-mix(in srgb, var(--theme-accent, #6366f1) 20%, transparent);
    border-radius: 20px;
    color: rgba(200, 210, 255, 0.9);
    font-size: 0.8125rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .approach-3 .filter-chip:hover {
    background: rgba(40, 45, 65, 0.98);
    border-color: color-mix(
      in srgb,
      var(--theme-accent, #6366f1) 40%,
      transparent
    );
  }

  .approach-3 .filter-chip.active {
    background: color-mix(in srgb, var(--status-color) 85%, black);
    border-color: var(--status-color);
    color: white;
  }

  .approach-3 .feedback-card {
    position: relative;
    display: flex;
    gap: 12px;
    padding: 14px;
    background: rgba(25, 30, 45, 0.95);
    border: 1px solid
      color-mix(in srgb, var(--theme-accent, #6366f1) 25%, transparent);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .approach-3 .feedback-card:hover {
    background: rgba(30, 35, 55, 0.98);
    border-color: color-mix(
      in srgb,
      var(--theme-accent, #6366f1) 40%,
      transparent
    );
  }

  .approach-3 .card-type {
    background: color-mix(
      in srgb,
      var(--type-color) 40%,
      rgba(15, 20, 30, 0.95)
    );
  }

  .approach-3 .status-badge {
    background: color-mix(
      in srgb,
      var(--badge-color) 50%,
      rgba(15, 20, 30, 0.95)
    );
  }

  /* ============================================================================
     APPROACH 4: DRAMATIC SHADOWS
     ============================================================================ */
  .approach-4 .filter-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: rgba(30, 30, 35, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.8125rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.4),
      0 2px 6px rgba(0, 0, 0, 0.3);
  }

  .approach-4 .filter-chip:hover {
    box-shadow:
      0 6px 16px rgba(0, 0, 0, 0.5),
      0 3px 8px rgba(0, 0, 0, 0.4);
    transform: translateY(-1px);
  }

  .approach-4 .filter-chip.active {
    background: var(--status-color);
    color: white;
    box-shadow:
      0 8px 24px color-mix(in srgb, var(--status-color) 40%, black),
      0 4px 12px color-mix(in srgb, var(--status-color) 30%, black),
      0 0 0 1px var(--status-color);
    transform: translateY(-2px);
  }

  .approach-4 .feedback-card {
    position: relative;
    display: flex;
    gap: 12px;
    padding: 14px;
    background: rgba(25, 25, 30, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow:
      0 8px 24px rgba(0, 0, 0, 0.5),
      0 4px 12px rgba(0, 0, 0, 0.4);
  }

  .approach-4 .feedback-card:hover {
    box-shadow:
      0 12px 32px rgba(0, 0, 0, 0.6),
      0 6px 16px rgba(0, 0, 0, 0.5);
    transform: translateY(-2px);
  }

  .approach-4 .card-type {
    background: color-mix(
      in srgb,
      var(--type-color) 25%,
      rgba(20, 20, 25, 0.9)
    );
    box-shadow:
      0 4px 12px color-mix(in srgb, var(--type-color) 30%, black),
      0 2px 6px rgba(0, 0, 0, 0.3);
  }

  .approach-4 .status-badge {
    background: color-mix(
      in srgb,
      var(--badge-color) 30%,
      rgba(20, 20, 25, 0.9)
    );
    box-shadow: 0 2px 8px color-mix(in srgb, var(--badge-color) 20%, black);
  }

  /* ============================================================================
     APPROACH 5: MIXED (Gradients + Borders + Shadows)
     ============================================================================ */
  .approach-5 .filter-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: linear-gradient(
      135deg,
      rgba(30, 30, 40, 0.95) 0%,
      rgba(35, 35, 45, 0.95) 100%
    );
    border: 1.5px solid rgba(255, 255, 255, 0.15);
    border-radius: 20px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.8125rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .approach-5 .filter-chip:hover {
    background: linear-gradient(
      135deg,
      rgba(40, 40, 50, 0.98) 0%,
      rgba(45, 45, 55, 0.98) 100%
    );
    border-color: rgba(255, 255, 255, 0.3);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    transform: translateY(-1px);
  }

  .approach-5 .filter-chip.active {
    background: linear-gradient(
      135deg,
      var(--status-color) 0%,
      color-mix(in srgb, var(--status-color) 80%, black) 100%
    );
    border: 1.5px solid color-mix(in srgb, var(--status-color) 120%, white);
    color: white;
    box-shadow:
      0 6px 16px color-mix(in srgb, var(--status-color) 40%, black),
      0 0 0 1px color-mix(in srgb, var(--status-color) 50%, transparent);
    transform: translateY(-2px);
  }

  .approach-5 .feedback-card {
    position: relative;
    display: flex;
    gap: 12px;
    padding: 14px;
    background: linear-gradient(
      135deg,
      rgba(25, 25, 35, 0.95) 0%,
      rgba(30, 30, 40, 0.95) 100%
    );
    border: 1.5px solid rgba(255, 255, 255, 0.12);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  }

  .approach-5 .feedback-card:hover {
    background: linear-gradient(
      135deg,
      rgba(30, 30, 40, 0.98) 0%,
      rgba(35, 35, 45, 0.98) 100%
    );
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
    transform: translateY(-1px);
  }

  .approach-5 .card-type {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--type-color) 35%, rgba(20, 20, 25, 0.9)),
      color-mix(in srgb, var(--type-color) 20%, rgba(15, 15, 20, 0.9))
    );
    border: 1px solid color-mix(in srgb, var(--type-color) 40%, transparent);
    box-shadow: 0 2px 8px color-mix(in srgb, var(--type-color) 25%, black);
  }

  .approach-5 .status-badge {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--badge-color) 40%, rgba(20, 20, 25, 0.9)),
      color-mix(in srgb, var(--badge-color) 25%, rgba(15, 15, 20, 0.9))
    );
    border: 1px solid color-mix(in srgb, var(--badge-color) 30%, transparent);
    box-shadow: 0 2px 6px color-mix(in srgb, var(--badge-color) 20%, black);
  }

  /* ============================================================================
     SHARED CARD STYLES
     ============================================================================ */
  .card-type {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    border-radius: 8px;
    color: var(--type-color);
    font-size: 16px;
  }

  .card-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .card-header {
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }

  .card-title {
    flex: 1;
    margin: 0;
    font-size: 0.9375rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    line-height: 1.3;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    border-radius: 12px;
    font-size: 0.6875rem;
    font-weight: 500;
    color: var(--badge-color);
    white-space: nowrap;
  }

  .status-badge i {
    font-size: 0.625rem;
  }

  .card-description {
    margin: 0;
    font-size: 0.8125rem;
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.4;
  }

  .filter-chip i {
    font-size: 0.75rem;
  }

  .filter-chip .count {
    padding: 1px 6px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 10px;
    font-size: 0.6875rem;
    font-weight: 600;
  }
</style>
