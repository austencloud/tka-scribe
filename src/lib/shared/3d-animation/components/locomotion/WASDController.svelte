<script lang="ts">
	/**
	 * WASDController
	 *
	 * Handles WASD keyboard input for avatar movement.
	 * Converts key states into movement direction vector.
	 *
	 * PROOF OF CONCEPT - Keyboard input for locomotion MVP.
	 *
	 * Usage:
	 * ```svelte
	 * <WASDController onInput={(input) => avatarState.setMoveInput(input)} />
	 * ```
	 */
	import { onMount, onDestroy } from 'svelte';

	interface Props {
		/** Callback when movement input changes */
		onInput: (input: { x: number; z: number }) => void;
		/** Whether input is enabled */
		enabled?: boolean;
	}

	let { onInput, enabled = true }: Props = $props();

	// Track which movement keys are held
	let keys = $state({
		w: false,
		a: false,
		s: false,
		d: false
	});

	// Convert key states to movement input vector
	// x: -1 (left/A) to 1 (right/D)
	// z: -1 (back/S) to 1 (forward/W)
	const input = $derived({
		x: (keys.d ? 1 : 0) - (keys.a ? 1 : 0),
		z: (keys.w ? 1 : 0) - (keys.s ? 1 : 0)
	});

	// Emit input changes when keys change
	$effect(() => {
		if (enabled) {
			onInput(input);
		} else {
			// When disabled, ensure zero input
			onInput({ x: 0, z: 0 });
		}
	});

	function handleKeyDown(e: KeyboardEvent) {
		if (!enabled) return;

		// Ignore if typing in an input field
		if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
			return;
		}

		const key = e.key.toLowerCase();
		if (key in keys) {
			keys[key as keyof typeof keys] = true;
			e.preventDefault(); // Prevent scrolling, etc.
		}
	}

	function handleKeyUp(e: KeyboardEvent) {
		const key = e.key.toLowerCase();
		if (key in keys) {
			keys[key as keyof typeof keys] = false;
		}
	}

	// Handle window blur - release all keys to prevent stuck movement
	function handleBlur() {
		keys = { w: false, a: false, s: false, d: false };
	}

	// Handle visibility change (tab switch) - also release keys
	function handleVisibilityChange() {
		if (document.hidden) {
			keys = { w: false, a: false, s: false, d: false };
		}
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);
		window.addEventListener('blur', handleBlur);
		document.addEventListener('visibilitychange', handleVisibilityChange);

		console.log('[WASDController] Mounted - WASD input enabled');
	});

	onDestroy(() => {
		window.removeEventListener('keydown', handleKeyDown);
		window.removeEventListener('keyup', handleKeyUp);
		window.removeEventListener('blur', handleBlur);
		document.removeEventListener('visibilitychange', handleVisibilityChange);

		console.log('[WASDController] Destroyed');
	});
</script>

<!-- Render-less component - only handles keyboard input -->
