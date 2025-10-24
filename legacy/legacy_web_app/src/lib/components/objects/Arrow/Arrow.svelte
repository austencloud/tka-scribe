<!-- src/lib/components/objects/Arrow/Arrow.svelte -->
<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { ArrowData } from './ArrowData';
	import type { ArrowSvgData } from '../../SvgManager/ArrowSvgData';
	import { ArrowSvgLoader } from './services/ArrowSvgLoader';
	import SvgManager from '../../SvgManager/SvgManager';
	import type { Motion } from '../Motion/Motion';
	import ArrowRotAngleManager from './ArrowRotAngleManager';
	import ArrowSvgMirrorManager from './ArrowSvgMirrorManager';
	import type { PictographService } from '$lib/components/Pictograph/PictographService';
	import type { PictographData } from '$lib/types/PictographData';

	// Props with defaults
	export let arrowData: ArrowData;
	export let motion: Motion | null = null;
	export let pictographData: PictographData | null = null;
	export let pictographService: PictographService | null = null;
	export let loadTimeoutMs = 1000; // Configurable timeout

	// Component state
	let svgData: ArrowSvgData | null = null;
	let transform = '';
	let isLoaded = false;
	let hasErrored = false;
	let loadTimeout: NodeJS.Timeout;
	let rotAngleManager: ArrowRotAngleManager | null = null;

	// Services
	const dispatch = createEventDispatcher();
	const svgManager = new SvgManager();
	const svgLoader = new ArrowSvgLoader(svgManager);
	const mirrorManager = new ArrowSvgMirrorManager(arrowData);

	// Initialize the rotation angle manager when pictograph data is available
	$: if (pictographData) {
		rotAngleManager = new ArrowRotAngleManager(pictographData, pictographService || undefined);
	}

	// Update mirror state whenever motion data or arrow data changes
	$: if (arrowData) {
		mirrorManager.updateMirror();
	}

	// Calculate rotation angle (memoized)
	$: rotationAngle = getRotationAngle();

	// Transform calculation (memoized)
	$: if (svgData && arrowData.coords) {
		// Apply transformations in the correct order
		const mirrorTransform = arrowData.svgMirrored ? 'scale(-1, 1)' : '';
		
		transform = `
			translate(${arrowData.coords.x}, ${arrowData.coords.y})
			rotate(${rotationAngle})
			${mirrorTransform}
		`.trim();
	}

	/**
	 * Loads the arrow SVG with error handling and timeout
	 */
	async function loadArrowSvg() {
		try {
			// Set safety timeout
			loadTimeout = setTimeout(() => {
				if (!isLoaded) {
					console.warn(`Arrow loading timed out after ${loadTimeoutMs}ms`);
					isLoaded = true;
					dispatch('loaded', { timeout: true });
				}
			}, loadTimeoutMs);

			// Update mirror state before loading SVG
			mirrorManager.updateMirror();

			// Load the SVG with current configuration
			const result = await svgLoader.loadSvg(
				arrowData.motionType,
				arrowData.startOri,
				arrowData.turns,
				arrowData.color,
				arrowData.svgMirrored
			);

			// Update state and notify
			svgData = result.svgData;
			clearTimeout(loadTimeout);
			isLoaded = true;
			dispatch('loaded');
		} catch (error) {
			handleLoadError(error);
		}
	}

	/**
	 * Handles SVG loading errors with fallback
	 */
	function handleLoadError(error: unknown) {
		console.error('Arrow load error:', error);
		hasErrored = true;
		svgData = svgLoader.getFallbackSvgData();
		clearTimeout(loadTimeout);
		isLoaded = true;
		dispatch('loaded', { error: true });
		dispatch('error', { 
			message: (error as Error)?.message || 'Unknown error',
			component: 'Arrow',
			color: arrowData.color
		});
	}

	/**
	 * Calculates the arrow rotation angle using the manager
	 */
	function getRotationAngle(): number {
		if (motion && rotAngleManager) {
			// Use the rotation angle manager directly
			return rotAngleManager.calculateRotationAngle(
				motion, 
				arrowData.loc, 
				arrowData.svgMirrored
			);
		}
		// Fall back to the arrow data's rotation angle
		return arrowData.rotAngle;
	}

	// Lifecycle hooks
	onMount(() => {
		if (arrowData.motionType) {
			loadArrowSvg();
		} else {
			isLoaded = true;
			dispatch('loaded', { error: true });
		}

		// Cleanup
		return () => clearTimeout(loadTimeout);
	});

	// Reactive loading
	$: {
		if (arrowData.motionType && !isLoaded && !hasErrored) {
			loadArrowSvg();
		}
	}
</script>

{#if svgData && isLoaded}
	<g 
		{transform} 
		data-testid="arrow-{arrowData.color}" 
		data-motion-type={arrowData.motionType}
		data-mirrored={arrowData.svgMirrored ? 'true' : 'false'}
		data-loc={arrowData.loc}
		data-rot-angle={rotationAngle}
		in:fade={{ duration: 300 }}
	>
		<image
			href={svgData.imageSrc}
			width={svgData.viewBox.width}
			height={svgData.viewBox.height}
			x={-svgData.center.x}
			y={-svgData.center.y}
			aria-label="Arrow showing {arrowData.motionType} motion in {arrowData.color} direction"
			role="img"
			on:load={() => dispatch('imageLoaded')}
			on:error={() => dispatch('error', { message: 'Image failed to load' })}
		/>
	</g>
{/if}