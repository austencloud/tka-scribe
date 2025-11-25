import LZString from "lz-string";

const url = "http://localhost:5173/?open=generate:z:M4e1EtwDwBmAuAdiZlbAD6leArgRgBMkwRwAXAYyI2QFMBDcAawIfmxHJGsI0eTNyBAA4kA7nS6UYDWiEblh+dpMncZmRuuXxtdZuGPJJ4EKPiSIR2SbrIQzy6FBbTXlQXwJiTgpjUEkuNhJQDRo3LlZ8MVADKk8YmzT2RkUeOC9GZjTia0NjRkC-VToyuxpMhjIXATIPOVqyC3ZkQTs4IA";

const params = new URLSearchParams(url.split("?")[1]);
const openParam = params.get("open");
const parts = openParam.split(":");
const module = parts[0];
const compressed = parts.slice(2).join(":");

console.log("Module:", module);
console.log("Compressed length:", compressed.length);
console.log("Compressed data:", compressed);
console.log("\n" + "=".repeat(80));
console.log("Attempting decompression...");
console.log("=".repeat(80));

// Try multiple decompression methods
const methods = [
  { name: "decompressFromEncodedURIComponent", fn: LZString.decompressFromEncodedURIComponent },
  { name: "decompressFromBase64", fn: LZString.decompressFromBase64 },
  { name: "decompressFromUTF16", fn: LZString.decompressFromUTF16 },
  { name: "decompress", fn: LZString.decompress },
];

for (const method of methods) {
  try {
    console.log(`\nTrying ${method.name}...`);
    const result = method.fn(compressed);
    if (result) {
      console.log("✅ SUCCESS!");
      console.log("Decompressed length:", result.length);
      console.log("Decompressed data:", result);
      console.log("\n" + "=".repeat(80));
      console.log("DECODED SEQUENCE:");
      console.log("=".repeat(80));

      const beatParts = result.split("|");
      console.log(`Total parts: ${beatParts.length} (1 start + ${beatParts.length - 1} beats)`);
      console.log("\nStart Position:", beatParts[0]);

      if (beatParts.length > 1) {
        console.log("\nSequence Beats:");
        for (let i = 1; i < beatParts.length; i++) {
          console.log(`  Beat ${i}:`, beatParts[i]);
        }
      }

      break;
    } else {
      console.log("❌ Returned null");
    }
  } catch (e) {
    console.log("❌ Error:", e.message);
  }
}

console.log("\n" + "=".repeat(80));
console.log("Checking for encoding issues...");
console.log("=".repeat(80));

// Check if the string contains any invalid characters
const validChars = /^[A-Za-z0-9+/\-_=]*$/;
if (!validChars.test(compressed)) {
  console.log("⚠️ Compressed string contains invalid characters!");
  console.log("Invalid characters found:");
  for (let i = 0; i < compressed.length; i++) {
    const char = compressed[i];
    if (!validChars.test(char)) {
      console.log(`  Position ${i}: '${char}' (code: ${char.charCodeAt(0)})`);
    }
  }
} else {
  console.log("✅ All characters are valid for base64-like encoding");
}
