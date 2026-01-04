#!/usr/bin/env node

/**
 * Migration script: Rename Firebase collection from 'loop-labels' to 'loop-labels'
 *
 * This script copies all documents from the old 'loop-labels' collection to the new
 * 'loop-labels' collection, preserving document IDs and all data.
 *
 * Usage:
 *   node scripts/migrate-loop-labels-collection.js [--delete-old]
 *
 * Options:
 *   --delete-old  Delete the old 'loop-labels' collection after successful migration
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

async function migrateCollection() {
  const deleteOld = process.argv.includes("--delete-old");

  console.log("\n=== Firebase Collection Migration ===");
  console.log("From: loop-labels");
  console.log("To:   loop-labels");
  console.log(`Delete old collection: ${deleteOld ? "YES" : "NO"}\n`);

  try {
    // Step 1: Get all documents from loop-labels
    console.log("Step 1: Reading documents from loop-labels...");
    const oldCollectionRef = db.collection("loop-labels");
    const snapshot = await oldCollectionRef.get();

    if (snapshot.empty) {
      console.log(
        "No documents found in loop-labels collection. Nothing to migrate."
      );
      process.exit(0);
    }

    console.log(`Found ${snapshot.size} documents to migrate.\n`);

    // Step 2: Copy documents to loop-labels
    console.log("Step 2: Copying documents to loop-labels...");
    const newCollectionRef = db.collection("loop-labels");
    const batch = db.batch();
    let count = 0;

    snapshot.forEach((doc) => {
      const newDocRef = newCollectionRef.doc(doc.id);
      batch.set(newDocRef, doc.data());
      count++;

      if (count % 100 === 0) {
        console.log(`  Queued ${count}/${snapshot.size} documents...`);
      }
    });

    console.log(`  Queued all ${count} documents. Committing batch...`);
    await batch.commit();
    console.log(`✓ Successfully copied ${count} documents to loop-labels.\n`);

    // Step 3: Verify migration
    console.log("Step 3: Verifying migration...");
    const newSnapshot = await newCollectionRef.get();

    if (newSnapshot.size !== snapshot.size) {
      throw new Error(
        `Verification failed: loop-labels has ${newSnapshot.size} documents, ` +
          `but loop-labels had ${snapshot.size} documents.`
      );
    }

    console.log(
      `✓ Verification passed: ${newSnapshot.size} documents in loop-labels.\n`
    );

    // Step 4: Delete old collection (if requested)
    if (deleteOld) {
      console.log("Step 4: Deleting old loop-labels collection...");
      const deleteBatch = db.batch();
      snapshot.forEach((doc) => {
        deleteBatch.delete(doc.ref);
      });

      await deleteBatch.commit();
      console.log(`✓ Deleted ${snapshot.size} documents from loop-labels.\n`);
    } else {
      console.log("Step 4: Skipped (old collection preserved).\n");
      console.log("To delete the old collection, run:");
      console.log(
        "  node scripts/migrate-loop-labels-collection.js --delete-old\n"
      );
    }

    console.log("=== Migration Complete ===\n");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Migration failed:", error.message);
    console.error(error);
    process.exit(1);
  }
}

migrateCollection();
