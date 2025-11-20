/**
 * Scale all prop SVGs to exactly 300px width for use in Animation Viewer canvas
 * This applies the same scaling approach used for staff.svg -> staff_animated.svg
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const propsDir = path.join(__dirname, '..', 'static', 'images', 'props');

// Prop dimensions based on their current viewBox values
const props = [
	{ name: 'buugeng', viewBox: '0 0 262.6 135.9', targetWidth: 300 },
	{ name: 'club', viewBox: '0 0 258.67 34.17', targetWidth: 300 },
	{ name: 'doublestar', viewBox: '0 0 300 150', targetWidth: 300 }, // Already 300!
	{ name: 'eightrings', viewBox: '0 0 257.3 137.1', targetWidth: 300 },
	{ name: 'fan', viewBox: '0 0 258.6 206.4', targetWidth: 300 },
	{ name: 'fractalgeng', viewBox: '0 0 250 190.3', targetWidth: 300 },
	{ name: 'guitar', viewBox: '0 0 600.8 111.5', targetWidth: 300 },
	{ name: 'hand', viewBox: '0 0 75 100', targetWidth: 300 },
	{ name: 'minihoop', viewBox: '0 0 257.3 137.1', targetWidth: 300 },
	{ name: 'sword', viewBox: '0 0 572.3 64', targetWidth: 300 },
	{ name: 'triad', viewBox: '0 0 248.76 219.09', targetWidth: 300 },
	{ name: 'ukulele', viewBox: '0 0 260.9 50.4', targetWidth: 300 }
];

/**
 * Parse viewBox to get dimensions
 */
function parseViewBox(viewBox) {
	const parts = viewBox.split(' ').map((v) => parseFloat(v));
	return { minX: parts[0], minY: parts[1], width: parts[2], height: parts[3] };
}

/**
 * Scale a number, preserving precision
 */
function scaleNumber(num, scaleFactor) {
	const scaled = parseFloat(num) * scaleFactor;
	// Format with 2 decimal places, but remove trailing zeros
	return Number(scaled.toFixed(2)).toString();
}

/**
 * Scale numbers in SVG path data
 * This handles SVG path commands (M, L, C, Q, A, etc.) correctly
 */
function scalePathData(pathData, scaleFactor) {
	// Split path into tokens (commands and numbers)
	const tokens = pathData.match(/[a-zA-Z]|[-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?/g);
	if (!tokens) return pathData;

	const result = [];
	let i = 0;

	while (i < tokens.length) {
		const token = tokens[i];

		// Check if it's a command letter
		if (/[a-zA-Z]/.test(token)) {
			result.push(token);
			i++;
		} else {
			// It's a number - scale it
			result.push(scaleNumber(token, scaleFactor));
			i++;
		}
	}

	return result.join(' ');
}

/**
 * Scale all numeric values in SVG path data and attributes
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

	// Scale r (radius) attributes for circles
	content = content.replace(/ r="([0-9.]+)"/g, (match, value) => {
		return ` r="${scaleNumber(value, scaleFactor)}"`;
	});

	// Scale cx and cy attributes
	content = content.replace(/ c([xy])="([0-9.]+)"/g, (match, axis, value) => {
		return ` c${axis}="${scaleNumber(value, scaleFactor)}"`;
	});

	// Scale x and y attributes (excluding xmlns and xml:space)
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

	// Scale path d attribute - use specialized path scaling
	content = content.replace(/ d="([^"]+)"/g, (match, pathData) => {
		const scaledPath = scalePathData(pathData, scaleFactor);
		return ` d="${scaledPath}"`;
	});

	return content;
}

/**
 * Scale a prop SVG to target width
 */
function scaleProp(propName, currentViewBox, targetWidth) {
	const inputFile = path.join(propsDir, `${propName}.svg`);
	const outputFile = path.join(propsDir, `${propName}_animated.svg`);

	// Check if input file exists
	if (!fs.existsSync(inputFile)) {
		console.log(`⚠️  Skipping ${propName} - file not found`);
		return;
	}

	// Parse current dimensions
	const dims = parseViewBox(currentViewBox);
	const currentWidth = dims.width;

	// Calculate scale factor
	const scaleFactor = targetWidth / currentWidth;

	console.log(
		`📐 ${propName}: ${currentWidth.toFixed(2)}px → ${targetWidth}px (scale: ${scaleFactor.toFixed(6)})`
	);

	// Read the original SVG
	let content = fs.readFileSync(inputFile, 'utf8');

	// Scale all numeric values
	content = scaleNumericValues(content, scaleFactor);

	// Write the scaled version
	fs.writeFileSync(outputFile, content, 'utf8');
	console.log(`✅ Created ${propName}_animated.svg`);
}

// Main execution
console.log('🎨 Scaling all props to 300px width...\n');

props.forEach((prop) => {
	scaleProp(prop.name, prop.viewBox, prop.targetWidth);
});

console.log('\n✨ All props scaled successfully!');
