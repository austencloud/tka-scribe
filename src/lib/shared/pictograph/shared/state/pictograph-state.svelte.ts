/**
 * Pictograph State Management - Svelte 5 runes
 *
 * Reactive state management for pictograph rendering and arrow positioning.
 * Wraps pictograph services with runes for UI reactivity.
 * Follows TKA architecture: services handle business logic, runes handle reactivity.
 */

import type { IComponentManagementService } from "../../../application/services/contracts/IComponentManagementService";
import type { IDataTransformationService } from "../../../application/services/contracts/IDataTransformationService";
import type { MotionColor } from "../domain/enums/pictograph-enums";
import type { MotionData } from "../domain/models/MotionData";
import type { PictographData } from "../domain/models/PictographData";
import type { PropType } from "../../prop/domain/enums/PropType";
import { resolve, TYPES, loadSharedModules } from "../../../inversify/di";
import { untrack } from "svelte";
import { getSettings } from "../../../application/state/app-state.svelte";
import type { ArrowAssets } from "../../arrow/orchestration/domain/arrow-models";
import type { IArrowLifecycleManager } from "../../arrow/orchestration/services/contracts/IArrowLifecycleManager";
import type { PropAssets } from "../../prop/domain/models/PropAssets";
import type { PropPosition } from "../../prop/domain/models/PropPosition";
import type { IPropSvgLoader } from "../../prop/services/contracts/IPropSvgLoader";
import type { IPropPlacementService } from "../../prop/services/contracts/IPropPlacementService";

export interface PictographState {
  // Data state
  readonly effectivePictographData: PictographData | null;
  readonly hasValidData: boolean;
  readonly displayLetter: string | null;
  readonly motionsToRender: Array<{
    color: MotionColor;
    motionData: MotionData;
  }>;
  readonly requiredComponents: string[];

  // Arrow positioning state
  readonly arrowPositions: Record<
    string,
    { x: number; y: number; rotation: number }
  >;
  readonly arrowMirroring: Record<string, boolean>;
  readonly arrowAssets: Record<string, ArrowAssets>;
  readonly showArrows: boolean;

  // Prop positioning state
  readonly propPositions: Record<string, PropPosition>;
  readonly propAssets: Record<string, PropAssets>;
  readonly showProps: boolean;

  // Loading state
  readonly isLoading: boolean;
  readonly isLoaded: boolean;
  readonly errorMessage: string | null;
  readonly loadedComponents: Set<string>;
  readonly allComponentsLoaded: boolean;

  // Actions
  calculateArrowPositions(): Promise<void>;
  calculatePropPositions(): Promise<void>;
  handleComponentLoaded(componentName: string): void;
  handleComponentError(componentName: string, error: string): void;
  clearLoadingState(): void;
  updatePictographData(newData: PictographData | null): void;
}

/**
 * Creates reactive state for pictograph rendering and management
 */
