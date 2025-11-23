import LZString from "lz-string";

const url = "http://localhost:5173/?open=generate:z:M4e1EtwDwBmAuAdiZlbAD6leArgRgBMkwRwAXAYyI2QFMBDcAawIfmxHJGsI0eTNyBAA4kA7nS6UYDWiEblh+dpMncZmRuuXxtdZuGPJJ4EKPiSIR2SbrIQzy6FBbTXlQXwJiTgpjUEkuNhJQDRo3LlZ8MVADKk8YmzT2RkUeOC9GZjTia0NjRkC-VToyuxpMhjIXATIPOVqyC3ZkQTs4IA";

const params = new URLSearchParams(url.split("?")[1]);
const openParam = params.get("open");
const parts = openParam.split(":");
const module = parts[0];
const compressed = parts.slice(2).join(":");

console.log("Module:", module);
console.log("Compressed data length:", compressed.length);
console.log("\nDecompressing...\n");

const decompressed = LZString.decompressFromEncodedURIComponent(compressed);

if (decompressed) {
  console.log("✅ Decompressed successfully!");
  console.log("Decompressed length:", decompressed.length);
  console.log("\n" + "=".repeat(80));
  console.log("DECODED SEQUENCE:");
  console.log("=".repeat(80));
  console.log(decompressed);
  console.log("=".repeat(80));

  // Parse the structure
  const beatParts = decompressed.split("|");
  console.log("\nStructure:");
  console.log("- Start Position: 1");
  console.log("- Sequence Beats:", beatParts.length - 1);
  console.log("\nStart Position:", beatParts[0]);
  console.log("\nBeats:");
  for (let i = 1; i < beatParts.length; i++) {
    console.log(`  Beat ${i}:`, beatParts[i]);
  }
} else {
  console.log("❌ Decompression failed");
}
