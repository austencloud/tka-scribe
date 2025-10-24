import type { ISequencePersistenceService } from "$lib/modules/build/shared/services/contracts";
import { resolve, TYPES } from "$lib/shared";
import type { ISequenceRenderService } from "$lib/shared/render/services/contracts";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { beatSize } = await request.json();

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
    const blob = await renderService.renderSequenceToBlob(
      state.currentSequence,
      {
        beatSize: parseInt(beatSize) || 144,
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
