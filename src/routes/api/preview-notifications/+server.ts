import type { RequestHandler } from "@sveltejs/kit";
import { json } from "@sveltejs/kit";
import { readFileSync } from "fs";
import admin from "firebase-admin";

// Gate this endpoint to explicit opt-in
const ALLOW = process.env.ALLOW_PREVIEW_NOTIFICATIONS === "true";

let adminInitialized = false;
function initAdmin() {
  if (adminInitialized) return;
  const serviceAccount = JSON.parse(
    readFileSync("serviceAccountKey.json", "utf8")
  );
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  adminInitialized = true;
}

export const GET: RequestHandler = async ({ url }) => {
  if (!ALLOW) {
    return new Response("Preview disabled", { status: 403 });
  }

  const userId = url.searchParams.get("userId");
  const limitParam = url.searchParams.get("limit");
  const limit = Math.min(Number(limitParam) || 20, 50);

  if (!userId) {
    return new Response("Missing userId", { status: 400 });
  }

  try {
    initAdmin();
    const db = admin.firestore();
    const snap = await db
      .collection("users")
      .doc(userId)
      .collection("notifications")
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    const items = snap.docs.map((doc) => {
      const data = doc.data() as Record<string, any>;
      return {
        id: doc.id,
        type: data.type,
        title: data.title,
        feedbackTitle: data.feedbackTitle,
        message: data.message,
        actionUrl: data.actionUrl,
        feedbackId: data.feedbackId,
        read: data.read,
        createdAt:
          data.createdAt?.toDate?.()?.toISOString?.() ||
          data.createdAt?.toISOString?.() ||
          null,
      };
    });

    return json(items);
  } catch (err: any) {
    return new Response(err?.message || "Failed to fetch preview", {
      status: 500,
    });
  }
};
