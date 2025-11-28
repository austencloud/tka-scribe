import type { ISequencePersistenceService } from "$lib/modules/create/shared/services/contracts";
import { resolve } from "$shared/inversify";
import { TYPES } from "$shared/inversify/types";
import type { ISequenceRenderService } from "$lib/shared/render/services/contracts";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json() as { beatSize?: unknown };
    const beatSizeValue = body.beatSize;

    // Resolve services
    const renderService = resolve<ISequenceRenderService>(
      TYPES.ISequenceRenderService
    );
    const persistenceService = resolve<ISequencePersistenceService>(
      TYPES.ISequencePersistenceService
    );

    // Load current sequence
    const state = await persistenceService.loadCurrentState();
    if (!state?.currentSequence) {
      return json({ error: "No sequence loaded" }, { status: 400 });
    }

    // Render with specified beatSize
    const beatSize =
      typeof beatSizeValue === "string" ? parseInt(beatSizeValue, 10) :
      typeof beatSizeValue === "number" ? beatSizeValue :
      144;

    const blob = await renderService.renderSequenceToBlob(
      state.currentSequence,
      {
        beatSize,
        includeStartPosition: true,
        addBeatNumbers: false,
        addWord: false,
        addUserInfo: false,
        beatScale: 1.0,
        format: "PNG",
        quality: 1.0,
      }
    );

    return new Response(blob, {
      headers: {
        "Content-Type": "image/png",
      },
    });
  } catch (error) {
    console.error("Test render failed:", error);
    return json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
};
