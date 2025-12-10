/**
 * UserManagementService
 *
 * Firestore operations for user management with audit logging
 */

import { injectable, inject } from "inversify";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch,
  startAfter,
  getDoc,
} from "firebase/firestore";
import { firestore } from "$lib/shared/auth/firebase";
import { TYPES } from "$lib/shared/inversify/types";
import type { UserRole } from "$lib/shared/auth/domain/models/UserRole";
import type { UserData } from "../../components/user-management/types";
import type { IUserManagementService } from "../contracts/IUserManagementService";
import type { IAuditLogService } from "../contracts/IAuditLogService";

@injectable()
export class UserManagementService implements IUserManagementService {
  constructor(
    @inject(TYPES.IAuditLogService)
    private readonly auditLogService: IAuditLogService
  ) {}
  async loadUsers(
    pageSize: number,
    lastDocId?: string
  ): Promise<{
    users: UserData[];
    lastDocId: string | null;
    hasMore: boolean;
  }> {
    let q = query(
      collection(firestore, "users"),
      orderBy("createdAt", "desc"),
      limit(pageSize)
    );

    if (lastDocId) {
      const lastDocRef = doc(firestore, "users", lastDocId);
      const lastDocSnap = await getDoc(lastDocRef);
      if (lastDocSnap.exists()) {
        q = query(
          collection(firestore, "users"),
          orderBy("createdAt", "desc"),
          startAfter(lastDocSnap),
          limit(pageSize)
        );
      }
    }

    const snapshot = await getDocs(q);
    const users: UserData[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      // Determine role - use new role field if exists, fallback to isAdmin check
      let role: UserRole = "user";
      if (data["role"]) {
        role = data["role"] as UserRole;
      } else if (data["isAdmin"] === true) {
        role = "admin";
      }

      return {
        id: docSnap.id,
        email: data["email"] || "",
        displayName: data["displayName"] || "Unknown User",
        username: data["username"] || "",
        photoURL: data["photoURL"] || null,
        role,
        isAdmin: role === "admin",
        isDisabled: data["isDisabled"] === true,
        createdAt: data["createdAt"]?.toDate() || null,
        updatedAt: data["updatedAt"]?.toDate() || null,
        sequenceCount: data["sequenceCount"] || 0,
        totalXP: data["totalXP"] || 0,
        currentLevel: data["currentLevel"] || 1,
        achievementCount: data["achievementCount"] || 0,
        currentStreak: data["currentStreak"] || 0,
      };
    });

    const lastDoc = snapshot.docs[snapshot.docs.length - 1];

    return {
      users,
      lastDocId: lastDoc?.id || null,
      hasMore: snapshot.docs.length === pageSize,
    };
  }

  async changeRole(userId: string, newRole: UserRole): Promise<void> {
    const userRef = doc(firestore, "users", userId);
    await updateDoc(userRef, {
      role: newRole,
      // Keep isAdmin in sync for backwards compatibility
      isAdmin: newRole === "admin",
    });

    // Log the action
    await this.auditLogService.logAction(
      'role_changed',
      `User role changed to ${newRole}`,
      userId,
      { newRole }
    );
  }

  async toggleDisabled(userId: string, currentlyDisabled: boolean): Promise<void> {
    const userRef = doc(firestore, "users", userId);
    const newState = !currentlyDisabled;
    await updateDoc(userRef, {
      isDisabled: newState,
    });

    // Log the action
    await this.auditLogService.logAction(
      newState ? 'account_disabled' : 'account_enabled',
      `Account ${newState ? 'disabled' : 'enabled'}`,
      userId
    );
  }

  async resetUserData(userId: string): Promise<void> {
    const batch = writeBatch(firestore);

    // Reset user stats
    const userRef = doc(firestore, "users", userId);
    batch.update(userRef, {
      totalXP: 0,
      currentLevel: 1,
      achievementCount: 0,
      currentStreak: 0,
      longestStreak: 0,
    });

    // Delete XP document
    const xpRef = doc(firestore, `users/${userId}/xp/current`);
    batch.delete(xpRef);

    // Delete streak document
    const streakRef = doc(firestore, `users/${userId}/streak/current`);
    batch.delete(streakRef);

    await batch.commit();

    // Log the action
    await this.auditLogService.logAction(
      'user_data_reset',
      'User progression data reset (XP, level, achievements, streaks)',
      userId
    );
  }

  async deleteUser(userId: string): Promise<void> {
    // Just delete the Firestore document
    // Note: This doesn't delete the Firebase Auth user
    await deleteDoc(doc(firestore, "users", userId));

    // Log the action
    await this.auditLogService.logAction(
      'user_deleted',
      'User deleted from system',
      userId
    );
  }
}
