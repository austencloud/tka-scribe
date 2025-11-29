/**
 * LibraryService - Core Library Implementation
 *
 * Firestore-based service for managing sequences in a user's library.
 */

import { injectable, inject } from "inversify";
import {
	collection,
	doc,
	getDoc,
	getDocs,
	setDoc,
	updateDoc,
	deleteDoc,
	query,
	orderBy,
	where,
	limit as firestoreLimit,
	onSnapshot,
	serverTimestamp,
	writeBatch,
	increment,
	type Unsubscribe,
	type DocumentData,
} from "firebase/firestore";
import { firestore } from "$lib/shared/auth/firebase";
import { authStore } from "$lib/shared/auth/stores/authStore.svelte.ts";
import { TYPES } from "$lib/shared/inversify/types";
import type { IAchievementService } from "$lib/shared/gamification/services/contracts";
import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import type {
	ILibraryService,
	LibraryStats,
	LibraryQueryOptions,
} from "../contracts/ILibraryService";
import type {
	LibrarySequence,
	SequenceVisibility,
} from "../../domain/models/LibrarySequence";
import { createLibrarySequence } from "../../domain/models/LibrarySequence";
import {
	getUserSequencesPath,
	getUserSequencePath,
	getPublicSequencePath,
	LIBRARY_LIMITS,
} from "../../data/firestore-paths";

/**
 * Error class for library operations
 */
export class LibraryError extends Error {
	constructor(
		message: string,
		public code:
			| "NOT_FOUND"
			| "UNAUTHORIZED"
			| "INVALID_DATA"
			| "NETWORK"
			| "QUOTA_EXCEEDED"
			| "ALREADY_EXISTS",
		public sequenceId?: string
	) {
		super(message);
		this.name = "LibraryError";
	}
}

@injectable()
export class LibraryService implements ILibraryService {
	constructor(
		@inject(TYPES.IAchievementService)
		private achievementService: IAchievementService
	) {}

	/**
	 * Get the current user ID or throw if not authenticated
	 */
	private getUserId(): string {
		const userId = authStore.effectiveUserId;
		if (!userId) {
			throw new LibraryError("User not authenticated", "UNAUTHORIZED");
		}
		return userId;
	}

	/**
	 * Convert Firestore timestamp to Date
	 */
	private toDate(timestamp: unknown): Date {
		if (timestamp && typeof timestamp === "object" && "toDate" in timestamp) {
			return (timestamp as { toDate: () => Date }).toDate();
		}
		if (timestamp instanceof Date) {
			return timestamp;
		}
		return new Date();
	}

	/**
	 * Map Firestore document to LibrarySequence
	 */
	private mapDocToLibrarySequence(doc: DocumentData, id: string): LibrarySequence {
		const data = doc;
		const forkAttr = data["forkAttribution"];
		return {
			...data,
			id,
			createdAt: this.toDate(data["createdAt"]),
			updatedAt: this.toDate(data["updatedAt"]),
			visibilityChangedAt: data["visibilityChangedAt"]
				? this.toDate(data["visibilityChangedAt"])
				: undefined,
			lastAccessedAt: data["lastAccessedAt"]
				? this.toDate(data["lastAccessedAt"])
				: undefined,
			forkAttribution: forkAttr
				? {
						...forkAttr,
						forkedAt: this.toDate(forkAttr.forkedAt),
					}
				: undefined,
		} as LibrarySequence;
	}

	// ============================================================
	// CRUD OPERATIONS
	// ============================================================

