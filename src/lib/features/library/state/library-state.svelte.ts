/**
 * Library State Management
 *
 * Reactive state for the Library module using Svelte 5 runes.
 * Integrates with ILibraryService for Firestore operations.
 */

import { tryResolve } from "$lib/shared/inversify/di";
import { TYPES } from "$lib/shared/inversify/types";
import { authStore } from "$lib/shared/auth/stores/authStore.svelte";
import type { ILibraryService, LibraryQueryOptions, LibraryStats } from '../services/contracts/ILibraryService';
import type { LibrarySequence, SequenceVisibility } from "../domain/models/LibrarySequence";
import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";

export type LibraryViewSection = "sequences" | "collections" | "acts" | "favorites";
export type LibrarySortField = "updatedAt" | "createdAt" | "name" | "word";
export type LibrarySortDirection = "asc" | "desc";

interface LibraryFilters {
	searchQuery: string;
	visibility: SequenceVisibility | "all";
	source: "created" | "forked" | "all";
	collectionId: string | null;
	sortBy: LibrarySortField;
	sortDirection: LibrarySortDirection;
}

interface LibraryStateData {
	// Navigation
	activeSection: LibraryViewSection;

	// Sequences list
	sequences: LibrarySequence[];
	isLoading: boolean;
	error: string | null;

	// Selection (for batch operations)
	selectedIds: Set<string>;
	isSelectMode: boolean;

	// Filters
	filters: LibraryFilters;

	// Stats
	stats: LibraryStats | null;

	// Detail view
	viewingSequenceId: string | null;

	// Subscription cleanup
	unsubscribe: (() => void) | null;
}

class LibraryStateManager {
	private state = $state<LibraryStateData>({
		activeSection: "sequences",
		sequences: [],
		isLoading: false,
		error: null,
		selectedIds: new Set(),
		isSelectMode: false,
		filters: {
			searchQuery: "",
			visibility: "all",
			source: "all",
			collectionId: null,
			sortBy: "updatedAt",
			sortDirection: "desc",
		},
		stats: null,
		viewingSequenceId: null,
		unsubscribe: null,
	});

	// ============================================================
	// GETTERS
	// ============================================================

	get activeSection() {
		return this.state.activeSection;
	}

	get sequences() {
		return this.state.sequences;
	}

	get isLoading() {
		return this.state.isLoading;
	}

	get error() {
		return this.state.error;
	}

	get selectedIds() {
		return this.state.selectedIds;
	}

	get isSelectMode() {
		return this.state.isSelectMode;
	}

	get filters() {
		return this.state.filters;
	}

	get stats() {
		return this.state.stats;
	}

	get viewingSequenceId() {
		return this.state.viewingSequenceId;
	}

	get hasSequences() {
		return this.state.sequences.length > 0;
	}

	get selectedCount() {
		return this.state.selectedIds.size;
	}

	get isAuthenticated() {
		return !!authStore.effectiveUserId;
	}

	// Derived: filtered sequences
	get filteredSequences(): LibrarySequence[] {
		let result = [...this.state.sequences];
		const filters = this.state.filters;

		// Filter by search query (client-side full-text)
		if (filters.searchQuery) {
			const query = filters.searchQuery.toLowerCase();
			result = result.filter(
				(seq) =>
					seq.name.toLowerCase().includes(query) ||
					seq.word.toLowerCase().includes(query)
			);
		}

		// Filter by visibility
		if (filters.visibility !== "all") {
			result = result.filter((seq) => seq.visibility === filters.visibility);
		}

		// Filter by source
		if (filters.source !== "all") {
			result = result.filter((seq) => seq.source === filters.source);
		}

		// Filter by collection
		if (filters.collectionId) {
			result = result.filter((seq) =>
				seq.collectionIds.includes(filters.collectionId!)
			);
		}

		// Sort
		result.sort((a, b) => {
			let aVal: string | number;
			let bVal: string | number;

			switch (filters.sortBy) {
				case "name":
					aVal = a.name ?? "";
					bVal = b.name ?? "";
					break;
				case "word":
					aVal = a.word ?? "";
					bVal = b.word ?? "";
					break;
				case "createdAt":
					aVal = a.createdAt.getTime() ?? 0;
					bVal = b.createdAt.getTime() ?? 0;
					break;
				case "updatedAt":
				default:
					aVal = a.updatedAt.getTime() ?? 0;
					bVal = b.updatedAt.getTime() ?? 0;
					break;
			}

			if (typeof aVal === "string") {
				const bStr = typeof bVal === "string" ? bVal : String(bVal);
				return filters.sortDirection === "asc"
					? aVal.localeCompare(bStr)
					: bStr.localeCompare(aVal);
			}

			const bNum = typeof bVal === "number" ? bVal : Number(bVal);
			return filters.sortDirection === "asc" ? aVal - bNum : bNum - aVal;
		});

		return result;
	}

