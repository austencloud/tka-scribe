/**
 * User Preview State
 *
 * Comprehensive read-only preview of another user's data for admin debugging.
 * This state holds all user data that can be previewed throughout the app.
 * Components check this state to decide whether to show previewed or actual user data.
 */
import { browser } from "$app/environment";

// ============================================================================
// Types
// ============================================================================

export interface PreviewUserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  username?: string;
  role?: string;
  createdAt?: string;
  lastActivityDate?: string;
}

export interface PreviewGamification {
  totalXP: number;
  currentLevel: number;
  achievementCount: number;
  currentStreak: number;
  longestStreak: number;
}

export interface PreviewSequence {
  id: string;
  name: string;
  word?: string;
  thumbnailUrl?: string;
  createdAt?: string;
  isPublic?: boolean;
  favoriteCount?: number;
}

export interface PreviewCollection {
  id: string;
  name: string;
  description?: string;
  sequenceCount: number;
  isSystem?: boolean;
  createdAt?: string;
}

export interface PreviewAchievement {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  unlockedAt?: string;
}

export interface PreviewNotification {
  id: string;
  type: string;
  title?: string;
  message?: string;
  read?: boolean;
  createdAt?: string;
}

export interface UserPreviewData {
  profile: PreviewUserProfile | null;
  gamification: PreviewGamification | null;
  sequences: PreviewSequence[];
  collections: PreviewCollection[];
  achievements: PreviewAchievement[];
  notifications: PreviewNotification[];
}

export type LazySection =
  | "sequences"
  | "collections"
  | "achievements"
  | "notifications";

interface UserPreviewState {
  isActive: boolean;
  isLoading: boolean;
  loadingSection: string | null;
  error: string | null;
  data: UserPreviewData;
  /** Track which sections have been lazy-loaded */
  loadedSections: Set<LazySection>;
}

// ============================================================================
// State
// ============================================================================

const initialData: UserPreviewData = {
  profile: null,
  gamification: null,
  sequences: [],
  collections: [],
  achievements: [],
  notifications: [],
};

export const userPreviewState = $state<UserPreviewState>({
  isActive: false,
  isLoading: false,
  loadingSection: null,
  error: null,
  data: { ...initialData },
  loadedSections: new Set(),
});

// ============================================================================
// Actions
// ============================================================================

/**
 * Load user preview - initially only loads profile + gamification (lightweight).
 * Other sections are lazy-loaded on demand via loadPreviewSection.
 *
 * @param userId - The user ID to preview
 * @param eager - If true, loads all sections immediately (for backward compat)
 */
export async function loadUserPreview(
  userId: string,
  eager = false
): Promise<void> {
  if (!browser) return;

  userPreviewState.isLoading = true;
  userPreviewState.loadingSection = "profile";
  userPreviewState.error = null;
  userPreviewState.loadedSections = new Set();

  try {
    if (eager) {
      // Legacy behavior: fetch all data at once
      const res = await fetch(
        `/api/preview-user?userId=${encodeURIComponent(userId)}`
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed: ${res.status}`);
      }

      const data = (await res.json()) as UserPreviewData;
      userPreviewState.data = data;
      userPreviewState.loadedSections = new Set([
        "sequences",
        "collections",
        "achievements",
        "notifications",
      ]);
    } else {
      // Lazy mode: only fetch profile + gamification initially
      const res = await fetch(
        `/api/preview-user?userId=${encodeURIComponent(userId)}&sections=profile,gamification`
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed: ${res.status}`);
      }

      const data = (await res.json()) as Partial<UserPreviewData>;
      userPreviewState.data = {
        profile: data.profile ?? null,
        gamification: data.gamification ?? null,
        sequences: [],
        collections: [],
        achievements: [],
        notifications: [],
      };
    }

    userPreviewState.isActive = true;
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to load user preview";
    userPreviewState.error = message;
    userPreviewState.isActive = false;
    userPreviewState.data = { ...initialData };
  } finally {
    userPreviewState.isLoading = false;
    userPreviewState.loadingSection = null;
  }
}

