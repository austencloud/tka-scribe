/**
 * UserDocumentService
 *
 * Manages user document creation and updates in Firestore.
 * Ensures every authenticated user has a Firestore profile document.
 */

import { injectable, inject } from "inversify";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { type User } from "firebase/auth";
import { firestore } from "../../firebase";
import type { IUserDocumentService } from "../contracts/IUserDocumentService";
import type { IProfilePictureService } from "../contracts/IProfilePictureService";
import { TYPES } from "../../../inversify/types";

@injectable()
export class UserDocumentService implements IUserDocumentService {
  constructor(
    @inject(TYPES.IProfilePictureService)
    private readonly profilePictureService: IProfilePictureService
  ) {}

  /**
   * Create or update a user document in Firestore.
   * 
   * This ensures every authenticated user has a corresponding Firestore document
   * that can be displayed in the users explore panel.
   * 
   * Creates new document with initial fields if doesn't exist.
   * Updates existing document with latest auth data if exists.
   */
  async createOrUpdateUserDocument(user: User): Promise<void> {
    try {
      const userDocRef = doc(firestore, `users/${user.uid}`);
      const userDoc = await getDoc(userDocRef);

      // Determine display name and username
      const displayName =
        user.displayName || user.email?.split("@")[0] || "Anonymous User";
      const username = user.email?.split("@")[0] || user.uid.substring(0, 8);

      // Get provider IDs for reliable profile picture URLs
      const providerIds = this.profilePictureService.getProviderIds(user);

      if (!userDoc.exists()) {
        // Create new user document
        await setDoc(userDocRef, {
          email: user.email,
          displayName,
          username,
          photoURL: user.photoURL || null,
          avatar: user.photoURL || null,
          // Store provider IDs for reliable profile picture construction
          googleId: providerIds.googleId || null,
          facebookId: providerIds.facebookId || null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastActivityDate: serverTimestamp(), // Track activity for analytics
          // Initialize counts
          sequenceCount: 0,
          collectionCount: 0,
          followerCount: 0,
          // Initialize gamification fields (denormalized for leaderboards)
          totalXP: 0,
          currentLevel: 1,
          achievementCount: 0,
          currentStreak: 0,
          longestStreak: 0,
          // Admin status (default false)
          isAdmin: false,
        });

        // Notify admins of new user signup (async, non-blocking)
        void import("$lib/features/admin/services/implementations/AdminNotificationService").then(
          ({ adminNotificationService }) => {
            void adminNotificationService.notifyNewUserSignup(
              user.uid,
              user.email,
              displayName
            );
          }
        );
      } else {
        // Update existing user document with latest auth data
        // Always update provider IDs and photoURL to keep them fresh
        await setDoc(
          userDocRef,
          {
            email: user.email,
            displayName,
            username,
            photoURL: user.photoURL || null,
            avatar: user.photoURL || null,
            // Always update provider IDs (they don't change but ensures they exist)
            googleId: providerIds.googleId || null,
            facebookId: providerIds.facebookId || null,
            updatedAt: serverTimestamp(),
            lastActivityDate: serverTimestamp(), // Track activity for analytics
          },
          { merge: true } // Merge to preserve existing fields like counts
        );
      }
    } catch (error) {
      console.error(
        `❌ [UserDocumentService] Failed to create/update user document:`,
        error
      );
      // Don't throw - this shouldn't block authentication
    }
  }
}
