/**
 * Migrate Firebase Auth Users to Firestore
 *
 * This script creates Firestore user documents for all existing Firebase Auth users.
 * This is a one-time migration script to backfill the "users" collection.
 *
 * Prerequisites:
 * 1. Install Firebase Admin SDK: npm install firebase-admin
 * 2. Download service account key from Firebase Console:
 *    Project Settings > Service Accounts > Generate New Private Key
 * 3. Save the key as "serviceAccountKey.json" in the project root
 *    (make sure it's in .gitignore!)
 *
 * Usage: node scripts/migrate-auth-users-to-firestore.mjs
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

const auth = admin.auth();
const firestore = admin.firestore();

/**
 * Migrate a single user from Firebase Auth to Firestore
 */
async function migrateUser(authUser) {
  try {
    const userRef = firestore.collection("users").doc(authUser.uid);
    const userDoc = await userRef.get();

    // Determine display name and username
    const displayName =
      authUser.displayName || authUser.email?.split("@")[0] || "Anonymous User";
    const username =
      authUser.email?.split("@")[0] || authUser.uid.substring(0, 8);

    const userData = {
      email: authUser.email || null,
      displayName,
      username,
      photoURL: authUser.photoURL || null,
      avatar: authUser.photoURL || null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (!userDoc.exists) {
      // Create new user document
      await userRef.set({
        ...userData,
        createdAt: admin.firestore.Timestamp.fromDate(
          new Date(authUser.metadata.creationTime)
        ),
        // Initialize counts
        sequenceCount: 0,
        collectionCount: 0,
        followerCount: 0,
        // Admin status (default false)
        isAdmin: false,
      });

      console.log(
        `✨ Created Firestore document for: ${authUser.email || authUser.uid}`
      );
      return { created: true, updated: false };
    } else {
      // Update existing user document (preserving existing data)
      await userRef.set(userData, { merge: true });

      console.log(
        `🔄 Updated Firestore document for: ${authUser.email || authUser.uid}`
      );
      return { created: false, updated: true };
    }
  } catch (error) {
    console.error(
      `❌ Error migrating user ${authUser.email || authUser.uid}:`,
      error.message
    );
    return { created: false, updated: false, error: true };
  }
}

/**
 * Main migration function
 */
async function migrateAllUsers() {
  console.log("🚀 Starting Firebase Auth to Firestore migration...\n");

  let stats = {
    total: 0,
    created: 0,
    updated: 0,
    errors: 0,
  };

  try {
    // List all users (paginated)
    let pageToken = undefined;
    let hasMore = true;

    while (hasMore) {
      const listUsersResult = await auth.listUsers(1000, pageToken);

      // Process each user
      for (const authUser of listUsersResult.users) {
        stats.total++;
        const result = await migrateUser(authUser);

        if (result.created) stats.created++;
        if (result.updated) stats.updated++;
        if (result.error) stats.errors++;
      }

      // Check if there are more users
      pageToken = listUsersResult.pageToken;
      hasMore = !!pageToken;
    }

    console.log("\n✅ Migration completed!");
    console.log(`\n📊 Statistics:`);
    console.log(`   Total users: ${stats.total}`);
    console.log(`   Created: ${stats.created}`);
    console.log(`   Updated: ${stats.updated}`);
    console.log(`   Errors: ${stats.errors}`);

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run migration
migrateAllUsers();
