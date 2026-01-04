/**
 * Quick test script for user proportions calculations
 * Run with: node scripts/test-proportions.js
 */

// Constants from the codebase
const CM_TO_UNITS = 2;
const INCHES_TO_CM = 2.54;
const BASE_MODEL_HEIGHT_CM = 188;
const SHOULDER_HEIGHT_RATIO = 0.82;
const HAND_RADIUS_STAFF_RATIO = 0.6;
const STAFF_DIAMETER_CM = 2.5;

function feetInchesToCm(feet, inches = 0) {
  return (feet * 12 + inches) * INCHES_TO_CM;
}

function inchesToCm(inches) {
  return inches * INCHES_TO_CM;
}

function calculateSceneDimensions(heightCm, staffLengthCm) {
  // Avatar scale relative to base model
  const avatarScale = heightCm / BASE_MODEL_HEIGHT_CM;

  // Staff in scene units
  const staffLength = staffLengthCm * CM_TO_UNITS;
  const staffRadius = (STAFF_DIAMETER_CM / 2) * CM_TO_UNITS;

  // Hand point radius is staff-based (not height-based)
  const handPointRadius = staffLength * HAND_RADIUS_STAFF_RATIO;

  // Outer point = hand + half staff
  const outerPointRadius = handPointRadius + staffLength / 2;

  // Grid size (staff-only)
  const gridSize = staffLength + 50;

  // Ground Y position
  const shoulderHeightCm = heightCm * SHOULDER_HEIGHT_RATIO;
  const groundY = -(shoulderHeightCm * CM_TO_UNITS);

  return {
    avatarScale,
    staffLength,
    staffRadius,
    handPointRadius,
    outerPointRadius,
    gridSize,
    groundY,
  };
}

// Test heights
const testHeights = [
  { label: "5'0\"", feet: 5, inches: 0 },
  { label: "5'6\"", feet: 5, inches: 6 },
  { label: "6'0\"", feet: 6, inches: 0 },
  { label: "6'3\"", feet: 6, inches: 3 },
  { label: "6'6\"", feet: 6, inches: 6 },
];

const standardStaffCm = inchesToCm(34);

console.log("=== User Proportions Test ===\n");
console.log(`Staff length: 34" (${standardStaffCm.toFixed(1)}cm)`);
console.log(`Base model height: ${BASE_MODEL_HEIGHT_CM}cm`);
console.log(`Shoulder height ratio: ${SHOULDER_HEIGHT_RATIO}`);
console.log(`CM_TO_UNITS: ${CM_TO_UNITS}`);
console.log("");

console.log("=== Height-dependent values ===\n");
console.log(
  "Height        | HeightCm | avatarScale | groundY    | targetHeight"
);
console.log(
  "------------- | -------- | ----------- | ---------- | ------------"
);

for (const { label, feet, inches } of testHeights) {
  const heightCm = feetInchesToCm(feet, inches);
  const result = calculateSceneDimensions(heightCm, standardStaffCm);
  const targetHeight = heightCm * CM_TO_UNITS; // What gets passed to setHeight()

  console.log(
    `${label.padEnd(13)} | ${heightCm.toFixed(1).padStart(8)} | ${result.avatarScale.toFixed(4).padStart(11)} | ${result.groundY.toFixed(1).padStart(10)} | ${targetHeight.toFixed(1).padStart(12)}`
  );
}

console.log("\n=== Staff-dependent values (should be constant) ===\n");
const result = calculateSceneDimensions(feetInchesToCm(6, 3), standardStaffCm);
console.log(`Staff length in units: ${result.staffLength.toFixed(1)}`);
console.log(`Grid size: ${result.gridSize.toFixed(1)}`);
console.log(`Hand point radius: ${result.handPointRadius.toFixed(1)}`);
console.log(`Outer point radius: ${result.outerPointRadius.toFixed(1)}`);

console.log("\n=== 1-inch increments around 6'0\" ===\n");
console.log("Height | HeightCm | groundY    | Delta from prev");
console.log("------ | -------- | ---------- | ---------------");

let prevGroundY = null;
for (let i = -3; i <= 3; i++) {
  const heightInches = 72 + i; // 6'0" = 72 inches
  const heightCm = heightInches * INCHES_TO_CM;
  const result = calculateSceneDimensions(heightCm, standardStaffCm);

  const feet = Math.floor(heightInches / 12);
  const inches = heightInches % 12;
  const label = `${feet}'${inches}"`;

  const delta =
    prevGroundY !== null ? (result.groundY - prevGroundY).toFixed(2) : "N/A";
  prevGroundY = result.groundY;

  console.log(
    `${label.padEnd(6)} | ${heightCm.toFixed(1).padStart(8)} | ${result.groundY.toFixed(2).padStart(10)} | ${delta.toString().padStart(15)}`
  );
}

console.log("\n=== What setHeight receives vs what scale should be ===\n");
console.log(
  "The setHeight() method receives targetHeight and divides by originalHeight (model bounding box)"
);
console.log(
  "If the model's bounding box is X units tall, scale = targetHeight / X\n"
);

console.log("Height | targetHeight | If bbox=2  | If bbox=100 | If bbox=188");
console.log("------ | ------------ | ---------- | ----------- | -----------");

for (const { label, feet, inches } of testHeights) {
  const heightCm = feetInchesToCm(feet, inches);
  const targetHeight = heightCm * CM_TO_UNITS;

  console.log(
    `${label.padEnd(6)} | ${targetHeight.toFixed(1).padStart(12)} | ${(targetHeight / 2).toFixed(1).padStart(10)} | ${(targetHeight / 100).toFixed(3).padStart(11)} | ${(targetHeight / 188).toFixed(4).padStart(11)}`
  );
}

console.log("\n=== The key insight ===");
console.log(
  "If the model's bounding box is ~2 units (typical normalized GLTF),"
);
console.log("then a 6'3\" person (190.5cm) would have scale = 381/2 = 190.5x");
console.log(
  "This makes the model 190.5 * 2 = 381 units tall, which is CORRECT."
);
console.log("");
console.log(
  "The issue might be that groundY changes significantly with height:"
);
const groundY_5ft = calculateSceneDimensions(
  feetInchesToCm(5, 0),
  standardStaffCm
).groundY;
const groundY_6ft6 = calculateSceneDimensions(
  feetInchesToCm(6, 6),
  standardStaffCm
).groundY;
console.log(`  groundY at 5'0": ${groundY_5ft.toFixed(1)}`);
console.log(`  groundY at 6'6": ${groundY_6ft6.toFixed(1)}`);
console.log(`  Difference: ${(groundY_6ft6 - groundY_5ft).toFixed(1)} units`);
console.log("");
console.log(
  "That's a ~62 unit difference in Y position for a 18-inch height change."
);
console.log(
  "If the avatar AND ground both move together, this should be fine."
);
console.log("But if only the avatar moves, it would appear to 'jump'.");
