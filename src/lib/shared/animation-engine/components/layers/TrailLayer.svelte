<!--
TrailLayer.svelte

Pure logic component for trail capture and aggregation.
No template - provides trail data via callback to PixiCanvasLayer.

Responsibilities:
- Initialize trail capture service
- Handle real-time frame capture
- Coordinate with path cache for gap-free trails
- Aggregate trail points for rendering
-->

<script lang="ts">
	import type { ITrailCaptureService } from "$lib/features/compose/services/contracts/ITrailCaptureService";
	import { AnimationPathCache, type AnimationPathCacheData } from "$lib/features/compose/services/implementations/AnimationPathCache";
	import type { TrailPoint, TrailSettings, TrailMode } from "$lib/features/compose/shared/domain/types/TrailTypes";
	import type { PropState } from "$lib/features/compose/shared/domain/types/PropState";
	import type { StartPositionData } from "$lib/features/create/shared/domain/models/StartPositionData";
	import type { BeatData } from "$lib/features/create/shared/domain/models/BeatData";

	// Props
	let {
		trailCaptureService = null,
		pathCache = null,
		canvasSize = 500,
		blueProp = null,
		redProp = null,
		secondaryBlueProp = null,
		secondaryRedProp = null,
		bluePropDimensions = { width: 252.8, height: 77.8 },
		redPropDimensions = { width: 252.8, height: 77.8 },
		trailSettings = $bindable(),
		trailsVisible = true,
		currentBeat = 0,
		beatData = null,
		isPlaying = false,
		onTrailPointsUpdate = () => {},
	}: {
		trailCaptureService: ITrailCaptureService | null;
		pathCache: AnimationPathCache | null;
		canvasSize: number;
		blueProp: PropState | null;
		redProp: PropState | null;
		secondaryBlueProp: PropState | null;
		secondaryRedProp: PropState | null;
		bluePropDimensions: { width: number; height: number };
		redPropDimensions: { width: number; height: number };
		trailSettings: TrailSettings;
		trailsVisible: boolean;
		currentBeat: number | undefined;
		beatData: StartPositionData | BeatData | null;
		isPlaying: boolean;
		onTrailPointsUpdate?: (points: {
			blue: TrailPoint[];
			red: TrailPoint[];
			secondaryBlue: TrailPoint[];
			secondaryRed: TrailPoint[];
		}) => void;
	} = $props();

	const TrailMode = {
		OFF: "off",
		LIVE: "live",
		FADE: "fade",
	};

	// ============================================================================
	// TRAIL SERVICE INITIALIZATION
	// ============================================================================

	// Initialize trail capture service reactively
	$effect(() => {
		if (!trailCaptureService) return;
		trailCaptureService.initialize({
			canvasSize,
			bluePropDimensions,
			redPropDimensions,
			trailSettings,
		});
	});

	// ============================================================================
	// TRAIL SETTINGS EFFECTS
	// ============================================================================

	// Watch for trail settings changes
	$effect(() => {
		const currentMode = trailSettings.mode;
		const currentEnabled = trailSettings.enabled;

		// Update service with new settings
		if (trailCaptureService) {
			trailCaptureService.updateSettings(trailSettings);

			if (!currentEnabled || currentMode === TrailMode.OFF) {
				trailCaptureService.clearTrails();
			}
		}
	});

	// Clear trails when props are hidden
	$effect(() => {
		if (!blueProp || !redProp) {
			trailCaptureService?.clearTrails();
		}
	});

	// ============================================================================
	// RENDER LOOP & TRAIL AGGREGATION
	// ============================================================================

	// Capture frames and aggregate trails
	$effect(() => {
		if (!trailCaptureService || !trailsVisible) {
			onTrailPointsUpdate?.({
				blue: [],
				red: [],
				secondaryBlue: [],
				secondaryRed: [],
			});
			return;
		}

		// Trigger capture during playback
		if (trailSettings.enabled && trailSettings.mode !== TrailMode.OFF && isPlaying) {
			const beatNumber = beatData && "beatNumber" in beatData ? beatData.beatNumber : 0;
			trailCaptureService.captureFrame(
				{
					blueProp,
					redProp,
					secondaryBlueProp,
					secondaryRedProp,
				},
				beatNumber,
				performance.now()
			);
		}

		// Get trail points for rendering
		const allTrails = trailCaptureService.getAllTrailPoints();
		onTrailPointsUpdate?.({
			blue: allTrails.blue,
			red: allTrails.red,
			secondaryBlue: allTrails.secondaryBlue,
			secondaryRed: allTrails.secondaryRed,
		});
	});
</script>

<!-- No template - this is a pure logic component -->
