#!/usr/bin/env node

/**
 * Delete the old 'cap-labels' collection from Firebase
 *
 * This script is a one-time cleanup script to remove the deprecated
 * 'cap-labels' collection after migrating to 'loop-labels'.
 *
 * Usage:
 *   node scripts/delete-cap-labels-collection.cjs
 */

const admin = require("firebase-admin");
const path = require("path");

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, "..", "serviceAccountKey.json");
let db;

try {
  const serviceAccount = require(serviceAccountPath);

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  db = admin.firestore();
} catch (error) {
  console.error("Failed to initialize Firebase:", error.message);
  console.error("Make sure serviceAccountKey.json exists in the project root.");
  process.exit(1);
}

async function deleteOldCollection() {
  console.log("\n=== Delete Old cap-labels Collection ===\n");

  try {
    // Get all documents from cap-labels
    console.log("Reading documents from cap-labels...");
    const oldCollectionRef = db.collection("cap-labels");
    const snapshot = await oldCollectionRef.get();

    if (snapshot.empty) {
      console.log("cap-labels collection is already empty or does not exist.");
      process.exit(0);
    }

    console.log(`Found ${snapshot.size} documents to delete.\n`);

    // Delete all documents
    console.log("Deleting documents...");
    const batch = db.batch();
    snapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(
      `✓ Successfully deleted ${snapshot.size} documents from cap-labels.\n`
    );
    console.log("=== Cleanup Complete ===\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Deletion failed:", error.message);
    console.error(error);
    process.exit(1);
  }
}

deleteOldCollection();
