/**
 * LeaderboardService
 * Service implementation for leaderboard data and rankings
 */

import { injectable } from "inversify";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { firestore } from "$shared/auth/firebase";
import type { ILeaderboardService } from "../contracts/ILeaderboardService";
import type {
  LeaderboardCategory,
  LeaderboardData,
  LeaderboardEntry,
  LeaderboardQueryOptions,
  RankHistoryEntry,
} from "../../domain/models/leaderboard-models";

@injectable()
export class LeaderboardService implements ILeaderboardService {
  constructor() {}

  /**
   * Map Firestore user data to LeaderboardEntry
   */
  private mapToLeaderboardEntry(
    doc: any,
    rank: number,
    category: LeaderboardCategory,
    currentUserId?: string
  ): LeaderboardEntry {
    const data = doc.data();
    const userId = doc.id;

    // Get the metric value based on category
    let totalXP: number | undefined;
    let currentLevel: number | undefined;
    let sequenceCount: number | undefined;
    let achievementCount: number | undefined;
    let currentStreak: number | undefined;
    let longestStreak: number | undefined;

    switch (category) {
      case "xp":
        totalXP = data.totalXP || 0;
        currentLevel = data.currentLevel;
        break;
      case "level":
        currentLevel = data.currentLevel || 0;
        totalXP = data.totalXP;
        break;
      case "sequences":
        sequenceCount = data.sequenceCount || 0;
        break;
      case "achievements":
        achievementCount = data.achievementCount || 0;
        break;
      case "streak":
        currentStreak = data.currentStreak || 0;
        longestStreak = data.longestStreak || 0;
        break;
    }

    return {
      rank,
      userId,
      displayName: data.displayName || "Unknown User",
      username: data.username || userId,
      avatar: data.photoURL || data.avatar,
      totalXP,
      currentLevel,
      sequenceCount,
      achievementCount,
      currentStreak,
      longestStreak,
      isCurrentUser: userId === currentUserId,
      tier:
        rank === 1 ? "gold" : rank === 2 ? "silver" : rank === 3 ? "bronze" : undefined,
    };
  }

  /**
   * Get field name for ordering based on category
   */
  private getOrderByField(category: LeaderboardCategory): string {
    switch (category) {
      case "xp":
        return "totalXP";
      case "level":
        return "currentLevel";
      case "sequences":
        return "sequenceCount";
      case "achievements":
        return "achievementCount";
      case "streak":
        return "currentStreak";
    }
  }

  async getLeaderboard(
    category: LeaderboardCategory,
    options?: LeaderboardQueryOptions
  ): Promise<LeaderboardData> {
    try {
      const auth = getAuth();
      const currentUserId = auth.currentUser?.uid;

      const limitCount = options?.limit || 100;
      const orderByField = this.getOrderByField(category);

      // Query users collection ordered by the relevant metric
      const usersRef = collection(firestore, "users");
      const q = query(usersRef, orderBy(orderByField, "desc"), limit(limitCount));

      const snapshot = await getDocs(q);

      const entries: LeaderboardEntry[] = [];
      let currentUserRank: number | undefined;
      let rank = (options?.offset || 0) + 1;

      snapshot.forEach((doc) => {
        const entry = this.mapToLeaderboardEntry(doc, rank, category, currentUserId);
        entries.push(entry);

        if (entry.isCurrentUser) {
          currentUserRank = rank;
        }

        rank++;
      });

      return {
        category,
        entries,
        currentUserRank,
        totalUsers: snapshot.size,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error("LeaderboardService: Error fetching leaderboard", error);
      throw new Error(`Failed to fetch ${category} leaderboard`);
    }
  }

  async getCurrentUserRank(category: LeaderboardCategory): Promise<number | null> {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return null;
      }

      const orderByField = this.getOrderByField(category);

      // Get all users ordered by the metric
      const usersRef = collection(firestore, "users");
      const q = query(usersRef, orderBy(orderByField, "desc"));
      const snapshot = await getDocs(q);

      let rank = 1;
      for (const doc of snapshot.docs) {
        if (doc.id === currentUser.uid) {
          return rank;
        }
        rank++;
      }

      return null;
    } catch (error) {
      console.error(
        "LeaderboardService: Error fetching current user rank",
        error
      );
      return null;
    }
  }

  subscribeToLeaderboard(
    category: LeaderboardCategory,
    callback: (data: LeaderboardData) => void,
    options?: LeaderboardQueryOptions
  ): () => void {
    try {
      const auth = getAuth();
      const currentUserId = auth.currentUser?.uid;

      const limitCount = options?.limit || 100;
      const orderByField = this.getOrderByField(category);

      const usersRef = collection(firestore, "users");
      const q = query(usersRef, orderBy(orderByField, "desc"), limit(limitCount));

      const unsubscribe: Unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const entries: LeaderboardEntry[] = [];
          let currentUserRank: number | undefined;
          let rank = (options?.offset || 0) + 1;

          snapshot.forEach((doc) => {
            const entry = this.mapToLeaderboardEntry(
              doc,
              rank,
              category,
              currentUserId
            );
            entries.push(entry);

            if (entry.isCurrentUser) {
              currentUserRank = rank;
            }

            rank++;
          });

          const leaderboardData: LeaderboardData = {
            category,
            entries,
            currentUserRank,
            totalUsers: snapshot.size,
            lastUpdated: new Date(),
          };

          callback(leaderboardData);
        },
        (error) => {
          console.error(
            "LeaderboardService: Error in leaderboard subscription",
            error
          );
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error(
        "LeaderboardService: Error subscribing to leaderboard",
        error
      );
      return () => {};
    }
  }

  async getRankHistory(
    userId: string,
    category: LeaderboardCategory,
    period: "day" | "week" | "month"
  ): Promise<RankHistoryEntry[]> {
    // TODO: Implement rank history tracking
    // This would require a separate collection to track historical rank data
    console.warn("LeaderboardService: getRankHistory not yet implemented");
    return [];
  }

  async refreshLeaderboard(category: LeaderboardCategory): Promise<void> {
    // Refresh is handled automatically by Firestore real-time listeners
    // This method could be used to trigger cache invalidation if needed
    console.log(`LeaderboardService: Refreshing ${category} leaderboard`);
  }
}
