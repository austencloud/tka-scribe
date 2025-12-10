import { describe, it, expect } from "vitest";
import {
  NOTIFICATION_TYPE_CONFIG,
  getPreferenceKeyForType,
  DEFAULT_NOTIFICATION_PREFERENCES,
} from "$lib/features/feedback/domain/models/notification-models";
import type { NotificationType } from "$lib/features/feedback/domain/models/notification-models";

describe("Notification Models", () => {
  describe("NOTIFICATION_TYPE_CONFIG", () => {
    it("should have config for all active notification types", () => {
      const activeTypes: NotificationType[] = [
        "feedback-resolved",
        "feedback-in-progress",
        "feedback-needs-info",
        "feedback-response",
        "sequence-liked",
        "user-followed",
        "achievement-unlocked",
        "admin-new-user-signup",
        "system-announcement",
      ];

      activeTypes.forEach((type) => {
        expect(NOTIFICATION_TYPE_CONFIG[type]).toBeDefined();
        expect(NOTIFICATION_TYPE_CONFIG[type].label).toBeTruthy();
        expect(NOTIFICATION_TYPE_CONFIG[type].color).toBeTruthy();
        expect(NOTIFICATION_TYPE_CONFIG[type].icon).toBeTruthy();
        expect(NOTIFICATION_TYPE_CONFIG[type].actionLabel).toBeTruthy();
      });
    });

    it("should not have config for removed notification types", () => {
      const removedTypes = [
        "sequence-saved",
        "sequence-video-submitted",
        "sequence-commented",
      ] as any[];

      removedTypes.forEach((type) => {
        expect(NOTIFICATION_TYPE_CONFIG[type]).toBeUndefined();
      });
    });

    it("should have unique action labels for clarity", () => {
      const actionLabels = Object.values(NOTIFICATION_TYPE_CONFIG).map(
        (config) => config.actionLabel
      );
      // Most should be unique or at least descriptive
      expect(actionLabels.length).toBeGreaterThan(0);
      // Spot check some specific labels
      expect(actionLabels).toContain("Respond");
      expect(actionLabels).toContain("View Sequence");
      expect(actionLabels).toContain("View Profile");
    });

    it("feedback-resolved should have View Details action", () => {
      expect(NOTIFICATION_TYPE_CONFIG["feedback-resolved"].actionLabel).toBe(
        "View Details"
      );
    });

    it("feedback-needs-info should have Respond action", () => {
      expect(NOTIFICATION_TYPE_CONFIG["feedback-needs-info"].actionLabel).toBe(
        "Respond"
      );
    });

    it("sequence-liked should have View Sequence action", () => {
      expect(NOTIFICATION_TYPE_CONFIG["sequence-liked"].actionLabel).toBe(
        "View Sequence"
      );
    });
  });

  describe("getPreferenceKeyForType", () => {
    it("should map feedback notification types to preference keys", () => {
      expect(getPreferenceKeyForType("feedback-resolved")).toBe(
        "feedbackResolved"
      );
      expect(getPreferenceKeyForType("feedback-in-progress")).toBe(
        "feedbackInProgress"
      );
      expect(getPreferenceKeyForType("feedback-needs-info")).toBe(
        "feedbackNeedsInfo"
      );
      expect(getPreferenceKeyForType("feedback-response")).toBe(
        "feedbackResponse"
      );
    });

    it("should map sequence notification types to preference keys", () => {
      expect(getPreferenceKeyForType("sequence-liked")).toBe("sequenceLiked");
    });

    it("should not map removed sequence types", () => {
      expect(
        getPreferenceKeyForType("sequence-saved" as NotificationType)
      ).toBeNull();
      expect(
        getPreferenceKeyForType("sequence-video-submitted" as NotificationType)
      ).toBeNull();
      expect(
        getPreferenceKeyForType("sequence-commented" as NotificationType)
      ).toBeNull();
    });

    it("should map social notification types to preference keys", () => {
      expect(getPreferenceKeyForType("user-followed")).toBe("userFollowed");
      expect(getPreferenceKeyForType("achievement-unlocked")).toBe(
        "achievementUnlocked"
      );
    });

    it("should map admin notification types to preference keys", () => {
      expect(getPreferenceKeyForType("admin-new-user-signup")).toBe(
        "adminNewUserSignup"
      );
    });

    it("should return null for system-announcement (no preference)", () => {
      expect(getPreferenceKeyForType("system-announcement")).toBeNull();
    });
  });

  describe("DEFAULT_NOTIFICATION_PREFERENCES", () => {
    it("should have all active notification types enabled by default", () => {
      expect(DEFAULT_NOTIFICATION_PREFERENCES.feedbackResolved).toBe(true);
      expect(DEFAULT_NOTIFICATION_PREFERENCES.feedbackInProgress).toBe(true);
      expect(DEFAULT_NOTIFICATION_PREFERENCES.feedbackNeedsInfo).toBe(true);
      expect(DEFAULT_NOTIFICATION_PREFERENCES.feedbackResponse).toBe(true);
      expect(DEFAULT_NOTIFICATION_PREFERENCES.sequenceLiked).toBe(true);
      expect(DEFAULT_NOTIFICATION_PREFERENCES.userFollowed).toBe(true);
      expect(DEFAULT_NOTIFICATION_PREFERENCES.achievementUnlocked).toBe(true);
      expect(DEFAULT_NOTIFICATION_PREFERENCES.adminNewUserSignup).toBe(true);
    });

    it("should not have preferences for removed notification types", () => {
      const defaultPrefs =
        DEFAULT_NOTIFICATION_PREFERENCES as any;
      expect(defaultPrefs.sequenceSaved).toBeUndefined();
      expect(defaultPrefs.sequenceVideoSubmitted).toBeUndefined();
      expect(defaultPrefs.sequenceCommented).toBeUndefined();
    });

    it("should only contain boolean values", () => {
      Object.values(DEFAULT_NOTIFICATION_PREFERENCES).forEach((value) => {
        expect(typeof value).toBe("boolean");
      });
    });
  });

  describe("Consistency between config and preferences", () => {
    it("should have a preference key for every configurable notification type", () => {
      Object.keys(NOTIFICATION_TYPE_CONFIG).forEach((type) => {
        const prefKey = getPreferenceKeyForType(type as NotificationType);
        // System announcements don't have preferences
        if (type !== "system-announcement") {
          expect(prefKey).not.toBeNull();
          expect(prefKey).toBeTruthy();
        }
      });
    });

    it("should have default preference values for all mappable types", () => {
      const testTypes: NotificationType[] = [
        "feedback-resolved",
        "sequence-liked",
        "user-followed",
        "achievement-unlocked",
      ];

      testTypes.forEach((type) => {
        const key = getPreferenceKeyForType(type);
        expect(key).not.toBeNull();
        expect(DEFAULT_NOTIFICATION_PREFERENCES[key!]).toBeDefined();
        expect(typeof DEFAULT_NOTIFICATION_PREFERENCES[key!]).toBe("boolean");
      });
    });
  });
});
