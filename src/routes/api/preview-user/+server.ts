/**
 * User Preview API
 *
 * Fetches comprehensive user data for admin preview.
 * Returns profile, gamification, sequences, collections, achievements, notifications.
 * Read-only - never modifies user data.
 */
import type { RequestHandler } from "@sveltejs/kit";
import { json } from "@sveltejs/kit";
import { readFileSync, existsSync } from "fs";
import admin from "firebase-admin";

// Gate this endpoint to explicit opt-in
const ALLOW = process.env.ALLOW_PREVIEW_NOTIFICATIONS === "true";

let adminInitialized = false;
function initAdmin() {
  if (adminInitialized) return;
  if (!existsSync("serviceAccountKey.json")) {
    throw new Error("Service account key not found");
  }
  const serviceAccount = JSON.parse(
    readFileSync("serviceAccountKey.json", "utf8")
  );
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  adminInitialized = true;
}

function formatTimestamp(ts: admin.firestore.Timestamp | Date | string | null | undefined): string | null {
  if (!ts) return null;
  if (typeof ts === "string") return ts;
  if (ts instanceof Date) return ts.toISOString();
  if (typeof ts === "object" && "toDate" in ts) {
    return ts.toDate().toISOString();
  }
  return null;
}

export const GET: RequestHandler = async ({ url }) => {
  if (!ALLOW) {
    return new Response("Preview disabled", { status: 403 });
  }

  const userId = url.searchParams.get("userId");
  const section = url.searchParams.get("section"); // Optional: fetch only one section
  const sections = url.searchParams.get("sections"); // Optional: fetch multiple sections (comma-separated)

  if (!userId) {
    return new Response("Missing userId", { status: 400 });
  }

  try {
    initAdmin();
    const db = admin.firestore();

    // If a single specific section is requested, only fetch that
    if (section) {
      const sectionData = await fetchSection(db, userId, section);
      return json(sectionData);
    }

    // If multiple sections are specified (e.g., "profile,gamification"), only fetch those
    if (sections) {
      const requestedSections = sections.split(",").map(s => s.trim());
      const result: Record<string, unknown> = {};

      // Fetch requested sections in parallel
      const promises: Promise<void>[] = [];

      if (requestedSections.includes("profile")) {
        promises.push(fetchProfile(db, userId).then(data => { result.profile = data; }));
      }
      if (requestedSections.includes("gamification")) {
        promises.push(fetchGamification(db, userId).then(data => { result.gamification = data; }));
      }
      if (requestedSections.includes("sequences")) {
        promises.push(fetchSequences(db, userId).then(data => { result.sequences = data; }));
      }
      if (requestedSections.includes("collections")) {
        promises.push(fetchCollections(db, userId).then(data => { result.collections = data; }));
      }
      if (requestedSections.includes("achievements")) {
        promises.push(fetchAchievements(db, userId).then(data => { result.achievements = data; }));
      }
      if (requestedSections.includes("notifications")) {
        promises.push(fetchNotifications(db, userId).then(data => { result.notifications = data; }));
      }

      await Promise.all(promises);
      return json(result);
    }

    // Default: fetch all data in parallel
    const [profile, gamification, sequences, collections, achievements, notifications] =
      await Promise.all([
        fetchProfile(db, userId),
        fetchGamification(db, userId),
        fetchSequences(db, userId),
        fetchCollections(db, userId),
        fetchAchievements(db, userId),
        fetchNotifications(db, userId),
      ]);

    return json({
      profile,
      gamification,
      sequences,
      collections,
      achievements,
      notifications,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch user preview";
    console.error("Preview user API error:", message);
    return new Response(message, { status: 500 });
  }
};

async function fetchSection(
  db: admin.firestore.Firestore,
  userId: string,
  section: string
) {
  switch (section) {
    case "sequences":
      return { sequences: await fetchSequences(db, userId) };
    case "collections":
      return { collections: await fetchCollections(db, userId) };
    case "achievements":
      return { achievements: await fetchAchievements(db, userId) };
    case "notifications":
      return { notifications: await fetchNotifications(db, userId) };
    default:
      return {};
  }
}

async function fetchProfile(db: admin.firestore.Firestore, userId: string) {
  try {
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      // Fall back to Firebase Auth data
      const authUser = await admin.auth().getUser(userId);
      return {
        uid: authUser.uid,
        email: authUser.email || null,
        displayName: authUser.displayName || null,
        photoURL: authUser.photoURL || null,
        username: authUser.email?.split("@")[0] || null,
        role: "user",
        createdAt: authUser.metadata.creationTime || null,
        lastActivityDate: authUser.metadata.lastSignInTime || null,
      };
    }

    const data = userDoc.data()!;
    return {
      uid: userId,
      email: data.email || null,
      displayName: data.displayName || null,
      photoURL: data.photoURL || data.avatar || null,
      username: data.username || null,
      role: data.role || (data.isAdmin ? "admin" : "user"),
      createdAt: formatTimestamp(data.createdAt),
      lastActivityDate: formatTimestamp(data.lastActivityDate),
    };
  } catch (err) {
    console.error("Failed to fetch profile:", err);
    return null;
  }
}

async function fetchGamification(db: admin.firestore.Firestore, userId: string) {
  try {
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return null;
    }

    const data = userDoc.data()!;
    return {
      totalXP: data.totalXP || 0,
      currentLevel: data.currentLevel || 1,
      achievementCount: data.achievementCount || 0,
      currentStreak: data.currentStreak || 0,
      longestStreak: data.longestStreak || 0,
    };
  } catch (err) {
    console.error("Failed to fetch gamification:", err);
    return null;
  }
}