export function createPictographState(
  initialPictographData: PictographData | null = null
): PictographState {
  // Services will be resolved asynchronously to avoid container initialization errors
  let dataTransformationService: IDataTransformationService | null = null;
  let componentManagementService: IComponentManagementService | null = null;
  let arrowLifecycleManager: IArrowLifecycleManager | null = null;
  let propSvgLoader: IPropSvgLoader | null = null;
  let propPlacementService: IPropPlacementService | null = null;
  let servicesInitialized = $state(false);

  // Initialize services asynchronously
  async function initializeServices() {
    // Skip if already initialized or currently initializing
    if (servicesInitialized || initializationPromise) {
      await initializationPromise;
      return;
    }

    initializationPromise = (async () => {
      try {
        // CRITICAL: Ensure Tier 2 (pictograph module) is fully loaded before resolving services
        // This prevents race conditions where services are accessed before bindings exist
        await loadSharedModules();

        dataTransformationService = await resolve<IDataTransformationService>(
          TYPES.IDataTransformationService
        );
        componentManagementService = await resolve<IComponentManagementService>(
          TYPES.IComponentManagementService
        );
        arrowLifecycleManager = await resolve<IArrowLifecycleManager>(
          TYPES.IArrowLifecycleManager
        );
        propSvgLoader = await resolve<IPropSvgLoader>(TYPES.IPropSvgLoader);
        propPlacementService = await resolve<IPropPlacementService>(
          TYPES.IPropPlacementService
        );
        servicesInitialized = true;
      } catch (error) {
        console.error("Failed to initialize pictograph services:", error);
        errorMessage = `Service initialization failed: ${error}`;
        initializationPromise = null; // Reset so we can retry
        throw error;
      }
    })();

    await initializationPromise;
  }

  // Track initialization promise to prevent duplicate initialization
  let initializationPromise: Promise<void> | null = null;

  // Helper to ensure services are initialized before use
  async function ensureServicesInitialized() {
    if (!servicesInitialized) {
      await initializeServices();
    }
  }

  // Input data state
  let pictographData = $state<PictographData | null>(initialPictographData);

  // Component loading state
  let errorMessage = $state<string | null>(null);
  let loadedComponents = $state(new Set<string>());

  // Arrow positioning state
  let arrowPositions = $state<
    Record<string, { x: number; y: number; rotation: number }>
  >({});
  let arrowMirroring = $state<Record<string, boolean>>({});
  let arrowAssets = $state<Record<string, ArrowAssets>>({});
  let showArrows = $state(false);

  // Prop positioning state
  let propPositions = $state<Record<string, PropPosition>>({});
  let propAssets = $state<Record<string, PropAssets>>({});
  let showProps = $state(false);

  // Per-color prop types from settings - reactive to settings changes
  // These are applied when RENDERING pictographs, not when storing data
  let settingsUpdateCounter = $state(0);
  let lastBluePropType = $state<PropType | undefined>(undefined);
  let lastRedPropType = $state<PropType | undefined>(undefined);

  // Watch settings for prop type changes - only increment when they actually change
  $effect(() => {
    const settings = getSettings();
    const currentBlue = settings.bluePropType;
    const currentRed = settings.redPropType;

    // Read previous values without creating dependencies
    const prevBlue = untrack(() => lastBluePropType);
    const prevRed = untrack(() => lastRedPropType);

    // Only increment if settings actually changed (not on first run)
    if (prevBlue !== undefined || prevRed !== undefined) {
      if (currentBlue !== prevBlue || currentRed !== prevRed) {
        untrack(() => {
          settingsUpdateCounter++;
        });
      }
    }

    // Update last known values without creating dependencies
    untrack(() => {
      lastBluePropType = currentBlue;
      lastRedPropType = currentRed;
    });
  });

  // Derived data transformation state - only when services are ready
  const dataState = $derived.by(() => {
    if (!servicesInitialized || !dataTransformationService) {
      return {
        hasValidData: false,
        effectivePictographData: null,
        transformedData: null,
      };
    }
    return dataTransformationService.transformPictographData(pictographData);
  });

  // Derived component requirements - only when services are ready
  const requiredComponents = $derived.by(() => {
    if (!servicesInitialized || !componentManagementService) {
      return [];
    }
    return componentManagementService.getRequiredComponents(pictographData);
  });

  // Derived loading states
  const allComponentsLoaded = $derived.by(() => {
    return requiredComponents.every((component: string) =>
      loadedComponents.has(component)
    );
  });

  const isLoading = $derived.by(() => {
    return dataState.hasValidData && !allComponentsLoaded;
  });

  const isLoaded = $derived.by(() => {
    return dataState.hasValidData && allComponentsLoaded;
  });

  // Effect to recalculate positions when data OR settings change
  $effect(() => {
    // Watch for settings changes that affect prop rendering
    settingsUpdateCounter;

    const currentData = dataState.effectivePictographData;
    if (currentData) {
      errorMessage = null;

      // Explicitly track motion data properties that affect positioning
      // This ensures recalculation when turns/orientations change (e.g., via edit panel)
      const redMotion = currentData.motions?.red;
      const blueMotion = currentData.motions?.blue;

      // Track key properties that affect beta offset calculations:
      // - endOrientation (radial vs non-radial determines if offset is applied)
      // - endLocation (both props must end at same location for beta offset)
      // - turns (changes orientation, which affects offset logic)
      if (redMotion) {
        void redMotion.endOrientation;
        void redMotion.endLocation;
        void redMotion.turns;
      }
      if (blueMotion) {
        void blueMotion.endOrientation;
        void blueMotion.endLocation;
        void blueMotion.turns;
      }

      // Don't clear loadedComponents - keep elements visible during transitions
      // Recalculate arrow and prop positions when data OR settings change
      void calculateArrowPositions();
      void calculatePropPositions();
    }
  });

  // Actions
  async function calculateArrowPositions(): Promise<void> {
    // Ensure services are initialized before attempting calculations
    await ensureServicesInitialized();

    const currentData = dataState.effectivePictographData;

    if (
      !currentData?.motions ||
      !servicesInitialized ||
      !arrowLifecycleManager
    ) {
      // Only clear if we don't have valid data - don't clear during transitions
      arrowPositions = {};
      arrowMirroring = {};
      arrowAssets = {};
      showArrows = true;
      return;
    }

    try {
      // Use the arrow lifecycle manager to coordinate complete arrow loading
      const arrowLifecycleResult =
        await arrowLifecycleManager.coordinateArrowLifecycle(currentData);

      // Only update state after async loading completes - keeps old data visible during transitions
      arrowPositions = arrowLifecycleResult.positions;
      arrowMirroring = arrowLifecycleResult.mirroring;
      arrowAssets = arrowLifecycleResult.assets;
      showArrows =
        arrowLifecycleResult.allReady &&
        Object.keys(arrowLifecycleResult.positions).length > 0;

      // Log any errors
      if (Object.keys(arrowLifecycleResult.errors).length > 0) {
        console.warn(
          "⚠️ Arrow lifecycle had errors:",
          arrowLifecycleResult.errors
        );
      }
    } catch (error) {
      console.error("❌ Arrow lifecycle coordination failed:", error);
      // Only clear on error - keeps old data visible if loading fails
      arrowPositions = {};
      arrowMirroring = {};
      arrowAssets = {};
      showArrows = false;
    }
  }

  async function calculatePropPositions(): Promise<void> {
    // Ensure services are initialized before attempting calculations
    await ensureServicesInitialized();

    const currentData = dataState.effectivePictographData;

    if (
      !currentData?.motions ||
      !servicesInitialized ||
      !propSvgLoader ||
      !propPlacementService
    ) {
      // Only clear if we don't have valid data - don't clear during transitions
      propPositions = {};
      propAssets = {};
      showProps = true;
      return;
    }

    try {
      const positions: Record<string, PropPosition> = {};
      const assets: Record<string, PropAssets> = {};
      const errors: Record<string, string> = {};

      // UPDATED: Apply prop type overrides from settings when rendering
      // Get motions with settings overrides applied
      const settings = getSettings();
      const motionsWithOverrides = Object.entries(currentData.motions)
        .filter(
          (entry): entry is [string, MotionData] => entry[1] !== undefined
        )
        .map(([color, motionData]) => {
          // Apply settings override based on color
          const settingsPropType =
            color === "blue" ? settings.bluePropType : settings.redPropType;

          if (settingsPropType) {
            return [
              color,
              {
                ...motionData,
                propType: settingsPropType,
              } as MotionData,
            ] as [string, MotionData];
          }

          return [color, motionData] as [string, MotionData];
        });

      // Process all motions in parallel for better performance
      const motionPromises = motionsWithOverrides.map(
        async ([color, motionData]: [string, MotionData]) => {
          try {
            if (!motionData.propPlacementData) {
              throw new Error("No prop placement data available");
            }

            // Load assets and calculate position in parallel
            // motionData now has settings overrides applied above
            const [renderData, placementData] = await Promise.all([
              propSvgLoader!.loadPropSvg(
                motionData.propPlacementData,
                motionData
              ),
              propPlacementService!.calculatePlacement(currentData, motionData),
            ]);

            if (!renderData.svgData) {
              throw new Error("Failed to load prop SVG data");
            }

            // Transform to expected format
            const propAssets = {
              imageSrc: renderData.svgData.svgContent,
              viewBox: `${renderData.svgData.viewBox.width} ${renderData.svgData.viewBox.height}`,
              center: renderData.svgData.center,
            };

            const position = {
              x: placementData.positionX,
              y: placementData.positionY,
              rotation: placementData.rotationAngle,
            };

            positions[color] = position;
            assets[color] = propAssets;
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error";
            errors[color] = errorMessage;
          }
        }
      );

      await Promise.all(motionPromises);

      // Only update state after async loading completes - keeps old data visible during transitions
      propPositions = positions;
      propAssets = assets;
      showProps =
        Object.keys(errors).length === 0 && Object.keys(positions).length > 0;

      // Log any errors
      if (Object.keys(errors).length > 0) {
        console.warn("⚠️ Prop lifecycle had errors:", errors);
      }
    } catch (error) {
      console.error("❌ Prop lifecycle coordination failed:", error);
      // Only clear on error - keeps old data visible if loading fails
      propPositions = {};
      propAssets = {};
      showProps = false;
    }
  }

  function handleComponentLoaded(componentName: string): void {
    loadedComponents.add(componentName);
    loadedComponents = new Set(loadedComponents); // Trigger reactivity
  }

  function handleComponentError(componentName: string, error: string): void {
    console.error(`❌ Component ${componentName} failed to load:`, error);
    errorMessage = `Failed to load ${componentName}: ${error}`;
  }

  function clearLoadingState(): void {
    errorMessage = null;
    loadedComponents.clear();
    loadedComponents = new Set(); // Trigger reactivity
  }

  // Update pictograph data (for external updates)
  function updatePictographData(newData: PictographData | null): void {
    pictographData = newData;
  }

  return {
    // Data state (derived)
    get effectivePictographData() {
      return dataState.effectivePictographData;
    },
    get hasValidData() {
      return dataState.hasValidData;
    },
    get displayLetter() {
      const data = dataState;
      return "displayLetter" in data ? data.displayLetter : null;
    },
    get motionsToRender() {
      // Trigger reactivity when settings change
      settingsUpdateCounter;

      const data = dataState;
      const baseMotions = "motionsToRender" in data ? data.motionsToRender : [];

      // Apply prop type overrides from settings when rendering
      const settings = getSettings();
      return baseMotions.map(({ color, motionData }) => {
        // Determine which prop type to use based on color
        const settingsPropType =
          color === "blue" ? settings.bluePropType : settings.redPropType;

        // Apply override if settings has a prop type defined
        if (settingsPropType) {
          return {
            color,
            motionData: {
              ...motionData,
              propType: settingsPropType,
            },
          };
        }

        // No override - use motion's own prop type
        return { color, motionData };
      });
    },
    get requiredComponents() {
      return requiredComponents;
    },

    // Arrow positioning state
    get arrowPositions() {
      return arrowPositions;
    },
    get arrowMirroring() {
      return arrowMirroring;
    },
    get arrowAssets() {
      return arrowAssets;
    },
    get showArrows() {
      return showArrows;
    },

    // Prop positioning state
    get propPositions() {
      return propPositions;
    },
    get propAssets() {
      return propAssets;
    },
    get showProps() {
      return showProps;
    },

    // Loading state
    get isLoading() {
      return isLoading;
    },
    get isLoaded() {
      return isLoaded;
    },
    get errorMessage() {
      return errorMessage;
    },
    get loadedComponents() {
      return loadedComponents;
    },
    get allComponentsLoaded() {
      return allComponentsLoaded;
    },

    // Actions
    calculateArrowPositions,
    calculatePropPositions,
    handleComponentLoaded,
    handleComponentError,
    clearLoadingState,
    updatePictographData,
  };
}
