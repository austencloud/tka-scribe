// ✅ DECOMPOSED: Monolithic engine replaced with focused services
export { SequenceAnimationOrchestrator } from "../services/SequenceAnimationOrchestrator.js";
export { AnimationStateService } from "../services/AnimationStateService.js";
export { BeatCalculationService } from "../services/BeatCalculationService.js";
export { PropInterpolationService } from "../services/PropInterpolationService.js";

// Legacy export for backward compatibility (will be removed)
export { SequenceAnimationEngine } from "./sequence-animation-engine.js";
