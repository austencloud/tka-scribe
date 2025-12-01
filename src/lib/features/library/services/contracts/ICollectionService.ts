/**
 * ICollectionService - Collection (Folder) Management
 *
 * Service for organizing sequences into named collections.
 */

import type { LibraryCollection } from "../../domain/models/Collection";
import type { LibrarySequence } from "../../domain/models/LibrarySequence";

/**
 * ICollectionService - Collection CRUD operations
 */
export interface ICollectionService {
	// ============================================================
	// CRUD OPERATIONS
	// ============================================================

	/**
	 * Create a new collection
	 * @param name Collection name
	 * @param description Optional description
	 * @returns The created collection
	 */
	createCollection(
		name: string,
		description?: string
	): Promise<LibraryCollection>;

	/**
	 * Get a collection by ID
	 * @param collectionId The collection ID
	 * @returns The collection or null
	 */
	getCollection(collectionId: string): Promise<LibraryCollection | null>;

	/**
	 * Update collection metadata
	 * @param collectionId The collection ID
	 * @param updates Partial updates
	 * @returns The updated collection
	 */
	updateCollection(
		collectionId: string,
		updates: Partial<
			Pick<
				LibraryCollection,
				"name" | "description" | "coverImageUrl" | "color" | "icon" | "isPublic"
			>
		>
	): Promise<LibraryCollection>;

	/**
	 * Delete a collection
	 * Note: Does NOT delete sequences, only removes them from collection
	 * @param collectionId The collection ID
	 */
	deleteCollection(collectionId: string): Promise<void>;

	/**
	 * Get all collections for current user
	 * @returns Array of collections sorted by sortOrder
	 */
	getCollections(): Promise<LibraryCollection[]>;

	// ============================================================
	// SEQUENCE MANAGEMENT
	// ============================================================

	/**
	 * Add a sequence to a collection
	 * @param collectionId Target collection ID
	 * @param sequenceId Sequence ID to add
	 */
	addSequenceToCollection(
		collectionId: string,
		sequenceId: string
	): Promise<void>;

	/**
	 * Remove a sequence from a collection
	 * @param collectionId Collection ID
	 * @param sequenceId Sequence ID to remove
	 */
	removeSequenceFromCollection(
		collectionId: string,
		sequenceId: string
	): Promise<void>;

	/**
	 * Get all sequences in a collection
	 * @param collectionId The collection ID
	 * @returns Array of sequences in the collection
	 */
	getCollectionSequences(collectionId: string): Promise<LibrarySequence[]>;

	/**
	 * Reorder sequences within a collection
	 * @param collectionId The collection ID
	 * @param sequenceIds Ordered array of sequence IDs
	 */
	reorderSequences(
		collectionId: string,
		sequenceIds: string[]
	): Promise<void>;

	/**
	 * Add multiple sequences to a collection
	 * @param collectionId Target collection ID
	 * @param sequenceIds Array of sequence IDs
	 */
	addSequencesToCollection(
		collectionId: string,
		sequenceIds: string[]
	): Promise<void>;

	// ============================================================
	// REAL-TIME SUBSCRIPTIONS
	// ============================================================

	/**
	 * Subscribe to all collections
	 * @param callback Called with updated collections
	 * @returns Unsubscribe function
	 */
	subscribeToCollections(
		callback: (collections: LibraryCollection[]) => void
	): () => void;

	/**
	 * Subscribe to a specific collection
	 * @param collectionId The collection ID
	 * @param callback Called with collection or null
	 * @returns Unsubscribe function
	 */
	subscribeToCollection(
		collectionId: string,
		callback: (collection: LibraryCollection | null) => void
	): () => void;

	// ============================================================
	// REORDERING
	// ============================================================

	/**
	 * Reorder collections (change sortOrder)
	 * @param collectionIds Ordered array of collection IDs
	 */
	reorderCollections(collectionIds: string[]): Promise<void>;
}
