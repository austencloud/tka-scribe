<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { isSequenceEmpty } from '$lib/stores/sequence/sequenceStateStore';
	import { selectedStartPos } from '$lib/stores/sequence/selectionStore';
	import { beatsStore } from '$lib/stores/sequence/beatsStore';
	
	// Define types
	type LayoutOrientation = 'vertical' | 'horizontal';

	interface ButtonDefinition {
		icon: string; // Font Awesome icon class
		title: string;
		id: string;
		color?: string;
	}

	// Component props
	export let containerWidth = 0;
	export let containerHeight = 0;
	export let isPortrait = true;

	// Event dispatcher
	const dispatch = createEventDispatcher<{
		action: { id: string };
		visibilityChange: { visible: boolean };
	}>();

	// Reactive layout orientation based on isPortrait
	$: layout = isPortrait ? 'horizontal' : 'vertical';
	
	// State for collapsed/expanded toolbar
	let isToolbarVisible = true;
	// Add this flag to control animation state separately
	let isAnimatingOut = false;
	
	// Pulse animation for the toggle area
	let isPulsing = true;
	
	// Emit an event when toolbar visibility changes to allow parent to adjust layout
	$: if (isToolbarVisible !== undefined) {
		dispatch('visibilityChange', { visible: isToolbarVisible });
	}
	
	// Stop pulsing after a few seconds or when clicked
	onMount(() => {
		setTimeout(() => {
			isPulsing = false;
		}, 3000);
	});

	// Button data with Font Awesome icons
	const buttons: ButtonDefinition[] = [
		{
			icon: 'fa-book-medical',
			title: 'Add to Dictionary',
			id: 'addToDictionary',
			color: '#4361ee'
		},
		{
			icon: 'fa-save',
			title: 'Save Image',
			id: 'saveImage',
			color: '#3a86ff'
		},
		{
			icon: 'fa-expand',
			title: 'View Full Screen',
			id: 'viewFullScreen',
			color: '#4cc9f0'
		},
		{
			icon: 'fa-arrows-left-right',
			title: 'Mirror Sequence',
			id: 'mirrorSequence',
			color: '#4895ef'
		},
		{
			icon: 'fa-paintbrush',
			title: 'Swap Colors',
			id: 'swapColors',
			color: '#ff6b6b'
		},
		{
			icon: 'fa-rotate',
			title: 'Rotate Sequence',
			id: 'rotateSequence',
			color: '#f72585'
		},
		{
			icon: 'fa-trash',
			title: 'Delete Beat',
			id: 'deleteBeat',
			color: '#ff9e00'
		},
		{
			icon: 'fa-eraser',
			title: 'Clear Sequence',
			id: 'clearSequence',
			color: '#ff7b00'
		}
	];

	// Reactive button size calculation
	$: buttonSize = calculateButtonSize(containerWidth, containerHeight, isPortrait);
	
	// Calculate the toolbar handle size based on layout and button size
	$: toggleHandleSize = layout === 'vertical' ? 
		{ width: buttonSize * 1.2, height: buttonSize * 0.6 } : 
		{ width: buttonSize * 0.6, height: buttonSize * 1.2 };
	
	// Get correct toggle visualization based on layout orientation
	$: handleIcon = getToggleHandleIcon();
	
	function getToggleHandleIcon() {
		// Use "grip" icons to better indicate the "handle" nature of the toggle
		if (layout === 'vertical') {
			return isToolbarVisible ? 'fa-grip-lines' : 'fa-grip-lines';
		} else {
			return isToolbarVisible ? 'fa-grip-lines-vertical' : 'fa-grip-lines-vertical';
		}
	}
	
	function toggleToolbar() {
		if (isToolbarVisible) {
			// When hiding, first trigger animation
			isAnimatingOut = true;
			// Then actually hide after animation time
			setTimeout(() => {
				isToolbarVisible = false;
				isAnimatingOut = false;
			}, 500); // Match animation duration
		} else {
			// When showing, just show immediately
			isToolbarVisible = true;
		}
		isPulsing = false; // Stop pulsing on first click
	}

	// Handle button click and create ripple effect
	function handleButtonClick(id: string) {
		// Dispatch action to parent components
		dispatch('action', { id });

		// Handle specific actions here directly
		if (id === 'clearSequence') {
			// Clear the sequence
			selectedStartPos.set(null);
			isSequenceEmpty.set(true);

			// Also clear the beats store
			beatsStore.update((beats) => []);

			// Dispatch additional event if needed for other components
			const customEvent = new CustomEvent('sequence-cleared', {
				bubbles: true
			});
			document.dispatchEvent(customEvent);
		}
	}
	
	// Calculate button size based on container dimensions and orientation
	function calculateButtonSize(width: number, height: number, isPortrait: boolean): number {
		const isMobile = width <= 768;

		if (isMobile) {
			return Math.max(30, Math.min(60, width / 10));
		} else if (isPortrait) {
			return Math.max(30, Math.min(60, width / 10));
		} else {
			return Math.max(30, Math.min(60, height / 14));
		}
	}

	// Initialize MDB Ripple effect
	let buttonsReady = false;

	onMount(() => {
		// Load Font Awesome
		if (!document.getElementById('font-awesome-css')) {
			const link = document.createElement('link');
			link.id = 'font-awesome-css';
			link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
			link.rel = 'stylesheet';
			document.head.appendChild(link);
		}

		// Load MDB Ripple
		if (!document.getElementById('mdb-ripple-css')) {
			const linkMDB = document.createElement('link');
			linkMDB.id = 'mdb-ripple-css';
			linkMDB.href = 'https://cdnjs.cloudflare.com/ajax/libs/mdb-ui-kit/6.3.0/mdb.min.css';
			linkMDB.rel = 'stylesheet';
			document.head.appendChild(linkMDB);

			const scriptMDB = document.createElement('script');
			scriptMDB.id = 'mdb-ripple-js';
			scriptMDB.src = 'https://cdnjs.cloudflare.com/ajax/libs/mdb-ui-kit/6.3.0/mdb.min.js';
			document.body.appendChild(scriptMDB);

			scriptMDB.onload = () => {
				// Initialize ripple after MDB loads
				buttonsReady = true;
				setTimeout(initializeRipple, 100);
			};
		} else {
			// MDB already loaded
			buttonsReady = true;
			setTimeout(initializeRipple, 100);
		}
	});

	function initializeRipple() {
		// Use type assertion to tell TypeScript that window.mdb exists
		const mdb = (window as any).mdb;

		if (!buttonsReady || typeof window === 'undefined' || !mdb) return;

		const rippleButtons = document.querySelectorAll('.modern-button, .toggle-handle');
		rippleButtons.forEach((button) => {
			// Safely initialize ripple
			if (mdb.Ripple) {
				new mdb.Ripple(button as HTMLElement);
			}
		});
	}
