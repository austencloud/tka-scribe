// Simple test to verify MotionQueryHandler structure
const fs = require("fs");

const content = fs.readFileSync(
  "src/lib/services/implementations/data/MotionQueryHandler.ts",
  "utf8"
);

// Check if only the expected method is present
const methods = [
  "findPictographByMotionParams",
  "findPictographsByLetter",
  "findPictographsByMotionType",
  "findPictographsByStartLocation",
  "findPictographsByEndLocation",
  "findPictographsByGridMode",
  "getAllPictographs",
  "getAvailableMotionTypes",
  "getAvailableStartLocations",
  "getAvailableEndLocations",
  "getAvailableLetters",
];

const remainingMethods = methods.filter((method) => content.includes(method));
const hasOnlyExpectedMethod = content.includes("getNextOptionsForSequence");

console.log("✅ Expected method present:", hasOnlyExpectedMethod);
console.log("❌ Unexpected methods remaining:", remainingMethods);
console.log("Total lines reduced from 428 to:", content.split("\n").length);

if (remainingMethods.length === 0 && hasOnlyExpectedMethod) {
  console.log("🎉 SUCCESS: MotionQueryHandler successfully cleaned up!");
} else {
  console.log("⚠️  Some cleanup may still be needed");
}