	// Derived: favorites only
	get favorites(): LibrarySequence[] {
		return this.state.sequences.filter((seq) => seq.isFavorite);
	}

	// ============================================================
	// NAVIGATION
	// ============================================================

	setActiveSection(section: LibraryViewSection) {
		this.state.activeSection = section;
		this.state.viewingSequenceId = null;
	}

	viewSequence(sequenceId: string) {
		this.state.viewingSequenceId = sequenceId;
	}

	closeSequenceDetail() {
		this.state.viewingSequenceId = null;
	}

	// ============================================================
	// DATA LOADING
	// ============================================================

	async initialize() {
		if (!this.isAuthenticated) {
			this.state.sequences = [];
			return;
		}

		await this.loadSequences();
		await this.loadStats();
		this.subscribeToLibrary();
	}

	async loadSequences(options?: LibraryQueryOptions) {
		const service = this.getService();
		if (!service) return;

		this.state.isLoading = true;
		this.state.error = null;

		try {
			const sequences = await service.getSequences(options);
			this.state.sequences = sequences;
		} catch (error) {
			console.error("📚 [LibraryState] Failed to load sequences:", error);
			this.state.error =
				error instanceof Error ? error.message : "Failed to load sequences";
		} finally {
			this.state.isLoading = false;
		}
	}

	async loadStats() {
		const service = this.getService();
		if (!service) return;

		try {
			this.state.stats = await service.getLibraryStats();
		} catch (error) {
			console.error("📚 [LibraryState] Failed to load stats:", error);
		}
	}

	subscribeToLibrary() {
		// Clean up existing subscription
		if (this.state.unsubscribe) {
			this.state.unsubscribe();
		}

		const service = this.getService();
		if (!service) return;

		try {
			this.state.unsubscribe = service.subscribeToLibrary((sequences) => {
				this.state.sequences = sequences;
			});
		} catch (error) {
			console.error("📚 [LibraryState] Failed to subscribe:", error);
		}
	}

	dispose() {
		if (this.state.unsubscribe) {
			this.state.unsubscribe();
			this.state.unsubscribe = null;
		}
	}

	// ============================================================
	// CRUD OPERATIONS
	// ============================================================

	async saveSequence(sequence: SequenceData): Promise<LibrarySequence | null> {
		const service = this.getService();
		if (!service) return null;

		try {
			const saved = await service.saveSequence(sequence);
			return saved;
		} catch (error) {
			console.error("📚 [LibraryState] Failed to save sequence:", error);
			this.state.error =
				error instanceof Error ? error.message : "Failed to save sequence";
			return null;
		}
	}

	async deleteSequence(sequenceId: string): Promise<boolean> {
		const service = this.getService();
		if (!service) return false;

		try {
			await service.deleteSequence(sequenceId);
			return true;
		} catch (error) {
			console.error("📚 [LibraryState] Failed to delete sequence:", error);
			this.state.error =
				error instanceof Error ? error.message : "Failed to delete sequence";
			return false;
		}
	}

	async toggleFavorite(sequenceId: string): Promise<boolean> {
		const service = this.getService();
		if (!service) return false;

		try {
			const isFavorite = await service.toggleFavorite(sequenceId);
			return isFavorite;
		} catch (error) {
			console.error("📚 [LibraryState] Failed to toggle favorite:", error);
			return false;
		}
	}

	async setVisibility(
		sequenceId: string,
		visibility: SequenceVisibility
	): Promise<boolean> {
		const service = this.getService();
		if (!service) return false;

		try {
			await service.setVisibility(sequenceId, visibility);
			return true;
		} catch (error) {
			console.error("📚 [LibraryState] Failed to set visibility:", error);
			return false;
		}
	}

