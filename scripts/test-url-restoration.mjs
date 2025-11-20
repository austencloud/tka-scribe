/**
 * URL Restoration Test Script
 *
 * Tests sequence restoration from URLs by importing the encode/decode utilities
 * and comparing the results.
 *
 * Usage:
 *   node scripts/test-url-restoration.mjs
 *   node scripts/test-url-restoration.mjs <url>
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import LZString from "lz-string";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test URL from the user
const DEFAULT_TEST_URL =
  "http://localhost:5173/?open=generate:z:M4e1EtwDwBmAuAdiZlbAD6gtOSQCmAhuANYCuAjAHQCsRWIA7geCOTEfMaKSFADMANhhbEQFGHQAm8UMhDtK0jMRalwHGfnFKGLFmjw9FAFyp19BVO05zmBU9GEZkoCVtqyxJTcsbIGp6yJpBUDMiouAighhQ09K6EJLZcLIH8LmoEHlJe+O5KKj5BebKxOXqqRMRGCOlmFomhqTpEToIi8oqS2tlh-m4SmmXwDQNEQA";

// Get URL from command line or use default
const testUrl = process.argv[2] || DEFAULT_TEST_URL;

console.log("╔" + "═".repeat(78) + "╗");
console.log("║" + " ".repeat(22) + "URL RESTORATION TEST" + " ".repeat(34) + "║");
console.log("╚" + "═".repeat(78) + "╝");
console.log();

console.log("Testing URL:");
console.log(testUrl);
console.log();

/**
 * Parse URL to extract the encoded sequence
 */
function parseURL(url) {
  try {
    const urlObj = new URL(url);
    const openParam = urlObj.searchParams.get("open");

    if (!openParam) {
      throw new Error("No 'open' parameter found in URL");
    }

    // Format: module:encoded or module:z:compressed
    const parts = openParam.split(":");
    if (parts.length < 2) {
      throw new Error(`Invalid open parameter format: ${openParam}`);
    }

    const module = parts[0];
    const isCompressed = parts[1] === "z";
    const encoded = isCompressed ? parts.slice(2).join(":") : parts.slice(1).join(":");

    return {
      module,
      encoded,
      compressed: isCompressed,
    };
  } catch (error) {
    console.error("❌ Failed to parse URL:", error.message);
    process.exit(1);
  }
}

/**
 * LZ-String decompression
 */
function decompressFromEncodedURIComponent(compressed) {
  console.log("📦 Compressed data length:", compressed.length);
  console.log("📦 Compressed data (first 100 chars):", compressed.substring(0, 100));

  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
    if (!decompressed) {
      throw new Error("Decompression returned null");
    }
    console.log("✅ Decompression successful!");
    console.log("📦 Decompressed data length:", decompressed.length);
    return decompressed;
  } catch (e) {
    console.error("❌ Decompression failed:", e.message);
    return null;
  }
}

/**
 * Decode the sequence data
 */
function decodeSequence(encoded, compressed) {
  if (compressed) {
    console.log("📦 Attempting to decompress...");
    const decompressed = decompressFromEncodedURIComponent(encoded);
    if (!decompressed) {
      console.log("⚠️  Cannot decompress without lz-string package");
      console.log("📋 Encoded (compressed) data:");
      console.log("   Length:", encoded.length);
      console.log("   First 200 chars:", encoded.substring(0, 200));
      return null;
    }
    encoded = decompressed;
  }

  console.log("📋 Encoded sequence:");
  console.log("   Length:", encoded.length);
  console.log("   Data:", encoded);
  console.log();

  // Parse the encoded format: "startPosition|beat1|beat2|..."
  const parts = encoded.split("|");
  const startPositionStr = parts[0];
  const beatStrings = parts.slice(1);

  console.log("📊 Found:");
  console.log(`   📍 Start Position: 1`);
  console.log(`   🎵 Sequence Beats: ${beatStrings.length}`);
  console.log(`   📦 Total Parts: ${parts.length} (start position + ${beatStrings.length} beats)`);
  console.log();

  const parsedData = {
    startPosition: null,
    beats: [],
  };

  // Parse start position
  console.log("📍 Start Position:", startPositionStr);
  const [startBlueStr, startRedStr] = startPositionStr.split(":");
  if (startBlueStr && startRedStr) {
    parsedData.startPosition = {
      blue: parseMotion(startBlueStr),
      red: parseMotion(startRedStr),
    };
  } else {
    console.log(`  ⚠️ Invalid start position format: ${startPositionStr}`);
  }

  console.log();

  // Parse actual beats
  for (let i = 0; i < beatStrings.length; i++) {
    const beatStr = beatStrings[i];
    console.log(`Beat ${i + 1}:`, beatStr);

    // Each beat: "blueMotion:redMotion"
    const [blueStr, redStr] = beatStr.split(":");

    if (blueStr && redStr) {
      parsedData.beats.push({
        beatNumber: i + 1,
        blue: parseMotion(blueStr),
        red: parseMotion(redStr),
      });
    } else {
      console.log(`  ⚠️ Invalid beat format: ${beatStr}`);
    }
  }

  return parsedData;
}

