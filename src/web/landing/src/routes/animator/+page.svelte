<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	
	// State using Svelte 5 runes
	let isClient = $state(false);
	let isLoading = $state(true);
	
	// Canvas and animation state - DOM element references
	let canvasElement: HTMLCanvasElement;
	let sequenceInput: HTMLTextAreaElement;
	let messageArea: HTMLDivElement;
	let playPauseBtn: HTMLButtonElement;
	let resetBtn: HTMLButtonElement;
	let speedSlider: HTMLInputElement;
	let speedValue: HTMLSpanElement;
	let beatSlider: HTMLInputElement;
	let beatValue: HTMLSpanElement;
	let loopCheckbox: HTMLInputElement;
	let infoBeat: HTMLSpanElement;
	let infoStepIndex: HTMLSpanElement;
	let infoT: HTMLSpanElement;
	let totalBeatsDisplay: HTMLSpanElement;
	let loadSequenceBtn: HTMLButtonElement;
	
	// Animation variables
	let animationFrameId: number | null = null;
	let isPlaying = $state(false);
	let currentBeat = $state(0);
	let lastTimestamp: number | null = null;
	let speed = $state(1.0);
	let continuousLoop = $state(false);
	let totalBeats = $state(0);
	let parsedSteps: any[] = [];
	let currentSequence: any = null;
	
	// Prop state
	let bluePropState = { centerPathAngle: 0, staffRotationAngle: 0, x: 0, y: 0 };
	let redPropState = { centerPathAngle: 0, staffRotationAngle: 0, x: 0, y: 0 };
	
	// Canvas and rendering
	let ctx: CanvasRenderingContext2D | null = null;
	let gridImage: HTMLImageElement, blueStaffImage: HTMLImageElement, redStaffImage: HTMLImageElement;
	let imagesLoaded = $state(false);
	let canvasReady = $state(false);
	
	// Constants
	const canvasSize = 600;
	const PI = Math.PI;
	const TWO_PI = 2 * PI;
	const HALF_PI = PI / 2;
	const GRID_VIEWBOX_SIZE = 950;
	const GRID_CENTER = GRID_VIEWBOX_SIZE / 2;
	const GRID_HALFWAY_POINT_OFFSET = 151.5;
	const STAFF_VIEWBOX_WIDTH = 252.8;
	const STAFF_VIEWBOX_HEIGHT = 77.8;
	const STAFF_CENTER_X = 126.4;
	const STAFF_CENTER_Y = 38.9;
	const gridScaleFactor = canvasSize / GRID_VIEWBOX_SIZE;
	const scaledHalfwayRadius = GRID_HALFWAY_POINT_OFFSET * gridScaleFactor;
	
	// Metadata for SEO and accessibility
	const title = 'Pictograph Animator - Interactive Flow Art Visualization';
	const description = 'Visualize and animate flow art patterns with this interactive tool for props like poi, staff, and hoops.';
	
	// Default sequence data
	const defaultSequence = [
		{
			word: 'ALFBBLFA',
			author: 'Austen Cloud',
			level: 0,
			prop_type: 'staff',
			grid_mode: 'diamond',
			is_circular: false,
			can_be_CAP: false,
			is_strict_rotated_CAP: false,
			is_strict_mirrored_CAP: false,
			is_strict_swapped_CAP: false,
			is_mirrored_swapped_CAP: false,
			is_rotated_swapped_CAP: false
		},
		{
			beat: 0,
			sequence_start_position: 'alpha',
			letter: 'α',
			end_pos: 'alpha1',
			timing: 'none',
			direction: 'none',
			blue_attributes: {
				start_loc: 's',
				end_loc: 's',
				start_ori: 'in',
				end_ori: 'in',
				prop_rot_dir: 'no_rot',
				turns: 0,
				motion_type: 'static'
			},
			red_attributes: {
				start_loc: 'n',
				end_loc: 'n',
				start_ori: 'in',
				end_ori: 'in',
				prop_rot_dir: 'no_rot',
				turns: 0,
				motion_type: 'static'
			}
		},
		{
			beat: 1,
			letter: 'A',
			letter_type: 'Type1',
			duration: 1,
			start_pos: 'alpha1',
			end_pos: 'alpha3',
			timing: 'split',
			direction: 'same',
			blue_attributes: {
				motion_type: 'pro',
				start_ori: 'in',
				prop_rot_dir: 'cw',
				start_loc: 's',
				end_loc: 'w',
				turns: 0,
				end_ori: 'in'
			},
			red_attributes: {
				motion_type: 'pro',
				start_ori: 'in',
				prop_rot_dir: 'cw',
				start_loc: 'n',
				end_loc: 'e',
				turns: 0,
				end_ori: 'in'
			}
		},
		{
			beat: 2,
			letter: 'L',
			letter_type: 'Type1',
			duration: 1,
			start_pos: 'alpha3',
			end_pos: 'beta1',
			timing: 'tog',
			direction: 'opp',
			blue_attributes: {
				motion_type: 'pro',
				start_ori: 'in',
				prop_rot_dir: 'cw',
				start_loc: 'w',
				end_loc: 'n',
				turns: 0,
				end_ori: 'in'
			},
			red_attributes: {
				motion_type: 'anti',
				start_ori: 'in',
				prop_rot_dir: 'cw',
				start_loc: 'e',
				end_loc: 'n',
				turns: 0,
				end_ori: 'out'
			}
		},
		{
			beat: 3,
			letter: 'F',
			letter_type: 'Type1',
			duration: 1,
			start_pos: 'beta1',
			end_pos: 'alpha7',
			timing: 'tog',
			direction: 'opp',
			blue_attributes: {
				motion_type: 'pro',
				start_ori: 'in',
				prop_rot_dir: 'cw',
				start_loc: 'n',
				end_loc: 'e',
				turns: 0,
				end_ori: 'in'
			},
			red_attributes: {
				motion_type: 'anti',
				start_ori: 'out',
				prop_rot_dir: 'cw',
				start_loc: 'n',
				end_loc: 'w',
				turns: 0,
				end_ori: 'in'
			}
		},
		{
			beat: 4,
			letter: 'B',
			letter_type: 'Type1',
			duration: 1,
			start_pos: 'alpha7',
			end_pos: 'alpha5',
			timing: 'split',
			direction: 'same',
			blue_attributes: {
				motion_type: 'anti',
				start_ori: 'in',
				prop_rot_dir: 'cw',
				start_loc: 'e',
				end_loc: 'n',
				turns: 0,
				end_ori: 'out'
			},
			red_attributes: {
				motion_type: 'anti',
				start_ori: 'in',
				prop_rot_dir: 'cw',
				start_loc: 'w',
				end_loc: 's',
				turns: 0,
				end_ori: 'out'
			}
		},
		{
			beat: 5,
			letter: 'B',
			letter_type: 'Type1',
			duration: 1,
			start_pos: 'alpha5',
			end_pos: 'alpha3',
			timing: 'split',
			direction: 'same',
			blue_attributes: {
				motion_type: 'anti',
				start_ori: 'out',
				prop_rot_dir: 'cw',
				start_loc: 'n',
				end_loc: 'w',
				turns: 0,
				end_ori: 'in'
			},
			red_attributes: {
				motion_type: 'anti',
				start_ori: 'out',
				prop_rot_dir: 'cw',
				start_loc: 's',
				end_loc: 'e',
				turns: 0,
				end_ori: 'in'
			}
		},
		{
			beat: 6,
			letter: 'L',
			letter_type: 'Type1',
			duration: 1,
			start_pos: 'alpha3',
			end_pos: 'beta5',
			timing: 'tog',
			direction: 'opp',
			blue_attributes: {
				motion_type: 'anti',
				start_ori: 'in',
				prop_rot_dir: 'cw',
				start_loc: 'w',
				end_loc: 's',
				turns: 0,
				end_ori: 'out'
			},
			red_attributes: {
				motion_type: 'pro',
				start_ori: 'in',
				prop_rot_dir: 'cw',
				start_loc: 'e',
				end_loc: 's',
				turns: 0,
				end_ori: 'in'
			}
		},
		{
			beat: 7,
			letter: 'F',
			letter_type: 'Type1',
			duration: 1,
			start_pos: 'beta5',
			end_pos: 'alpha7',
			timing: 'tog',
			direction: 'opp',
			blue_attributes: {
				motion_type: 'anti',
				start_ori: 'out',
				prop_rot_dir: 'cw',
				start_loc: 's',
				end_loc: 'e',
				turns: 0,
				end_ori: 'in'
			},
			red_attributes: {
				motion_type: 'pro',
				start_ori: 'in',
				prop_rot_dir: 'cw',
				start_loc: 's',
				end_loc: 'w',
				turns: 0,
				end_ori: 'in'
			}
		},
		{
			beat: 8,
			letter: 'A',
			letter_type: 'Type1',
			duration: 1,
			start_pos: 'alpha7',
			end_pos: 'alpha1',
			timing: 'split',
			direction: 'same',
			blue_attributes: {
				motion_type: 'pro',
				start_ori: 'in',
				prop_rot_dir: 'cw',
				start_loc: 'e',
				end_loc: 's',
				turns: 0,
				end_ori: 'in'
			},
			red_attributes: {
				motion_type: 'pro',
				start_ori: 'in',
				prop_rot_dir: 'cw',
				start_loc: 'w',
				end_loc: 'n',
				turns: 0,
				end_ori: 'in'
			}
		}
	];
	
	// SVG strings for images
	const gridSvgString = `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 950 950" style="enable-background:new 0 0 950 950; background-color: #ffffff;" xml:space="preserve"><g id="outer_points"><circle fill="#000000" cx="475" cy="175" r="25"/><circle fill="#000000" cx="775" cy="475" r="25"/><circle fill="#000000" cx="475" cy="775" r="25"/><circle fill="#000000" cx="175" cy="475" r="25"/></g><g id="halfway_points"><circle fill="#000000" cx="475" cy="323.5" r="8"/><circle fill="#000000" cx="626.5" cy="475" r="8"/><circle fill="#000000" cx="475" cy="626.5" r="8"/><circle fill="#000000" cx="323.5" cy="475" r="8"/></g><g id="center_group"><circle fill="#000000" cx="475" cy="475" r="12"/></g></svg>`;
	const staffBaseSvgString = (fillColor: string) =>
		`<svg version="1.1" id="staff" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 252.8 77.8" style="enable-background:new 0 0 252.8 77.8;" xml:space="preserve"><path fill="${fillColor}" stroke="#555555" stroke-width="1" stroke-miterlimit="10" d="M251.4,67.7V10.1c0-4.8-4.1-8.7-9.1-8.7s-9.1,3.9-9.1,8.7v19.2H10.3c-4.9,0-8.9,3.8-8.9,8.5V41 c0,4.6,4,8.5,8.9,8.5h222.9v18.2c0,4.8,4.1,8.7,9.1,8.7S251.4,72.5,251.4,67.7z"/><circle id="centerPoint" fill="#FF0000" cx="126.4" cy="38.9" r="5" /></svg>`;
	
	// Location angles mapping
	const locationAngles = { e: 0, s: HALF_PI, w: PI, n: -HALF_PI };
	
	// Utility functions
	function normalizeAnglePositive(angle: number): number {
		return ((angle % TWO_PI) + TWO_PI) % TWO_PI;
	}
	
	function normalizeAngleSigned(angle: number): number {
		let norm = normalizeAnglePositive(angle);
		return norm > PI ? norm - TWO_PI : norm;
	}
	
	function mapPositionToAngle(loc: string): number {
		const l = loc?.toLowerCase();
		return locationAngles[l as keyof typeof locationAngles] ?? 0;
	}
	
	function mapOrientationToAngle(ori: string, centerPathAngle: number): number {
		if (!ori) return centerPathAngle + PI;
		const l = ori.toLowerCase();
		if (locationAngles.hasOwnProperty(l)) return locationAngles[l as keyof typeof locationAngles];
		if (l === 'in') return normalizeAnglePositive(centerPathAngle + PI);
		if (l === 'out') return normalizeAnglePositive(centerPathAngle);
		return normalizeAnglePositive(centerPathAngle + PI);
	}
	
	function lerp(a: number, b: number, t: number): number {
		return a * (1 - t) + b * t;
	}
	
	function lerpAngle(a: number, b: number, t: number): number {
		const d = normalizeAngleSigned(b - a);
		return normalizeAnglePositive(a + d * t);
	}
	
	// Physics functions
	function calculateProIsolationStaffAngle(centerPathAngle: number, propRotDir: string): number {
		return normalizeAnglePositive(centerPathAngle + PI);
	}
	
	function calculateAntispinTargetAngle(
		startCenterAngle: number,
		endCenterAngle: number,
		startStaffAngle: number,
		turns: number,
		propRotDir: string
	): number {
		let delta = normalizeAngleSigned(endCenterAngle - startCenterAngle);
		const base = -delta;
		const turn = PI * turns;
		const dir = propRotDir?.toLowerCase() === 'ccw' ? -1 : 1;
		return normalizeAnglePositive(startStaffAngle + base + turn * dir);
	}
	
	function calculateStaticStaffAngle(centerPathAngle: number, orientation: string): number {
		return mapOrientationToAngle(orientation, centerPathAngle);
	}
	
	function calculateDashTargetAngle(
		startCenterAngle: number,
		endCenterAngle: number,
		startStaffAngle: number,
		propRotDir: string
	): number {
		return startStaffAngle;
	}
	
	// Core logic
	function calculateStepEndpoints(stepDefinition: any, propType: string) {
		const attributes =
			propType === 'blue' ? stepDefinition.blue_attributes : stepDefinition.red_attributes;
		if (!attributes) return null;
		
		const {
			start_loc,
			end_loc,
			start_ori,
			end_ori,
			motion_type,
			prop_rot_dir,
			turns = 0
		} = attributes;
		
		const startCenterAngle = mapPositionToAngle(start_loc);
		const startStaffAngle = mapOrientationToAngle(start_ori || 'in', startCenterAngle);
		const targetCenterAngle = mapPositionToAngle(end_loc);
		
		let calculatedTargetStaffAngle;
		
		switch (motion_type) {
			case 'pro':
				calculatedTargetStaffAngle = calculateProIsolationStaffAngle(
					targetCenterAngle,
					prop_rot_dir
				);
				break;
			case 'anti':
				calculatedTargetStaffAngle = calculateAntispinTargetAngle(
					startCenterAngle,
					targetCenterAngle,
					startStaffAngle,
					turns,
					prop_rot_dir
				);
				break;
			case 'static':
				let targetStaticAngle = startStaffAngle;
				const endOriAngleStatic = mapOrientationToAngle(end_ori || 'in', targetCenterAngle);
				const angleDiffStatic = normalizeAngleSigned(endOriAngleStatic - startStaffAngle);
				calculatedTargetStaffAngle =
					Math.abs(angleDiffStatic) > 0.1 ? endOriAngleStatic : startStaffAngle;
				break;
			case 'dash':
				calculatedTargetStaffAngle = calculateDashTargetAngle(
					startCenterAngle,
					targetCenterAngle,
					startStaffAngle,
					prop_rot_dir
				);
				break;
			default:
				console.warn(`Unknown motion type '${motion_type}'. Treating as static.`);
				calculatedTargetStaffAngle = startStaffAngle;
				break;
		}
		
		if (motion_type !== 'pro') {
			const endOriAngleOverride = mapOrientationToAngle(end_ori || 'in', targetCenterAngle);
			const explicitEndOri = ['n', 'e', 's', 'w', 'in', 'out'].includes(
				(end_ori || '').toLowerCase()
			);
			if (explicitEndOri) {
				calculatedTargetStaffAngle = endOriAngleOverride;
			}
		}
		
		return {
			startCenterAngle,
			startStaffAngle,
			targetCenterAngle,
			targetStaffAngle: calculatedTargetStaffAngle
		};
	}
	
	// Image loading
	function loadImage(svgString: string): Promise<HTMLImageElement> {
		console.log('🖼️ IMAGE: Loading image from SVG (' + svgString.length + ' chars)');
		return new Promise((resolve, reject) => {
			const img = new Image();
			const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
			const url = URL.createObjectURL(svgBlob);
			
			img.onload = () => {
				console.log('✅ IMAGE: Loaded successfully:', img.width + 'x' + img.height);
				URL.revokeObjectURL(url);
				resolve(img);
			};
			
			img.onerror = (e) => {
				console.error('❌ IMAGE: Load error:', e);
				URL.revokeObjectURL(url);
				reject(new Error('Image load error: ' + e));
			};
			
			img.src = url;
			console.log('🖼️ IMAGE: Created blob URL:', url);
		});
	}
	
	async function loadAllImages() {
		try {
			console.log('🖼️ IMAGES: Starting to load images...');
			console.log('🖼️ IMAGES: Grid SVG length:', gridSvgString.length);
			console.log('🖼️ IMAGES: Staff SVG template ready:', typeof staffBaseSvgString);
			
			[gridImage, blueStaffImage, redStaffImage] = await Promise.all([
				loadImage(gridSvgString),
				loadImage(staffBaseSvgString('#2E3192')),
				loadImage(staffBaseSvgString('#ED1C24'))
			]);
			
			imagesLoaded = true;
			console.log('✅ IMAGES: All images loaded successfully!');
			console.log('🖼️ IMAGES: Grid image dimensions:', gridImage.width, 'x', gridImage.height);
			console.log('🖼️ IMAGES: Blue staff dimensions:', blueStaffImage.width, 'x', blueStaffImage.height);
			console.log('🖼️ IMAGES: Red staff dimensions:', redStaffImage.width, 'x', redStaffImage.height);
			
			initialize();
			render(); // Initial render
			console.log('✅ INITIALIZATION: Complete!');
		} catch (error) {
			console.error('❌ IMAGES: Failed to load images:', error);
			showMessage('error', 'Failed to load animation images. Please refresh the page.');
			if (ctx) {
				ctx.fillStyle = '#dc2626';
				ctx.font = '16px Arial';
				ctx.textAlign = 'center';
				ctx.fillText('Error loading images.', canvasSize / 2, canvasSize / 2);
				ctx.fillText('Please refresh the page.', canvasSize / 2, canvasSize / 2 + 25);
			}
		}
	}
	
	// Rendering functions
	function drawGrid() {
		console.log('🗺️ GRID: Drawing grid...', { imagesLoaded, ctx: !!ctx, gridImage: !!gridImage });
		if (!imagesLoaded || !ctx || !gridImage) {
			console.log('⚠️ GRID: Skipped - missing requirements');
			return;
		}
		try {
			console.log('🗺️ GRID: Drawing image at 0,0 with size', canvasSize, 'x', canvasSize);
			ctx.drawImage(gridImage, 0, 0, canvasSize, canvasSize);
			console.log('✅ GRID: Drawn successfully!');
		} catch (error) {
			console.error('❌ GRID: Error drawing:', error);
		}
	}
	
	function drawStaff(propState: any, staffImage: HTMLImageElement) {
		if (!imagesLoaded || !propState || !ctx) return;
		
		const centerX = canvasSize / 2;
		const centerY = canvasSize / 2;
		const inwardFactor = 0.95;
		const x = centerX + Math.cos(propState.centerPathAngle) * scaledHalfwayRadius * inwardFactor;
		const y = centerY + Math.sin(propState.centerPathAngle) * scaledHalfwayRadius * inwardFactor;
		
		const staffWidth = STAFF_VIEWBOX_WIDTH * gridScaleFactor;
		const staffHeight = STAFF_VIEWBOX_HEIGHT * gridScaleFactor;
		
		ctx.save();
		ctx.translate(x, y);
		ctx.rotate(propState.staffRotationAngle);
		ctx.drawImage(
			staffImage,
			-STAFF_CENTER_X * gridScaleFactor,
			-STAFF_CENTER_Y * gridScaleFactor,
			staffWidth,
			staffHeight
		);
		ctx.restore();
	}
	
	function render() {
		console.log('🎨 RENDER: Starting render...', { ctx: !!ctx, imagesLoaded });
		if (!ctx || !imagesLoaded) {
			console.log('⚠️ RENDER: Skipped - missing requirements');
			return;
		}
		console.log('🎨 RENDER: Clearing canvas...');
		ctx.clearRect(0, 0, canvasSize, canvasSize);
		console.log('🎨 RENDER: Drawing grid...');
		drawGrid();
		console.log('🎨 RENDER: Drawing blue staff...');
		drawStaff(bluePropState, blueStaffImage);
		console.log('🎨 RENDER: Drawing red staff...');
		drawStaff(redPropState, redStaffImage);
		console.log('✅ RENDER: Complete!');
	}
	
	// Animation loop
	function animationLoop(timestamp: number) {
		console.log('🎦 LOOP: Animation frame called', { isPlaying, timestamp });
		if (!isPlaying) {
			console.log('⚠️ LOOP: Not playing, exiting');
			return;
		}

		if (lastTimestamp === null) lastTimestamp = timestamp;
		const deltaTime = timestamp - lastTimestamp;
		lastTimestamp = timestamp;
		const effectiveSpeed = Math.max(0.01, speed);
		const oldBeat = currentBeat;
		currentBeat += (deltaTime / 1000) * effectiveSpeed;
		
		console.log('🎦 LOOP: Beat update', { oldBeat, newBeat: currentBeat, deltaTime, effectiveSpeed });

		// Loop Handling
		if (currentBeat >= totalBeats) {
			if (continuousLoop) {
				currentBeat = 0;
				lastTimestamp = timestamp;
				console.log('🔁 LOOP: Looping back to time 0');
			} else {
				currentBeat = totalBeats;
				pause();
				console.log('🏁 LOOP: Animation ended.');
				updateBeat(currentBeat, true);
				updateUI();
				return;
			}
		}

		// State Calculation for Current Frame
		const clampedBeat = Math.max(0, Math.min(currentBeat, totalBeats));
		const currentAnimationStepIndex = Math.floor(
			clampedBeat === totalBeats ? totalBeats - 1 : clampedBeat
		);
		const currentStepArrayIndex = currentAnimationStepIndex + 2;
		const t = clampedBeat === totalBeats ? 1.0 : clampedBeat - currentAnimationStepIndex;

		const stepDefinition = parsedSteps[currentStepArrayIndex];
		
		console.log('🎦 LOOP: Step calculation', { 
			clampedBeat, 
			currentAnimationStepIndex, 
			currentStepArrayIndex, 
			t, 
			stepDefinition: !!stepDefinition 
		});

		if (!stepDefinition) {
			console.error(
				`❌ LOOP: No step definition for array index ${currentStepArrayIndex} (beat: ${clampedBeat})`
			);
			pause();
			return;
		}

		const blueEndpoints = calculateStepEndpoints(stepDefinition, 'blue');
		const redEndpoints = calculateStepEndpoints(stepDefinition, 'red');

		if (blueEndpoints && redEndpoints) {
			bluePropState.centerPathAngle = lerpAngle(
				blueEndpoints.startCenterAngle,
				blueEndpoints.targetCenterAngle,
				t
			);
			bluePropState.staffRotationAngle = lerpAngle(
				blueEndpoints.startStaffAngle,
				blueEndpoints.targetStaffAngle,
				t
			);
			redPropState.centerPathAngle = lerpAngle(
				redEndpoints.startCenterAngle,
				redEndpoints.targetCenterAngle,
				t
			);
			redPropState.staffRotationAngle = lerpAngle(
				redEndpoints.startStaffAngle,
				redEndpoints.targetStaffAngle,
				t
			);

			if (stepDefinition.blue_attributes.motion_type === 'pro') {
				bluePropState.staffRotationAngle = calculateProIsolationStaffAngle(
					bluePropState.centerPathAngle,
					stepDefinition.blue_attributes.prop_rot_dir
				);
			}
			if (stepDefinition.red_attributes.motion_type === 'pro') {
				redPropState.staffRotationAngle = calculateProIsolationStaffAngle(
					redPropState.centerPathAngle,
					stepDefinition.red_attributes.prop_rot_dir
				);
			}
			
			console.log('🎦 LOOP: Updated prop states', {
				blue: { centerAngle: bluePropState.centerPathAngle, staffAngle: bluePropState.staffRotationAngle },
				red: { centerAngle: redPropState.centerPathAngle, staffAngle: redPropState.staffRotationAngle }
			});
		} else {
			console.error(`❌ LOOP: Could not calculate endpoints for step index ${currentStepArrayIndex}`);
		}

		render();
		updateUI();

		if (isPlaying) {
			animationFrameId = requestAnimationFrame(animationLoop);
		}
	}
	
	// Control functions
	function play() {
		console.log('▶️ PLAY: Starting animation...');
		if (isPlaying) {
			console.log('⚠️ PLAY: Already playing, ignoring');
			return;
		}
		console.log('▶️ PLAY: Setting isPlaying to true');
		isPlaying = true;
		if (playPauseBtn) {
			playPauseBtn.textContent = '⏸';
			playPauseBtn.classList.add('active');
			console.log('▶️ PLAY: Updated button UI');
		}
		lastTimestamp = null;
		console.log('▶️ PLAY: Starting animation frame loop...');
		animationFrameId = requestAnimationFrame(animationLoop);
		console.log('✅ PLAY: Animation started!');
	}
	
	function pause() {
		console.log('⏸️ PAUSE: Pausing animation...');
		if (!isPlaying) {
			console.log('⚠️ PAUSE: Not playing, ignoring');
			return;
		}
		isPlaying = false;
		if (playPauseBtn) {
			playPauseBtn.textContent = '▶️';
			playPauseBtn.classList.remove('active');
			console.log('⏸️ PAUSE: Updated button UI');
		}
		if (animationFrameId) {
			cancelAnimationFrame(animationFrameId);
			animationFrameId = null;
			console.log('⏸️ PAUSE: Cancelled animation frame');
		}
		console.log('✅ PAUSE: Animation paused!');
	}
	
	function reset() {
		pause();
		currentBeat = 0;
		initializeState();
		render();
		updateUI();
	}
	
	function updateSpeed(newSpeed: number) {
		speed = parseFloat(newSpeed.toString());
		if (speedValue) speedValue.textContent = `${speed.toFixed(1)}x`;
	}
	
	function updateBeat(newBeat: number, renderImmediately = true) {
		currentBeat = Math.max(0, Math.min(parseFloat(newBeat.toString()), totalBeats));
		if (beatValue) beatValue.textContent = currentBeat.toFixed(2);
		if (beatSlider) beatSlider.value = currentBeat.toString();

		const clampedBeat = currentBeat;
		const currentAnimationStepIndex = Math.floor(
			clampedBeat === totalBeats ? totalBeats - 1 : clampedBeat
		);
		const currentStepArrayIndex = currentAnimationStepIndex + 2;
		const t = clampedBeat === totalBeats ? 1.0 : clampedBeat - currentAnimationStepIndex;
		const stepDef = parsedSteps[currentStepArrayIndex];

		if (stepDef) {
			const blueEP = calculateStepEndpoints(stepDef, 'blue');
			const redEP = calculateStepEndpoints(stepDef, 'red');
			if (blueEP && redEP) {
				bluePropState.centerPathAngle = lerpAngle(
					blueEP.startCenterAngle,
					blueEP.targetCenterAngle,
					t
				);
				bluePropState.staffRotationAngle = lerpAngle(
					blueEP.startStaffAngle,
					blueEP.targetStaffAngle,
					t
				);
				redPropState.centerPathAngle = lerpAngle(
					redEP.startCenterAngle,
					redEP.targetCenterAngle,
					t
				);
				redPropState.staffRotationAngle = lerpAngle(
					redEP.startStaffAngle,
					redEP.targetStaffAngle,
					t
				);
				if (stepDef.blue_attributes.motion_type === 'pro') {
					bluePropState.staffRotationAngle = calculateProIsolationStaffAngle(
						bluePropState.centerPathAngle,
						stepDef.blue_attributes.prop_rot_dir
					);
				}
				if (stepDef.red_attributes.motion_type === 'pro') {
					redPropState.staffRotationAngle = calculateProIsolationStaffAngle(
						redPropState.centerPathAngle,
						stepDef.red_attributes.prop_rot_dir
					);
				}
			}
		} else if (currentBeat === 0) {
			initializeState();
		} else {
			console.warn(
				`Could not find step definition for beat ${currentBeat} (index ${currentStepArrayIndex})`
			);
		}

		if (renderImmediately) render();
		updateInfoDisplay();
	}
	
	function updateUI() {
		if (beatSlider) beatSlider.value = currentBeat.toString();
		if (beatValue) beatValue.textContent = currentBeat.toFixed(2);
		updateInfoDisplay();
	}
	
	function updateInfoDisplay() {
		const clampedBeat = Math.max(0, Math.min(currentBeat, totalBeats));
		const currentAnimationStepIndex = Math.floor(
			clampedBeat === totalBeats ? totalBeats - 1 : clampedBeat
		);
		const displayBeatNum = clampedBeat === totalBeats ? 'End' : currentAnimationStepIndex + 1;
		const t = clampedBeat === totalBeats ? 1.0 : clampedBeat - currentAnimationStepIndex;
		
		if (infoBeat) infoBeat.textContent = clampedBeat.toFixed(2);
		if (infoStepIndex) infoStepIndex.textContent = displayBeatNum.toString();
		if (infoT) infoT.textContent = t.toFixed(3);
	}
	
	// Initialization
	function initializeState() {
		if (!parsedSteps || parsedSteps.length < 2) return;
		const startStateStep = parsedSteps[1];
		const blueStartEndpoints = calculateStepEndpoints(startStateStep, 'blue');
		const redStartEndpoints = calculateStepEndpoints(startStateStep, 'red');
		
		if (blueStartEndpoints) {
			bluePropState.centerPathAngle = blueStartEndpoints.startCenterAngle;
			bluePropState.staffRotationAngle = blueStartEndpoints.startStaffAngle;
		} else {
			bluePropState.centerPathAngle = mapPositionToAngle('s');
			bluePropState.staffRotationAngle = bluePropState.centerPathAngle + PI;
		}
		
		if (redStartEndpoints) {
			redPropState.centerPathAngle = redStartEndpoints.startCenterAngle;
			redPropState.staffRotationAngle = redStartEndpoints.startStaffAngle;
		} else {
			redPropState.centerPathAngle = mapPositionToAngle('n');
			redPropState.staffRotationAngle = redPropState.centerPathAngle + PI;
		}
		
		console.log('Initial State Set (from original beat 0 def):', {
			blue: { ...bluePropState },
			red: { ...redPropState }
		});
	}
	
	function processSequenceData(sequenceArray: any[]) {
		console.log('🎵 SEQUENCE: Processing sequence data...', { length: sequenceArray.length });
		if (!Array.isArray(sequenceArray) || sequenceArray.length < 2) {
			throw new Error(
				'Invalid sequence data: Must be an array with at least 2 elements (metadata + start state).'
			);
		}
		
		if (typeof sequenceArray[0] !== 'object' || typeof sequenceArray[1] !== 'object') {
			throw new Error('Invalid sequence data: First two elements must be objects.');
		}

		parsedSteps = sequenceArray.map((step, index) => ({ ...step, arrayIndex: index }));
		totalBeats = parsedSteps.length - 2;
		
		console.log('🎵 SEQUENCE: Parsed steps:', parsedSteps.length);
		console.log('🎵 SEQUENCE: Total beats:', totalBeats);

		if (totalBeats <= 0) {
			throw new Error('Sequence has no animation steps.');
		}

		// Update UI elements for the new sequence length
		if (beatSlider) {
			beatSlider.max = totalBeats.toString();
			console.log('🎵 SEQUENCE: Updated beat slider max to:', totalBeats);
		}
		if (beatValue && totalBeatsDisplay) {
			beatValue.textContent = `0.00`;
			totalBeatsDisplay.textContent = totalBeats.toString();
			console.log('🎵 SEQUENCE: Updated UI displays');
		}

		initializeState();
		render();
		updateUI();
		console.log('✅ SEQUENCE: Processing complete!');
	}
	
	function loadPastedSequence() {
		if (!sequenceInput || !messageArea) return;
		
		const jsonString = sequenceInput.value.trim();
		// Clear previous messages
		messageArea.className = 'message hidden';

		if (!jsonString) {
			showMessage('error', 'Textarea is empty.');
			return;
		}

		try {
			const pastedData = JSON.parse(jsonString);
			pause();
			currentBeat = 0;
			currentSequence = pastedData;
			processSequenceData(currentSequence);
			showMessage(
				'success',
				`Sequence "${currentSequence[0]?.word || 'Untitled'}" loaded successfully (${totalBeats} beats).`
			);
			sequenceInput.value = '';
		} catch (e: any) {
			console.error('Failed to parse or process sequence:', e);
			showMessage('error', `Error loading sequence: ${e.message}`);
		}
	}
	
	function showMessage(type: 'error' | 'success', text: string) {
		if (!messageArea) return;
		messageArea.textContent = text;
		messageArea.className = `message ${type === 'error' ? 'error' : 'success'}`;
		console.log('Showing message:', type, text);
	}
	
	function initialize() {
		console.log('Initializing animator...');
		// Load default sequence initially
		currentSequence = defaultSequence;
		try {
			processSequenceData(currentSequence);
			console.log('Default sequence loaded successfully');
		} catch (e: any) {
			console.error('Error processing default sequence:', e);
			showMessage('error', `Failed to load default sequence: ${e.message}`);
		}
	}
	
	// Handle client-side hydration properly to avoid SSR issues
	$effect(() => {
		if (browser) {
			isClient = true;
			setTimeout(() => {
				isLoading = false;
			}, 100);
		}
	});

	// Initialize canvas when element is available
	$effect(() => {
		if (canvasElement && !ctx && !isLoading) {
			console.log('🎯 EFFECT: Canvas element detected, starting initialization...');
			console.log('🎯 CANVAS: Element details:', {
				width: canvasElement.width,
				height: canvasElement.height,
				clientWidth: canvasElement.clientWidth,
				clientHeight: canvasElement.clientHeight,
				offsetWidth: canvasElement.offsetWidth,
				offsetHeight: canvasElement.offsetHeight
			});
			// Small delay to ensure DOM is fully ready
			setTimeout(() => {
				console.log('🎯 CANVAS: Getting 2D context...');
				ctx = canvasElement.getContext('2d');
				if (ctx) {
					canvasReady = true;
					console.log('✅ CANVAS: Context created successfully!');
					
					// Test drawing to verify canvas works
					console.log('🎯 CANVAS: Drawing test pattern...');
					try {
						ctx.fillStyle = '#e5e7eb';
						ctx.fillRect(0, 0, canvasSize, canvasSize);
						ctx.fillStyle = '#1f2937';
						ctx.font = '16px Arial';
						ctx.textAlign = 'center';
						ctx.fillText('Loading animation assets...', canvasSize / 2, canvasSize / 2);
						console.log('✅ CANVAS: Test pattern drawn successfully!');
					} catch (error) {
						console.error('❌ CANVAS: Error drawing test pattern:', error);
					}
					
					loadAllImages();
				} else {
					console.error('❌ CANVAS: Failed to get 2D context');
					showMessage('error', 'Failed to initialize canvas. Please refresh the page.');
				}
			}, 100);
		} else {
			if (!canvasElement) console.log('⏳ EFFECT: Canvas element not ready yet');
			if (ctx) console.log('⏳ EFFECT: Canvas context already exists');
			if (isLoading) console.log('⏳ EFFECT: Still loading, waiting...');
		}
	});
	
	// Set up event listeners after elements are available
	$effect(() => {
		if (!isClient) {
			console.log('⏳ EVENTS: Client not ready yet');
			return;
		}
		
		// Add a small delay to ensure DOM elements are fully bound
		setTimeout(() => {
			console.log('🔌 EVENTS: Checking for button elements...', {
				playPauseBtn: !!playPauseBtn,
				resetBtn: !!resetBtn,
				speedSlider: !!speedSlider,
				beatSlider: !!beatSlider,
				loopCheckbox: !!loopCheckbox,
				loadSequenceBtn: !!loadSequenceBtn
			});
			
			if (!playPauseBtn) {
				console.log('⚠️ EVENTS: Play button not found, retrying in 100ms...');
				setTimeout(() => {
					if (playPauseBtn) {
						console.log('✅ EVENTS: Play button found on retry!');
						setupEventListeners();
					} else {
						console.error('❌ EVENTS: Play button still not found!');
					}
				}, 100);
				return;
			}
			
			setupEventListeners();
		}, 50);
		
		function setupEventListeners() {
			console.log('🔌 EVENTS: Setting up event listeners...');
			
			const handlePlayPause = () => {
				console.log('🔄 EVENT: Play/Pause button clicked! Current state:', { isPlaying });
				isPlaying ? pause() : play();
			};
			const handleReset = () => {
				console.log('🔄 EVENT: Reset button clicked!');
				reset();
			};
			const handleSpeedChange = (e: Event) => {
				const newSpeed = parseFloat((e.target as HTMLInputElement).value);
				console.log('🔄 EVENT: Speed changed to:', newSpeed);
				updateSpeed(newSpeed);
			};
			const handleBeatChange = (e: Event) => {
				const newBeat = parseFloat((e.target as HTMLInputElement).value);
				console.log('🔄 EVENT: Beat slider moved to:', newBeat);
				if (isPlaying) pause();
				updateBeat(newBeat, true);
			};
			const handleLoopChange = (e: Event) => {
				const checked = (e.target as HTMLInputElement).checked;
				console.log('🔄 EVENT: Loop checkbox changed to:', checked);
				continuousLoop = checked;
			};
			const handleLoadSequence = () => {
				console.log('🔄 EVENT: Load sequence button clicked!');
				loadPastedSequence();
			};
			
			if (playPauseBtn) {
				playPauseBtn.onclick = handlePlayPause;
				console.log('✅ EVENTS: Play/Pause listener attached');
			}
			if (resetBtn) {
				resetBtn.onclick = handleReset;
				console.log('✅ EVENTS: Reset listener attached');
			}
			if (speedSlider) {
				speedSlider.oninput = handleSpeedChange;
				console.log('✅ EVENTS: Speed slider listener attached');
			}
			if (beatSlider) {
				beatSlider.oninput = handleBeatChange;
				console.log('✅ EVENTS: Beat slider listener attached');
			}
			if (loopCheckbox) {
				loopCheckbox.onchange = handleLoopChange;
				console.log('✅ EVENTS: Loop checkbox listener attached');
			}
			if (loadSequenceBtn) {
				loadSequenceBtn.onclick = handleLoadSequence;
				console.log('✅ EVENTS: Load sequence listener attached');
			}
			
			console.log('✅ EVENTS: All available event listeners set up successfully!');
		}
	});
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<main class="animator-page">
	{#if !isClient}
		<div class="loading">
			<div class="loading-spinner"></div>
			<p>Loading animator...</p>
		</div>
	{:else if isLoading}
		<div class="loading">
			<div class="loading-spinner"></div>
			<p>Initializing pictograph animator...</p>
		</div>
	{:else}
		<div class="animator-container">
			<header class="animator-header">
				<h1>Step-by-Step Animator</h1>
				<p>Professional flow art sequence visualization</p>
			</header>
			
			<div class="animator-content">
				<div class="input-section">
					<label for="sequenceInput" class="input-label">Paste Sequence JSON:</label>
					<textarea 
						bind:this={sequenceInput} 
						id="sequenceInput" 
						placeholder="Paste your sequence JSON array here..."
						class="sequence-textarea"
					></textarea>
					<button bind:this={loadSequenceBtn} id="loadSequenceBtn" class="load-button">
						Load Sequence
					</button>
				</div>
				
				<div bind:this={messageArea} id="messageArea" class="message hidden"></div>
				
				<div class="canvas-container">
					<canvas bind:this={canvasElement} id="animationCanvas" width="600" height="600"></canvas>
					{#if !imagesLoaded && canvasReady}
						<div class="canvas-overlay">
							<div class="loading-spinner"></div>
							<p>Loading animation assets...</p>
						</div>
					{/if}
				</div>

				<div class="controls">
					<div class="control-group">
						<button bind:this={resetBtn} id="resetBtn" class="control-button">⏮</button>
						<button bind:this={playPauseBtn} id="playPauseBtn" class="control-button primary">▶️</button>
					</div>
					
					<div class="control-group">
						<label for="speedSlider">Speed:</label>
						<input 
							bind:this={speedSlider} 
							type="range" 
							id="speedSlider" 
							min="0.1" 
							max="3" 
							step="0.1" 
							value="1.0" 
							class="slider"
						/>
						<span bind:this={speedValue} id="speedValue" class="value-display">1.0x</span>
					</div>
					
					<div class="control-group">
						<label for="beatSlider">Time:</label>
						<input 
							bind:this={beatSlider} 
							type="range" 
							id="beatSlider" 
							min="0" 
							max="0" 
							step="0.01" 
							value="0" 
							class="slider"
						/>
						<span bind:this={beatValue} id="beatValue" class="value-display">0.00</span>
						/ <span bind:this={totalBeatsDisplay} id="totalBeatsDisplay">0</span>
					</div>
					
					<div class="control-group">
						<label for="loopCheckbox" class="checkbox-label">
							<input bind:this={loopCheckbox} type="checkbox" id="loopCheckbox" />
							Loop
						</label>
					</div>
				</div>

				<div class="info">
					Elapsed Time: <span bind:this={infoBeat} id="infoBeat">0.00</span> | 
					Current Beat: <span bind:this={infoStepIndex} id="infoStepIndex">Start</span> | 
					Progress (t): <span bind:this={infoT} id="infoT">0.000</span>
				</div>
				
				<!-- Debug Panel - Remove this once working -->
				<div class="debug-panel">
					<h4>Debug Info</h4>
					<p>Canvas Ready: <span class:text-green={canvasReady} class:text-red={!canvasReady}>{canvasReady ? 'Yes' : 'No'}</span></p>
					<p>Images Loaded: <span class:text-green={imagesLoaded} class:text-red={!imagesLoaded}>{imagesLoaded ? 'Yes' : 'No'}</span></p>
					<p>Canvas Context: <span class:text-green={!!ctx} class:text-red={!ctx}>{ctx ? 'Available' : 'Missing'}</span></p>
					<p>Total Beats: <span>{totalBeats}</span></p>
					<p>Sequence Loaded: <span class:text-green={!!currentSequence} class:text-red={!currentSequence}>{currentSequence ? 'Yes' : 'No'}</span></p>
					<p>Animation Playing: <span class:text-green={isPlaying} class:text-red={!isPlaying}>{isPlaying ? 'Yes' : 'No'}</span></p>
					<p>Current Beat: <span>{currentBeat.toFixed(2)}</span></p>
				</div>
			</div>
		</div>
	{/if}
</main>

<style>
	.animator-page {
		width: 100%;
		min-height: 100vh;
		background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 50%, #581c87 100%);
		display: flex;
		flex-direction: column;
		font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
	}

	.loading {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		min-height: 60vh;
		color: white;
		text-align: center;
	}

	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 4px solid rgba(255, 255, 255, 0.3);
		border-radius: 50%;
		border-top-color: white;
		animation: spin 1s ease-in-out infinite;
		margin-bottom: 1rem;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.animator-container {
		flex: 1;
		max-width: 1000px;
		margin: 0 auto;
		padding: 2rem;
		color: white;
	}

	.animator-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.animator-header h1 {
		font-size: 2.5rem;
		margin: 0 0 0.5rem 0;
		font-weight: 700;
		background: linear-gradient(45deg, #fff, #a8edea);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.animator-header p {
		font-size: 1.1rem;
		opacity: 0.9;
		margin: 0;
		font-weight: 500;
	}

	.animator-content {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		align-items: center;
	}

	.input-section {
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 1rem;
		padding: 1.5rem;
		width: 100%;
		max-width: 600px;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.input-label {
		font-size: 0.875rem;
		font-weight: 500;
		color: rgba(255, 255, 255, 0.9);
		margin-bottom: 0.5rem;
	}

	.sequence-textarea {
		width: 100%;
		min-height: 120px;
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 0.5rem;
		padding: 0.75rem;
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
		font-size: 0.8rem;
		background: rgba(0, 0, 0, 0.2);
		color: white;
		resize: vertical;
	}

	.sequence-textarea::placeholder {
		color: rgba(255, 255, 255, 0.5);
	}

	.load-button {
		align-self: flex-end;
		padding: 0.75rem 1.5rem;
		background: rgba(59, 130, 246, 0.8);
		color: white;
		border: 1px solid rgba(59, 130, 246, 0.6);
		border-radius: 0.5rem;
		cursor: pointer;
		font-weight: 600;
		transition: all 0.2s ease-in-out;
	}

	.load-button:hover {
		background: rgba(37, 99, 235, 0.9);
		transform: translateY(-1px);
	}

	.message {
		width: 100%;
		max-width: 600px;
		padding: 1rem;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		text-align: center;
		font-weight: 500;
	}

	.message.hidden {
		display: none;
	}

	.message.error {
		color: #fca5a5;
		background: rgba(220, 38, 38, 0.2);
		border: 1px solid rgba(220, 38, 38, 0.4);
	}

	.message.success {
		color: #86efac;
		background: rgba(34, 197, 94, 0.2);
		border: 1px solid rgba(34, 197, 94, 0.4);
	}

	.canvas-container {
		background: rgba(255, 255, 255, 0.95);
		border-radius: 1rem;
		padding: 1rem;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.2);
		position: relative;
	}

	.canvas-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(255, 255, 255, 0.9);
		border-radius: 1rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: #1e3a8a;
		font-weight: 500;
	}

	.canvas-overlay .loading-spinner {
		width: 32px;
		height: 32px;
		border: 3px solid rgba(30, 58, 138, 0.3);
		border-radius: 50%;
		border-top-color: #1e3a8a;
		animation: spin 1s ease-in-out infinite;
		margin-bottom: 0.75rem;
	}

	#animationCanvas {
		display: block;
		border-radius: 0.5rem;
		max-width: 100%;
		height: auto;
	}

	.controls {
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 1rem;
		padding: 1.5rem;
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem;
		align-items: center;
		justify-content: center;
		width: 100%;
		max-width: 600px;
	}

	.control-group {
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}

	.control-group label {
		font-size: 0.875rem;
		font-weight: 500;
		color: rgba(255, 255, 255, 0.9);
		white-space: nowrap;
	}

	.checkbox-label {
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.control-button {
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		border: 1px solid rgba(255, 255, 255, 0.3);
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease-in-out;
		background: rgba(255, 255, 255, 0.1);
		color: white;
		min-width: 3rem;
	}

	.control-button:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.2);
		transform: translateY(-1px);
	}

	.control-button.primary {
		background: rgba(34, 197, 94, 0.3);
		border-color: rgba(34, 197, 94, 0.5);
	}

	.control-button.primary:hover {
		background: rgba(34, 197, 94, 0.4);
	}

	.control-button.active {
		background: rgba(16, 185, 129, 0.4);
		border-color: rgba(16, 185, 129, 0.6);
	}

	.slider {
		width: 120px;
		height: 6px;
		border-radius: 3px;
		background: rgba(255, 255, 255, 0.2);
		outline: none;
		cursor: pointer;
		-webkit-appearance: none;
	}

	.slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: rgba(59, 130, 246, 0.9);
		cursor: pointer;
		border: 2px solid white;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
	}

	.slider::-moz-range-thumb {
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: rgba(59, 130, 246, 0.9);
		cursor: pointer;
		border: 2px solid white;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
	}

	.value-display {
		font-weight: 600;
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
		font-size: 0.875rem;
		min-width: 3rem;
		text-align: center;
		color: rgba(255, 255, 255, 0.9);
	}

	input[type='checkbox'] {
		width: 18px;
		height: 18px;
		cursor: pointer;
		accent-color: rgba(59, 130, 246, 0.8);
	}

	.info {
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 1rem;
		padding: 1rem;
		width: 100%;
		max-width: 600px;
		font-size: 0.875rem;
		text-align: center;
		color: rgba(255, 255, 255, 0.9);
	}

	.info span {
		font-weight: 600;
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
		color: rgba(255, 255, 255, 1);
		margin: 0 0.25rem;
	}

	.debug-panel {
		background: rgba(0, 0, 0, 0.8);
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 0.5rem;
		padding: 1rem;
		font-size: 0.75rem;
		color: white;
		max-width: 300px;
		margin-top: 1rem;
	}

	.debug-panel h4 {
		margin: 0 0 0.5rem 0;
		font-size: 0.875rem;
		color: #fbbf24;
	}

	.debug-panel p {
		margin: 0.25rem 0;
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
	}

	.text-green {
		color: #10b981 !important;
	}

	.text-red {
		color: #ef4444 !important;
	}

	@media (max-width: 768px) {
		.animator-container {
			padding: 1rem;
		}

		.animator-header h1 {
			font-size: 2rem;
		}

		.controls {
			flex-direction: column;
			gap: 1rem;
		}

		.control-group {
			width: 100%;
			justify-content: space-between;
		}

		.slider {
			flex: 1;
			max-width: 150px;
		}

		#animationCanvas {
			width: 100%;
			max-width: 400px;
		}
	}

	@media (max-width: 480px) {
		.animator-header h1 {
			font-size: 1.75rem;
		}

		.control-group {
			flex-direction: column;
			gap: 0.5rem;
			align-items: stretch;
		}

		.slider {
			max-width: none;
		}
	}
</style>