/**
 * Admin Challenge Service Implementation
 *
 * Handles admin operations for daily challenges
 */

import { injectable } from "inversify";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { firestore } from "$shared/auth/firebase";
import { db } from "$shared/persistence";
import type { DailyChallenge } from "$shared/gamification/domain/models";
import type { SequenceData } from "$shared";
import type {
  ChallengeScheduleEntry,
  ChallengeFormData,
} from "../../domain/models";
import type { IAdminChallengeService } from "../contracts";

@injectable()
export class AdminChallengeService implements IAdminChallengeService {
  /**
   * Get all scheduled challenges for a date range
   * Optimized: Single batch query instead of per-day requests
   */
  async getScheduledChallenges(
    startDate: Date,
    endDate: Date
  ): Promise<ChallengeScheduleEntry[]> {
    // Build date strings for the range
    const startDateStr = startDate.toISOString().split("T")[0] ?? "";
    const endDateStr = endDate.toISOString().split("T")[0] ?? "";

    // Fetch all challenges in range with a single query
    const challengesRef = collection(firestore, "dailyChallenges");
    const q = query(
      challengesRef,
      where("date", ">=", startDateStr),
      where("date", "<=", endDateStr)
    );

    const challengeMap = new Map<string, DailyChallenge>();

    try {
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        const challenge = doc.data() as DailyChallenge;
        challengeMap.set(challenge.date, challenge);
      });
    } catch (error) {
      console.error("❌ [Admin] Failed to fetch challenges:", error);
    }

    // Build entries array for each day in range
    const entries: ChallengeScheduleEntry[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0] ?? "";
      const challenge = challengeMap.get(dateStr) ?? null;

      entries.push({
        date: dateStr,
        challenge,
        isScheduled: challenge !== null,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return entries;
  }

  /**
   * Create a new daily challenge
   */
  async createChallenge(formData: ChallengeFormData): Promise<DailyChallenge> {
    const challengeId = `challenge_${formData.date}`;

    // Create end-of-day expiration
    const expiresAt = new Date(formData.date);
    expiresAt.setHours(23, 59, 59, 999);

    const challenge: DailyChallenge = {
      id: challengeId,
      date: formData.date,
      type: formData.type,
      difficulty: formData.difficulty,
      title: formData.title,
      description: formData.description,
      xpReward: formData.xpReward,
      requirement: {
        type: formData.type,
        target: formData.target,
        ...(formData.metadata && { metadata: formData.metadata }),
      },
      expiresAt,
    };

    // Save to Firestore
    const challengeDocRef = doc(firestore, `dailyChallenges/${challengeId}`);
    await setDoc(challengeDocRef, {
      ...challenge,
      expiresAt: Timestamp.fromDate(expiresAt),
    });

    console.log(`✅ [Admin] Created daily challenge: ${challenge.title}`);

    return challenge;
  }

  /**
   * Update an existing daily challenge
   */
  async updateChallenge(
    challengeId: string,
    formData: Partial<ChallengeFormData>
  ): Promise<DailyChallenge> {
    const challengeDocRef = doc(firestore, `dailyChallenges/${challengeId}`);
    const challengeDoc = await getDoc(challengeDocRef);

    if (!challengeDoc.exists()) {
      throw new Error(`Challenge ${challengeId} not found`);
    }

    const existingChallenge = challengeDoc.data() as DailyChallenge;

    // Build update object
    const updates: any = {};

    if (formData.title) updates.title = formData.title;
    if (formData.description) updates.description = formData.description;
    if (formData.difficulty) updates.difficulty = formData.difficulty;
    if (formData.xpReward !== undefined) updates.xpReward = formData.xpReward;
    if (formData.type) updates.type = formData.type;

    if (formData.target !== undefined || formData.metadata !== undefined) {
      updates.requirement = {
        ...existingChallenge.requirement,
        ...(formData.target !== undefined && { target: formData.target }),
        ...(formData.metadata && { metadata: formData.metadata }),
      };
    }

    await updateDoc(challengeDocRef, updates);

    console.log(`✅ [Admin] Updated daily challenge: ${challengeId}`);

    // Fetch and return updated challenge
    const updatedDoc = await getDoc(challengeDocRef);
    return updatedDoc.data() as DailyChallenge;
  }

  /**
   * Delete a daily challenge
   */
  async deleteChallenge(challengeId: string): Promise<void> {
    const challengeDocRef = doc(firestore, `dailyChallenges/${challengeId}`);
    await deleteDoc(challengeDocRef);

    console.log(`✅ [Admin] Deleted daily challenge: ${challengeId}`);
  }

  /**
   * Get user's saved sequences (for selection)
   */
  async getUserSequences(): Promise<SequenceData[]> {
    try {
      const sequences = await db.sequences.toArray();
      return sequences;
    } catch (error) {
      console.error("❌ [Admin] Failed to fetch user sequences:", error);
      return [];
    }
  }

  /**
   * Get a specific challenge by date
   */
  async getChallengeByDate(date: string): Promise<DailyChallenge | null> {
    const challengeId = `challenge_${date}`;
    const challengeDocRef = doc(firestore, `dailyChallenges/${challengeId}`);

    try {
      const challengeDoc = await getDoc(challengeDocRef);

      if (challengeDoc.exists()) {
        return challengeDoc.data() as DailyChallenge;
      }

      return null;
    } catch (error) {
      console.error(`❌ [Admin] Failed to fetch challenge for ${date}:`, error);
      return null;
    }
  }
}
