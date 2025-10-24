<!--
Mobile Fullscreen Prompt Component

Shows intelligent prompts for mobile fullscreen based on device capabilities:
1. PWA installation prompt (best experience)
2. Fullscreen API button (requires user gesture)
3. Manual fullscreen instructions (fallback)
-->
<script lang="ts">
  import { resolve, TYPES } from "$shared";
  import { onMount } from "svelte";
  import type { IMobileFullscreenService } from "../services/contracts/IMobileFullscreenService";

  // Props
  let {
    showPrompt = $bindable(false),
    autoShow = true,
    position = "bottom",
  }: {
    showPrompt?: boolean;
    autoShow?: boolean;
    position?: "top" | "bottom" | "center";
  } = $props();

  // Service
  let fullscreenService: IMobileFullscreenService | null = null;

  // State
  let strategy = $state<
    "pwa" | "fullscreen-api" | "viewport-only" | "not-supported"
  >("not-supported");
  let canInstallPWA = $state(false);
  let isFullscreen = $state(false);
  let isInstalling = $state(false);
  let isTogglingFullscreen = $state(false);

  onMount(() => {
    try {
      fullscreenService = resolve(TYPES.IMobileFullscreenService);
      if (!fullscreenService) return;

      strategy = fullscreenService.getRecommendedStrategy();
      canInstallPWA = fullscreenService.canInstallPWA();
      isFullscreen = fullscreenService.isFullscreen();

      // Subscribe to changes
      const unsubscribeFullscreen = fullscreenService.onFullscreenChange(
        (fs) => {
          isFullscreen = fs;
        }
      );

      const unsubscribeInstall = fullscreenService.onInstallPromptAvailable(
        (canInstall) => {
          canInstallPWA = canInstall;
          if (canInstall && autoShow && !fullscreenService!.isPWA()) {
            showPrompt = true;
          }
        }
      );

      // Auto-show prompt for mobile users if not PWA
      if (
        autoShow &&
        strategy !== "not-supported" &&
        !fullscreenService.isPWA()
      ) {
        // Delay to avoid interrupting initial page load
        setTimeout(() => {
          showPrompt = true;
        }, 3000);
      }

      return () => {
        unsubscribeFullscreen();
        unsubscribeInstall();
      };
    } catch (error) {
      console.error("Failed to initialize mobile fullscreen service:", error);
    }
  });

  async function handleInstallPWA() {
    if (!fullscreenService) return;

    isInstalling = true;
    try {
      const success = await fullscreenService.promptInstallPWA();
      if (success) {
        showPrompt = false;
      }
    } finally {
      isInstalling = false;
    }
  }

  async function handleToggleFullscreen() {
    if (!fullscreenService) return;

    isTogglingFullscreen = true;
    try {
      await fullscreenService.toggleFullscreen();
    } finally {
      isTogglingFullscreen = false;
    }
  }

  function handleDismiss() {
    showPrompt = false;
  }
</script>

{#if showPrompt && strategy !== "not-supported"}
  <div class="fullscreen-prompt-overlay position-{position}">
    <div class="fullscreen-prompt">
      <!-- PWA Installation Prompt -->
      {#if strategy === "pwa" && canInstallPWA}
        <div class="prompt-content">
          <div class="prompt-icon">📱</div>
          <h3>Get the Best Experience</h3>
          <p>
            Install TKA as an app for fullscreen experience and offline access!
          </p>

          <div class="prompt-actions">
            <button
              class="install-button"
              onclick={handleInstallPWA}
              disabled={isInstalling}
            >
              {isInstalling ? "Installing..." : "Install App"}
            </button>
            <button class="dismiss-button" onclick={handleDismiss}>
              Maybe Later
            </button>
          </div>
        </div>

        <!-- Fullscreen API Prompt -->
      {:else if strategy === "fullscreen-api"}
        <div class="prompt-content">
          <div class="prompt-icon">🔲</div>
          <h3>Go Fullscreen</h3>
          <p>
            Tap the button below to use TKA in fullscreen mode for the best
            experience.
          </p>

          <div class="prompt-actions">
            <button
              class="fullscreen-button"
              onclick={handleToggleFullscreen}
              disabled={isTogglingFullscreen}
            >
              {isTogglingFullscreen
                ? "Loading..."
                : isFullscreen
                  ? "Exit Fullscreen"
                  : "Enter Fullscreen"}
            </button>
            <button class="dismiss-button" onclick={handleDismiss}>
              Not Now
            </button>
          </div>
        </div>

        <!-- Viewport Optimization Prompt -->
      {:else if strategy === "viewport-only"}
        <div class="prompt-content">
          <div class="prompt-icon">📐</div>
          <h3>Fullscreen Tips</h3>
          <p>For the best experience, use your browser's fullscreen option:</p>
          <ul>
            <li>Tap the menu (⋮) and select "Fullscreen"</li>
            <li>Or rotate to landscape mode</li>
          </ul>

          <div class="prompt-actions">
            <button class="dismiss-button" onclick={handleDismiss}>
              Got It
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .fullscreen-prompt-overlay {
    position: fixed;
    left: 0;
    right: 0;
    z-index: 1000;
    display: flex;
    justify-content: center;
    padding: 16px;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
  }

  .fullscreen-prompt-overlay.position-top {
    top: 0;
    align-items: flex-start;
  }

  .fullscreen-prompt-overlay.position-center {
    top: 0;
    bottom: 0;
    align-items: center;
  }

  .fullscreen-prompt-overlay.position-bottom {
    bottom: 0;
    align-items: flex-end;
  }

  .fullscreen-prompt {
    background: var(--color-surface);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    max-width: 400px;
    width: 100%;
    animation: slideIn 0.3s ease-out;
  }

  .prompt-content {
    padding: 24px;
    text-align: center;
  }

  .prompt-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .prompt-content h3 {
    margin: 0 0 12px 0;
    color: var(--color-text-primary);
    font-size: 20px;
    font-weight: 600;
  }

  .prompt-content p {
    margin: 0 0 20px 0;
    color: var(--color-text-secondary);
    line-height: 1.5;
  }

  .prompt-content ul {
    text-align: left;
    margin: 0 0 20px 0;
    padding-left: 20px;
    color: var(--color-text-secondary);
  }

  .prompt-content li {
    margin-bottom: 8px;
  }

  .prompt-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .install-button,
  .fullscreen-button {
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 12px 24px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .install-button:hover,
  .fullscreen-button:hover {
    background: var(--color-primary-hover);
    transform: translateY(-1px);
  }

  .install-button:disabled,
  .fullscreen-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .dismiss-button {
    background: transparent;
    color: var(--color-text-secondary);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 12px 24px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .dismiss-button:hover {
    background: var(--color-surface-hover);
    color: var(--color-text-primary);
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Mobile optimizations */
  @media (max-width: 480px) {
    .fullscreen-prompt-overlay {
      padding: 12px;
    }

    .prompt-content {
      padding: 20px;
    }

    .prompt-icon {
      font-size: 40px;
    }

    .prompt-content h3 {
      font-size: 18px;
    }
  }
</style>
