/**
 * Rule-Based Tagger Service Implementation
 *
 * Suggests tags using deterministic heuristics (no ML).
 * Applies simple rules based on sequence features to generate tag suggestions.
 */

import { injectable } from "inversify";
import type { IRuleBasedTagger } from "../contracts/IRuleBasedTagger";
import type { SequenceFeatures } from "../../domain/models/sequence-features";
import type { SuggestedTag, TagSuggestionResult } from "../../domain/models/suggested-tag";
import {
	createSuggestedTag,
	groupByConfidenceLevel,
} from "../../domain/models/suggested-tag";
import { GridMode, GridPositionGroup } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
import { PropType } from "$lib/shared/pictograph/prop/domain/enums/PropType";

// === Difficulty Thresholds ===
const BEGINNER_MAX_BEATS = 8;
const INTERMEDIATE_MAX_BEATS = 16;
// Anything above is advanced

// === Position Dominance Thresholds ===
const HEAVY_THRESHOLD = 50; // >50% = "heavy"
const STRONG_THRESHOLD = 65; // >65% = high confidence

@injectable()
export class RuleBasedTagger implements IRuleBasedTagger {
	/**
	 * Suggest all applicable tags for a sequence
	 */
	suggestTags(features: SequenceFeatures): SuggestedTag[] {
		const tags: SuggestedTag[] = [];

		// Difficulty tags
		tags.push(...this.getDifficultyTags(features.beatCount));

		// Structure tags (circularity, CAP)
		tags.push(...this.getStructureTags(features));

		// Prop type tags
		tags.push(...this.getPropTags(features));

		// Motion tags (reversals, complexity)
		tags.push(...this.getMotionTags(features));

		// Grid mode tags
		tags.push(...this.getGridTags(features));

		// Position tags
		tags.push(...this.getPositionTags(features));

		return tags;
	}

	/**
	 * Suggest tags and group by confidence level
	 */
	suggestTagsGrouped(features: SequenceFeatures): TagSuggestionResult {
		const tags = this.suggestTags(features);
		return groupByConfidenceLevel(tags);
	}

	/**
	 * Get difficulty tags based on beat count
	 */
	getDifficultyTags(beatCount: number): SuggestedTag[] {
		const tags: SuggestedTag[] = [];

		if (beatCount === 0) {
			return tags;
		}

		if (beatCount <= BEGINNER_MAX_BEATS) {
			// Short sequences are beginner-friendly
			const confidence = beatCount <= 4 ? 1.0 : 0.9;
			tags.push(
				createSuggestedTag(
					"beginner",
					"difficulty",
					confidence,
					`${beatCount} beats is suitable for beginners`,
					["intermediate", "advanced"]
				)
			);
		} else if (beatCount <= INTERMEDIATE_MAX_BEATS) {
			// Medium sequences are intermediate
			const confidence = 0.85;
			tags.push(
				createSuggestedTag(
					"intermediate",
					"difficulty",
					confidence,
					`${beatCount} beats requires some experience`,
					["beginner", "advanced"]
				)
			);
		} else {
			// Long sequences are advanced
			const confidence = beatCount >= 24 ? 1.0 : 0.85;
			tags.push(
				createSuggestedTag(
					"advanced",
					"difficulty",
					confidence,
					`${beatCount} beats is a longer sequence`,
					["beginner", "intermediate"]
				)
			);
		}

		return tags;
	}

