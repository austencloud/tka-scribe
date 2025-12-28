/**
 * CAPLabelerServiceLocator
 *
 * Centralized service resolution with caching for CAP Labeler.
 * Separates DI concerns from state management.
 */

import { tryResolve } from "$lib/shared/inversify/di";
import { CAPLabelerTypes } from "$lib/shared/inversify/types/cap-labeler.types";
import type { ISequenceLoader } from "../services/contracts/ISequenceLoader";
import type { ICAPLabelsFirebaseRepository } from "../services/contracts/ICAPLabelsFirebaseRepository";
import type { INavigator } from "../services/contracts/INavigator";
import type { ICAPDetector } from "../services/contracts/ICAPDetector";

export class CAPLabelerServiceLocator {
  private cachedSequenceLoader: ISequenceLoader | null = null;
  private cachedLabelsRepository: ICAPLabelsFirebaseRepository | null = null;
  private cachedNavigator: INavigator | null = null;
  private cachedDetector: ICAPDetector | null = null;

  get sequenceLoader(): ISequenceLoader | null {
    if (!this.cachedSequenceLoader) {
      this.cachedSequenceLoader = tryResolve<ISequenceLoader>(CAPLabelerTypes.ISequenceLoader);
    }
    return this.cachedSequenceLoader;
  }

  get labelsRepository(): ICAPLabelsFirebaseRepository | null {
    if (!this.cachedLabelsRepository) {
      try {
        this.cachedLabelsRepository = tryResolve<ICAPLabelsFirebaseRepository>(
          CAPLabelerTypes.ICAPLabelsFirebaseRepository
        );
      } catch {
        return null;
      }
    }
    return this.cachedLabelsRepository;
  }

  get navigator(): INavigator | null {
    if (!this.cachedNavigator) {
      this.cachedNavigator = tryResolve<INavigator>(CAPLabelerTypes.INavigator);
    }
    return this.cachedNavigator;
  }

  get detector(): ICAPDetector | null {
    if (!this.cachedDetector) {
      this.cachedDetector = tryResolve<ICAPDetector>(CAPLabelerTypes.ICAPLabelerDetectionService);
    }
    return this.cachedDetector;
  }

  /** Pre-cache all services (call after DI module is loaded) */
  cacheAll(): void {
    // Access each getter to trigger caching
    this.sequenceLoader;
    this.labelsRepository;
    this.navigator;
    this.detector;
  }

  /** Clear all cached services */
  clear(): void {
    this.cachedSequenceLoader = null;
    this.cachedLabelsRepository = null;
    this.cachedNavigator = null;
    this.cachedDetector = null;
  }
}
