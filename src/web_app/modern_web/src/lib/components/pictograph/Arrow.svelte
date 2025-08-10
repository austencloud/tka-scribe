<!--
Arrow Component - Renders SVG arrows with proper positioning
-->
<script lang="ts">
	import type { ArrowData, MotionData } from '$lib/domain';
	import { onMount } from 'svelte';
	import { arrowPositioningService } from './services/arrowPositioningService';

	interface Props {
		arrowData: ArrowData;
		motionData?: MotionData; // MotionData from pictograph
		gridMode?: string;
		letter?: string;
		onLoaded?: (componentType: string) => void;
		onError?: (componentType: string, error: string) => void;
	}

	let {
		arrowData,
		motionData,
		gridMode = 'diamond',
		letter,
		onLoaded,
		onError,
	}: Props = $props();

	let loaded = $state(false);
	let error = $state<string | null>(null);

	// Calculate position using positioning service
	const position = $derived(() => {
		if (!arrowData) return { x: 475, y: 475 };

		// Use arrowPositioningService if available, otherwise default positioning
		try {
			return arrowPositioningService.calculatePosition({
				arrow_type: (arrowData.color as 'blue' | 'red') || 'blue',
				motion_type: motionData?.motion_type || 'static',
				location: arrowData.location || 'n',
				grid_mode: gridMode,
				turns: arrowData.turns || 0,
				...(letter && { letter }),
				start_orientation: motionData?.start_ori || 'in',
				end_orientation: motionData?.end_ori || 'in',
			});
		} catch (e) {
			console.warn('Arrow positioning failed, using default:', e);
			return { x: 475, y: 475 };
		}
	});

	// Get arrow SVG path based on motion type and properties
	const arrowPath = $derived(() => {
		if (!arrowData || !motionData) return '/images/arrows/still.svg';

		const { motion_type, prop_rot_dir, turns } = motionData;
		const baseDir = `/images/arrows/${motion_type}`;

		// For motion types that have turn-based subdirectories (pro, anti, static)
		if (['pro', 'anti', 'static'].includes(motion_type)) {
			const isRadial = prop_rot_dir === 'cw';
			const subDir = isRadial ? 'from_radial' : 'from_nonradial';
			const turnValue = typeof turns === 'number' ? turns.toFixed(1) : '0.0'; // Handle 'fl' case
			return `${baseDir}/${subDir}/${motion_type}_${turnValue}.svg`;
		}

		// For simple motion types (dash, float)
		return `${baseDir}.svg`;
	});

	// Apply color transformation
	const coloredSVG = $derived(() => {
		// This would be where we apply color transformations to the SVG
		// For now, we'll rely on CSS styling
		return arrowPath();
	});

	onMount(() => {
		// Simulate loading
		setTimeout(() => {
			loaded = true;
			onLoaded?.(`${arrowData?.color}-arrow`);
		}, 100);
	});
</script>

<!-- Arrow Group -->
<g
	class="arrow-group {arrowData?.color}-arrow"
	class:loaded
	data-arrow-color={arrowData?.color}
	data-motion-type={motionData?.motion_type}
	data-location={arrowData?.location}
	transform="translate({position().x}, {position().y}) rotate({arrowData?.rotation_angle || 0})"
>
	{#if error}
		<!-- Error state -->
		<circle r="10" fill="red" opacity="0.5" />
		<text x="0" y="4" text-anchor="middle" font-size="8" fill="white">!</text>
	{:else if !loaded}
		<!-- Loading state -->
		<circle r="8" fill={arrowData?.color === 'blue' ? '#2E3192' : '#ED1C24'} opacity="0.3" />
		<animate attributeName="opacity" values="0.3;0.8;0.3" dur="1s" repeatCount="indefinite" />
	{:else}
		<!-- Actual arrow SVG -->
		<image
			href={coloredSVG()}
			width="40"
			height="40"
			x="-20"
			y="-20"
			class="arrow-svg {arrowData?.color}-arrow-svg"
			onerror={() => {
				error = 'Failed to load arrow SVG';
				onError?.(`${arrowData?.color}-arrow`, error);
			}}
		/>

		<!-- Debug info (if needed) -->
		{#if import.meta.env.DEV}
			<circle r="2" fill="red" opacity="0.5" />
			<text x="0" y="-25" text-anchor="middle" font-size="6" fill="black">
				{arrowData?.location}
			</text>
		{/if}
	{/if}
</g>

<style>
	.arrow-group {
		transition: all 0.2s ease;
		transform-origin: center;
	}

	.arrow-group.loaded {
		opacity: 1;
	}

	.arrow-svg {
		pointer-events: none;
	}

	.blue-arrow-svg {
		filter: hue-rotate(240deg) saturate(1.2);
	}

	.red-arrow-svg {
		filter: hue-rotate(0deg) saturate(1.2);
	}

	/* Ensure proper layering */
	.arrow-group {
		z-index: 2;
	}
</style>
