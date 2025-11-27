/**
 * User Service Implementation
 *
 * Fetches user data from Firebase Firestore with gamification data and social features.
 * Includes follow/unfollow functionality with atomic Firestore transactions.
 */

import { injectable } from "inversify";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  type Timestamp,
  type DocumentData,
} from "firebase/firestore";
import { firestore } from "$shared/auth/firebase";
import { getUserAchievementsPath } from "$shared/gamification/data/firestore-collections";
import { ALL_ACHIEVEMENTS } from "$shared/gamification/domain/constants";
import type {
  Achievement,
  UserAchievement,
} from "$shared/gamification/domain/models";
import type { IUserService } from "../contracts/IUserService";
import type {
  EnhancedUserProfile,
  UserProfile,
  CreatorQueryOptions,
} from "../../domain/models/enhanced-user-profile";

/**
 * Type definition for Firestore user document data
 */
interface FirestoreUserData extends DocumentData {
  displayName?: string;
  name?: string;
  username?: string;
  email?: string;
  photoURL?: string;
  avatar?: string;
  sequenceCount?: number;
  collectionCount?: number;
  followerCount?: number;
  followingCount?: number;
  createdAt?: Timestamp;
  totalXP?: number;
  currentLevel?: number;
  achievementCount?: number;
  currentStreak?: number;
  longestStreak?: number;
  isFeatured?: boolean;
  bio?: string;
}

/**
 * Follow document structure in Firestore
 */
interface FollowDocument {
  createdAt: Timestamp;
}

@injectable()
export class UserService implements IUserService {
  private readonly USERS_COLLECTION = "users";

  // ============================================================================
  // USER PROFILE METHODS
  // ============================================================================

