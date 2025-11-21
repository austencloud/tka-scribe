/**
 * Check viewBox widths of big props and guitar
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const propsDir = path.join(__dirname, "..", "static", "images", "props");

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

function parseViewBox(viewBox) {
  const parts = viewBox.split(" ").map((v) => parseFloat(v));
  return { minX: parts[0], minY: parts[1], width: parts[2], height: parts[3] };
}

console.log("📏 Checking widths of big props and guitar:\n");

bigProps.forEach((prop) => {
  const filePath = path.join(propsDir, `${prop}.svg`);

  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${prop}: FILE NOT FOUND`);
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");
  const viewBoxMatch = content.match(/viewBox="([^"]+)"/);

  if (!viewBoxMatch) {
    console.log(`⚠️  ${prop}: No viewBox found`);
    return;
  }

  const dims = parseViewBox(viewBoxMatch[1]);
  const isCorrectWidth = Math.abs(dims.width - 450) < 1;
  const status = isCorrectWidth ? "✅" : "❌";

  console.log(
    `${status} ${prop}: ${dims.width.toFixed(2)}px (${isCorrectWidth ? "CORRECT" : "NEEDS 450px"})`
  );
});
