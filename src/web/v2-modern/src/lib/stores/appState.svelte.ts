/**
 * Application State - Pure Svelte 5 Runes
 * 
 * Global application state using only runes - no stores anywhere!
 */

import type { AppSettings } from '$services/interfaces';

// ============================================================================
// INITIALIZATION STATE
// ============================================================================

export let isInitialized = $state(false);
export let isInitializing = $state(false);
export let initializationError = $state<string | null>(null);
export let initializationProgress = $state(0);

// ============================================================================
// UI STATE
// ============================================================================

export let activeTab = $state<'construct' | 'generate' | 'browse' | 'learn'>('construct');
export let isFullScreen = $state(false);
export let showSettings = $state(false);
export let theme = $state<'light' | 'dark'>('dark');

// ============================================================================
// PERFORMANCE STATE
// ============================================================================

export let performanceMetrics = $state({
	initializationTime: 0,
	lastRenderTime: 0,
	memoryUsage: 0
});

// ============================================================================
// SETTINGS STATE
// ============================================================================

export let settings = $state<AppSettings>({
	theme: 'dark',
	gridMode: 'diamond',
	showBeatNumbers: true,
	autoSave: true,
	exportQuality: 'high'
});

// ============================================================================
// DERIVED STATE
// ============================================================================

export const isReady = $derived<boolean>(
	isInitialized && !isInitializing && !initializationError
);

export const canUseApp = $derived<boolean>(
	isReady && !showSettings
);

export const initializationComplete = $derived<boolean>(
	initializationProgress >= 100
);

// ============================================================================
// ACTIONS
// ============================================================================

/**
 * Set initialization state
 */
export function setInitializationState(
	initialized: boolean,
	initializing: boolean,
	error: string | null = null,
	progress: number = 0
): void {
	isInitialized = initialized;
	isInitializing = initializing;
	initializationError = error;
	initializationProgress = progress;
}

/**
 * Set initialization progress
 */
export function setInitializationProgress(progress: number): void {
	initializationProgress = Math.max(0, Math.min(100, progress));
}

/**
 * Set initialization error
 */
export function setInitializationError(error: string | null): void {
	initializationError = error;
	if (error) {
		isInitializing = false;
	}
}

/**
 * Clear initialization error
 */
export function clearInitializationError(): void {
	initializationError = null;
}

/**
 * Switch to a different tab
 */
export function switchTab(tab: 'construct' | 'generate' | 'browse' | 'learn'): void {
	activeTab = tab;
}

/**
 * Check if tab is active
 */
export function isTabActive(tab: string): boolean {
	return activeTab === tab;
}

/**
 * Toggle fullscreen
 */
export function toggleFullScreen(): void {
	isFullScreen = !isFullScreen;
}

/**
 * Set fullscreen state
 */
export function setFullScreen(fullscreen: boolean): void {
	isFullScreen = fullscreen;
}

/**
 * Show settings dialog
 */
export function showSettingsDialog(): void {
	showSettings = true;
}

/**
 * Hide settings dialog
 */
export function hideSettingsDialog(): void {
	showSettings = false;
}

/**
 * Toggle settings dialog
 */
export function toggleSettingsDialog(): void {
	showSettings = !showSettings;
}

/**
 * Set theme
 */
export function setTheme(newTheme: 'light' | 'dark'): void {
	theme = newTheme;
	settings.theme = newTheme;
}

/**
 * Update settings
 */
export function updateSettings(newSettings: Partial<AppSettings>): void {
	settings = { ...settings, ...newSettings };
	
	// Apply theme if changed
	if (newSettings.theme) {
		theme = newSettings.theme;
	}
}

/**
 * Set performance metrics
 */
export function setPerformanceMetrics(metrics: Partial<typeof performanceMetrics>): void {
	performanceMetrics = { ...performanceMetrics, ...metrics };
}

/**
 * Track render time
 */
export function trackRenderTime(componentName: string, renderTime: number): void {
	performanceMetrics.lastRenderTime = renderTime;
	
	if (renderTime > 100) {
		console.warn(`Slow render detected for ${componentName}: ${renderTime}ms`);
	}
}

/**
 * Update memory usage
 */
export function updateMemoryUsage(): void {
	if (typeof performance !== 'undefined' && 'memory' in performance) {
		const memory = (performance as any).memory;
		performanceMetrics.memoryUsage = Math.round(memory.usedJSHeapSize / 1048576);
	}
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Get complete application state snapshot
 */
export function getAppStateSnapshot() {
	return {
		isInitialized,
		isInitializing,
		initializationError,
		initializationProgress,
		activeTab,
		isFullScreen,
		showSettings,
		theme,
		performanceMetrics: { ...performanceMetrics },
		settings: { ...settings }
	};
}

/**
 * Reset application state
 */
export function resetAppState(): void {
	isInitialized = false;
	isInitializing = false;
	initializationError = null;
	initializationProgress = 0;
	activeTab = 'construct';
	isFullScreen = false;
	showSettings = false;
	theme = 'dark';
	performanceMetrics = {
		initializationTime: 0,
		lastRenderTime: 0,
		memoryUsage: 0
	};
}
