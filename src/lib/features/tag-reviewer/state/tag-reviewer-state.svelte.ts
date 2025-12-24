/**
 * Tag Reviewer State
 *
 * Manages state for the tag review workflow.
 * Tags are generated on-the-fly when viewing each sequence for faster algorithm iteration.
 */

import { tryResolve } from "$lib/shared/inversify/di";
import { CAPLabelerTypes } from "$lib/shared/inversify/types/cap-labeler.types";
import type { ISequenceFeatureExtractor } from "$lib/features/cap-labeler/services/contracts/ISequenceFeatureExtractor";
import type { IRuleBasedTagger } from "$lib/features/cap-labeler/services/contracts/IRuleBasedTagger";
import type { IBeatDataConversionService } from "$lib/features/cap-labeler/services/contracts/IBeatDataConversionService";
import type {
	TaggedSequenceEntry,
	SequenceTagReview,
	ReviewableTag,
	TagReviewFilterMode,
	TagReviewStats,
} from "../domain/models/tag-review-models";
import { createSequenceData } from "$lib/shared/foundation/domain/models/SequenceData";

// Clear any old persisted reviews from localStorage
const OLD_STORAGE_KEY = "tka-tag-reviews";

/**
 * Create the tag reviewer state
 */
export function createTagReviewerState() {
	// === Core State ===
	let sequences = $state<TaggedSequenceEntry[]>([]);
	let reviews = $state<Map<string, SequenceTagReview>>(new Map());
	let currentIndex = $state(0);
	let filterMode = $state<TagReviewFilterMode>("all"); // Default to "all" since we're not persisting
	let loading = $state(true);
	let notes = $state("");

	// === Services ===
	let featureExtractor: ISequenceFeatureExtractor | null = null;
	let tagger: IRuleBasedTagger | null = null;
	let conversionService: IBeatDataConversionService | null = null;

	// === Derived State ===
	const filteredSequences = $derived.by(() => {
		switch (filterMode) {
			case "pending":
				return sequences.filter((seq) => {
					const review = reviews.get(seq.word);
					return !review || !review.isFullyReviewed;
				});
			case "reviewed":
				return sequences.filter((seq) => {
					const review = reviews.get(seq.word);
					return review?.isFullyReviewed === true;
				});
			case "hasRejected":
				return sequences.filter((seq) => {
					const review = reviews.get(seq.word);
					return review?.suggestedTags.some((t) => t.reviewState === "rejected");
				});
			default:
				return sequences;
		}
	});

	const currentSequence = $derived(filteredSequences[currentIndex] ?? null);

	// Pure derived - just lookup (no side effects)
	const currentReview = $derived(reviews.get(currentSequence?.word ?? "") ?? null);

	const stats = $derived.by((): TagReviewStats => {
		const totalSequences = sequences.length;
		const reviewedSequences = Array.from(reviews.values()).filter(
			(r) => r.isFullyReviewed
		).length;
		const pendingSequences = totalSequences - reviewedSequences;
		const percentComplete =
			totalSequences > 0
				? Math.round((reviewedSequences / totalSequences) * 100)
				: 0;

		let totalTags = 0;
		let confirmedTags = 0;
		let rejectedTags = 0;

		for (const review of reviews.values()) {
			for (const tag of review.suggestedTags) {
				totalTags++;
				if (tag.reviewState === "confirmed") confirmedTags++;
				if (tag.reviewState === "rejected") rejectedTags++;
			}
		}

		return {
			totalSequences,
			reviewedSequences,
			pendingSequences,
			percentComplete,
			totalTags,
			confirmedTags,
			rejectedTags,
		};
	});

	/**
	 * Generate tags for a single sequence on-the-fly
	 */
	function generateTagsForSequence(seq: TaggedSequenceEntry): SequenceTagReview | null {
		if (!featureExtractor || !tagger || !conversionService) {
			console.warn("[TagReviewerState] Services not available for tag generation");
			return null;
		}

		if (!seq.fullMetadata?.sequence) {
			console.log(`[TagReviewerState] Skipping ${seq.word} - no fullMetadata.sequence`);
			return null;
		}

		try {
			const gridMode = conversionService.getAuthoritativeGridMode(seq as any);
			const { beats, startPosition } = conversionService.convertRawToBeats(
				seq.word,
				seq.fullMetadata.sequence as any[],
				gridMode
			);

			// Create a minimal SequenceData object
			// Include capType for accurate tag generation (uses authoritative CAP label)
			const sequenceData = createSequenceData({
				word: seq.word,
				beats,
				gridMode: gridMode as any,
				isCircular: seq.isCircular,
				startPosition: startPosition ?? undefined,
				capType: seq.capType as any ?? undefined,
			});

			// Extract features and generate tags
			const features = featureExtractor.extractFeatures(sequenceData);
			const suggestedTags = tagger.suggestTags(features);

			console.log(`[TagReviewerState] ${seq.word}: generated ${suggestedTags.length} tags on-the-fly`);

			// Create review with pending tags
			const reviewableTags: ReviewableTag[] = suggestedTags.map((tag) => ({
				...tag,
				reviewState: "pending" as const,
			}));

			return {
				word: seq.word,
				suggestedTags: reviewableTags,
				customTags: [],
				reviewedAt: new Date().toISOString(),
				isFullyReviewed: false,
			};
		} catch (error) {
			console.warn(`[TagReviewerState] Failed to generate tags for ${seq.word}:`, error);
			return null;
		}
	}

	// === Initialize ===
	async function initialize() {
		loading = true;

		// Clear old persisted reviews from localStorage
		try {
			localStorage.removeItem(OLD_STORAGE_KEY);
			console.log("[TagReviewerState] Cleared old persisted reviews");
		} catch {
			// Ignore errors
		}

		// Resolve services
		featureExtractor = tryResolve<ISequenceFeatureExtractor>(
			CAPLabelerTypes.ISequenceFeatureExtractor
		);
		tagger = tryResolve<IRuleBasedTagger>(CAPLabelerTypes.IRuleBasedTagger);
		conversionService = tryResolve<IBeatDataConversionService>(
			CAPLabelerTypes.IBeatDataConversionService
		);

		// Load sequences from sequence-index.json
		try {
			const response = await fetch("/data/sequence-index.json");
			const data = await response.json();

			sequences = data.sequences.map(
				(seq: Record<string, unknown>) =>
					({
						id: seq.id as string,
						word: seq.word as string,
						thumbnails: (seq.thumbnails as string[]) ?? [],
						sequenceLength: seq.sequenceLength as number,
						gridMode: (seq.gridMode as string) ?? "diamond",
						isCircular: seq.isCircular as boolean,
						capType: (seq.capType as string) ?? null,
						fullMetadata: seq.fullMetadata as { sequence?: unknown[] },
					}) as TaggedSequenceEntry
			);

			console.log(`[TagReviewerState] Loaded ${sequences.length} sequences`);
			// Tags will be generated on-the-fly when viewing each sequence
		} catch (error) {
			console.error("[TagReviewerState] Failed to load sequences:", error);
		}

		loading = false;
	}

	// === Actions ===
	function setFilterMode(mode: TagReviewFilterMode) {
		filterMode = mode;
		currentIndex = 0;
	}

	function nextSequence() {
		if (currentIndex < filteredSequences.length - 1) {
			currentIndex++;
			notes = "";
		}
	}

	function previousSequence() {
		if (currentIndex > 0) {
			currentIndex--;
			notes = "";
		}
	}

	function skipSequence() {
		nextSequence();
	}

	function jumpToSequence(id: string) {
		const idx = filteredSequences.findIndex((s) => s.id === id);
		if (idx !== -1) {
			currentIndex = idx;
			notes = "";
		}
	}

	function setNotes(value: string) {
		notes = value;
	}

	/**
	 * Ensure tags are generated for the current sequence.
	 * Call this from the component when the sequence changes.
	 */
	function ensureTagsGenerated() {
		if (!currentSequence) {
			console.log("[TagReviewerState] ensureTagsGenerated: no currentSequence");
			return;
		}
		if (reviews.has(currentSequence.word)) {
			console.log(`[TagReviewerState] ensureTagsGenerated: already have review for ${currentSequence.word}`);
			return;
		}

		console.log(`[TagReviewerState] ensureTagsGenerated: generating for ${currentSequence.word}`);
		console.log(`[TagReviewerState] Services available: featureExtractor=${!!featureExtractor}, tagger=${!!tagger}, conversionService=${!!conversionService}`);

		const generated = generateTagsForSequence(currentSequence);
		if (generated) {
			reviews.set(currentSequence.word, generated);
			reviews = new Map(reviews);
			console.log(`[TagReviewerState] Generated ${generated.suggestedTags.length} tags for ${currentSequence.word}`);
		} else {
			console.warn(`[TagReviewerState] Failed to generate tags for ${currentSequence.word}`);
		}
	}

	/**
	 * Regenerate tags for current sequence (useful after algorithm changes)
	 */
	function regenerateCurrentTags() {
		if (!currentSequence) return;

		// Remove existing review to force regeneration
		reviews.delete(currentSequence.word);
		reviews = new Map(reviews);

		// Now generate new tags
		ensureTagsGenerated();
		console.log(`[TagReviewerState] Regenerated tags for ${currentSequence.word}`);
	}

	function confirmTag(tagIndex: number) {
		if (!currentSequence) return;

		const review = reviews.get(currentSequence.word);
		if (!review || tagIndex >= review.suggestedTags.length) return;

		const existingTag = review.suggestedTags[tagIndex];
		if (!existingTag) return;

		review.suggestedTags[tagIndex] = {
			tag: existingTag.tag,
			category: existingTag.category,
			confidence: existingTag.confidence,
			source: existingTag.source,
			reason: existingTag.reason,
			conflictsWith: existingTag.conflictsWith,
			reviewState: "confirmed",
			reviewedAt: new Date().toISOString(),
		};

		updateReviewStatus(review);
		// Trigger Svelte reactivity by reassigning the Map
		reviews = new Map(reviews);
	}

	function rejectTag(tagIndex: number, reason?: string) {
		if (!currentSequence) return;

		const review = reviews.get(currentSequence.word);
		if (!review || tagIndex >= review.suggestedTags.length) return;

		const existingTag = review.suggestedTags[tagIndex];
		if (!existingTag) return;

		review.suggestedTags[tagIndex] = {
			tag: existingTag.tag,
			category: existingTag.category,
			confidence: existingTag.confidence,
			source: existingTag.source,
			reason: existingTag.reason,
			conflictsWith: existingTag.conflictsWith,
			reviewState: "rejected",
			reviewedAt: new Date().toISOString(),
			reviewNote: reason,
		};

		updateReviewStatus(review);
		// Trigger Svelte reactivity by reassigning the Map
		reviews = new Map(reviews);
	}

	function resetTag(tagIndex: number) {
		if (!currentSequence) return;

		const review = reviews.get(currentSequence.word);
		if (!review || tagIndex >= review.suggestedTags.length) return;

		const existingTag = review.suggestedTags[tagIndex];
		if (!existingTag) return;

		review.suggestedTags[tagIndex] = {
			tag: existingTag.tag,
			category: existingTag.category,
			confidence: existingTag.confidence,
			source: existingTag.source,
			reason: existingTag.reason,
			conflictsWith: existingTag.conflictsWith,
			reviewState: "pending",
			reviewedAt: undefined,
			reviewNote: undefined,
		};

		updateReviewStatus(review);
		// Trigger Svelte reactivity by reassigning the Map
		reviews = new Map(reviews);
	}

	function addCustomTag(tag: string, category: string) {
		if (!currentSequence) return;

		let review = reviews.get(currentSequence.word);
		if (!review) {
			review = {
				word: currentSequence.word,
				suggestedTags: [],
				customTags: [],
				reviewedAt: new Date().toISOString(),
				isFullyReviewed: false,
			};
			reviews.set(currentSequence.word, review);
		}

		if (!review.customTags.includes(tag)) {
			review.customTags.push(tag);
			// Trigger Svelte reactivity by reassigning the Map
			reviews = new Map(reviews);
		}
	}

	function removeCustomTag(tag: string) {
		if (!currentSequence) return;

		const review = reviews.get(currentSequence.word);
		if (!review) return;

		review.customTags = review.customTags.filter((t) => t !== tag);
		// Trigger Svelte reactivity by reassigning the Map
		reviews = new Map(reviews);
	}

	function confirmAllTags() {
		if (!currentSequence) return;

		const review = reviews.get(currentSequence.word);
		if (!review) return;

		review.suggestedTags = review.suggestedTags.map((tag) => ({
			...tag,
			reviewState: "confirmed" as const,
			reviewedAt: new Date().toISOString(),
		}));

		updateReviewStatus(review);
		// Trigger Svelte reactivity by reassigning the Map
		reviews = new Map(reviews);
	}

	function updateReviewStatus(review: SequenceTagReview) {
		const allReviewed = review.suggestedTags.every(
			(t) => t.reviewState !== "pending"
		);
		review.isFullyReviewed = allReviewed;
		review.reviewedAt = new Date().toISOString();
		if (notes) {
			review.notes = notes;
		}
	}

	function dispose() {
		// No persistence - reviews are session-only
	}

	return {
		// State (getters)
		get sequences() {
			return sequences;
		},
		get filteredSequences() {
			return filteredSequences;
		},
		get currentSequence() {
			return currentSequence;
		},
		get currentReview() {
			return currentReview;
		},
		get currentIndex() {
			return currentIndex;
		},
		get filterMode() {
			return filterMode;
		},
		get loading() {
			return loading;
		},
		get notes() {
			return notes;
		},
		get stats() {
			return stats;
		},
		get reviews() {
			return reviews;
		},

		// Actions
		initialize,
		dispose,
		setFilterMode,
		nextSequence,
		previousSequence,
		skipSequence,
		jumpToSequence,
		setNotes,
		confirmTag,
		rejectTag,
		resetTag,
		addCustomTag,
		removeCustomTag,
		confirmAllTags,
		ensureTagsGenerated,
		regenerateCurrentTags,
	};
}

// Singleton state
export const tagReviewerState = createTagReviewerState();
