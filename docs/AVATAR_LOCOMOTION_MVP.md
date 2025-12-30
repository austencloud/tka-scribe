# Avatar Locomotion MVP Plan

WASD movement with third-person camera for immersive avatar control.

**Last Updated**: 2025-12-29
**Status**: Ready for Implementation

---

## MVP Scope

### What's In

- WASD keyboard movement (continuous)
- Third-person camera behind avatar
- Camera-relative movement direction
- Smooth camera follow with damping
- Avatar faces movement direction
- Bounds checking (stay within scene)

### What's Out (Future)

- Walk/run animations (sliding for MVP)
- Sprint (Shift key)
- Mouse look / camera rotation
- Physics engine
- Avatar-avatar collision
- Mobile virtual joystick

---

## Core Concepts

### Camera-Relative Movement

When player presses W, avatar moves in the direction the camera is facing:

```
Camera behind avatar, looking forward:
  W = move forward (away from camera)
  S = move backward (toward camera)
  A = strafe left
  D = strafe right
```

### Third-Person Camera

Camera maintains fixed offset behind avatar:

```
        [Camera] ----offset----> [Avatar] ----> facing direction
            \                      |
             \____follows_________/
```

---

## Implementation Steps

### Step 1: Extend Avatar Instance State

**File**: `src/lib/shared/3d-animation/state/avatar-instance-state.svelte.ts`

```typescript
// Add constants
const FIGURE_Z = -80;
const MOVE_SPEED = 150;  // Units per second
const ROTATION_SPEED = 8; // Radians per second for smooth turning

const SCENE_BOUNDS = {
  minX: -400, maxX: 400,
  minZ: -400, maxZ: 200
};

// Add to state factory
let position = $state({
  x: config.positionX,
  y: 0,
  z: config.positionZ ?? FIGURE_Z
});

// Movement input state (which keys are held)
let moveInput = $state({ x: 0, z: 0 }); // -1 to 1 for each axis
let isMoving = $state(false);
let facingAngle = $state(0); // Radians, 0 = facing +Z
let targetFacingAngle = $state(0); // For smooth rotation

/**
 * Set movement input from WASD keys.
 * x: -1 (A) to 1 (D)
 * z: -1 (S) to 1 (W)
 */
function setMoveInput(input: { x: number, z: number }) {
  moveInput = input;
  isMoving = input.x !== 0 || input.z !== 0;

  // Pause sequence when moving
  if (isMoving && playback.isPlaying) {
    playback.pause();
  }
}

/**
 * Update movement each frame.
 * @param delta - Time since last frame in seconds
 * @param cameraAngle - Camera's Y rotation in radians
 */
function updateMovement(delta: number, cameraAngle: number) {
  if (!isMoving) return;

  // Calculate world-space movement direction based on camera
  const sin = Math.sin(cameraAngle);
  const cos = Math.cos(cameraAngle);

  // Transform input by camera rotation
  const worldX = moveInput.x * cos - moveInput.z * sin;
  const worldZ = moveInput.x * sin + moveInput.z * cos;

  // Normalize if moving diagonally
  const length = Math.sqrt(worldX * worldX + worldZ * worldZ);
  const nx = length > 0 ? worldX / length : 0;
  const nz = length > 0 ? worldZ / length : 0;

  // Update target facing angle
  if (length > 0) {
    targetFacingAngle = Math.atan2(nx, nz);
  }

  // Smooth rotation toward target
  let angleDiff = targetFacingAngle - facingAngle;
  // Normalize to -PI to PI
  while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
  while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
  facingAngle += angleDiff * Math.min(1, ROTATION_SPEED * delta);

  // Apply movement
  const moveAmount = MOVE_SPEED * delta;
  let newX = position.x + nx * moveAmount;
  let newZ = position.z + nz * moveAmount;

  // Clamp to bounds
  newX = Math.max(SCENE_BOUNDS.minX, Math.min(SCENE_BOUNDS.maxX, newX));
  newZ = Math.max(SCENE_BOUNDS.minZ, Math.min(SCENE_BOUNDS.maxZ, newZ));

  position.x = newX;
  position.z = newZ;
}

function stopMovement() {
  moveInput = { x: 0, z: 0 };
  isMoving = false;
}

// Add to return object
return {
  // ... existing ...

  get position() { return position; },
  get facingAngle() { return facingAngle; },
  get isMoving() { return isMoving; },

  setMoveInput,
  updateMovement,
  stopMovement,
};
```

