<script lang="ts">
  /**
   * Avatar3D Component
   *
   * Production-quality 3D avatar using GLTF rigged models.
   * Uses proper service architecture with IK solving.
   *
   * This component can work in two modes:
   * 1. GLTF mode: Loads a rigged humanoid model (production)
   * 2. Procedural mode: Uses IKFigure3D as fallback (current POC)
   *
   * The service architecture is designed for GLTF mode, but we'll
   * use the procedural fallback until a proper model is created.
   */

  import { onMount, onDestroy } from "svelte";
  import { T, useTask } from "@threlte/core";
  import { container, loadFeatureModule } from "$lib/shared/inversify/container";
  import { ANIMATION_3D_TYPES } from "../inversify/animation-3d.types";
  import type { IAvatarSkeletonBuilder } from "../services/contracts/IAvatarSkeletonBuilder";
  import type { IIKSolver } from "../services/contracts/IIKSolver";
  import type { IAvatarAnimator } from "../services/contracts/IAvatarAnimator";
  import type { IAvatarCustomizer, BodyType } from "../services/contracts/IAvatarCustomizer";
  import type { PropState3D } from "../domain/models/PropState3D";
  import { getHeightForBodyType, deriveSceneProportions, AUSTEN_MEASUREMENTS, cmToUnits } from "../config/avatar-proportions";
  import IKFigure3D from "./IKFigure3D.svelte";

  // Get scene proportions for positioning
  const sceneProps = deriveSceneProportions(AUSTEN_MEASUREMENTS, "masculine");

  // Figure Z position
  // Camera is at positive Z looking toward origin.
  // Grid is at Z=0. Props are rendered at Z=0.
  // Mixamo models face +Z by default.
  // Avatar at Z=-80, facing +Z = facing toward the props at Z=0.
  const FIGURE_Z = -80; // Avatar stands behind grid, facing toward props

  // The GLTF model has feet at Y=0, but IKFigure3D has shoulders at Y=0.
  // We need to offset the model so shoulders align with the expected Y=0.
  // Shoulder height from feet ≈ torsoLength + headHeight/2 + neckLength (rough estimate)
  // For the scaled model, we calculate this based on the model's proportions.
  //
  // In IKFigure3D: footY = -(torsoLength + inseam) below shoulder level
  // So the shoulder-to-foot distance = torsoLength + inseam
  const SHOULDER_TO_FOOT = cmToUnits(AUSTEN_MEASUREMENTS.torsoLength + AUSTEN_MEASUREMENTS.inseam);

  // Model Y offset: move the model down so its shoulders are at Y=0
  // Since the model's feet are at local Y=0 and we want shoulders at world Y=0,
  // we need to move the model down by the shoulder height from feet.
  // But GLTF models are scaled, so we calculate based on the body type's scaled height.
  function getModelYOffset(targetBodyType: BodyType): number {
    const scaledHeight = getHeightForBodyType(targetBodyType);
    // Shoulder is approximately at 77% of total height (human proportions)
    const shoulderHeightRatio = 0.77;
    return -(scaledHeight * shoulderHeightRatio);
  }

  // Model URLs for different body types
  const MODEL_URLS: Record<BodyType, string> = {
    masculine: "/models/x-bot.glb",
    feminine: "/models/y-bot.glb",
    androgynous: "/models/x-bot.glb", // Default to x-bot for androgynous
  };

  interface Props {
    bluePropState: PropState3D | null;
    redPropState: PropState3D | null;
    visible?: boolean;
    bodyType?: BodyType;
    skinTone?: string;
    useGLTF?: boolean; // Whether to use GLTF model or procedural fallback
  }

  let {
    bluePropState,
    redPropState,
    visible = true,
    bodyType = "masculine",
    skinTone = "#d4a574",
    useGLTF = true, // Default to using GLTF model
  }: Props = $props();

  // Services (resolved once feature module is loaded)
  let skeletonService: IAvatarSkeletonBuilder | null = $state(null);
  let ikSolver: IIKSolver | null = $state(null);
  let animationService: IAvatarAnimator | null = $state(null);
  let customizationService: IAvatarCustomizer | null = $state(null);

  let servicesReady = $state(false);
  let modelLoaded = $state(false);
  let useProceduralFallback = $state(true);
  let currentLoadedBodyType = $state<BodyType | null>(null);
  let isLoading = $state(false);

  // Load a GLTF model for a specific body type
  async function loadModelForBodyType(targetBodyType: BodyType) {
    if (!skeletonService || isLoading) return;

    const url = MODEL_URLS[targetBodyType];
    const height = getHeightForBodyType(targetBodyType);

    // Skip if already loaded for this body type
    if (currentLoadedBodyType === targetBodyType) {
      console.log("[Avatar3D] Model already loaded for", targetBodyType);
      return;
    }

    isLoading = true;
    console.log("[Avatar3D] Loading model for", targetBodyType, ":", url, "height:", height);

    try {
      // Dispose old model if any
      if (currentLoadedBodyType !== null) {
        console.log("[Avatar3D] Disposing old model...");
        skeletonService.dispose();
      }

      await skeletonService.loadModel(url);
      console.log("[Avatar3D] Model loaded successfully!");

      // Scale model to match our scene units
      // Height is in scene units (1 unit = 0.5 cm)
      // Masculine: 188cm = 376 units, Feminine: 178cm = 356 units
      skeletonService.setHeight(height);
      console.log("[Avatar3D] Model scaled to", height, "units");

      currentLoadedBodyType = targetBodyType;
      modelLoaded = true;
      useProceduralFallback = false;

      // Debug: Log arm chain status
      const leftChain = skeletonService.getLeftArmChain();
      const rightChain = skeletonService.getRightArmChain();

      if (leftChain) {
        console.log("[Avatar3D] Left arm chain ready:");
        console.log(`  Bones: ${leftChain.root.name} → ${leftChain.middle.name} → ${leftChain.effector.name}`);
        console.log(`  Lengths: upper=${leftChain.upperLength.toFixed(1)}, lower=${leftChain.lowerLength.toFixed(1)}, total=${leftChain.totalLength.toFixed(1)}`);
        console.log(`  Root rest dir: (${leftChain.rootRestDir.x.toFixed(2)}, ${leftChain.rootRestDir.y.toFixed(2)}, ${leftChain.rootRestDir.z.toFixed(2)})`);
        console.log(`  Middle rest dir: (${leftChain.middleRestDir.x.toFixed(2)}, ${leftChain.middleRestDir.y.toFixed(2)}, ${leftChain.middleRestDir.z.toFixed(2)})`);
      } else {
        console.warn("[Avatar3D] Left arm chain NOT FOUND");
      }

      if (rightChain) {
        console.log("[Avatar3D] Right arm chain ready:");
        console.log(`  Bones: ${rightChain.root.name} → ${rightChain.middle.name} → ${rightChain.effector.name}`);
        console.log(`  Lengths: upper=${rightChain.upperLength.toFixed(1)}, lower=${rightChain.lowerLength.toFixed(1)}, total=${rightChain.totalLength.toFixed(1)}`);
        console.log(`  Root rest dir: (${rightChain.rootRestDir.x.toFixed(2)}, ${rightChain.rootRestDir.y.toFixed(2)}, ${rightChain.rootRestDir.z.toFixed(2)})`);
        console.log(`  Middle rest dir: (${rightChain.middleRestDir.x.toFixed(2)}, ${rightChain.middleRestDir.y.toFixed(2)}, ${rightChain.middleRestDir.z.toFixed(2)})`);
      } else {
        console.warn("[Avatar3D] Right arm chain NOT FOUND");
      }

      // Log positioning info
      const yOffset = getModelYOffset(targetBodyType);
      console.log(`[Avatar3D] Model positioning:`);
      console.log(`  Y offset: ${yOffset.toFixed(1)} (shoulders at Y≈0)`);
      console.log(`  Z position: ${FIGURE_Z} (in front of grid)`);
      console.log(`  Avatar should face -Z toward props at Z=0`);
    } catch (err) {
      console.warn("[Avatar3D] Failed to load avatar model, using procedural fallback:", err);
      useProceduralFallback = true;
    } finally {
      isLoading = false;
    }
  }

  // Initialize services on mount
  onMount(async () => {
    // If not using GLTF, just use procedural fallback
    if (!useGLTF) {
      console.log("[Avatar3D] useGLTF=false, using procedural fallback");
      useProceduralFallback = true;
      return;
    }

    console.log("[Avatar3D] Initializing GLTF avatar...");

    try {
      await loadFeatureModule("3d-viewer");
      console.log("[Avatar3D] Feature module loaded");

      skeletonService = container.get<IAvatarSkeletonBuilder>(
        ANIMATION_3D_TYPES.IAvatarSkeletonBuilder
      );
      ikSolver = container.get<IIKSolver>(
        ANIMATION_3D_TYPES.IIKSolver
      );
      animationService = container.get<IAvatarAnimator>(
        ANIMATION_3D_TYPES.IAvatarAnimator
      );
      customizationService = container.get<IAvatarCustomizer>(
        ANIMATION_3D_TYPES.IAvatarCustomizer
      );

      servicesReady = true;
      console.log("[Avatar3D] Services ready");

      // Load initial model for current body type
      await loadModelForBodyType(bodyType);
    } catch (err) {
      console.error("[Avatar3D] Failed to initialize avatar services:", err);
      useProceduralFallback = true;
    }
  });

  // React to bodyType changes by reloading model
  $effect(() => {
    // Only react after initial mount and services are ready
    if (servicesReady && useGLTF && bodyType !== currentLoadedBodyType && !isLoading) {
      console.log("[Avatar3D] Body type changed to:", bodyType);
      loadModelForBodyType(bodyType);
    }
  });

  // Debug frame counter to limit logging
  let debugFrameCount = 0;

  // Update animation each frame
  useTask((delta) => {
    if (!servicesReady || !animationService || useProceduralFallback) return;

    // Update hand targets from prop states
    animationService.setHandTargetsFromProps(bluePropState, redPropState);

    // Update animation (applies IK)
    animationService.update(delta);

    // Debug: Log periodically
    debugFrameCount++;
    if (debugFrameCount % 120 === 1) { // Every ~2 seconds at 60fps
      const pose = animationService.getCurrentPose();
      console.log("[Avatar3D] IK running, left target:", {
        x: pose.leftHand.targetPosition.x.toFixed(1),
        y: pose.leftHand.targetPosition.y.toFixed(1),
        z: pose.leftHand.targetPosition.z.toFixed(1),
      });
    }
  });

  // Sync customization changes (only when using GLTF mode, not procedural fallback)
  $effect(() => {
    if (customizationService && !useProceduralFallback) {
      customizationService.setBodyType(bodyType);
      customizationService.setSkinTone(skinTone);
      customizationService.setVisible(visible);
    }
  });

  onDestroy(() => {
    // Only dispose if we loaded a GLTF model
    if (skeletonService && !useProceduralFallback) {
      skeletonService.dispose();
    }
  });
