/**
 * Test script to verify BrowseService loads real sequences from dictionary
 */

import { BrowseService } from "./src/lib/services/implementations/browse/BrowseService.ts";

async function testBrowseService() {
  console.log("🔍 Testing BrowseService...");

  const browseService = new BrowseService();

  try {
    // Load sequences
    const sequences = await browseService.loadSequenceMetadata();

    console.log(`📦 Loaded ${sequences.length} sequences`);

    // Check if any fake Greek letter sequences exist
    const fakeSequences = [
      "ALPHA",
      "BETA",
      "GAMMA",
      "DELTA",
      "EPSILON",
      "ZETA",
      "ETA",
      "THETA",
      "IOTA",
      "KAPPA",
      "LAMBDA",
      "MU",
      "NU",
      "XI",
      "OMICRON",
      "PI",
      "RHO",
      "SIGMA",
    ];
    const foundFakeSequences = sequences.filter((seq) =>
      fakeSequences.includes(seq.word)
    );

    if (foundFakeSequences.length > 0) {
      console.error(
        "❌ Found fake sequences:",
        foundFakeSequences.map((s) => s.word)
      );
    } else {
      console.log("✅ No fake Greek letter sequences found");
    }

    // Check if real sequences exist
    const realSequences = [
      "A",
      "AABB",
      "AAKE",
      "AB",
      "ABC",
      "KIΦC",
      "OSOT",
      "OVXΔ",
    ];
    const foundRealSequences = sequences.filter((seq) =>
      realSequences.includes(seq.word)
    );

    console.log(
      `✅ Found ${foundRealSequences.length} real sequences out of ${realSequences.length} expected`
    );
    console.log(
      "Real sequences found:",
      foundRealSequences.map((s) => s.word)
    );

    // Show first 10 sequences
    console.log("📋 First 10 sequences:");
    sequences.slice(0, 10).forEach((seq, index) => {
      console.log(
        `  ${index + 1}. ${seq.word} (${seq.thumbnails?.[0] || "no thumbnail"})`
      );
    });

    console.log("✅ BrowseService test completed successfully");
  } catch (error) {
    console.error("❌ BrowseService test failed:", error);
  }
}

// Run the test
testBrowseService();