	/**
	 * Get structure tags based on circularity analysis
	 */
	getStructureTags(features: SequenceFeatures): SuggestedTag[] {
		const tags: SuggestedTag[] = [];
		const { circularity, detectedCapTypes } = features;

		// Circular tag
		if (circularity.isCircular) {
			tags.push(
				createSuggestedTag(
					"circular",
					"structure",
					1.0,
					"Sequence returns to starting position"
				)
			);

			// Add detected CAP types
			for (const capType of detectedCapTypes) {
				tags.push(
					createSuggestedTag(
						capType.toLowerCase(),
						"structure",
						0.95,
						`Detected ${capType} circular pattern`
					)
				);
			}

			// If circular but no specific CAP type detected
			if (detectedCapTypes.length === 0 && circularity.possibleCapTypes.length > 0) {
				// Add possible CAP types with lower confidence
				for (const possibleType of circularity.possibleCapTypes) {
					tags.push(
						createSuggestedTag(
							possibleType.toLowerCase(),
							"structure",
							0.6,
							`Possible ${possibleType} pattern (needs verification)`
						)
					);
				}
			}
		} else {
			tags.push(
				createSuggestedTag(
					"linear",
					"structure",
					0.9,
					"Sequence does not return to starting position"
				)
			);
		}

		return tags;
	}

	/**
	 * Get prop type tags
	 */
	private getPropTags(features: SequenceFeatures): SuggestedTag[] {
		const tags: SuggestedTag[] = [];

		if (features.propType) {
			const propName = this.getPropName(features.propType);
			tags.push(
				createSuggestedTag(
					propName,
					"prop",
					1.0,
					`Sequence uses ${propName} props`
				)
			);
		}

		return tags;
	}

	/**
	 * Get motion tags based on reversal and complexity analysis
	 */
	getMotionTags(features: SequenceFeatures): SuggestedTag[] {
		const tags: SuggestedTag[] = [];
		const { reversals, motionComplexity, hasConsistentMotions } = features;

		// Reversal tags
		if (reversals.hasReversals) {
			tags.push(
				createSuggestedTag(
					"reversals",
					"motion",
					1.0,
					`${reversals.totalReversals} reversal(s) detected`
				)
			);

			// Specific reversal types
			if (reversals.blueReversalCount > 0) {
				tags.push(
					createSuggestedTag(
						"blue-reversals",
						"motion",
						0.95,
						`${reversals.blueReversalCount} blue hand reversal(s)`
					)
				);
			}

			if (reversals.redReversalCount > 0) {
				tags.push(
					createSuggestedTag(
						"red-reversals",
						"motion",
						0.95,
						`${reversals.redReversalCount} red hand reversal(s)`
					)
				);
			}

			if (reversals.synchronizedReversals) {
				tags.push(
					createSuggestedTag(
						"synchronized-reversals",
						"motion",
						0.9,
						"Blue and red hands reverse together"
					)
				);
			}
		}

		// Motion complexity tags
		tags.push(
			createSuggestedTag(
				`${motionComplexity}-motion`,
				"motion",
				0.85,
				`Motion complexity is ${motionComplexity}`
			)
		);

		// Consistent motions tag
		if (hasConsistentMotions) {
			tags.push(
				createSuggestedTag(
					"consistent-motion",
					"motion",
					0.8,
					"Uses consistent motion types throughout"
				)
			);
		}

		// Two-handed tag
		if (features.usesBothHands) {
			tags.push(
				createSuggestedTag(
					"two-handed",
					"motion",
					0.9,
					"Uses both hands throughout"
				)
			);
		}

		return tags;
	}

	/**
	 * Get grid mode tags
	 */
	private getGridTags(features: SequenceFeatures): SuggestedTag[] {
		const tags: SuggestedTag[] = [];

		if (features.gridMode) {
			const gridName = this.getGridName(features.gridMode);
			tags.push(
				createSuggestedTag(
					gridName,
					"grid",
					1.0,
					`Uses ${gridName} grid mode`
				)
			);
		}

		return tags;
	}

