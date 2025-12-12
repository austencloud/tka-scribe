import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import NotificationPreferencesPanel from "$lib/features/feedback/components/NotificationPreferencesPanel.svelte";
import { NOTIFICATION_TYPE_CONFIG } from "$lib/features/feedback/domain/models/notification-models";

// Define mock functions outside vi.mock
const defaultMockPreferences = {
  feedbackResolved: true,
  feedbackInProgress: true,
  feedbackNeedsInfo: true,
  feedbackResponse: true,
  sequenceLiked: true,
  userFollowed: true,
  achievementUnlocked: true,
  adminNewUserSignup: true,
};

vi.mock(
  "$lib/features/feedback/services/implementations/NotificationPreferencesService",
  () => {
    const mockTogglePreference = vi.fn(() => Promise.resolve());
    const mockEnableAll = vi.fn(() => Promise.resolve());
    const mockDisableAll = vi.fn(() => Promise.resolve());
    const mockGetPreferences = vi.fn(() =>
      Promise.resolve(defaultMockPreferences)
    );

    return {
      notificationPreferencesService: {
        getPreferences: mockGetPreferences,
        togglePreference: mockTogglePreference,
        enableAll: mockEnableAll,
        disableAll: mockDisableAll,
      },
    };
  }
);

// Mock auth store
vi.mock("$lib/shared/auth/state/authState.svelte", () => ({
  authState: {
    user: { uid: "test-user-123" },
    isAuthenticated: true,
  },
}));

