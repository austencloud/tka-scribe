/**
 * Regenerate fan.svg to verify proper scaling with fill:none preservation
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const propsDir = path.join(__dirname, "..", "static", "images", "props");
const animatedDir = path.join(propsDir, "animated");
const TARGET_WIDTH = 300;

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
  for (const token of tokens) {
    if (/[a-zA-Z]/.test(token)) {
      result.push(token);
    } else {
      result.push(scaleNumber(token, scaleFactor));
    }
  }

  return result.join(" ");
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

const inputFile = path.join(propsDir, "fan.svg");
const outputFile = path.join(animatedDir, "fan.svg");

const content = fs.readFileSync(inputFile, "utf8");
const viewBoxMatch = content.match(/viewBox="([^"]+)"/);
const dims = parseViewBox(viewBoxMatch[1]);
const currentWidth = dims.width;
const scaleFactor = TARGET_WIDTH / currentWidth;

console.log(
  `📐 fan: ${currentWidth.toFixed(2)}px → ${TARGET_WIDTH}px (scale: ${scaleFactor.toFixed(6)})`
);

const scaledContent = scaleNumericValues(content, scaleFactor);

fs.writeFileSync(outputFile, scaledContent, "utf8");
console.log(`✅ Regenerated animated/fan.svg`);

// Show the paths to verify fill:none is preserved
const paths = scaledContent.match(/<path[^>]+>/g);
console.log("\n📝 Paths in generated file:");
paths?.forEach((path, i) => {
  const fillMatch = path.match(/fill:([^;"]+)/);
  const fill = fillMatch ? fillMatch[1] : "not specified";
  console.log(`  Path ${i + 1}: fill:${fill}`);
});