</script>

{#if visible}
  {#if useProceduralFallback}
    <!-- Procedural fallback (current POC implementation) -->
    <!-- Map androgynous to masculine for IKFigure3D which only supports masculine/feminine -->
    {@const figureBodyType = bodyType === "androgynous" ? "masculine" : bodyType}
    <IKFigure3D
      {bluePropState}
      {redPropState}
      bodyType={figureBodyType}
      {skinTone}
    />
  {:else if modelLoaded && skeletonService}
    <!-- GLTF model (production mode) -->
    <!--
      Position the avatar:
      - X: 0 (centered)
      - Y: offset down so shoulders are at Y=0 (matching IKFigure3D coordinate system)
      - Z: -80 (behind grid, further from camera)

      Rotation:
      - Mixamo models face +Z by default
      - Avatar is at Z=-80, props are at Z=0
      - Avatar facing +Z = facing toward the props
    -->
    {@const root = skeletonService.getRoot()}
    {@const yOffset = getModelYOffset(bodyType)}
    {#if root}
      <T.Group position={[0, yOffset, FIGURE_Z]}>
        <T is={root} />
      </T.Group>
    {:else}
      <!-- Root is null, show fallback -->
      {@const figureBodyType = bodyType === "androgynous" ? "masculine" : bodyType}
      <IKFigure3D
        {bluePropState}
        {redPropState}
        bodyType={figureBodyType}
        {skinTone}
      />
    {/if}
  {/if}
{/if}
