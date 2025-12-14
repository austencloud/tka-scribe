/**
 * Presence Service Implementation
 *
 * Manages real-time user presence using Firebase Realtime Database.
 * Uses onDisconnect() for automatic offline detection.
 */

import { injectable, inject } from "inversify";
import {
  ref,
  set,
  onValue,
  onDisconnect,
  serverTimestamp,
  off,
  get,
} from "firebase/database";
import { database, auth } from "../../../auth/firebase";
import { TYPES } from "../../../inversify/types";
import type { IPresenceService } from "../contracts/IPresenceService";
import type { ISessionTrackingService } from "../../../analytics/services/contracts/ISessionTrackingService";
import type {
  UserPresence,
  UserPresenceWithId,
  PresenceStats,
} from "../../domain/models/presence-models";

@injectable()
export class PresenceService implements IPresenceService {
  private currentPresence: UserPresence | null = null;
  private initialized = false;
  private presenceRef: ReturnType<typeof ref> | null = null;

  constructor(
    @inject(TYPES.ISessionTrackingService)
    private sessionTrackingService: ISessionTrackingService
  ) {}

  async initialize(): Promise<void> {
    if (this.initialized) return;

    const user = auth.currentUser;
    if (!user) return;

    const userId = user.uid;
    this.presenceRef = ref(database, `presence/${userId}`);

    // Get session info
    const sessionInfo = this.sessionTrackingService.getSessionInfo();

    // Create presence data
    this.currentPresence = {
      online: true,
      lastSeen: Date.now(),
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
      lastSeen: serverTimestamp(),
    };

    await onDisconnect(this.presenceRef).update(disconnectData);

    // Now set the presence data
    await set(this.presenceRef, {
      ...this.currentPresence,
      lastSeen: serverTimestamp(),
    });

    this.initialized = true;
  }

  async updateLocation(module: string, tab?: string | null): Promise<void> {
    if (!this.presenceRef || !this.currentPresence) {
      // Try to initialize first
      await this.initialize();
      if (!this.presenceRef || !this.currentPresence) return;
    }

    this.currentPresence.currentModule = module;
    this.currentPresence.currentTab = tab ?? null;
    this.currentPresence.lastSeen = Date.now();

    await set(this.presenceRef, {
      ...this.currentPresence,
      lastSeen: serverTimestamp(),
    });
  }

  async goOffline(): Promise<void> {
    if (!this.presenceRef) return;

    await set(this.presenceRef, {
      online: false,
      lastSeen: serverTimestamp(),
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

    const handleValue = (snapshot: { val: () => Record<string, UserPresence> | null }) => {
      const data = snapshot.val();
      if (!data) {
        callback([]);
        return;
      }

      const users: UserPresenceWithId[] = Object.entries(data).map(
        ([userId, presence]) => ({
          userId,
          ...presence,
        })
      );

      // Sort: online first, then by lastSeen (most recent first)
      users.sort((a, b) => {
        if (a.online !== b.online) {
          return a.online ? -1 : 1;
        }
        return b.lastSeen - a.lastSeen;
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
        onlineCount: 0,
        byModule: {},
        byDevice: { desktop: 0, mobile: 0, tablet: 0 },
      };
    }

    const stats: PresenceStats = {
      onlineCount: 0,
      byModule: {},
      byDevice: { desktop: 0, mobile: 0, tablet: 0 },
    };

    for (const presence of Object.values(data)) {
      if (presence.online) {
        stats.onlineCount++;
        stats.byModule[presence.currentModule] =
          (stats.byModule[presence.currentModule] ?? 0) + 1;
        stats.byDevice[presence.device]++;
      }
    }

    return stats;
  }

  async isUserOnline(userId: string): Promise<boolean> {
    const userPresenceRef = ref(database, `presence/${userId}`);
    const snapshot = await get(userPresenceRef);
    const presence = snapshot.val() as UserPresence | null;
    return presence?.online ?? false;
  }
}