  /**
   * Get enhanced user profile by ID
   */
  async getUserProfile(
    userId: string,
    currentUserId?: string
  ): Promise<EnhancedUserProfile | null> {
    try {
      console.log(`[UserService] Fetching user ${userId}...`);

      const userDocRef = doc(firestore, this.USERS_COLLECTION, userId);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        console.warn(`[UserService] User ${userId} not found`);
        return null;
      }

      // Check follow status if current user is provided
      let isFollowing = false;
      if (currentUserId && currentUserId !== userId) {
        isFollowing = await this.isFollowing(currentUserId, userId);
      }

      const user = await this.mapFirestoreToEnhancedProfile(
        userDoc.id,
        userDoc.data() as FirestoreUserData,
        isFollowing
      );
      console.log(`[UserService] Fetched user ${userId}`);
      return user;
    } catch (error) {
      console.error(`[UserService] Error fetching user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Get multiple enhanced user profiles (for creator browsing)
   */
  async getUsers(
    options?: CreatorQueryOptions,
    currentUserId?: string
  ): Promise<EnhancedUserProfile[]> {
    try {
      console.log("[UserService] Fetching users from Firestore...", options);

      const usersRef = collection(firestore, this.USERS_COLLECTION);
      let q = query(usersRef);

      // Apply limit (default to 100)
      const limitValue = options?.limit ?? 100;
      q = query(q, firestoreLimit(limitValue));

      const querySnapshot = await getDocs(q);

      // Get list of users current user is following (for batch check)
      let followingSet = new Set<string>();
      if (currentUserId) {
        followingSet = await this.getFollowingIds(currentUserId);
      }

      const users: EnhancedUserProfile[] = [];

      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data() as FirestoreUserData;
        const isFollowing =
          currentUserId !== docSnap.id && followingSet.has(docSnap.id);
        const user = await this.mapFirestoreToEnhancedProfile(
          docSnap.id,
          data,
          isFollowing
        );
        if (user) {
          users.push(user);
        }
      }

      // Apply client-side filtering and sorting
      let filteredUsers = this.applyFilters(users, options);
      filteredUsers = this.applySorting(filteredUsers, options);

      console.log(`[UserService] Fetched ${filteredUsers.length} users`);
      return filteredUsers;
    } catch (error) {
      console.error("[UserService] Error fetching users:", error);
      throw error;
    }
  }

  /**
   * Get featured creators
   */
  async getFeaturedCreators(limit = 10): Promise<EnhancedUserProfile[]> {
    return this.getUsers({
      filter: "featured",
      limit,
    });
  }

  /**
   * Subscribe to enhanced user profiles (for creator browsing)
   */
  subscribeToUsers(
    callback: (users: EnhancedUserProfile[]) => void,
    options?: CreatorQueryOptions,
    currentUserId?: string
  ): () => void {
    console.log("[UserService] Setting up real-time user subscription...", options);

    const usersRef = collection(firestore, this.USERS_COLLECTION);
    const limitValue = options?.limit ?? 100;
    const q = query(usersRef, firestoreLimit(limitValue));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        console.log("[UserService] Real-time update received, processing users...");

        // Process async operations without blocking
        void (async () => {
          // Get list of users current user is following
          let followingSet = new Set<string>();
          if (currentUserId) {
            followingSet = await this.getFollowingIds(currentUserId);
          }

          const users: EnhancedUserProfile[] = [];

          for (const docSnap of querySnapshot.docs) {
            const data = docSnap.data() as FirestoreUserData;
            const isFollowing =
              currentUserId !== docSnap.id && followingSet.has(docSnap.id);
            const user = await this.mapFirestoreToEnhancedProfile(
              docSnap.id,
              data,
              isFollowing
            );
            if (user) {
              users.push(user);
            }
          }

          // Apply client-side filtering and sorting
          let filteredUsers = this.applyFilters(users, options);
          filteredUsers = this.applySorting(filteredUsers, options);

          console.log(`[UserService] Real-time update: ${filteredUsers.length} users`);
          callback(filteredUsers);
        })();
      },
      (error) => {
        console.error("[UserService] Real-time subscription error:", error);
      }
    );

    return unsubscribe;
  }

  /**
   * Search users by username or display name
   */
  async searchUsers(
    searchQuery: string,
    limit = 50
  ): Promise<EnhancedUserProfile[]> {
    try {
      const allUsers = await this.getUsers({ limit });
      const lowerQuery = searchQuery.toLowerCase();

      return allUsers.filter(
        (user) =>
          user.username.toLowerCase().includes(lowerQuery) ||
          user.displayName.toLowerCase().includes(lowerQuery)
      );
    } catch (error) {
      console.error("[UserService] Error searching users:", error);
      throw new Error("Failed to search users");
    }
  }

  // ============================================================================
  // FOLLOW FUNCTIONALITY
  // ============================================================================

  /**
   * Follow a user
   * Uses a Firestore transaction to atomically:
   * 1. Create follow document in current user's "following" subcollection
   * 2. Create follow document in target user's "followers" subcollection
   * 3. Increment current user's followingCount
   * 4. Increment target user's followerCount
   */
  async followUser(currentUserId: string, targetUserId: string): Promise<void> {
    if (currentUserId === targetUserId) {
      throw new Error("Users cannot follow themselves");
    }

    console.log(`[UserService] Following: ${currentUserId} -> ${targetUserId}`);

    try {
      await runTransaction(firestore, async (transaction) => {
        // Document references
        const followingRef = doc(
          firestore,
          `${this.USERS_COLLECTION}/${currentUserId}/following/${targetUserId}`
        );
        const followersRef = doc(
          firestore,
          `${this.USERS_COLLECTION}/${targetUserId}/followers/${currentUserId}`
        );
        const currentUserRef = doc(firestore, this.USERS_COLLECTION, currentUserId);
        const targetUserRef = doc(firestore, this.USERS_COLLECTION, targetUserId);

        // Check if already following
        const followingDoc = await transaction.get(followingRef);
        if (followingDoc.exists()) {
          console.log(`[UserService] Already following ${targetUserId}`);
          return; // Already following, no-op
        }

        // Get current counts
        const currentUserDoc = await transaction.get(currentUserRef);
        const targetUserDoc = await transaction.get(targetUserRef);

        if (!currentUserDoc.exists() || !targetUserDoc.exists()) {
          throw new Error("User not found");
        }

        const currentUserData = currentUserDoc.data() as FirestoreUserData;
        const targetUserData = targetUserDoc.data() as FirestoreUserData;

        // Create follow documents
        const followData: FollowDocument = {
          createdAt: serverTimestamp() as Timestamp,
        };

        transaction.set(followingRef, followData);
        transaction.set(followersRef, followData);

        // Update counts
        transaction.update(currentUserRef, {
          followingCount: (currentUserData.followingCount ?? 0) + 1,
        });
        transaction.update(targetUserRef, {
          followerCount: (targetUserData.followerCount ?? 0) + 1,
        });
      });

      console.log(`[UserService] Successfully followed ${targetUserId}`);
    } catch (error) {
      console.error(`[UserService] Error following user:`, error);
      throw new Error("Failed to follow user");
    }
  }

  /**
   * Unfollow a user
   * Uses a Firestore transaction to atomically:
   * 1. Delete follow document from current user's "following" subcollection
   * 2. Delete follow document from target user's "followers" subcollection
   * 3. Decrement current user's followingCount
   * 4. Decrement target user's followerCount
   */
  async unfollowUser(currentUserId: string, targetUserId: string): Promise<void> {
    if (currentUserId === targetUserId) {
      throw new Error("Users cannot unfollow themselves");
    }

    console.log(`[UserService] Unfollowing: ${currentUserId} -> ${targetUserId}`);

    try {
      await runTransaction(firestore, async (transaction) => {
        // Document references
        const followingRef = doc(
          firestore,
          `${this.USERS_COLLECTION}/${currentUserId}/following/${targetUserId}`
        );
        const followersRef = doc(
          firestore,
          `${this.USERS_COLLECTION}/${targetUserId}/followers/${currentUserId}`
        );
        const currentUserRef = doc(firestore, this.USERS_COLLECTION, currentUserId);
        const targetUserRef = doc(firestore, this.USERS_COLLECTION, targetUserId);

        // Check if actually following
        const followingDoc = await transaction.get(followingRef);
        if (!followingDoc.exists()) {
          console.log(`[UserService] Not following ${targetUserId}`);
          return; // Not following, no-op
        }

        // Get current counts
        const currentUserDoc = await transaction.get(currentUserRef);
        const targetUserDoc = await transaction.get(targetUserRef);

        if (!currentUserDoc.exists() || !targetUserDoc.exists()) {
          throw new Error("User not found");
        }

        const currentUserData = currentUserDoc.data() as FirestoreUserData;
        const targetUserData = targetUserDoc.data() as FirestoreUserData;

        // Delete follow documents
        transaction.delete(followingRef);
        transaction.delete(followersRef);

        // Update counts (ensure we don't go below 0)
        transaction.update(currentUserRef, {
          followingCount: Math.max(0, (currentUserData.followingCount ?? 0) - 1),
        });
        transaction.update(targetUserRef, {
          followerCount: Math.max(0, (targetUserData.followerCount ?? 0) - 1),
        });
      });

      console.log(`[UserService] Successfully unfollowed ${targetUserId}`);
    } catch (error) {
      console.error(`[UserService] Error unfollowing user:`, error);
      throw new Error("Failed to unfollow user");
    }
  }

  /**
   * Check if a user is following another user
   */
  async isFollowing(currentUserId: string, targetUserId: string): Promise<boolean> {
    if (currentUserId === targetUserId) {
      return false; // Can't follow yourself
    }

    try {
      const followingRef = doc(
        firestore,
        `${this.USERS_COLLECTION}/${currentUserId}/following/${targetUserId}`
      );
      const followingDoc = await getDoc(followingRef);
      return followingDoc.exists();
    } catch (error) {
      console.error(`[UserService] Error checking follow status:`, error);
      return false;
    }
  }

  /**
   * Get list of users that a user is following
   */
  async getFollowing(userId: string, limit = 50): Promise<UserProfile[]> {
    try {
      const followingRef = collection(
        firestore,
        `${this.USERS_COLLECTION}/${userId}/following`
      );
      const q = query(followingRef, firestoreLimit(limit));
      const querySnapshot = await getDocs(q);

      const users: UserProfile[] = [];
      for (const docSnap of querySnapshot.docs) {
        const userProfile = await this.getUserProfile(docSnap.id);
        if (userProfile) {
          users.push(userProfile);
        }
      }

      return users;
    } catch (error) {
      console.error(`[UserService] Error getting following list:`, error);
      return [];
    }
  }

  /**
   * Get list of users following a user
   */
  async getFollowers(userId: string, limit = 50): Promise<UserProfile[]> {
    try {
      const followersRef = collection(
        firestore,
        `${this.USERS_COLLECTION}/${userId}/followers`
      );
      const q = query(followersRef, firestoreLimit(limit));
      const querySnapshot = await getDocs(q);

      const users: UserProfile[] = [];
      for (const docSnap of querySnapshot.docs) {
        const userProfile = await this.getUserProfile(docSnap.id);
        if (userProfile) {
          users.push(userProfile);
        }
      }

      return users;
    } catch (error) {
      console.error(`[UserService] Error getting followers list:`, error);
      return [];
    }
  }

  /**
   * Subscribe to follow status changes for a specific user relationship
   */
  subscribeToFollowStatus(
    currentUserId: string,
    targetUserId: string,
    callback: (isFollowing: boolean) => void
  ): () => void {
    if (currentUserId === targetUserId) {
      // Can't follow yourself, always return false
      callback(false);
      return () => {};
    }

    const followingRef = doc(
      firestore,
      `${this.USERS_COLLECTION}/${currentUserId}/following/${targetUserId}`
    );

    const unsubscribe = onSnapshot(
      followingRef,
      (docSnap) => {
        callback(docSnap.exists());
      },
      (error) => {
        console.error(`[UserService] Follow status subscription error:`, error);
        callback(false);
      }
    );

    return unsubscribe;
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Get set of user IDs that a user is following (for batch checks)
   */
  private async getFollowingIds(userId: string): Promise<Set<string>> {
    try {
      const followingRef = collection(
        firestore,
        `${this.USERS_COLLECTION}/${userId}/following`
      );
      const querySnapshot = await getDocs(followingRef);
      return new Set(querySnapshot.docs.map((doc) => doc.id));
    } catch (error) {
      console.error(`[UserService] Error getting following IDs:`, error);
      return new Set();
    }
  }

  /**
   * Map Firestore document data to EnhancedUserProfile
   */
  private async mapFirestoreToEnhancedProfile(
    userId: string,
    data: FirestoreUserData,
    isFollowing = false
  ): Promise<EnhancedUserProfile | null> {
    try {
      // Base profile data
      const displayName = data.displayName ?? data.name ?? "Anonymous User";
      const username =
        data.username ?? data.email?.split("@")[0] ?? userId.substring(0, 8);
      const avatar = data.photoURL ?? data.avatar ?? undefined;

      // Get counts from denormalized fields
      const sequenceCount = data.sequenceCount ?? 0;
      const collectionCount = data.collectionCount ?? 0;
      const followerCount = data.followerCount ?? 0;
      const followingCount = data.followingCount ?? 0;

      // Get join date from createdAt timestamp
      const joinedDate = data.createdAt?.toDate() ?? new Date();

      // Gamification data (with fallbacks for users without gamification data)
      const totalXP = data.totalXP ?? 0;
      const currentLevel = data.currentLevel ?? 1;
      const achievementCount = data.achievementCount ?? 0;
      const currentStreak = data.currentStreak ?? 0;
      const longestStreak = data.longestStreak ?? 0;
      const isFeatured = data.isFeatured ?? false;
      const bio = data.bio ?? undefined;

      // Fetch user's actual achievements from subcollection
      const topAchievements = await this.fetchUserTopAchievements(userId);

      return {
        id: userId,
        username,
        displayName,
        avatar,
        email: data.email,
        sequenceCount,
        collectionCount,
        followerCount,
        followingCount,
        joinedDate,
        isFollowing,
        totalXP,
        currentLevel,
        achievementCount,
        currentStreak,
        longestStreak,
        topAchievements,
        isFeatured,
        bio,
      };
    } catch (error) {
      console.error(`[UserService] Error mapping user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Fetch user's top achievements from Firestore subcollection
   * Returns the most recent unlocked achievements (up to 5)
   */
  private async fetchUserTopAchievements(userId: string): Promise<Achievement[]> {
    try {
      // Get user's unlocked achievements from subcollection
      const achievementsPath = getUserAchievementsPath(userId);
      const achievementsRef = collection(firestore, achievementsPath);

      // Query for completed achievements, ordered by unlock date
      const q = query(
        achievementsRef,
        where("isCompleted", "==", true),
        orderBy("unlockedAt", "desc"),
        firestoreLimit(5)
      );

      const querySnapshot = await getDocs(q);
      const achievements: Achievement[] = [];

      // Map user achievements to full achievement details
      for (const docSnap of querySnapshot.docs) {
        const userAch = docSnap.data() as UserAchievement;

        // Find the full achievement details from the master list
        const fullAchievement = ALL_ACHIEVEMENTS.find(
          (ach) => ach.id === userAch.achievementId
        );

        if (fullAchievement) {
          achievements.push(fullAchievement);
        }
      }

      return achievements;
    } catch (error) {
      console.error(
        `[UserService] Error fetching achievements for user ${userId}:`,
        error
      );
      // Return empty array on error so profile still loads
      return [];
    }
  }

  /**
   * Apply filters to user list
   */
  private applyFilters(
    users: EnhancedUserProfile[],
    options?: CreatorQueryOptions
  ): EnhancedUserProfile[] {
    if (!options?.filter || options.filter === "all") {
      return users;
    }

    switch (options.filter) {
      case "featured":
        return users.filter((u) => u.isFeatured);
      case "most-sequences":
        return users.filter((u) => u.sequenceCount > 0);
      case "highest-level":
        return users.filter((u) => u.currentLevel > 1);
      case "most-followers":
        return users.filter((u) => u.followerCount > 0);
      case "newest":
        return users; // Will be sorted by join date
      default:
        return users;
    }
  }

  /**
   * Apply sorting to user list
   */
  private applySorting(
    users: EnhancedUserProfile[],
    options?: CreatorQueryOptions
  ): EnhancedUserProfile[] {
    if (!options?.sortBy) {
      return users;
    }

    const sorted = [...users];

    switch (options.sortBy) {
      case "xp":
        return sorted.sort((a, b) => b.totalXP - a.totalXP);
      case "level":
        return sorted.sort((a, b) => b.currentLevel - a.currentLevel);
      case "sequences":
        return sorted.sort((a, b) => b.sequenceCount - a.sequenceCount);
      case "achievements":
        return sorted.sort((a, b) => b.achievementCount - a.achievementCount);
      case "followers":
        return sorted.sort((a, b) => b.followerCount - a.followerCount);
      case "joinedDate":
        return sorted.sort(
          (a, b) => b.joinedDate.getTime() - a.joinedDate.getTime()
        );
      default:
        return sorted;
    }
  }
}
