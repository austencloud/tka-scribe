/**
 * Tag Review Domain Models
 *
 * Models specific to the tag review workflow.
 */

import type { BaseSequenceEntry } from "$lib/shared/sequence-review/domain/models/review-models";
import type { SuggestedTag, TagCategory } from "$lib/features/loop-labeler/domain/models/suggested-tag";

/**
 * Extended sequence entry with tag data
 */
export interface TaggedSequenceEntry extends BaseSequenceEntry {
	loopType: string | null;
}

/**
 * Review state for a single tag
 */
export type TagReviewState = "pending" | "confirmed" | "rejected";

/**
 * A tag with its review state
 */
export interface ReviewableTag extends SuggestedTag {
	reviewState: TagReviewState;
	reviewedAt?: string;
	reviewNote?: string;
}

/**
 * Persisted tag review data for a sequence
 */
export interface SequenceTagReview {
	word: string;
	suggestedTags: ReviewableTag[];
	customTags: string[];
	reviewedAt: string;
	isFullyReviewed: boolean;
	notes?: string;
}

/**
 * Filter modes for tag review
 */
export type TagReviewFilterMode = "all" | "pending" | "reviewed" | "hasRejected";

/**
 * Stats for tag review progress
 */
export interface TagReviewStats {
	totalSequences: number;
	reviewedSequences: number;
	pendingSequences: number;
	percentComplete: number;
	totalTags: number;
	confirmedTags: number;
	rejectedTags: number;
}

/**
 * Tag definition for custom/new tags
 */
export interface TagDefinition {
	tag: string;
	category: TagCategory;
	description: string;
	criteria?: string;
	examples?: string[];
}
