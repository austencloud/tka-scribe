/**
 * Spell Service Loader Implementation
 *
 * Provides lazy-loaded access to spell-related services.
 * Handles DI module loading and service caching.
 */

import { injectable } from "inversify";
import { loadFeatureModule, resolve } from "$lib/shared/inversify/di";
import { TYPES } from "$lib/shared/inversify/types";
import { SPELL_TYPES } from "./spell-types";
import type { ISpellServiceLoader } from "../contracts/ISpellServiceLoader";
import type { ILetterTransitionGraph } from "../contracts/ILetterTransitionGraph";
import type { IWordSequenceGenerator } from "../contracts/IWordSequenceGenerator";
import type { IVariationExplorer } from "../contracts/IVariationExplorer";
import type { IVariationDeduplicator } from "../contracts/IVariationDeduplicator";
import type { IVariationScorer } from "../contracts/IVariationScorer";
import type { ISequenceExtender } from "$lib/features/create/shared/services/contracts/ISequenceExtender";

@injectable()
export class SpellServiceLoader implements ISpellServiceLoader {
  private wordGenerator: IWordSequenceGenerator | null = null;
  private transitionGraph: ILetterTransitionGraph | null = null;
  private sequenceExtender: ISequenceExtender | null = null;
  private variationExplorer: IVariationExplorer | null = null;
  private variationDeduplicator: IVariationDeduplicator | null = null;
  private variationScorer: IVariationScorer | null = null;
  private modulesLoaded = false;

  /**
   * Ensure required DI modules are loaded before resolving services
   */
  private async ensureModulesLoaded(): Promise<void> {
    if (this.modulesLoaded) return;
    // Load learn module for CodexLetterMappingRepo dependency
    await loadFeatureModule("learn");
    this.modulesLoaded = true;
  }

  async getWordGenerator(): Promise<IWordSequenceGenerator> {
    await this.ensureModulesLoaded();
    if (!this.wordGenerator) {
      this.wordGenerator = resolve<IWordSequenceGenerator>(
        SPELL_TYPES.IWordSequenceGenerator
      );
    }
    return this.wordGenerator;
  }

  async getTransitionGraph(): Promise<ILetterTransitionGraph> {
    await this.ensureModulesLoaded();
    if (!this.transitionGraph) {
      this.transitionGraph = resolve<ILetterTransitionGraph>(
        SPELL_TYPES.ILetterTransitionGraph
      );
      if (!this.transitionGraph.isInitialized()) {
        await this.transitionGraph.initialize();
      }
    }
    return this.transitionGraph;
  }

  async getSequenceExtender(): Promise<ISequenceExtender> {
    await this.ensureModulesLoaded();
    if (!this.sequenceExtender) {
      this.sequenceExtender = resolve<ISequenceExtender>(TYPES.ISequenceExtender);
    }
    return this.sequenceExtender;
  }

  async getVariationExplorer(): Promise<IVariationExplorer> {
    await this.ensureModulesLoaded();
    if (!this.variationExplorer) {
      this.variationExplorer = resolve<IVariationExplorer>(
        SPELL_TYPES.IVariationExplorer
      );
    }
    return this.variationExplorer;
  }

  async getVariationDeduplicator(): Promise<IVariationDeduplicator> {
    await this.ensureModulesLoaded();
    if (!this.variationDeduplicator) {
      this.variationDeduplicator = resolve<IVariationDeduplicator>(
        SPELL_TYPES.IVariationDeduplicator
      );
    }
    return this.variationDeduplicator;
  }

  async getVariationScorer(): Promise<IVariationScorer> {
    await this.ensureModulesLoaded();
    if (!this.variationScorer) {
      this.variationScorer = resolve<IVariationScorer>(
        SPELL_TYPES.IVariationScorer
      );
    }
    return this.variationScorer;
  }
}
