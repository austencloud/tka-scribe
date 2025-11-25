/**
 * Set Admin with Firebase Admin SDK
 *
 * This script grants admin privileges using Firebase Admin SDK.
 * Requires serviceAccountKey.json in the project root.
 *
 * Usage: node scripts/set-admin-with-sdk.mjs <user-id> [user-id2] [user-id3] ...
 */

import admin from "firebase-admin";
import { readFile } from "fs/promises";

let serviceAccount;

try {
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
 * Set admin privileges for a user
 */
async function setAdmin(userId) {
  try {
    const userRef = firestore.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      console.log(`⚠️  User ${userId} does not exist in Firestore`);
      return false;
    }

    const userData = userDoc.data();

    // Update the user document with both role and isAdmin for compatibility
    await userRef.update({
      role: "admin",
      isAdmin: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(
      `✅ Successfully granted admin privileges to: ${userData.displayName || userData.email || userId}`
    );
    return true;
  } catch (error) {
    console.error(`❌ Error setting admin for ${userId}:`, error.message);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  const userIds = process.argv.slice(2);

  if (userIds.length === 0) {
    console.error("❌ Please provide at least one user ID");
    console.log(
      "Usage: node scripts/set-admin-with-sdk.mjs <user-id> [user-id2] ..."
    );
    console.log("\nExample:");
    console.log("  node scripts/set-admin-with-sdk.mjs abc123def456");
    console.log(
      "  node scripts/set-admin-with-sdk.mjs abc123def456 xyz789ghi012"
    );
    process.exit(1);
  }

  console.log(`🔧 Granting admin privileges to ${userIds.length} user(s)...\n`);

  let successCount = 0;
  for (const userId of userIds) {
    const success = await setAdmin(userId);
    if (success) successCount++;
  }

  console.log(
    `\n✨ Done! Successfully granted admin to ${successCount}/${userIds.length} user(s)`
  );
  process.exit(0);
}

// Run the script
main();
