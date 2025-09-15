/**
 * Background System Service Interface
 */

import type { BackgroundSystem, BackgroundFactoryParams } from "$legacyLib/components/Backgrounds/types/types";

export interface BackgroundSystemFactory {
  createBackgroundSystem(params: BackgroundFactoryParams): BackgroundSystem;
}

export interface BackgroundService {
  getCurrentBackground(): BackgroundSystem | null;
  setBackgroundType(type: string): void;
  initialize(): void;
  cleanup(): void;
}