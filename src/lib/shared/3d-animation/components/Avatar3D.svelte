<script lang="ts">
  /**
   * Avatar3D Component
   *
   * Production-quality 3D avatar using GLTF rigged models.
   * Uses proper service architecture with IK solving.
   *
   * This component can work in two modes:
   * 1. GLTF mode: Loads a rigged humanoid model (production)
   * 2. Procedural mode: Uses IKFigure3D as fallback
   */

  import { onMount, onDestroy, untrack } from "svelte";
  import { T, useTask } from "@threlte/core";
  import { container, loadFeatureModule } from "$lib/shared/inversify/container";
  import { ANIMATION_3D_TYPES } from "../inversify/animation-3d.types";
  import type { IAvatarSkeletonBuilder } from "../services/contracts/IAvatarSkeletonBuilder";
  import type { IIKSolver } from "../services/contracts/IIKSolver";
  import type { IAvatarAnimator } from "../services/contracts/IAvatarAnimator";
  import type { IAvatarCustomizer } from "../services/contracts/IAvatarCustomizer";
  import type { PropState3D } from "../domain/models/PropState3D";
  import { cmToUnits } from "../config/avatar-proportions";
  import { getAvatarModelPath, type AvatarId, DEFAULT_AVATAR_ID } from "../config/avatar-definitions";
  import { userProportionsState } from "../state/user-proportions-state.svelte";
  import IKFigure3D from "./IKFigure3D.svelte";

  // Figure positioning constants
  // Camera is at positive Z looking toward origin.
  // Grid is at Z=0. Props are rendered at Z=0.
  // Mixamo models face +Z by default.
  // Avatar at Z=-80, facing +Z = facing toward the props at Z=0.
  const FIGURE_Z = -80; // Avatar stands behind grid, facing toward props

  interface Props {
    bluePropState: PropState3D | null;
    redPropState: PropState3D | null;
    visible?: boolean;
    avatarId?: AvatarId;
    useGLTF?: boolean; // Whether to use GLTF model or procedural fallback
  }

  let {
    bluePropState,
    redPropState,
    visible = true,
    avatarId = DEFAULT_AVATAR_ID,
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
  let currentLoadedAvatarId = $state<string | null>(null);
  let isLoading = $state(false);

  // Cache the root object to avoid reactivity issues during swap
  let cachedRoot = $state<import('three').Object3D | null>(null);

  // Feet offset from model origin (negative value, updated after setHeight)
  let feetOffset = $state(0);

  // Derived values from user proportions
  // avatarHeight is the target height in scene units (cm * CM_TO_UNITS)
  const avatarHeight = $derived(cmToUnits(userProportionsState.heightCm));
  const groundY = $derived(userProportionsState.groundY);

  // Calculate group Y position to put feet at groundY
  // feetOffset is negative (feet are below model origin)
  // groupY = groundY - feetOffset puts feet at world Y = groundY
  const groupY = $derived(groundY - feetOffset);

  // Load a GLTF model for a specific avatar
  // Uses hot-swap pattern: keeps old avatar visible until new one is ready
  async function loadAvatar(targetAvatarId: string) {
    if (!skeletonService || isLoading) return;

    // Skip if already loaded
    if (currentLoadedAvatarId === targetAvatarId) return;

    const url = getAvatarModelPath(targetAvatarId);

    isLoading = true;

    try {
      // Load new model (skeleton service handles internal swap)
      await skeletonService.loadModel(url);

      // Scale model to match user's height
      // setHeight() calculates proper scale and stores feet offset
      skeletonService.setHeight(avatarHeight);

      // Get the feet offset for positioning (negative value)
      feetOffset = skeletonService.getFeetOffset();

      // Update cached root AFTER everything is ready
      // This ensures Threlte only sees the swap when the new model is complete
      cachedRoot = skeletonService.getRoot();

      currentLoadedAvatarId = targetAvatarId;
      modelLoaded = true;
      useProceduralFallback = false;

      // Verify arm chains are ready
      const leftChain = skeletonService.getLeftArmChain();
      const rightChain = skeletonService.getRightArmChain();

      if (!leftChain) {
        console.warn("[Avatar3D] Left arm chain NOT FOUND");
      }

      if (!rightChain) {
        console.warn("[Avatar3D] Right arm chain NOT FOUND");
      }
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
      useProceduralFallback = true;
      return;
    }

    try {
      await loadFeatureModule("3d-viewer");

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

      // Load initial avatar
      await loadAvatar(avatarId);
    } catch (err) {
      console.error("[Avatar3D] Failed to initialize avatar services:", err);
      useProceduralFallback = true;
    }
  });

  // React to avatarId changes by reloading model
  $effect(() => {
    // Only react after initial mount and services are ready
    if (!servicesReady || !useGLTF || isLoading) return;

    if (avatarId !== currentLoadedAvatarId) {
      loadAvatar(avatarId);
    }
  });

  // React to height changes - update avatar scale
  $effect(() => {
    if (!skeletonService || !modelLoaded || useProceduralFallback) return;

    // Update height when user proportions change
    // setHeight() calculates proper scale and stores feet offset
    skeletonService.setHeight(avatarHeight);

    // Update feetOffset for positioning (use untrack to prevent re-triggering)
    const newFeetOffset = skeletonService.getFeetOffset();
    untrack(() => {
      feetOffset = newFeetOffset;
    });

    // DEBUG: Log the values being used (use untrack for reading derived values)
    untrack(() => {
      console.log(`[Avatar3D] Height changed: avatarHeight=${avatarHeight.toFixed(2)} units`);
      console.log(`  groundY=${groundY.toFixed(2)}, feetOffset=${newFeetOffset.toFixed(2)}, groupY=${(groundY - newFeetOffset).toFixed(2)}`);
    });
  });

  // Update animation each frame
  useTask((delta) => {
    if (!servicesReady || !animationService || useProceduralFallback) return;

    // Update hand targets from prop states
    animationService.setHandTargetsFromProps(bluePropState, redPropState);

    // Update animation (applies IK)
    animationService.update(delta);
  });

  // Sync visibility changes (only when using GLTF mode, not procedural fallback)
  $effect(() => {
    if (customizationService && !useProceduralFallback) {
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
    <!-- Procedural fallback (used when GLTF loading fails) -->
    <IKFigure3D {bluePropState} {redPropState} />
  {:else if modelLoaded && cachedRoot}
    <!-- GLTF model (production mode) -->
    <!--
      Position the avatar:
      - X: 0 (centered)
      - Y: groupY (calculated to put feet at groundY)
      - Z: FIGURE_Z (-80, behind grid, facing toward props)

      groupY = groundY - feetOffset
      - feetOffset is negative (feet are below model origin)
      - This positions the group so feet end up at world Y = groundY
      - Shoulders end up at world Y = 0 (grid center)

      Using cachedRoot instead of skeletonService.getRoot() ensures
      the template only updates AFTER a new model is fully loaded,
      preventing visual glitches during avatar swap.
    -->
    <T.Group position={[0, groupY, FIGURE_Z]}>
      <T is={cachedRoot} />
    </T.Group>
  {/if}
{/if}
