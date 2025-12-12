/**
 * CollectionService - Collection Management Implementation
 *
 * Firestore-based service for managing collections (folders) in a user's library.
 * Includes system collections like Favorites which are auto-created.
 */

import { injectable } from "inversify";
import {
	collection,
	doc,
	getDoc,
	getDocs,
	setDoc,
	updateDoc,
	query,
	orderBy,
	where,
	onSnapshot,
	serverTimestamp,
	writeBatch,
	arrayUnion,
	arrayRemove,
	type Unsubscribe,
	type DocumentData,
} from "firebase/firestore";
import { firestore } from "$lib/shared/auth/firebase";
import { authState } from "$lib/shared/auth/state/authState.svelte.ts";
import type { ICollectionService } from "../contracts/ICollectionService";
import type {
	LibraryCollection,
	SystemCollectionType,
} from "../../domain/models/Collection";
import {
	createCollection,
	createSystemCollection,
	isSystemCollection,
	SYSTEM_COLLECTION_IDS,
} from "../../domain/models/Collection";
import type { LibrarySequence } from "../../domain/models/LibrarySequence";
import {
	getUserCollectionsPath,
	getUserCollectionPath,
	getUserSequencePath,
} from "../../data/firestore-paths";

/**
 * Error class for collection operations
 */
export class CollectionError extends Error {
	constructor(
		message: string,
		public code:
			| "NOT_FOUND"
			| "UNAUTHORIZED"
			| "INVALID_OPERATION"
			| "SYSTEM_COLLECTION"
			| "NETWORK",
		public collectionId?: string
	) {
		super(message);
		this.name = "CollectionError";
	}
}