	/**
	 * Get position-based tags
	 */
	getPositionTags(features: SequenceFeatures): SuggestedTag[] {
		const tags: SuggestedTag[] = [];
		const { positionDominance } = features;

		if (positionDominance.isBalanced) {
			tags.push(
				createSuggestedTag(
					"balanced-positions",
					"position",
					0.85,
					"Uses positions from multiple groups evenly"
				)
			);
		} else {
			// Add dominance tags
			if (positionDominance.isAlphaHeavy) {
				const confidence =
					positionDominance.alphaPercent >= STRONG_THRESHOLD ? 0.95 : 0.8;
				tags.push(
					createSuggestedTag(
						"alpha-based",
						"position",
						confidence,
						`${positionDominance.alphaPercent}% of positions are alpha`,
						["beta-based", "gamma-based"]
					)
				);
			}

			if (positionDominance.isBetaHeavy) {
				const confidence =
					positionDominance.betaPercent >= STRONG_THRESHOLD ? 0.95 : 0.8;
				tags.push(
					createSuggestedTag(
						"beta-based",
						"position",
						confidence,
						`${positionDominance.betaPercent}% of positions are beta`,
						["alpha-based", "gamma-based"]
					)
				);
			}

			if (positionDominance.isGammaHeavy) {
				const confidence =
					positionDominance.gammaPercent >= STRONG_THRESHOLD ? 0.95 : 0.8;
				tags.push(
					createSuggestedTag(
						"gamma-based",
						"position",
						confidence,
						`${positionDominance.gammaPercent}% of positions are gamma`,
						["alpha-based", "beta-based"]
					)
				);
			}
		}

		// Primary group tag (even if not "heavy")
		if (positionDominance.primaryGroup && !positionDominance.isBalanced) {
			const groupName = this.getGroupName(positionDominance.primaryGroup);
			// Only add if we haven't already added a *-based tag for this group
			const alreadyTagged =
				(positionDominance.primaryGroup === GridPositionGroup.ALPHA &&
					positionDominance.isAlphaHeavy) ||
				(positionDominance.primaryGroup === GridPositionGroup.BETA &&
					positionDominance.isBetaHeavy) ||
				(positionDominance.primaryGroup === GridPositionGroup.GAMMA &&
					positionDominance.isGammaHeavy);

			if (!alreadyTagged) {
				tags.push(
					createSuggestedTag(
						`${groupName}-leaning`,
						"position",
						0.6,
						`Most positions are ${groupName} (but not dominant)`
					)
				);
			}
		}

		return tags;
	}

	// === Private Helpers ===

	private getPropName(propType: PropType): string {
		switch (propType) {
			case PropType.STAFF:
			case PropType.SIMPLESTAFF:
			case PropType.BIGSTAFF:
			case PropType.STAFF2:
				return "staff";
			case PropType.FAN:
			case PropType.BIGFAN:
				return "fan";
			case PropType.CLUB:
			case PropType.BIGCLUB:
				return "club";
			case PropType.BUUGENG:
			case PropType.BIGBUUGENG:
			case PropType.FRACTALGENG:
				return "buugeng";
			case PropType.MINIHOOP:
			case PropType.BIGHOOP:
				return "hoop";
			case PropType.HAND:
				return "hand";
			case PropType.TRIAD:
			case PropType.BIGTRIAD:
				return "triad";
			case PropType.DOUBLESTAR:
			case PropType.BIGDOUBLESTAR:
				return "double-star";
			case PropType.SWORD:
				return "sword";
			case PropType.CHICKEN:
			case PropType.BIGCHICKEN:
				return "chicken";
			case PropType.TRIQUETRA:
			case PropType.TRIQUETRA2:
				return "triquetra";
			case PropType.GUITAR:
			case PropType.UKULELE:
				return "guitar";
			case PropType.EIGHTRINGS:
			case PropType.BIGEIGHTRINGS:
				return "eight-rings";
			case PropType.QUIAD:
				return "quiad";
			default:
				return "unknown-prop";
		}
	}

	private getGridName(gridMode: GridMode): string {
		switch (gridMode) {
			case GridMode.DIAMOND:
				return "diamond-grid";
			case GridMode.BOX:
				return "box-grid";
			default:
				return "unknown-grid";
		}
	}

	private getGroupName(group: GridPositionGroup): string {
		switch (group) {
			case GridPositionGroup.ALPHA:
				return "alpha";
			case GridPositionGroup.BETA:
				return "beta";
			case GridPositionGroup.GAMMA:
				return "gamma";
			default:
				return "unknown";
		}
	}
}
