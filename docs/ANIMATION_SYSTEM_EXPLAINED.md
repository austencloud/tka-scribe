# Animation System - Complete Mental Model

## 🎯 Purpose

This document explains how the TKA animation system interprets your pictograph data (motion types, turns, rotation directions) and translates it into actual prop movement in absolute space.

---

## 📊 The Data Flow Pipeline

```
MotionData (Domain)
    ↓
EndpointCalculator (Calculate start/end angles)
    ↓
PropInterpolator (Interpolate between angles)
    ↓
AnimationStateManager (Update prop positions)
    ↓
Renderer (Draw props on canvas)
```

---

## 🔢 Core Concepts

### 1. **Angles in Absolute Space**

The animation system uses **radians** in absolute space:

- **NORTH** = 0 radians (0°)
- **EAST** = π/2 radians (90°)
- **SOUTH** = π radians (180°)
- **WEST** = 3π/2 radians (270°)

All calculations happen in this absolute coordinate system, regardless of grid mode (Diamond/Box).

### 2. **Two Types of Angles**

Each prop has TWO angles that define its position and orientation:

1. **centerPathAngle**: Where the prop's CENTER is located on the circle
   - This is the prop's POSITION in space
   - Interpolated during animation to move the prop

2. **staffRotationAngle**: How the prop itself is ROTATED
   - This is the prop's ORIENTATION
   - Determines which way the prop is pointing

---

## 🎭 Motion Type Calculations

### **PRO Motion** (Pronation)

**Concept**: The prop rotates in the SAME direction as it moves around the circle.

**Calculation** (`calculateProTargetAngle`):

```typescript
centerMovement = targetCenterAngle - startCenterAngle  // How far the center moves
dir = rotationDirection === CCW ? -1 : 1               // Direction multiplier
propRotation = dir * turns * 2π                        // Total prop rotation
staffMovement = -centerMovement                        // Staff moves opposite to center
targetStaffAngle = startStaffAngle + staffMovement + propRotation
```

**Key Insight**:

- `staffMovement = -centerMovement` means the staff COUNTERS the center movement
- This creates the "rolling" effect where the prop rotates as it moves
- The `-` sign is CRITICAL - without it, the prop would spin the wrong way

**Example**: PRO from NORTH to EAST with 1 turn CW

- Center moves: 0° → 90° (movement = +90°)
- Staff movement: -90° (counters the center movement)
- Prop rotation: +360° (1 full turn CW)
- Total staff rotation: -90° + 360° = +270°

---

### **ANTI Motion** (Anti-pronation)

**Concept**: The prop rotates in the OPPOSITE direction from its movement around the circle.

**Calculation** (`calculateAntispinTargetAngle`):

```typescript
centerMovement = targetCenterAngle - startCenterAngle
dir = rotationDirection === CCW ? -1 : 1
propRotation = dir * turns * 2π
staffMovement = centerMovement  // NOTE: POSITIVE (not negative like PRO)
targetStaffAngle = startStaffAngle + staffMovement + propRotation
```

**Key Difference from PRO**:

- `staffMovement = centerMovement` (POSITIVE, not negative)
- This makes the prop rotate in the SAME direction as the center movement
- Combined with the prop rotation, this creates the anti-spin effect

**Example**: ANTI from NORTH to EAST with 1 turn CW

- Center moves: 0° → 90° (movement = +90°)
- Staff movement: +90° (same as center movement)
- Prop rotation: +360° (1 full turn CW)
- Total staff rotation: +90° + 360° = +450° = 90° (normalized)

---

### **DASH Motion**

**Concept**: The prop moves in a STRAIGHT LINE through the center (not around the circle).

**Center Path Calculation** (NEW - Fixed in PropInterpolator):

```typescript
// Convert angles to Cartesian coordinates
((startX = cos(startAngle)), (startY = sin(startAngle)));
((endX = cos(endAngle)), (endY = sin(endAngle)));

// Linear interpolation in Cartesian space
interpX = lerp(startX, endX, t);
interpY = lerp(startY, endY, t);

// Convert back to angle
centerPathAngle = atan2(interpY, interpX);
```

**Staff Rotation Calculation** (`calculateDashTargetAngle`):

```typescript
if (endOrientation === IN):
    targetStaffAngle = targetCenterAngle + π  // Point inward
else if (endOrientation === OUT):
    targetStaffAngle = targetCenterAngle      // Point outward
else:
    targetStaffAngle = startStaffAngle        // Keep current angle
```

**Key Insight**:

- DASH uses **Cartesian interpolation** for center path (straight line)
- Other motions use **angular interpolation** (rotation around circle)
- This is the critical difference that makes dashes work correctly

---

### **STATIC Motion**

**Concept**: The prop stays in the same location but may change orientation.

**Calculation** (`calculateStaticStaffAngle`):

```typescript
endOriAngle = mapOrientationToAngle(endOrientation, targetCenterAngle)
angleDiff = endOriAngle - startStaffAngle

if (abs(angleDiff) > 0.1):
    targetStaffAngle = endOriAngle
else:
    targetStaffAngle = startStaffAngle  // No change if difference is tiny
```

**Key Insight**:

- Center position doesn't change
- Only the staff rotation changes to match the end orientation

---

### **FLOAT Motion**

