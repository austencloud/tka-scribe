<!--
  MockServiceWrapper.svelte

  Provides mock service implementations for PWA components in Storybook.
  This wrapper intercepts dependency injection calls and returns mock services.
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "../../lib/shared/application/services/contracts/IHapticFeedbackService";
  import { onMount, setContext } from "svelte";

  // Mock services for PWA components
  const mockFullscreenService = {
    isPWA: () => false,
    canInstallPWA: () => true,
    promptInstallPWA: async () => {
      console.log("[Storybook Mock] PWA install prompted");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return true;
    },
    isFullscreenSupported: () => true,
    isFullscreen: () => false,
    requestFullscreen: async () => true,
    exitFullscreen: async () => true,
    toggleFullscreen: async () => true,
    showFullscreenPrompt: () => {},
    onFullscreenChange: () => () => {},
    onInstallPromptAvailable: (callback: any) => {
      setTimeout(() => callback(true), 100);
      return () => {};
    },
    getRecommendedStrategy: () => "pwa" as const,
    handleInstallRequest: async () => {
      console.log("[Storybook Mock] Install request handled");
      return true;
    },
  };

  const mockEngagementService = {
    recordVisit: () => {},
    recordSequenceCreated: () => {},
    recordInteraction: () => {},
    startSession: () => {},
    endSession: () => {},
    getMetrics: () => ({
      visitCount: 5,
      hasCreatedSequence: true,
      interactionCount: 10,
      totalTimeSpent: 300000,
      firstVisit: Date.now() - 86400000,
      lastVisit: Date.now(),
    }),
    shouldShowInstallPrompt: () => true,
    reset: () => {},
  };

  const mockDismissalService = {
    recordDismissal: () => console.log("[Storybook Mock] Dismissal recorded"),
    recordInstallation: () =>
      console.log("[Storybook Mock] Installation recorded"),
    recordNeverAskAgain: () => console.log("[Storybook Mock] Never ask again"),
    canShowPrompt: () => true,
    getDaysUntilNextPrompt: () => 0,
    getState: () => ({
      dismissCount: 0,
      lastDismissed: null,
      neverAskAgain: false,
      hasInstalled: false,
    }),
    reset: () => {},
  };

  const mockPlatformService = {
    detectPlatformAndBrowser: () => ({
      platform: "desktop" as const,
      browser: "chrome" as const,
    }),
    detectPlatform: () => "desktop" as const,
    detectBrowser: () => "chrome" as const,
  };

  const mockHapticService = {
    trigger: (type: string) => console.log(`[Storybook Mock] Haptic: ${type}`),
  };

  // Override the global resolve function for this component tree
  onMount(() => {
    if (typeof window !== "undefined") {
      const originalResolve = (window as any).originalResolve;

      (window as any).mockResolveForStorybook = (serviceIdentifier: symbol) => {
        const serviceName = serviceIdentifier.toString();

        if (serviceName.includes("IMobileFullscreenService")) {
          return mockFullscreenService;
        }
        if (serviceName.includes("IPWAEngagementService")) {
          return mockEngagementService;
        }
        if (serviceName.includes("IPWAInstallDismissalService")) {
          return mockDismissalService;
        }
        if (serviceName.includes("IPlatformDetectionService")) {
          return mockPlatformService;
        }
        if (serviceName.includes("IHapticFeedbackService")) {
          return mockHapticService;
        }

        console.warn("[Storybook Mock] Service not mocked:", serviceName);
        return {};
      };
    }
  });

  let { children }: { children: any } = $props();
</script>

{@render children()}
