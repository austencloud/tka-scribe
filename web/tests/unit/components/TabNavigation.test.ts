/**
 * ConstructTabNavigation Component Tests
 *
 * Tests for the ConstructTabNavigation component - a pure component that takes props
 */

import ConstructTabNavigation from "$lib/components/construct/ConstructTabNavigation.svelte";
import type { ActiveRightPanel } from "$lib/state/construct-tab-state.svelte";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/svelte";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the transition service
vi.mock(
  "$services/implementations/construct/ConstructTabTransitionService",
  () => ({
    constructTabTransitionService: {
      handleMainTabTransition: vi.fn(),
    },
  })
);

describe("ConstructTabNavigation", () => {
  let mockSetActiveRightPanel: ReturnType<typeof vi.fn>;
  let mockHandleMainTabTransition: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockSetActiveRightPanel = vi.fn();

    // Get the mock function from the mocked module
    const { constructTabTransitionService } = await import(
      "$services/implementations/construct/ConstructTabTransitionService"
    );
    mockHandleMainTabTransition =
      constructTabTransitionService.handleMainTabTransition as ReturnType<
        typeof vi.fn
      >;
  });

  function renderTabNavigation(activePanel: ActiveRightPanel = "build") {
    return render(ConstructTabNavigation, {
      props: {
        activeRightPanel: activePanel,
        setActiveRightPanel: mockSetActiveRightPanel,
      },
    });
  }

  describe("Basic Rendering", () => {
    it("should render all four tab buttons", () => {
      renderTabNavigation();

      const navigation = screen.getByTestId("tab-navigation");
      expect(navigation).toBeInTheDocument();

      const buildButton = screen.getByText("🔨 Build");
      const generateButton = screen.getByText("⚡ Generate");
      const editButton = screen.getByText("🔧 Edit");
      const exportButton = screen.getByText("🔤 Export");

      expect(buildButton).toBeInTheDocument();
      expect(generateButton).toBeInTheDocument();
      expect(editButton).toBeInTheDocument();
      expect(exportButton).toBeInTheDocument();
    });

    it("should have correct CSS classes", () => {
      const { container } = renderTabNavigation();

      const navigation = container.querySelector(".main-tab-navigation");
      expect(navigation).toBeInTheDocument();
      expect(navigation).toHaveClass("main-tab-navigation");

      const buttons = container.querySelectorAll(".main-tab-btn");
      expect(buttons).toHaveLength(4);
      buttons.forEach((button) => {
        expect(button).toHaveClass("main-tab-btn");
      });
    });
  });

  describe("Active State Management", () => {
    it("should mark build tab as active by default", () => {
      renderTabNavigation("build");

      const buildButton = screen.getByText("🔨 Build");
      expect(buildButton).toHaveClass("active");
    });

    it("should mark generate tab as active when selected", () => {
      renderTabNavigation("generate");

      const generateButton = screen.getByText("⚡ Generate");
      expect(generateButton).toHaveClass("active");
    });

    it("should mark edit tab as active when selected", () => {
      renderTabNavigation("edit");

      const editButton = screen.getByText("🔧 Edit");
      expect(editButton).toHaveClass("active");
    });

    it("should mark export tab as active when selected", () => {
      renderTabNavigation("export");

      const exportButton = screen.getByText("🔤 Export");
      expect(exportButton).toHaveClass("active");
    });
  });

  describe("Tab Click Handling", () => {
    it("should call transition service when build tab is clicked", async () => {
      renderTabNavigation("generate");

      const buildButton = screen.getByText("🔨 Build");
      await fireEvent.click(buildButton);

      expect(mockHandleMainTabTransition).toHaveBeenCalledWith(
        "build",
        "generate",
        mockSetActiveRightPanel
      );
    });

    it("should call transition service when generate tab is clicked", async () => {
      renderTabNavigation("build");

      const generateButton = screen.getByText("⚡ Generate");
      await fireEvent.click(generateButton);

      expect(mockHandleMainTabTransition).toHaveBeenCalledWith(
        "generate",
        "build",
        mockSetActiveRightPanel
      );
    });

    it("should call transition service when edit tab is clicked", async () => {
      renderTabNavigation("build");

      const editButton = screen.getByText("🔧 Edit");
      await fireEvent.click(editButton);

      expect(mockHandleMainTabTransition).toHaveBeenCalledWith(
        "edit",
        "build",
        mockSetActiveRightPanel
      );
    });

    it("should call transition service when export tab is clicked", async () => {
      renderTabNavigation("build");

      const exportButton = screen.getByText("🔤 Export");
      await fireEvent.click(exportButton);

      expect(mockHandleMainTabTransition).toHaveBeenCalledWith(
        "export",
        "build",
        mockSetActiveRightPanel
      );
    });
  });

  describe("Keyboard Accessibility", () => {
    it("should handle keyboard navigation", async () => {
      renderTabNavigation("build");

      const generateButton = screen.getByText("⚡ Generate");
      await fireEvent.keyDown(generateButton, { key: "Enter" });

      expect(mockHandleMainTabTransition).toHaveBeenCalledWith(
        "generate",
        "build",
        mockSetActiveRightPanel
      );
    });

    it("should be focusable", () => {
      renderTabNavigation();

      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).toHaveAttribute("type", "button");
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper test id", () => {
      renderTabNavigation();

      const navigation = screen.getByTestId("tab-navigation");
      expect(navigation).toBeInTheDocument();
    });

    it("should have proper button roles", () => {
      renderTabNavigation();

      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(4);
    });
  });
});
