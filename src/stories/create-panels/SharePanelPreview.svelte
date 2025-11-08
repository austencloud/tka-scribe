<script lang="ts">
  // Simple static preview without service dependencies for Storybook
  let selectedTypes = $state(["image"]);
  let imageOptionsExpanded = $state(false);

  // Image options state
  let imageOptions = $state({
    addWord: true,
    addBeatNumbers: false,
    addUserInfo: false,
    addDifficultyLevel: true,
    includeStartPosition: true,
    format: "PNG" as "PNG" | "JPEG" | "WebP",
    quality: 1.0,
  });

  type ContentType = "video" | "animation" | "image";

  const contentTypes: {
    type: ContentType;
    icon: string;
    label: string;
    description: string;
    color: string;
    disabled: boolean;
    comingSoon?: boolean;
  }[] = [
    {
      type: "video",
      icon: "fa-solid fa-video",
      label: "Video",
      description: "Recorded performance",
      color: "#ef4444",
      disabled: true,
      comingSoon: true,
    },
    {
      type: "animation",
      icon: "fa-solid fa-film",
      label: "Animation",
      description: "Animated GIF/WebP",
      color: "#8b5cf6",
      disabled: false,
    },
    {
      type: "image",
      icon: "fa-solid fa-image",
      label: "Image",
      description: "Static sequence image",
      color: "#3b82f6",
      disabled: false,
    },
  ];

  function toggleContentType(type: ContentType) {
    const disabled = contentTypes.find((ct) => ct.type === type)?.disabled;
    if (disabled) return;

    selectedTypes = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type];
  }
</script>

