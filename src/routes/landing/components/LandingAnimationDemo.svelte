<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { scale } from 'svelte/transition';
	import { cubicOut, backOut } from 'svelte/easing';
	import AnimatorCanvas from '$lib/shared/animation-engine/components/AnimatorCanvas.svelte';
	import type { SequenceData } from '$lib/shared/foundation/domain/models/SequenceData';
	import type { IAnimationPlaybackController } from '$lib/features/compose/services/contracts/IAnimationPlaybackController';
	import type { ISequenceRepository } from '$lib/features/create/shared/services/contracts/ISequenceRepository';
	import type { IStartPositionDeriver } from '$lib/shared/pictograph/shared/services/contracts/IStartPositionDeriver';
	import { createAnimationPanelState } from '$lib/features/compose/state/animation-panel-state.svelte';
	import { resolve, loadFeatureModule } from '$lib/shared/inversify/di';
	import { TYPES } from '$lib/shared/inversify/types';
	import {
		animationSettings,
		TrackingMode
	} from '$lib/shared/animation-engine/state/animation-settings-state.svelte';
	import { getAnimationVisibilityManager } from '$lib/shared/animation-engine/state/animation-visibility-state.svelte';
	import BeatGrid from '$lib/features/create/shared/workspace-panel/sequence-display/components/BeatGrid.svelte';
	import { SHOWCASE_SEQUENCES, RANDOM_PROPS } from '../landing-content';
	import type { PropType } from '$lib/shared/pictograph/prop/domain/enums/PropType';

	// Transition key - changes trigger the crossfade animation
	let transitionKey = $state(0);

	// Animation state
	const animationState = createAnimationPanelState();
	let playbackController: IAnimationPlaybackController | null = null;
	let sequenceService: ISequenceRepository | null = null;
	let startPositionDeriver: IStartPositionDeriver | null = null;
	let servicesReady = $state(false);
	let animationReady = $state(false);
	let animationError = $state(false);
	let isLoading = $state(false);

	// Current selection state
	let currentSequenceIndex = $state(0);
	let currentPropType = $state<PropType>(RANDOM_PROPS[0]!);

	// Dark mode (LED/glow effects) - default ON for landing page visual impact
	let darkMode = $state(true);
	const visibilityManager = getAnimationVisibilityManager();

	// Derived values
	let currentWord = $derived(SHOWCASE_SEQUENCES[currentSequenceIndex]);

	// Derived start position - uses service to derive from first beat if not stored
	let derivedStartPosition = $derived.by(() => {
		if (!animationState.sequenceData || !startPositionDeriver) return null;
		return startPositionDeriver.getOrDeriveStartPosition(animationState.sequenceData);
	});

	// Current beat data for AnimatorCanvas
	let currentLetter = $derived.by(() => {
		if (!animationState.sequenceData) return null;
		const currentBeat = animationState.currentBeat;

		if (currentBeat < 1) {
			return derivedStartPosition?.letter || null;
		}

		if (animationState.sequenceData.beats?.length > 0) {
			const beatIndex = Math.floor(currentBeat) - 1;
			const clampedIndex = Math.max(
				0,
				Math.min(beatIndex, animationState.sequenceData.beats.length - 1)
			);
			return animationState.sequenceData.beats[clampedIndex]?.letter || null;
		}

		return null;
	});

	let currentBeatData = $derived.by(() => {
		if (!animationState.sequenceData) return null;
		const currentBeat = animationState.currentBeat;

		if (currentBeat < 1) {
			return derivedStartPosition || null;
		}

		if (animationState.sequenceData.beats?.length > 0) {
			const beatIndex = Math.floor(currentBeat) - 1;
			const clampedIndex = Math.max(
				0,
				Math.min(beatIndex, animationState.sequenceData.beats.length - 1)
			);
			return animationState.sequenceData.beats[clampedIndex] || null;
		}

		return null;
	});

	let gridMode = $derived(animationState.sequenceData?.gridMode ?? null);
	let currentBeatNumber = $derived(Math.floor(animationState.currentBeat));

	onMount(async () => {
		try {
			animationSettings.setTrackingMode(TrackingMode.BOTH_ENDS);

			// Enable dark mode on mount for visual impact
			visibilityManager.setDarkMode(darkMode);

			await loadFeatureModule('animate');
			sequenceService = resolve<ISequenceRepository>(TYPES.ISequenceRepository);
			playbackController = resolve<IAnimationPlaybackController>(TYPES.IAnimationPlaybackController);
			startPositionDeriver = resolve<IStartPositionDeriver>(TYPES.IStartPositionDeriver);
			servicesReady = true;

			await loadSequence(SHOWCASE_SEQUENCES[0]!);
		} catch (err) {
			console.error('Failed to load hero animation:', err);
			animationError = true;
		}
	});

	onDestroy(() => {
		playbackController?.dispose();
		animationState.dispose();
	});

	async function loadSequence(word: string, propType?: PropType) {
		if (!sequenceService || !playbackController) return;

		transitionKey++;
		isLoading = true;
		animationReady = false;

		try {
			if (animationState.isPlaying) {
				playbackController.togglePlayback();
			}
			animationState.reset();

			let sequence = await sequenceService.getSequence(word);
			if (!sequence) {
				throw new Error(`Failed to load sequence: ${word}`);
			}

			if (propType) {
				sequence = { ...sequence, propType } as SequenceData;
			}

			animationState.setShouldLoop(true);
			const success = playbackController.initialize(sequence, animationState);

			if (!success) {
				throw new Error('Failed to initialize playback');
			}

			animationReady = true;
			isLoading = false;

			animationState.setCurrentBeat(1);
			playbackController?.togglePlayback();
		} catch (err) {
			console.error('Failed to load sequence:', err);
			animationError = true;
			isLoading = false;
		}
	}

	function handleRandomize() {
		let newSequenceIndex = currentSequenceIndex;
		while (newSequenceIndex === currentSequenceIndex && SHOWCASE_SEQUENCES.length > 1) {
			newSequenceIndex = Math.floor(Math.random() * SHOWCASE_SEQUENCES.length);
		}
		currentSequenceIndex = newSequenceIndex;

		const newPropType = RANDOM_PROPS[Math.floor(Math.random() * RANDOM_PROPS.length)]!;
		currentPropType = newPropType;

		loadSequence(SHOWCASE_SEQUENCES[newSequenceIndex]!, newPropType);
	}

	function handleToggleDarkMode() {
		darkMode = !darkMode;
		visibilityManager.setDarkMode(darkMode);
	}
