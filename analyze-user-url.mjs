import LZString from "lz-string";

const userCompressed = "M4e1EtwDwBmAuAdiZlbAD6leArgRgBMkwRwAXAYyI2QFMBDcAawIfmxHJGsI0eTNyBAA4kA7nS6UYDWiEblh+dpMncZmRuuXxtdZuGPJJ4EKPiSIR2SbrIQzy6FBbTXlQXwJiTgpjUEkuNhJQDRo3LlZ8MVADKk8YmzT2RkUeOC9GZjTia0NjRkC-VToyuxpMhjIXATIPOVqyC3ZkQTs4IA";

console.log("=".repeat(80));
console.log("ANALYZING USER'S URL");
console.log("=".repeat(80));
console.log("Compressed string length:", userCompressed.length);
console.log("\nCharacter analysis:");

// Check for invalid characters
const validChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=+";
const invalidChars = [];

for (let i = 0; i < userCompressed.length; i++) {
  const char = userCompressed[i];
  if (!validChars.includes(char)) {
    invalidChars.push({ pos: i, char, code: char.charCodeAt(0) });
  }
}

if (invalidChars.length > 0) {
  console.log("❌ Found invalid characters:");
  invalidChars.forEach(({ pos, char, code }) => {
    console.log(`  Position ${pos}: '${char}' (code: ${code})`);
  });
} else {
  console.log("✅ All characters are valid");
}

// Try to decompress
console.log("\n" + "=".repeat(80));
console.log("DECOMPRESSION ATTEMPTS");
console.log("=".repeat(80));

// Try 1: Direct decompression
console.log("\n1. Direct decompression (as-is):");
let result = LZString.decompressFromEncodedURIComponent(userCompressed);
console.log(result ? `✅ Success: ${result}` : "❌ Failed");

// Try 2: With URI decoding (in case it's double-encoded)
console.log("\n2. After URI decoding:");
try {
  const decoded = decodeURIComponent(userCompressed);
  result = LZString.decompressFromEncodedURIComponent(decoded);
  console.log(result ? `✅ Success: ${result}` : "❌ Failed");
} catch (e) {
  console.log("❌ Error:", e.message);
}

// Try 3: Manual check of the LZ-String format
console.log("\n" + "=".repeat(80));
console.log("MANUAL FORMAT CHECK");
console.log("=".repeat(80));

// LZ-String uses base64-like encoding with URL-safe characters
// Valid chars: A-Za-z0-9+/- and padding with =

const base64UrlChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

console.log("\nChecking if string uses valid LZ-String URL encoding:");
let allValid = true;
for (let i = 0; i < userCompressed.length; i++) {
  const char = userCompressed[i];
  if (!base64UrlChars.includes(char) && char !== '+' && char !== '=') {
    console.log(`❌ Invalid char at position ${i}: '${char}'`);
    allValid = false;
  }
}

if (allValid) {
  console.log("✅ String format looks valid for LZ-String");
} else {
  console.log("❌ String contains invalid characters for LZ-String");
}

// Try 4: Check if it's actually the wrong compression method
console.log("\n" + "=".repeat(80));
console.log("TRYING ALTERNATE COMPRESSION METHODS");
console.log("=".repeat(80));

const methods = [
  { name: "compressToBase64", decompress: LZString.decompressFromBase64 },
  { name: "compressToUTF16", decompress: LZString.decompressFromUTF16 },
  { name: "compress", decompress: LZString.decompress },
];

for (const method of methods) {
  console.log(`\nTrying ${method.name}:`);
  const result = method.decompress(userCompressed);
  if (result) {
    console.log(`✅ SUCCESS!`);
    console.log(`Decompressed: ${result}`);
    break;
  } else {
    console.log("❌ Failed");
  }
}

// Try 5: Check if the URL might have been truncated
console.log("\n" + "=".repeat(80));
console.log("CHECKING FOR TRUNCATION");
console.log("=".repeat(80));

// LZ-String compressed data usually ends with specific patterns
console.log("Last 20 characters:", userCompressed.slice(-20));
console.log("Ends with '=':", userCompressed.endsWith("="));
console.log("Ends with 'A':", userCompressed.endsWith("A"));

// The string ends with "IA" which is unusual
if (userCompressed.endsWith("IA")) {
  console.log("⚠️ String ends with 'IA' - this might indicate truncation or corruption");
}

// Try 6: See if removing trailing characters helps
console.log("\n" + "=".repeat(80));
console.log("TRYING VARIATIONS");
console.log("=".repeat(80));

const variations = [
  userCompressed + "=",
  userCompressed + "==",
  userCompressed.slice(0, -1),
  userCompressed.slice(0, -2),
];

for (let i = 0; i < variations.length; i++) {
  const variant = variations[i];
  const result = LZString.decompressFromEncodedURIComponent(variant);
  if (result) {
    console.log(`✅ SUCCESS with variation ${i + 1}!`);
    console.log(`Variation: ${i === 0 ? "Added '='" : i === 1 ? "Added '=='" : i === 2 ? "Removed last char" : "Removed last 2 chars"}`);
    console.log(`Decompressed: ${result}`);
    break;
  }
}

console.log("\n" + "=".repeat(80));
console.log("DIAGNOSIS");
console.log("=".repeat(80));
console.log("The compressed data appears to be corrupted at the source.");
console.log("This means the URL generation itself is producing invalid compressed data.");
console.log("\nPossible causes:");
console.log("1. The sequence data contains undefined/null values during encoding");
console.log("2. The compression is failing silently and producing garbage");
console.log("3. The URL is being modified after generation (URL encoding issues)");
console.log("\nNext step: Check the browser console when generating a sequence");
console.log("and copy the URL immediately to see if it's valid at creation time.");