/**
 * Parse a single motion string
 * Format: startLoc(2) + endLoc(2) + startOri(1) + endOri(1) + rotDir(1) + turns(1+) + type(1)
 */
function parseMotion(motionStr) {
  if (!motionStr || motionStr.length < 9) {
    return null;
  }

  // Location codes (2 chars each)
  const locationCodes = {
    no: "NORTH",
    ea: "EAST",
    so: "SOUTH",
    we: "WEST",
    ne: "NORTHEAST",
    se: "SOUTHEAST",
    sw: "SOUTHWEST",
    nw: "NORTHWEST",
  };

  // Orientation codes (1 char)
  const orientationCodes = {
    i: "IN",
    o: "OUT",
    k: "CLOCK",
    t: "COUNTER",
  };

  // Rotation codes (1 char)
  const rotationCodes = {
    c: "CLOCKWISE",
    u: "COUNTER_CLOCKWISE",
    x: "NO_ROTATION",
  };

  // Motion type codes (1 char)
  const motionTypeCodes = {
    p: "PRO",
    a: "ANTI",
    l: "FLOAT",
    d: "DASH",
    s: "STATIC",
  };

  let pos = 0;

  // Parse start location (2 chars)
  const startLoc = motionStr.substring(pos, pos + 2);
  pos += 2;

  // Parse end location (2 chars)
  const endLoc = motionStr.substring(pos, pos + 2);
  pos += 2;

  // Parse start orientation (1 char)
  const startOri = motionStr.substring(pos, pos + 1);
  pos += 1;

  // Parse end orientation (1 char)
  const endOri = motionStr.substring(pos, pos + 1);
  pos += 1;

  // Parse rotation direction (1 char)
  const rotDir = motionStr.substring(pos, pos + 1);
  pos += 1;

  // Parse turns (variable length, ends at last char which is motion type)
  const turns = motionStr.substring(pos, motionStr.length - 1);
  const turnsNum = turns === "f" ? "FLOAT" : parseInt(turns, 10);

  // Parse motion type (1 char, last char)
  const motionType = motionStr.substring(motionStr.length - 1);

  return {
    startLocation: locationCodes[startLoc] || startLoc,
    endLocation: locationCodes[endLoc] || endLoc,
    startOrientation: orientationCodes[startOri] || startOri,
    endOrientation: orientationCodes[endOri] || endOri,
    rotationDirection: rotationCodes[rotDir] || rotDir,
    turns: turnsNum,
    motionType: motionTypeCodes[motionType] || motionType,
    raw: motionStr,
  };
}

/**
 * Main test function
 */
