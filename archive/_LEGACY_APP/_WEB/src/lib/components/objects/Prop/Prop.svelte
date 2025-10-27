<script lang="ts">
	import { onMount, createEventDispatcher, tick } from 'svelte';
	import { parsePropSvg } from '../../SvgManager/PropSvgParser';
	import SvgManager from '../../SvgManager/SvgManager';
	import type { PropData } from './PropData';
	import type { PropSvgData } from '../../SvgManager/PropSvgData';
	import PropRotAngleManager from './PropRotAngleManager';
	import { PropChecker } from './PropChecker';

	export let propData: PropData;

	let svgData: PropSvgData | null = null;
	let checker = propData ? new PropChecker(propData) : null;
	let isLoaded = false;
	let hasErrored = false;
	let loadTimeout: ReturnType<typeof setTimeout>;
	let rotAngle = 0;

	const dispatch = createEventDispatcher();
	const svgManager = new SvgManager();

	// Reactive statement to compute rotation angle
    $: {
        // Ensure we have both loc and ori, and the SVG is loaded
        if (propData) {
            // Always try to calculate, even if loc or ori might be undefined
            try {
                const rotAngleManager = new PropRotAngleManager({
                    loc: propData.loc,
                    ori: propData.ori
                });
                
                // Update rotAngle even if loc or ori are potentially undefined
                rotAngle = rotAngleManager.getRotationAngle();
                propData.rotAngle = rotAngle;


            } catch (error) {
                console.warn('Error calculating rotation angle:', error);
            }
        }
    }

	onMount(() => {
		if (propData.propType) {
			loadSvg();
		} else {
			isLoaded = true;
			dispatch('loaded', { error: true });
		}

		return () => {
			clearTimeout(loadTimeout);
		};
	});

	async function loadSvg() {
		try {
			loadTimeout = setTimeout(() => {
				if (!isLoaded) {
					isLoaded = true;
					dispatch('loaded', { timeout: true });
				}
			}, 10);

			const svgText = await svgManager.getPropSvg(propData.propType, propData.color);
			const { viewBox, center } = parsePropSvg(svgText, propData.color);

			svgData = {
				imageSrc: `data:image/svg+xml;base64,${btoa(svgText)}`,
				viewBox,
				center
			};
			propData.svgCenter = center;

			clearTimeout(loadTimeout);
			isLoaded = true;
			dispatch('loaded');
		} catch (error: any) {
			hasErrored = true;

			svgData = {
				imageSrc:
					'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2ZmZiIgLz48dGV4dCB4PSIyMCIgeT0iNTAiIGZpbGw9IiNmMDAiPkVycm9yPC90ZXh0Pjwvc3ZnPg==',
				viewBox: { width: 100, height: 100 },
				center: { x: 50, y: 50 }
			};

			clearTimeout(loadTimeout);
			isLoaded = true;
			dispatch('loaded', { error: true });
			dispatch('error', { message: (error as Error)?.message || 'Unknown error' });
		}
	}

	function handleImageLoad() {
		dispatch('imageLoaded');
	}
	function handleImageError() {
		dispatch('error', { message: 'Image failed to load' });
	}
</script>

<!-- No nested transforms - just directly place everything with proper attributes -->
{#if svgData && isLoaded}
	<g>
		<image
			href={svgData.imageSrc}
			transform="
				translate({propData.coords.x}, {propData.coords.y}) 
				rotate({rotAngle})
				translate({-svgData.center.x}, {-svgData.center.y})
			"
			width={svgData.viewBox.width}
			height={svgData.viewBox.height}
			preserveAspectRatio="xMidYMid meet"
			on:load={handleImageLoad}
			on:error={handleImageError}
		/>
	</g>
{/if}