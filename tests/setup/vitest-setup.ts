import "@testing-library/jest-dom";
import { readFileSync } from "fs";
import { Container } from "inversify";
import { resolve } from "path";
import { afterEach, beforeEach, vi } from "vitest";

// Preload CSV data into window for tests
// This allows CsvLoader to use window.csvData instead of trying to fetch files
const diamondCsvPath = resolve(
  __dirname,
  "../../static/DiamondPictographDataframe.csv"
);
const boxCsvPath = resolve(
  __dirname,
  "../../static/BoxPictographDataframe.csv"
);
const letterMappingsPath = resolve(
  __dirname,
  "../../static/data/learn/letter-mappings.json"
);

try {
  const diamondData = readFileSync(diamondCsvPath, "utf-8");
  const boxData = readFileSync(boxCsvPath, "utf-8");
  const letterMappingsData = readFileSync(letterMappingsPath, "utf-8");

  // Inject CSV data into window for test environment
  (globalThis as any).window = (globalThis as any).window || {};
  (globalThis as any).window.csvData = {
    diamondData,
    boxData,
  };

  // Mock fetch for static files
  const originalFetch = globalThis.fetch;
  globalThis.fetch = vi.fn(
    (url: string | URL | Request, init?: RequestInit) => {
      const urlStr = typeof url === "string" ? url : url.toString();

      // Handle letter-mappings.json
      if (urlStr.includes("letter-mappings.json")) {
        return Promise.resolve(
          new Response(letterMappingsData, {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
        );
      }

      // Fall back to original fetch for other URLs
      return originalFetch(url, init);
    }
  ) as any;

  console.log("✅ Preloaded CSV data and mocked fetch for tests");
} catch (error) {
  console.warn("⚠️ Failed to preload test data:", error);
}

// Use vi.hoisted to ensure critical modules are imported and initialized BEFORE any service classes
// This prevents "Cannot read properties of undefined" errors with InversifyJS decorators and enums
// IMPORTANT: vi.hoisted() runs synchronously at module evaluation time, not async
const hoistedModules = await (async () => {
  // Import TYPES first to ensure it's available when service decorators execute
  const typesModule = await import("../../src/lib/shared/inversify/types");
  // Import domain enums that are used in module-level object literals
  await import("../../src/lib/shared/pictograph/grid/domain/enums/grid-enums");
  await import(
    "../../src/lib/shared/pictograph/shared/domain/enums/pictograph-enums"
  );
  await import("../../src/lib/shared/foundation/domain/models/LetterType");
  // Import files that use enums in module-level object literals
  await import(
    "../../src/lib/shared/pictograph/shared/domain/constants/pictograph-constants"
  );
  // Import factory functions that are used by services
  await import(
    "../../src/lib/shared/pictograph/shared/domain/factories/createPictographData"
  );

  // Verify TYPES is properly loaded
  if (!typesModule.TYPES || !typesModule.TYPES.IGifExportService) {
    throw new Error("TYPES module failed to load properly in test setup");
  }

  return typesModule;
})();

// Global Inversify container for tests
let testContainer: Container;

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

// Mock DOM APIs for document
Object.defineProperty(document, "createElement", {
  writable: true,
  value: vi.fn().mockImplementation((tagName: string) => {
    const element = {
      tagName: tagName.toUpperCase(),
      style: {},
      href: "",
      download: "",
      click: vi.fn(),
      appendChild: vi.fn(),
      removeChild: vi.fn(),
      remove: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
    return element;
  }),
});

// Mock document.body if not already available
if (!document.body) {
  Object.defineProperty(document, "body", {
    writable: true,
    value: {
      appendChild: vi.fn(),
      removeChild: vi.fn(),
    },
  });
}

// Mock SvelteKit globals for tests
(globalThis as any).__SVELTEKIT_PAYLOAD__ = {
  data: {},
  nodes: [],
  errors: [],
};

// Global test setup
beforeEach(() => {
  // Initialize a fresh Inversify container for each test
  try {
    testContainer = new Container();
    // Note: Services will need to be registered manually in individual tests
    // as they require the new Inversify configuration
  } catch (error) {
    console.warn(
      "Failed to initialize Inversify container in test setup:",
      error
    );
  }

  // Ensure CSV data is available in window for tests (optional - some tests don't need it)
  if (typeof window !== "undefined" && !window.csvData) {
    try {
      const diamondData = readFileSync(diamondCsvPath, "utf-8");
      const boxData = readFileSync(boxCsvPath, "utf-8");
      (window as any).csvData = {
        diamondData,
        boxData,
      };
    } catch {
      // CSV files not available - tests that need them will fail individually
    }
  }
});

afterEach(() => {
  // Clean up the container after each test
  if (testContainer) {
    void testContainer.unbindAll();
  }
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

// Mock Vite environment variables
vi.mock("$env/dynamic/public", () => ({
  env: {},
}));

vi.mock("$env/static/public", () => ({
  PUBLIC_FIREBASE_API_KEY: "test-api-key",
  PUBLIC_FIREBASE_AUTH_DOMAIN: "test.firebaseapp.com",
  PUBLIC_FIREBASE_PROJECT_ID: "test-project",
  PUBLIC_FIREBASE_STORAGE_BUCKET: "test.appspot.com",
  PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "123456789",
  PUBLIC_FIREBASE_APP_ID: "1:123456789:web:abcdef",
}));

// Mock Firebase to prevent actual initialization
vi.mock("firebase/app", () => ({
  initializeApp: vi.fn(() => ({ name: "[DEFAULT]" })),
  getApps: vi.fn(() => []),
  getApp: vi.fn(() => ({ name: "[DEFAULT]" })),
}));

vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(() => ({
    currentUser: null,
    onAuthStateChanged: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
  })),
  browserLocalPersistence: {},
  indexedDBLocalPersistence: {},
  setPersistence: vi.fn(() => Promise.resolve()),
  signInWithEmailAndPassword: vi.fn(() => Promise.resolve()),
  createUserWithEmailAndPassword: vi.fn(() => Promise.resolve()),
  signOut: vi.fn(() => Promise.resolve()),
  onAuthStateChanged: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(() => Promise.resolve()),
}));

vi.mock("firebase/firestore", () => ({
  initializeFirestore: vi.fn(() => ({
    type: "firestore",
    toJSON: () => ({}),
  })),
  getFirestore: vi.fn(() => ({
    type: "firestore",
    toJSON: () => ({}),
  })),
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  persistentLocalCache: vi.fn(() => ({})),
  persistentMultipleTabManager: vi.fn(() => ({})),
}));

vi.mock("firebase/analytics", () => ({
  getAnalytics: vi.fn(),
  logEvent: vi.fn(),
  isSupported: vi.fn(() => Promise.resolve(false)),
}));

vi.mock("firebase/storage", () => ({
  getStorage: vi.fn(() => ({
    type: "storage",
  })),
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
}));

// Mock SequenceData to avoid loading the entire module graph
vi.mock(
  "../../src/lib/shared/foundation/domain/models/SequenceData",
  async (importOriginal) => {
    // Import the actual implementation to get all exports
    const actual =
      await importOriginal<
        typeof import("../../src/lib/shared/foundation/domain/models/SequenceData")
      >();
    return actual;
  }
);