function testURLRestoration() {
  console.log("🧪 Parsing URL...");
  console.log();

  const { module, encoded, compressed } = parseURL(testUrl);

  console.log("✅ URL parsed successfully:");
  console.log(`   Module: ${module}`);
  console.log(`   Compressed: ${compressed}`);
  console.log(`   Encoded length: ${encoded.length} chars`);
  console.log();

  console.log("🧪 Decoding sequence...");
  console.log();

  const sequenceData = decodeSequence(encoded, compressed);

  if (!sequenceData) {
    console.log();
    console.log("═".repeat(80));
    console.log("❌ DECOMPRESSION FAILED");
    console.log("═".repeat(80));
    console.log();
    console.log("To fully test this URL, you need to:");
    console.log("  1. Install lz-string: npm install lz-string");
    console.log("  2. Run the test again");
    console.log();
    console.log("Alternatively, test using the browser-based tools:");
    console.log("  1. Open the app: npm run dev");
    console.log("  2. Open browser console");
    console.log("  3. Run: window.__parseDeepLink('" + testUrl + "')");
    console.log();
    return;
  }

  console.log();
  console.log("═".repeat(80));
  console.log("✅ SEQUENCE DECODED SUCCESSFULLY");
  console.log("═".repeat(80));
  console.log();

  // Display start position
  console.log("📍 START POSITION:");
  console.log("  Blue Motion:");
  console.log(`    Type: ${sequenceData.startPosition?.blue?.motionType}`);
  console.log(`    Path: ${sequenceData.startPosition?.blue?.startLocation} → ${sequenceData.startPosition?.blue?.endLocation}`);
  console.log(
    `    Orientations: ${sequenceData.startPosition?.blue?.startOrientation} → ${sequenceData.startPosition?.blue?.endOrientation}`
  );
  console.log(`    Rotation: ${sequenceData.startPosition?.blue?.rotationDirection}, Turns: ${sequenceData.startPosition?.blue?.turns}`);
  console.log("  Red Motion:");
  console.log(`    Type: ${sequenceData.startPosition?.red?.motionType}`);
  console.log(`    Path: ${sequenceData.startPosition?.red?.startLocation} → ${sequenceData.startPosition?.red?.endLocation}`);
  console.log(
    `    Orientations: ${sequenceData.startPosition?.red?.startOrientation} → ${sequenceData.startPosition?.red?.endOrientation}`
  );
  console.log(`    Rotation: ${sequenceData.startPosition?.red?.rotationDirection}, Turns: ${sequenceData.startPosition?.red?.turns}`);
  console.log();

  // Display sequence beats
  console.log(`🎵 SEQUENCE BEATS (${sequenceData.beats.length}):`);
  console.log();

  for (const beat of sequenceData.beats) {
    console.log(`Beat ${beat.beatNumber}:`);
    console.log("  Blue Motion:");
    console.log(`    Type: ${beat.blue?.motionType}`);
    console.log(`    Path: ${beat.blue?.startLocation} → ${beat.blue?.endLocation}`);
    console.log(
      `    Orientations: ${beat.blue?.startOrientation} → ${beat.blue?.endOrientation}`
    );
    console.log(`    Rotation: ${beat.blue?.rotationDirection}, Turns: ${beat.blue?.turns}`);
    console.log("  Red Motion:");
    console.log(`    Type: ${beat.red?.motionType}`);
    console.log(`    Path: ${beat.red?.startLocation} → ${beat.red?.endLocation}`);
    console.log(
      `    Orientations: ${beat.red?.startOrientation} → ${beat.red?.endOrientation}`
    );
    console.log(`    Rotation: ${beat.red?.rotationDirection}, Turns: ${beat.red?.turns}`);
    console.log();
  }

  console.log("═".repeat(80));
  console.log("NEXT STEPS:");
  console.log("═".repeat(80));
  console.log();
  console.log("To verify orientation calculations are correct:");
  console.log("  1. Load this URL in the browser");
  console.log("  2. Compare the displayed sequence with the decoded data above");
  console.log("  3. Check that orientations match at each beat transition");
  console.log();
  console.log("For automated testing of 25 sequences:");
  console.log("  1. Use the browser-based tester:");
  console.log("     window.__sequenceRestorationTester.testMultiple(sequences)");
  console.log("  2. Or run the Playwright test:");
  console.log("     npm run test -- sequence-restoration");
  console.log();
}

// Run the test
testURLRestoration();