async function fetchSequences(db: admin.firestore.Firestore, userId: string) {
  try {
    const snap = await db
      .collection("sequences")
      .where("createdBy", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    return snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || "Untitled",
        word: data.word || null,
        thumbnailUrl: data.thumbnailUrl || null,
        createdAt: formatTimestamp(data.createdAt),
        isPublic: data.isPublic || false,
        favoriteCount: data.favoriteCount || 0,
      };
    });
  } catch (err) {
    console.error("Failed to fetch sequences:", err);
    return [];
  }
}

async function fetchCollections(db: admin.firestore.Firestore, userId: string) {
  try {
    const snap = await db
      .collection("users")
      .doc(userId)
      .collection("collections")
      .orderBy("createdAt", "desc")
      .limit(30)
      .get();

    return snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || "Untitled",
        description: data.description || null,
        sequenceCount: data.sequenceCount || 0,
        isSystem: data.isSystem || false,
        createdAt: formatTimestamp(data.createdAt),
      };
    });
  } catch (err) {
    console.error("Failed to fetch collections:", err);
    return [];
  }
}

async function fetchAchievements(db: admin.firestore.Firestore, userId: string) {
  try {
    const snap = await db
      .collection("users")
      .doc(userId)
      .collection("achievements")
      .orderBy("unlockedAt", "desc")
      .limit(50)
      .get();

    return snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || data.achievementId || doc.id,
        description: data.description || null,
        icon: data.icon || null,
        unlockedAt: formatTimestamp(data.unlockedAt),
      };
    });
  } catch (err) {
    console.error("Failed to fetch achievements:", err);
    return [];
  }
}

async function fetchNotifications(db: admin.firestore.Firestore, userId: string) {
  try {
    const snap = await db
      .collection("users")
      .doc(userId)
      .collection("notifications")
      .orderBy("createdAt", "desc")
      .limit(30)
      .get();

    return snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        type: data.type || "general",
        title: data.title || null,
        message: data.message || null,
        read: data.read || false,
        createdAt: formatTimestamp(data.createdAt),
      };
    });
  } catch (err) {
    console.error("Failed to fetch notifications:", err);
    return [];
  }
}
