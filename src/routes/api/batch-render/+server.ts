/**
 * Batch Render API Endpoint
 *
 * Accepts sequence data and rendering options, returns rendered image blob.
 * Used by batch-rerender-gallery.js script for server-side rendering.
 */

import type { ISequenceRenderer } from "$lib/shared/render/services/contracts/ISequenceRenderer";
import { resolve } from "$lib/shared/inversify/di";
import { TYPES } from "$lib/shared/inversify/types";
import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import type { SequenceExportOptions } from "$lib/shared/render/domain/models/SequenceExportOptions";
import type { PropType } from "$lib/shared/pictograph/prop/domain/enums/PropType";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async () => {
  return json({
    endpoint: "/api/batch-render",
    method: "POST",
    description: "Renders sequence images with optional prop type override",
    usage: {
      body: {
        sequence: "SequenceData object (required)",
        propType:
          "PropType enum value (optional) - e.g., 'staff', 'fan', 'hoop'",
        beatSize: "number (optional, default: 120)",
        format: "PNG | JPEG | WebP (optional, default: WebP)",
        quality: "number 0-1 (optional, default: 0.9)",
      },
      example: {
        sequence: {
          id: "alpha_ver1",
          word: "alpha",
          beats: "[ ... ]",
          startPosition: "{ ... }",
        },
        propType: "staff",
        beatSize: 120,
        format: "WebP",
        quality: 0.9,
      },
    },
    script: "node scripts/batch-rerender-gallery.js --prop-types=all",
  });
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = (await request.json()) as {
      sequence: SequenceData;
      propType?: PropType;
      beatSize?: number;
      format?: "PNG" | "JPEG" | "WebP";
      quality?: number;
    };

    const {
      sequence,
      propType,
      beatSize = 120,
      format = "WebP",
      quality = 0.9,
    } = body;

    if (!sequence || !sequence.beats || sequence.beats.length === 0) {
      return json({ error: "Invalid sequence data" }, { status: 400 });
    }

    // Resolve rendering service
    const renderService = resolve<ISequenceRenderer>(
      TYPES.ISequenceRenderer
    );

    // Prepare rendering options with prop type override
    const options: Partial<SequenceExportOptions> = {
      beatSize,
      format,
      quality,
      includeStartPosition: true,
      addBeatNumbers: false,
      addWord: true,
      addDifficultyLevel: true,
      addUserInfo: false,
      addReversalSymbols: false,
      combinedGrids: false,
      beatScale: 1.0,
      margin: 0,
      redVisible: true,
      blueVisible: true,
      userName: "",
      exportDate: "",
      notes: "",
      scale: 1.0,
      propTypeOverride: propType, // Apply prop type override if provided
    };

    // Render sequence to blob
    const blob = await renderService.renderSequenceToBlob(sequence, options);

    // Convert blob to buffer for response
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Return image with appropriate content type
    const contentType =
      format === "PNG"
        ? "image/png"
        : format === "JPEG"
          ? "image/jpeg"
          : "image/webp";

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Batch render failed:", error);
    return json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
};
