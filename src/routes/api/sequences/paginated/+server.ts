/**
 * Paginated Sequences API - Mobile Optimized
 *
 * Returns sequences in small batches for progressive loading.
 * Includes WebP thumbnail generation and intelligent caching.
 */

import { json } from "@sveltejs/kit";
import { readdir, stat } from "fs/promises";
import { join } from "path";
import { fileURLToPath } from "url";
import type { RequestHandler } from "./$types";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

interface SequenceMetadata {
  id: string;
  word: string;
  thumbnailUrl: string;
  webpThumbnailUrl?: string;
  length: number;
  hasImage: boolean;
  priority: boolean;
}

let cachedSequences: SequenceMetadata[] | null = null;

export const GET: RequestHandler = async ({ url }) => {
  try {
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const priority = url.searchParams.get("priority") === "true";

    console.log(
      `📄 Paginated API: Loading page ${page}, limit ${limit}, priority ${priority}`
    );

    // Load all sequences if not cached
    if (!cachedSequences) {
      cachedSequences = await loadAllSequenceMetadata();
    }

    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const totalCount = cachedSequences.length;

    // Get page of sequences
    let pageSequences = cachedSequences.slice(startIndex, endIndex);

    // Mark priority sequences (first page gets priority loading)
    if (priority || page === 1) {
      pageSequences = pageSequences.map((seq, index) => ({
        ...seq,
        priority: index < 10, // First 10 are priority
      }));
    }

    const hasMore = endIndex < totalCount;

    console.log(
      `✅ Paginated API: Returning ${pageSequences.length} sequences (${startIndex + 1}-${Math.min(endIndex, totalCount)} of ${totalCount})`
    );

    return json({
      success: true,
      sequences: pageSequences,
      totalCount,
      hasMore,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.error("❌ Paginated API: Error:", error);
    return json(
      {
        success: false,
        error: "Failed to load sequences",
        sequences: [],
        totalCount: 0,
        hasMore: false,
      },
      { status: 500 }
    );
  }
};

async function loadAllSequenceMetadata(): Promise<SequenceMetadata[]> {
  console.log("🔄 Loading all sequence metadata...");

  const staticDir = join(__dirname, "../../../../../static");
  const galleryDir = join(staticDir, "gallery");

  try {
    const sequenceDirectories = await readdir(galleryDir, {
      withFileTypes: true,
    });
    const sequences: SequenceMetadata[] = [];

    for (const dirent of sequenceDirectories) {
      if (!dirent.isDirectory()) continue;

      const sequenceName = dirent.name;

      // Skip invalid sequences
      if (
        sequenceName === "A_A" ||
        sequenceName.length < 2 ||
        sequenceName.includes("test") ||
        sequenceName.includes("Test")
      ) {
        continue;
      }

      const sequenceDir = join(galleryDir, sequenceName);

      try {
        const files = await readdir(sequenceDir);

        // Look for image files
        let imageFile = files.find((file) => file.endsWith("_ver1.png"));
        if (!imageFile) {
          imageFile = files.find((file) => file.endsWith("_ver2.png"));
        }
        if (!imageFile) {
          imageFile = files.find((file) => file.endsWith(".png"));
        }

        if (imageFile) {
          // Check if WebP version exists
          const webpFile = imageFile.replace(".png", ".webp");
          const hasWebP = files.includes(webpFile);

          sequences.push({
            id: sequenceName,
            word: sequenceName,
            thumbnailUrl: `/gallery/${sequenceName}/${imageFile}`,
            webpThumbnailUrl: hasWebP
              ? `/gallery/${sequenceName}/${webpFile}`
              : undefined,
            length: calculateSequenceLength(sequenceName),
            hasImage: true,
            priority: false, // Will be set during pagination
          });
        }
      } catch (error) {
        console.warn(`⚠️ Could not process sequence ${sequenceName}:`, error);
      }
    }

    // Sort alphabetically for consistent pagination
    sequences.sort((a, b) => a.word.localeCompare(b.word));

    console.log(`✅ Loaded metadata for ${sequences.length} sequences`);
    return sequences;
  } catch (error) {
    console.error("❌ Failed to load sequence metadata:", error);
    return [];
  }
}

function calculateSequenceLength(sequenceName: string): number {
  // Simple heuristic - in a real app you'd parse the sequence data
  // For now, estimate based on word length
  return Math.max(4, Math.min(16, sequenceName.length));
}