/**
 * Lazy-load a specific section of preview data.
 * Use this when navigating to a view that needs that section.
 *
 * @example
 * // In Library view
 * $effect(() => {
 *   if (preview.isActive && !preview.loadedSections.has("sequences")) {
 *     loadPreviewSection("sequences");
 *   }
 * });
 */
export async function loadPreviewSection(section: LazySection): Promise<void> {
  if (!browser || !userPreviewState.isActive || !userPreviewState.data.profile)
    return;
  if (userPreviewState.loadedSections.has(section)) return; // Already loaded

  const userId = userPreviewState.data.profile.uid;
  userPreviewState.loadingSection = section;

  try {
    const res = await fetch(
      `/api/preview-user?userId=${encodeURIComponent(userId)}&section=${section}`
    );

    if (!res.ok) {
      throw new Error(`Failed to load ${section}`);
    }

    const data = await res.json();

    // Update the requested section
    if (section === "sequences") {
      userPreviewState.data.sequences = data.sequences || [];
    } else if (section === "collections") {
      userPreviewState.data.collections = data.collections || [];
    } else if (section === "achievements") {
      userPreviewState.data.achievements = data.achievements || [];
    } else if (section === "notifications") {
      userPreviewState.data.notifications = data.notifications || [];
    }

    // Mark as loaded
    userPreviewState.loadedSections.add(section);
  } catch (err) {
    console.error(`Failed to load preview ${section}:`, err);
  } finally {
    userPreviewState.loadingSection = null;
  }
}

/**
 * Refresh a specific section of the preview data
 */
export async function refreshPreviewSection(
  section: "sequences" | "collections" | "achievements" | "notifications"
): Promise<void> {
  if (!browser || !userPreviewState.isActive || !userPreviewState.data.profile)
    return;

  const userId = userPreviewState.data.profile.uid;
  userPreviewState.loadingSection = section;

  try {
    const res = await fetch(
      `/api/preview-user?userId=${encodeURIComponent(userId)}&section=${section}`
    );

    if (!res.ok) {
      throw new Error(`Failed to refresh ${section}`);
    }

    const data = await res.json();

    // Update just the requested section
    if (section === "sequences") {
      userPreviewState.data.sequences = data.sequences || [];
    } else if (section === "collections") {
      userPreviewState.data.collections = data.collections || [];
    } else if (section === "achievements") {
      userPreviewState.data.achievements = data.achievements || [];
    } else if (section === "notifications") {
      userPreviewState.data.notifications = data.notifications || [];
    }
  } catch (err) {
    console.error(`Failed to refresh preview ${section}:`, err);
  } finally {
    userPreviewState.loadingSection = null;
  }
}

/**
 * Clear the user preview
 */
export function clearUserPreview(): void {
  userPreviewState.isActive = false;
  userPreviewState.isLoading = false;
  userPreviewState.loadingSection = null;
  userPreviewState.error = null;
  userPreviewState.data = { ...initialData };
  userPreviewState.loadedSections = new Set();
}

/**
 * Check if a section has been loaded
 */
export function isSectionLoaded(section: LazySection): boolean {
  return userPreviewState.loadedSections.has(section);
}

// ============================================================================
// Derived Helpers
// ============================================================================

/**
 * Get the effective user ID (previewed or actual)
 * Use this in components that need to fetch user-specific data
 */
export function getEffectiveUserId(actualUserId: string | null): string | null {
  if (userPreviewState.isActive && userPreviewState.data.profile) {
    return userPreviewState.data.profile.uid;
  }
  return actualUserId;
}

/**
 * Get the effective display name
 */
export function getEffectiveDisplayName(
  actualDisplayName: string | null
): string | null {
  if (userPreviewState.isActive && userPreviewState.data.profile) {
    return userPreviewState.data.profile.displayName;
  }
  return actualDisplayName;
}

/**
 * Get the effective photo URL
 */
export function getEffectivePhotoURL(
  actualPhotoURL: string | null
): string | null {
  if (userPreviewState.isActive && userPreviewState.data.profile) {
    return userPreviewState.data.profile.photoURL;
  }
  return actualPhotoURL;
}

/**
 * Check if the app is in read-only preview mode.
 * Use this to disable write actions (edit, delete, etc.)
 */
export function isPreviewReadOnly(): boolean {
  return userPreviewState.isActive;
}
