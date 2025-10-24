<!--
PWA Installation Guide Component

Shows device-specific instructions for installing TKA as a PWA
for automatic fullscreen experience.
-->
<script lang="ts">
  import { onMount } from "svelte";

  // Props
  let {
    showGuide = $bindable(false),
  }: {
    showGuide?: boolean;
  } = $props();

  // State
  let deviceType = $state<"android" | "ios" | "desktop" | "unknown">("unknown");
  let browserType = $state<
    "chrome" | "safari" | "firefox" | "edge" | "samsung" | "unknown"
  >("unknown");

  onMount(() => {
    detectDevice();
  });

  function detectDevice() {
    const userAgent = navigator.userAgent.toLowerCase();

    // Detect device type
    if (/android/.test(userAgent)) {
      deviceType = "android";
    } else if (/iphone|ipad|ipod/.test(userAgent)) {
      deviceType = "ios";
    } else if (/windows|macintosh|linux/.test(userAgent)) {
      deviceType = "desktop";
    }

    // Detect browser type
    if (/chrome/.test(userAgent) && !/edg/.test(userAgent)) {
      browserType = "chrome";
    } else if (/safari/.test(userAgent) && !/chrome/.test(userAgent)) {
      browserType = "safari";
    } else if (/firefox/.test(userAgent)) {
      browserType = "firefox";
    } else if (/edg/.test(userAgent)) {
      browserType = "edge";
    } else if (/samsung/.test(userAgent)) {
      browserType = "samsung";
    }
  }

  function handleClose() {
    showGuide = false;
  }
</script>

