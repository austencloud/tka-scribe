/**
 * Analytics Data Provider Implementation
 *
 * Fetches analytics data from Firebase Firestore and Activity Logs
 */

import { injectable, inject } from "inversify";
import {
  collection,
  query,
  getDocs,
  getDoc,
  doc,
  orderBy,
  limit,
} from "firebase/firestore";
import { getFirestoreInstance, auth } from "$lib/shared/auth/firebase";
import { TYPES } from "$lib/shared/inversify/types";
import type { ISystemStateManager } from "../contracts/ISystemStateManager";
import type { IActivityLogger } from "$lib/shared/analytics/services/contracts/IActivityLogger";
import type {
  IAnalyticsDataProvider,
  SummaryMetrics,
  UserActivityPoint,
  ContentStatistics,
  TopSequenceData,
  EngagementMetrics,
  AnalyticsTimeRange,
  EventTypeBreakdown,
  ModuleUsageData,
  RecentActivityEvent,
} from "../contracts/IAnalyticsDataProvider";

// Timeout for Firebase queries (10 seconds)
const QUERY_TIMEOUT_MS = 10000;

/**
 * Wrap a promise with a timeout
 */
function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  fallback: T
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => {
      setTimeout(() => resolve(fallback), timeoutMs);
    }),
  ]);
}

@injectable()
export class AnalyticsDataProvider implements IAnalyticsDataProvider {
  constructor(
    @inject(TYPES.ISystemStateManager)
    private readonly systemStateManager: ISystemStateManager,
    @inject(TYPES.IActivityLogger)
    private readonly activityLogService: IActivityLogger
  ) {}

  /**
   * Check if Firebase is properly initialized and user is authenticated
   * Silent check - returns false gracefully without logging
   */
  private async isFirestoreAvailable(): Promise<boolean> {
    try {
      const firestore = await getFirestoreInstance();
      return (
        firestore !== null && firestore !== undefined && auth.currentUser !== null
      );
    } catch {
      // Silent failure - just means Firebase isn't available
      return false;
    }
  }

  /**
   * Get summary metrics
   * Note: Only "Active Today" is time-based. Other metrics are all-time totals
   * since we don't have per-period tracking without Firebase indexes.
   *
   * OPTIMIZED: Uses SystemStateManager for unified data hub
   */
  async getSummaryMetrics(
    _timeRange: AnalyticsTimeRange
  ): Promise<SummaryMetrics> {
    // Return empty metrics if Firebase is not available
    if (!(await this.isFirestoreAvailable())) {
      return this.getEmptySummaryMetrics();
    }

    try {
      // Get all user data from unified system state
      const systemState = await this.systemStateManager.getSystemState();
      const users = systemState.users;
    const totalUsers = users.length;

    // Calculate active users today/yesterday from cached data
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    let activeToday = 0;
    let previousActiveToday = 0;
    let totalSequences = 0;
    let totalChallenges = 0;

    for (const user of users) {
      // Count active users
      if (user.lastActivityDate) {
        if (user.lastActivityDate >= todayStart) {
          activeToday++;
        } else if (user.lastActivityDate >= yesterdayStart) {
          previousActiveToday++;
        }
      }
      // Sum totals
      totalSequences += user.sequenceCount;
      totalChallenges += user.challengesCompleted;
    }

      return {
        totalUsers,
        activeToday,
        sequencesCreated: totalSequences,
        challengesCompleted: totalChallenges,
        // No historical comparison available for these metrics
        previousTotalUsers: totalUsers,
        previousActiveToday,
        previousSequencesCreated: totalSequences,
        previousChallengesCompleted: totalChallenges,
      };
    } catch (error) {
      console.error("[AnalyticsDataProvider] Failed to get summary metrics:", error);
      return this.getEmptySummaryMetrics();
    }
  }

