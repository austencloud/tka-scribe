<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { ButtonDefinition, ActionEventDetail } from '../types';
	import { getButtonAnimationDelayValue } from '../utils/animations';

	// Props
	export let button: ButtonDefinition;
	export let buttonSize: number;
	export let index: number; // Index for stagger animation delay

	// Event dispatcher for click events
	const dispatch = createEventDispatcher<{ click: ActionEventDetail }>();

	// Handle click event
	function handleClick() {
		// Dispatch the button's ID when clicked
		dispatch('click', { id: button.id });
	}

	// Reactive calculation for animation delay CSS variable
	$: animationDelay = getButtonAnimationDelayValue(index);

	// Reactive calculation for icon size based on button size
	$: iconSize = buttonSize * 0.5; // Icon takes up half the button size

	// Note: MDB Ripple initialization is expected to be handled by the parent
	// ButtonPanel component after MDB is loaded and elements are mounted.
</script>

<div
	class="button-container"
	style="--button-index: {index}; width: {buttonSize}px; height: {buttonSize}px; --animation-delay: {animationDelay};"
	role="listitem"
>
	<button
		class="modern-button ripple"
		on:click={handleClick}
		title={button.title}
		aria-label={button.title}
		disabled={button.disabled || false}
		style="--button-color: {button.color || '#555'};"
		data-mdb-ripple="true"
		data-mdb-ripple-color="light"
	>
		<i class="fa-solid {button.icon}" style="font-size: {iconSize}px;" aria-hidden="true"></i>
	</button>
</div>

<style>
	.button-container {
		display: flex; /* Use flex to center button */
		justify-content: center;
		align-items: center;
		position: relative; /* Needed for z-index hover effect */
		z-index: 0;
		transition: transform 0.2s ease-in-out;
		/* Default animation (flyInHorizontal) - will be overridden by :global below */
		animation: flyInHorizontal 0.5s var(--animation-delay) backwards; /* Use backwards to apply start state immediately */
	}

	/* Apply fly-out animation when the parent container has .animating-out */
	:global(.animating-out) .button-container {
		animation: flyOutHorizontal 0.4s var(--animation-delay) forwards; /* Use forwards to keep end state */
	}

	/* Vertical layout animation overrides */
	:global(.vertical) .button-container {
		animation: flyInVertical 0.5s var(--animation-delay) backwards;
	}
	:global(.vertical.animating-out) .button-container {
		animation: flyOutVertical 0.4s var(--animation-delay) forwards;
	}

	/* Hover effect: scale up and bring to front */
	.button-container:hover {
		z-index: 1;
		transform: scale(1.1);
	}

	/* Button styles */
	.modern-button {
		width: 100%;
		height: 100%;
		border-radius: 50%; /* Circular buttons */
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: white;
		/* Use CSS variable for color */
		border: 2px solid var(--button-color);
		color: var(--button-color);
		cursor: pointer;
		transition: all 0.2s ease-in-out;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
		position: relative; /* Needed for ripple */
		overflow: hidden; /* Contain ripple effect */
	}

	.modern-button:hover {
		background-color: var(--button-color);
		color: white;
		transform: translateY(-2px); /* Slight lift effect */
		box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
	}

	.modern-button:active {
		transform: translateY(1px); /* Press down effect */
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
	}

	/* Disabled state */
	.modern-button[disabled] {
		opacity: 0.5;
		cursor: not-allowed;
		background-color: #eee; /* Grey out background */
		border-color: #ccc;
		color: #999;
		box-shadow: none;
		transform: none;
	}
	.modern-button[disabled]:hover {
		transform: none; /* Disable hover effects */
		box-shadow: none;
	}

	/* --- Keyframe Animations --- */

	/* Horizontal Fly In */
	@keyframes flyInHorizontal {
		from {
			opacity: 0;
			transform: translateX(100px); /* Start off-screen right */
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	/* Horizontal Fly Out */
	@keyframes flyOutHorizontal {
		from {
			opacity: 1;
			transform: translateX(0);
		}
		to {
			opacity: 0;
			transform: translateX(100px); /* Fly off-screen right */
		}
	}

	/* Vertical Fly In */
	@keyframes flyInVertical {
		from {
			opacity: 0;
			transform: translateY(100px); /* Start off-screen bottom */
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Vertical Fly Out */
	@keyframes flyOutVertical {
		from {
			opacity: 1;
			transform: translateY(0);
		}
		to {
			opacity: 0;
			transform: translateY(100px); /* Fly off-screen bottom */
		}
	}
</style>
