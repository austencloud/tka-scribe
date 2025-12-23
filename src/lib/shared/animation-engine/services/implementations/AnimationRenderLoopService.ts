/**
 * Animation Render Loop Service Implementation
 *
 * Manages the requestAnimationFrame render loop for AnimatorCanvas.
 * Handles RAF scheduling, trail point gathering, and scene rendering.
 */

import type { IPixiAnimationRenderer } from "$lib/features/compose/services/contracts/IPixiAnimationRenderer";
import type { ITrailCaptureService } from "$lib/features/compose/services/contracts/ITrailCaptureService";
import type { TrailPoint, TrailSettings } from "../../domain/types/TrailTypes";
import { TrailMode } from "../../domain/types/TrailTypes";
import type { AnimationPathCache } from "$lib/features/compose/services/implementations/AnimationPathCache";
import type {
  IAnimationRenderLoopService,
  RenderLoopConfig,
  RenderFrameParams,
} from "../contracts/IAnimationRenderLoopService";

export class AnimationRenderLoopService implements IAnimationRenderLoopService {
  private pixiRenderer: IPixiAnimationRenderer | null = null;
  private trailCaptureService: ITrailCaptureService | null = null;
  private pathCache: AnimationPathCache | null = null;
  private canvasSize: number = 950;
  private rafId: number | null = null;
  private needsRender: boolean = false;
  private getFrameParamsCallback: (() => RenderFrameParams) | null = null;

  initialize(config: RenderLoopConfig): void {
    this.pixiRenderer = config.pixiRenderer;
    this.trailCaptureService = config.trailCaptureService;
    this.pathCache = config.pathCache;
    this.canvasSize = config.canvasSize;
  }

  updateConfig(config: Partial<RenderLoopConfig>): void {
    if (config.pixiRenderer !== undefined)
      this.pixiRenderer = config.pixiRenderer;
    if (config.trailCaptureService !== undefined)
      this.trailCaptureService = config.trailCaptureService;
    if (config.pathCache !== undefined) this.pathCache = config.pathCache;
    if (config.canvasSize !== undefined) this.canvasSize = config.canvasSize;
  }

