/**
 * Spell Service DI Type Symbols
 *
 * Re-exports centralized type symbols from CreateTypes.
 * This provides a local reference for the Spell feature.
 */

import { CreateTypes } from "$lib/shared/inversify/types/create.types";

export const SPELL_TYPES = {
  ILetterTransitionGraph: CreateTypes.ILetterTransitionGraph,
  IWordSequenceGenerator: CreateTypes.IWordSequenceGenerator,
  IVariationExplorer: CreateTypes.IVariationExplorer,
  IVariationDeduplicator: CreateTypes.IVariationDeduplicator,
  IVariationScorer: CreateTypes.IVariationScorer,
  ISpellServiceLoader: CreateTypes.ISpellServiceLoader,
  ISpellGenerationOrchestrator: CreateTypes.ISpellGenerationOrchestrator,
  IVariationExplorationOrchestrator:
    CreateTypes.IVariationExplorationOrchestrator,
  ILOOPSelectionCoordinator: CreateTypes.ILOOPSelectionCoordinator,
} as const;
