/**
 * Create Tab Draft Model
 *
 * Represents a work-in-progress sequence draft for a specific Create tab.
 * Stored in localStorage for persistence across sessions.
 *
 * Key differences from DraftSequence.ts:
 * - Tab-specific (not session-based)
 * - LocalStorage (not Firebase)
 * - One draft per tab maximum
 */

import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import type { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";

/**
 * Tab IDs that support drafts
 * Note: "generator" is excluded - Generate tab has no start screen
 */
export type DraftableTabId = "assembler" | "constructor";

/**
 * Draft data stored in localStorage
 */
export interface CreateTabDraft {
	/** Unique draft ID */
	readonly id: string;

	/** Tab this draft belongs to */
	readonly tabId: DraftableTabId;

	/** Full sequence data */
	readonly sequence: SequenceData;

	/** Grid mode at time of save */
	readonly gridMode: GridMode;

	/** Number of beats (for quick display without parsing sequence) */
	readonly beatCount: number;

	/** Base64 thumbnail image (optional, generated async) */
	readonly thumbnailDataUrl?: string;

	/** Unix timestamp when draft was created */
	readonly createdAt: number;

	/** Unix timestamp when draft was last updated */
	readonly updatedAt: number;
}

/**
 * Options for creating a new draft
 */
export interface CreateDraftOptions {
	tabId: DraftableTabId;
	sequence: SequenceData;
	gridMode: GridMode;
	thumbnailDataUrl?: string;
}

/**
 * Create a new draft from current tab state
 */
export function createTabDraft(options: CreateDraftOptions): CreateTabDraft {
	const now = Date.now();

	return {
		id: crypto.randomUUID(),
		tabId: options.tabId,
		sequence: options.sequence,
		gridMode: options.gridMode,
		beatCount: options.sequence.beats?.length ?? 0,
		thumbnailDataUrl: options.thumbnailDataUrl,
		createdAt: now,
		updatedAt: now,
	};
}

/**
 * Update an existing draft (preserves createdAt, updates updatedAt)
 */
export function updateTabDraft(
	draft: CreateTabDraft,
	updates: Partial<Pick<CreateTabDraft, "sequence" | "gridMode" | "thumbnailDataUrl">>
): CreateTabDraft {
	return {
		...draft,
		...updates,
		beatCount: updates.sequence?.beats?.length ?? draft.beatCount,
		updatedAt: Date.now(),
	};
}

/**
 * Check if a draft has meaningful content worth saving
 */
export function isDraftWorthSaving(draft: CreateTabDraft): boolean {
	const seq = draft.sequence;

	// Has beats?
	if (seq.beats && seq.beats.length > 0) return true;

	// Has start position?
	if (seq.startPosition || seq.startingPositionBeat) return true;

	return false;
}

/**
 * Format draft age for display (e.g., "2h ago", "1d ago")
 */
export function formatDraftAge(draft: CreateTabDraft): string {
	const now = Date.now();
	const diff = now - draft.updatedAt;

	const minutes = Math.floor(diff / 60000);
	const hours = Math.floor(diff / 3600000);
	const days = Math.floor(diff / 86400000);

	if (days > 0) return `${days}d ago`;
	if (hours > 0) return `${hours}h ago`;
	if (minutes > 0) return `${minutes}m ago`;
	return "just now";
}
