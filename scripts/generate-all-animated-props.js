/**
 * Generate 300px animated versions of ALL prop SVGs
 * Uses proper arc flag handling to preserve circle-within-circle structures
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const propsDir = path.join(__dirname, "..", "static", "images", "props");
const animatedDir = path.join(propsDir, "animated");
const TARGET_WIDTH = 300;

// Get all props from the props directory
const allProps = fs
  .readdirSync(propsDir)
  .filter((file) => file.endsWith(".svg"))
  .map((file) => file.replace(".svg", ""));

console.log(`📦 Found ${allProps.length} total props\n`);

function parseViewBox(viewBox) {
  const parts = viewBox.split(" ").map((v) => parseFloat(v));
  return { minX: parts[0], minY: parts[1], width: parts[2], height: parts[3] };
}

function scaleNumber(num, scaleFactor) {
  const scaled = parseFloat(num) * scaleFactor;
  return Number(scaled.toFixed(2)).toString();
}

function scalePathData(pathData, scaleFactor) {
  const tokens = pathData.match(
    /[a-zA-Z]|[-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?/g
  );
  if (!tokens) return pathData;

  const result = [];
  let i = 0;
  let currentCommand = null;
  let paramIndex = 0;

  while (i < tokens.length) {
    const token = tokens[i];

    if (/[a-zA-Z]/.test(token)) {
      // This is a command letter
      result.push(token);
      currentCommand = token.toUpperCase();
      paramIndex = 0;
      i++;
    } else {
      // This is a number - determine if it should be scaled
      let shouldScale = true;

      // Arc commands (A/a) have special handling
      if (currentCommand === "A") {
        // Arc: rx ry x-axis-rotation large-arc-flag sweep-flag dx dy
        // Indices: 0  1  2              3              4           5  6
        // Don't scale: x-axis-rotation (2), large-arc-flag (3), sweep-flag (4)
        const arcParamIndex = paramIndex % 7;
        if (arcParamIndex === 2 || arcParamIndex === 3 || arcParamIndex === 4) {
          shouldScale = false;
        }
      }

      if (shouldScale) {
        result.push(scaleNumber(token, scaleFactor));
      } else {
        result.push(token);
      }

      paramIndex++;
      i++;
    }
  }

  // Join with spaces but collapse "z m" back to "zm" to maintain compatibility
  let resultStr = result.join(" ");
  resultStr = resultStr.replace(/z\s+m/gi, "zm");
  return resultStr;
}

function scaleNumericValues(content, scaleFactor) {
  // Scale viewBox
  content = content.replace(/viewBox="([^"]+)"/, (match, viewBox) => {
    const dims = parseViewBox(viewBox);
    const newWidth = scaleNumber(dims.width, scaleFactor);
    const newHeight = scaleNumber(dims.height, scaleFactor);
    return `viewBox="${dims.minX} ${dims.minY} ${newWidth} ${newHeight}"`;
  });

  // Scale stroke-width in style attributes
  content = content.replace(/stroke-width:([0-9.]+)/g, (match, value) => {
    return `stroke-width:${scaleNumber(value, scaleFactor)}`;
  });

  // Scale stroke-width as XML attributes
  content = content.replace(/stroke-width="([0-9.]+)"/g, (match, value) => {
    return `stroke-width="${scaleNumber(value, scaleFactor)}"`;
  });

  // Scale r (radius) attributes
  content = content.replace(/ r="([0-9.]+)"/g, (match, value) => {
    return ` r="${scaleNumber(value, scaleFactor)}"`;
  });

  // Scale cx and cy attributes
  content = content.replace(/ c([xy])="([0-9.]+)"/g, (match, axis, value) => {
    return ` c${axis}="${scaleNumber(value, scaleFactor)}"`;
  });

  // Scale x and y attributes
  content = content.replace(/ x="([0-9.]+)"/g, (match, value) => {
    return ` x="${scaleNumber(value, scaleFactor)}"`;
  });

  content = content.replace(/ y="([0-9.]+)"/g, (match, value) => {
    return ` y="${scaleNumber(value, scaleFactor)}"`;
  });

  // Scale width and height attributes
  content = content.replace(/ width="([0-9.]+)"/g, (match, value) => {
    return ` width="${scaleNumber(value, scaleFactor)}"`;
  });

  content = content.replace(/ height="([0-9.]+)"/g, (match, value) => {
    return ` height="${scaleNumber(value, scaleFactor)}"`;
  });

  // Scale path d attribute
  content = content.replace(/ d="([^"]+)"/g, (match, pathData) => {
    const scaledPath = scalePathData(pathData, scaleFactor);
    return ` d="${scaledPath}"`;
  });

  return content;
}

function generateAnimatedProp(propName) {
  const inputFile = path.join(propsDir, `${propName}.svg`);
  const outputFile = path.join(animatedDir, `${propName}.svg`);

  if (!fs.existsSync(inputFile)) {
    console.log(`⚠️  Skipping ${propName} - file not found`);
    return false;
  }

  try {
    // Read the original SVG
    const content = fs.readFileSync(inputFile, "utf8");

    // Extract current width from viewBox
    const viewBoxMatch = content.match(/viewBox="([^"]+)"/);
    if (!viewBoxMatch) {
      console.log(`⚠️  Skipping ${propName} - no viewBox found`);
      return false;
    }

    const dims = parseViewBox(viewBoxMatch[1]);
    const currentWidth = dims.width;
    const scaleFactor = TARGET_WIDTH / currentWidth;

    console.log(
      `📐 ${propName}: ${currentWidth.toFixed(2)}px → ${TARGET_WIDTH}px (scale: ${scaleFactor.toFixed(6)})`
    );

    // Scale all numeric values
    const scaledContent = scaleNumericValues(content, scaleFactor);

    // Write the scaled version
    fs.writeFileSync(outputFile, scaledContent, "utf8");
    console.log(`   ✅ Created animated/${propName}.svg`);
    return true;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

// Ensure animated directory exists
if (!fs.existsSync(animatedDir)) {
  fs.mkdirSync(animatedDir, { recursive: true });
}

console.log("🎨 Generating 300px animated versions of all props...\n");

let created = 0;
let updated = 0;
let skipped = 0;

allProps.forEach((prop) => {
  const outputFile = path.join(animatedDir, `${prop}.svg`);
  const existed = fs.existsSync(outputFile);

  const success = generateAnimatedProp(prop);

  if (success) {
    if (existed) {
      updated++;
    } else {
      created++;
    }
  } else {
    skipped++;
  }
});

console.log(`\n✨ Done!`);
console.log(`   📝 Created: ${created}`);
console.log(`   🔄 Updated: ${updated}`);
console.log(`   ⏭️  Skipped: ${skipped}`);
console.log(`   📦 Total: ${created + updated} animated props ready`);
