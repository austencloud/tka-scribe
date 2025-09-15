import { writable } from "svelte/store";
import type { PictographData } from "$legacyLib/types/PictographData";

export const selectedPictograph = writable<PictographData | null>(null);