  /**
   * Get user activity over time
   * Primary: Uses activity log events for accurate per-day tracking
   * Fallback: Uses lastActivityDate from user documents
   */
  async getUserActivity(
    timeRange: AnalyticsTimeRange
  ): Promise<UserActivityPoint[]> {
    if (!(await this.isFirestoreAvailable())) {
      return [];
    }

    const { startDate, days } = timeRange;

    try {
      // Try to get activity from the activity log service first
      const dailyActiveUsers =
        await this.activityLogService.getDailyActiveUsers(startDate, days);

      // If we got data from activity logs, use it
      if (dailyActiveUsers.size > 0) {
        const activityPoints: UserActivityPoint[] = [];
        for (let i = 0; i < days; i++) {
          const dayDate = new Date(startDate);
          dayDate.setDate(dayDate.getDate() + i);
          const dateKey = dayDate.toISOString().split("T")[0] ?? "";
          activityPoints.push({
            date: dateKey,
            activeUsers: dailyActiveUsers.get(dateKey) ?? 0,
          });
        }
        return activityPoints;
      }

      // Fallback: Use lastActivityDate from user documents
      // This only shows most recent activity day per user
      return this.getUserActivityFromLastActivityDate(startDate, days);
    } catch (error) {
      console.error("Failed to get user activity:", error);
      // Try fallback on error
      return this.getUserActivityFromLastActivityDate(startDate, days);
    }
  }

