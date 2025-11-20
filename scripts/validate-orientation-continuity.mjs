/**
 * Orientation Continuity Validator
 *
 * Checks that orientations flow correctly from beat to beat:
 * - Beat N's end orientation should match Beat N+1's start orientation
 */

import LZString from "lz-string";

const DEFAULT_TEST_URL =
  "http://localhost:5173/?open=generate:z:M4e1EtwDwBmAuAdiZlbAD6gtOSQCmAhuANYCuAjAHQCsRWIA7geCOTEfMaKSFADMANhhbEQFGHQAm8UMhDtK0jMRalwHGfnFKGLFmjw9FAFyp19BVO05zmBU9GEZkoCVtqyxJTcsbIGp6yJpBUDMiouAighhQ09K6EJLZcLIH8LmoEHlJe+O5KKj5BebKxOXqqRMRGCOlmFomhqTpEToIi8oqS2tlh-m4SmmXwDQNEQA";

const testUrl = process.argv[2] || DEFAULT_TEST_URL;

// Decode mappings
const ORIENTATION_DECODE = {
  i: "IN",
  o: "OUT",
  k: "CLOCK",
  t: "COUNTER",
};

function parseURL(url) {
  const urlObj = new URL(url);
  const openParam = urlObj.searchParams.get("open");
  if (!openParam) throw new Error("No 'open' parameter found");

  const parts = openParam.split(":");
  const module = parts[0];
  const isCompressed = parts[1] === "z";
  const encoded = isCompressed
    ? parts.slice(2).join(":")
    : parts.slice(1).join(":");

  return { module, encoded, compressed: isCompressed };
}

function parseMotion(motionStr) {
  if (!motionStr || motionStr.length < 9) return null;

  let pos = 0;
  const startLoc = motionStr.substring(pos, pos + 2);
  pos += 2;
  const endLoc = motionStr.substring(pos, pos + 2);
  pos += 2;
  const startOri = motionStr.substring(pos, pos + 1);
  pos += 1;
  const endOri = motionStr.substring(pos, pos + 1);

  return {
    startLocation: startLoc,
    endLocation: endLoc,
    startOrientation: ORIENTATION_DECODE[startOri] || startOri,
    endOrientation: ORIENTATION_DECODE[endOri] || endOri,
    raw: motionStr,
  };
}

function validateOrientationContinuity() {
  console.log("═".repeat(80));
  console.log("ORIENTATION CONTINUITY VALIDATION");
  console.log("═".repeat(80));
  console.log();

  const { encoded, compressed } = parseURL(testUrl);

  let decodedString = encoded;
  if (compressed) {
    decodedString = LZString.decompressFromEncodedURIComponent(encoded);
  }

  const parts = decodedString.split("|");
  const startPositionStr = parts[0];
  const beatStrings = parts.slice(1);

  // Parse all beats
  const allPictographs = [
    { type: "START", str: startPositionStr },
    ...beatStrings.map((str, i) => ({ type: `BEAT ${i + 1}`, str })),
  ];

  const parsedData = allPictographs.map(({ type, str }) => {
    const [blueStr, redStr] = str.split(":");
    return {
      type,
      blue: parseMotion(blueStr),
      red: parseMotion(redStr),
    };
  });

  // Validate continuity
  const errors = [];
  const warnings = [];

  for (let i = 0; i < parsedData.length - 1; i++) {
    const current = parsedData[i];
    const next = parsedData[i + 1];

    // Check blue continuity
    if (current.blue.endOrientation !== next.blue.startOrientation) {
      errors.push({
        from: current.type,
        to: next.type,
        color: "BLUE",
        issue: `End orientation ${current.blue.endOrientation} → Start orientation ${next.blue.startOrientation}`,
        currentEnd: current.blue.endOrientation,
        nextStart: next.blue.startOrientation,
      });
    }

    // Check red continuity
    if (current.red.endOrientation !== next.red.startOrientation) {
      errors.push({
        from: current.type,
        to: next.type,
        color: "RED",
        issue: `End orientation ${current.red.endOrientation} → Start orientation ${next.red.startOrientation}`,
        currentEnd: current.red.endOrientation,
        nextStart: next.red.startOrientation,
      });
    }

    // Check location continuity
    if (current.blue.endLocation !== next.blue.startLocation) {
      warnings.push({
        from: current.type,
        to: next.type,
        color: "BLUE",
        issue: `End location ${current.blue.endLocation} → Start location ${next.blue.startLocation}`,
      });
    }

    if (current.red.endLocation !== next.red.startLocation) {
      warnings.push({
        from: current.type,
        to: next.type,
        color: "RED",
        issue: `End location ${current.red.endLocation} → Start location ${next.red.startLocation}`,
      });
    }
  }

  // Display results
  console.log(`Total Transitions: ${parsedData.length - 1}`);
  console.log(`Orientation Errors: ${errors.length}`);
  console.log(`Location Warnings: ${warnings.length}`);
  console.log();

  if (errors.length === 0) {
    console.log("✅ ALL ORIENTATION TRANSITIONS ARE CORRECT!");
    console.log();
    console.log(
      "Every beat's end orientation matches the next beat's start orientation."
    );
    console.log(
      "The sequence will display correctly with smooth orientation transitions."
    );
  } else {
    console.log("❌ ORIENTATION CONTINUITY ISSUES FOUND:");
    console.log();
    for (const error of errors) {
      console.log(`  ${error.from} → ${error.to} (${error.color}):`);
      console.log(`    ${error.issue}`);
      console.log(`    Expected: ${error.currentEnd} → ${error.currentEnd}`);
      console.log(`    Actual:   ${error.currentEnd} → ${error.nextStart}`);
      console.log();
    }
  }

  if (warnings.length > 0) {
    console.log("⚠️  LOCATION CONTINUITY WARNINGS:");
    console.log(
      "(Note: Location jumps are allowed in some motion types like FLOAT)"
    );
    console.log();
    for (const warning of warnings) {
      console.log(`  ${warning.from} → ${warning.to} (${warning.color}):`);
      console.log(`    ${warning.issue}`);
      console.log();
    }
  }

  console.log("═".repeat(80));
  console.log("DETAILED BEAT-BY-BEAT ANALYSIS:");
  console.log("═".repeat(80));
  console.log();

  for (let i = 0; i < parsedData.length; i++) {
    const beat = parsedData[i];
    console.log(`${beat.type}:`);
    console.log(
      `  Blue:  ${beat.blue.startOrientation} → ${beat.blue.endOrientation}`
    );
    console.log(
      `  Red:   ${beat.red.startOrientation} → ${beat.red.endOrientation}`
    );

    if (i < parsedData.length - 1) {
      const next = parsedData[i + 1];
      const blueMatch =
        beat.blue.endOrientation === next.blue.startOrientation ? "✅" : "❌";
      const redMatch =
        beat.red.endOrientation === next.red.startOrientation ? "✅" : "❌";
      console.log(`  Continuity: Blue ${blueMatch}  Red ${redMatch}`);
    }
    console.log();
  }

  console.log("═".repeat(80));

  return {
    totalTransitions: parsedData.length - 1,
    orientationErrors: errors.length,
    locationWarnings: warnings.length,
    success: errors.length === 0,
  };
}

const result = validateOrientationContinuity();
process.exit(result.success ? 0 : 1);
