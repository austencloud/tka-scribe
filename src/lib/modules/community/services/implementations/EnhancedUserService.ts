/**
 * Enhanced User Service Implementation
 *
 * Fetches user data from Firebase Firestore with gamification data.
 * Migrated from explore/community/UserExploreService
 */

import { injectable } from "inversify";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  onSnapshot,
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
import type { IEnhancedUserService } from "../contracts/IEnhancedUserService";
import type {
  EnhancedUserProfile,
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

@injectable()
export class EnhancedUserService implements IEnhancedUserService {
  private readonly USERS_COLLECTION = "users";

  /**
   * Get enhanced user profile by ID
   */
  async getEnhancedUserProfile(
    userId: string
  ): Promise<EnhancedUserProfile | null> {
    try {
      console.log(`🔍 [EnhancedUserService] Fetching user ${userId}...`);

      const userDocRef = doc(firestore, this.USERS_COLLECTION, userId);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        console.warn(`⚠️ [EnhancedUserService] User ${userId} not found`);
        return null;
      }

      const user = await this.mapFirestoreToEnhancedProfile(
        userDoc.id,
        userDoc.data() as FirestoreUserData
      );
      console.log(`✅ [EnhancedUserService] Fetched user ${userId}`);
      return user;
    } catch (error) {
      console.error(
        `❌ [EnhancedUserService] Error fetching user ${userId}:`,
        error
      );
      return null;
    }
  }

  /**
   * Get multiple enhanced user profiles (for creator browsing)
   */
  async getEnhancedUsers(
    options?: CreatorQueryOptions
  ): Promise<EnhancedUserProfile[]> {
    try {
      console.log(
        "🔍 [EnhancedUserService] Fetching enhanced users from Firestore...",
        options
      );

      const usersRef = collection(firestore, this.USERS_COLLECTION);
      let q = query(usersRef);

      // Apply limit (default to 100)
      const limitValue = options?.limit ?? 100;
      q = query(q, firestoreLimit(limitValue));

      const querySnapshot = await getDocs(q);
      const users: EnhancedUserProfile[] = [];

      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data() as FirestoreUserData;
        const user = await this.mapFirestoreToEnhancedProfile(docSnap.id, data);
        if (user) {
          users.push(user);
        }
      }

      // Apply client-side filtering and sorting
      let filteredUsers = this.applyFilters(users, options);
      filteredUsers = this.applySorting(filteredUsers, options);

      console.log(
        `✅ [EnhancedUserService] Fetched ${filteredUsers.length} users`
      );
      return filteredUsers;
    } catch (error) {
      console.error("❌ [EnhancedUserService] Error fetching users:", error);
      throw error;
    }
  }

  /**
   * Get featured creators
   */
  async getFeaturedCreators(limit = 10): Promise<EnhancedUserProfile[]> {
    return this.getEnhancedUsers({
      filter: "featured",
      limit,
    });
  }

  /**
   * Subscribe to enhanced user profiles (for creator browsing)
   */
  subscribeToEnhancedUsers(
    callback: (users: EnhancedUserProfile[]) => void,
    options?: CreatorQueryOptions
  ): () => void {
    console.log(
      "🔔 [EnhancedUserService] Setting up real-time user subscription...",
      options
    );

    const usersRef = collection(firestore, this.USERS_COLLECTION);
    const limitValue = options?.limit ?? 100;
    const q = query(usersRef, firestoreLimit(limitValue));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        console.log(
          "🔄 [EnhancedUserService] Real-time update received, processing users..."
        );

        // Process async operations without blocking
        void (async () => {
          const users: EnhancedUserProfile[] = [];

          for (const docSnap of querySnapshot.docs) {
            const data = docSnap.data() as FirestoreUserData;
            const user = await this.mapFirestoreToEnhancedProfile(
              docSnap.id,
              data
            );
            if (user) {
              users.push(user);
            }
          }

          // Apply client-side filtering and sorting
          let filteredUsers = this.applyFilters(users, options);
          filteredUsers = this.applySorting(filteredUsers, options);

          console.log(
            `✅ [EnhancedUserService] Real-time update: ${filteredUsers.length} users`
          );
          callback(filteredUsers);
        })();
      },
      (error) => {
        console.error(
          "❌ [EnhancedUserService] Real-time subscription error:",
          error
        );
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
      const allUsers = await this.getEnhancedUsers({ limit });
      const query = searchQuery.toLowerCase();

      return allUsers.filter(
        (user) =>
          user.username.toLowerCase().includes(query) ||
          user.displayName.toLowerCase().includes(query)
      );
    } catch (error) {
      console.error("❌ [EnhancedUserService] Error searching users:", error);
      throw new Error("Failed to search users");
    }
  }

  /**
   * Map Firestore document data to EnhancedUserProfile
   */
  private async mapFirestoreToEnhancedProfile(
    userId: string,
    data: FirestoreUserData
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
        isFollowing: false, // TODO: Implement following logic
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
      console.error(
        `❌ [EnhancedUserService] Error mapping user ${userId}:`,
        error
      );
      return null;
    }
  }

  /**
   * Fetch user's top achievements from Firestore subcollection
   * Returns the most recent unlocked achievements (up to 5)
   */
  private async fetchUserTopAchievements(
    userId: string
  ): Promise<Achievement[]> {
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

      console.log(
        `✅ [EnhancedUserService] Fetched ${achievements.length} achievements for user ${userId}`
      );

      return achievements;
    } catch (error) {
      console.error(
        `❌ [EnhancedUserService] Error fetching achievements for user ${userId}:`,
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