  /**
   * Fallback method: Get user activity from lastActivityDate field
   * Only shows the most recent day each user was active
   */
  private async getUserActivityFromLastActivityDate(
    startDate: Date,
    days: number
  ): Promise<UserActivityPoint[]> {
    try {
      const firestore = await getFirestoreInstance();
      const usersRef = collection(firestore, "users");
      const snapshot = await withTimeout(
        getDocs(usersRef),
        QUERY_TIMEOUT_MS,
        null
      );

      if (!snapshot || snapshot.empty) {
        return this.getEmptyActivityPoints(startDate, days);
      }

      // Extract lastActivityDate from each user
      const userActivityDates: Date[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const lastActivity = data["lastActivityDate"];
        if (lastActivity) {
          const date = lastActivity.toDate
            ? lastActivity.toDate()
            : new Date(lastActivity);
          userActivityDates.push(date);
        }
      });

      // Create a map of date string -> count
      const activityByDay = new Map<string, number>();

      // Initialize all days in range with 0
      for (let i = 0; i < days; i++) {
        const dayDate = new Date(startDate);
        dayDate.setDate(dayDate.getDate() + i);
        const dateKey = dayDate.toISOString().split("T")[0] ?? "";
        activityByDay.set(dateKey, 0);
      }

      // Count users active on each day
      for (const activityDate of userActivityDates) {
        const dateKey = activityDate.toISOString().split("T")[0] ?? "";
        if (activityByDay.has(dateKey)) {
          activityByDay.set(dateKey, (activityByDay.get(dateKey) ?? 0) + 1);
        }
      }

      // Convert to array of points
      const activityPoints: UserActivityPoint[] = [];
      for (let i = 0; i < days; i++) {
        const dayDate = new Date(startDate);
        dayDate.setDate(dayDate.getDate() + i);
        const dateKey = dayDate.toISOString().split("T")[0] ?? "";
        activityPoints.push({
          date: dateKey,
          activeUsers: activityByDay.get(dateKey) ?? 0,
        });
      }

      return activityPoints;
    } catch (error) {
      console.error(
        "Failed to get user activity from lastActivityDate:",
        error
      );
      return this.getEmptyActivityPoints(startDate, days);
    }
  }

  /**
   * Generate empty activity points for error cases
   */
  private getEmptyActivityPoints(
    startDate: Date,
    days: number
  ): UserActivityPoint[] {
    const activityPoints: UserActivityPoint[] = [];
    for (let i = 0; i < days; i++) {
      const dayDate = new Date(startDate);
      dayDate.setDate(dayDate.getDate() + i);
      const dateKey = dayDate.toISOString().split("T")[0] ?? "";
      activityPoints.push({ date: dateKey, activeUsers: 0 });
    }
    return activityPoints;
  }

  /**
   * Get content statistics
   * OPTIMIZED: Uses SystemStateManager for unified data hub
   */
  async getContentStatistics(): Promise<ContentStatistics> {
    if (!(await this.isFirestoreAvailable())) {
      return {
        totalSequences: 0,
        publicSequences: 0,
        totalViews: 0,
        totalShares: 0,
      };
    }

    const systemState = await this.systemStateManager.getSystemState();
    const users = systemState.users;

    let totalSequences = 0;
    let publicSequences = 0;
    let totalViews = 0;
    let totalShares = 0;

    for (const user of users) {
      totalSequences += user.sequenceCount;
      publicSequences += user.publicSequenceCount;
      totalViews += user.totalViews;
      totalShares += user.shareCount;
    }

    return {
      totalSequences,
      publicSequences,
      totalViews,
      totalShares,
    };
  }

  /**
   * Get top sequences by views
   */
  async getTopSequences(limitCount: number): Promise<TopSequenceData[]> {
    if (!(await this.isFirestoreAvailable())) {
      return [];
    }

    // Try to get top sequences from a sequences collection if it exists
    // Otherwise, aggregate from user data
    try {
      const firestore = await getFirestoreInstance();
      const sequencesRef = collection(firestore, "publicSequences");
      const q = query(
        sequencesRef,
        orderBy("views", "desc"),
        limit(limitCount)
      );
      const snapshot = await withTimeout(getDocs(q), QUERY_TIMEOUT_MS, null);

      if (!snapshot) {
        return [];
      }

      const topSequences: TopSequenceData[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        topSequences.push({
          id: doc.id,
          name: (data["name"] as string) ?? "Untitled",
          word: (data["word"] as string) ?? "",
          views: (data["views"] as number) ?? 0,
          creator:
            (data["creatorName"] as string) ??
            (data["creatorId"] as string) ??
            "Unknown",
        });
      });

      return topSequences;
    } catch {
      // Collection might not exist or have different structure
      // Return empty array - dashboard will show "No data"
      // Silent fail - collection may not exist
      return [];
    }
  }

  /**
   * Get engagement metrics
   * OPTIMIZED: Uses SystemStateManager for unified data hub
   */
  async getEngagementMetrics(): Promise<EngagementMetrics> {
    if (!(await this.isFirestoreAvailable())) {
      return {
        challengeParticipants: 0,
        achievementsUnlocked: 0,
        activeStreaks: 0,
        totalXPEarned: 0,
        totalUsers: 0,
        totalAchievementsPossible: 0,
      };
    }

    const systemState = await this.systemStateManager.getSystemState();
    const users = systemState.users;
    const totalUsers = users.length;

    let challengeParticipants = 0;
    let achievementsUnlocked = 0;
    let activeStreaks = 0;
    let totalXPEarned = 0;

    for (const user of users) {
      // Count users who have completed at least one challenge
      if (user.challengesCompleted > 0) {
        challengeParticipants++;
      }
      // Sum up achievements
      achievementsUnlocked += user.achievementCount;
      // Count users with active streaks
      if (user.currentStreak > 0) {
        activeStreaks++;
      }
      // Sum up XP
      totalXPEarned += user.totalXP;
    }

    // Calculate total possible achievements (10 achievements per user as baseline)
    const totalAchievementsPossible = totalUsers * 10;

    return {
      challengeParticipants,
      achievementsUnlocked,
      activeStreaks,
      totalXPEarned,
      totalUsers,
      totalAchievementsPossible,
    };
  }

  // ============================================================================
  // ACTIVITY EVENT METHODS
  // ============================================================================

  /**
   * Get activity event breakdown by type for the time range
   */
  async getEventTypeBreakdown(
    timeRange: AnalyticsTimeRange
  ): Promise<EventTypeBreakdown[]> {
    if (!(await this.isFirestoreAvailable())) {
      return [];
    }

    try {
      const eventCounts = await this.activityLogService.getEventCounts(
        timeRange.startDate,
        timeRange.endDate
      );

      // Event type to display config mapping
      const eventConfig: Record<string, { label: string; color: string }> = {
        session_start: { label: "Sessions", color: "#10b981" },
        module_view: { label: "Module Views", color: "#3b82f6" },
        sequence_create: { label: "Sequences Created", color: "#8b5cf6" },
        sequence_save: { label: "Sequences Saved", color: "#6366f1" },
        sequence_delete: { label: "Sequences Deleted", color: "#ef4444" },
        sequence_play: { label: "Animations Played", color: "#f59e0b" },
        sequence_export: { label: "Exports", color: "#ec4899" },
        setting_change: { label: "Settings Changed", color: "#64748b" },
      };

      const breakdown: EventTypeBreakdown[] = [];
      for (const [eventType, count] of eventCounts.entries()) {
        const config = eventConfig[eventType] ?? {
          label: this.formatEventTypeLabel(eventType),
          color: "#94a3b8",
        };
        breakdown.push({
          eventType,
          count,
          label: config.label,
          color: config.color,
        });
      }

      // Sort by count descending
      breakdown.sort((a, b) => b.count - a.count);

      return breakdown;
    } catch (error) {
      console.error("Failed to get event type breakdown:", error);
      return [];
    }
  }

  /**
   * Get module usage statistics for the time range
   * Now supports module:tab format (e.g., "create:generator")
   */
  async getModuleUsage(
    timeRange: AnalyticsTimeRange
  ): Promise<ModuleUsageData[]> {
    if (!(await this.isFirestoreAvailable())) {
      return [];
    }

    try {
      // Query for module_view events in the time range
      // Firestore max limit is 10000, but we use 5000 for safety
      const events = await this.activityLogService.queryEvents({
        eventType: "module_view",
        startDate: timeRange.startDate,
        endDate: timeRange.endDate,
        limit: 5000,
      });

      // Count views per module:tab combination
      const moduleCounts = new Map<string, number>();
      for (const event of events) {
        const moduleWithTab = (event.metadata?.module as string) ?? "unknown";
        moduleCounts.set(
          moduleWithTab,
          (moduleCounts.get(moduleWithTab) ?? 0) + 1
        );
      }

      // Module and tab display config
      const moduleConfig: Record<string, { label: string; color: string }> = {
        // Main modules
        create: { label: "Create", color: "#f59e0b" },
        explore: { label: "Discover", color: "#a855f7" },
        learn: { label: "Learn", color: "#3b82f6" },
        library: { label: "Library", color: "#10b981" },
        animate: { label: "Animate", color: "#ec4899" },
        community: { label: "Community", color: "#06b6d4" },
        admin: { label: "Admin", color: "#ffd700" },
        // Create tabs
        "create:constructor": { label: "Create → Construct", color: "#3b82f6" },
        "create:assembler": { label: "Create → Assemble", color: "#8b5cf6" },
        "create:generator": { label: "Create → Generate", color: "#f59e0b" },
        // Learn tabs
        "learn:concepts": { label: "Learn → Concepts", color: "#60a5fa" },
        "learn:play": { label: "Learn → Play", color: "#f472b6" },
        // Discover tabs
        "explore:gallery": { label: "Explore → Gallery", color: "#a855f7" },
        "explore:collections": {
          label: "Explore → Collections",
          color: "#f59e0b",
        },
        // Community tabs
        "community:leaderboards": {
          label: "Community → Leaderboards",
          color: "#fbbf24",
        },
        "community:creators": {
          label: "Community → Creators",
          color: "#06b6d4",
        },
        "community:support": { label: "Community → Support", color: "#ec4899" },
        // Animate tabs
        "animate:single": { label: "Animate → Single", color: "#3b82f6" },
        "animate:tunnel": { label: "Animate → Tunnel", color: "#ec4899" },
        "animate:mirror": { label: "Animate → Mirror", color: "#8b5cf6" },
        "animate:grid": { label: "Animate → Grid", color: "#f59e0b" },
        // Admin tabs
        "admin:analytics": { label: "Admin → Analytics", color: "#3b82f6" },
        "admin:challenges": { label: "Admin → Challenges", color: "#ffd700" },
        "admin:users": { label: "Admin → Users", color: "#10b981" },
        "admin:flags": { label: "Admin → Flags", color: "#8b5cf6" },
        "admin:tools": { label: "Admin → Tools", color: "#f97316" },
      };

      const moduleUsage: ModuleUsageData[] = [];
      for (const [module, views] of moduleCounts.entries()) {
        const config = moduleConfig[module] ?? {
          label: this.formatModuleTabLabel(module),
          color: "#94a3b8",
        };
        moduleUsage.push({
          module,
          views,
          label: config.label,
          color: config.color,
        });
      }

      // Sort by views descending
      moduleUsage.sort((a, b) => b.views - a.views);

      return moduleUsage;
    } catch (error) {
      console.error("Failed to get module usage:", error);
      return [];
    }
  }

  /**
   * Format module:tab string to human-readable label
   */
  private formatModuleTabLabel(moduleTab: string): string {
    const parts = moduleTab.split(":");
    if (parts.length === 2) {
      const modulePart = parts[0];
      const tabPart = parts[1];
      return `${this.capitalizeFirst(modulePart ?? "")} → ${this.capitalizeFirst(tabPart ?? "")}`;
    }
    return this.capitalizeFirst(moduleTab);
  }

  /**
   * Get recent activity events (across all users) with user details
   */
  async getRecentActivity(limitCount: number): Promise<RecentActivityEvent[]> {
    if (!(await this.isFirestoreAvailable())) {
      return [];
    }

    try {
      const events = await this.activityLogService.queryEvents({
        limit: limitCount,
        orderDirection: "desc",
      });

      const filteredEvents = events.filter((event) => event.id !== undefined);

      // Get unique user IDs and fetch their details
      const uniqueUserIds = [...new Set(filteredEvents.map((e) => e.userId))];
      const userDetailsMap = await this.fetchUserDetails(uniqueUserIds);

      return filteredEvents.map((event) => ({
        id: event.id as string,
        eventType: event.eventType,
        category: event.category,
        timestamp: event.timestamp,
        userId: event.userId,
        metadata: event.metadata,
        user: userDetailsMap.get(event.userId),
      }));
    } catch (error) {
      console.error("Failed to get recent activity:", error);
      return [];
    }
  }

  /**
   * Fetch user details for a list of user IDs
   */
  private async fetchUserDetails(
    userIds: string[]
  ): Promise<
    Map<
      string,
      { displayName: string; photoURL: string | null; email: string | null }
    >
  > {
    const userMap = new Map<
      string,
      { displayName: string; photoURL: string | null; email: string | null }
    >();

    if (userIds.length === 0) return userMap;

    try {
      const firestore = await getFirestoreInstance();
      // Fetch user documents in parallel
      const userPromises = userIds.map(async (userId) => {
        try {
          const userDocRef = doc(firestore, `users/${userId}`);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const data = userDoc.data();

            // Get the most reliable profile picture URL
            const photoURL = this.getReliableProfilePictureURL(data);

            return {
              userId,
              displayName:
                (data["displayName"] as string) ??
                (data["email"] as string).split("@")[0] ??
                "Unknown User",
              photoURL,
              email: (data["email"] as string) ?? null,
            };
          }
          return {
            userId,
            displayName: "Unknown User",
            photoURL: null,
            email: null,
          };
        } catch {
          return {
            userId,
            displayName: "Unknown User",
            photoURL: null,
            email: null,
          };
        }
      });

      const results = await Promise.all(userPromises);

      for (const result of results) {
        userMap.set(result.userId, {
          displayName: result.displayName,
          photoURL: result.photoURL,
          email: result.email,
        });
      }
    } catch (error) {
      console.error("Failed to fetch user details:", error);
    }

    return userMap;
  }

  /**
   * Get a reliable profile picture URL from user data
   * Priority: Google ID -> Facebook ID -> stored photoURL -> null
   *
   * Google and Facebook profile picture URLs stored in Firebase Auth can expire.
   * Using the provider ID to construct a fresh URL is more reliable.
   */
  private getReliableProfilePictureURL(
    userData: Record<string, unknown>
  ): string | null {
    // 1. Try Google ID first - most reliable
    const googleId = userData["googleId"] as string | undefined;
    if (googleId) {
      // Use Google's People API format which doesn't expire
      // The =s96-c suffix requests a 96px circular crop
      return `https://lh3.googleusercontent.com/a/${googleId}=s96-c`;
    }

    // 2. Try Facebook ID
    const facebookId = userData["facebookId"] as string | undefined;
    if (facebookId) {
      // Facebook Graph API URL for profile picture
      return `https://graph.facebook.com/${facebookId}/picture?type=large`;
    }

    // 3. Fall back to stored photoURL (may be stale)
    const photoURL = userData["photoURL"] as string | undefined;
    if (photoURL) {
      return photoURL;
    }

    // 4. Try avatar field as last resort
    const avatar = userData["avatar"] as string | undefined;
    if (avatar) {
      return avatar;
    }

    return null;
  }

  /**
   * Format event type to human-readable label
   */
  private formatEventTypeLabel(eventType: string): string {
    return eventType
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  /**
   * Capitalize first letter of a string
   */
  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Return empty summary metrics when Firebase is unavailable
   */
  private getEmptySummaryMetrics(): SummaryMetrics {
    return {
      totalUsers: 0,
      activeToday: 0,
      sequencesCreated: 0,
      challengesCompleted: 0,
      previousTotalUsers: 0,
      previousActiveToday: 0,
      previousSequencesCreated: 0,
      previousChallengesCompleted: 0,
    };
  }
}
