/**
 * Glyph Texture Service Interface
 *
 * Manages glyph texture loading for AnimatorCanvas.
 * Handles queuing glyphs when renderer isn't ready yet.
 */

import type { IPixiAnimationRenderer } from "$lib/features/compose/services/contracts/IPixiAnimationRenderer";

/**
 * Pending glyph data
 */
export interface PendingGlyph {
	svgString: string;
	width: number;
	height: number;
}

/**
 * Callback for when glyph loading completes
 */
export type GlyphLoadCompleteCallback = () => void;

/**
 * Service for managing glyph texture loading
 */
export interface IGlyphTextureService {
	/**
	 * Initialize the service with renderer
	 */
	initialize(renderer: IPixiAnimationRenderer): void;

	/**
	 * Set callback for load completion
	 */
	setLoadCompleteCallback(callback: GlyphLoadCompleteCallback): void;

	/**
	 * Handler for GlyphRenderer's onSvgReady callback
	 */
	handleGlyphSvgReady(
		svgString: string,
		width: number,
		height: number,
		x: number,
		y: number
	): void;

	/**
	 * Load a glyph texture (queues if not initialized)
	 * @param svgString - SVG string to load
	 * @param width - Width of the glyph
	 * @param height - Height of the glyph
	 * @param isInitialized - Whether the renderer is initialized
	 */
	loadGlyphTexture(
		svgString: string,
		width: number,
		height: number,
		isInitialized: boolean
	): Promise<void>;

	/**
	 * Get current pending glyph (if any)
	 */
	getPendingGlyph(): PendingGlyph | null;

	/**
	 * Process pending glyph if one exists.
	 * Call this when initialization completes.
	 */
	processPendingGlyph(): Promise<void>;

	/**
	 * Clean up resources
	 */
	dispose(): void;
}