	async publishSequence(sequenceId: string): Promise<boolean> {
		const service = this.getService();
		if (!service) return false;

		try {
			await service.publishSequence(sequenceId);
			return true;
		} catch (error) {
			console.error("📚 [LibraryState] Failed to publish sequence:", error);
			return false;
		}
	}

	async unpublishSequence(sequenceId: string): Promise<boolean> {
		const service = this.getService();
		if (!service) return false;

		try {
			await service.unpublishSequence(sequenceId);
			return true;
		} catch (error) {
			console.error("📚 [LibraryState] Failed to unpublish sequence:", error);
			return false;
		}
	}

	// ============================================================
	// SELECTION
	// ============================================================

	enterSelectMode() {
		this.state.isSelectMode = true;
	}

	exitSelectMode() {
		this.state.isSelectMode = false;
		this.state.selectedIds.clear();
	}

	toggleSelection(sequenceId: string) {
		if (this.state.selectedIds.has(sequenceId)) {
			this.state.selectedIds.delete(sequenceId);
		} else {
			this.state.selectedIds.add(sequenceId);
		}
		// Trigger reactivity
		this.state.selectedIds = new Set(this.state.selectedIds);
	}

	selectAll() {
		this.state.selectedIds = new Set(this.filteredSequences.map((s) => s.id));
	}

	clearSelection() {
		this.state.selectedIds.clear();
		this.state.selectedIds = new Set();
	}

	isSelected(sequenceId: string): boolean {
		return this.state.selectedIds.has(sequenceId);
	}

	// ============================================================
	// BATCH OPERATIONS
	// ============================================================

	async deleteSelected(): Promise<boolean> {
		const service = this.getService();
		if (!service || this.state.selectedIds.size === 0) return false;

		try {
			await service.deleteSequences(Array.from(this.state.selectedIds));
			this.clearSelection();
			this.exitSelectMode();
			return true;
		} catch (error) {
			console.error("📚 [LibraryState] Failed to delete selected:", error);
			return false;
		}
	}

	async setVisibilityBatch(visibility: SequenceVisibility): Promise<boolean> {
		const service = this.getService();
		if (!service || this.state.selectedIds.size === 0) return false;

		try {
			await service.setVisibilityBatch(
				Array.from(this.state.selectedIds),
				visibility
			);
			return true;
		} catch (error) {
			console.error(
				"📚 [LibraryState] Failed to set visibility batch:",
				error
			);
			return false;
		}
	}

	// ============================================================
	// FILTERS
	// ============================================================

	setSearchQuery(query: string) {
		this.state.filters.searchQuery = query;
	}

	setVisibilityFilter(visibility: SequenceVisibility | "all") {
		this.state.filters.visibility = visibility;
	}

	setSourceFilter(source: "created" | "forked" | "all") {
		this.state.filters.source = source;
	}

	setCollectionFilter(collectionId: string | null) {
		this.state.filters.collectionId = collectionId;
	}

	setSortBy(field: LibrarySortField) {
		this.state.filters.sortBy = field;
	}

	setSortDirection(direction: LibrarySortDirection) {
		this.state.filters.sortDirection = direction;
	}

	toggleSortDirection() {
		this.state.filters.sortDirection =
			this.state.filters.sortDirection === "asc" ? "desc" : "asc";
	}

	resetFilters() {
		this.state.filters = {
			searchQuery: "",
			visibility: "all",
			source: "all",
			collectionId: null,
			sortBy: "updatedAt",
			sortDirection: "desc",
		};
	}

	// ============================================================
	// HELPERS
	// ============================================================

	private getService(): ILibraryService | null {
		const service = tryResolve<ILibraryService>(TYPES.ILibraryService);
		if (!service) {
			console.warn("📚 [LibraryState] LibraryService not available");
		}
		return service;
	}

	getSequenceById(sequenceId: string): LibrarySequence | undefined {
		return this.state.sequences.find((s) => s.id === sequenceId);
	}

	reset() {
		this.dispose();
		this.state = {
			activeSection: "sequences",
			sequences: [],
			isLoading: false,
			error: null,
			selectedIds: new Set(),
			isSelectMode: false,
			filters: {
				searchQuery: "",
				visibility: "all",
				source: "all",
				collectionId: null,
				sortBy: "updatedAt",
				sortDirection: "desc",
			},
			stats: null,
			viewingSequenceId: null,
			unsubscribe: null,
		};
	}
}

// Export singleton instance
export const libraryState = new LibraryStateManager();
