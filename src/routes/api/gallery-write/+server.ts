/**
 * Gallery Write API Endpoint
 *
 * Writes rendered word card images directly to static/gallery/{word}/{word}_ver1.webp
 * This is a dev tool endpoint - only works in development mode.
 */

import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { dev } from "$app/environment";

export const POST: RequestHandler = async ({ request }) => {
  // Only allow in development mode for safety
  if (!dev) {
    return json({ error: "This endpoint is only available in development mode" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;
    const word = formData.get("word") as string;

    if (!file || !word) {
      return json({ error: "Missing image or word parameter" }, { status: 400 });
    }

    // Sanitize word for filesystem (remove problematic characters)
    const safeWord = word.replace(/[<>:"/\\|?*]/g, "_");

    // Build the path: static/gallery/{word}/{word}_ver1.webp
    const galleryDir = join(process.cwd(), "static", "gallery", safeWord);
    const filePath = join(galleryDir, `${safeWord}_ver1.webp`);

    // Create directory if it doesn't exist
    if (!existsSync(galleryDir)) {
      await mkdir(galleryDir, { recursive: true });
    }

    // Convert file to buffer and write
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(filePath, buffer);

    return json({
      success: true,
      path: `static/gallery/${safeWord}/${safeWord}_ver1.webp`,
    });
  } catch (error) {
    console.error("Gallery write failed:", error);
    return json(
      { error: error instanceof Error ? error.message : "Write failed" },
      { status: 500 }
    );
  }
};

export const GET: RequestHandler = async () => {
  return json({
    endpoint: "/api/gallery-write",
    method: "POST",
    description: "Writes word card images directly to static/gallery/",
    note: "Only available in development mode",
    usage: {
      body: "FormData with 'image' (File) and 'word' (string)",
    },
  });
};
