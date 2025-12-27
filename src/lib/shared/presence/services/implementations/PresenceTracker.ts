/**
 * Presence Service Implementation
 *
 * Manages real-time user presence using Firebase Realtime Database.
 * Uses activity-based detection (like Facebook) to show actual user engagement,
 * not just whether they have the app open.
 */

import { injectable, inject } from "inversify";
import {
  ref,
  set,
  update,
  onValue,
  onDisconnect,
  serverTimestamp,
  off,
  get,
} from "firebase/database";
import { database, auth } from "../../../auth/firebase";
import { TYPES } from "../../../inversify/types";
import type { IPresenceTracker } from "../contracts/IPresenceTracker";
import type { ISessionTracker } from "../../../analytics/services/contracts/ISessionTracker";
import type {
  UserPresence,
  UserPresenceWithId,
  PresenceStats,
  ActivityStatus,
} from "../../domain/models/presence-models";
import { computeActivityStatus } from "../../domain/models/presence-models";
import { ActivityTracker } from "../../utils/activity-tracker";

@injectable()
export class PresenceTracker implements IPresenceTracker {
  private currentPresence: UserPresence | null = null;
  private initialized = false;
  private presenceRef: ReturnType<typeof ref> | null = null;
  private activityTracker: ActivityTracker | null = null;

  constructor(
    @inject(TYPES.ISessionTracker)
    private sessionTrackingService: ISessionTracker
  ) {}

  async initialize(): Promise<void> {
    if (this.initialized) return;

    const user = auth.currentUser;
    if (!user) return;

    const userId = user.uid;
    this.presenceRef = ref(database, `presence/${userId}`);

    // Get session info
    const sessionInfo = this.sessionTrackingService.getSessionInfo();

    const now = Date.now();

    // Create presence data with activity tracking
    this.currentPresence = {
      online: true,
      activityStatus: "active",
      lastActivity: now,
      lastSeen: now,
      currentModule: "dashboard",
      currentTab: null,
      sessionId: sessionInfo.sessionId,
      device: sessionInfo.device,
      displayName: user.displayName ?? undefined,
      email: user.email ?? undefined,
      photoURL: user.photoURL,
    };

    // Set up onDisconnect handler FIRST
    // This ensures we mark as offline even if the browser crashes
    const disconnectData: Record<string, unknown> = {
      online: false,
      activityStatus: "offline",
      lastSeen: serverTimestamp(),
      lastActivity: serverTimestamp(),
    };

    await onDisconnect(this.presenceRef).update(disconnectData);

    // Now set the presence data
    await set(this.presenceRef, {
      ...this.currentPresence,
      lastSeen: serverTimestamp(),
      lastActivity: serverTimestamp(),
    });

    // Start activity tracking
    this.startActivityTracking();

    this.initialized = true;
  }

  /** Start tracking user interactions for activity-based presence */
  private startActivityTracking(): void {
    if (this.activityTracker) return;

    this.activityTracker = new ActivityTracker({
      onActivity: () => this.handleUserActivity(),
    });

    this.activityTracker.start();
  }

  /** Stop activity tracking */
  private stopActivityTracking(): void {
    if (this.activityTracker) {
      this.activityTracker.stop();
      this.activityTracker = null;
    }
  }

  /** Handle detected user activity */
  private async handleUserActivity(): Promise<void> {
    if (!this.presenceRef || !this.currentPresence) return;

    const now = Date.now();
    this.currentPresence.lastActivity = now;
    this.currentPresence.activityStatus = "active";

    // Update only activity-related fields to minimize writes
    await update(this.presenceRef, {
      lastActivity: serverTimestamp(),
      activityStatus: "active",
    });
  }

  async updateLocation(module: string, tab?: string | null): Promise<void> {
    if (!this.presenceRef || !this.currentPresence) {
      // Try to initialize first
      await this.initialize();
      if (!this.presenceRef || !this.currentPresence) return;
    }

    const now = Date.now();
    this.currentPresence.currentModule = module;
    this.currentPresence.currentTab = tab ?? null;
    this.currentPresence.lastSeen = now;
    this.currentPresence.lastActivity = now;
    this.currentPresence.activityStatus = "active";

    // Navigation counts as activity
    if (this.activityTracker) {
      this.activityTracker.forceActivityUpdate();
    }

    await set(this.presenceRef, {
      ...this.currentPresence,
      lastSeen: serverTimestamp(),
      lastActivity: serverTimestamp(),
    });
  }

