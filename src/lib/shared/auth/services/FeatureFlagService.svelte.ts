/**
 * Feature Flag Service
 *
 * Centralized service for managing feature access control.
 * Checks user roles and feature flags to determine access.
 *
 * Usage:
 * - featureFlagService.canAccess('module:animate') // Check feature access
 * - featureFlagService.canAccessModule('animate')  // Check module access
 * - featureFlagService.canAccessTab('create', 'assembler') // Check tab access
 */

import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { firestore } from "../firebase";
import {
  type UserRole,
  type FeatureId,
  type FeatureFlagConfig,
  type UserFeatureOverrides,
  type ModuleFeatureId,
  type TabFeatureId,
  DEFAULT_FEATURE_FLAGS,
  hasRolePrivilege,
  moduleIdToFeatureId,
  tabIdToFeatureId,
} from "../domain";
import type { ModuleId } from "$shared";

/**
 * Global feature flags stored in Firestore
 */
interface GlobalFeatureFlags {
  /** Override configs (partial updates to defaults) */
  overrides: Partial<Record<FeatureId, Partial<FeatureFlagConfig>>>;
  /** Last updated timestamp */
  updatedAt: Date;
  /** Updated by user ID */
  updatedBy: string;
}

// ============================================================================
// REACTIVE STATE (Svelte 5 Runes)
// ============================================================================

interface FeatureFlagState {
  /** Current user's role */
  userRole: UserRole;
  /** User-specific feature overrides */
  userOverrides: UserFeatureOverrides;
  /** Global feature flag overrides from Firestore */
  globalOverrides: Partial<Record<FeatureId, Partial<FeatureFlagConfig>>>;
  /** Whether the service has been initialized */
  initialized: boolean;
  /** Whether currently loading */
  loading: boolean;
}

let _state = $state<FeatureFlagState>({
  userRole: "user",
  userOverrides: {
    enabledFeatures: [],
    disabledFeatures: [],
  },
  globalOverrides: {},
  initialized: false,
  loading: false,
});

// Cleanup functions
let unsubscribeGlobalFlags: (() => void) | null = null;
let unsubscribeUserOverrides: (() => void) | null = null;

// ============================================================================
// PRIVATE HELPERS
// ============================================================================

/**
 * Get the effective feature config (defaults + global overrides)
 */
function getEffectiveFeatureConfig(
  featureId: FeatureId
): FeatureFlagConfig | null {
  const defaultConfig = DEFAULT_FEATURE_FLAGS.find((f) => f.id === featureId);
  if (!defaultConfig) return null;

  const globalOverride = _state.globalOverrides[featureId];
  if (!globalOverride) return defaultConfig;

  return {
    ...defaultConfig,
    ...globalOverride,
  };
}

/**
 * Check if a feature is accessible based on role and overrides
 */
function checkFeatureAccess(featureId: FeatureId): boolean {
  // Check user-specific overrides first
  if (_state.userOverrides.disabledFeatures.includes(featureId)) {
    return false; // Explicitly disabled for this user
  }

  if (_state.userOverrides.enabledFeatures.includes(featureId)) {
    return true; // Explicitly enabled for this user (bypasses role check)
  }

  // Get effective feature config
  const config = getEffectiveFeatureConfig(featureId);
  if (!config) {
    console.warn(`⚠️ [FeatureFlagService] Unknown feature: ${featureId}`);
    return false;
  }

  // Check if globally disabled
  if (!config.enabled) {
    return false;
  }

  // Check role-based access
  return hasRolePrivilege(_state.userRole, config.minimumRole);
}

// ============================================================================
// PUBLIC API
// ============================================================================