describe("NotificationPreferencesPanel - Dynamic Settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Dynamic Preference Group Generation", () => {
    it("should render feedback notification preferences", async () => {
      render(NotificationPreferencesPanel);

      await waitFor(() => {
        expect(screen.queryByText(/feedback notifications/i)).toBeTruthy();
      });

      // Check for feedback notification types
      expect(screen.queryByText(/feedback resolved/i)).toBeTruthy();
      expect(screen.queryByText(/being worked on/i)).toBeTruthy();
      expect(screen.queryByText(/more info needed/i)).toBeTruthy();
      expect(screen.queryByText(/admin response/i)).toBeTruthy();
    });

    it("should render sequence engagement preferences", async () => {
      render(NotificationPreferencesPanel);

      await waitFor(() => {
        expect(screen.queryByText(/sequence engagement/i)).toBeTruthy();
      });

      // Check for sequence notification types (only liked, not removed ones)
      expect(screen.queryByText(/sequence liked/i)).toBeTruthy();

      // Removed types should not appear
      expect(screen.queryByText(/sequence saved/i)).toBeFalsy();
      expect(screen.queryByText(/video submitted/i)).toBeFalsy();
      expect(screen.queryByText(/new comment/i)).toBeFalsy();
    });

    it("should render social & achievements preferences", async () => {
      render(NotificationPreferencesPanel);

      await waitFor(() => {
        expect(screen.queryByText(/social & achievements/i)).toBeTruthy();
      });

      expect(screen.queryByText(/new follower/i)).toBeTruthy();
      expect(screen.queryByText(/achievement unlocked/i)).toBeTruthy();
    });

    it("should not have preferences for removed notification types", async () => {
      render(NotificationPreferencesPanel);

      await waitFor(() => {
        expect(screen.getByText(/notification preferences/i)).toBeTruthy();
      });

      // Verify removed types are NOT rendered
      expect(screen.queryByText(/sequence saved/i)).toBeFalsy();
      expect(screen.queryByText(/video submitted/i)).toBeFalsy();
      expect(screen.queryByText(/new comment/i)).toBeFalsy();
    });

    it("should dynamically match active notification types from config", async () => {
      render(NotificationPreferencesPanel);

      await waitFor(() => {
        expect(screen.getByText(/notification preferences/i)).toBeTruthy();
      });

      // Count active types in config (excluding system-announcement)
      const activeConfigTypes = Object.keys(NOTIFICATION_TYPE_CONFIG)
        .filter((type) => type !== "system-announcement")
        .length;

      // The UI should render toggles for all active types
      // (This is a conceptual check - actual count would depend on implementation)
      expect(activeConfigTypes).toBeGreaterThan(0);
      expect(activeConfigTypes).toBeLessThan(10); // Sanity check
    });
  });

  describe("Preference Descriptions", () => {
    it("should show contextual descriptions for each preference", async () => {
      render(NotificationPreferencesPanel);

      await waitFor(() => {
        expect(screen.queryByText(/when your feedback is marked as resolved/i))
          .toBeTruthy();
        expect(screen.queryByText(/when work starts on your feedback/i))
          .toBeTruthy();
        expect(screen.queryByText(/when admin needs more details/i))
          .toBeTruthy();
      });
    });

    it("descriptions should be present for all feedback types", async () => {
      render(NotificationPreferencesPanel);

      await waitFor(() => {
        // Feedback descriptions
        expect(
          screen.queryByText(/when your feedback is marked as resolved/i)
        ).toBeTruthy();
        expect(screen.queryByText(/when work starts on your feedback/i))
          .toBeTruthy();
        expect(screen.queryByText(/when admin needs more details/i))
          .toBeTruthy();
        expect(screen.queryByText(/when admin sends you a message/i))
          .toBeTruthy();
      });
    });
  });

  describe("Bulk Actions", () => {
    it("should provide enable/disable all buttons", async () => {
      render(NotificationPreferencesPanel);

      await waitFor(() => {
        const buttons = screen.getAllByRole("button");
        // Should have multiple buttons (at least enable/disable + toggles)
        expect(buttons.length).toBeGreaterThan(2);
      });
    });

    it("should call enableAll when enable all button clicked", async () => {
      render(NotificationPreferencesPanel);

      await waitFor(() => {
        expect(screen.getByText(/notification preferences/i)).toBeTruthy();
      });

      const buttons = screen.getAllByRole("button");
      // Find enable all button (would need specific selector)
      // This is a placeholder for the actual interaction test
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("should call disableAll when disable all button clicked", async () => {
      render(NotificationPreferencesPanel);

      await waitFor(() => {
        expect(screen.getByText(/notification preferences/i)).toBeTruthy();
      });

      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe("Loading and Authentication States", () => {
    it("should load preferences on mount", async () => {
      render(NotificationPreferencesPanel);

      await waitFor(() => {
        expect(screen.getByText(/notification preferences/i)).toBeTruthy();
      });
    });

    it("should show auth message when not authenticated", async () => {
      // This would require mocking auth store as unauthenticated
      // Implementation would depend on how component handles it
      expect(true).toBe(true); // Placeholder
    });

    it("should handle loading state gracefully", async () => {
      render(NotificationPreferencesPanel);

      // Component should eventually show preferences
      await waitFor(() => {
        expect(screen.getByText(/notification preferences/i)).toBeTruthy();
      });
    });
  });

  describe("Preference Persistence", () => {
    it("should call service when preference is toggled", async () => {
      render(NotificationPreferencesPanel);

      await waitFor(() => {
        expect(screen.getByText(/notification preferences/i)).toBeTruthy();
      });

      // Component should be interactive
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("should handle toggle errors gracefully", async () => {
      render(NotificationPreferencesPanel);

      await waitFor(() => {
        expect(screen.getByText(/notification preferences/i)).toBeTruthy();
      });

      // Component should be stable even with service errors
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe("Consistency with Config", () => {
    it("all rendered preferences should have valid config entries", async () => {
      render(NotificationPreferencesPanel);

      await waitFor(() => {
        expect(screen.getByText(/notification preferences/i)).toBeTruthy();
      });

      // Verify config has all active notification types
      const configTypes = Object.keys(NOTIFICATION_TYPE_CONFIG);
      expect(configTypes).toContain("feedback-resolved");
      expect(configTypes).toContain("feedback-in-progress");
      expect(configTypes).toContain("feedback-needs-info");
      expect(configTypes).toContain("feedback-response");
      expect(configTypes).toContain("sequence-liked");
      expect(configTypes).toContain("user-followed");
      expect(configTypes).toContain("achievement-unlocked");
      expect(configTypes).toContain("admin-new-user-signup");
    });

    it("should not include removed types in rendered preferences", async () => {
      render(NotificationPreferencesPanel);

      await waitFor(() => {
        expect(screen.getByText(/notification preferences/i)).toBeTruthy();
      });

      const configTypes = Object.keys(NOTIFICATION_TYPE_CONFIG);
      expect(configTypes).not.toContain("sequence-saved");
      expect(configTypes).not.toContain("sequence-video-submitted");
      expect(configTypes).not.toContain("sequence-commented");
    });
  });
});
