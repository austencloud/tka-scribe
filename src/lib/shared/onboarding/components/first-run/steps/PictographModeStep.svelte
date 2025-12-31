<!--
  PictographModeStep - Choose light or dark pictograph mode

  Shows visual examples of both modes side by side.
  Light mode: standard display on light background
  Dark mode (Lights Off): inverted colors, dark background, glow effects
-->
<script lang="ts">
  interface Props {
    initialValue?: "light" | "dark";
    onComplete: (mode: "light" | "dark") => void;
    onBack: () => void;
    onSkip: () => void;
  }

  const { initialValue, onComplete, onBack, onSkip }: Props = $props();

  let selectedMode = $state<"light" | "dark" | null>(initialValue ?? null);

  function handleSelect(mode: "light" | "dark") {
    selectedMode = mode;
  }

  function handleContinue() {
    if (selectedMode) {
      onComplete(selectedMode);
    }
  }
</script>

<div class="pictograph-mode-step">
  <div class="icon-container">
    <i class="fas fa-palette" aria-hidden="true"></i>
  </div>

  <h1 class="title">How do you like your pictographs?</h1>

  <p class="subtitle">Choose your visual style</p>

  <div class="mode-options">
    <!-- Light Mode Option -->
    <button
      class="mode-card"
      class:selected={selectedMode === "light"}
      onclick={() => handleSelect("light")}
      aria-pressed={selectedMode === "light"}
    >
      <div class="preview-frame light-preview">
        <!-- Simplified pictograph preview - Light mode -->
        <svg viewBox="0 0 100 100" class="preview-svg">
          <!-- Diamond grid -->
          <path
            d="M50 10 L90 50 L50 90 L10 50 Z"
            fill="none"
            stroke="#ccc"
            stroke-width="1.5"
          />
          <line x1="10" y1="50" x2="90" y2="50" stroke="#ddd" stroke-width="1" />
          <line x1="50" y1="10" x2="50" y2="90" stroke="#ddd" stroke-width="1" />

          <!-- Blue arrow -->
          <path
            d="M50 70 Q30 60 35 40"
            fill="none"
            stroke="#2E3192"
            stroke-width="4"
            stroke-linecap="round"
          />
          <circle cx="35" cy="40" r="4" fill="#2E3192" />

          <!-- Red arrow -->
          <path
            d="M50 30 Q70 40 65 60"
            fill="none"
            stroke="#ED1C24"
            stroke-width="4"
            stroke-linecap="round"
          />
          <circle cx="65" cy="60" r="4" fill="#ED1C24" />
        </svg>
      </div>
      <span class="mode-label">Light Mode</span>
      <span class="mode-description">Standard display</span>
      {#if selectedMode === "light"}
        <div class="selected-badge">
          <i class="fas fa-check" aria-hidden="true"></i>
        </div>
      {/if}
    </button>

    <!-- Dark Mode Option -->
    <button
      class="mode-card"
      class:selected={selectedMode === "dark"}
      onclick={() => handleSelect("dark")}
      aria-pressed={selectedMode === "dark"}
    >
      <div class="preview-frame dark-preview">
        <!-- Simplified pictograph preview - Dark mode with glow -->
        <svg viewBox="0 0 100 100" class="preview-svg">
          <defs>
            <filter id="blue-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="red-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <!-- Diamond grid (inverted) -->
          <path
            d="M50 10 L90 50 L50 90 L10 50 Z"
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            stroke-width="1.5"
          />
          <line
            x1="10"
            y1="50"
            x2="90"
            y2="50"
            stroke="rgba(255,255,255,0.15)"
            stroke-width="1"
          />
          <line
            x1="50"
            y1="10"
            x2="50"
            y2="90"
            stroke="rgba(255,255,255,0.15)"
            stroke-width="1"
          />

          <!-- Blue arrow with glow -->
          <path
            d="M50 70 Q30 60 35 40"
            fill="none"
            stroke="#4B9CFF"
            stroke-width="4"
            stroke-linecap="round"
            filter="url(#blue-glow)"
          />
          <circle cx="35" cy="40" r="4" fill="#4B9CFF" filter="url(#blue-glow)" />

          <!-- Red arrow with glow -->
          <path
            d="M50 30 Q70 40 65 60"
            fill="none"
            stroke="#FF6B6B"
            stroke-width="4"
            stroke-linecap="round"
            filter="url(#red-glow)"
          />
          <circle cx="65" cy="60" r="4" fill="#FF6B6B" filter="url(#red-glow)" />
        </svg>
      </div>
      <span class="mode-label">Dark Mode</span>
      <span class="mode-description">LED glow effect</span>
      {#if selectedMode === "dark"}
        <div class="selected-badge">
          <i class="fas fa-check" aria-hidden="true"></i>
        </div>
      {/if}
    </button>
  </div>

  <p class="hint">You can change this anytime in settings</p>

  <div class="button-row">
    <button type="button" class="back-button" onclick={onBack}>
      <i class="fas fa-arrow-left" aria-hidden="true"></i>
    </button>

    <button
      type="button"
      class="next-button"
      disabled={!selectedMode}
      onclick={handleContinue}
    >
      Finish <i class="fas fa-check" aria-hidden="true"></i>
    </button>
  </div>

  <button type="button" class="skip-link" onclick={onSkip}>
    Skip for now
  </button>
</div>

<style>
  .pictograph-mode-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    max-width: 480px;
    width: 100%;
    text-align: center;
    padding: 24px;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-radius: 24px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .icon-container {
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, #06b6d4 15%, transparent);
    border-radius: 18px;
    font-size: 1.5rem;
    color: #06b6d4;
  }

  .title {
    font-size: 1.4rem;
    font-weight: 700;
    color: white;
    margin: 0;
  }

  .subtitle {
    font-size: 0.95rem;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    margin: 0;
  }

  .mode-options {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    width: 100%;
    margin: 12px 0;
  }

  .mode-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 16px 12px 14px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 2px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
  }

  .mode-card:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.08));
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.2));
    transform: translateY(-2px);
  }

  .mode-card.selected {
    background: color-mix(
      in srgb,
      var(--theme-accent-strong, #8b5cf6) 15%,
      transparent
    );
    border-color: var(--theme-accent-strong, #8b5cf6);
    transform: scale(1.02);
  }

  .mode-card:active {
    transform: scale(0.98);
  }

  .preview-frame {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .light-preview {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  }

  .dark-preview {
    background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%);
  }

  .preview-svg {
    width: 80%;
    height: 80%;
  }

  .mode-label {
    font-size: 1rem;
    font-weight: 700;
    color: var(--theme-text, white);
  }

  .mode-description {
    font-size: 0.8rem;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
  }

  .selected-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--theme-accent-strong, #8b5cf6);
    border-radius: 50%;
    color: white;
    font-size: 0.7rem;
    animation: pop-in 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes pop-in {
    from {
      transform: scale(0);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  .hint {
    font-size: 0.85rem;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    margin: 0;
  }

  .button-row {
    display: flex;
    gap: 12px;
    margin-top: 8px;
  }

  .back-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--theme-stroke-strong, rgba(255, 255, 255, 0.15));
    border-radius: 12px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .back-button:hover {
    background: rgba(255, 255, 255, 0.08);
    color: white;
  }

  .next-button {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 24px;
    background: color-mix(in srgb, #22c55e 40%, transparent);
    border: 2px solid color-mix(in srgb, #22c55e 60%, transparent);
    border-radius: 12px;
    color: white;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .next-button:hover:not(:disabled) {
    background: color-mix(in srgb, #22c55e 50%, transparent);
    border-color: color-mix(in srgb, #22c55e 80%, transparent);
  }

  .next-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .skip-link {
    padding: 10px 16px;
    background: transparent;
    border: none;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    font-size: 0.9rem;
    cursor: pointer;
    transition: color 0.2s ease;
    margin-top: 4px;
  }

  .skip-link:hover {
    color: var(--theme-text, rgba(255, 255, 255, 0.8));
  }

  /* Mobile */
  @media (max-width: 480px) {
    .pictograph-mode-step {
      padding: 16px;
    }

    .icon-container {
      width: 56px;
      height: 56px;
      font-size: 1.3rem;
    }

    .title {
      font-size: 1.25rem;
    }

    .mode-options {
      gap: 12px;
    }

    .mode-card {
      padding: 12px 10px;
    }

    .mode-label {
      font-size: 0.9rem;
    }

    .mode-description {
      font-size: 0.75rem;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .mode-card,
    .back-button,
    .next-button,
    .skip-link {
      transition: none;
    }

    .mode-card:hover,
    .mode-card:active,
    .mode-card.selected {
      transform: none;
    }

    .selected-badge {
      animation: none;
    }
  }
</style>
