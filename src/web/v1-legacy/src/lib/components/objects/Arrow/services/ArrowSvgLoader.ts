// src/lib/components/objects/Arrow/services/ArrowSvgLoader.ts
import type { Color, MotionType, Orientation, TKATurns } from '$lib/types/Types';
import type { ArrowSvgData } from '$lib/components/SvgManager/ArrowSvgData';
import { parseArrowSvg } from '$lib/components/SvgManager/parseArrowSvg';
import type SvgManager from '$lib/components/SvgManager/SvgManager';

/**
 * Service for loading and managing Arrow SVG data
 */
export class ArrowSvgLoader {
	constructor(private svgManager: SvgManager) {}

	/**
	 * Faster SVG parsing without regex for better performance
	 */
	private fastParseArrowSvg(svgText: string): ArrowSvgData {
		// Extract viewBox more efficiently
		const viewBoxStart = svgText.indexOf('viewBox="');
		if (viewBoxStart === -1) {
			return {
				imageSrc: '',
				viewBox: { x: 0, y: 0, width: 100, height: 100 },
				center: { x: 50, y: 50 }
			};
		}

		const viewBoxValueStart = viewBoxStart + 9; // Length of 'viewBox="'
		const viewBoxEnd = svgText.indexOf('"', viewBoxValueStart);
		const viewBoxValue = svgText.substring(viewBoxValueStart, viewBoxEnd);

		const parts = viewBoxValue.split(' ').map(Number);
		const width = parts[2] || 100;
		const height = parts[3] || 100;

		return {
			imageSrc: '',
			viewBox: {
				x: parts[0] || 0,
				y: parts[1] || 0,
				width,
				height
			},
			center: { x: width / 2, y: height / 2 }
		};
	}

	/**
	 * Optimized base64 encoding for modern browsers
	 */
	private fastBtoa(text: string): string {
		try {
			// Use TextEncoder and Uint8Array for better performance in modern browsers
			if (typeof TextEncoder !== 'undefined') {
				const encoder = new TextEncoder();
				const data = encoder.encode(text);
				return this.uint8ArrayToBase64(data);
			}
		} catch (e) {
			// Silently fall back to standard btoa
		}

		// Fallback to standard btoa
		return btoa(text);
	}

	/**
	 * Helper method to convert Uint8Array to base64
	 */
	private uint8ArrayToBase64(array: Uint8Array): string {
		let binary = '';
		const len = array.byteLength;
		for (let i = 0; i < len; i++) {
			binary += String.fromCharCode(array[i]);
		}
		return btoa(binary);
	}

	/**
	 * Loads an arrow SVG based on motion properties with optimized performance
	 */
	async loadSvg(
		motionType: MotionType,
		startOri: Orientation,
		turns: TKATurns,
		color: Color,
		mirrored: boolean = false
	): Promise<{ svgData: ArrowSvgData }> {
		try {
			// Fetch SVG from manager with timeout protection
			const svgTextPromise = this.svgManager.getArrowSvg(motionType, startOri, turns, color);

			// Set up a race with a timeout
			const timeoutPromise = new Promise<string>((_, reject) => {
				setTimeout(() => reject(new Error('SVG fetch timeout')), 1500);
			});

			// Race the fetch against the timeout
			const svgText = await Promise.race([svgTextPromise, timeoutPromise]);

			// Quick validation (avoid regex for performance)
			if (!svgText || svgText.indexOf('<svg') === -1) {
				throw new Error('Invalid SVG content: Missing <svg> element');
			}

			// Use optimized parsing
			const originalSvgData = this.fastParseArrowSvg(svgText);

			// Adjust center point if mirrored
			const center = { ...originalSvgData.center };
			if (mirrored) {
				center.x = originalSvgData.viewBox.width - center.x;
			}

			// Create and return SVG data object with optimized base64 encoding
			return {
				svgData: {
					imageSrc: `data:image/svg+xml;base64,${this.fastBtoa(svgText)}`,
					viewBox: originalSvgData.viewBox,
					center
				}
			};
		} catch (error) {
			// Minimal logging in production
			if (import.meta.env.DEV) {
				console.error('Arrow SVG loading error:', error);
			}

			// Return fallback data directly instead of re-throwing
			return { svgData: this.getFallbackSvgData() };
		}
	}

	/**
	 * Returns fallback SVG data for error situations
	 */
	getFallbackSvgData(): ArrowSvgData {
		return {
			imageSrc:
				'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2ZmZiIgLz48dGV4dCB4PSIyMCIgeT0iNTAiIGZpbGw9IiNmMDAiPkVycm9yPC90ZXh0Pjwvc3ZnPg==',
			viewBox: { x: 0, y: 0, width: 100, height: 100 },
			center: { x: 50, y: 50 }
		};
	}
}
