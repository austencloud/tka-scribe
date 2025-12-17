/**
 * Create Tab Drafts State
 *
 * Manages draft sequences for Create tabs (Assemble, Construct).
 * Persists to localStorage with one draft per tab maximum.
 *
 * Note: Generator tab is excluded - it has no start screen and
 * "Generate" destroys current sequence by design.
 */

import { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import {
	type CreateTabDraft,
	type DraftableTabId,
	createTabDraft,
	updateTabDraft,
	isDraftWorthSaving,
} from "../domain/models/CreateTabDraft";

const STORAGE_KEY = "tka-create-tab-drafts";

/**
 * Load drafts from localStorage
 */
function loadDraftsFromStorage(): CreateTabDraft[] {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (!stored) return [];

		const parsed = JSON.parse(stored);
		if (!Array.isArray(parsed)) return [];

		// Validate each draft has required fields
		return parsed.filter(
			(d): d is CreateTabDraft =>
				d &&
				typeof d.id === "string" &&
				typeof d.tabId === "string" &&
				d.sequence &&
				typeof d.createdAt === "number"
		);
	} catch (error) {
		console.warn("[CreateTabDrafts] Failed to load from storage:", error);
		return [];
	}
}

/**
 * Save drafts to localStorage
 */
function saveDraftsToStorage(drafts: CreateTabDraft[]): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
	} catch (error) {
		console.warn("[CreateTabDrafts] Failed to save to storage:", error);
	}
}

/**
 * Create the drafts state manager
 */
export function createTabDraftsState() {
	let drafts = $state<CreateTabDraft[]>(loadDraftsFromStorage());
	let isLoading = $state(false);

	/**
	 * Get draft for a specific tab (or null if none)
	 */
	function getDraftForTab(tabId: DraftableTabId): CreateTabDraft | null {
		return drafts.find((d) => d.tabId === tabId) ?? null;
	}

	/**
	 * Check if a tab has a draft
	 */
	function hasDraft(tabId: DraftableTabId): boolean {
		return drafts.some((d) => d.tabId === tabId);
	}

	/**
	 * Save or update draft for a tab
	 * Replaces any existing draft for that tab
	 */
	function saveDraft(
		tabId: DraftableTabId,
		sequence: SequenceData,
		gridMode: GridMode,
		thumbnailDataUrl?: string
	): CreateTabDraft | null {
		const newDraft = createTabDraft({
			tabId,
			sequence,
			gridMode,
			thumbnailDataUrl,
		});

		// Only save if worth saving
		if (!isDraftWorthSaving(newDraft)) {
			return null;
		}

		// Replace existing draft for this tab, keep drafts from other tabs
		const otherDrafts = drafts.filter((d) => d.tabId !== tabId);
		drafts = [...otherDrafts, newDraft];

		saveDraftsToStorage(drafts);
		return newDraft;
	}

	/**
	 * Update thumbnail for an existing draft
	 */
	function updateDraftThumbnail(tabId: DraftableTabId, thumbnailDataUrl: string): void {
		const existingDraft = getDraftForTab(tabId);
		if (!existingDraft) return;

		const updated = updateTabDraft(existingDraft, { thumbnailDataUrl });
		drafts = drafts.map((d) => (d.tabId === tabId ? updated : d));

		saveDraftsToStorage(drafts);
	}

	/**
	 * Delete draft for a tab
	 */
	function deleteDraft(tabId: DraftableTabId): void {
		drafts = drafts.filter((d) => d.tabId !== tabId);
		saveDraftsToStorage(drafts);
	}

	/**
	 * Delete draft by ID
	 */
	function deleteDraftById(draftId: string): void {
		drafts = drafts.filter((d) => d.id !== draftId);
		saveDraftsToStorage(drafts);
	}

	/**
	 * Clear all drafts (for testing/reset)
	 */
	function clearAllDrafts(): void {
		drafts = [];
		saveDraftsToStorage(drafts);
	}

	/**
	 * Reload drafts from storage (for HMR or external changes)
	 */
	function reloadFromStorage(): void {
		drafts = loadDraftsFromStorage();
	}

	return {
		// Reactive state
		get drafts() {
			return drafts;
		},
		get isLoading() {
			return isLoading;
		},

		// Queries
		getDraftForTab,
		hasDraft,

		// Mutations
		saveDraft,
		updateDraftThumbnail,
		deleteDraft,
		deleteDraftById,
		clearAllDrafts,
		reloadFromStorage,
	};
}

/**
 * Singleton instance of drafts state
 */
export const createTabDraftsState_instance = createTabDraftsState();

/**
 * Type for the drafts state manager
 */
export type CreateTabDraftsState = ReturnType<typeof createTabDraftsState>;