@injectable()
export class CollectionService implements ICollectionService {
	/**
	 * Get the current user ID or throw if not authenticated
	 */
	private getUserId(): string {
		const userId = authState.effectiveUserId;
		if (!userId) {
			throw new CollectionError("User not authenticated", "UNAUTHORIZED");
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
	 * Map Firestore document to LibraryCollection
	 */
	private mapDocToCollection(
		data: DocumentData,
		id: string
	): LibraryCollection {
		return {
			id,
			name: data["name"] ?? "",
			description: data["description"],
			ownerId: data["ownerId"] ?? "",
			sequenceIds: data["sequenceIds"] ?? [],
			sequenceCount: data["sequenceCount"] ?? 0,
			coverImageUrl: data["coverImageUrl"],
			color: data["color"],
			icon: data["icon"] ?? "fa-folder",
			isPublic: data["isPublic"] ?? false,
			sortOrder: data["sortOrder"] ?? 0,
			systemType: data["systemType"],
			createdAt: this.toDate(data["createdAt"]),
			updatedAt: this.toDate(data["updatedAt"]),
		};
	}

	/**
	 * Map Firestore document to LibrarySequence (simplified)
	 */
	private mapDocToSequence(data: DocumentData, id: string): LibrarySequence {
		return {
			...data,
			id,
			createdAt: this.toDate(data["createdAt"]),
			updatedAt: this.toDate(data["updatedAt"]),
		} as LibrarySequence;
	}

	// ============================================================
	// SYSTEM COLLECTIONS
	// ============================================================

	async ensureSystemCollections(): Promise<void> {
		const userId = this.getUserId();

		// Check and create each system collection type
		const systemTypes: SystemCollectionType[] = ["favorites"];

		for (const type of systemTypes) {
			const collectionId = SYSTEM_COLLECTION_IDS[type];
			const docRef = doc(
				firestore,
				getUserCollectionPath(userId, collectionId)
			);
			const docSnap = await getDoc(docRef);

			if (!docSnap.exists()) {
				console.log(
					`[CollectionService] Creating system collection: ${type}`
				);
				const systemCollection = createSystemCollection(type, userId);
				await setDoc(docRef, {
					...systemCollection,
					createdAt: serverTimestamp(),
					updatedAt: serverTimestamp(),
				});
			}
		}
	}

	async getSystemCollection(
		type: SystemCollectionType
	): Promise<LibraryCollection> {
		const userId = this.getUserId();
		const collectionId = SYSTEM_COLLECTION_IDS[type];

		// Try to get existing
		const docRef = doc(
			firestore,
			getUserCollectionPath(userId, collectionId)
		);
		const docSnap = await getDoc(docRef);

		if (docSnap.exists()) {
			return this.mapDocToCollection(docSnap.data(), collectionId);
		}

		// Create if doesn't exist
		const systemCollection = createSystemCollection(type, userId);
		await setDoc(docRef, {
			...systemCollection,
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
		});

		return systemCollection;
	}

	async getFavoritesCollection(): Promise<LibraryCollection> {
		return this.getSystemCollection("favorites");
	}

	// ============================================================
	// CRUD OPERATIONS
	// ============================================================

	async createCollection(
		name: string,
		description?: string
	): Promise<LibraryCollection> {
		const userId = this.getUserId();
		const collectionId = crypto.randomUUID();

		const newCollection = createCollection(name, userId, {
			description,
			sortOrder: Date.now(), // Use timestamp for initial sort order
		});

		const docRef = doc(
			firestore,
			getUserCollectionPath(userId, collectionId)
		);
		await setDoc(docRef, {
			...newCollection,
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
		});

		return {
			...newCollection,
			id: collectionId,
		};
	}

	async getCollection(collectionId: string): Promise<LibraryCollection | null> {
		const userId = this.getUserId();
		const docRef = doc(
			firestore,
			getUserCollectionPath(userId, collectionId)
		);
		const docSnap = await getDoc(docRef);

		if (!docSnap.exists()) {
			return null;
		}

		return this.mapDocToCollection(docSnap.data(), collectionId);
	}

	async updateCollection(
		collectionId: string,
		updates: Partial<
			Pick<
				LibraryCollection,
				"name" | "description" | "coverImageUrl" | "color" | "icon" | "isPublic"
			>
		>
	): Promise<LibraryCollection> {
		const userId = this.getUserId();
		const existing = await this.getCollection(collectionId);

		if (!existing) {
			throw new CollectionError(
				"Collection not found",
				"NOT_FOUND",
				collectionId
			);
		}

		// Prevent renaming system collections
		if (isSystemCollection(existing) && updates.name !== undefined) {
			throw new CollectionError(
				"Cannot rename system collection",
				"SYSTEM_COLLECTION",
				collectionId
			);
		}

		const docRef = doc(
			firestore,
			getUserCollectionPath(userId, collectionId)
		);
		await updateDoc(docRef, {
			...updates,
			updatedAt: serverTimestamp(),
		});

		return {
			...existing,
			...updates,
			updatedAt: new Date(),
		};
	}

	async deleteCollection(collectionId: string): Promise<void> {
		const userId = this.getUserId();
		const existing = await this.getCollection(collectionId);

		if (!existing) {
			return; // Already deleted
		}

		// Prevent deleting system collections
		if (isSystemCollection(existing)) {
			throw new CollectionError(
				"Cannot delete system collection",
				"SYSTEM_COLLECTION",
				collectionId
			);
		}

		// Remove collection reference from all sequences in this collection
		const batch = writeBatch(firestore);
		for (const sequenceId of existing.sequenceIds) {
			const seqRef = doc(firestore, getUserSequencePath(userId, sequenceId));
			batch.update(seqRef, {
				collectionIds: arrayRemove(collectionId),
			});
		}

		// Delete the collection
		batch.delete(
			doc(firestore, getUserCollectionPath(userId, collectionId))
		);

		await batch.commit();
	}

	async getCollections(): Promise<LibraryCollection[]> {
		const userId = this.getUserId();
		const collectionsRef = collection(
			firestore,
			getUserCollectionsPath(userId)
		);
		const q = query(collectionsRef, orderBy("sortOrder", "asc"));

		const snapshot = await getDocs(q);
		const collections: LibraryCollection[] = [];

		snapshot.forEach((doc) => {
			collections.push(this.mapDocToCollection(doc.data(), doc.id));
		});

		return collections;
	}

	// ============================================================
	// SEQUENCE MANAGEMENT
	// ============================================================

	async addSequenceToCollection(
		collectionId: string,
		sequenceId: string
	): Promise<void> {
		const userId = this.getUserId();

		// Update collection
		const collectionRef = doc(
			firestore,
			getUserCollectionPath(userId, collectionId)
		);
		await updateDoc(collectionRef, {
			sequenceIds: arrayUnion(sequenceId),
			sequenceCount: (await this.getCollection(collectionId))!.sequenceCount + 1,
			updatedAt: serverTimestamp(),
		});

		// Update sequence
		const sequenceRef = doc(firestore, getUserSequencePath(userId, sequenceId));
		await updateDoc(sequenceRef, {
			collectionIds: arrayUnion(collectionId),
			updatedAt: serverTimestamp(),
		});
	}

	async removeSequenceFromCollection(
		collectionId: string,
		sequenceId: string
	): Promise<void> {
		const userId = this.getUserId();
		const existing = await this.getCollection(collectionId);

		if (!existing) {
			return;
		}

		// Update collection
		const collectionRef = doc(
			firestore,
			getUserCollectionPath(userId, collectionId)
		);
		await updateDoc(collectionRef, {
			sequenceIds: arrayRemove(sequenceId),
			sequenceCount: Math.max(0, existing.sequenceCount - 1),
			updatedAt: serverTimestamp(),
		});

		// Update sequence
		const sequenceRef = doc(firestore, getUserSequencePath(userId, sequenceId));
		await updateDoc(sequenceRef, {
			collectionIds: arrayRemove(collectionId),
			updatedAt: serverTimestamp(),
		});
	}

	async getCollectionSequences(
		collectionId: string
	): Promise<LibrarySequence[]> {
		const userId = this.getUserId();
		const collectionData = await this.getCollection(collectionId);

		if (!collectionData || collectionData.sequenceIds.length === 0) {
			return [];
		}

		// Fetch each sequence
		const sequences: LibrarySequence[] = [];
		for (const sequenceId of collectionData.sequenceIds) {
			const docRef = doc(firestore, getUserSequencePath(userId, sequenceId));
			const docSnap = await getDoc(docRef);
			if (docSnap.exists()) {
				sequences.push(this.mapDocToSequence(docSnap.data(), sequenceId));
			}
		}

		return sequences;
	}

	async reorderSequences(
		collectionId: string,
		sequenceIds: string[]
	): Promise<void> {
		const userId = this.getUserId();
		const docRef = doc(
			firestore,
			getUserCollectionPath(userId, collectionId)
		);

		await updateDoc(docRef, {
			sequenceIds,
			updatedAt: serverTimestamp(),
		});
	}

	async addSequencesToCollection(
		collectionId: string,
		sequenceIds: string[]
	): Promise<void> {
		for (const sequenceId of sequenceIds) {
			await this.addSequenceToCollection(collectionId, sequenceId);
		}
	}

	// ============================================================
	// REAL-TIME SUBSCRIPTIONS
	// ============================================================

	subscribeToCollections(
		callback: (collections: LibraryCollection[]) => void
	): () => void {
		const userId = this.getUserId();
		const collectionsRef = collection(
			firestore,
			getUserCollectionsPath(userId)
		);
		const q = query(collectionsRef, orderBy("sortOrder", "asc"));

		const unsubscribe: Unsubscribe = onSnapshot(
			q,
			(snapshot) => {
				const collections: LibraryCollection[] = [];
				snapshot.forEach((doc) => {
					collections.push(this.mapDocToCollection(doc.data(), doc.id));
				});
				callback(collections);
			},
			(error) => {
				console.error("[CollectionService] Subscription error:", error);
			}
		);

		return unsubscribe;
	}

	subscribeToCollection(
		collectionId: string,
		callback: (collection: LibraryCollection | null) => void
	): () => void {
		const userId = this.getUserId();
		const docRef = doc(
			firestore,
			getUserCollectionPath(userId, collectionId)
		);

		const unsubscribe: Unsubscribe = onSnapshot(
			docRef,
			(docSnap) => {
				if (docSnap.exists()) {
					callback(this.mapDocToCollection(docSnap.data(), collectionId));
				} else {
					callback(null);
				}
			},
			(error) => {
				console.error(
					"[CollectionService] Collection subscription error:",
					error
				);
			}
		);

		return unsubscribe;
	}

	// ============================================================
	// REORDERING
	// ============================================================

	async reorderCollections(collectionIds: string[]): Promise<void> {
		const userId = this.getUserId();
		const batch = writeBatch(firestore);

		collectionIds.forEach((collectionId, index) => {
			const docRef = doc(
				firestore,
				getUserCollectionPath(userId, collectionId)
			);
			batch.update(docRef, {
				sortOrder: index,
				updatedAt: serverTimestamp(),
			});
		});

		await batch.commit();
	}

	// ============================================================
	// FAVORITES OPERATIONS
	// ============================================================

	async toggleFavorite(sequenceId: string): Promise<boolean> {
		const favoritesCollection = await this.getFavoritesCollection();
		const isFavorited = favoritesCollection.sequenceIds.includes(sequenceId);

		if (isFavorited) {
			await this.removeSequenceFromCollection(favoritesCollection.id, sequenceId);
			return false;
		} else {
			await this.addSequenceToCollection(favoritesCollection.id, sequenceId);
			return true;
		}
	}

	async isFavorite(sequenceId: string): Promise<boolean> {
		const favoritesCollection = await this.getFavoritesCollection();
		return favoritesCollection.sequenceIds.includes(sequenceId);
	}

	async getFavorites(): Promise<LibrarySequence[]> {
		const favoritesCollection = await this.getFavoritesCollection();
		return this.getCollectionSequences(favoritesCollection.id);
	}

	async getFavoriteIds(): Promise<Set<string>> {
		const favoritesCollection = await this.getFavoritesCollection();
		return new Set(favoritesCollection.sequenceIds);
	}

	// ============================================================
	// PUBLIC COLLECTIONS (for viewing other users' collections)
	// ============================================================

	async getUserPublicCollections(userId: string): Promise<LibraryCollection[]> {
		const collectionsRef = collection(
			firestore,
			getUserCollectionsPath(userId)
		);
		const q = query(
			collectionsRef,
			where("isPublic", "==", true),
			orderBy("sortOrder", "asc")
		);

		const snapshot = await getDocs(q);
		const collections: LibraryCollection[] = [];

		snapshot.forEach((doc) => {
			collections.push(this.mapDocToCollection(doc.data(), doc.id));
		});

		return collections;
	}

	async getUserCollectionSequences(
		userId: string,
		collectionId: string
	): Promise<LibrarySequence[]> {
		// First verify the collection is public
		const collectionRef = doc(
			firestore,
			getUserCollectionPath(userId, collectionId)
		);
		const collectionSnap = await getDoc(collectionRef);

		if (!collectionSnap.exists()) {
			return [];
		}

		const collectionData = this.mapDocToCollection(
			collectionSnap.data(),
			collectionId
		);

		// Only return sequences if collection is public
		if (!collectionData.isPublic) {
			console.warn(
				`[CollectionService] Attempted to access non-public collection: ${collectionId}`
			);
			return [];
		}

		// Fetch sequences
		const sequences: LibrarySequence[] = [];
		for (const sequenceId of collectionData.sequenceIds) {
			const seqRef = doc(firestore, getUserSequencePath(userId, sequenceId));
			const seqSnap = await getDoc(seqRef);
			if (seqSnap.exists()) {
				const seqData = seqSnap.data();
				// Only include public sequences
				if (seqData["visibility"] === "public") {
					sequences.push(this.mapDocToSequence(seqData, sequenceId));
				}
			}
		}

		return sequences;
	}
}
