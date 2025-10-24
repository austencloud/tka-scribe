<script lang="ts">
	import MetallicButton from '../../common/MetallicButton.svelte';
	import { createEventDispatcher } from 'svelte';
	import TabRipple from './TabRipple.svelte';

	const dispatch = createEventDispatcher();

	// --- Define allowed variant types explicitly ---
	type NavButtonVariant = 'blue' | 'ghost';

	// --- Props ---
	export let isActive: boolean = false;
	export let onClick: () => void;
	export let index: number = 0;
	export let previousIndex: number = 0;
	export let showText: boolean = true; // Prop to control text visibility

	// --- State ---
	enum ButtonState { NORMAL = 'normal', ACTIVE = 'active', DISABLED = 'disabled' }
	let wasActive = false;

	// FIXED: Declare variant variable explicitly
	let variant: NavButtonVariant;

	// Determine button state based on isActive prop
	$: state = isActive ? ButtonState.ACTIVE : ButtonState.NORMAL;

	// FIXED: Removed type annotation from reactive assignment
	// Determine button variant based on isActive prop
	$: variant = isActive ? 'blue' : 'ghost';

	// --- Lifecycle & Logic ---
	// Track active state changes for dispatching 'activated' event
	$: if (isActive !== wasActive) {
		wasActive = isActive;
		if (isActive) {
			// Button became active
			setTimeout(() => {
				dispatch('activated');
			}, 50);
		}
	}

	// Click handler
	function handleClick() {
		onClick();
	}
</script>

<div class="nav-button-wrapper" class:active={isActive} class:text-hidden={!showText}>
	<MetallicButton
		on:click={handleClick}
		{state}
		{variant} size={'medium'}
		customClass="nav-button {isActive ? 'active-button' : ''} {showText ? 'with-text' : 'icon-only'}"
	>
		<slot /> </MetallicButton>

	<TabRipple active={isActive} {index} {previousIndex} />

	{#if isActive}
		<div class="button-highlight"></div>
	{/if}
</div>

<style>
	.nav-button-wrapper {
		position: relative;
		transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* Base styles for the button via its custom class */
	:global(.nav-button) {
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 12px; /* Consistent rounding */
		transition: all 0.2s ease-out;
		font-weight: 500;
	}

	/* Sizing for buttons WITH text (Desktop Landscape default) */
	:global(.nav-button.with-text) {
		min-width: 100px;
		height: 40px;
		padding: 0 1rem;
		font-size: 0.9rem;
		gap: 0.4rem;
	}

	/* Sizing for ICON-ONLY buttons (Mobile/Portrait default) */
	:global(.nav-button.icon-only) {
		width: 50px;
		height: 50px;
		padding: 0;
		font-size: 1.5rem;
		border-radius: 50%; /* Make it round */
	}

	/* --- Media Queries for Adjustments --- */
	@media (max-width: 1024px) {
		:global(.nav-button.with-text) {
			min-width: 90px;
			height: 38px;
			padding: 0 0.8rem;
			font-size: 0.85rem;
		}
	}
	@media (max-width: 480px) {
		:global(.nav-button.icon-only) {
			width: 44px;
			height: 44px;
			font-size: 1.3rem;
		}
		:global(.nav-button.with-text) {
			min-width: 80px;
			height: 36px;
			font-size: 0.8rem;
		}
	}

	/* Glow effect for active button */
	.button-highlight {
		position: absolute;
		top: -5px;
		left: -5px;
		right: -5px;
		bottom: -5px;
		border-radius: 50%; /* Default for icon-only (text-hidden) */
		background: transparent;
		box-shadow: 0 0 15px rgba(108, 156, 233, 0.6);
		opacity: 0;
		animation: glow-appear 0.4s forwards 0.1s;
		pointer-events: none;
		z-index: -1;
	}
	/* FIXED: Correctly target highlight based on wrapper class */
	/* Style highlight differently when the wrapper does NOT have 'text-hidden' */
	.nav-button-wrapper:not(.text-hidden) .button-highlight {
		border-radius: 16px; /* Match rectangular button rounding */
	}

	@keyframes glow-appear {
		0% { opacity: 0; transform: scale(0.9); }
		100% { opacity: 1; transform: scale(1); }
	}

	/* Active button styling */
	:global(.active-button) {
		position: relative;
		z-index: 1;
	}

	/* Hover effect */
	.nav-button-wrapper:hover {
		transform: scale(1.08); /* Scale wrapper on hover */
	}
</style>
