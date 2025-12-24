/**
 * Rule-Based Tagger Service Contract
 *
 * Suggests tags using deterministic heuristics (no ML).
 * Consumes SequenceFeatures and returns SuggestedTag[] with confidence scores.
 */

import type { SequenceFeatures } from "../../domain/models/sequence-features";
import type {
	SuggestedTag,
	TagSuggestionResult,
} from "../../domain/models/suggested-tag";

export interface IRuleBasedTagger {
	/**
	 * Suggest tags for a sequence based on its extracted features
	 *
	 * @param features - Extracted sequence features from SequenceFeatureExtractor
	 * @returns Array of suggested tags with confidence scores
	 */
	suggestTags(features: SequenceFeatures): SuggestedTag[];

	/**
	 * Suggest tags and group by confidence level
	 *
	 * @param features - Extracted sequence features
	 * @returns Grouped tag suggestions with analysis
	 */
	suggestTagsGrouped(features: SequenceFeatures): TagSuggestionResult;

	/**
	 * Get difficulty tag based on beat count
	 *
	 * @param beatCount - Number of beats in sequence
	 * @returns Difficulty-related tags
	 */
	getDifficultyTags(beatCount: number): SuggestedTag[];

	/**
	 * Get structure tags based on circularity analysis
	 *
	 * @param features - Sequence features containing circularity info
	 * @returns Structure-related tags (circular, CAP types, etc.)
	 */
	getStructureTags(features: SequenceFeatures): SuggestedTag[];

	/**
	 * Get motion tags based on reversal and complexity analysis
	 *
	 * @param features - Sequence features containing motion info
	 * @returns Motion-related tags (reversals, complexity, etc.)
	 */
	getMotionTags(features: SequenceFeatures): SuggestedTag[];

	/**
	 * Get position-based tags
	 *
	 * @param features - Sequence features containing position dominance
	 * @returns Position-related tags (alpha-based, beta-based, etc.)
	 */
	getPositionTags(features: SequenceFeatures): SuggestedTag[];
}
