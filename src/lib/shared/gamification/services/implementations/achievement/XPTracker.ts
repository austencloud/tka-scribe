/**
 * XP Tracker
 *
 * Handles XP calculations, leveling, and XP event logging.
 * Single Responsibility: XP business logic
 */

import {
  doc,
  updateDoc,
  increment,
  serverTimestamp,
  collection,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { firestore } from "../../../../auth/firebase";
import { db } from "../../../../persistence/database/TKADatabase";
import {
  getUserXPPath,
  getUserXPEventsPath,
} from "../../../data/firestore-collections";
import { calculateLevelFromXP, XP_REWARDS } from "../../../domain/constants";
import type {
  UserXP,
  XPActionType,
  XPGainEvent,
  XPEventMetadata,
} from "../../../domain/models";

export class XPTracker {
  /**
   * Calculate XP reward for an action
   */
  calculateXPForAction(
    action: XPActionType,
    metadata?: XPEventMetadata
  ): number {
    switch (action) {
      case "sequence_created":
        return XP_REWARDS.SEQUENCE_CREATED;
      case "sequence_generated":
        return XP_REWARDS.SEQUENCE_GENERATED;
      case "concept_learned":
        return XP_REWARDS.CONCEPT_LEARNED;
      case "drill_completed":
        return XP_REWARDS.DRILL_COMPLETED;
      case "sequence_explored":
        return XP_REWARDS.SEQUENCE_EXPLORED;
      case "daily_login":
        return XP_REWARDS.DAILY_LOGIN;
      case "daily_challenge_completed":
        return XP_REWARDS.DAILY_CHALLENGE_COMPLETED;
      case "weekly_challenge_completed":
        return XP_REWARDS.WEEKLY_CHALLENGE_COMPLETED || 100;
      case "weekly_challenge_bonus":
        return XP_REWARDS.WEEKLY_CHALLENGE_BONUS || 50;
      case "skill_level_completed":
        return XP_REWARDS.SKILL_LEVEL_COMPLETED || 75;
      case "skill_mastery_achieved":
        return XP_REWARDS.SKILL_MASTERY_ACHIEVED || 200;
      case "achievement_unlocked": {
        const tier = metadata?.tier;
        if (tier === "bronze") return XP_REWARDS.ACHIEVEMENT_UNLOCKED_BRONZE;
        if (tier === "silver") return XP_REWARDS.ACHIEVEMENT_UNLOCKED_SILVER;
        if (tier === "gold") return XP_REWARDS.ACHIEVEMENT_UNLOCKED_GOLD;
        if (tier === "platinum")
          return XP_REWARDS.ACHIEVEMENT_UNLOCKED_PLATINUM;
        return 0;
      }
      case "sequence_published":
        return XP_REWARDS.SEQUENCE_PUBLISHED;
    }
  }

  /**
   * Award XP to user and handle level up
   */
  async awardXP(
    userId: string,
    amount: number,
    action: XPActionType,
    metadata?: XPEventMetadata
  ): Promise<{ newLevel?: number }> {
    const xpDocRef = doc(firestore, getUserXPPath(userId));

    // Get current XP
    const xpDoc = await getDoc(xpDocRef);
    const currentXP = xpDoc.exists() ? (xpDoc.data() as UserXP) : null;

    if (!currentXP) {
      throw new Error("User XP record not found");
    }

    const oldTotalXP = currentXP.totalXP;
    const newTotalXP = oldTotalXP + amount;

    // Calculate new level
    const oldLevel = calculateLevelFromXP(oldTotalXP);
    const newLevel = calculateLevelFromXP(newTotalXP);

    const leveledUp = newLevel.currentLevel > oldLevel.currentLevel;

    // Update Firestore XP subcollection
    await updateDoc(xpDocRef, {
      totalXP: increment(amount),
      currentLevel: newLevel.currentLevel,
      xpToNextLevel: newLevel.xpToNextLevel,
      lastUpdated: serverTimestamp(),
    });

    // Sync to main user document for leaderboards (denormalized)
    const userDocRef = doc(firestore, `users/${userId}`);
    await updateDoc(userDocRef, {
      totalXP: increment(amount),
      currentLevel: newLevel.currentLevel,
    });

    // Log XP event
    await this.logXPEvent(userId, action, amount, metadata);

    // Update local cache
    await db.userXP.put({
      id: "current",
      userId,
      totalXP: newTotalXP,
      currentLevel: newLevel.currentLevel,
      xpToNextLevel: newLevel.xpToNextLevel,
      lastUpdated: new Date(),
    });

    const result: { newLevel?: number } = {};
    if (leveledUp) {
      result.newLevel = newLevel.currentLevel;
    }
    return result;
  }

  /**
   * Log XP gain event to Firestore and local DB
   */
  private async logXPEvent(
    userId: string,
    action: XPActionType,
    xpGained: number,
    metadata?: XPEventMetadata
  ): Promise<void> {
    const eventsPath = getUserXPEventsPath(userId);
    const eventRef = doc(collection(firestore, eventsPath));

    const event: Omit<XPGainEvent, "id"> = {
      action,
      xpGained,
      timestamp: new Date(),
    };
    if (metadata !== undefined) {
      event.metadata = metadata;
    }

    await setDoc(eventRef, {
      ...event,
      timestamp: serverTimestamp(),
    });

    // Cache locally
    await db.xpEvents.add({
      id: eventRef.id,
      ...event,
    });
  }
}
