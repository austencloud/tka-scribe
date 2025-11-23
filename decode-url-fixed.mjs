import LZString from "lz-string";

const url = "http://localhost:5173/?open=generate:z:M4e1EtwDwBmAuAdiZlbAD6leArgRgBMkwRwAXAYyI2QFMBDcAawIfmxHJGsI0eTNyBAA4kA7nS6UYDWiEblh+dpMncZmRuuXxtdZuGPJJ4EKPiSIR2SbrIQzy6FBbTXlQXwJiTgpjUEkuNhJQDRo3LlZ8MVADKk8YmzT2RkUeOC9GZjTia0NjRkC-VToyuxpMhjIXATIPOVqyC3ZkQTs4IA";

const params = new URLSearchParams(url.split("?")[1]);
const openParam = params.get("open");
const parts = openParam.split(":");
const module = parts[0];
let compressed = parts.slice(2).join(":");

console.log("Original compressed data:");
console.log(compressed);
console.log("\nFound space at position 84");
console.log("Replacing space with '+'...\n");

// Fix the space issue - replace spaces with +
compressed = compressed.replace(/ /g, '+');

console.log("Fixed compressed data:");
console.log(compressed);
console.log("\n" + "=".repeat(80));
console.log("Attempting decompression...");
console.log("=".repeat(80));

const decompressed = LZString.decompressFromEncodedURIComponent(compressed);

if (decompressed) {
  console.log("✅ SUCCESS!");
  console.log("Decompressed length:", decompressed.length);
  console.log("\n" + "=".repeat(80));
  console.log("DECODED SEQUENCE:");
  console.log("=".repeat(80));
  console.log(decompressed);
  console.log("\n" + "=".repeat(80));

  const beatParts = decompressed.split("|");
  console.log(`\nStructure:`);
  console.log(`  Total parts: ${beatParts.length}`);
  console.log(`  Start Position: 1`);
  console.log(`  Sequence Beats: ${beatParts.length - 1}`);

  console.log("\n" + "=".repeat(80));
  console.log("START POSITION (Beat 0):");
  console.log("=".repeat(80));
  const startPos = beatParts[0].split(":");
  console.log("  Blue motion:", startPos[0]);
  console.log("  Red motion:", startPos[1]);

  if (beatParts.length > 1) {
    console.log("\n" + "=".repeat(80));
    console.log("SEQUENCE BEATS:");
    console.log("=".repeat(80));
    for (let i = 1; i < beatParts.length; i++) {
      const motions = beatParts[i].split(":");
      console.log(`\nBeat ${i}:`);
      console.log(`  Blue: ${motions[0]}`);
      console.log(`  Red:  ${motions[1]}`);
    }
  }

  // Decode a motion to show what the data means
  console.log("\n" + "=".repeat(80));
  console.log("DECODING START POSITION BLUE MOTION:");
  console.log("=".repeat(80));

  const motion = startPos[0];
  if (motion && motion.length >= 9) {
    const locationCodes = {
      no: "NORTH", ea: "EAST", so: "SOUTH", we: "WEST",
      ne: "NORTHEAST", se: "SOUTHEAST", sw: "SOUTHWEST", nw: "NORTHWEST",
    };
    const orientationCodes = { i: "IN", o: "OUT", k: "CLOCK", t: "COUNTER" };
    const rotationCodes = { c: "CLOCKWISE", u: "COUNTER_CLOCKWISE", x: "NO_ROTATION" };
    const motionTypeCodes = { p: "PRO", a: "ANTI", l: "FLOAT", d: "DASH", s: "STATIC" };

    let pos = 0;
    const startLoc = motion.substring(pos, pos + 2); pos += 2;
    const endLoc = motion.substring(pos, pos + 2); pos += 2;
    const startOri = motion.substring(pos, pos + 1); pos += 1;
    const endOri = motion.substring(pos, pos + 1); pos += 1;
    const rotDir = motion.substring(pos, pos + 1); pos += 1;
    const turns = motion.substring(pos, motion.length - 1);
    const type = motion.substring(motion.length - 1);

    console.log(`  Raw: ${motion}`);
    console.log(`  Start Location: ${locationCodes[startLoc]} (${startLoc})`);
    console.log(`  End Location: ${locationCodes[endLoc]} (${endLoc})`);
    console.log(`  Start Orientation: ${orientationCodes[startOri]} (${startOri})`);
    console.log(`  End Orientation: ${orientationCodes[endOri]} (${endOri})`);
    console.log(`  Rotation Direction: ${rotationCodes[rotDir]} (${rotDir})`);
    console.log(`  Turns: ${turns}`);
    console.log(`  Motion Type: ${motionTypeCodes[type]} (${type})`);
  }

  // Check if all beats have sufficient data
  console.log("\n" + "=".repeat(80));
  console.log("DATA COMPLETENESS CHECK:");
  console.log("=".repeat(80));

  let hasIssues = false;
  for (let i = 0; i < beatParts.length; i++) {
    const beatName = i === 0 ? "Start Position" : `Beat ${i}`;
    const motions = beatParts[i].split(":");

    if (motions.length !== 2) {
      console.log(`❌ ${beatName}: Expected 2 motions (blue:red), got ${motions.length}`);
      hasIssues = true;
    } else if (!motions[0] || !motions[1]) {
      console.log(`❌ ${beatName}: Missing motion data`);
      hasIssues = true;
    } else if (motions[0].length < 9 || motions[1].length < 9) {
      console.log(`❌ ${beatName}: Motion data too short (blue: ${motions[0].length}, red: ${motions[1].length})`);
      hasIssues = true;
    } else {
      console.log(`✅ ${beatName}: Complete (blue: ${motions[0].length} chars, red: ${motions[1].length} chars)`);
    }
  }

  if (!hasIssues) {
    console.log("\n✅ All beats have complete data!");
    console.log("\n🎯 CONCLUSION: The URL contains SUFFICIENT INFORMATION");
    console.log("   The restoration issue is likely in the DECODING or STATE MANAGEMENT,");
    console.log("   not in the URL data itself.");
  } else {
    console.log("\n❌ CONCLUSION: The URL is MISSING CRITICAL DATA");
    console.log("   The encoding process is not capturing all required fields.");
  }

} else {
  console.log("❌ DECOMPRESSION FAILED even after fixing space");
}