**Concept**: The prop moves around the circle without rotating.

**Calculation** (`calculateFloatStaffAngle`):

```typescript
targetStaffAngle = startStaffAngle; // Staff angle never changes
```

**Key Insight**:

- Center path is interpolated normally (angular)
- Staff rotation stays constant throughout the motion

---

## 🔄 Rotation Direction Interpretation

### **How Rotation Direction Works**

The `rotationDirection` field in MotionData determines which way the prop spins:

```typescript
dir = rotationDirection === COUNTER_CLOCKWISE ? -1 : 1
propRotation = dir * turns * 2π
```

**CLOCKWISE** (CW):

- `dir = +1`
- Positive rotation values
- Prop spins clockwise when viewed from above

**COUNTER_CLOCKWISE** (CCW):

- `dir = -1`
- Negative rotation values
- Prop spins counter-clockwise when viewed from above

---

## 🐛 Common Issues & Debugging

### **Issue: Pro motion animates like Anti (or vice versa)**

**Likely Cause**: The `rotationDirection` in MotionData is incorrect.

**How to Debug**:

1. Check the MotionData for the beat: `motionData.rotationDirection`
2. Verify it matches your expectation (CW vs CCW)
3. Check where rotationDirection is SET in your code (likely in sequence construction)

**Root Cause**: The difference between PRO and ANTI is the SIGN of `staffMovement`:

- PRO: `staffMovement = -centerMovement` (negative)
- ANTI: `staffMovement = centerMovement` (positive)

If the rotation direction is wrong, the `propRotation` term will have the wrong sign, making PRO look like ANTI.

---

### **Issue: Dash goes around the circle instead of through center**

**Status**: ✅ FIXED in this update

**What Was Wrong**: Used `lerpAngle()` for all motions, which finds the shortest angular path.

**What's Fixed**: Now uses `lerpAngleCartesian()` for DASH motions, which interpolates in Cartesian space (straight line).

---

## 📐 Mathematical Reference

### **Angle Normalization**

```typescript
normalizeAnglePositive(angle):
    // Returns angle in range [0, 2π)
    norm = angle % 2π
    return norm < 0 ? norm + 2π : norm

normalizeAngleSigned(angle):
    // Returns angle in range (-π, π]
    norm = normalizeAnglePositive(angle)
    return norm > π ? norm - 2π : norm
```

### **Orientation Mapping**

```typescript
mapOrientationToAngle(orientation, centerPathAngle):
    IN:      centerPathAngle + π      // Point toward center
    OUT:     centerPathAngle          // Point away from center
    CLOCK:   centerPathAngle + π/2    // Point clockwise
    COUNTER: centerPathAngle - π/2    // Point counter-clockwise
```

---

## 🎬 Animation Interpolation

### **Angular Interpolation** (Used for most motions)

```typescript
lerpAngle(startAngle, endAngle, t):
    // Find shortest angular distance
    diff = normalizeAngleSigned(endAngle - startAngle)
    // Interpolate along that path
    return normalizeAnglePositive(startAngle + diff * t)
```

**When Used**: PRO, ANTI, STATIC, FLOAT (for center path)

---

### **Cartesian Interpolation** (Used for DASH)

```typescript
lerpAngleCartesian(startAngle, endAngle, t):
    // Convert to Cartesian
    startX = cos(startAngle), startY = sin(startAngle)
    endX = cos(endAngle), endY = sin(endAngle)

    // Linear interpolation
    interpX = lerp(startX, endX, t)
    interpY = lerp(startY, endY, t)

    // Convert back to angle
    return normalizeAnglePositive(atan2(interpY, interpX))
```

**When Used**: DASH motions (for center path only)

---

## 🔍 Where to Look in Code

### **Motion Type Calculations**

- **File**: `src/lib/modules/build/animate/services/implementations/MotionCalculator.ts`
- **Functions**: `calculateProTargetAngle`, `calculateAntispinTargetAngle`, `calculateDashTargetAngle`, etc.

### **Interpolation Logic**

- **File**: `src/lib/modules/build/animate/services/implementations/PropInterpolator.ts`
- **Function**: `interpolatePropAngles` - This is where motion type determines interpolation strategy

### **Angle Utilities**

- **File**: `src/lib/modules/build/animate/services/implementations/AngleCalculator.ts`
- **Functions**: `lerpAngle`, `lerpAngleCartesian`, `normalizeAnglePositive`, etc.

### **Endpoint Calculation**

- **File**: `src/lib/modules/build/animate/services/implementations/EndpointCalculator.ts`
- **Function**: `calculateMotionEndpoints` - Converts MotionData to start/end angles

---

## 💡 Key Takeaways

1. **Two Angles**: Every prop has a center position angle AND a staff rotation angle
2. **PRO vs ANTI**: The difference is the SIGN of staffMovement (-centerMovement vs +centerMovement)
3. **DASH is Special**: Uses Cartesian interpolation instead of angular interpolation
4. **Rotation Direction**: Multiplies the turns by +1 (CW) or -1 (CCW)
5. **Absolute Space**: All calculations happen in absolute radians, not relative to grid mode

---

**Last Updated**: 2025-01-19  
**Author**: Austen Cloud + AI Assistant  
**Status**: Dash motion fix implemented ✅
