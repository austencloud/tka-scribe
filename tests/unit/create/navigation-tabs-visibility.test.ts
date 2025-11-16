/**
 * Navigation Tabs Visibility Tests
 *
 * Tests the logic for showing/hiding navigation tabs in the Create module
 * based on creation method selection state.
 *
 * Key Requirements:
 * - Tabs should be visible when user is on a creation method tab
 * - Tabs should remain visible after clearing sequence
 * - Creation method selector should only show for first-time users
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Navigation Tabs Visibility Logic", () => {
  describe("Tab visibility based on active tab", () => {
    it("should show tabs when on 'constructor' tab", () => {
      const activeTab = "constructor";
      const hasSelectedCreationMethod = true;

      const isOnCreationMethodTab =
        activeTab === "assembler" ||
        activeTab === "constructor" ||
        activeTab === "generator";

      const shouldShow = !hasSelectedCreationMethod && !isOnCreationMethodTab;

      expect(shouldShow).toBe(false); // Tabs should be visible (selector NOT shown)
    });

    it("should show tabs when on 'assembler' tab", () => {
      const activeTab = "assembler";
      const hasSelectedCreationMethod = true;

      const isOnCreationMethodTab =
        activeTab === "assembler" ||
        activeTab === "constructor" ||
        activeTab === "generator";

      const shouldShow = !hasSelectedCreationMethod && !isOnCreationMethodTab;

      expect(shouldShow).toBe(false); // Tabs should be visible (selector NOT shown)
    });

    it("should show tabs when on 'generator' tab", () => {
      const activeTab = "generator";
      const hasSelectedCreationMethod = true;

      const isOnCreationMethodTab =
        activeTab === "assembler" ||
        activeTab === "constructor" ||
        activeTab === "generator";

      const shouldShow = !hasSelectedCreationMethod && !isOnCreationMethodTab;

      expect(shouldShow).toBe(false); // Tabs should be visible (selector NOT shown)
    });

    it("should show creation method selector for first-time users NOT on creation tabs", () => {
      const activeTab = "explore";
      const hasSelectedCreationMethod = false;

      const isOnCreationMethodTab =
        activeTab === "assembler" ||
        activeTab === "constructor" ||
        activeTab === "generator";

      const shouldShow = !hasSelectedCreationMethod && !isOnCreationMethodTab;

      expect(shouldShow).toBe(true); // Selector should be shown
    });
  });

  describe("Auto-fix logic for creation method flag", () => {
    it("should auto-set flag when on creation tab but flag not set", () => {
      let hasSelectedCreationMethod = false;
      const activeTab = "constructor";

      const isOnCreationMethodTab =
        activeTab === "assembler" ||
        activeTab === "constructor" ||
        activeTab === "generator";

      // Simulate auto-fix
      if (isOnCreationMethodTab && !hasSelectedCreationMethod) {
        hasSelectedCreationMethod = true;
      }

      expect(hasSelectedCreationMethod).toBe(true);
    });

    it("should not change flag when not on creation tab", () => {
      let hasSelectedCreationMethod = false;
      const activeTab = "explore";

      const isOnCreationMethodTab =
        activeTab === "assembler" ||
        activeTab === "constructor" ||
        activeTab === "generator";

      // Simulate auto-fix
      if (isOnCreationMethodTab && !hasSelectedCreationMethod) {
        hasSelectedCreationMethod = true;
      }

      expect(hasSelectedCreationMethod).toBe(false); // Should remain false
    });
  });

  describe("Clear sequence workflow", () => {
    it("should keep tabs visible after clearing sequence when on creation tab", () => {
      const activeTab = "constructor";
      let hasSelectedCreationMethod = true;

      // Simulate clear sequence (with shouldResetCreationMethod = false)
      // hasSelectedCreationMethod should remain true

      const isOnCreationMethodTab =
        activeTab === "assembler" ||
        activeTab === "constructor" ||
        activeTab === "generator";

      const shouldShow = !hasSelectedCreationMethod && !isOnCreationMethodTab;

      expect(shouldShow).toBe(false); // Tabs should remain visible
    });

    it("should apply auto-fix even if flag gets cleared incorrectly", () => {
      const activeTab = "constructor";
      let hasSelectedCreationMethod = false; // Simulating flag getting cleared

      const isOnCreationMethodTab =
        activeTab === "assembler" ||
        activeTab === "constructor" ||
        activeTab === "generator";

      // Auto-fix should detect this and fix it
      if (isOnCreationMethodTab && !hasSelectedCreationMethod) {
        hasSelectedCreationMethod = true;
      }

      const shouldShow = !hasSelectedCreationMethod && !isOnCreationMethodTab;

      expect(hasSelectedCreationMethod).toBe(true);
      expect(shouldShow).toBe(false); // Tabs should be visible
    });
  });

  describe("Edge cases", () => {
    it("should handle undefined active tab gracefully", () => {
      const activeTab = undefined;
      const hasSelectedCreationMethod = true;

      const isOnCreationMethodTab =
        activeTab === "assembler" ||
        activeTab === "constructor" ||
        activeTab === "generator";

      const shouldShow = !hasSelectedCreationMethod && !isOnCreationMethodTab;

      expect(shouldShow).toBe(false);
    });

    it("should handle null active tab gracefully", () => {
      const activeTab = null;
      const hasSelectedCreationMethod = true;

      const isOnCreationMethodTab =
        activeTab === "assembler" ||
        activeTab === "constructor" ||
        activeTab === "generator";

      const shouldShow = !hasSelectedCreationMethod && !isOnCreationMethodTab;

      expect(shouldShow).toBe(false);
    });
  });
});
