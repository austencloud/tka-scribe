// src/lib/components/Backgrounds/contexts/BackgroundContext.ts
import { getContext, setContext } from 'svelte';
import { writable, derived, type Readable, type Writable, get } from 'svelte/store';
import type {
	BackgroundType,
	Dimensions,
	PerformanceMetrics,
	QualityLevel,
	BackgroundSystem
} from '../types/types';
import { BackgroundFactory } from '../core/BackgroundFactory';
import { PerformanceTracker } from '../core/PerformanceTracker';
import { detectAppropriateQuality } from '../config';

// The context key
const BACKGROUND_CONTEXT_KEY = 'background-context';

// Define the state interface
export interface BackgroundState {
	dimensions: Dimensions;
	performanceMetrics: PerformanceMetrics;
	isActive: boolean;
	qualityLevel: QualityLevel;
	isLoading: boolean;
	backgroundType: BackgroundType;
	isInitialized: boolean;
}

// Define the context interface
export interface BackgroundContext {
	// State stores
	dimensions: Writable<Dimensions>;
	performanceMetrics: Writable<PerformanceMetrics>;
	isActive: Writable<boolean>;
	qualityLevel: Writable<QualityLevel>;
	isLoading: Writable<boolean>;
	backgroundType: Writable<BackgroundType>;
	isInitialized: Writable<boolean>;

	// Derived stores
	shouldRender: Readable<boolean>;
	backgroundSystem: Readable<BackgroundSystem>;

	// Actions
	initializeCanvas: (canvas: HTMLCanvasElement, onReady?: () => void) => void;
	startAnimation: (
		renderFn: (ctx: CanvasRenderingContext2D, dimensions: Dimensions) => void,
		reportFn?: (metrics: PerformanceMetrics) => void
	) => void;
	stopAnimation: () => void;
	setQuality: (quality: QualityLevel) => void;
	setLoading: (isLoading: boolean) => void;
	setBackgroundType: (type: BackgroundType) => void;
	cleanup: () => void;
}

// Create the context with default values
function createBackgroundContext(): BackgroundContext {
	// Initialize state stores
	const dimensions = writable<Dimensions>({ width: 0, height: 0 });
	const performanceMetrics = writable<PerformanceMetrics>({ fps: 60, warnings: [] });
	const isActive = writable<boolean>(true);
	const qualityLevel = writable<QualityLevel>(
		typeof window !== 'undefined' ? detectAppropriateQuality() : 'medium'
	);
	const isLoading = writable<boolean>(false);
	const backgroundType = writable<BackgroundType>('snowfall');
	const isInitialized = writable<boolean>(false);

	// Create derived stores
	const shouldRender = derived(
		[performanceMetrics, isActive],
		([$metrics, $isActive]) => $isActive && $metrics.fps > 30
	);

	const backgroundSystem = derived([backgroundType, qualityLevel], ([$type, $quality]) => {
		const system = BackgroundFactory.createBackgroundSystem({
			type: $type,
			initialQuality: $quality
		});
		return system;
	});

	// Initialize performance tracker
	const performanceTracker = PerformanceTracker.getInstance();

	// Canvas references
	let canvas: HTMLCanvasElement | null = null;
	let ctx: CanvasRenderingContext2D | null = null;
	let animationFrameId: number | null = null;
	let reportCallback: ((metrics: PerformanceMetrics) => void) | null = null;

	// Actions
	function initializeCanvas(canvasElement: HTMLCanvasElement, onReady?: () => void): void {
		canvas = canvasElement;
		ctx = canvas.getContext('2d');

		if (!ctx) {
			console.error('Failed to get canvas context');
			return;
		}

		const isBrowser = typeof window !== 'undefined';
		const initialWidth = isBrowser ? window.innerWidth : 1280;
		const initialHeight = isBrowser ? window.innerHeight : 720;

		dimensions.set({
			width: initialWidth,
			height: initialHeight
		});

		canvas.width = initialWidth;
		canvas.height = initialHeight;

		if (isBrowser) {
			window.addEventListener('resize', handleResize);
			document.addEventListener('visibilitychange', handleVisibilityChange);
		}

		isInitialized.set(true);

		if (onReady) {
			onReady();
		}
	}

	function startAnimation(
		renderFn: (ctx: CanvasRenderingContext2D, dimensions: Dimensions) => void,
		reportFn?: (metrics: PerformanceMetrics) => void
	): void {
		if (!ctx || !canvas) {
			console.error('Canvas not initialized');
			return;
		}

		if (reportFn) {
			reportCallback = reportFn;
		}

		performanceTracker.reset();

		const animate = () => {
			if (!ctx || !canvas) return;

			performanceTracker.update();

			const perfStatus = performanceTracker.getPerformanceStatus();
			performanceMetrics.set({
				fps: perfStatus.fps,
				warnings: perfStatus.warnings
			});

			if (reportCallback) {
				reportCallback(get(performanceMetrics));
			}

			const currentDimensions = get(dimensions);
			const shouldRenderNow = get(isActive) && perfStatus.fps > 30;

			if (shouldRenderNow) {
				ctx.clearRect(0, 0, currentDimensions.width, currentDimensions.height);
				renderFn(ctx, currentDimensions);
			}

			animationFrameId = requestAnimationFrame(animate);
		};

		if (typeof window !== 'undefined') {
			animationFrameId = requestAnimationFrame(animate);
		}
	}

	function stopAnimation(): void {
		if (animationFrameId && typeof window !== 'undefined') {
			cancelAnimationFrame(animationFrameId);
			animationFrameId = null;
		}
	}

	function cleanup(): void {
		stopAnimation();

		if (typeof window !== 'undefined') {
			window.removeEventListener('resize', handleResize);
			document.removeEventListener('visibilitychange', handleVisibilityChange);
		}

		canvas = null;
		ctx = null;
	}

	function setQuality(quality: QualityLevel): void {
		qualityLevel.set(quality);
	}

	function setLoading(loading: boolean): void {
		isLoading.set(loading);
	}

	function setBackgroundType(type: BackgroundType): void {
		backgroundType.set(type);
	}

	// Internal handlers
	function handleResize(): void {
		if (!canvas) return;
		if (typeof window === 'undefined') return;

		const newWidth = window.innerWidth;
		const newHeight = window.innerHeight;

		canvas.width = newWidth;
		canvas.height = newHeight;

		dimensions.set({ width: newWidth, height: newHeight });

		// Temporarily reduce quality during resize for better performance
		const currentQuality = get(qualityLevel);
		qualityLevel.set('low');

		setTimeout(() => {
			qualityLevel.set(currentQuality);
		}, 500);
	}

	function handleVisibilityChange(): void {
		const isVisible = document.visibilityState === 'visible';
		isActive.set(isVisible);
	}

	return {
		// Expose stores
		dimensions,
		performanceMetrics,
		isActive,
		qualityLevel,
		isLoading,
		backgroundType,
		isInitialized,

		// Expose derived stores
		shouldRender,
		backgroundSystem,

		// Expose actions
		initializeCanvas,
		startAnimation,
		stopAnimation,
		setQuality,
		setLoading,
		setBackgroundType,
		cleanup
	};
}

// Set the context
export function setBackgroundContext(): BackgroundContext {
	const context = createBackgroundContext();
	setContext(BACKGROUND_CONTEXT_KEY, context);
	return context;
}

// Get the context
export function getBackgroundContext(): BackgroundContext {
	return getContext<BackgroundContext>(BACKGROUND_CONTEXT_KEY);
}

// Create a background context without setting it
export function createBackgroundContextStore(): BackgroundContext {
	return createBackgroundContext();
}
