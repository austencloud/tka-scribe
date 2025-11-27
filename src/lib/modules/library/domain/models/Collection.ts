/**
 * LibraryCollection - Named folder for organizing sequences
 *
 * Collections allow users to organize their library sequences into
 * named groups (e.g., "Teaching Material", "Poi Combos", "Favorites").
 *
 * Stored at: users/{userId}/library/collections/{collectionId}
 */

/**
 * LibraryCollection - A named collection of sequences
 */
export interface LibraryCollection {
	/** Unique collection ID */
	readonly id: string;

	/** Collection name (user-defined) */
	readonly name: string;

	/** Optional description */
	readonly description?: string;

	/** Owner user ID */
	readonly ownerId: string;

	/** Sequence IDs in this collection (references, not embedded) */
	readonly sequenceIds: readonly string[];

	/** Sequence count (denormalized for display without loading sequences) */
	readonly sequenceCount: number;

	/** Cover image URL (first sequence thumbnail or custom upload) */
	readonly coverImageUrl?: string;

	/** Collection color theme (hex color) */
	readonly color?: string;

	/** Collection icon (emoji or FontAwesome icon name) */
	readonly icon?: string;

	/** Whether this collection is visible to others */
	readonly isPublic: boolean;

	/** Sort order within user's collections list */
	readonly sortOrder: number;

	/** When created */
	readonly createdAt: Date;

	/** When last modified */
	readonly updatedAt: Date;
}

/**
 * Options for creating a new collection
 */
export interface CreateCollectionOptions {
	description?: string;
	coverImageUrl?: string;
	color?: string;
	icon?: string;
	isPublic?: boolean;
	sortOrder?: number;
}

/**
 * Create a new collection
 */
export function createCollection(
	name: string,
	ownerId: string,
	options: CreateCollectionOptions = {}
): Omit<LibraryCollection, "id"> {
	const now = new Date();

	return {
		name,
		ownerId,
		description: options.description,
		sequenceIds: [],
		sequenceCount: 0,
		coverImageUrl: options.coverImageUrl,
		color: options.color,
		icon: options.icon ?? "fa-folder",
		isPublic: options.isPublic ?? false,
		sortOrder: options.sortOrder ?? 0,
		createdAt: now,
		updatedAt: now,
	};
}

/**
 * Update a collection immutably
 */
export function updateCollection(
	collection: LibraryCollection,
	updates: Partial<LibraryCollection>
): LibraryCollection {
	return {
		...collection,
		...updates,
		updatedAt: new Date(),
	};
}

/**
 * Add a sequence to a collection
 */
export function addSequenceToCollection(
	collection: LibraryCollection,
	sequenceId: string
): LibraryCollection {
	if (collection.sequenceIds.includes(sequenceId)) {
		return collection; // Already in collection
	}

	return updateCollection(collection, {
		sequenceIds: [...collection.sequenceIds, sequenceId],
		sequenceCount: collection.sequenceCount + 1,
	});
}

/**
 * Remove a sequence from a collection
 */
export function removeSequenceFromCollection(
	collection: LibraryCollection,
	sequenceId: string
): LibraryCollection {
	if (!collection.sequenceIds.includes(sequenceId)) {
		return collection; // Not in collection
	}

	return updateCollection(collection, {
		sequenceIds: collection.sequenceIds.filter((id) => id !== sequenceId),
		sequenceCount: Math.max(0, collection.sequenceCount - 1),
	});
}
