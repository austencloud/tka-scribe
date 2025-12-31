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

	// Track which movement keys are held (WASD + Arrow keys)
	let keys = $state({
		forward: false,  // W or ArrowUp
		left: false,     // A or ArrowLeft
		backward: false, // S or ArrowDown
		right: false     // D or ArrowRight
	});

	// Convert key states to movement input vector
	// x: -1 (left) to 1 (right)
	// z: -1 (back) to 1 (forward)
	const input = $derived({
		x: (keys.right ? 1 : 0) - (keys.left ? 1 : 0),
		z: (keys.forward ? 1 : 0) - (keys.backward ? 1 : 0)
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

	// Map key codes to our key state
	function getKeyMapping(key: string): keyof typeof keys | null {
		switch (key.toLowerCase()) {
			case 'w':
			case 'arrowup':
				return 'forward';
			case 'a':
			case 'arrowleft':
				return 'left';
			case 's':
			case 'arrowdown':
				return 'backward';
			case 'd':
			case 'arrowright':
				return 'right';
			default:
				return null;
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (!enabled) return;

		// Ignore if typing in an input field
		if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
			return;
		}

		const mapping = getKeyMapping(e.key);
		if (mapping) {
			keys[mapping] = true;
			e.preventDefault(); // Prevent scrolling, etc.
		}
	}

	function handleKeyUp(e: KeyboardEvent) {
		const mapping = getKeyMapping(e.key);
		if (mapping) {
			keys[mapping] = false;
		}
	}

	// Handle window blur - release all keys to prevent stuck movement
	function handleBlur() {
		keys = { forward: false, left: false, backward: false, right: false };
	}

	// Handle visibility change (tab switch) - also release keys
	function handleVisibilityChange() {
		if (document.hidden) {
			keys = { forward: false, left: false, backward: false, right: false };
		}
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);
		window.addEventListener('blur', handleBlur);
		document.addEventListener('visibilitychange', handleVisibilityChange);
	});

	onDestroy(() => {
		window.removeEventListener('keydown', handleKeyDown);
		window.removeEventListener('keyup', handleKeyUp);
		window.removeEventListener('blur', handleBlur);
		document.removeEventListener('visibilitychange', handleVisibilityChange);
	});
</script>

<!-- Render-less component - only handles keyboard input -->