<div class="panel-preview">
  <div class="panel-header">
    <h2>Share Sequence</h2>
    <button class="close-btn" aria-label="Close share panel">
      <i class="fas fa-times"></i>
    </button>
  </div>

  <div class="panel-content">
    <section class="content-section">
      <div class="content-type-selector">
        <h3>Select Content Types</h3>
        <div class="type-grid">
          {#each contentTypes as contentType}
            <button
              class="type-button"
              class:selected={selectedTypes.includes(contentType.type)}
              class:disabled={contentType.disabled}
              onclick={() => toggleContentType(contentType.type)}
              style="--type-color: {contentType.color}"
            >
              <div class="type-icon">
                <i class={contentType.icon}></i>
              </div>
              <div class="type-info">
                <span class="type-label">{contentType.label}</span>
                <span class="type-description">{contentType.description}</span>
              </div>
              {#if contentType.comingSoon}
                <span class="coming-soon-badge">Soon</span>
              {/if}
              <div class="selection-indicator">
                <i class="fas fa-check"></i>
              </div>
            </button>
          {/each}
        </div>
      </div>
    </section>

    {#if selectedTypes.includes("image")}
      <section class="options-section">
        <button
          class="options-toggle"
          onclick={() => (imageOptionsExpanded = !imageOptionsExpanded)}
        >
          <span>Image Options</span>
          <i
            class="fas fa-chevron-{imageOptionsExpanded ? 'up' : 'down'}"
          ></i>
        </button>
        {#if imageOptionsExpanded}
          <div class="options-content">
            <!-- Toggle Options -->
            <div class="options-group">
              <h4>Include in Image</h4>
              <div class="toggle-options">
                <label class="toggle-option">
                  <input
                    type="checkbox"
                    bind:checked={imageOptions.addWord}
                  />
                  <span class="toggle-switch"></span>
                  <span class="toggle-label">Word Label</span>
                </label>

                <label class="toggle-option">
                  <input
                    type="checkbox"
                    bind:checked={imageOptions.addBeatNumbers}
                  />
                  <span class="toggle-switch"></span>
                  <span class="toggle-label">Beat Numbers</span>
                </label>

                <label class="toggle-option">
                  <input
                    type="checkbox"
                    bind:checked={imageOptions.addDifficultyLevel}
                  />
                  <span class="toggle-switch"></span>
                  <span class="toggle-label">Difficulty Level</span>
                </label>

                <label class="toggle-option">
                  <input
                    type="checkbox"
                    bind:checked={imageOptions.includeStartPosition}
                  />
                  <span class="toggle-switch"></span>
                  <span class="toggle-label">Start Position</span>
                </label>

                <label class="toggle-option">
                  <input
                    type="checkbox"
                    bind:checked={imageOptions.addUserInfo}
                  />
                  <span class="toggle-switch"></span>
                  <span class="toggle-label">User Info</span>
                </label>
              </div>
            </div>

            <!-- Format Selection -->
            <div class="options-group">
              <h4>Image Format</h4>
              <div class="format-buttons">
                <button
                  class="format-btn"
                  class:active={imageOptions.format === "PNG"}
                  onclick={() => (imageOptions.format = "PNG")}
                >
                  PNG
                </button>
                <button
                  class="format-btn"
                  class:active={imageOptions.format === "JPEG"}
                  onclick={() => (imageOptions.format = "JPEG")}
                >
                  JPEG
                </button>
                <button
                  class="format-btn"
                  class:active={imageOptions.format === "WebP"}
                  onclick={() => (imageOptions.format = "WebP")}
                >
                  WebP
                </button>
              </div>
            </div>

            <!-- Quality Slider (for JPEG/WebP) -->
            {#if imageOptions.format !== "PNG"}
              <div class="options-group">
                <h4>
                  Quality
                  <span class="quality-value">{Math.round(imageOptions.quality * 100)}%</span>
                </h4>
                <input
                  type="range"
                  min="0.5"
                  max="1"
                  step="0.05"
                  bind:value={imageOptions.quality}
                  class="quality-slider"
                />
              </div>
            {/if}
          </div>
        {/if}
      </section>
    {/if}

    <section class="actions-section">
      <div class="primary-actions">
        <button class="action-btn primary">
          <i class="fas fa-download"></i>
          <span>Download</span>
        </button>

        <button class="action-btn secondary">
          <i class="fas fa-share-nodes"></i>
          <span>Share via Device</span>
        </button>
      </div>

      <div class="divider">
        <span>Share to Social</span>
      </div>

      <div class="social-actions">
        <button class="action-btn social instagram">
          <i class="fab fa-instagram"></i>
          <span>Post to Instagram</span>
        </button>

        <button class="action-btn social facebook" disabled>
          <i class="fab fa-facebook"></i>
          <span>Post to Facebook</span>
          <span class="coming-soon-badge">Soon</span>
        </button>
      </div>
    </section>
  </div>
</div>

<style>
  .panel-preview {
    width: 100%;
    max-width: 640px;
    margin: 0 auto;
    padding: 28px;
    background: linear-gradient(
      135deg,
      rgba(20, 25, 35, 0.98) 0%,
      rgba(15, 20, 30, 0.96) 50%,
      rgba(12, 16, 25, 0.98) 100%
    );
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 20px;
    box-shadow:
      0 20px 60px rgba(0, 0, 0, 0.6),
      0 8px 24px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    position: relative;
    overflow: hidden;
  }

  .panel-preview::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.2) 50%,
      transparent 100%
    );
    opacity: 0.6;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 28px;
    padding-bottom: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    position: relative;
  }

  .panel-header::after {
    content: "";
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(59, 130, 246, 0.3) 50%,
      transparent 100%
    );
    opacity: 0.5;
  }

  .panel-header h2 {
    margin: 0;
    font-size: 22px;
    font-weight: 700;
    background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.85) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.02em;
  }

  .close-btn {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(100, 100, 120, 0.85), rgba(70, 70, 90, 0.85));
    color: white;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.15);
  }

  .close-btn:hover {
    background: linear-gradient(135deg, rgba(120, 120, 140, 0.95), rgba(90, 90, 110, 0.95));
    transform: scale(1.08) rotate(90deg);
    box-shadow:
      0 4px 16px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  .close-btn:active {
    transform: scale(0.95) rotate(90deg);
  }

  .panel-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  /* Action button groups */
  .primary-actions,
  .social-actions {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
  }

  .divider {
    position: relative;
    text-align: center;
    margin: 12px 0;
  }

  .divider span {
    display: inline-block;
    padding: 0 18px;
    background: linear-gradient(
      135deg,
      rgba(20, 25, 35, 0.98) 0%,
      rgba(15, 20, 30, 0.96) 50%,
      rgba(12, 16, 25, 0.98) 100%
    );
    color: rgba(255, 255, 255, 0.45);
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    position: relative;
    z-index: 1;
  }

  .divider::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.15) 20%,
      rgba(255, 255, 255, 0.15) 80%,
      transparent 100%
    );
  }

  .action-btn {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 16px 28px;
    border: none;
    border-radius: 14px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    overflow: hidden;
    isolation: isolate;
  }

  .action-btn > * {
    position: relative;
    z-index: 2;
  }

  .action-btn::before {
    content: "";
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
    z-index: 0;
  }

  .action-btn::after {
    z-index: 1;
  }

  .action-btn:hover::before {
    opacity: 1;
  }

  .action-btn.primary {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    box-shadow:
      0 4px 16px rgba(59, 130, 246, 0.4),
      0 2px 8px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.25);
    position: relative;
  }

  .action-btn.primary::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 14px;
    background: radial-gradient(circle at top left, rgba(255, 255, 255, 0.2), transparent 50%);
    pointer-events: none;
  }

  .action-btn.primary::before {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  }

  .action-btn.primary:hover {
    transform: scale(1.03) translateY(-2px);
    box-shadow:
      0 8px 24px rgba(59, 130, 246, 0.5),
      0 4px 12px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }

  .action-btn.primary i {
    font-size: 18px;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
  }

  .action-btn.secondary {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.08));
    color: rgba(255, 255, 255, 0.95);
    border: 1.5px solid rgba(255, 255, 255, 0.25);
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
    position: relative;
  }

  .action-btn.secondary::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 14px;
    background: radial-gradient(circle at top right, rgba(255, 255, 255, 0.1), transparent 60%);
    pointer-events: none;
  }

  .action-btn.secondary::before {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.12));
  }

  .action-btn.secondary:hover {
    transform: scale(1.02) translateY(-1px);
    border-color: rgba(255, 255, 255, 0.35);
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  .action-btn.secondary i {
    font-size: 18px;
    opacity: 0.9;
  }

  .action-btn.social {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04));
    color: rgba(255, 255, 255, 0.95);
    border: 1.5px solid rgba(255, 255, 255, 0.18);
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .action-btn.social::before {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.06));
  }

  .action-btn.social:hover:not(:disabled) {
    transform: scale(1.02) translateY(-1px);
    border-color: rgba(255, 255, 255, 0.28);
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }

  /* Instagram button - colorful gradient */
  .action-btn.instagram {
    background: linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
    border: none;
    color: white;
    box-shadow:
      0 4px 16px rgba(188, 24, 136, 0.35),
      0 2px 8px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  .action-btn.instagram::before {
    background: linear-gradient(135deg, #e6683c 0%, #dc2743 25%, #cc2366 50%, #bc1888 75%, #8a0868 100%);
  }

  .action-btn.instagram:hover:not(:disabled) {
    transform: scale(1.03) translateY(-2px);
    box-shadow:
      0 8px 24px rgba(188, 24, 136, 0.5),
      0 4px 12px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }

  .action-btn.instagram i {
    font-size: 18px;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
  }

  /* Facebook button styling */
  .action-btn.facebook {
    position: relative;
  }

  .action-btn.facebook i {
    color: #1877f2;
    font-size: 18px;
  }

  .action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }

  .action-btn:disabled::before {
    display: none;
  }

  .coming-soon-badge {
    padding: 4px 10px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.12));
    border-radius: 6px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    border: 1px solid rgba(255, 255, 255, 0.25);
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  /* Content Type Selector */
  .content-type-selector h3 {
    margin: 0 0 18px 0;
    font-size: 15px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
    text-transform: uppercase;
    letter-spacing: 1.2px;
    font-size: 13px;
  }

  .type-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .type-button {
    position: relative;
    display: grid;
    grid-template-columns: auto 1fr auto auto;
    align-items: center;
    gap: 18px;
    padding: 18px 22px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03));
    border: 2px solid rgba(255, 255, 255, 0.12);
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .type-button:hover:not(.disabled) {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
    border-color: var(--type-color);
    transform: translateY(-3px);
    box-shadow:
      0 6px 20px rgba(0, 0, 0, 0.15),
      0 0 30px color-mix(in srgb, var(--type-color) 20%, transparent),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }

  .type-button.selected {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.06));
    border-color: var(--type-color);
    border-width: 2px;
    box-shadow:
      0 4px 16px rgba(0, 0, 0, 0.2),
      0 0 40px color-mix(in srgb, var(--type-color) 25%, transparent),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  .type-button.selected::before {
    content: "";
    position: absolute;
    inset: -2px;
    border-radius: 16px;
    padding: 2px;
    background: linear-gradient(135deg, var(--type-color), color-mix(in srgb, var(--type-color) 70%, transparent));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: exclude;
    opacity: 0.6;
    pointer-events: none;
  }

  .type-button.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .type-icon {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
    border-radius: 14px;
    font-size: 26px;
    color: var(--type-color);
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    transition: all 0.2s ease;
  }

  .type-button:hover:not(.disabled) .type-icon {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.12));
    transform: scale(1.05);
  }

  .type-button.selected .type-icon {
    background: var(--type-color);
    color: white;
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.2),
      0 0 20px var(--type-color);
  }

  .type-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    text-align: left;
  }

  .type-label {
    font-size: 16px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }

  .type-description {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
  }

  .selection-indicator {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--type-color);
    color: white;
    opacity: 0;
    transform: scale(0.8);
    transition: all 0.2s ease;
  }

  .type-button.selected .selection-indicator {
    opacity: 1;
    transform: scale(1);
  }

  /* Options Toggle */
  .options-toggle {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 22px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03));
    border: 1.5px solid rgba(255, 255, 255, 0.15);
    border-radius: 14px;
    color: rgba(255, 255, 255, 0.95);
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .options-toggle:hover {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
    border-color: rgba(255, 255, 255, 0.22);
    transform: translateY(-1px);
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }

  .options-toggle i {
    font-size: 14px;
    opacity: 0.7;
    transition: transform 0.3s ease;
  }

  .options-content {
    margin-top: 14px;
    padding: 20px 22px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.02));
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 14px;
    box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.1);
    animation: slideDown 0.3s ease-out;
  }

  /* Options Groups */
  .options-group {
    margin-bottom: 24px;
  }

  .options-group:last-child {
    margin-bottom: 0;
  }

  .options-group h4 {
    margin: 0 0 14px 0;
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
    text-transform: uppercase;
    letter-spacing: 1px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .quality-value {
    font-size: 12px;
    color: rgba(59, 130, 246, 0.9);
    font-weight: 700;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.08));
    padding: 4px 10px;
    border-radius: 6px;
    border: 1px solid rgba(59, 130, 246, 0.25);
  }

  /* Toggle Options */
  .toggle-options {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .toggle-option {
    display: flex;
    align-items: center;
    gap: 14px;
    cursor: pointer;
    padding: 12px 16px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01));
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    transition: all 0.2s ease;
  }

  .toggle-option:hover {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03));
    border-color: rgba(255, 255, 255, 0.12);
  }

  .toggle-option input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  /* iOS-style Toggle Switch */
  .toggle-switch {
    position: relative;
    width: 48px;
    height: 28px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    flex-shrink: 0;
  }

  .toggle-switch::before {
    content: "";
    position: absolute;
    top: 2px;
    left: 2px;
    width: 22px;
    height: 22px;
    background: white;
    border-radius: 50%;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow:
      0 2px 4px rgba(0, 0, 0, 0.2),
      0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .toggle-option input[type="checkbox"]:checked + .toggle-switch {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    border-color: #3b82f6;
    box-shadow: 0 0 12px rgba(59, 130, 246, 0.4);
  }

  .toggle-option input[type="checkbox"]:checked + .toggle-switch::before {
    transform: translateX(20px);
  }

  .toggle-label {
    font-size: 14px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
  }

  /* Format Buttons */
  .format-buttons {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }

  .format-btn {
    padding: 12px 20px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04));
    border: 1.5px solid rgba(255, 255, 255, 0.15);
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .format-btn:hover {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.06));
    border-color: rgba(255, 255, 255, 0.25);
    transform: translateY(-1px);
  }

  .format-btn.active {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    border-color: #3b82f6;
    color: white;
    box-shadow:
      0 4px 12px rgba(59, 130, 246, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  .format-btn.active:hover {
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    transform: translateY(-2px);
    box-shadow:
      0 6px 16px rgba(59, 130, 246, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.25);
  }

  /* Quality Slider */
  .quality-slider {
    width: 100%;
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    outline: none;
    -webkit-appearance: none;
    appearance: none;
    cursor: pointer;
  }

  .quality-slider::-webkit-slider-track {
    width: 100%;
    height: 6px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.08));
    border-radius: 3px;
    border: 1px solid rgba(255, 255, 255, 0.15);
  }

  .quality-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    border-radius: 50%;
    cursor: pointer;
    box-shadow:
      0 2px 8px rgba(59, 130, 246, 0.4),
      0 0 12px rgba(59, 130, 246, 0.3);
    border: 2px solid white;
    transition: all 0.2s ease;
  }

  .quality-slider::-webkit-slider-thumb:hover {
    transform: scale(1.15);
    box-shadow:
      0 4px 12px rgba(59, 130, 246, 0.5),
      0 0 16px rgba(59, 130, 246, 0.4);
  }

  .quality-slider::-moz-range-track {
    width: 100%;
    height: 6px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.08));
    border-radius: 3px;
    border: 1px solid rgba(255, 255, 255, 0.15);
  }

  .quality-slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    border-radius: 50%;
    cursor: pointer;
    box-shadow:
      0 2px 8px rgba(59, 130, 246, 0.4),
      0 0 12px rgba(59, 130, 246, 0.3);
    border: 2px solid white;
    transition: all 0.2s ease;
  }

  .quality-slider::-moz-range-thumb:hover {
    transform: scale(1.15);
    box-shadow:
      0 4px 12px rgba(59, 130, 246, 0.5),
      0 0 16px rgba(59, 130, 246, 0.4);
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Section spacing and animations */
  .content-section,
  .options-section,
  .actions-section {
    animation: fadeIn 0.4s ease-out backwards;
  }

  .content-section {
    animation-delay: 0.05s;
  }

  .options-section {
    animation-delay: 0.1s;
  }

  .actions-section {
    animation-delay: 0.15s;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }

    .type-button:hover,
    .action-btn:hover,
    .options-toggle:hover,
    .close-btn:hover {
      transform: none !important;
    }
  }
</style>
