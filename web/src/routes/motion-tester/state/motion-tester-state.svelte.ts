import {
  MotionParameterService,
  type MotionTestParams,
} from "../services/MotionParameterService";
import {
  AnimationControlService,
  type AnimationState,
  type PropVisibility,
  type PropStates,
} from "../services/AnimationControlService";
import { OrientationCalculationService } from "$lib/services/implementations/OrientationCalculationService";
import { EnumConversionService } from "../services/EnumConversionService";
import type { MotionData } from "$lib/domain/MotionData";

export interface MotionTesterState {
  // Reactive state getters
  get blueMotionParams(): MotionTestParams;
  get redMotionParams(): MotionTestParams;
  get animationState(): AnimationState;
  get propVisibility(): PropVisibility;
  get currentPropStates(): PropStates;
  get isEngineInitialized(): boolean;
  get gridType(): "diamond" | "box";

  // Blue prop methods
  setBlueStartLocation: (location: string) => void;
  setBlueEndLocation: (location: string) => void;
  updateBlueMotionParam: <K extends keyof MotionTestParams>(
    param: K,
    value: MotionTestParams[K]
  ) => void;

  // Red prop methods
  setRedStartLocation: (location: string) => void;
  setRedEndLocation: (location: string) => void;
  updateRedMotionParam: <K extends keyof MotionTestParams>(
    param: K,
    value: MotionTestParams[K]
  ) => void;

  // Animation control methods
  setProgress: (progress: number) => void;
  startAnimation: () => void;
  stopAnimation: () => void;
  resetAnimation: () => void;

  // Grid control methods
  setGridType: (gridType: "diamond" | "box") => void;
}

export function createMotionTesterState(): MotionTesterState {
  // Services
  const motionService = new MotionParameterService();
  const animationService = new AnimationControlService();
  const orientationService = new OrientationCalculationService();

  // Create enum conversion service for cleaner conversions
  const enumService = new EnumConversionService();

  // Reactive state
  let blueMotionParams = $state<MotionTestParams>(
    motionService.createDefaultParams()
  );
  let redMotionParams = $state<MotionTestParams>({
    ...motionService.createDefaultParams(),
    startLoc: "e",
    endLoc: "w",
    motionType: "dash",
  });

  // Debug initial state
  console.log("🔴 Initial red motion params:", redMotionParams);
  console.log("🔵 Initial blue motion params:", blueMotionParams);

  // Props are always visible - no user controls needed
  const propVisibility = $state<PropVisibility>({
    blue: true,
    red: true,
  });

  const animationState = $state<AnimationState>({
    isPlaying: false,
    progress: 0,
    currentBeat: 0,
  });

  let isEngineInitialized = $state(false);
  let gridType = $state<"diamond" | "box">("diamond");

  // Auto-calculate rotation direction for blue prop
  $effect(() => {
    const newRotDir = motionService.calculateRotationDirection(
      blueMotionParams.motionType,
      blueMotionParams.startLoc,
      blueMotionParams.endLoc
    );
    if (newRotDir !== blueMotionParams.propRotDir) {
      blueMotionParams.propRotDir = newRotDir;
    }
  });

  // Auto-calculate end orientation for blue prop
  $effect(() => {
    const motionData = motionService.convertToMotionData(blueMotionParams);
    const endOriEnum = orientationService.calculateEndOrientation(motionData);
    const newEndOri = enumService.orientationToString(endOriEnum);
    if (newEndOri !== blueMotionParams.endOri) {
      blueMotionParams.endOri = newEndOri;
    }
  });

  // Auto-calculate rotation direction for red prop
  $effect(() => {
    console.log(
      `🔴 Red rotation effect triggered: ${redMotionParams.startLoc}→${redMotionParams.endLoc} (${redMotionParams.motionType})`
    );
    const newRotDir = motionService.calculateRotationDirection(
      redMotionParams.motionType,
      redMotionParams.startLoc,
      redMotionParams.endLoc
    );
    console.log(
      `🔴 Red rotation calculated: ${newRotDir}, current: ${redMotionParams.propRotDir}`
    );
    if (newRotDir !== redMotionParams.propRotDir) {
      console.log(
        `🔴 Red rotation updating from ${redMotionParams.propRotDir} to ${newRotDir}`
      );
      redMotionParams.propRotDir = newRotDir;
    }
  });

  // Auto-calculate end orientation for red prop
  $effect(() => {
    const motionData = motionService.convertToMotionData(redMotionParams);
    const endOriEnum = orientationService.calculateEndOrientation(motionData);
    const newEndOri = enumService.orientationToString(endOriEnum);
    if (newEndOri !== redMotionParams.endOri) {
      redMotionParams.endOri = newEndOri;
    }
  });

  // Initialize engine when motion parameters change
  $effect(() => {
    const initEngine = async () => {
      const success = await animationService.initializeEngine(
        blueMotionParams,
        redMotionParams
      );
      isEngineInitialized = success;
    };
    initEngine();
  });

  // Update animation state
  $effect(() => {
    animationState.progress = animationService.getProgress();
    animationState.currentBeat = animationService.getCurrentBeat();
    animationState.isPlaying = animationService.isPlaying();
  });

  return {
    // Reactive state getters
    get blueMotionParams() {
      return blueMotionParams;
    },
    get redMotionParams() {
      return redMotionParams;
    },
    get animationState() {
      return animationState;
    },
    get propVisibility() {
      return propVisibility;
    },
    get currentPropStates() {
      return animationService.getCurrentPropStates();
    },
    get isEngineInitialized() {
      return isEngineInitialized;
    },
    get gridType() {
      return gridType;
    },

    // Blue prop methods
    setBlueStartLocation: (location: string) => {
      blueMotionParams.startLoc = location;
      const updatedParams =
        motionService.updateMotionTypeForLocations(blueMotionParams);
      blueMotionParams = updatedParams;
    },

    setBlueEndLocation: (location: string) => {
      blueMotionParams.endLoc = location;
      const updatedParams =
        motionService.updateMotionTypeForLocations(blueMotionParams);
      blueMotionParams = updatedParams;
    },

    updateBlueMotionParam: <K extends keyof MotionTestParams>(
      param: K,
      value: MotionTestParams[K]
    ) => {
      blueMotionParams[param] = value;
    },

    // Red prop methods
    setRedStartLocation: (location: string) => {
      redMotionParams.startLoc = location;
      const updatedParams =
        motionService.updateMotionTypeForLocations(redMotionParams);
      redMotionParams = updatedParams;
    },

    setRedEndLocation: (location: string) => {
      redMotionParams.endLoc = location;
      const updatedParams =
        motionService.updateMotionTypeForLocations(redMotionParams);
      redMotionParams = updatedParams;
    },

    updateRedMotionParam: <K extends keyof MotionTestParams>(
      param: K,
      value: MotionTestParams[K]
    ) => {
      redMotionParams[param] = value;
    },

    // Animation control methods
    setProgress: (progress: number) => {
      animationService.setProgress(progress);
    },

    startAnimation: () => {
      animationService.startAnimation();
    },

    stopAnimation: () => {
      animationService.stopAnimation();
    },

    resetAnimation: () => {
      animationService.resetAnimation();
    },

    // Grid control methods
    setGridType: (newGridType: "diamond" | "box") => {
      gridType = newGridType;
    },
  };
}
