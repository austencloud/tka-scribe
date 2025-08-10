<!--
Arrow Component - Renders SVG arrows with proper positioning and natural sizing
Follows the same pattern as Prop component for consistent sizing behavior
-->
<script lang="ts">
	import type { ArrowData, MotionData } from '$lib/domain';
	import { onMount } from 'svelte';
	// TODO: Fix import issue with positioning service
	// import { arrowPositioningService } from '$lib/components/pictograph/services/arrowPositioningService';

	interface Props {
		arrowData: ArrowData;
		motionData?: MotionData; // MotionData from pictograph
		onLoaded?: (componentType: string) => void;
		onError?: (componentType: string, error: string) => void;
	}

	let { arrowData, motionData, onLoaded, onError }: Props = $props();

	let loaded = $state(false);
	let error = $state<string | null>(null);
	let svgData = $state<{
		imageSrc: string;
		viewBox: { width: number; height: number };
		center: { x: number; y: number };
	} | null>(null);

	// Calculate position using motion data (start location + positioning adjustments)
	const position = $derived(() => {
		if (!arrowData || !motionData) return { x: 475.0, y: 475.0 };

		// First priority: use coordinates if already calculated
		if (arrowData.coordinates) {
			return arrowData.coordinates;
		}

		// Second priority: use position_x/position_y if available
		if (arrowData.position_x !== 0 || arrowData.position_y !== 0) {
			return { x: arrowData.position_x, y: arrowData.position_y };
		}

		// Third priority: calculate from motion data START LOCATION
		// This is the key - arrows are positioned at the START of the motion
		const startLocation = motionData.start_loc;
		if (startLocation) {
			const basePosition = calculateLocationCoordinates(startLocation);

			// TODO: Apply positioning offsets from arrow placement JSON files
			// For now, return the base grid position
			return basePosition;
		}

		// Fallback: try arrowData location field
		if (arrowData.location) {
			return calculateLocationCoordinates(arrowData.location);
		}

		// Final fallback to center
		return { x: 475.0, y: 475.0 };
	});

	// Convert location strings (ne, sw, etc.) to grid coordinates
	// Using exact coordinates from F:\CODE\TKA\data\circle_coords.json (legacy desktop version)
	function calculateLocationCoordinates(location: string): { x: number; y: number } {
		// Diamond grid coordinates from legacy desktop circle_coords.json
		const diamondCoordinates: Record<string, { x: number; y: number }> = {
			// Cardinal directions (hand_points)
			n: { x: 475.0, y: 331.9 },
			e: { x: 618.1, y: 475.0 },
			s: { x: 475.0, y: 618.1 },
			w: { x: 331.9, y: 475.0 },

			// Diagonal directions (layer2_points) - used for arrows
			ne: { x: 618.1, y: 331.9 },
			se: { x: 618.1, y: 618.1 },
			sw: { x: 331.9, y: 618.1 },
			nw: { x: 331.9, y: 331.9 },

			// Center point
			center: { x: 475.0, y: 475.0 },
		};

		const coords = diamondCoordinates[location.toLowerCase()];
		return coords || { x: 475.0, y: 475.0 };
	} // Get arrow SVG path based on motion type and properties
	const arrowPath = $derived(() => {
		if (!arrowData || !motionData) return '/images/arrows/still.svg';

		const { motion_type, turns } = motionData;
		const baseDir = `/images/arrows/${motion_type}`;

		// For motion types that have turn-based subdirectories (pro, anti, static)
		if (['pro', 'anti', 'static'].includes(motion_type)) {
			// Determine if we should use radial vs non-radial arrows
			// Use non-radial only for clock/counter orientations, radial for everything else
			const startOri = arrowData.start_orientation || motionData.start_ori || 'in';
			const endOri = arrowData.end_orientation || motionData.end_ori || 'in';

			const isNonRadial =
				startOri === 'clock' ||
				startOri === 'counter' ||
				endOri === 'clock' ||
				endOri === 'counter';

			const subDir = isNonRadial ? 'from_nonradial' : 'from_radial';
			const turnValue = typeof turns === 'number' ? turns.toFixed(1) : '0.0';
			return `${baseDir}/${subDir}/${motion_type}_${turnValue}.svg`;
		}

		// For simple motion types (dash, float) - use base directory
		return `${baseDir}.svg`;
	});

	// Parse SVG to get proper dimensions and center point (same as Prop component)
	const parseArrowSvg = (
		svgText: string
	): { viewBox: { width: number; height: number }; center: { x: number; y: number } } => {
		const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
		const svg = doc.documentElement;

		// Get viewBox dimensions
		const viewBoxValues = svg.getAttribute('viewBox')?.split(/\s+/) || ['0', '0', '100', '100'];
		const viewBox = {
			width: parseFloat(viewBoxValues[2] || '100') || 100,
			height: parseFloat(viewBoxValues[3] || '100') || 100,
		};

		// Get center point from SVG
		let center = { x: viewBox.width / 2, y: viewBox.height / 2 };

		try {
			const centerElement = doc.getElementById('centerPoint');
			if (centerElement) {
				center = {
					x: parseFloat(centerElement.getAttribute('cx') || '0') || center.x,
					y: parseFloat(centerElement.getAttribute('cy') || '0') || center.y,
				};
			}
		} catch {
			// SVG center calculation failed, using default center
		}

		return { viewBox, center };
	};

	// Apply color transformation to SVG content (same as Prop component)
	const applyColorToSvg = (svgText: string, color: 'blue' | 'red'): string => {
		const colorMap = new Map([
			['blue', '#2E3192'],
			['red', '#ED1C24'],
		]);

		const targetColor = colorMap.get(color) || '#2E3192';

		// Use regex replacement to change fill colors directly
		let coloredSvg = svgText.replace(/fill="#[0-9A-Fa-f]{6}"/g, `fill="${targetColor}"`);
		coloredSvg = coloredSvg.replace(/fill:\s*#[0-9A-Fa-f]{6}/g, `fill:${targetColor}`);

		// Remove the centerPoint circle entirely to prevent unwanted visual elements
		coloredSvg = coloredSvg.replace(/<circle[^>]*id="centerPoint"[^>]*\/?>/, '');

		return coloredSvg;
	};

	// Load SVG data (same pattern as Prop component)
	const loadSvg = async () => {
		try {
			if (!arrowData) throw new Error('No arrow data available');

			const response = await fetch(arrowPath());
			if (!response.ok) throw new Error('Failed to fetch SVG');

			const originalSvgText = await response.text();
			const { viewBox, center } = parseArrowSvg(originalSvgText);

			// Apply color transformation to the SVG
			const coloredSvgText = applyColorToSvg(
				originalSvgText,
				arrowData.color as 'blue' | 'red'
			);

			svgData = {
				imageSrc: `data:image/svg+xml;base64,${btoa(coloredSvgText)}`,
				viewBox,
				center,
			};

			loaded = true;
			onLoaded?.(`${arrowData?.color}-arrow`);
		} catch (e) {
			error = `Failed to load arrow SVG: ${e}`;
			onError?.(`${arrowData?.color}-arrow`, error);
			// Still mark as loaded to prevent blocking
			loaded = true;
		}
	};

	onMount(() => {
		loadSvg();
	});
</script>

<!-- Arrow Group -->
<g
	class="arrow-group {arrowData?.color}-arrow"
	class:loaded
	data-arrow-color={arrowData?.color}
	data-motion-type={motionData?.motion_type}
	data-location={arrowData?.location}
>
	{#if error}
		<!-- Error state -->
		<circle r="10" fill="red" opacity="0.5" />
		<text x="0" y="4" text-anchor="middle" font-size="8" fill="white">!</text>
	{:else if !loaded || !svgData}
		<!-- Loading state -->
		<circle r="8" fill={arrowData?.color === 'blue' ? '#2E3192' : '#ED1C24'} opacity="0.3" />
		<animate attributeName="opacity" values="0.3;0.8;0.3" dur="1s" repeatCount="indefinite" />
	{:else}
		<!-- Actual arrow SVG with natural sizing and centering (same as props) -->
		<image
			href={svgData.imageSrc}
			transform="
				translate({position().x}, {position().y})
				rotate({arrowData?.rotation_angle || 0})
				translate({-svgData.center.x}, {-svgData.center.y})
			"
			width={svgData.viewBox.width}
			height={svgData.viewBox.height}
			preserveAspectRatio="xMidYMid meet"
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

	/* Ensure proper layering */
	.arrow-group {
		z-index: 2;
	}
</style>
