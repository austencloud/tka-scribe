/**
 * Simple, Minimal Fade System
 * Just the basics: fade out, change content, fade in
 */

import { cubicOut } from 'svelte/easing';

/**
 * Basic fade transition
 */
export function fade(node: Element, { duration = 300, delay = 0 } = {}) {
	return {
		duration,
		delay,
		easing: cubicOut,
		css: (t: number) => `opacity: ${t}`,
	};
}

/**
 * Check if animations should be enabled based on user preferences
 */
export function shouldAnimate(settings?: { animationsEnabled?: boolean }): boolean {
	// Respect user's reduced motion preference
	if (typeof window !== 'undefined') {
		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (prefersReducedMotion) return false;
	}
	
	// Respect app settings
	return settings?.animationsEnabled !== false;
}

/**
 * Conditional fade that respects settings
 */
export function conditionalFade(node: Element, params: { duration?: number; settings?: { animationsEnabled?: boolean } } = {}) {
	const { duration = 300, settings } = params;
	
	if (!shouldAnimate(settings)) {
		return { duration: 0 };
	}
	
	return fade(node, { duration });
}