  async goOffline(): Promise<void> {
    // Stop activity tracking first
    this.stopActivityTracking();

    if (!this.presenceRef) return;

    await update(this.presenceRef, {
      online: false,
      activityStatus: "offline",
      lastSeen: serverTimestamp(),
      lastActivity: serverTimestamp(),
    });

    this.currentPresence = null;
    this.initialized = false;
  }

  getCurrentPresence(): UserPresence | null {
    return this.currentPresence ? { ...this.currentPresence } : null;
  }

  subscribeToAllPresence(
    callback: (users: UserPresenceWithId[]) => void
  ): () => void {
    const presenceListRef = ref(database, "presence");

    const handleValue = (snapshot: {
      val: () => Record<string, UserPresence> | null;
    }) => {
      const data = snapshot.val();
      if (!data) {
        callback([]);
        return;
      }

      const users: UserPresenceWithId[] = Object.entries(data).map(
        ([userId, presence]) => {
          // Compute real-time activity status based on lastActivity
          const computedStatus = computeActivityStatus(
            presence.lastActivity ?? presence.lastSeen,
            presence.online
          );
          return {
            userId,
            ...presence,
            // Override stored status with computed status for accuracy
            activityStatus: computedStatus,
          };
        }
      );

      // Sort: active first, then offline, then by lastActivity (most recent first)
      users.sort((a, b) => {
        const statusA = a.activityStatus ?? "offline";
        const statusB = b.activityStatus ?? "offline";

        // Active users first
        if (statusA !== statusB) {
          return statusA === "active" ? -1 : 1;
        }
        // Within same status, sort by most recent activity
        const activityA = a.lastActivity ?? a.lastSeen;
        const activityB = b.lastActivity ?? b.lastSeen;
        return activityB - activityA;
      });

      callback(users);
    };

    onValue(presenceListRef, handleValue);

    return () => {
      off(presenceListRef, "value", handleValue);
    };
  }

  subscribeToUserPresence(
    userId: string,
    callback: (presence: UserPresence | null) => void
  ): () => void {
    const userPresenceRef = ref(database, `presence/${userId}`);

    const handleValue = (snapshot: { val: () => UserPresence | null }) => {
      callback(snapshot.val());
    };

    onValue(userPresenceRef, handleValue);

    return () => {
      off(userPresenceRef, "value", handleValue);
    };
  }

  async getPresenceStats(): Promise<PresenceStats> {
    const presenceListRef = ref(database, "presence");
    const snapshot = await get(presenceListRef);
    const data = snapshot.val() as Record<string, UserPresence> | null;

    if (!data) {
      return {
        activeCount: 0,
        inactiveCount: 0,
        byModule: {},
        byDevice: { desktop: 0, mobile: 0, tablet: 0 },
      };
    }

    const stats: PresenceStats = {
      activeCount: 0,
      inactiveCount: 0,
      byModule: {},
      byDevice: { desktop: 0, mobile: 0, tablet: 0 },
    };

    for (const presence of Object.values(data)) {
      // Compute real-time activity status
      const status = computeActivityStatus(
        presence.lastActivity ?? presence.lastSeen,
        presence.online
      );

      if (status === "active") {
        stats.activeCount++;
        stats.byModule[presence.currentModule] =
          (stats.byModule[presence.currentModule] ?? 0) + 1;
        stats.byDevice[presence.device]++;
      } else {
        stats.inactiveCount++;
      }
    }

    return stats;
  }

  async isUserOnline(userId: string): Promise<boolean> {
    const userPresenceRef = ref(database, `presence/${userId}`);
    const snapshot = await get(userPresenceRef);
    const presence = snapshot.val() as UserPresence | null;

    if (!presence) return false;

    // Use activity-based status, not just connection status
    const status = computeActivityStatus(
      presence.lastActivity ?? presence.lastSeen,
      presence.online
    );
    return status === "active";
  }

  /** Get detailed activity status for a user */
  async getUserActivityStatus(userId: string): Promise<ActivityStatus> {
    const userPresenceRef = ref(database, `presence/${userId}`);
    const snapshot = await get(userPresenceRef);
    const presence = snapshot.val() as UserPresence | null;

    if (!presence) return "offline";

    return computeActivityStatus(
      presence.lastActivity ?? presence.lastSeen,
      presence.online
    );
  }
}
