/**
 * YouTube Audio Extract API Route
 *
 * Triggers the Firebase Cloud Function to extract audio from a YouTube video.
 * Acts as a proxy to handle authentication and provide a consistent API.
 */

import { json, error } from "@sveltejs/kit";
import { FIREBASE_FUNCTIONS_URL } from "$env/static/private";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!FIREBASE_FUNCTIONS_URL) {
    console.error("FIREBASE_FUNCTIONS_URL environment variable not set");
    throw error(500, "Audio extraction service not configured");
  }

  try {
    const body = await request.json();
    const { videoId, quality = "medium" } = body;

    if (!videoId) {
      throw error(400, "Missing videoId");
    }

    // Validate videoId format (11 characters, alphanumeric with - and _)
    if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      throw error(400, "Invalid videoId format");
    }

    // Get user ID from session if available (for tracking)
    // The Cloud Function will verify the token separately
    let userId = "anonymous";
    try {
      // @ts-ignore - locals may have session
      const session = locals.session;
      if (session?.user?.uid) {
        userId = session.user.uid;
      }
    } catch {
      // Session not available, continue as anonymous
    }

    console.log(`Requesting audio extraction for video: ${videoId}, quality: ${quality}`);

    // Call the Firebase Cloud Function
    const response = await fetch(`${FIREBASE_FUNCTIONS_URL}/youtubeExtractAudio`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        videoId,
        userId,
        quality,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Extraction failed" }));
      console.error("Cloud Function error:", errorData);

      // Map common errors to user-friendly messages
      if (response.status === 404) {
        throw error(404, "Video not found or unavailable");
      }
      if (response.status === 403) {
        throw error(403, "Video is age-restricted or region-blocked");
      }
      if (response.status === 429) {
        throw error(429, "Too many requests. Please try again later.");
      }

      throw error(response.status, errorData.error || "Failed to extract audio");
    }

    const data = await response.json();

    // Return the Cloud Function response
    return json({
      success: data.success,
      audioUrl: data.audioUrl,
      metadata: data.metadata,
    });
  } catch (err) {
    console.error("Extract audio error:", err);

    if ((err as any).status) {
      throw err;
    }

    throw error(500, "Failed to extract audio from YouTube");
  }
};
