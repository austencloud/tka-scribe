/**
 * IUserManagementService
 *
 * Contract for user management operations
 */

import type { UserRole } from "$lib/shared/auth/domain/models/UserRole";
import type { UserData } from "../../components/user-management/types";

export interface IUserManagementService {
  /**
   * Load users from Firestore with pagination
   */
  loadUsers(pageSize: number, lastDocId?: string): Promise<{
    users: UserData[];
    lastDocId: string | null;
    hasMore: boolean;
  }>;

  /**
   * Change a user's role
   */
  changeRole(userId: string, newRole: UserRole): Promise<void>;

  /**
   * Toggle a user's disabled status
   */
  toggleDisabled(userId: string, currentlyDisabled: boolean): Promise<void>;

  /**
   * Reset a user's progress data (XP, achievements, streaks)
   */
  resetUserData(userId: string): Promise<void>;

  /**
   * Delete a user's Firestore document
   */
  deleteUser(userId: string): Promise<void>;
}
