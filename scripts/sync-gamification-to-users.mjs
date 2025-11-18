/**
 * Sync Gamification Data to User Documents
 *
 * This script migrates gamification data from subcollections to the main user document
 * for efficient leaderboard queries. It denormalizes:
 * - totalXP and currentLevel from users/{uid}/xp/current
 * - achievementCount from users/{uid}/achievements (count completed)
 * - currentStreak and longestStreak from users/{uid}/streak/current
 *
 * Prerequisites:
 * 1. Install Firebase Admin SDK: npm install firebase-admin
 * 2. Download service account key from Firebase Console:
 *    Project Settings > Service Accounts > Generate New Private Key
 * 3. Save the key as "serviceAccountKey.json" in the project root
 *    (make sure it's in .gitignore!)
 *
 * Usage: node scripts/sync-gamification-to-users.mjs
 */

import admin from "firebase-admin";
import { readFile } from "fs/promises";

let serviceAccount;

try {
  // Try to load service account key
  const serviceAccountData = await readFile(
    "./serviceAccountKey.json",
    "utf-8"
  );
  serviceAccount = JSON.parse(serviceAccountData);
} catch (error) {
  console.error("❌ Could not load service account key file.");
  console.error("\nTo use this script, you need to:");
  console.error("1. Go to Firebase Console");
  console.error(
    "2. Project Settings > Service Accounts > Generate New Private Key"
  );
  console.error('3. Save as "serviceAccountKey.json" in the project root');
  console.error("4. Make sure it's added to .gitignore (it should be!)");
  process.exit(1);
}

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const firestore = admin.firestore();

/**
 * Sync gamification data for a single user
 */
async function syncUserGamification(userId) {
  try {
    const userRef = firestore.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      console.log(`⚠️  User document not found: ${userId}`);
      return { updated: false, error: false, notFound: true };
    }

    const updates = {};

    // 1. Fetch XP data from subcollection
    try {
      const xpDoc = await firestore
        .collection("users")
        .doc(userId)
        .collection("xp")
        .doc("current")
        .get();

      if (xpDoc.exists) {
        const xpData = xpDoc.data();
        updates.totalXP = xpData.totalXP || 0;
        updates.currentLevel = xpData.currentLevel || 1;
        console.log(
          `   📊 XP: ${updates.totalXP} (Level ${updates.currentLevel})`
        );
      } else {
        // No XP data - initialize with defaults
        updates.totalXP = 0;
        updates.currentLevel = 1;
        console.log(`   📊 XP: Initializing with defaults`);
      }
    } catch (error) {
      console.error(`   ❌ Error fetching XP data: ${error.message}`);
      updates.totalXP = 0;
      updates.currentLevel = 1;
    }

    // 2. Count completed achievements from subcollection
    try {
      const achievementsSnapshot = await firestore
        .collection("users")
        .doc(userId)
        .collection("achievements")
        .where("isCompleted", "==", true)
        .get();

      updates.achievementCount = achievementsSnapshot.size;
      console.log(`   🏆 Achievements: ${updates.achievementCount} completed`);
    } catch (error) {
      console.error(
        `   ❌ Error fetching achievements: ${error.message}`
      );
      updates.achievementCount = 0;
    }

    // 3. Fetch streak data from subcollection
    try {
      const streakDoc = await firestore
        .collection("users")
        .doc(userId)
        .collection("streak")
        .doc("current")
        .get();

      if (streakDoc.exists) {
        const streakData = streakDoc.data();
        updates.currentStreak = streakData.currentStreak || 0;
        updates.longestStreak = streakData.longestStreak || 0;
        console.log(
          `   🔥 Streak: ${updates.currentStreak} current, ${updates.longestStreak} longest`
        );
      } else {
        // No streak data - initialize with defaults
        updates.currentStreak = 0;
        updates.longestStreak = 0;
        console.log(`   🔥 Streak: Initializing with defaults`);
      }
    } catch (error) {
      console.error(`   ❌ Error fetching streak data: ${error.message}`);
      updates.currentStreak = 0;
      updates.longestStreak = 0;
    }

    // Update the main user document
    await userRef.update(updates);

    console.log(`✅ Synced gamification data for: ${userId}\n`);
    return { updated: true, error: false, notFound: false };
  } catch (error) {
    console.error(`❌ Error syncing user ${userId}:`, error.message);
    return { updated: false, error: true, notFound: false };
  }
}

/**
 * Main migration function
 */
async function syncAllUsers() {
  console.log("🚀 Starting gamification data sync...\n");

  let stats = {
    total: 0,
    updated: 0,
    notFound: 0,
    errors: 0,
  };

  try {
    // Get all user documents
    const usersSnapshot = await firestore.collection("users").get();

    console.log(`Found ${usersSnapshot.size} user documents\n`);

    // Process each user
    for (const userDoc of usersSnapshot.docs) {
      stats.total++;
      console.log(`[${stats.total}/${usersSnapshot.size}] Processing: ${userDoc.id}`);

      const result = await syncUserGamification(userDoc.id);

      if (result.updated) stats.updated++;
      if (result.notFound) stats.notFound++;
      if (result.error) stats.errors++;
    }

    console.log("\n✅ Sync completed!");
    console.log(`\n📊 Statistics:`);
    console.log(`   Total users: ${stats.total}`);
    console.log(`   Updated: ${stats.updated}`);
    console.log(`   Not found: ${stats.notFound}`);
    console.log(`   Errors: ${stats.errors}`);

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Sync failed:", error);
    process.exit(1);
  }
}

// Run sync
syncAllUsers();
