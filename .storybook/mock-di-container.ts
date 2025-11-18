/**
 * Mock Dependency Injection Container for Storybook
 *
 * This module provides mock implementations of all services
 * that PWA components depend on, allowing them to render
 * correctly in Storybook without requiring the full DI container.
 */

// Mock service implementations
export const mockServices = {
  IMobileFullscreenService: {
    isPWA: () => false,
    canInstallPWA: () => true,
    promptInstallPWA: async () => {
      console.log("[Storybook] PWA install prompted");
      await new Promise((resolve) => setTimeout(resolve, 500));
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
      console.log("[Storybook] Install request handled");
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
    recordDismissal: () => console.log("[Storybook] Dismissal recorded"),
    recordInstallation: () => console.log("[Storybook] Installation recorded"),
    recordNeverAskAgain: () => console.log("[Storybook] Never ask again"),
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
  IHapticFeedbackService: {
    trigger: (type: string) => console.log(`[Storybook] Haptic: ${type}`),
  },
  IDeviceDetector: {
    isMobile: () => false,
    isTablet: () => false,
    isDesktop: () => true,
    isMobilePortrait: () => false,
  },
};

// Create a mock resolve function
export function createMockResolve() {
  return function mockResolve<T>(serviceIdentifier: symbol): T {
    const serviceName = serviceIdentifier.toString();

    // Extract service name from symbol
    const match = serviceName.match(/Symbol\((.+?)\)/);
    const extractedName = match ? match[1] : serviceName;

    // Find matching service
    for (const [key, service] of Object.entries(mockServices)) {
      if (extractedName.includes(key)) {
        console.log(`[Storybook] Resolving mock service: ${key}`);
        return service as T;
      }
    }

    console.warn(`[Storybook] No mock found for service: ${extractedName}`);
    return {} as T;
  };
}

// Initialize mock container that intercepts resolve calls
export function initializeMockContainer() {
  if (typeof window === "undefined") return;

  // Store the mock resolve function globally
  (window as any).__STORYBOOK_MOCK_RESOLVE__ = createMockResolve();

  console.log("[Storybook] Mock DI container initialized");
}
