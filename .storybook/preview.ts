import type { Preview } from "@storybook/svelte-vite";

// Mock import.meta.env for Storybook
if (typeof window !== "undefined") {
  (window as any).import = {
    meta: {
      env: {
        MODE: "development",
        DEV: true,
        PROD: false,
        SSR: false,
      },
    },
  };
}

// Mock the DI container's resolve function
const mockServices = {
  IHapticFeedbackService: {
    trigger: (type: string) => console.log("Haptic:", type),
  },
  IDeviceDetector: {
    isMobile: () => false,
    isTablet: () => false,
    isDesktop: () => true,
    isMobilePortrait: () => false,
  },
  IMobileFullscreenService: {
    isPWA: () => false,
    canInstallPWA: () => true,
    promptInstallPWA: async () => {
      console.log("Mock: PWA install prompted");
      return true;
    },
    isFullscreenSupported: () => true,
    isFullscreen: () => false,
    requestFullscreen: async () => true,
    exitFullscreen: async () => true,
    toggleFullscreen: async () => true,
    showFullscreenPrompt: () => {},
    onFullscreenChange: (callback: any) => () => {},
    onInstallPromptAvailable: (callback: any) => {
      // Call immediately with true to simulate install prompt being available
      setTimeout(() => callback(true), 100);
      return () => {};
    },
    getRecommendedStrategy: () => "pwa" as const,
    handleInstallRequest: async () => {
      console.log("Mock: Install request handled");
      return true;
    },
  },
  IPWAEngagementService: {
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
  },
  IPWAInstallDismissalService: {
    recordDismissal: () => console.log("Mock: Dismissal recorded"),
    recordInstallation: () => console.log("Mock: Installation recorded"),
    recordNeverAskAgain: () => console.log("Mock: Never ask again"),
    canShowPrompt: () => true,
    getDaysUntilNextPrompt: () => 0,
    getState: () => ({
      dismissCount: 0,
      lastDismissed: null,
      neverAskAgain: false,
      hasInstalled: false,
    }),
    reset: () => {},
  },
  IPlatformDetectionService: {
    detectPlatformAndBrowser: () => ({
      platform: "desktop" as const,
      browser: "chrome" as const,
    }),
    detectPlatform: () => "desktop" as const,
    detectBrowser: () => "chrome" as const,
  },
};

// Create a global mock resolve function
(window as any).__mockResolve = (typeSymbol: symbol) => {
  const serviceName = typeSymbol.toString();
  if (serviceName.includes("IHapticFeedbackService")) {
    return mockServices.IHapticFeedbackService;
  }
  if (serviceName.includes("IDeviceDetector")) {
    return mockServices.IDeviceDetector;
  }
  if (serviceName.includes("IMobileFullscreenService")) {
    return mockServices.IMobileFullscreenService;
  }
  if (serviceName.includes("IPWAEngagementService")) {
    return mockServices.IPWAEngagementService;
  }
  if (serviceName.includes("IPWAInstallDismissalService")) {
    return mockServices.IPWAInstallDismissalService;
  }
  if (serviceName.includes("IPlatformDetectionService")) {
    return mockServices.IPlatformDetectionService;
  }
  console.warn("Mock service not found for:", serviceName);
  return {};
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
  },
};

export default preview;