### Step 2: Create WASD Input Handler

**File**: `src/lib/shared/3d-animation/components/locomotion/WASDController.svelte`

```svelte
<script lang="ts">
  /**
   * WASDController
   *
   * Handles WASD keyboard input for avatar movement.
   * Converts key states into movement direction.
   */
  import { onMount, onDestroy } from 'svelte';

  interface Props {
    onInput: (input: { x: number, z: number }) => void;
    enabled?: boolean;
  }

  let { onInput, enabled = true }: Props = $props();

  // Track which keys are held
  let keys = $state({
    w: false,
    a: false,
    s: false,
    d: false
  });

  // Convert key states to movement input
  const input = $derived({
    x: (keys.d ? 1 : 0) - (keys.a ? 1 : 0),
    z: (keys.w ? 1 : 0) - (keys.s ? 1 : 0)
  });

  // Emit input changes
  $effect(() => {
    if (enabled) {
      onInput(input);
    }
  });

  function handleKeyDown(e: KeyboardEvent) {
    if (!enabled) return;

    const key = e.key.toLowerCase();
    if (key in keys) {
      keys[key as keyof typeof keys] = true;
      e.preventDefault();
    }
  }

  function handleKeyUp(e: KeyboardEvent) {
    const key = e.key.toLowerCase();
    if (key in keys) {
      keys[key as keyof typeof keys] = false;
    }
  }

  // Handle window blur (release all keys)
  function handleBlur() {
    keys = { w: false, a: false, s: false, d: false };
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
  });

  onDestroy(() => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    window.removeEventListener('blur', handleBlur);
  });
</script>

<!-- Render-less component -->
```

### Step 3: Create Third-Person Camera

**File**: `src/lib/shared/3d-animation/components/locomotion/ThirdPersonCamera.svelte`

```svelte
<script lang="ts">
  /**
   * ThirdPersonCamera
   *
   * Camera that follows behind the avatar with smooth damping.
   * Provides an over-the-shoulder view.
   */
  import { T, useTask, useThrelte } from '@threlte/core';
  import { Vector3 } from 'three';

  interface Props {
    /** Target position to follow */
    target: { x: number, y?: number, z: number };
    /** Target's facing angle in radians */
    targetAngle: number;
    /** Distance behind target */
    distance?: number;
    /** Height above target */
    height?: number;
    /** How quickly camera follows (0-1, higher = faster) */
    damping?: number;
    /** Callback with current camera angle (for movement direction) */
    onAngleChange?: (angle: number) => void;
  }

  let {
    target,
    targetAngle,
    distance = 300,
    height = 150,
    damping = 0.05,
    onAngleChange
  }: Props = $props();

  const { camera } = useThrelte();

  // Current camera state (smoothed)
  let currentPosition = $state(new Vector3(
    target.x,
    (target.y ?? 0) + height,
    target.z - distance
  ));
  let currentLookAt = $state(new Vector3(target.x, target.y ?? 0, target.z));

  // Camera angle for movement direction
  let cameraAngle = $state(0);

  useTask((delta) => {
    // Calculate ideal camera position (behind avatar)
    const idealX = target.x - Math.sin(targetAngle) * distance;
    const idealY = (target.y ?? 0) + height;
    const idealZ = target.z - Math.cos(targetAngle) * distance;

    // Smooth follow with damping
    const lerpFactor = 1 - Math.pow(1 - damping, delta * 60);

    currentPosition.x += (idealX - currentPosition.x) * lerpFactor;
    currentPosition.y += (idealY - currentPosition.y) * lerpFactor;
    currentPosition.z += (idealZ - currentPosition.z) * lerpFactor;

    // Look at point slightly above avatar
    const lookY = (target.y ?? 0) + 50;
    currentLookAt.x += (target.x - currentLookAt.x) * lerpFactor;
    currentLookAt.y += (lookY - currentLookAt.y) * lerpFactor;
    currentLookAt.z += (target.z - currentLookAt.z) * lerpFactor;

    // Update camera angle for movement direction
    const dx = target.x - currentPosition.x;
    const dz = target.z - currentPosition.z;
    cameraAngle = Math.atan2(dx, dz);

    onAngleChange?.(cameraAngle);
  });
</script>

<T.PerspectiveCamera
  makeDefault
  position={[currentPosition.x, currentPosition.y, currentPosition.z]}
  fov={60}
  near={1}
  far={6000}
  oncreate={(ref) => {
    ref.lookAt(currentLookAt);
  }}
>
  <!-- Update lookAt each frame -->
  {#key `${currentLookAt.x}-${currentLookAt.y}-${currentLookAt.z}`}
    <T.Object3D oncreate={(ref) => {
      camera.current?.lookAt(currentLookAt);
    }} />
  {/key}
</T.PerspectiveCamera>
```

