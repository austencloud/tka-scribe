/**
 * List Users from Firestore
 *
 * This script fetches all users from the Firestore "users" collection
 * using the client SDK (no admin access needed).
 *
 * Usage: node scripts/list-users.mjs
 */

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDKUM9pf0e_KgFjW1OBKChvrU75SnR12v4",
  authDomain: "the-kinetic-alphabet.firebaseapp.com",
  projectId: "the-kinetic-alphabet",
  storageBucket: "the-kinetic-alphabet.firebasestorage.app",
  messagingSenderId: "664225703033",
  appId: "1:664225703033:web:62e6c1eebe4fff3ef760a8",
  measurementId: "G-CQH94GGM6B",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

/**
 * Fetch and display all users
 */
async function listUsers() {
  console.log("🔍 Fetching users from Firestore...\n");

  try {
    // Get all users from the "users" collection
    const usersCollection = collection(firestore, "users");
    const querySnapshot = await getDocs(usersCollection);

    if (querySnapshot.empty) {
      console.log("❌ No users found in the database.");
      process.exit(0);
    }

    console.log(`✅ Found ${querySnapshot.size} users:\n`);
    console.log("=".repeat(80));

    const users = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const user = {
        uid: doc.id,
        email: data.email || "(no email)",
        displayName: data.displayName || "(no name)",
        username: data.username || "(no username)",
        photoURL: data.photoURL || data.avatar || "(no photo)",
        isAdmin: data.isAdmin || false,
        createdAt: data.createdAt?.toDate?.() || "(unknown)",
        sequenceCount: data.sequenceCount || 0,
        collectionCount: data.collectionCount || 0,
        followerCount: data.followerCount || 0,
      };

      users.push(user);

      // Display user info
      console.log(`\n👤 ${user.displayName} (@${user.username})`);
      console.log(`   Email: ${user.email}`);
      console.log(`   UID: ${user.uid}`);
      console.log(`   Admin: ${user.isAdmin ? "✅ Yes" : "❌ No"}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log(`   Sequences: ${user.sequenceCount}`);
      console.log(`   Collections: ${user.collectionCount}`);
      console.log(`   Followers: ${user.followerCount}`);
      console.log(`   Photo: ${user.photoURL}`);
      console.log("-".repeat(80));
    });

    // Summary
    console.log(`\n📊 SUMMARY:`);
    console.log(`   Total Users: ${users.length}`);
    console.log(
      `   Admins: ${users.filter((u) => u.isAdmin).length}`
    );
    console.log(
      `   Users with Photos: ${users.filter((u) => !u.photoURL.includes("(no photo)")).length}`
    );
    console.log(
      `   Total Sequences: ${users.reduce((sum, u) => sum + u.sequenceCount, 0)}`
    );

    // List admins
    const admins = users.filter((u) => u.isAdmin);
    if (admins.length > 0) {
      console.log(`\n👑 Admin Users:`);
      admins.forEach((admin) => {
        console.log(`   - ${admin.displayName} (${admin.email})`);
      });
    }

    console.log("\n");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error fetching users:", error.message);
    console.error("\nThis might happen if:");
    console.error("1. Firestore security rules don't allow reading the users collection");
    console.error("2. You need to be authenticated to read user data");
    console.error(
      "3. You need admin privileges (use the admin SDK script instead)"
    );
    console.error(
      "\n💡 Try using: node scripts/debug-user-photos.mjs (requires serviceAccountKey.json)"
    );
    process.exit(1);
  }
}

// Run the script
listUsers();