	async saveSequence(sequence: SequenceData): Promise<LibrarySequence> {
		const userId = this.getUserId();
		const sequenceId = sequence.id || crypto.randomUUID();

		// Check if sequence already exists
		const existingDoc = await getDoc(
			doc(firestore, getUserSequencePath(userId, sequenceId))
		);

		const isNewSequence = !existingDoc.exists();
		let librarySequence: LibrarySequence;

		if (existingDoc.exists()) {
			// Update existing
			const existing = this.mapDocToLibrarySequence(
				existingDoc.data(),
				sequenceId
			);
			librarySequence = {
				...existing,
				...sequence,
				id: sequenceId,
				updatedAt: new Date(),
			};
		} else {
			// Create new
			librarySequence = createLibrarySequence(
				{ ...sequence, id: sequenceId },
				userId,
				{ visibility: "public" } // Default to public
			);

			// Track XP for creating sequence
			try {
				await this.achievementService.trackAction("sequence_created" as any, {
					beatCount: sequence.beats?.length ?? 0,
				});
			} catch (e) {
				console.warn("Failed to track achievement:", e);
			}
		}

		// Save to Firestore
		await setDoc(doc(firestore, getUserSequencePath(userId, sequenceId)), {
			...librarySequence,
			createdAt: existingDoc.exists()
				? librarySequence.createdAt
				: serverTimestamp(),
			updatedAt: serverTimestamp(),
		});

		// Increment user's sequenceCount if this is a new sequence
		if (isNewSequence) {
			try {
				const userDocRef = doc(firestore, `users/${userId}`);
				await updateDoc(userDocRef, {
					sequenceCount: increment(1),
				});
				console.log(`[LibraryService] Incremented sequenceCount for user ${userId}`);
			} catch (error) {
				console.error(
					`[LibraryService] Failed to increment sequenceCount for user ${userId}:`,
					error
				);
			}
		}

		// If public, sync to public index
		if (librarySequence.visibility === "public") {
			await this.syncToPublicIndex(librarySequence, userId);
		}

		return librarySequence;
	}

	async getSequence(sequenceId: string): Promise<LibrarySequence | null> {
		const userId = this.getUserId();
		const docRef = doc(firestore, getUserSequencePath(userId, sequenceId));
		const docSnap = await getDoc(docRef);

		if (!docSnap.exists()) {
			return null;
		}

		return this.mapDocToLibrarySequence(docSnap.data(), sequenceId);
	}

	async updateSequence(
		sequenceId: string,
		updates: Partial<LibrarySequence>
	): Promise<LibrarySequence> {
		const userId = this.getUserId();
		const docRef = doc(firestore, getUserSequencePath(userId, sequenceId));

		// Get existing
		const existing = await this.getSequence(sequenceId);
		if (!existing) {
			throw new LibraryError("Sequence not found", "NOT_FOUND", sequenceId);
		}

		// Apply updates
		const updated = {
			...existing,
			...updates,
			id: sequenceId,
			ownerId: userId, // Can't change owner
			updatedAt: new Date(),
		};

		await updateDoc(docRef, {
			...updates,
			updatedAt: serverTimestamp(),
		});

		// Handle visibility changes
		if (updates.visibility && updates.visibility !== existing.visibility) {
			if (updates.visibility === "public") {
				await this.syncToPublicIndex(updated, userId);
			} else if (existing.visibility === "public") {
				await this.removeFromPublicIndex(sequenceId);
			}
		}

		return updated;
	}

	async deleteSequence(sequenceId: string): Promise<void> {
		const userId = this.getUserId();
		const existing = await this.getSequence(sequenceId);

		if (!existing) {
			return; // Already deleted
		}

		// Remove from public index if public
		if (existing.visibility === "public") {
			await this.removeFromPublicIndex(sequenceId);
		}

		// Delete the sequence
		await deleteDoc(doc(firestore, getUserSequencePath(userId, sequenceId)));

		// Decrement user's sequenceCount
		try {
			const userDocRef = doc(firestore, `users/${userId}`);
			await updateDoc(userDocRef, {
				sequenceCount: increment(-1),
			});
			console.log(`[LibraryService] Decremented sequenceCount for user ${userId}`);
		} catch (error) {
			console.error(
				`[LibraryService] Failed to decrement sequenceCount for user ${userId}:`,
				error
			);
		}
	}

	async getSequences(options?: LibraryQueryOptions): Promise<LibrarySequence[]> {
		const userId = this.getUserId();
		return this.getUserSequences(userId, options);
	}

	async getUserSequences(
		userId: string,
		options?: LibraryQueryOptions
	): Promise<LibrarySequence[]> {
		const sequencesRef = collection(firestore, getUserSequencesPath(userId));

		// Build query
		let q = query(sequencesRef);

		// Apply filters
		if (options?.source && options.source !== "all") {
			q = query(q, where("source", "==", options.source));
		}

		if (options?.visibility && options.visibility !== "all") {
			q = query(q, where("visibility", "==", options.visibility));
		}

		if (options?.collectionId) {
			q = query(
				q,
				where("collectionIds", "array-contains", options.collectionId)
			);
		}

		// Apply sorting
		const sortField = options?.sortBy ?? "updatedAt";
		const sortDir = options?.sortDirection ?? "desc";
		q = query(q, orderBy(sortField, sortDir));

		// Apply limit
		if (options?.limit) {
			q = query(q, firestoreLimit(options.limit));
		}

		const snapshot = await getDocs(q);
		const sequences: LibrarySequence[] = [];

		snapshot.forEach((doc) => {
			sequences.push(this.mapDocToLibrarySequence(doc.data(), doc.id));
		});

		// Client-side search filter (Firestore doesn't support full-text search)
		if (options?.searchQuery) {
			const searchLower = options.searchQuery.toLowerCase();
			return sequences.filter(
				(seq) =>
					seq.name?.toLowerCase().includes(searchLower) ||
					seq.word?.toLowerCase().includes(searchLower)
			);
		}

		return sequences;
	}

