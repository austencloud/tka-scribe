/**
 * Delete all thumbnails from Firebase Storage
 * They will be lazily recreated with correct prop types
 */
import admin from "firebase-admin";
import { readFileSync } from "fs";

// Load service account key
const serviceAccount = JSON.parse(
  readFileSync("./serviceAccountKey.json", "utf8")
);

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "the-kinetic-alphabet.firebasestorage.app",
  });
}

const bucket = admin.storage().bucket();

async function deleteAllThumbnails() {
  console.log("🗑️  Deleting all thumbnails from Firebase Storage...\n");

  try {
    // List all files in the thumbnails folder
    const [files] = await bucket.getFiles({ prefix: "thumbnails/" });

    if (files.length === 0) {
      console.log("No thumbnails found.");
      return;
    }

    console.log(`Found ${files.length} thumbnail files to delete.\n`);

    // Delete in batches of 100
    const batchSize = 100;
    let deleted = 0;

    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      await Promise.all(batch.map((file) => file.delete()));
      deleted += batch.length;
      console.log(`Deleted ${deleted}/${files.length} files...`);
    }

    console.log(`\n✅ Successfully deleted ${deleted} thumbnail files.`);
    console.log("Thumbnails will be lazily recreated with correct prop types.");
  } catch (error) {
    console.error("Error deleting thumbnails:", error.message);
    process.exit(1);
  }
}

deleteAllThumbnails();