  start(getFrameParams: () => RenderFrameParams): void {
    this.getFrameParamsCallback = getFrameParams;
    if (this.rafId === null && this.pixiRenderer) {
      this.rafId = requestAnimationFrame(this.renderLoop);
    }
  }

  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.getFrameParamsCallback = null;
  }

  isRunning(): boolean {
    return this.rafId !== null;
  }

  renderFrame(params: RenderFrameParams): void {
    if (!this.pixiRenderer) return;
    this.render(params, performance.now());
  }

  triggerRender(getFrameParams: () => RenderFrameParams): void {
    this.needsRender = true;
    this.getFrameParamsCallback = getFrameParams;
    if (this.rafId === null && this.pixiRenderer) {
      this.rafId = requestAnimationFrame(this.renderLoop);
    }
  }

  dispose(): void {
    this.stop();
    this.pixiRenderer = null;
    this.trailCaptureService = null;
    this.pathCache = null;
  }

  private renderLoop = (currentTime: number): void => {
    if (!this.pixiRenderer || !this.getFrameParamsCallback) {
      this.rafId = null;
      return;
    }

    const params = this.getFrameParamsCallback();
    const { trailSettings } = params;

    // Real-time trail capture
    if (
      trailSettings.enabled &&
      trailSettings.mode !== TrailMode.OFF &&
      this.trailCaptureService
    ) {
      const currentBeat =
        params.beatData && "beatNumber" in params.beatData
          ? params.beatData.beatNumber
          : undefined;
      this.trailCaptureService.captureFrame(
        {
          blueProp: params.props.blueProp,
          redProp: params.props.redProp,
          secondaryBlueProp: params.props.secondaryBlueProp,
          secondaryRedProp: params.props.secondaryRedProp,
        },
        currentBeat,
        currentTime
      );
    }

    if (
      this.needsRender ||
      (trailSettings.enabled && trailSettings.mode !== TrailMode.OFF)
    ) {
      this.render(params, currentTime);
      this.needsRender = false;
      this.rafId = requestAnimationFrame(this.renderLoop);
    } else {
      // Stop loop when no render is needed
      this.rafId = null;
    }
  };

  private render(params: RenderFrameParams, currentTime: number): void {
    if (!this.pixiRenderer) return;

    const {
      beatData,
      currentBeat,
      trailSettings,
      gridVisible,
      gridMode,
      letter,
      props,
      visibility,
    } = params;

    // Get turn tuple for glyph rendering
    const blueMotion = beatData?.motions?.blue;
    const redMotion = beatData?.motions?.red;
    const turnsTuple =
      blueMotion && redMotion ? `${blueMotion.turns}${redMotion.turns}` : null;

    // Gather trail points
    const trailPoints = this.gatherTrailPoints(currentBeat);

    // Apply visibility settings
    const effectiveGridVisible = gridVisible && visibility.gridVisible;
    const effectivePropsVisible = visibility.propsVisible;
    const effectiveTrailsVisible =
      visibility.trailsVisible && trailSettings.enabled;
    // Derive motion visibility from both internal state AND whether prop is actually present
    // (props may be filtered to null by parent component based on its own visibility state)
    const effectiveBlueMotionVisible =
      visibility.blueMotionVisible && props.blueProp !== null;
    const effectiveRedMotionVisible =
      visibility.redMotionVisible && props.redProp !== null;

    // Debug: log if grid should be visible but isn't showing
    if (!effectiveGridVisible && (gridVisible || visibility.gridVisible)) {
      console.log(
        "[RenderLoop] Grid hidden - prop:",
        gridVisible,
        "manager:",
        visibility.gridVisible
      );
    }

    // Render scene using PixiJS
    this.pixiRenderer.renderScene({
      blueProp:
        effectivePropsVisible && effectiveBlueMotionVisible
          ? props.blueProp
          : null,
      redProp:
        effectivePropsVisible && effectiveRedMotionVisible
          ? props.redProp
          : null,
      secondaryBlueProp:
        effectivePropsVisible && effectiveBlueMotionVisible
          ? props.secondaryBlueProp
          : null,
      secondaryRedProp:
        effectivePropsVisible && effectiveRedMotionVisible
          ? props.secondaryRedProp
          : null,
      gridVisible: effectiveGridVisible,
      gridMode: gridMode?.toString() ?? null,
      letter: letter ?? null,
      turnsTuple,
      bluePropDimensions: props.bluePropDimensions,
      redPropDimensions: props.redPropDimensions,
      blueTrailPoints:
        effectiveTrailsVisible && effectiveBlueMotionVisible
          ? trailPoints.blue
          : [],
      redTrailPoints:
        effectiveTrailsVisible && effectiveRedMotionVisible
          ? trailPoints.red
          : [],
      secondaryBlueTrailPoints:
        effectiveTrailsVisible && effectiveBlueMotionVisible
          ? trailPoints.secondaryBlue
          : [],
      secondaryRedTrailPoints:
        effectiveTrailsVisible && effectiveRedMotionVisible
          ? trailPoints.secondaryRed
          : [],
      trailSettings,
      currentTime,
      visibility: {
        gridVisible: effectiveGridVisible,
        propsVisible: effectivePropsVisible,
        trailsVisible: effectiveTrailsVisible,
        blueMotionVisible: effectiveBlueMotionVisible,
        redMotionVisible: effectiveRedMotionVisible,
      },
    });
  }

  private gatherTrailPoints(currentBeat: number): {
    blue: TrailPoint[];
    red: TrailPoint[];
    secondaryBlue: TrailPoint[];
    secondaryRed: TrailPoint[];
  } {
    let blueTrailPoints: TrailPoint[] = [];
    let redTrailPoints: TrailPoint[] = [];
    let secondaryBlueTrailPoints: TrailPoint[] = [];
    let secondaryRedTrailPoints: TrailPoint[] = [];

    // Use cache for perfect gap-free trails (if available and valid)
    if (this.pathCache && this.pathCache.isValid() && currentBeat !== null) {
      const scaleFactor = this.canvasSize / 950;

      const transformTrailPoints = (points: TrailPoint[]): TrailPoint[] => {
        return points.map((p) => ({
          ...p,
          x: p.x * scaleFactor,
          y: p.y * scaleFactor,
        }));
      };

      // Blue prop trails (both left and right endpoints)
      const blueLeft = transformTrailPoints(
        this.pathCache.getTrailPoints(0, 0, 0, currentBeat)
      );
      const blueRight = transformTrailPoints(
        this.pathCache.getTrailPoints(0, 1, 0, currentBeat)
      );
      blueTrailPoints = [...blueLeft, ...blueRight];

      // Red prop trails (both left and right endpoints)
      const redLeft = transformTrailPoints(
        this.pathCache.getTrailPoints(1, 0, 0, currentBeat)
      );
      const redRight = transformTrailPoints(
        this.pathCache.getTrailPoints(1, 1, 0, currentBeat)
      );
      redTrailPoints = [...redLeft, ...redRight];
    } else if (this.trailCaptureService) {
      // Fallback to real-time capture
      const allTrails = this.trailCaptureService.getAllTrailPoints();
      blueTrailPoints = allTrails.blue;
      redTrailPoints = allTrails.red;
      secondaryBlueTrailPoints = allTrails.secondaryBlue;
      secondaryRedTrailPoints = allTrails.secondaryRed;
    }

    return {
      blue: blueTrailPoints,
      red: redTrailPoints,
      secondaryBlue: secondaryBlueTrailPoints,
      secondaryRed: secondaryRedTrailPoints,
    };
  }
}