</script>

<div class="demo-container">
	{#key transitionKey}
		<div
			class="demo-transition-wrapper"
			in:scale={{ duration: 350, delay: 100, start: 0.95, opacity: 0, easing: backOut }}
			out:scale={{ duration: 200, start: 0.98, opacity: 0, easing: cubicOut }}
		>
			<div class="demo-layout">
				<div class="word-label-row">
					<span class="word-text">{currentWord || 'A'}</span>
				</div>

				<div class="demo-content-row">
					<div class="animation-preview">
						{#if animationReady && !isLoading}
							<div class="canvas-wrapper">
								<AnimatorCanvas
									blueProp={animationState.bluePropState}
									redProp={animationState.redPropState}
									gridVisible={true}
									{gridMode}
									letter={currentLetter}
									beatData={currentBeatData}
									sequenceData={animationState.sequenceData}
									isPlaying={animationState.isPlaying}
									trailSettings={animationSettings.trail}
								/>
							</div>
						{:else if animationError}
							<div class="animation-fallback">
								<div class="fallback-icon">🌀</div>
								<span>Animation Preview</span>
							</div>
						{:else}
							<div class="animation-loading">
								<div class="spinner"></div>
								<span>{isLoading ? 'Loading...' : 'Initializing...'}</span>
							</div>
						{/if}
					</div>

					{#if animationState.sequenceData}
						<div class="beat-grid-panel">
							<BeatGrid
								beats={animationState.sequenceData.beats}
								startPosition={derivedStartPosition}
								selectedBeatNumber={currentBeatNumber}
							/>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/key}

	<div class="demo-controls">
		<button
			class="light-toggle-btn"
			class:dark-mode={darkMode}
			onclick={handleToggleDarkMode}
			disabled={!servicesReady || isLoading}
			aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
			title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
		>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<!-- Bulb body: filled when light mode, outline when dark mode -->
				<path
					d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V18h8v-3.3A7 7 0 0 0 12 2z"
					fill={darkMode ? 'none' : 'currentColor'}
				/>
			</svg>
		</button>

		<button class="randomize-btn" onclick={handleRandomize} disabled={!servicesReady || isLoading}>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
			</svg>
			<span>Try Another</span>
		</button>
	</div>
</div>

<style>
	.demo-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: clamp(16px, 3vw, 24px);
		width: 100%;
		container-type: inline-size;
		position: relative;
		min-height: clamp(380px, 50cqw, 520px);
	}

	.demo-transition-wrapper {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.demo-layout {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: clamp(12px, 2cqw, 20px);
		width: 100%;
		max-width: 900px;
	}

	.word-label-row {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
	}

	.word-label-row .word-text {
		font-family: Georgia, serif;
		font-size: clamp(1.5rem, 5cqw, 2.5rem);
		font-weight: 600;
		color: var(--text, #ffffff);
		letter-spacing: 0.02em;
		text-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
	}

	.demo-content-row {
		display: flex;
		align-items: stretch;
		justify-content: center;
		gap: clamp(16px, 3cqw, 32px);
		width: 100%;
	}

	.animation-preview {
		display: flex;
		flex-direction: column;
		align-items: center;
		flex: 0 0 auto;
	}

	.canvas-wrapper {
		width: clamp(300px, 38cqw, 400px);
		height: clamp(300px, 38cqw, 400px);
		background: rgba(0, 0, 0, 0.4);
		border: 1px solid var(--border, rgba(255, 255, 255, 0.1));
		border-radius: 16px;
		overflow: hidden;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
	}

	.beat-grid-panel {
		flex: 0 0 auto;
		width: clamp(400px, 50cqw, 530px);
		height: clamp(300px, 38cqw, 400px);
		background: transparent;
		border: 2px solid var(--border-strong, rgba(255, 255, 255, 0.2));
		border-radius: 16px;
		overflow: visible;
		padding: 0;
	}

	.animation-loading,
	.animation-fallback {
		width: 280px;
		height: 280px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 12px;
		background: var(--bg-card, rgba(255, 255, 255, 0.03));
		border: 1px solid var(--border, rgba(255, 255, 255, 0.1));
		border-radius: 16px;
		color: var(--text-muted, rgba(255, 255, 255, 0.6));
	}

	.fallback-icon {
		font-size: 4rem;
		opacity: 0.5;
	}

	.spinner {
		width: 32px;
		height: 32px;
		border: 3px solid var(--border, rgba(255, 255, 255, 0.1));
		border-top-color: var(--primary, #6366f1);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.demo-controls {
		position: absolute;
		bottom: 0;
		z-index: 10;
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.light-toggle-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		background: var(--bg-card, rgba(255, 255, 255, 0.03));
		border: 1px solid var(--border, rgba(255, 255, 255, 0.1));
		border-radius: 50%;
		color: var(--text-muted, rgba(255, 255, 255, 0.6));
		cursor: pointer;
		transition: all 0.25s ease;
	}

	.light-toggle-btn svg {
		width: 24px;
		height: 24px;
	}

	.light-toggle-btn:hover:not(:disabled) {
		background: var(--bg-card-hover, rgba(255, 255, 255, 0.06));
		border-color: var(--border-strong, rgba(255, 255, 255, 0.2));
		color: var(--text, #ffffff);
		transform: scale(1.05);
	}

	.light-toggle-btn:active:not(:disabled) {
		transform: scale(0.95);
	}

	.light-toggle-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Dark mode active - glowing effect */
	.light-toggle-btn.dark-mode {
		background: rgba(99, 102, 241, 0.15);
		border-color: rgba(99, 102, 241, 0.4);
		color: var(--primary-light, #818cf8);
		box-shadow:
			0 0 20px rgba(99, 102, 241, 0.3),
			inset 0 0 15px rgba(99, 102, 241, 0.1);
	}

	.light-toggle-btn.dark-mode:hover:not(:disabled) {
		background: rgba(99, 102, 241, 0.25);
		box-shadow:
			0 0 30px rgba(99, 102, 241, 0.5),
			inset 0 0 20px rgba(99, 102, 241, 0.15);
	}

	.randomize-btn {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		padding: 14px 28px;
		background: linear-gradient(135deg, var(--primary, #6366f1) 0%, #818cf8 100%);
		border: none;
		border-radius: 100px;
		color: white;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
	}

	.randomize-btn:hover:not(:disabled) {
		transform: translateY(-2px) scale(1.02);
		box-shadow: 0 8px 30px rgba(99, 102, 241, 0.4);
	}

	.randomize-btn:active:not(:disabled) {
		transform: translateY(0) scale(0.98);
	}

	.randomize-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.randomize-btn svg {
		width: 20px;
		height: 20px;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	@media (max-width: 768px) {
		.demo-content-row {
			flex-wrap: wrap;
		}

		.beat-grid-panel {
			width: 100%;
			max-width: clamp(300px, 85vw, 440px);
			height: clamp(280px, 55vw, 380px);
		}

		.word-label-row .word-text {
			font-size: clamp(1.25rem, 6vw, 2rem);
		}

		.canvas-wrapper {
			width: clamp(280px, 70vw, 360px);
			height: clamp(280px, 70vw, 360px);
		}

		.animation-loading,
		.animation-fallback {
			width: clamp(240px, 65vw, 320px);
			height: clamp(240px, 65vw, 320px);
		}

		.demo-controls {
			gap: 10px;
		}

		.light-toggle-btn {
			width: 44px;
			height: 44px;
		}

		.light-toggle-btn svg {
			width: 22px;
			height: 22px;
		}

		.randomize-btn {
			padding: 12px 24px;
			font-size: 0.9rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.randomize-btn,
		.light-toggle-btn {
			transition: none;
		}

		.spinner {
			animation: none;
		}

		.randomize-btn:hover:not(:disabled),
		.randomize-btn:active:not(:disabled),
		.light-toggle-btn:hover:not(:disabled),
		.light-toggle-btn:active:not(:disabled) {
			transform: none;
		}
	}
</style>
