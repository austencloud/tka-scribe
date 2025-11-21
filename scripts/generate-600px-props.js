/**
 * Generate 600px animated versions for big props and guitar
 * These props should remain at their original 600px size
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const propsDir = path.join(__dirname, "..", "static", "images", "props");
const animatedDir = path.join(propsDir, "animated");

// Props that should stay at 600px (no scaling needed, just copy)
const bigProps = [
  "bigbuugeng",
  "bigdoublestar",
  "bigeightrings",
  "bigfan",
  "bighoop",
  "bigstaff",
  "bigtriad",
  "guitar",
];

console.log("🎨 Creating 600px animated versions (copying originals)...\n");

bigProps.forEach((propName) => {
  const inputFile = path.join(propsDir, `${propName}.svg`);
  const outputFile = path.join(animatedDir, `${propName}.svg`);

  if (!fs.existsSync(inputFile)) {
    console.log(`⚠️  Skipping ${propName} - file not found`);
    return;
  }

  try {
    const content = fs.readFileSync(inputFile, "utf8");

    // Extract width for logging
    const viewBoxMatch = content.match(/viewBox="([^"]+)"/);
    if (viewBoxMatch) {
      const parts = viewBoxMatch[1].split(" ").map(parseFloat);
      const width = parts[2];
      console.log(
        `📐 ${propName}: ${width.toFixed(2)}px (keeping original size)`
      );
    }

    // Just copy the original - no scaling
    fs.writeFileSync(outputFile, content, "utf8");
    console.log(`   ✅ Copied to animated/${propName}.svg`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
});

console.log("\n✨ Done! All big props kept at original 600px width");
