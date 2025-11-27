/**
 * Library Domain Models
 *
 * Core data structures for the Library module.
 */

// LibrarySequence - Main sequence model
export type {
	LibrarySequence,
	SequenceSource,
	SequenceVisibility,
	ForkAttribution,
	CreateLibrarySequenceOptions,
} from "./LibrarySequence";
export {
	createLibrarySequence,
	updateLibrarySequence,
	isOwnedBy,
	isForked,
	isPublic,
} from "./LibrarySequence";

// Collection - Named folders
export type {
	LibraryCollection,
	CreateCollectionOptions,
} from "./Collection";
export {
	createCollection,
	updateCollection,
	addSequenceToCollection,
	removeSequenceFromCollection,
} from "./Collection";

// Act - Sequence playlists
export type {
	Act,
	ActItem,
	ActTransitionType,
	CreateActOptions,
} from "./Act";
export {
	createAct,
	createActItem,
	updateAct,
	addSequenceToAct,
	removeSequenceFromAct,
	reorderActItems,
	updateActItem,
} from "./Act";

// Tag - User-defined tags
export type { LibraryTag, CreateTagOptions } from "./Tag";
export {
	createTag,
	updateTagUseCount,
	TAG_COLORS,
	DEFAULT_TAG_SUGGESTIONS,
} from "./Tag";

// PublicSequenceIndex - Denormalized public feed
export type { PublicSequenceIndex } from "./PublicSequenceIndex";
export { createPublicSequenceIndex } from "./PublicSequenceIndex";