	// ============================================================
	// VISIBILITY MANAGEMENT
	// ============================================================

	async setVisibility(
		sequenceId: string,
		visibility: SequenceVisibility
	): Promise<void> {
		await this.updateSequence(sequenceId, {
			visibility,
			visibilityChangedAt: new Date(),
		});
	}

	async publishSequence(sequenceId: string): Promise<void> {
		const existing = await this.getSequence(sequenceId);
		if (!existing) {
			throw new LibraryError("Sequence not found", "NOT_FOUND", sequenceId);
		}

		// Only award XP if this is the first time publishing
		const wasPrivate = existing.visibility !== "public";

		await this.setVisibility(sequenceId, "public");

		if (wasPrivate) {
			try {
				await this.achievementService.trackAction("sequence_published" as any, {
					sequenceId,
					beatCount: existing.beats?.length ?? 0,
				});
			} catch (e) {
				console.warn("Failed to track achievement:", e);
			}
		}
	}

	async unpublishSequence(sequenceId: string): Promise<void> {
		await this.setVisibility(sequenceId, "private");
	}

	// ============================================================
	// REAL-TIME SUBSCRIPTIONS
	// ============================================================

	subscribeToLibrary(
		callback: (sequences: LibrarySequence[]) => void,
		options?: LibraryQueryOptions
	): () => void {
		const userId = this.getUserId();
		const sequencesRef = collection(firestore, getUserSequencesPath(userId));

		let q = query(sequencesRef, orderBy("updatedAt", "desc"));

		if (options?.limit) {
			q = query(q, firestoreLimit(options.limit));
		}

		const unsubscribe: Unsubscribe = onSnapshot(
			q,
			(snapshot) => {
				const sequences: LibrarySequence[] = [];
				snapshot.forEach((doc) => {
					sequences.push(this.mapDocToLibrarySequence(doc.data(), doc.id));
				});
				callback(sequences);
			},
			(error) => {
				console.error("LibraryService: Subscription error", error);
			}
		);

		return unsubscribe;
	}

	subscribeToSequence(
		sequenceId: string,
		callback: (sequence: LibrarySequence | null) => void
	): () => void {
		const userId = this.getUserId();
		const docRef = doc(firestore, getUserSequencePath(userId, sequenceId));

		const unsubscribe: Unsubscribe = onSnapshot(
			docRef,
			(docSnap) => {
				if (docSnap.exists()) {
					callback(this.mapDocToLibrarySequence(docSnap.data(), sequenceId));
				} else {
					callback(null);
				}
			},
			(error) => {
				console.error("LibraryService: Sequence subscription error", error);
			}
		);

		return unsubscribe;
	}

	// ============================================================
	// STATISTICS
	// ============================================================

	async getLibraryStats(): Promise<LibraryStats> {
		const sequences = await this.getSequences();

		return {
			totalSequences: sequences.length,
			createdSequences: sequences.filter((s) => s.source === "created").length,
			forkedSequences: sequences.filter((s) => s.source === "forked").length,
			publicSequences: sequences.filter((s) => s.visibility === "public").length,
			privateSequences: sequences.filter((s) => s.visibility === "private")
				.length,
			totalCollections: 0, // TODO: Get from collection service
			totalActs: 0, // TODO: Get from act service
			totalBeats: sequences.reduce(
				(sum, seq) => sum + (seq.beats?.length ?? 0),
				0
			),
		};
	}

	// ============================================================
	// BATCH OPERATIONS
	// ============================================================

