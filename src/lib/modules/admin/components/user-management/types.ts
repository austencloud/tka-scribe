/**
 * User Management Types
 *
 * Type definitions for user management components
 */

import type { UserRole } from "$shared/auth/domain/models/UserRole";

/**
 * User data displayed in admin management
 */
export interface UserData {
  id: string;
  email: string;
  displayName: string;
  username: string;
  photoURL: string | null;
  role: UserRole;
  isAdmin: boolean; // Kept for backwards compatibility
  isDisabled?: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
  // Stats
  sequenceCount: number;
  totalXP: number;
  currentLevel: number;
  achievementCount: number;
  currentStreak: number;
}

/**
 * Types of actions that can be performed on users
 */
export type UserActionType = "changeRole" | "toggleDisabled" | "resetData" | "delete";

/**
 * Filter options for user list
 */
export type UserFilterType = "all" | "admins" | "testers" | "premium" | "disabled";

/**
 * Confirmation action data
 */
export interface ConfirmActionData {
  type: UserActionType;
  user: UserData;
  newRole?: UserRole;
}
