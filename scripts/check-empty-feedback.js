/**
 * Check for empty/broken feedback items
 */

import admin from "firebase-admin";
import { readFileSync } from "fs";

const serviceAccount = JSON.parse(
  readFileSync("./serviceAccountKey.json", "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function findEmptyItems() {
  const snapshot = await db.collection("feedback").get();

  const empty = [];
  const missingTitle = [];
  const missingDesc = [];

  snapshot.forEach((doc) => {
    const d = doc.data();
    const hasTitle = d.title && d.title.trim().length > 0;
    const hasDesc = d.description && d.description.trim().length > 0;

    if (!hasTitle && !hasDesc) {
      empty.push({ id: doc.id, data: d });
    } else if (!hasTitle) {
      missingTitle.push({
        id: doc.id,
        desc: (d.description || "").substring(0, 50),
        status: d.status,
      });
    } else if (!hasDesc) {
      missingDesc.push({
        id: doc.id,
        title: (d.title || "").substring(0, 50),
        status: d.status,
      });
    }
  });

  console.log("=== COMPLETELY EMPTY (no title AND no description) ===");
  console.log("Count:", empty.length);
  empty.forEach((item) => {
    console.log("---");
    console.log("ID:", item.id);
    console.log("All fields:", JSON.stringify(item.data, null, 2));
  });

  console.log("\n=== MISSING TITLE ===");
  console.log("Count:", missingTitle.length);
  missingTitle.forEach((item) => {
    console.log("  -", item.id, "| desc:", item.desc, "| status:", item.status);
  });

  console.log("\n=== MISSING DESCRIPTION ===");
  console.log("Count:", missingDesc.length);
  missingDesc.forEach((item) => {
    console.log(
      "  -",
      item.id,
      "| title:",
      item.title,
      "| status:",
      item.status
    );
  });

  console.log("\n=== SUMMARY ===");
  console.log("Total items:", snapshot.size);
  console.log("Completely empty:", empty.length);
  console.log("Missing title:", missingTitle.length);
  console.log("Missing description:", missingDesc.length);
}

findEmptyItems()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
