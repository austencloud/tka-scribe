/**
 * Fetch LOOP Labels from Firebase
 *
 * Usage: node scripts/fetch-cap-labels.cjs [command] [args]
 *
 * Examples:
 *   node scripts/fetch-cap-labels.cjs              # List all labels
 *   node scripts/fetch-cap-labels.cjs AABB         # Get specific label
 *   node scripts/fetch-cap-labels.cjs --stats      # Show statistics
 *   node scripts/fetch-cap-labels.cjs --note AABB "My note here"  # Add note to label
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
  console.error("Make sure deployment/serviceAccountKey.json exists");
  process.exit(1);
}

async function fetchAllLabels() {
  const snapshot = await db.collection("cap-labels").get();
  const labels = [];

  snapshot.forEach((doc) => {
    labels.push({ word: doc.id, ...doc.data() });
  });

  return labels;
}

async function fetchLabel(word) {
  const doc = await db.collection("cap-labels").doc(word).get();

  if (!doc.exists) {
    return null;
  }

  return { word: doc.id, ...doc.data() };
}

async function addNoteToLabel(word, note) {
  const docRef = db.collection("cap-labels").doc(word);
  const doc = await docRef.get();

  if (!doc.exists) {
    console.log(`No label found for "${word}"`);
    return false;
  }

  const existingData = doc.data();
  const existingNotes = existingData.notes || "";
  const timestamp = new Date().toISOString().split("T")[0];

  // Append new note with timestamp
  const newNotes = existingNotes
    ? `${existingNotes}\n\n[${timestamp}] ${note}`
    : `[${timestamp}] ${note}`;

  await docRef.update({
    notes: newNotes,
    updatedAt: new Date().toISOString(),
  });

  console.log(`Added note to "${word}":`);
  console.log(`  ${note}`);
  return true;
}

async function setNoteForLabel(word, note) {
  const docRef = db.collection("cap-labels").doc(word);
  const doc = await docRef.get();

  if (!doc.exists) {
    console.log(`No label found for "${word}"`);
    return false;
  }

  await docRef.update({
    notes: note,
    updatedAt: new Date().toISOString(),
  });

  console.log(`Set note for "${word}":`);
  console.log(`  ${note}`);
  return true;
}

function formatDesignation(d) {
  if (!d.components || d.components.length === 0) return "Freeform";
  return d.components
    .map((c) => c.charAt(0).toUpperCase() + c.slice(1))
    .join(" + ");
}

function formatSectionBeats(beats) {
  if (!beats || beats.length === 0) return "";
  if (beats.length === 1) return `Beat ${beats[0]}`;
  const sorted = [...beats].sort((a, b) => a - b);
  // Check if consecutive
  let isConsecutive = true;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] !== sorted[i - 1] + 1) {
      isConsecutive = false;
      break;
    }
  }
  if (isConsecutive) {
    return `Beats ${sorted[0]}-${sorted[sorted.length - 1]}`;
  }
  return `Beats ${sorted.join(", ")}`;
}

function printLabel(label) {
  console.log("\n" + "=".repeat(50));
  console.log(`Sequence: ${label.word}`);
  console.log("=".repeat(50));

  if (label.isFreeform) {
    console.log("Type: Freeform (no recognizable pattern)");
  } else if (label.designations && label.designations.length > 0) {
    console.log("Designations (Whole Sequence):");
    label.designations.forEach((d, i) => {
      const formatted = formatDesignation(d);
      console.log(`  ${i + 1}. ${formatted}`);
      if (d.loopType) {
        console.log(`     LOOP Type: ${d.loopType}`);
      }
    });
  }

  // Print sections if present
  if (label.sections && label.sections.length > 0) {
    console.log("\nSections:");
    label.sections.forEach((s, i) => {
      const beats = formatSectionBeats(s.beats);
      const components = formatDesignation(s);
      const baseWord = s.baseWord ? ` [${s.baseWord.toUpperCase()}]` : "";
      console.log(`  ${i + 1}. ${beats}: ${components}${baseWord}`);
      if (s.loopType) {
        console.log(`     LOOP Type: ${s.loopType}`);
      }
    });
  }

  // Print beat pairs if present
  if (label.beatPairs && label.beatPairs.length > 0) {
    console.log("\nBeat Pairs:");
    label.beatPairs.forEach((bp, i) => {
      const transformation = bp.confirmedTransformation || "unknown";
      const detected = bp.detectedTransformations?.join(", ") || "";
      console.log(
        `  ${i + 1}. Beat ${bp.keyBeat} ↔ Beat ${bp.correspondingBeat}: ${transformation}`
      );
      if (detected && detected !== transformation) {
        console.log(`     (Detected: ${detected})`);
      }
    });
  }

  if (label.notes) {
    console.log(`\nNotes: ${label.notes}`);
  }

  console.log(`\nLabeled: ${label.labeledAt}`);
  if (label.updatedAt) {
    console.log(`Updated: ${label.updatedAt}`);
  }
}

function printStats(labels) {
  console.log("\n" + "=".repeat(50));
  console.log("LOOP Labels Statistics");
  console.log("=".repeat(50));

  console.log(`\nTotal labeled: ${labels.length}`);

  // Count by type
  const componentCounts = {};
  let freeformCount = 0;

  labels.forEach((label) => {
    if (label.isFreeform) {
      freeformCount++;
    } else if (label.designations) {
      label.designations.forEach((d) => {
        d.components?.forEach((c) => {
          componentCounts[c] = (componentCounts[c] || 0) + 1;
        });
      });
    }
  });

  console.log(`\nFreeform: ${freeformCount}`);
  console.log("\nComponent usage:");
  Object.entries(componentCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([comp, count]) => {
      console.log(`  ${comp}: ${count}`);
    });

  // Recent labels
  const sorted = [...labels].sort(
    (a, b) => new Date(b.labeledAt || 0) - new Date(a.labeledAt || 0)
  );

  console.log("\nMost recent labels:");
  sorted.slice(0, 5).forEach((label) => {
    const designations = label.isFreeform
      ? "Freeform"
      : label.designations?.map(formatDesignation).join(" OR ") || "Unknown";
    console.log(`  ${label.word}: ${designations}`);
  });
}

async function main() {
  const arg = process.argv[2];
  const arg2 = process.argv[3];
  const arg3 = process.argv.slice(4).join(" ");

  try {
    if (!arg) {
      // List all labels
      const labels = await fetchAllLabels();

      if (labels.length === 0) {
        console.log("No labels found in Firebase.");
        return;
      }

      console.log(`Found ${labels.length} labeled sequences:\n`);
      labels.forEach((label) => {
        const designations = label.isFreeform
          ? "Freeform"
          : label.designations?.map(formatDesignation).join(" OR ") ||
            "Unknown";
        console.log(`${label.word}: ${designations}`);
      });
    } else if (arg === "--stats") {
      const labels = await fetchAllLabels();
      printStats(labels);
    } else if (arg === "--note") {
      // Add note to label: --note WORD "note text"
      if (!arg2 || !arg3) {
        console.log('Usage: --note WORD "note text"');
        console.log('Example: --note AABB "This is NOT rotated because..."');
        return;
      }
      await addNoteToLabel(arg2, arg3);
    } else if (arg === "--set-note") {
      // Replace note for label: --set-note WORD "note text"
      if (!arg2) {
        console.log('Usage: --set-note WORD "note text"');
        return;
      }
      await setNoteForLabel(arg2, arg3 || "");
    } else {
      // Fetch specific label
      const label = await fetchLabel(arg);

      if (!label) {
        console.log(`No label found for "${arg}"`);
        return;
      }

      printLabel(label);
    }
  } catch (error) {
    console.error("Error:", error.message);
  }

  process.exit(0);
}

main();
