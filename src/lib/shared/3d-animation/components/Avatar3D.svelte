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
  import { T, useFrame } from "@threlte/core";
  import { container, loadFeatureModule } from "$lib/shared/inversify/container";
  import { ANIMATION_3D_TYPES } from "../inversify/animation-3d.types";
  import type { IAvatarSkeletonService } from "../services/contracts/IAvatarSkeletonService";
  import type { IIKSolverService } from "../services/contracts/IIKSolverService";
  import type { IAvatarAnimationService } from "../services/contracts/IAvatarAnimationService";
  import type { IAvatarCustomizationService, BodyType } from "../services/contracts/IAvatarCustomizationService";
  import type { PropState3D } from "../domain/models/PropState3D";
  import IKFigure3D from "./IKFigure3D.svelte";

  interface Props {
    bluePropState: PropState3D | null;
    redPropState: PropState3D | null;
    visible?: boolean;
    bodyType?: BodyType;
    skinTone?: string;
    modelUrl?: string; // Optional GLTF model URL
  }

  let {
    bluePropState,
    redPropState,
    visible = true,
    bodyType = "masculine",
    skinTone = "#d4a574",
    modelUrl = null, // No model by default - use procedural fallback
  }: Props = $props();

  // Services (resolved once feature module is loaded)
  let skeletonService: IAvatarSkeletonService | null = $state(null);
  let ikSolver: IIKSolverService | null = $state(null);
  let animationService: IAvatarAnimationService | null = $state(null);
  let customizationService: IAvatarCustomizationService | null = $state(null);

  let servicesReady = $state(false);
  let modelLoaded = $state(false);
  let useProceduralFallback = $state(true);

  // Initialize services
  onMount(async () => {
    try {
      await loadFeatureModule("3d-viewer");

      skeletonService = container.get<IAvatarSkeletonService>(
        ANIMATION_3D_TYPES.IAvatarSkeletonService
      );
      ikSolver = container.get<IIKSolverService>(
        ANIMATION_3D_TYPES.IIKSolverService
      );
      animationService = container.get<IAvatarAnimationService>(
        ANIMATION_3D_TYPES.IAvatarAnimationService
      );
      customizationService = container.get<IAvatarCustomizationService>(
        ANIMATION_3D_TYPES.IAvatarCustomizationService
      );

      servicesReady = true;

      // Try to load GLTF model if URL provided
      if (modelUrl && skeletonService) {
        try {
          await skeletonService.loadModel(modelUrl);
          modelLoaded = true;
          useProceduralFallback = false;
        } catch (err) {
          console.warn("Failed to load avatar model, using procedural fallback:", err);
          useProceduralFallback = true;
        }
      }
    } catch (err) {
      console.error("Failed to initialize avatar services:", err);
    }
  });

  // Update animation each frame
  useFrame((_, delta) => {
    if (!servicesReady || !animationService || useProceduralFallback) return;

    // Update hand targets from prop states
    animationService.setHandTargetsFromProps(bluePropState, redPropState);

    // Update animation (applies IK)
    animationService.update(delta);
  });

  // Sync customization changes
  $effect(() => {
    if (customizationService) {
      customizationService.setBodyType(bodyType);
      customizationService.setSkinTone(skinTone);
      customizationService.setVisible(visible);
    }
  });

  onDestroy(() => {
    if (skeletonService) {
      skeletonService.dispose();
    }
  });
</script>

{#if visible}
  {#if useProceduralFallback}
    <!-- Procedural fallback (current POC implementation) -->
    <IKFigure3D
      {bluePropState}
      {redPropState}
      {bodyType}
      {skinTone}
    />
  {:else if modelLoaded && skeletonService}
    <!-- GLTF model (production mode) -->
    {@const root = skeletonService.getRoot()}
    {#if root}
      <T is={root} />
    {/if}
  {/if}
{/if}
