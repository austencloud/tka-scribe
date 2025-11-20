/**
 * Test the color application logic on fan.svg
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function applyColorToPropSvg(svgText, color) {
  let coloredSvg = svgText;

  // Replace fill colors ONLY if they have an actual color value (not "none" or transparent)
  coloredSvg = coloredSvg.replace(
    /fill="(#[0-9A-Fa-f]{3,6}|rgb[a]?\([^)]+\)|[a-z]+)"/gi,
    (match, capturedColor) => {
      console.log(
        `  Attribute match: ${match} -> capturedColor: ${capturedColor}`
      );
      if (
        capturedColor.toLowerCase() === "none" ||
        capturedColor.toLowerCase() === "transparent"
      ) {
        return match;
      }
      return `fill="${color}"`;
    }
  );

  // Also handle style attributes
  coloredSvg = coloredSvg.replace(
    /fill:\s*(#[0-9A-Fa-f]{3,6}|rgb[a]?\([^)]+\)|[a-z]+)/gi,
    (match, capturedColor) => {
      console.log(`  Style match: ${match} -> capturedColor: ${capturedColor}`);
      if (
        capturedColor.toLowerCase() === "none" ||
        capturedColor.toLowerCase() === "transparent"
      ) {
        return match;
      }
      return `fill:${color}`;
    }
  );

  // Remove centerPoint circle
  coloredSvg = coloredSvg.replace(/<circle[^>]*id="centerPoint"[^>]*\/?>/g, "");

  return coloredSvg;
}

const fanPath = path.join(
  __dirname,
  "..",
  "static",
  "images",
  "props",
  "animated",
  "fan.svg"
);
const fanSvg = fs.readFileSync(fanPath, "utf8");

console.log("🧪 Testing color application on fan.svg\n");
console.log("Original fill attributes:");
const originalFills = fanSvg.match(/fill:[^;"]+/g);
originalFills?.forEach((fill) => console.log(`  ${fill}`));

console.log("\nApplying color #2E3192...\n");
const coloredSvg = applyColorToPropSvg(fanSvg, "#2E3192");

console.log("\nResulting fill attributes:");
const resultFills = coloredSvg.match(/fill:[^;"]+/g);
resultFills?.forEach((fill) => console.log(`  ${fill}`));

console.log("\n✅ fill:none preserved?", coloredSvg.includes("fill:none"));
