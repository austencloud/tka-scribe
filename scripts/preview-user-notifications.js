/**
 * Preview user notifications (read-only)
 *
 * Usage:
 *   node scripts/preview-user-notifications.js <userId> [limit]
 *
 * Examples:
 *   node scripts/preview-user-notifications.js 4hj63NCBJuWzeomfKI2rYY1DNa62
 *   node scripts/preview-user-notifications.js 4hj63NCBJuWzeomfKI2rYY1DNa62 10
 *
 * Notes:
 * - Uses serviceAccountKey.json (admin SDK) and does NOT mark notifications as read.
 * - Intended for QA/debug to see what a user would see without mutating their state.
 */

import admin from "firebase-admin";
import { readFileSync } from "fs";

if (process.argv.length < 3) {
  console.error("\nUsage: node scripts/preview-user-notifications.js <userId> [limit]\n");
  process.exit(1);
}

const userId = process.argv[2];
const limit = Number(process.argv[3] || 20);

// Initialize Firebase Admin
const serviceAccount = JSON.parse(readFileSync("./serviceAccountKey.json", "utf8"));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function main() {
  const ref = db
    .collection("users")
    .doc(userId)
    .collection("notifications")
    .orderBy("createdAt", "desc")
    .limit(limit);

  const snap = await ref.get();

  if (snap.empty) {
    console.log(`No notifications found for user ${userId}`);
    return;
  }

  console.log(`Notifications for ${userId} (newest first, max ${limit}):\n`);

  snap.forEach((doc) => {
    const data = doc.data();
    const createdAt =
      data.createdAt?.toDate?.()?.toISOString?.() ||
      data.createdAt?.toISOString?.() ||
      "unknown";
    const summary = {
      id: doc.id,
      type: data.type,
      title: data.title,
      feedbackTitle: data.feedbackTitle,
      message: data.message,
      actionUrl: data.actionUrl,
      feedbackId: data.feedbackId,
      read: data.read,
      createdAt,
    };
    console.log(JSON.stringify(summary, null, 2));
  });
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error previewing notifications:", err.message);
    process.exit(1);
  });
