import "@testing-library/jest-dom";
import { afterEach, beforeEach, vi } from "vitest";
import {
  createWebApplication,
  setGlobalContainer,
} from "../services/bootstrap";

// Mock browser APIs BEFORE any imports that might use them
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: query === "(pointer: fine)" ? true : false, // Return true for pointer: fine
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Global test setup
beforeEach(async () => {
  // Initialize the DI container for each test
  try {
    await createWebApplication();
  } catch (error) {
    console.warn("Failed to initialize container in test setup:", error);
    // Continue with test execution even if container fails to initialize
    // Some tests might not need the full container
  }
});

afterEach(() => {
  // Clean up the global container after each test
  setGlobalContainer(null);
});

// Mock $app/stores for SvelteKit
vi.mock("$app/stores", () => ({
  page: {
    subscribe: vi.fn(),
  },
  navigating: {
    subscribe: vi.fn(),
  },
  updated: {
    subscribe: vi.fn(),
  },
}));

// Mock $app/environment
vi.mock("$app/environment", () => ({
  browser: false,
  dev: true,
  building: false,
  version: "test",
}));
