/**
 * Background Popularity Service Implementation
 *
 * Tracks background usage across all users with real-time updates.
 * Uses a single Firestore document for efficient reads and atomic updates.
 *
 * Storage: stats/backgroundPopularity
 * Structure: { aurora: 15, snowfall: 23, nightSky: 45, ... }
 */

import { injectable } from "inversify";
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  increment,
  type Unsubscribe,
} from "firebase/firestore";
import { firestore } from "$lib/shared/auth/firebase";
import type {
  IBackgroundPopularityService,
  BackgroundPopularityCounts,
} from "../contracts/IBackgroundPopularityService";
import type { BackgroundType } from "$lib/shared/background/shared/domain/enums/background-enums";

const STATS_COLLECTION = "stats";
const POPULARITY_DOC = "backgroundPopularity";

@injectable()
export class BackgroundPopularityService implements IBackgroundPopularityService {
  private unsubscribe: Unsubscribe | null = null;
  private cachedCounts: BackgroundPopularityCounts = {};

  /**
   * Get the Firestore document reference for popularity stats
   */
  private getPopularityDocRef() {
    return doc(firestore, STATS_COLLECTION, POPULARITY_DOC);
  }

  /**
   * Normalize background key for consistent storage
   * Handles both BackgroundType enum values and string identifiers
   */
  private normalizeBackgroundKey(background: BackgroundType | string): string {
    // Convert to string and use as-is (already kebab-case or camelCase)
    return String(background);
  }

  /**
   * Get the current popularity counts for all backgrounds
   */
  async getPopularityCounts(): Promise<BackgroundPopularityCounts> {
    try {
      const docRef = this.getPopularityDocRef();
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        // Filter out metadata fields
        const counts: BackgroundPopularityCounts = {};
        for (const [key, value] of Object.entries(data)) {
          if (typeof value === "number" && !key.startsWith("_")) {
            counts[key] = value;
          }
        }
        this.cachedCounts = counts;
        return counts;
      }

      return {};
    } catch (error) {
      console.error(
        "❌ [BackgroundPopularityService] Failed to get counts:",
        error
      );
      return this.cachedCounts;
    }
  }

  /**
   * Subscribe to real-time popularity updates
   */
  subscribeToPopularity(
    callback: (counts: BackgroundPopularityCounts) => void
  ): () => void {
    // Clean up any existing subscription
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }

    const docRef = this.getPopularityDocRef();

    this.unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          // Filter out metadata fields
          const counts: BackgroundPopularityCounts = {};
          for (const [key, value] of Object.entries(data)) {
            if (typeof value === "number" && !key.startsWith("_")) {
              counts[key] = value;
            }
          }
          this.cachedCounts = counts;
          callback(counts);
        } else {
          callback({});
        }
      },
      (error) => {
        console.error(
          "❌ [BackgroundPopularityService] Snapshot listener error:",
          error
        );
      }
    );

    return () => {
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }
    };
  }

  /**
   * Record a background change - decrements old, increments new
   */
  async recordBackgroundChange(
    oldBackground: BackgroundType | string | undefined,
    newBackground: BackgroundType | string
  ): Promise<void> {
    try {
      const docRef = this.getPopularityDocRef();
      const newKey = this.normalizeBackgroundKey(newBackground);

      const updates: Record<string, unknown> = {
        [newKey]: increment(1),
      };

      // Only decrement old if it exists and is different
      if (oldBackground && oldBackground !== newBackground) {
        const oldKey = this.normalizeBackgroundKey(oldBackground);
        updates[oldKey] = increment(-1);
      }

      await setDoc(docRef, updates, { merge: true });
    } catch (error) {
      console.error(
        "❌ [BackgroundPopularityService] Failed to record change:",
        error
      );
      // Don't throw - this is non-critical functionality
    }
  }

  /**
   * Initialize tracking for a new user
   */
  async initializeUserBackground(
    background: BackgroundType | string
  ): Promise<void> {
    try {
      const docRef = this.getPopularityDocRef();
      const key = this.normalizeBackgroundKey(background);

      await setDoc(
        docRef,
        {
          [key]: increment(1),
        },
        { merge: true }
      );
    } catch (error) {
      console.error(
        "❌ [BackgroundPopularityService] Failed to initialize:",
        error
      );
    }
  }
}
