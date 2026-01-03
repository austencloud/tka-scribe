<!--
  HeroInstallFlow.svelte

  Inline PWA install flow for the landing hero.
  Handles all platform scenarios:
  - Already installed → "Open App" button
  - In-app browser → Redirect modal with copy URL
  - iOS Safari → "Add to Home Screen" expandable instructions
  - iOS non-Safari → Redirect to Safari modal
  - Android Chrome/Edge → Native install prompt (beforeinstallprompt)
  - Desktop Chrome/Edge → Native install prompt
  - Unsupported → "Open in Browser" link
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { fly, fade, slide } from "svelte/transition";
  import { backOut } from "svelte/easing";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import type {
    IPlatformDetector,
    Platform,
    Browser,
    InAppBrowser,
  } from "$lib/shared/mobile/services/contracts/IPlatformDetector";

  // Install state
  type InstallState =
    | "loading"
    | "installed"
    | "in-app-browser"
    | "ios-safari"
    | "ios-non-safari"
    | "native-prompt"
    | "unsupported";

  let installState = $state<InstallState>("loading");
  let platform = $state<Platform>("desktop");
  let browser = $state<Browser>("other");
  let inAppBrowser = $state<InAppBrowser>("none");

  // Native install prompt (beforeinstallprompt event)
  let deferredPrompt = $state<BeforeInstallPromptEvent | null>(null);
  let installing = $state(false);

  // UI states
  let showIOSInstructions = $state(false);
  let showInAppBrowserModal = $state(false);
  let copied = $state(false);

  // Type for the beforeinstallprompt event
  interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
  }

  onMount(() => {
    const platformService = resolve<IPlatformDetector>(TYPES.IPlatformDetector);
    const info = platformService.detectPlatformAndBrowser();

    platform = info.platform;
    browser = info.browser;
    inAppBrowser = info.inAppBrowser;

    // Determine install state
    if (info.isStandalone) {
      installState = "installed";
    } else if (info.inAppBrowser !== "none") {
      installState = "in-app-browser";
    } else if (info.platform === "ios" && info.browser === "safari") {
      installState = "ios-safari";
    } else if (info.platform === "ios" && info.browser !== "safari") {
      installState = "ios-non-safari";
    } else if (platformService.supportsNativeInstallPrompt(info.platform, info.browser)) {
      installState = "native-prompt";
    } else {
      installState = "unsupported";
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;
      installState = "native-prompt";
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Listen for app installed
    window.addEventListener("appinstalled", () => {
      installState = "installed";
      deferredPrompt = null;
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  });

  // Trigger native install prompt
  async function triggerInstall() {
    if (!deferredPrompt) return;

    installing = true;
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        installState = "installed";
      }
      deferredPrompt = null;
    } catch (err) {
      console.error("Install prompt failed:", err);
    } finally {
      installing = false;
    }
  }

  // Copy URL for in-app browser redirect
  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      copied = true;
      setTimeout(() => (copied = false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      copied = true;
      setTimeout(() => (copied = false), 2000);
    }
  }

  // Get display name for in-app browser
  const inAppBrowserNames: Record<InAppBrowser, string> = {
    instagram: "Instagram",
    facebook: "Facebook",
    twitter: "X",
    tiktok: "TikTok",
    snapchat: "Snapchat",
    linkedin: "LinkedIn",
    pinterest: "Pinterest",
    messenger: "Messenger",
    threads: "Threads",
    none: "",
  };

  const inAppBrowserName = $derived(inAppBrowserNames[inAppBrowser] || "this app");
  const targetBrowser = $derived(platform === "ios" ? "Safari" : "Chrome");
</script>

<div class="install-flow">
  {#if installState === "loading"}
    <!-- Loading state - show nothing to prevent flash -->
    <div class="cta-placeholder"></div>
  {:else if installState === "installed"}
    <!-- Already installed -->
    <a href="/app" class="btn btn-primary btn-installed">
      <i class="fas fa-check-circle" aria-hidden="true"></i>
      <span>Open TKA Scribe</span>
      <span class="arrow">→</span>
    </a>
    <p class="installed-note">
      <i class="fas fa-mobile-alt" aria-hidden="true"></i>
      Already installed on this device
    </p>
  {:else if installState === "in-app-browser"}
    <!-- In-app browser - show warning -->
    <button
      class="btn btn-primary"
      onclick={() => (showInAppBrowserModal = true)}
    >
      <i class="fas fa-external-link-alt" aria-hidden="true"></i>
      <span>Open in {targetBrowser}</span>
    </button>
    <p class="browser-note">
      <i class="fas fa-info-circle" aria-hidden="true"></i>
      {inAppBrowserName} browser doesn't support app installation
    </p>
  {:else if installState === "ios-non-safari"}
    <!-- iOS but not Safari -->
    <button
      class="btn btn-primary"
      onclick={() => (showInAppBrowserModal = true)}
    >
      <i class="fab fa-safari" aria-hidden="true"></i>
      <span>Open in Safari</span>
    </button>
    <p class="browser-note">
      <i class="fas fa-info-circle" aria-hidden="true"></i>
      iOS only allows installation from Safari
    </p>
  {:else if installState === "ios-safari"}
    <!-- iOS Safari - expandable instructions -->
    <div class="ios-install-container">
      <button
        class="btn btn-primary"
        onclick={() => (showIOSInstructions = !showIOSInstructions)}
        aria-expanded={showIOSInstructions}
      >
        <i class="fas fa-plus-square" aria-hidden="true"></i>
        <span>Add to Home Screen</span>
        <i
          class="fas fa-chevron-down expand-icon"
          class:rotated={showIOSInstructions}
          aria-hidden="true"
        ></i>
      </button>

      {#if showIOSInstructions}
        <div
          class="ios-instructions"
          transition:slide={{ duration: 300, easing: backOut }}
        >
          <div class="instruction-steps">
            <div class="step">
              <div class="step-number">1</div>
              <div class="step-content">
                <p>
                  Tap the <strong>Share</strong> button
                  <i class="fas fa-share ios-icon" aria-hidden="true"></i>
                </p>
              </div>
            </div>
            <div class="step">
              <div class="step-number">2</div>
              <div class="step-content">
                <p>
                  Scroll down and tap <strong>"Add to Home Screen"</strong>
                  <i class="fas fa-plus-square ios-icon" aria-hidden="true"></i>
                </p>
              </div>
            </div>
            <div class="step">
              <div class="step-number">3</div>
              <div class="step-content">
                <p>Tap <strong>"Add"</strong> in the top-right corner</p>
              </div>
            </div>
          </div>
          <div class="ios-benefits">
            <i class="fas fa-check-circle" aria-hidden="true"></i>
            Fullscreen experience, quick access, works offline
          </div>
        </div>
      {/if}
    </div>
    <a href="/app" class="link-secondary">
      Or continue in browser →
    </a>
  {:else if installState === "native-prompt"}
    <!-- Android/Desktop with native install support -->
    <button
      class="btn btn-primary"
      onclick={triggerInstall}
      disabled={installing}
    >
      {#if installing}
        <i class="fas fa-spinner fa-spin" aria-hidden="true"></i>
        <span>Installing...</span>
      {:else}
        <i class="fas fa-download" aria-hidden="true"></i>
        <span>Install App</span>
      {/if}
    </button>
    <a href="/app" class="link-secondary">
      Or continue in browser →
    </a>
  {:else}
    <!-- Unsupported browser - just link to app -->
    <a href="/app" class="btn btn-primary">
      <span>Open TKA Scribe</span>
      <span class="arrow">→</span>
    </a>
    <p class="browser-note">
      <i class="fas fa-info-circle" aria-hidden="true"></i>
      Use Chrome or Edge to install as an app
    </p>
  {/if}

  <a href="#features" class="btn btn-secondary">Learn More</a>
</div>

<!-- In-app browser / Non-Safari modal -->
{#if showInAppBrowserModal}
  <div class="modal-overlay" transition:fade={{ duration: 200 }}>
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <div
      class="modal-backdrop"
      onclick={() => (showInAppBrowserModal = false)}
    ></div>

    <div
      class="modal-card"
      transition:fly={{ y: 100, duration: 400, easing: backOut }}
    >
      <div class="modal-header">
        <div class="browser-icon">
          {#if platform === "ios"}
            <i class="fab fa-safari" aria-hidden="true"></i>
          {:else}
            <i class="fab fa-chrome" aria-hidden="true"></i>
          {/if}
        </div>
        <h2>Open in {targetBrowser}</h2>
        <p>
          {#if inAppBrowser !== "none"}
            {inAppBrowserName}'s built-in browser doesn't support app installation.
          {:else}
            This browser doesn't support app installation on {platform === "ios" ? "iOS" : "Android"}.
          {/if}
        </p>
      </div>

      <div class="modal-instructions">
        <div class="instruction-step">
          <div class="step-number">1</div>
          <p>Copy this link</p>
        </div>
        <div class="instruction-step">
          <div class="step-number">2</div>
          <p>Open <strong>{targetBrowser}</strong></p>
        </div>
        <div class="instruction-step">
          <div class="step-number">3</div>
          <p>Paste and visit the page</p>
        </div>
      </div>

      <button class="copy-btn" onclick={copyUrl}>
        {#if copied}
          <i class="fas fa-check" aria-hidden="true"></i>
          <span>Link Copied!</span>
        {:else}
          <i class="fas fa-copy" aria-hidden="true"></i>
          <span>Copy Link</span>
        {/if}
      </button>

      <div class="url-preview">
        <span>tkascribe.com</span>
      </div>

      <button
        class="dismiss-btn"
        onclick={() => (showInAppBrowserModal = false)}
      >
        Continue anyway
      </button>
    </div>
  </div>
{/if}

<style>
  .install-flow {
    display: flex;
    gap: 16px;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 48px;
  }

  .cta-placeholder {
    height: 52px;
    width: 200px;
  }

  /* Buttons */
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 14px 28px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 1rem;
    text-decoration: none;
    transition: all 0.2s ease;
    cursor: pointer;
    border: none;
  }

  .btn-primary {
    background: var(--primary, #6366f1);
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: var(--primary-light, #818cf8);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
  }

  .btn-primary:disabled {
    opacity: 0.7;
    cursor: wait;
  }

  .btn-installed {
    background: linear-gradient(135deg, #10b981, #059669);
  }

  .btn-installed:hover {
    background: linear-gradient(135deg, #34d399, #10b981);
    box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
  }

  .btn-secondary {
    background: var(--bg-card, rgba(255, 255, 255, 0.03));
    color: var(--text, #ffffff);
    border: 1px solid var(--border, rgba(255, 255, 255, 0.1));
  }

  .btn-secondary:hover {
    background: var(--bg-card-hover, rgba(255, 255, 255, 0.06));
    border-color: var(--border-strong, rgba(255, 255, 255, 0.2));
  }

  .arrow {
    transition: transform 0.2s ease;
  }

  .btn:hover .arrow {
    transform: translateX(4px);
  }

  .link-secondary {
    display: block;
    width: 100%;
    text-align: center;
    color: var(--text-muted, rgba(255, 255, 255, 0.6));
    font-size: 0.875rem;
    text-decoration: none;
    margin-top: -8px;
    transition: color 0.2s ease;
  }

  .link-secondary:hover {
    color: var(--text, white);
  }

  /* Notes */
  .installed-note,
  .browser-note {
    width: 100%;
    text-align: center;
    font-size: 0.875rem;
    color: var(--text-muted, rgba(255, 255, 255, 0.6));
    margin-top: -8px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .installed-note {
    color: #10b981;
  }

  /* iOS Instructions */
  .ios-install-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 400px;
  }

  .expand-icon {
    margin-left: 4px;
    font-size: 0.75rem;
    transition: transform 0.3s ease;
  }

  .expand-icon.rotated {
    transform: rotate(180deg);
  }

  .ios-instructions {
    width: 100%;
    margin-top: 16px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
  }

  .instruction-steps {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .step {
    display: flex;
    align-items: flex-start;
    gap: 14px;
  }

  .step-number {
    width: 28px;
    height: 28px;
    flex-shrink: 0;
    border-radius: 50%;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
    font-weight: 700;
  }

  .step-content p {
    margin: 0;
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.9375rem;
    line-height: 1.5;
  }

  .step-content :global(strong) {
    color: #60a5fa;
  }

  .ios-icon {
    color: #60a5fa;
    margin-left: 4px;
  }

  .ios-benefits {
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.8125rem;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .ios-benefits i {
    color: #10b981;
  }

  /* Modal */
  .modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 100000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .modal-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.85);
  }

  .modal-card {
    position: relative;
    width: 100%;
    max-width: 360px;
    background: linear-gradient(180deg, #1a1a2e 0%, #16162a 100%);
    border-radius: 28px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 36px 28px;
    box-shadow:
      0 20px 60px rgba(0, 0, 0, 0.5),
      0 0 0 1px rgba(255, 255, 255, 0.05) inset;
  }

  .modal-header {
    text-align: center;
    margin-bottom: 28px;
  }

  .browser-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 20px;
    border-radius: 20px;
    background: linear-gradient(135deg, #0066ff 0%, #00b4d8 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
    color: white;
    box-shadow: 0 8px 24px rgba(0, 102, 255, 0.3);
  }

  .modal-header h2 {
    margin: 0 0 12px;
    font-size: 1.625rem;
    font-weight: 700;
    color: white;
  }

  .modal-header p {
    margin: 0;
    font-size: 0.9375rem;
    color: rgba(255, 255, 255, 0.55);
    line-height: 1.5;
  }

  .modal-instructions {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 24px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.06);
  }

  .instruction-step {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .instruction-step p {
    margin: 0;
    font-size: 0.9375rem;
    color: rgba(255, 255, 255, 0.9);
  }

  .instruction-step :global(strong) {
    color: #60a5fa;
  }

  .copy-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    width: 100%;
    padding: 16px;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
    border: none;
    border-radius: 14px;
    font-size: 1.0625rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
  }

  .copy-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 28px rgba(99, 102, 241, 0.4);
  }

  .copy-btn:active {
    transform: translateY(0);
  }

  .url-preview {
    text-align: center;
    padding: 12px;
    margin-top: 8px;
    margin-bottom: 4px;
  }

  .url-preview span {
    font-size: 0.8125rem;
    color: rgba(255, 255, 255, 0.4);
    font-family: ui-monospace, monospace;
  }

  .dismiss-btn {
    background: transparent;
    color: rgba(255, 255, 255, 0.4);
    border: none;
    width: 100%;
    padding: 12px;
    font-size: 0.9375rem;
    cursor: pointer;
    transition: color 0.2s ease;
  }

  .dismiss-btn:hover {
    color: rgba(255, 255, 255, 0.7);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .install-flow {
      flex-direction: column;
      align-items: center;
    }

    .btn {
      width: 100%;
      max-width: 300px;
      justify-content: center;
    }

    .ios-install-container {
      max-width: 100%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .btn,
    .expand-icon,
    .copy-btn {
      transition: none;
    }

    .btn:hover .arrow {
      transform: none;
    }
  }
</style>