</script>

<!-- Main toolbar container with background only when expanded -->
<div 
	class="toolbar-container" 
	class:vertical={layout === 'vertical'} 
	class:hidden={!isToolbarVisible}
	style="--button-size: {buttonSize}px;"
>
	<!-- Buttons container with animation for entrance/exit -->
	<div 
		class="buttons-wrapper" 
		class:vertical={layout === 'vertical'}
		class:visible={isToolbarVisible}
		class:animating-out={isAnimatingOut}
	>
		{#if isToolbarVisible}
			{#each buttons as button, i (button.id)}
				<div 
					class="button-container" 
					style="--button-index: {i}; width: {buttonSize}px; height: {buttonSize}px;"
				>
					<button
						class="modern-button ripple"
						on:click={() => handleButtonClick(button.id)}
						title={button.title}
						aria-label={button.title}
						style="--button-color: {button.color || '#555'};"
						data-mdb-ripple="true"
						data-mdb-ripple-color="light"
					>
						<i class="fa-solid {button.icon}" style="font-size: {buttonSize * 0.5}px;"></i>
					</button>
				</div>
			{/each}
		{/if}
	</div>
	
	<!-- Toggle handle - positioned on the edge of the toolbar -->
	<div 
		class="toggle-handle-container"
		class:vertical={layout === 'vertical'}
		class:pulsing={isPulsing}
		style="
			{layout === 'vertical' ? 
				`height: ${toggleHandleSize.height}px; width: ${toggleHandleSize.width}px;` : 
				`height: ${toggleHandleSize.height}px; width: ${toggleHandleSize.width}px;`
			}
		"
	>
		<button
			class="toggle-handle ripple"
			on:click={toggleToolbar}
			title={isToolbarVisible ? "Hide Tools" : "Show Tools"}
			aria-label={isToolbarVisible ? "Hide Tools" : "Show Tools"}
			data-mdb-ripple="true"
			data-mdb-ripple-color="light"
		>
			<i class="fa-solid {handleIcon}" style="font-size: {buttonSize * 0.4}px;"></i>
			
			<!-- Arrow indicators for toggle direction -->
			<span class="toggle-indicator" class:collapsed={!isToolbarVisible}>
				<i class="fa-solid {
					layout === 'vertical' 
						? (isToolbarVisible ? 'fa-chevron-up' : 'fa-chevron-down') 
						: (isToolbarVisible ? 'fa-chevron-left' : 'fa-chevron-right')
				}"></i>
			</span>
		</button>
	</div>
</div>

<style>
	.toolbar-container {
		display: flex;
		background-color: rgba(0, 0, 0, 0.3);
		backdrop-filter: blur(8px);
		border-radius: 12px;
		transition: all 0.3s ease;
		position: relative;
		overflow: visible; /* Allow animations to overflow */
	}
	
	/* Layout styles */
	.toolbar-container.vertical {
		flex-direction: column;
		width: max-content;
		align-items: center;
	}
	
	.toolbar-container:not(.vertical) {
		flex-direction: row;
		height: max-content;
		align-items: center;
	}
	
	/* Handle collapsed state */
	.toolbar-container.hidden {
		background-color: transparent;
		backdrop-filter: none;
		border: none;
	}
	
	/* Button groups container */
	.buttons-wrapper {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px;
		transition: opacity 0.2s ease;
	}
	
	.buttons-wrapper.vertical {
		flex-direction: column;
	}
	
	.buttons-wrapper:not(.visible) {
		opacity: 0;
		pointer-events: none;
		width: 0;
		height: 0;
		padding: 0;
		margin: 0;
	}
	
	/* Individual button container */
	.button-container {
		display: flex;
		justify-content: center;
		align-items: center;
		position: relative;
		z-index: 0;
		transition: transform 0.2s ease;
		animation: flyIn 0.5s calc(0.05s * var(--button-index)) both;
	}
	
	.animating-out .button-container {
		animation: flyOut 0.4s calc(0.04s * var(--button-index)) both;
	}
	
	@keyframes flyIn {
		from {
			opacity: 0;
			transform: translateX(300px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}
	
	@keyframes flyOut {
		from {
			opacity: 1;
			transform: translateX(0);
		}
		to {
			opacity: 0;
			transform: translateX(300px);
		}
	}
	
	/* Vertical variants */
	.vertical .button-container {
		animation: flyInVertical 0.5s calc(0.05s * var(--button-index)) both;
	}
	
	.vertical.animating-out .button-container {
		animation: flyOutVertical 0.4s calc(0.04s * var(--button-index)) both;
	}
	
	@keyframes flyInVertical {
		from {
			opacity: 0;
			transform: translateY(300px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	
	@keyframes flyOutVertical {
		from {
			opacity: 1;
			transform: translateY(0);
		}
		to {
			opacity: 0;
			transform: translateY(300px);
		}
	}
	
	.button-container:hover {
		z-index: 1;
		transform: scale(1.1);
	}
	
	/* Button styles */
	.modern-button {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: white;
		border: 2px solid var(--button-color);
		color: var(--button-color);
		cursor: pointer;
		transition: all 0.2s ease;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
		position: relative;
		overflow: hidden; /* Important for containing ripples */
	}

	.modern-button:hover {
		background-color: var(--button-color);
		color: white;
		transform: translateY(-2px);
		box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
	}

	.modern-button:active {
		transform: translateY(1px);
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
	}
	
	/* Toggle handle styles */
	.toggle-handle-container {
		position: absolute;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 10;
		transition: all 0.3s ease;
	}
	
	/* Position the toggle handle at the right edge for horizontal layout */
	.toggle-handle-container:not(.vertical) {
		right: 0;
		top: 50%;
		transform: translateY(-50%) translateX(50%);
	}
	
	/* Position the toggle handle at the bottom edge for vertical layout */
	.toggle-handle-container.vertical {
		bottom: 0;
		left: 50%;
		transform: translateX(-50%) translateY(50%);
	}
	
	.toggle-handle-container.pulsing {
		animation: pulse 2s infinite;
	}
	
	@keyframes pulse {
		0% {
			transform: translateY(-50%) translateX(50%) scale(1);
		}
		50% {
			transform: translateY(-50%) translateX(50%) scale(1.15);
			filter: brightness(1.2) drop-shadow(0 0 8px rgba(157, 78, 221, 0.8));
		}
		100% {
			transform: translateY(-50%) translateX(50%) scale(1);
		}
	}
	
	/* Pulsing animation for vertical layout */
	.toggle-handle-container.vertical.pulsing {
		animation: pulseVertical 2s infinite;
	}
	
	@keyframes pulseVertical {
		0% {
			transform: translateX(-50%) translateY(50%) scale(1);
		}
		50% {
			transform: translateX(-50%) translateY(50%) scale(1.15);
			filter: brightness(1.2) drop-shadow(0 0 8px rgba(157, 78, 221, 0.8));
		}
		100% {
			transform: translateX(-50%) translateY(50%) scale(1);
		}
	}
	
	.toggle-handle {
		width: 100%;
		height: 100%;
		background: linear-gradient(135deg, #9d4edd 0%, #7b2cbf 100%);
		color: white;
		border: none;
		display: flex;
		justify-content: center;
		align-items: center;
		cursor: pointer;
		position: relative;
		border-radius: 8px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
		overflow: hidden;
	}
	
	/* Horizontal handle is pill-shaped */
	.toggle-handle-container:not(.vertical) .toggle-handle {
		border-radius: 100px;
	}
	
	/* Vertical handle is pill-shaped */
	.toggle-handle-container.vertical .toggle-handle {
		border-radius: 100px;
	}
	
	.toggle-handle:hover {
		filter: brightness(1.1);
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
	}
	
	.toggle-handle:active {
		transform: scale(0.95);
	}
	
	/* Toggle indicator styles */
	.toggle-indicator {
		position: absolute;
		font-size: 0.7em;
		opacity: 0.8;
		animation: bounceArrow 1.5s infinite;
	}
	
	/* Position the arrow indicators based on layout */
	.toggle-handle-container:not(.vertical) .toggle-indicator {
		right: 6px;
	}
	
	.toggle-handle-container.vertical .toggle-indicator {
		bottom: 6px;
	}
	
	@keyframes bounceArrow {
		0%, 100% {
			transform: translateX(0);
		}
		50% {
			transform: translateX(-3px);
		}
	}
	
	/* Vertical bounce animation */
	.toggle-handle-container.vertical .toggle-indicator {
		animation: bounceArrowVertical 1.5s infinite;
	}
	
	@keyframes bounceArrowVertical {
		0%, 100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-3px);
		}
	}
	
	/* Reverse animation when collapsed */
	.toggle-indicator.collapsed {
		animation-direction: reverse;
	}
</style>