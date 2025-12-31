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
   *
   * IMPORTANT: Each Avatar3D creates its own service instances to support
   * multi-avatar mode. Services are NOT resolved via DI because they need
   * to share the same skeleton instance (animator needs the same skeleton
   * that this component loads the model into).
   */

  import { onMount, onDestroy, untrack } from "svelte";
  import { T, useTask } from "@threlte/core";
  import { loadFeatureModule } from "$lib/shared/inversify/container";
  import type { IAvatarSkeletonBuilder } from "../services/contracts/IAvatarSkeletonBuilder";
  import type { IIKSolver } from "../services/contracts/IIKSolver";
  import type { IAvatarAnimator } from "../services/contracts/IAvatarAnimator";
  import type { PropState3D } from "../domain/models/PropState3D";
  import { cmToUnits } from "../config/avatar-proportions";
  import { getAvatarModelPath, type AvatarId, DEFAULT_AVATAR_ID } from "../config/avatar-definitions";
  import { WALL_OFFSET } from "../utils/performer-positions";
  import { userProportionsState } from "../state/user-proportions-state.svelte";
  import IKFigure3D from "./IKFigure3D.svelte";

  // Direct imports for manual instantiation (ensures shared skeleton instance)
  import { AvatarSkeletonBuilder } from "../services/implementations/AvatarSkeletonBuilder";
  import { IKSolver } from "../services/implementations/IKSolver";
  import { AvatarAnimator } from "../services/implementations/AvatarAnimator";
  import { LegAnimator } from "../services/implementations/LegAnimator";
  import type { ILegAnimator } from "../services/contracts/ILegAnimator";

  // Default Z position for avatars
  // Placing avatar at z=0 (same as grid plane) so hands are exactly at prop positions
  // The avatar's body is thin enough that it won't clip through the grid
  const DEFAULT_FIGURE_Z = 0;

  interface Props {
    bluePropState: PropState3D | null;
    redPropState: PropState3D | null;
    visible?: boolean;
    avatarId?: AvatarId;
    useGLTF?: boolean; // Whether to use GLTF model or procedural fallback
    // Multi-avatar support
    id?: string; // Avatar identifier for multi-avatar mode
    /** Full 3D position (replaces positionX for locomotion support) */
    position?: { x: number; y?: number; z: number };
    /** Facing angle in radians for avatar rotation (0 = facing +Z) */
    facingAngle?: number;
    isActive?: boolean; // Whether this avatar is currently selected/active
    // Locomotion animation
    /** Whether the avatar is currently moving (triggers walk animation) */
    isMoving?: boolean;
    /** Movement speed 0-1 for animation playback rate */
    moveSpeed?: number;
    /** Path to walk animation GLB file (optional) */
    walkAnimationUrl?: string;
  }

  let {
    bluePropState,
    redPropState,
    visible = true,
    avatarId = DEFAULT_AVATAR_ID,
    useGLTF = true, // Default to using GLTF model
    // Multi-avatar defaults
    id = 'avatar1',
    position = { x: 0, y: 0, z: DEFAULT_FIGURE_Z },
    facingAngle = 0,
    isActive = true,
    // Locomotion animation
    isMoving = false,
    moveSpeed = 1,
    walkAnimationUrl = '/animations/walk.glb',
  }: Props = $props();

  // Services (manually instantiated to ensure shared skeleton instance)
  let skeletonService: IAvatarSkeletonBuilder | null = $state(null);
  let ikSolver: IIKSolver | null = $state(null);
  let animationService: IAvatarAnimator | null = $state(null);
  let legAnimator: ILegAnimator | null = $state(null);

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

      // Initialize leg animator with the loaded skeleton
      if (legAnimator && cachedRoot) {
        legAnimator.initialize(cachedRoot);

        // Load walk animation (non-blocking)
        legAnimator.loadWalkAnimation(walkAnimationUrl).catch((err) => {
          console.warn("[Avatar3D] Walk animation not loaded:", err.message);
          // Animation is optional - avatar will work without it
        });
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
      // Load feature module (ensures GLTF loader etc are available)
      await loadFeatureModule("3d-viewer");

      // Create per-avatar service instances manually
      // This ensures the animator uses the SAME skeleton instance we load models into
      // (Using DI would give animator its own skeleton via constructor injection)
      const skeleton = new AvatarSkeletonBuilder();
      const solver = new IKSolver();
      const animator = new AvatarAnimator(solver, skeleton);
      const legs = new LegAnimator();

      skeletonService = skeleton;
      ikSolver = solver;
      animationService = animator;
      legAnimator = legs;

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
  });

  // React to locomotion state changes - update leg animation
  $effect(() => {
    if (!legAnimator || !legAnimator.isReady()) return;

    legAnimator.setLocomotion({
      isMoving,
      speed: moveSpeed,
      facingAngle,
    });
  });

  // Update animation each frame
  useTask((delta) => {
    if (!servicesReady || !animationService || useProceduralFallback) return;

    // Convert prop states from LOCAL grid coords to WORLD coords for IK solver
    //
    // The IK solver uses bone.getWorldPosition() which returns WORLD coordinates
    // (including the parent T.Group offset). So targets must also be in WORLD coords.
    //
    // Props are on the wall plane (z=0), while avatar stands behind (z=WALL_OFFSET).
    // The IK targets need to be at z=0 (where props actually are) so hands reach forward.
    // We compensate by subtracting WALL_OFFSET from the z offset calculation.
    //
    // Example for avatar at position (x=100, z=-60) with WALL_OFFSET=-60:
    //   Prop at local (x=0, y=0, z=0) → world (x=100, y=0, z=0)  (on wall plane)

    const blueWorldProp = bluePropState ? {
      ...bluePropState,
      worldPosition: {
        x: bluePropState.worldPosition.x + position.x,
        y: bluePropState.worldPosition.y + (position.y ?? 0),
        z: bluePropState.worldPosition.z + (position.z - WALL_OFFSET),  // Props are on wall plane
      }
    } : null;

    const redWorldProp = redPropState ? {
      ...redPropState,
      worldPosition: {
        x: redPropState.worldPosition.x + position.x,
        y: redPropState.worldPosition.y + (position.y ?? 0),
        z: redPropState.worldPosition.z + (position.z - WALL_OFFSET),  // Props are on wall plane
      }
    } : null;

    // Update hand targets from prop states (now in world coords)
    animationService.setHandTargetsFromProps(blueWorldProp, redWorldProp);

    // Update upper body animation (applies arm IK)
    animationService.update(delta);

    // Update lower body animation (walk cycle)
    if (legAnimator) {
      legAnimator.update(delta);
    }
  });

  // Note: Visibility is handled via the {#if visible} in the template
  // No need for customizationService - skeleton visibility is controlled by Svelte rendering

  onDestroy(() => {
    // Dispose leg animator
    if (legAnimator) {
      legAnimator.dispose();
    }

    // Only dispose if we loaded a GLTF model
    if (skeletonService && !useProceduralFallback) {
      skeletonService.dispose();
    }
  });