export const featureFlagService = {
  // ===== Getters =====

  /** Current user role */
  get userRole(): UserRole {
    return _state.userRole;
  },

  /** Whether the service has been initialized */
  get isInitialized(): boolean {
    return _state.initialized;
  },

  /** Whether currently loading */
  get isLoading(): boolean {
    return _state.loading;
  },

  /** Get all feature configs (with global overrides applied) */
  get featureConfigs(): FeatureFlagConfig[] {
    return DEFAULT_FEATURE_FLAGS.map((defaultConfig) => {
      const override = _state.globalOverrides[defaultConfig.id];
      return override ? { ...defaultConfig, ...override } : defaultConfig;
    });
  },

  // ===== Core Access Checks =====

  /**
   * Check if a feature is accessible to the current user
   */
  canAccess(featureId: FeatureId): boolean {
    return checkFeatureAccess(featureId);
  },

  /**
   * Check if a module is accessible to the current user
   */
  canAccessModule(moduleId: ModuleId): boolean {
    const featureId = moduleIdToFeatureId(moduleId);
    return checkFeatureAccess(featureId);
  },

  /**
   * Check if a tab within a module is accessible to the current user
   * Falls back to module-level access if tab isn't explicitly defined
   */
  canAccessTab(moduleId: ModuleId, tabId: string): boolean {
    // First check if the module itself is accessible
    if (!this.canAccessModule(moduleId)) {
      return false;
    }

    const featureId = tabIdToFeatureId(moduleId, tabId);

    // Check if this specific tab has a feature flag definition
    const config = getEffectiveFeatureConfig(featureId);
    if (!config) {
      // No explicit tab config - inherit from module access (which we already checked above)
      return true;
    }

    return checkFeatureAccess(featureId);
  },

  // ===== Role Checks =====

  /** Check if user is admin */
  get isAdmin(): boolean {
    return _state.userRole === "admin";
  },

  /** Check if user is at least tester level */
  get isTester(): boolean {
    return hasRolePrivilege(_state.userRole, "tester");
  },

  /** Check if user is at least premium level */
  get isPremium(): boolean {
    return hasRolePrivilege(_state.userRole, "premium");
  },

  // ===== Initialization =====

  /**
   * Initialize the feature flag service for a user
   * Call this after authentication is confirmed
   */
  async initialize(userId: string | null): Promise<void> {
    _state.loading = true;

    try {
      // Clean up previous subscriptions
      this.cleanup();

      if (userId) {
        // Fetch user role and overrides
        await this.fetchUserData(userId);

        // Subscribe to real-time updates
        this.subscribeToUserOverrides(userId);
      } else {
        // No user - reset to defaults
        _state.userRole = "user";
        _state.userOverrides = {
          enabledFeatures: [],
          disabledFeatures: [],
        };
      }

      // Subscribe to global feature flags
      this.subscribeToGlobalFlags();

      _state.initialized = true;
    } catch (error) {
      console.error("❌ [FeatureFlagService] Initialization failed:", error);
      // Fall back to defaults
      _state.userRole = "user";
      _state.initialized = true;
    } finally {
      _state.loading = false;
    }
  },

  /**
   * Fetch user data from Firestore
   */
  async fetchUserData(userId: string): Promise<void> {
    try {
      const userDocRef = doc(firestore, `users/${userId}`);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();

        // Get role (backwards compatible with isAdmin)
        if (data["role"]) {
          _state.userRole = data["role"] as UserRole;
        } else if (data["isAdmin"] === true) {
          // Backwards compatibility
          _state.userRole = "admin";
        } else {
          _state.userRole = "user";
        }

        // Get feature overrides
        if (data["featureOverrides"]) {
          _state.userOverrides = {
            enabledFeatures: data["featureOverrides"]["enabledFeatures"] || [],
            disabledFeatures: data["featureOverrides"]["disabledFeatures"] || [],
          };
        }
      }
    } catch (error) {
      console.warn("⚠️ [FeatureFlagService] Failed to fetch user data:", error);
    }
  },

  /**
   * Subscribe to user-specific feature overrides
   */
  subscribeToUserOverrides(userId: string): void {
    const userDocRef = doc(firestore, `users/${userId}`);
    unsubscribeUserOverrides = onSnapshot(
      userDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();

          // Update role
          if (data["role"]) {
            _state.userRole = data["role"] as UserRole;
          } else if (data["isAdmin"] === true) {
            _state.userRole = "admin";
          }

          // Update feature overrides
          if (data["featureOverrides"]) {
            _state.userOverrides = {
              enabledFeatures: data["featureOverrides"]["enabledFeatures"] || [],
              disabledFeatures: data["featureOverrides"]["disabledFeatures"] || [],
            };
          }
        }
      },
      (error) => {
        console.warn(
          "⚠️ [FeatureFlagService] User overrides subscription error:",
          error
        );
      }
    );
  },

  /**
   * Subscribe to global feature flags
   */
  subscribeToGlobalFlags(): void {
    const globalFlagsRef = doc(firestore, "config/featureFlags");
    unsubscribeGlobalFlags = onSnapshot(
      globalFlagsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as GlobalFeatureFlags;
          _state.globalOverrides = data.overrides || {};
        }
      },
      (error) => {
        // Don't warn - config may not exist yet
        console.debug(
          "[FeatureFlagService] Global flags not found (this is normal for new deployments)"
        );
      }
    );
  },

  // ===== Admin Functions =====

  /**
   * Update a user's role (admin only)
   */
  async setUserRole(targetUserId: string, newRole: UserRole): Promise<void> {
    if (!this.isAdmin) {
      throw new Error("Only admins can change user roles");
    }

    const userDocRef = doc(firestore, `users/${targetUserId}`);
    await setDoc(
      userDocRef,
      {
        role: newRole,
        // Keep isAdmin in sync for backwards compatibility
        isAdmin: newRole === "admin",
      },
      { merge: true }
    );
  },

  /**
   * Update a user's feature overrides (admin only)
   */
  async setUserFeatureOverrides(
    targetUserId: string,
    overrides: UserFeatureOverrides
  ): Promise<void> {
    if (!this.isAdmin) {
      throw new Error("Only admins can change user feature overrides");
    }

    const userDocRef = doc(firestore, `users/${targetUserId}`);
    await setDoc(
      userDocRef,
      {
        featureOverrides: overrides,
      },
      { merge: true }
    );
  },

  /**
   * Update global feature flag configuration (admin only)
   */
  async updateGlobalFeatureFlag(
    featureId: FeatureId,
    updates: Partial<FeatureFlagConfig>
  ): Promise<void> {
    if (!this.isAdmin) {
      throw new Error("Only admins can change global feature flags");
    }

    const globalFlagsRef = doc(firestore, "config/featureFlags");
    const currentDoc = await getDoc(globalFlagsRef);
    const currentData = currentDoc.exists()
      ? (currentDoc.data() as GlobalFeatureFlags)
      : { overrides: {} as Partial<Record<FeatureId, Partial<FeatureFlagConfig>>> };

    const currentOverride = currentData.overrides[featureId] ?? {};

    await setDoc(globalFlagsRef, {
      overrides: {
        ...currentData.overrides,
        [featureId]: {
          ...currentOverride,
          ...updates,
        },
      },
      updatedAt: new Date(),
      updatedBy: "admin", // TODO: Get actual user ID
    });
  },

  // ===== Cleanup =====

  /**
   * Clean up subscriptions
   */
  cleanup(): void {
    if (unsubscribeGlobalFlags) {
      unsubscribeGlobalFlags();
      unsubscribeGlobalFlags = null;
    }
    if (unsubscribeUserOverrides) {
      unsubscribeUserOverrides();
      unsubscribeUserOverrides = null;
    }
  },
};