### Step 4: Create Movement Orchestrator

**File**: `src/lib/shared/3d-animation/components/locomotion/LocomotionController.svelte`

```svelte
<script lang="ts">
  /**
   * LocomotionController
   *
   * Orchestrates WASD movement with third-person camera.
   */
  import { useTask } from '@threlte/core';
  import WASDController from './WASDController.svelte';
  import ThirdPersonCamera from './ThirdPersonCamera.svelte';

  interface LocomotionState {
    position: { x: number, y?: number, z: number };
    facingAngle: number;
    isMoving: boolean;
    setMoveInput: (input: { x: number, z: number }) => void;
    updateMovement: (delta: number, cameraAngle: number) => void;
  }

  interface Props {
    avatarState: LocomotionState;
    enabled?: boolean;
    cameraDistance?: number;
    cameraHeight?: number;
  }

  let {
    avatarState,
    enabled = true,
    cameraDistance = 300,
    cameraHeight = 150
  }: Props = $props();

  // Camera angle for movement direction calculation
  let cameraAngle = $state(0);

  function handleInput(input: { x: number, z: number }) {
    avatarState.setMoveInput(input);
  }

  function handleCameraAngle(angle: number) {
    cameraAngle = angle;
  }

  // Update movement each frame
  useTask((delta) => {
    if (!enabled) return;
    avatarState.updateMovement(delta, cameraAngle);
  });
</script>

<!-- WASD input handling -->
<WASDController onInput={handleInput} {enabled} />

<!-- Third-person camera -->
<ThirdPersonCamera
  target={avatarState.position}
  targetAngle={avatarState.facingAngle}
  distance={cameraDistance}
  height={cameraHeight}
  onAngleChange={handleCameraAngle}
/>
```

### Step 5: Update Avatar3D for Position State

**File**: `src/lib/shared/3d-animation/components/Avatar3D.svelte`

```svelte
<script lang="ts">
  // Update Props interface
  interface Props {
    // ... existing ...
    position?: { x: number; y?: number; z: number };
    facingAngle?: number;
  }

  let {
    // ... existing ...
    position = { x: 0, z: FIGURE_Z },
    facingAngle = 0,
  }: Props = $props();
</script>

<!-- Update template positioning -->
{#if visible}
  {#if useProceduralFallback}
    <T.Group
      position={[position.x, 0, position.z]}
      rotation.y={facingAngle}
    >
      <IKFigure3D {bluePropState} {redPropState} />
    </T.Group>
  {:else if modelLoaded && cachedRoot}
    <T.Group
      position={[position.x, groupY, position.z]}
      rotation.y={facingAngle}
    >
      <T is={cachedRoot} />
    </T.Group>
  {/if}
{/if}
```

### Step 6: Wire Up in Viewer3DModule

**File**: `src/lib/shared/3d-animation/Viewer3DModule.svelte`