</script>

{#if visible}
  {#if useProceduralFallback}
    <!-- Procedural fallback (used when GLTF loading fails) -->
    <T.Group
      name={`PERFORMER_${id}`}
      position={[position.x, position.y ?? 0, position.z]}
      rotation.y={facingAngle}
    >
      <!-- worldPosition is already local grid coordinates, no offset needed -->
      <IKFigure3D {bluePropState} {redPropState} />
    </T.Group>
  {:else if modelLoaded && cachedRoot}
    <!-- GLTF model (production mode) -->
    <!--
      Position the avatar:
      - X, Z: from position object (supports locomotion)
      - Y: groupY (calculated to put feet at groundY)
      - rotation.y: facingAngle (avatar faces movement direction)

      groupY = groundY - feetOffset
      - feetOffset is negative (feet are below model origin)
      - This positions the group so feet end up at world Y = groundY
      - Shoulders end up at world Y = 0 (grid center)

      Using cachedRoot instead of skeletonService.getRoot() ensures
      the template only updates AFTER a new model is fully loaded,
      preventing visual glitches during avatar swap.
    -->
    <T.Group
      name={`PERFORMER_${id}`}
      position={[position.x, groupY, position.z]}
      rotation.y={facingAngle}
    >
      <T is={cachedRoot} />
    </T.Group>
  {/if}
{/if}