{#if showGuide}
  <div
    class="pwa-guide-overlay"
    role="button"
    tabindex="0"
    onclick={handleClose}
    onkeydown={(e) => {
      if (e.key === "Enter" || e.key === " ") handleClose();
    }}
    aria-label="Close install guide"
  >
    <div
      class="pwa-guide"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-title"
      tabindex="-1"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
    >
      <div class="guide-header">
        <h2 id="guide-title">Install TKA for Fullscreen Experience</h2>
        <button class="close-button" onclick={handleClose}>×</button>
      </div>

      <div class="guide-content">
        {#if deviceType === "android"}
          <div class="device-instructions">
            <h3>📱 Android Instructions</h3>

            {#if browserType === "chrome"}
              <ol>
                <li>
                  Tap the <strong>menu (⋮)</strong> in the top-right corner
                </li>
                <li>Select <strong>"Add to Home screen"</strong></li>
                <li>Tap <strong>"Add"</strong> to confirm</li>
                <li>Find the TKA icon on your home screen</li>
                <li>Tap it to launch in fullscreen mode!</li>
              </ol>
            {:else if browserType === "samsung"}
              <ol>
                <li>Tap the <strong>menu (☰)</strong> at the bottom</li>
                <li>
                  Select <strong>"Add page to"</strong> →
                  <strong>"Home screen"</strong>
                </li>
                <li>Tap <strong>"Add"</strong> to confirm</li>
                <li>Launch from your home screen for fullscreen!</li>
              </ol>
            {:else}
              <ol>
                <li>
                  Look for an <strong>"Add to Home screen"</strong> option in your
                  browser menu
                </li>
                <li>
                  Or try opening this site in <strong>Chrome</strong> for the best
                  experience
                </li>
                <li>
                  Once installed, launch from your home screen for automatic
                  fullscreen!
                </li>
              </ol>
            {/if}
          </div>
        {:else if deviceType === "ios"}
          <div class="device-instructions">
            <h3>📱 iPhone/iPad Instructions</h3>

            {#if browserType === "safari"}
              <ol>
                <li>
                  Tap the <strong>Share button (□↗)</strong> at the bottom
                </li>
                <li>
                  Scroll down and tap <strong>"Add to Home Screen"</strong>
                </li>
                <li>Tap <strong>"Add"</strong> in the top-right</li>
                <li>Find the TKA icon on your home screen</li>
                <li>Tap it to launch in fullscreen mode!</li>
              </ol>
            {:else}
              <ol>
                <li>
                  Open this site in <strong>Safari</strong> for the best experience
                </li>
                <li>Then follow the Safari instructions above</li>
                <li>Other browsers on iOS don't support PWA installation</li>
              </ol>
            {/if}
          </div>
        {:else if deviceType === "desktop"}
          <div class="device-instructions">
            <h3>🖥️ Desktop Instructions</h3>

            <ol>
              <li>
                Look for an <strong>install icon (⊕)</strong> in your address bar
              </li>
              <li>
                Or check your browser menu for <strong>"Install TKA"</strong>
              </li>
              <li>
                Click <strong>"Install"</strong> to add TKA as a desktop app
              </li>
              <li>Launch from your desktop or start menu</li>
              <li>Enjoy the fullscreen experience!</li>
            </ol>
          </div>
        {:else}
          <div class="device-instructions">
            <h3>📱 General Instructions</h3>

            <ol>
              <li>
                Look for <strong>"Add to Home screen"</strong> in your browser menu
              </li>
              <li>Or an <strong>install icon</strong> in your address bar</li>
              <li>Follow the prompts to install TKA</li>
              <li>Launch from your home screen/desktop for fullscreen!</li>
            </ol>
          </div>
        {/if}

        <div class="benefits">
          <h4>✨ Benefits of Installing:</h4>
          <ul>
            <li><strong>Automatic fullscreen</strong> - No browser UI</li>
            <li><strong>Faster loading</strong> - Cached for offline use</li>
            <li><strong>Home screen icon</strong> - Quick access</li>
            <li><strong>Better performance</strong> - Optimized experience</li>
          </ul>
        </div>

        {#if deviceType === "android" && browserType !== "chrome"}
          <div class="browser-recommendation">
            <p>
              <strong>💡 Tip:</strong> For the best experience on Android, try
              opening TKA in <strong>Chrome</strong> browser.
            </p>
          </div>
        {/if}

        {#if deviceType === "ios" && browserType !== "safari"}
          <div class="browser-recommendation">
            <p>
              <strong>💡 Tip:</strong> For the best experience on iOS, try
              opening TKA in <strong>Safari</strong> browser.
            </p>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .pwa-guide-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .pwa-guide {
    background: var(--color-surface);
    border-radius: 16px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    max-width: 500px;
    width: 100%;
    max-height: 80vh;
    overflow-y: auto;
    animation: slideIn 0.3s ease-out;
  }

  .guide-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 24px 0 24px;
    border-bottom: 1px solid var(--color-border);
    margin-bottom: 24px;
  }

  .guide-header h2 {
    margin: 0;
    color: var(--color-text-primary);
    font-size: 20px;
    font-weight: 600;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 24px;
    color: var(--color-text-secondary);
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s ease;
  }

  .close-button:hover {
    background: var(--color-surface-hover);
    color: var(--color-text-primary);
  }

  .guide-content {
    padding: 0 24px 24px 24px;
  }

  .device-instructions h3 {
    margin: 0 0 16px 0;
    color: var(--color-text-primary);
    font-size: 18px;
    font-weight: 600;
  }

  .device-instructions ol {
    margin: 0 0 24px 0;
    padding-left: 20px;
    color: var(--color-text-secondary);
    line-height: 1.6;
  }

  .device-instructions li {
    margin-bottom: 8px;
  }

  .device-instructions strong {
    color: var(--color-text-primary);
    font-weight: 600;
  }

  .benefits {
    background: var(--color-surface-secondary);
    border-radius: 12px;
    padding: 16px;
    margin: 24px 0;
  }

  .benefits h4 {
    margin: 0 0 12px 0;
    color: var(--color-text-primary);
    font-size: 16px;
    font-weight: 600;
  }

  .benefits ul {
    margin: 0;
    padding-left: 20px;
    color: var(--color-text-secondary);
    line-height: 1.5;
  }

  .benefits li {
    margin-bottom: 6px;
  }

  .browser-recommendation {
    background: var(--color-warning-bg);
    border: 1px solid var(--color-warning-border);
    border-radius: 8px;
    padding: 12px;
    margin-top: 16px;
  }

  .browser-recommendation p {
    margin: 0;
    color: var(--color-warning-text);
    font-size: 14px;
    line-height: 1.4;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: scale(0.9) translateY(20px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  /* Mobile optimizations */
  @media (max-width: 480px) {
    .pwa-guide-overlay {
      padding: 16px;
    }

    .guide-header {
      padding: 20px 20px 0 20px;
    }

    .guide-header h2 {
      font-size: 18px;
    }

    .guide-content {
      padding: 0 20px 20px 20px;
    }

    .device-instructions h3 {
      font-size: 16px;
    }
  }
</style>