```svelte
<script lang="ts">
  import LocomotionController from './components/locomotion/LocomotionController.svelte';

  // Add locomotion mode toggle
  let locomotionMode = $state(false); // Toggle between orbit and locomotion
</script>

<Scene3D ...>
  <!-- ... existing content ... -->

  <!-- Avatar with position from state -->
  {#if showFigure}
    <Avatar3D
      id="avatar1"
      bluePropState={avatar1State.bluePropState}
      redPropState={avatar1State.redPropState}
      position={avatar1State.position}
      facingAngle={avatar1State.facingAngle}
      isActive={activeAvatarId === 'avatar1'}
      avatarId={avatar1State.avatarModelId}
    />
  {/if}

  <!-- Locomotion controller (replaces default camera when active) -->
  {#if locomotionMode && activeState}
    <LocomotionController
      avatarState={activeState}
      enabled={locomotionMode}
    />
  {/if}
</Scene3D>

<!-- Toggle button in overlay -->
<button onclick={() => locomotionMode = !locomotionMode}>
  {locomotionMode ? 'Exit Walk Mode' : 'Enter Walk Mode'}
</button>
```

---

## Interaction Flow

```
User presses W key
    │
    ▼
WASDController.handleKeyDown()
    │
    ▼
keys.w = true → input = { x: 0, z: 1 }
    │
    ▼
avatarState.setMoveInput({ x: 0, z: 1 })
    │
    ├─► Sets isMoving = true
    └─► Pauses sequence playback
    │
    ▼
useTask runs each frame
    │
    ▼
avatarState.updateMovement(delta, cameraAngle)
    │
    ├─► Transforms input by camera angle
    ├─► Updates position
    ├─► Smoothly rotates facingAngle
    └─► Clamps to bounds
    │
    ▼
ThirdPersonCamera follows avatar
    │
    ├─► Smooth position damping
    └─► Reports cameraAngle for next frame
    │
    ▼
Avatar3D renders at new position/rotation
```

---

## Camera Behavior

```
                    ┌─────────────┐
                    │   Avatar    │ ← facing direction
                    │     ↑       │
                    └─────────────┘
                          │
                          │ distance (300 units)
                          │
                    ┌─────────────┐
                    │   Camera    │ ← height (150 units above avatar)
                    │     👁       │
                    └─────────────┘

When avatar turns:
  - Camera smoothly orbits to stay behind
  - Damping prevents jarring movement
  - WASD is always relative to camera facing
```

---

## Files Created/Modified

| File | Action | Purpose |
|------|--------|---------|
| `avatar-instance-state.svelte.ts` | Modify | Add position, movement input, updateMovement |
| `Avatar3D.svelte` | Modify | Accept position state, add facing rotation |
| `Viewer3DModule.svelte` | Modify | Add locomotion mode toggle |
| `locomotion/WASDController.svelte` | Create | Keyboard input handling |
| `locomotion/ThirdPersonCamera.svelte` | Create | Follow camera with damping |
| `locomotion/LocomotionController.svelte` | Create | Orchestrator component |

---

## Testing Checklist

- [ ] W moves avatar forward (away from camera)
- [ ] S moves avatar backward (toward camera)
- [ ] A strafes left
- [ ] D strafes right
- [ ] Diagonal movement works (W+D, etc.)
- [ ] Avatar faces movement direction
- [ ] Camera follows smoothly behind avatar
- [ ] Movement stops when keys released
- [ ] Tab/blur releases all keys
- [ ] Movement stays within bounds
- [ ] Sequence playback pauses during movement
- [ ] Can toggle locomotion mode on/off

---

## Known Limitations (MVP)

1. **No walk animation** - Avatar slides smoothly
2. **No mouse look** - Camera only follows avatar rotation
3. **No sprint** - Single speed only
4. **No collision** - Avatars can overlap
5. **Desktop only** - No mobile support yet

---

## Future Enhancements

1. **Mixamo walk animation** - Blend with upper body IK
2. **Mouse look** - Rotate camera independently
3. **Sprint (Shift)** - Faster movement
4. **Mobile joystick** - Virtual joystick overlay
5. **Camera collision** - Prevent camera going through walls

---

## Dependencies

- No new packages required
- Uses existing Threlte/Three.js

---

## Estimated Effort

| Task | Effort |
|------|--------|
| State changes | 1-2 hours |
| WASD controller | 1 hour |
| Third-person camera | 2-3 hours |
| Integration | 1-2 hours |
| Testing/polish | 1-2 hours |
| **Total** | **6-10 hours** |
