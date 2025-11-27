/**
 * canvas-resize-utils.ts
 *
 * Pure utility functions for canvas resize handling.
 * Manages ResizeObserver setup/teardown and size calculations.
 */

import { DEFAULT_CANVAS_SIZE } from "../state/animator-canvas-state.svelte";

// ============================================================================
// TYPES
// ============================================================================

export type ResizeCallback = (newSize: number) => void;

export type ResizeControls = {
	/** Set up the resize observer for a container element */
	setup: (container: HTMLElement) => void;
	/** Clean up resize observer and event listeners */
	teardown: () => void;
	/** Manually trigger a resize calculation */
	resize: () => void;
};

// ============================================================================
// PURE FUNCTIONS
// ============================================================================

/**
 * Calculate the square canvas size from a container's bounding rect.
 * Takes the minimum of width/height to maintain aspect ratio.
 */
export function calculateCanvasSize(
	container: HTMLElement | null,
	defaultSize: number = DEFAULT_CANVAS_SIZE
): number {
	if (!container) return defaultSize;

	const rect = container.getBoundingClientRect();
	const size =
		Math.min(rect.width || defaultSize, rect.height || defaultSize) ||
		defaultSize;

	return size;
}

/**
 * Creates resize handling controls for a canvas container.
 * Returns an object with setup/teardown/resize methods.
 *
 * @param onResize - Callback invoked when size changes
 * @param defaultSize - Fallback size when container dimensions unavailable
 *
 * @example
 * ```ts
 * const resizeControls = createResizeControls(
 *   (size) => {
 *     canvasState.setCanvasSize(size);
 *     pixiRenderer.resize(size);
 *   }
 * );
 *
 * // In $effect:
 * resizeControls.setup(containerElement);
 * // On cleanup:
 * resizeControls.teardown();
 * ```
 */
export function createResizeControls(
	onResize: ResizeCallback,
	defaultSize: number = DEFAULT_CANVAS_SIZE
): ResizeControls {
	let containerElement: HTMLElement | null = null;
	let resizeObserver: ResizeObserver | null = null;
	let currentSize = defaultSize;

	function handleResize(): void {
		const newSize = calculateCanvasSize(containerElement, defaultSize);
		if (newSize !== currentSize) {
			currentSize = newSize;
			onResize(newSize);
		}
	}

	function setup(container: HTMLElement): void {
		containerElement = container;

		// Set up ResizeObserver if available
		if (typeof ResizeObserver !== "undefined") {
			resizeObserver = new ResizeObserver(() => {
				handleResize();
			});
			resizeObserver.observe(container);
		}

		// Also listen to window resize as fallback
		if (typeof window !== "undefined") {
			window.addEventListener("resize", handleResize);
		}

		// Calculate initial size
		handleResize();
	}

	function teardown(): void {
		resizeObserver?.disconnect();
		resizeObserver = null;

		if (typeof window !== "undefined") {
			window.removeEventListener("resize", handleResize);
		}

		containerElement = null;
	}

	return {
		setup,
		teardown,
		resize: handleResize,
	};
}
