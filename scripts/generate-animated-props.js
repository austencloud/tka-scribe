/**
 * Generate 300px width animated versions of all prop SVGs
 * Stores them in static/images/props/animated/
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const propsDir = path.join(__dirname, "..", "static", "images", "props");
const animatedDir = path.join(propsDir, "animated");

// All props to generate
const props = [
  "staff",
  "club",
  "buugeng",
  "doublestar",
  "eightrings",
  "fan",
  "fractalgeng",
  "guitar",
  "hand",
  "minihoop",
  "sword",
  "triad",
  "ukulele",
  "simple_staff",
];

const TARGET_WIDTH = 300;

/**
 * Parse viewBox to get dimensions
 */
function parseViewBox(viewBox) {
  const parts = viewBox.split(" ").map((v) => parseFloat(v));
  return { minX: parts[0], minY: parts[1], width: parts[2], height: parts[3] };
}

/**
 * Scale a number, preserving precision
 */
function scaleNumber(num, scaleFactor) {
  const scaled = parseFloat(num) * scaleFactor;
  return Number(scaled.toFixed(2)).toString();
}

/**
 * Scale numbers in SVG path data
 */
function scalePathData(pathData, scaleFactor) {
  const tokens = pathData.match(
    /[a-zA-Z]|[-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?/g
  );
  if (!tokens) return pathData;

  const result = [];
  for (const token of tokens) {
    if (/[a-zA-Z]/.test(token)) {
      result.push(token);
    } else {
      result.push(scaleNumber(token, scaleFactor));
    }
  }

  return result.join(" ");
}

/**
 * Scale all numeric values in SVG
 */
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

/**
 * Generate animated version of a prop
 */
function generateAnimatedProp(propName) {
  const inputFile = path.join(propsDir, `${propName}.svg`);
  const outputFile = path.join(animatedDir, `${propName}.svg`);

  if (!fs.existsSync(inputFile)) {
    console.log(`⚠️  Skipping ${propName} - file not found`);
    return;
  }

  // Read the original SVG
  const content = fs.readFileSync(inputFile, "utf8");

  // Extract current width from viewBox
  const viewBoxMatch = content.match(/viewBox="([^"]+)"/);
  if (!viewBoxMatch) {
    console.log(`⚠️  Skipping ${propName} - no viewBox found`);
    return;
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
  console.log(`✅ Created animated/${propName}.svg`);
}

// Ensure animated directory exists
if (!fs.existsSync(animatedDir)) {
  fs.mkdirSync(animatedDir, { recursive: true });
}

console.log("🎨 Generating 300px animated versions of all props...\n");

props.forEach((prop) => {
  generateAnimatedProp(prop);
});

console.log("\n✨ All animated props generated!");
