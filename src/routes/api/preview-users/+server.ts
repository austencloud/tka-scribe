import type { RequestHandler } from "@sveltejs/kit";
import { json } from "@sveltejs/kit";
import admin from "firebase-admin";
import { readFileSync } from "fs";

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

  const q = (url.searchParams.get("q") || "").toLowerCase().trim();
  const limitParam = url.searchParams.get("limit");
  const limit = Math.min(Number(limitParam) || 8, 20);

  if (!q) {
    return json([]);
  }

  try {
    initAdmin();

    // Fetch a batch of users and filter client-side (Firebase Admin lacks full-text search)
    const PAGE_SIZE = 1000;
    const list = await admin.auth().listUsers(PAGE_SIZE);
    const matches = list.users
      .map((u) => ({
        id: u.uid,
        displayName: u.displayName || "",
        email: u.email || "",
        photoURL: u.photoURL || "",
      }))
      .filter((u) => {
        const haystack = `${u.displayName} ${u.email}`.toLowerCase();
        return haystack.includes(q);
      })
      .slice(0, limit);

    return json(matches);
  } catch (err: any) {
    return new Response(err?.message || "Failed to search users", {
      status: 500,
    });
  }
};
