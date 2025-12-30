# Avatar Locomotion Research

Research document for adding locomotion (walking/movement) to the 3D viewer's dual avatars.

**Last Updated**: 2025-12-29
**Status**: Design Complete
**Chosen Approach**: WASD keyboard movement with third-person follow camera

---

## Decision Summary

After evaluating options, the chosen MVP approach is:
- **Input**: WASD keyboard for continuous movement
- **Camera**: Third-person follow camera behind avatar
- **Movement**: Camera-relative direction (W = forward from camera's view)
- **Animation**: Smooth sliding for MVP, Mixamo walk animations for v2

See `AVATAR_LOCOMOTION_MVP.md` for implementation details.

---

## Table of Contents

1. [Current Architecture](#current-architecture)
2. [Movement Input Options](#movement-input-options)
3. [Animation Approaches](#animation-approaches)
4. [Physics and Collision](#physics-and-collision)
5. [Camera System](#camera-system)
6. [Key Technical Challenges](#key-technical-challenges)
7. [Recommendations](#recommendations)

---

## Current Architecture

### Avatar Positioning

```
Avatar3D.svelte
├── positionX: number (horizontal offset prop)
├── FIGURE_Z = -80 (fixed depth, behind grid)
├── groupY: calculated from groundY and feetOffset
└── Uses T.Group for positioning
```

**Current Position System**:
- `positionX`: Horizontal offset (passed as prop, currently -150 for avatar1, +150 for avatar2)
- `FIGURE_Z`: Fixed at -80 (avatars stand behind grid, facing props)
- `groupY`: Calculated to place feet at ground level

### Avatar State Management

```typescript
// avatar-instance-state.svelte.ts
let positionX = $state(config.positionX);  // Currently only X
// No positionZ or velocity state exists
```

### Animation System

- **Upper Body**: IK-driven via `IAvatarAnimator` (arms follow prop positions)
- **IK Solver**: Supports analytic (2-bone), CCD, and FABRIK algorithms
- **Frame Loop**: `useTask((delta) => ...)` from Threlte for per-frame updates
- **Blending**: `IAvatarAnimator` supports animation layers with weights and transitions

### Key Services

| Service | Purpose |
|---------|---------|
| `IAvatarSkeletonBuilder` | Loads GLTF, builds skeleton, provides arm chains |
| `IIKSolver` | Solves IK for arms (could be extended for legs) |
| `IAvatarAnimator` | Pose management, layer blending, hand targets |
| `IPropStateInterpolator` | Interpolates prop positions during playback |

---

## Movement Input Options

### A. Click-to-Move (RTS Style)

**How it works**: Click on ground plane, avatar walks to that position.

```svelte
<script>
  import { interactivity } from '@threlte/extras';

  const { onClick } = interactivity();

  function handleGroundClick(event: ThreeEvent<MouseEvent>) {
    const worldPoint = event.point;
    avatarState.setMoveTarget({ x: worldPoint.x, z: worldPoint.z });
  }
</script>

<T.Mesh onclick={handleGroundClick}>
  <T.PlaneGeometry args={[1000, 1000]} />
  <T.MeshBasicMaterial visible={false} />
</T.Mesh>
```

**Pros**:
- Intuitive for desktop
- Precise positioning
- Works well with performance sequences (click to position, then play)
- Natural for choreography planning

**Cons**:
- Requires cursor/raycast on mobile (less intuitive)
- Needs visible ground or invisible click plane
- No continuous movement

**Recommendation**: **Good for MVP** - simple to implement, natural for this use case.

### B. Virtual Joystick (Mobile)

**How it works**: On-screen joystick controls direction and speed.

```svelte
<script>
  import { Joystick } from '@threlte/extras'; // or custom

  function handleJoystick(direction: { x: number, y: number }) {
    avatarState.setMoveDirection(direction);
  }
</script>
```

**Pros**:
- Essential for mobile
- Continuous control
- Familiar to gamers

**Cons**:
- Takes screen real estate
- More complex state (direction + magnitude)
- Needs on-screen UI overlay

**Recommendation**: Add in v2 for mobile support.

### C. WASD Keyboard

**How it works**: Standard keyboard movement.

```typescript
// In Keyboard3DCoordinator.svelte
function handleKeyDown(e: KeyboardEvent) {
  switch(e.key) {
    case 'w': avatarState.startMoveForward(); break;
    case 's': avatarState.startMoveBackward(); break;
    case 'a': avatarState.startMoveLeft(); break;
    case 'd': avatarState.startMoveRight(); break;
  }
}
```

**Pros**:
- Familiar for gamers
- Continuous control
- No UI needed

**Cons**:
- Conflicts with existing shortcuts (need modifier or mode)
- Desktop only
- Two avatars = need to know which is active

**Recommendation**: Consider for power users, but not MVP.

### D. Path/Waypoint Following

**How it works**: Define a path, avatar follows it automatically.

```typescript
interface Waypoint {
  position: { x: number, z: number };
  duration?: number; // time to reach this point
  pauseAtWaypoint?: number; // seconds to pause
}

avatarState.followPath([
  { position: { x: 0, z: 0 } },
  { position: { x: 100, z: 50 }, duration: 2 },
  { position: { x: -50, z: 100 }, duration: 3 }
]);
```

**Pros**:
- Great for choreographed scenes
- Reproducible
- Could sync with sequence beats
- No real-time input needed

**Cons**:
- Needs path editor UI
- More complex to set up
- Less spontaneous

**Recommendation**: Ideal for v2+ when choreography features are added.

### Input Method Summary

| Method | MVP? | Mobile | Desktop | Complexity | Use Case |
|--------|------|--------|---------|------------|----------|
| Click-to-move | Yes | Needs adaptation | Great | Low | Position before sequence |
| Virtual joystick | No | Great | Okay | Medium | Mobile exploration |
| WASD | No | No | Good | Low | Power users |
| Waypoint paths | No | Yes | Yes | High | Choreographed scenes |

---

## Animation Approaches

### A. Mixamo Walk Animations

**How it works**: Download pre-made walk/run animations from Mixamo, convert to GLTF, blend with IK.

**Workflow**:
1. Download walk animation from mixamo.com (FBX)
2. Convert to GLTF using Blender (existing workflow)
3. Load animation clip in Three.js AnimationMixer
4. Blend with existing arm IK

```typescript
// Conceptual - loading a walk clip
const walkClip = gltf.animations.find(a => a.name === 'Walk');
const mixer = new THREE.AnimationMixer(avatar);
const walkAction = mixer.clipAction(walkClip);

// On update
mixer.update(delta);
```

**Upper/Lower Body Blending**:
```typescript
// Key insight: Mixamo animations can be masked to legs only
// Arms continue to use IK for prop manipulation

const lowerBodyMask = {
  bones: ['mixamorigHips', 'mixamorigLeftUpLeg', 'mixamorigLeftLeg',
          'mixamorigLeftFoot', 'mixamorigRightUpLeg', 'mixamorigRightLeg',
          'mixamorigRightFoot']
};

walkAction.setEffectiveWeight(1.0);
walkAction.play();

// Then apply arm IK on top (existing system)
animationService.setHandTargetsFromProps(blueProp, redProp);
```

**Pros**:
- High quality, professional motion
- Many variations (walk, run, strafe)
- Quick to implement once pipeline exists

**Cons**:
- Extra asset downloads (~1-2MB per animation)
- Need to match rig to Mixamo naming
- Blending complexity with upper body IK

**Recommendation**: **Best for production** - professional results, reasonable effort.

### B. Procedural Walk Cycle

**How it works**: Generate walk motion mathematically.

```typescript
function proceduralWalk(t: number, speed: number): LegPose {
  const cycleTime = t * speed * 2 * Math.PI;

  // Sinusoidal leg movement
  const leftHip = Math.sin(cycleTime) * 0.3; // radians
  const rightHip = Math.sin(cycleTime + Math.PI) * 0.3;

  // Knee bends at certain phases
  const leftKnee = Math.max(0, Math.sin(cycleTime + 0.5)) * 0.4;
  const rightKnee = Math.max(0, Math.sin(cycleTime + Math.PI + 0.5)) * 0.4;

  return { leftHip, rightHip, leftKnee, rightKnee };
}
```

**Pros**:
- No extra assets
- Infinitely adjustable
- Speed scales naturally

**Cons**:
- Looks robotic without tuning
- Significant math/animation expertise needed
- Hard to get right

**Recommendation**: Good for prototyping, but Mixamo is better for production.

### C. Inverse Kinematics Legs (Foot Placement)

**How it works**: Move feet to procedural targets, let IK solve leg poses.

```typescript
// Set foot targets, IK solves hip/knee/ankle
function calculateFootTargets(t: number, moveDir: Vector3): { left: Vector3, right: Vector3 } {
  const stride = 30; // units
  const cycleTime = t * 2; // cycles per second when moving

  const offset = Math.sin(cycleTime * Math.PI) * stride;

  return {
    left: new Vector3(moveDir.x * offset, footHeight(offset), moveDir.z * offset),
    right: new Vector3(-moveDir.x * offset, footHeight(-offset), -moveDir.z * offset)
  };
}

// Apply via existing IK solver
ikSolver.solveAndApply(leftLegChain, { position: leftFootTarget });
ikSolver.solveAndApply(rightLegChain, { position: rightFootTarget });
```

**Pros**:
- Leverages existing IK infrastructure
- Adapts to any terrain (future)
- Full control over foot placement

**Cons**:
- Need to add leg chains to skeleton builder
- Hip sway/body motion still needs procedural
- Complex to get natural-looking

**Recommendation**: Best combined with Mixamo as a hybrid approach.

### D. Hybrid: Mixamo + IK Override

**How it works**: Play Mixamo walk for legs, but override specific bones with IK when needed.

```typescript
// Layer 1: Mixamo walk (lower body)
walkAction.setEffectiveWeight(1.0);

// Layer 2: Upper body IK (existing)
animationService.setHandTargetsFromProps(blueProp, redProp);

// Layer 3: Foot IK for ground contact (optional)
// Only activate when on uneven terrain
if (needsFootIK) {
  ikSolver.solveAndApply(leftLegChain, groundContactTarget);
}
```

**Recommendation**: **Best long-term approach** - use Mixamo for base motion, IK for refinement.

### Animation Blending Strategy

Three.js AnimationMixer supports this natively:

```typescript
const mixer = new THREE.AnimationMixer(avatar);

// Idle pose (when standing)
const idleAction = mixer.clipAction(idleClip);

// Walk animation
const walkAction = mixer.clipAction(walkClip);

// Cross-fade when starting/stopping movement
function startMoving() {
  walkAction.reset();
  walkAction.crossFadeFrom(idleAction, 0.3, true);
  walkAction.play();
}

function stopMoving() {
  idleAction.reset();
  idleAction.crossFadeFrom(walkAction, 0.3, true);
  idleAction.play();
}
```

---

## Physics and Collision

### A. @threlte/rapier Integration

**How it works**: Full physics engine integration.

```svelte
<script>
  import { RigidBody, Collider } from '@threlte/rapier';
</script>

<RigidBody type="kinematicPosition" bind:position={avatarPosition}>
  <Collider shape="capsule" args={[0.5, 1.5]} />
</RigidBody>
```

**Pros**:
- Proper collision detection
- Can push objects, be pushed
- Ground detection built-in

**Cons**:
- Heavy dependency (~150KB)
- Overkill for current needs
- Kinematic bodies still need manual movement

**Recommendation**: Skip for MVP, consider for v3+ with object interaction.

### B. Simple Raycasting for Ground

**How it works**: Cast ray down to find ground, adjust avatar height.

```typescript
const raycaster = new THREE.Raycaster();
const down = new THREE.Vector3(0, -1, 0);

function getGroundHeight(position: Vector3): number {
  raycaster.set(new Vector3(position.x, 1000, position.z), down);
  const hits = raycaster.intersectObject(groundMesh);
  return hits.length > 0 ? hits[0].point.y : 0;
}

// In update loop
const groundY = getGroundHeight(avatarPosition);
avatarState.setGroundY(groundY);
```

**Pros**:
- Lightweight
- Already familiar (Three.js native)
- Sufficient for flat/simple terrain

**Cons**:
- No collision with other avatars
- No physics response

**Recommendation**: **Good for MVP** - simple, sufficient for current needs.

### C. Avatar-Avatar Collision

**How it works**: Check distance between avatars, prevent overlap.

```typescript
function checkAvatarCollision(avatar1Pos: Vector3, avatar2Pos: Vector3): boolean {
  const minDistance = 50; // units
  return avatar1Pos.distanceTo(avatar2Pos) < minDistance;
}

function resolveCollision(moving: Vector3, static: Vector3, target: Vector3): Vector3 {
  const pushDir = new Vector3().subVectors(moving, static).normalize();
  return target.clone().add(pushDir.multiplyScalar(10));
}
```

**Recommendation**: Add after MVP - simple distance check is sufficient.

### D. Bounds Checking

**How it works**: Keep avatars within scene bounds.

```typescript
const SCENE_BOUNDS = {
  minX: -400, maxX: 400,
  minZ: -400, maxZ: 100 // Can't go behind camera
};

function clampToBounds(position: Vector3): Vector3 {
  return new Vector3(
    Math.max(SCENE_BOUNDS.minX, Math.min(SCENE_BOUNDS.maxX, position.x)),
    position.y,
    Math.max(SCENE_BOUNDS.minZ, Math.min(SCENE_BOUNDS.maxZ, position.z))
  );
}
```

**Recommendation**: **Include in MVP** - prevents avatars from disappearing.

---

## Camera System

### Current Camera

```typescript
// Scene3D.svelte
<T.PerspectiveCamera
  makeDefault
  position={cameraPosition}  // Default: [550, 450, 550]
  fov={65}
  near={1}
  far={6000}
>
  <OrbitControls
    enableDamping
    dampingFactor={0.05}
    minDistance={200}
    maxDistance={1500}
    target={cameraTarget}  // Default: [0, 0, 0]
  />
</T.PerspectiveCamera>
```

### A. Auto-Frame Both Avatars

**How it works**: Camera adjusts to keep both avatars in view.

```typescript
function calculateFramingCamera(avatar1: Vector3, avatar2: Vector3): CameraState {
  // Center point between avatars
  const center = new Vector3()
    .addVectors(avatar1, avatar2)
    .multiplyScalar(0.5);

  // Distance between avatars
  const distance = avatar1.distanceTo(avatar2);

  // Camera distance based on spread (with padding)
  const cameraDistance = Math.max(400, distance * 1.5 + 200);

  // Position camera at angle
  const cameraPos = new Vector3(
    center.x + cameraDistance * 0.6,
    center.y + cameraDistance * 0.4,
    center.z + cameraDistance * 0.6
  );

  return {
    position: [cameraPos.x, cameraPos.y, cameraPos.z],
    target: [center.x, center.y, center.z]
  };
}
```

**Pros**:
- Always sees both avatars
- Smooth viewing experience
- Works automatically

**Cons**:
- Can feel disconnected from user control
- May conflict with OrbitControls
- Zoom might be too wide

**Recommendation**: Implement as optional mode, not default.

### B. Auto-Zoom Based on Distance

```typescript
function calculateAutoZoom(avatar1: Vector3, avatar2: Vector3): number {
  const distance = avatar1.distanceTo(avatar2);

  // Map avatar distance to camera distance
  // Closer avatars = closer camera
  return mapRange(distance, 0, 500, 400, 1200);
}

// Apply to OrbitControls
controlsRef.minDistance = zoom * 0.8;
controlsRef.maxDistance = zoom * 1.5;
```

**Recommendation**: Good quality-of-life feature for v2.

### C. Smooth Follow Mode

**How it works**: Camera smoothly follows the active avatar.

```typescript
let cameraTargetGoal = $state(new Vector3());
let currentCameraTarget = $state(new Vector3());

useTask((delta) => {
  if (followMode) {
    // Goal is active avatar position
    cameraTargetGoal.copy(activeAvatarPosition);

    // Smooth interpolation
    currentCameraTarget.lerp(cameraTargetGoal, delta * 3);

    // Update OrbitControls target
    controlsRef.target.copy(currentCameraTarget);
  }
});
```

**Recommendation**: Nice for focused work on single avatar.

### D. Fixed Position with Manual Override

**How it works**: Camera stays at preset positions, user can orbit freely.

**Current behavior** - already implemented. OrbitControls let user move camera freely within bounds.

**Recommendation**: Keep as default, add auto-frame as optional mode.

---

## Key Technical Challenges

### 1. Upper-Body IK During Walk

**Challenge**: Arms must follow prop positions while legs walk.

**Solution**: Animation layer masking.
- Lower body: Mixamo walk animation (hips, legs, feet)
- Upper body: IK targets (existing system)
- Spine: Blend between both for natural torso twist

```typescript
// Masking approach
walkAction.setEffectiveWeight(1.0);

// After mixer update, override upper body with IK
const upperBodyBones = ['Spine', 'Spine1', 'Spine2', 'LeftShoulder', 'LeftArm', ...];
animationService.applyUpperBodyIK(upperBodyBones);
```

### 2. Sequence Playback While Moving

**Options**:

| Approach | Pros | Cons |
|----------|------|------|
| **Pause sequence while moving** | Simple, no sync issues | Breaks flow |
| **Continue sequence while moving** | Seamless | Complex blending |
| **Lock movement during beats** | Clear phases | Restrictive |
| **Queue movement for between beats** | Best of both | Complex state |

**Recommendation**: Start with "pause sequence while moving" for MVP.

### 3. Facing Direction

**Challenge**: Avatar needs to face movement direction.

```typescript
function updateFacingDirection(currentPos: Vector3, targetPos: Vector3, currentRotation: number): number {
  const direction = new Vector3().subVectors(targetPos, currentPos);
  const targetAngle = Math.atan2(direction.x, direction.z);

  // Smooth rotation
  return lerpAngle(currentRotation, targetAngle, 0.1);
}

// Apply to avatar group
<T.Group rotation.y={facingAngle}>
```

### 4. State Synchronization

**Challenge**: Position now needs to be reactive state, not just a prop.

```typescript
// Current (prop-based)
<Avatar3D positionX={150} />

// Needed (state-based)
<Avatar3D position={avatarState.position} />

// In avatar-instance-state.svelte.ts
let position = $state({ x: config.positionX, y: 0, z: FIGURE_Z });
let velocity = $state({ x: 0, z: 0 });
let moveTarget = $state<{ x: number, z: number } | null>(null);
```

---

## Recommendations

### MVP Implementation (v1)

1. **Input**: Click-to-move only
2. **Animation**: Simple lerp (no walk animation), avatar slides to position
3. **Physics**: Bounds checking only
4. **Camera**: Keep current (manual OrbitControls)
5. **Blending**: Pause sequence during movement

**Estimated complexity**: Low-Medium

### Production Implementation (v2)

1. **Input**: Click-to-move + basic WASD
2. **Animation**: Mixamo walk/idle with crossfade
3. **Physics**: Bounds + avatar-avatar collision
4. **Camera**: Auto-frame mode (optional)
5. **Blending**: Walk + upper body IK

**Estimated complexity**: Medium-High

### Future Considerations (v3+)

1. Virtual joystick for mobile
2. Waypoint path system for choreography
3. @threlte/rapier for object interaction
4. Foot IK for uneven terrain
5. Running/sprinting animations
6. Emote/gesture system

---

## Files That Would Change

| File | Changes |
|------|---------|
| `avatar-instance-state.svelte.ts` | Add position, velocity, moveTarget, movement methods |
| `Avatar3D.svelte` | Accept `position` as state, add facing rotation |
| `Viewer3DModule.svelte` | Wire up click handler, movement controls |
| `Scene3D.svelte` | Add invisible click plane for ground detection |
| `IAvatarAnimator.ts` | Add walk animation support, layer masking |
| (new) `locomotion/WalkController.svelte` | Encapsulate movement logic |
| (new) `locomotion/GroundPlane.svelte` | Click target for movement |

---

## Next Steps

1. Create `AVATAR_LOCOMOTION_MVP.md` with specific implementation steps
2. Create proof-of-concept `WalkController.svelte`
3. Test basic click-to-move with lerp (no animation)
4. Evaluate Mixamo integration if lerp feels good

---

## References

- [Threlte Documentation](https://threlte.xyz)
- [@threlte/rapier](https://threlte.xyz/docs/reference/rapier)
- [Three.js AnimationMixer](https://threejs.org/docs/#api/en/animation/AnimationMixer)
- [Mixamo](https://www.mixamo.com)
- [Three.js CCDIKSolver](https://threejs.org/docs/#examples/en/animations/CCDIKSolver)
