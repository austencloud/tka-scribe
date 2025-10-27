<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	// Removed panelStore import - state comes via props now
	import {
		getToggleHandleIcon,
		getToggleIndicatorIcon,
		calculateToggleHandleDimensions
	} from '../utils/animations';
	import type { LayoutOrientation } from '../types'; // Import type if needed

	// --- Props ---
	export let buttonSize: number;
	export let layout: LayoutOrientation = 'horizontal'; // Receive layout as prop
	export let isVisible: boolean = true; // Receive visibility as prop
	export let isPulsing: boolean = false; // Receive pulsing state as prop

	// --- Reactive calculations based on props ---
	$: handleIcon = getToggleHandleIcon(layout);
	$: indicatorIcon = getToggleIndicatorIcon(layout, isVisible);
	$: toggleHandleSize = calculateToggleHandleDimensions(layout, buttonSize);

	// --- Event dispatcher ---
	const dispatch = createEventDispatcher<{ toggle: void }>();

	// --- Event Handlers ---
	function handleToggleClick() {
		// Parent (ButtonPanel) handles stopping pulse and toggling store
		dispatch('toggle');
	}

	// Note: MDB Ripple initialization is handled by the parent ButtonPanel component.
</script>

<div
	class="toggle-handle-container"
	class:vertical={layout === 'vertical'}
	class:pulsing={isPulsing}
	style="
		width: {toggleHandleSize.width}px;
		height: {toggleHandleSize.height}px;
	"
>
	<button
		class="toggle-handle ripple"
		on:click={handleToggleClick}
		title={isVisible ? "Hide Tools" : "Show Tools"}
		aria-label={isVisible ? "Hide Tools" : "Show Tools"}
		aria-expanded={isVisible}
		data-mdb-ripple="true"
		data-mdb-ripple-color="dark" >
		<i class="fa-solid {handleIcon}" style="font-size: {buttonSize * 0.4}px;" aria-hidden="true"></i>

		<span class="toggle-indicator" class:collapsed={!isVisible}>
			<i class="fa-solid {indicatorIcon}" aria-hidden="true"></i>
		</span>
	</button>
</div>

<style>
	/* Styles remain the same as previous version */
	.toggle-handle-container {
		position: absolute;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 10;
		transition: transform 0.3s ease-in-out, filter 0.3s ease;
	}

	.toggle-handle-container:not(.vertical) {
		right: 0;
		top: 50%;
		transform: translate(50%, -50%);
	}

	.toggle-handle-container.vertical {
		bottom: 0;
		left: 50%;
		transform: translate(-50%, 50%);
	}

	.toggle-handle-container.pulsing {
		animation: var(--pulse-animation-name, pulseHorizontal) 2s infinite ease-in-out;
	}

	.toggle-handle-container:not(.vertical) {
		--pulse-animation-name: pulseHorizontal;
	}
	.toggle-handle-container.vertical {
		--pulse-animation-name: pulseVertical;
	}

	@keyframes pulseHorizontal {
		0%, 100% { transform: translate(50%, -50%) scale(1); filter: brightness(1); }
		50% { transform: translate(50%, -50%) scale(1.15); filter: brightness(1.2) drop-shadow(0 0 8px rgba(123, 44, 191, 0.7)); }
	}

	@keyframes pulseVertical {
		0%, 100% { transform: translate(-50%, 50%) scale(1); filter: brightness(1); }
		50% { transform: translate(-50%, 50%) scale(1.15); filter: brightness(1.2) drop-shadow(0 0 8px rgba(123, 44, 191, 0.7)); }
	}

	.toggle-handle {
		width: 100%;
		height: 100%;
		background: linear-gradient(135deg, #a855f7 0%, #7e22ce 100%);
		color: white;
		border: none;
		display: flex;
		justify-content: center;
		align-items: center;
		cursor: pointer;
		position: relative;
		border-radius: 999px;
		box-shadow: 0 3px 12px rgba(0, 0, 0, 0.2);
		transition: all 0.2s ease-in-out;
		overflow: hidden;
	}

	.toggle-handle:hover {
		filter: brightness(1.1);
		box-shadow: 0 5px 18px rgba(0, 0, 0, 0.3);
		transform: scale(1.05);
	}

	.toggle-handle:active {
		transform: scale(0.95);
		filter: brightness(0.95);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
	}

	.toggle-indicator {
		position: absolute;
		font-size: 0.7em;
		opacity: 0.9;
		transition: transform 0.3s ease;
		animation: var(--bounce-animation-name, bounceArrowHorizontal) 1.5s infinite ease-in-out;
	}

	.toggle-handle-container:not(.vertical) { --bounce-animation-name: bounceArrowHorizontal; }
	.toggle-handle-container.vertical { --bounce-animation-name: bounceArrowVertical; }

	.toggle-handle-container:not(.vertical) .toggle-indicator { right: 7px; }
	.toggle-handle-container.vertical .toggle-indicator { bottom: 7px; }

	@keyframes bounceArrowHorizontal {
		0%, 100% { transform: translateX(0); }
		50% { transform: translateX(-3px); }
	}
	@keyframes bounceArrowVertical {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-3px); }
	}

	.toggle-indicator.collapsed {
		animation-direction: reverse;
	}
</style>
