/**
 * Debug User Photos
 *
 * This script checks Firebase Auth and Firestore to see which users have photoURLs
 * and helps diagnose why profile pictures aren't showing in the Explore Users section.
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
  console.error(
    "\nMake sure serviceAccountKey.json exists in the project root."
  );
  process.exit(1);
}

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const auth = admin.auth();
const firestore = admin.firestore();

/**
 * Debug a single user's photo information
 */
async function debugUser(authUser) {
  const userRef = firestore.collection("users").doc(authUser.uid);
  const userDoc = await userRef.get();
  const firestoreData = userDoc.exists ? userDoc.data() : null;

  console.log("\n" + "=".repeat(80));
  console.log(`👤 ${authUser.email || authUser.uid}`);
  console.log("=".repeat(80));

  // Firebase Auth data
  console.log("\n📧 Firebase Auth:");
  console.log(`  - Display Name: ${authUser.displayName || "(none)"}`);
  console.log(`  - Photo URL: ${authUser.photoURL || "(none)"}`);
  console.log(
    `  - Provider: ${authUser.providerData.map((p) => p.providerId).join(", ")}`
  );

  // Firestore data
  console.log("\n💾 Firestore:");
  if (firestoreData) {
    console.log(`  - Display Name: ${firestoreData.displayName || "(none)"}`);
    console.log(`  - Photo URL: ${firestoreData.photoURL || "(none)"}`);
    console.log(`  - Avatar: ${firestoreData.avatar || "(none)"}`);
    console.log(`  - Username: ${firestoreData.username || "(none)"}`);
  } else {
    console.log("  ❌ No Firestore document found!");
  }

  // Check if photo URLs match
  if (authUser.photoURL && firestoreData?.photoURL !== authUser.photoURL) {
    console.log(
      "\n⚠️  WARNING: Auth photoURL doesn't match Firestore photoURL!"
    );
    console.log(`  Auth:      ${authUser.photoURL}`);
    console.log(`  Firestore: ${firestoreData?.photoURL}`);
  }
}

/**
 * Main debug function
 */
async function debugAllUsers() {
  console.log("🔍 Debugging User Photos...\n");

  try {
    const listUsersResult = await auth.listUsers(1000);

    console.log(`Found ${listUsersResult.users.length} users total\n`);

    // Separate users with and without photos
    const usersWithPhotos = [];
    const usersWithoutPhotos = [];

    for (const authUser of listUsersResult.users) {
      await debugUser(authUser);

      if (authUser.photoURL) {
        usersWithPhotos.push(authUser.email || authUser.uid);
      } else {
        usersWithoutPhotos.push(authUser.email || authUser.uid);
      }
    }

    // Summary
    console.log("\n" + "=".repeat(80));
    console.log("📊 SUMMARY");
    console.log("=".repeat(80));
    console.log(`\n✅ Users WITH photos (${usersWithPhotos.length}):`);
    usersWithPhotos.forEach((email) => console.log(`  - ${email}`));

    console.log(`\n❌ Users WITHOUT photos (${usersWithoutPhotos.length}):`);
    usersWithoutPhotos.forEach((email) => console.log(`  - ${email}`));

    console.log(
      "\n💡 TIP: Users without photos can upload custom photos via Profile Settings."
    );
    console.log(
      "   Or if they signed in with Google, their photoURL might not be set."
    );
    console.log("   Check if they need to re-authenticate with Google.\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Debug failed:", error);
    process.exit(1);
  }
}

// Run debug
debugAllUsers();
