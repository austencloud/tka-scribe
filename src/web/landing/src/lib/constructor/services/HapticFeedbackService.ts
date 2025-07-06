/**
 * HapticFeedbackService
 *
 * A service for providing haptic feedback on mobile devices.
 * This service handles:
 * - Browser compatibility detection
 * - Different feedback patterns
 * - Respecting user preferences
 * - iOS/Android differences
 *
 * Haptic feedback is used at the following interaction points:
 * - When selecting pictographs
 * - When toggling settings
 * - When completing a sequence
 * - When sharing/exporting content
 * - When navigating between major sections
 * - When performing destructive actions (deletions)
 */

import { browser } from '$app/environment';
import { settingsStore } from '$lib/state/stores/settings/settings.store';
import { get } from 'svelte/store';

// Types of haptic feedback patterns
export type HapticFeedbackType =
	| 'selection' // Short pulse for selection events (50-80ms)
	| 'success' // Success pattern (100ms, 30ms pause, 50ms)
	| 'warning' // Warning pattern (60ms, 60ms pause, 60ms)
	| 'error' // Error pattern (100ms, 60ms pause, 100ms, 60ms pause, 100ms)
	| 'navigation' // Very subtle pulse for navigation (30-40ms)
	| 'custom'; // Custom pattern

// Feedback patterns (in milliseconds)
const FEEDBACK_PATTERNS = {
	selection: [70],
	success: [100, 30, 50],
	warning: [60, 0, 60],
	error: [100, 0, 100, 0, 100],
	navigation: [35],
	custom: [] as number[]
};

// Throttle time in milliseconds to prevent excessive vibrations
const THROTTLE_TIME = 100;

class HapticFeedbackService {
	private lastFeedbackTime: number = 0;
	private customPattern: number[] = [];
	private isEnabled: boolean = true;
	private isSupported: boolean = false;

	constructor() {
		// Check if the Vibration API is supported
		this.checkSupport();

		// Subscribe to settings changes if in browser environment
		if (browser) {
			settingsStore.subscribe((settings) => {
				// If hapticFeedback setting exists, use it; otherwise default to true
				this.isEnabled = settings.hapticFeedback !== undefined ? settings.hapticFeedback : true;

				// Disable haptic feedback if reduced motion is enabled
				if (settings.reducedMotion) {
					this.isEnabled = false;
				}
			});
		}
	}

	/**
	 * Check if the device supports haptic feedback
	 */
	private checkSupport(): void {
		if (browser) {
			this.isSupported =
				'vibrate' in navigator || 'mozVibrate' in navigator || 'webkitVibrate' in navigator;
		}
	}

	/**
	 * Check if haptic feedback is currently enabled and supported
	 * @returns Boolean indicating if haptic feedback is available
	 */
	public isAvailable(): boolean {
		return browser && this.isSupported && this.isEnabled;
	}

	/**
	 * Trigger haptic feedback with the specified pattern
	 * @param type The type of feedback to provide
	 * @returns Boolean indicating if feedback was triggered
	 */
	public trigger(type: HapticFeedbackType = 'selection'): boolean {
		// Skip if not supported, not enabled, or not in browser environment
		if (!this.isAvailable()) {
			return false;
		}

		// Throttle feedback to prevent excessive vibrations
		const now = Date.now();
		if (now - this.lastFeedbackTime < THROTTLE_TIME) {
			return false;
		}
		this.lastFeedbackTime = now;

		// Get the pattern based on the type
		const pattern = type === 'custom' ? this.customPattern : FEEDBACK_PATTERNS[type];

		try {
			// Use the Vibration API to trigger feedback
			navigator.vibrate(pattern);
			return true;
		} catch (error) {
			console.warn('Haptic feedback failed:', error);
			return false;
		}
	}

	/**
	 * Set a custom vibration pattern
	 * @param pattern Array of vibration durations in milliseconds
	 */
	public setCustomPattern(pattern: number[]): void {
		this.customPattern = pattern;
	}

	/**
	 * Check if haptic feedback is supported on this device
	 * @returns Boolean indicating if haptic feedback is supported
	 */
	public isHapticFeedbackSupported(): boolean {
		return this.isSupported;
	}

	/**
	 * Enable or disable haptic feedback
	 * @param enabled Boolean indicating if haptic feedback should be enabled
	 */
	public setEnabled(enabled: boolean): void {
		this.isEnabled = enabled;

		// Update the settings store
		if (browser) {
			const currentSettings = get(settingsStore);
			settingsStore.updateSettings({
				...currentSettings,
				hapticFeedback: enabled
			});
		}
	}

	/**
	 * Get the current enabled state
	 * @returns Boolean indicating if haptic feedback is enabled
	 */
	public getEnabled(): boolean {
		return this.isEnabled;
	}
}

// Create and export a singleton instance
const hapticFeedbackService = new HapticFeedbackService();
export default hapticFeedbackService;
