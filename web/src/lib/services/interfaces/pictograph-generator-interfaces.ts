/**
 * Pictograph Generator Interface - Service contract for DI system
 */

import type { PictographData } from "$lib/domain/PictographData";

export interface GenerationParams {
  // Movement data
  letter?: string;
  startPosition?: import("$lib/domain/enums").GridPosition;
  endPosition?: import("$lib/domain/enums").GridPosition;
  timing?: import("$lib/domain/enums").Timing | string;
  direction?: import("$lib/domain/enums").Direction | string;

  // Hand motions
  blueMotionType?: import("$lib/domain/enums").MotionType | string;
  redMotionType?: import("$lib/domain/enums").MotionType | string;
  blueRotationDirection?:
    | import("$lib/domain/enums").RotationDirection
    | string;
  redRotationDirection?: import("$lib/domain/enums").RotationDirection | string;
  blueStartLocation?: import("$lib/domain/enums").Location | string;
  blueEndLocation?: import("$lib/domain/enums").Location | string;
  redStartLocation?: import("$lib/domain/enums").Location | string;
  redEndLocation?: import("$lib/domain/enums").Location | string;

  // Variations
  variation?: "cw" | "ccw" | "all";
  motionCombination?: [string, string]; // [blue, red]
}

export interface IPictographGeneratorService {
  // Primary letter generators (Group 1 - VALIDATION TARGETS)
  generateA(params?: GenerationParams): PictographData[];
  generateB(params?: GenerationParams): PictographData[];
  generateC(params?: GenerationParams): PictographData[];
  generateD(params?: GenerationParams): PictographData[];
  generateE(params?: GenerationParams): PictographData[];
  generateF(params?: GenerationParams): PictographData[];

  // Generic finder
  findPictographs(params: GenerationParams): PictographData[];

  // Validation helpers
  getMovementCounts(): Record<string, number>;
  getAvailableLetters(): string[];
}

// Service interface for DI container
import { createServiceInterface } from "../di/types";
import { PictographGeneratorService } from "../implementations/generation/PictographGeneratorService";

export const IPictographGeneratorServiceInterface =
  createServiceInterface<IPictographGeneratorService>(
    "IPictographGeneratorService",
    PictographGeneratorService
  );