	async deleteSequences(sequenceIds: string[]): Promise<void> {
		const userId = this.getUserId();
		const batch = writeBatch(firestore);

		let deletedCount = 0;
		for (const sequenceId of sequenceIds) {
			const existing = await this.getSequence(sequenceId);
			if (existing) {
				if (existing.visibility === "public") {
					batch.delete(doc(firestore, getPublicSequencePath(sequenceId)));
				}
				batch.delete(doc(firestore, getUserSequencePath(userId, sequenceId)));
				deletedCount++;
			}
		}

		// Decrement user's sequenceCount by the number of deleted sequences
		if (deletedCount > 0) {
			const userDocRef = doc(firestore, `users/${userId}`);
			batch.update(userDocRef, {
				sequenceCount: increment(-deletedCount),
			});
		}

		await batch.commit();

		if (deletedCount > 0) {
			console.log(
				`[LibraryService] Decremented sequenceCount by ${deletedCount} for user ${userId}`
			);
		}
	}

	async moveToCollection(
		sequenceIds: string[],
		collectionId: string
	): Promise<void> {
		const userId = this.getUserId();
		const batch = writeBatch(firestore);

		for (const sequenceId of sequenceIds) {
			const docRef = doc(firestore, getUserSequencePath(userId, sequenceId));
			// Note: This adds to existing collections, doesn't replace
			// For proper implementation, we'd need to read existing collectionIds first
			batch.update(docRef, {
				collectionIds: [collectionId], // Simplified - would need arrayUnion in production
				updatedAt: serverTimestamp(),
			});
		}

		await batch.commit();
	}

	async addTagsToSequences(
		sequenceIds: string[],
		tagIds: string[]
	): Promise<void> {
		const userId = this.getUserId();
		const batch = writeBatch(firestore);

		for (const sequenceId of sequenceIds) {
			const docRef = doc(firestore, getUserSequencePath(userId, sequenceId));
			batch.update(docRef, {
				tagIds: tagIds, // Simplified - would need arrayUnion in production
				updatedAt: serverTimestamp(),
			});
		}

		await batch.commit();
	}

	async setVisibilityBatch(
		sequenceIds: string[],
		visibility: SequenceVisibility
	): Promise<void> {
		for (const sequenceId of sequenceIds) {
			await this.setVisibility(sequenceId, visibility);
		}
	}

	// ============================================================
	// FAVORITES
	// ============================================================

	async toggleFavorite(sequenceId: string): Promise<boolean> {
		const existing = await this.getSequence(sequenceId);
		if (!existing) {
			throw new LibraryError("Sequence not found", "NOT_FOUND", sequenceId);
		}

		const newFavoriteStatus = !existing.isFavorite;
		await this.updateSequence(sequenceId, { isFavorite: newFavoriteStatus });
		return newFavoriteStatus;
	}

	async getFavorites(): Promise<LibrarySequence[]> {
		return this.getSequences({
			sortBy: "updatedAt",
			sortDirection: "desc",
		}).then((sequences) => sequences.filter((s) => s.isFavorite));
	}

	// ============================================================
	// PRIVATE HELPERS
	// ============================================================

	/**
	 * Sync a public sequence to the publicSequences collection
	 */
	private async syncToPublicIndex(
		sequence: LibrarySequence,
		userId: string
	): Promise<void> {
		try {
			// Get user display info for denormalization
			const userDoc = await getDoc(doc(firestore, `users/${userId}`));
			const userData = userDoc.data() ?? {};

			const publicData = {
				id: sequence.id,
				sourceRef: `users/${userId}/sequences/${sequence.id}`,
				ownerId: userId,
				ownerDisplayName: userData["displayName"] ?? "Unknown",
				ownerAvatarUrl: userData["photoURL"],
				name: sequence.name,
				word: sequence.word,
				thumbnails: sequence.thumbnails?.slice(0, 3) ?? [],
				sequenceLength: sequence.beats?.length ?? 0,
				difficultyLevel: sequence.difficultyLevel,
				forkCount: sequence.forkCount ?? 0,
				viewCount: sequence.viewCount ?? 0,
				starCount: sequence.starCount ?? 0,
				tags: [], // TODO: Resolve tag names from tagIds
				isForked: sequence.source === "forked",
				originalCreatorId: sequence.forkAttribution?.originalCreatorId,
				originalCreatorName: sequence.forkAttribution?.originalCreatorName,
				publishedAt: serverTimestamp(),
				updatedAt: serverTimestamp(),
			};

			await setDoc(doc(firestore, getPublicSequencePath(sequence.id)), publicData);
		} catch (error) {
			console.error("Failed to sync to public index:", error);
		}
	}

	/**
	 * Remove a sequence from the public index
	 */
	private async removeFromPublicIndex(sequenceId: string): Promise<void> {
		try {
			await deleteDoc(doc(firestore, getPublicSequencePath(sequenceId)));
		} catch (error) {
			console.error("Failed to remove from public index:", error);
		}
	}
}
