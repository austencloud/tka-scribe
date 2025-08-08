<script lang="ts">
	import { onMount } from 'svelte';
	import BeatFrame from './BeatFrame.svelte';
	import { sequenceStateService } from '$lib/services/SequenceStateService.svelte';

	interface Props {
		containerHeight?: number;
		containerWidth?: number;
		onBeatSelected?: (index: number) => void;
	}

	let { containerHeight = 0, containerWidth = 0, onBeatSelected }: Props = $props();

	const currentSequence = $derived(sequenceStateService.currentSequence);
	const selectedBeatIndex = $derived(sequenceStateService.selectedBeatIndex);

	// label text from current sequence name - show placeholder when no sequence
	const sequenceName = $derived(currentSequence?.name ?? 'No Sequence Loaded');

	let beatFrameNaturalHeight = $state(0);
	let beatFrameShouldScroll = $state(false);
	let currentWordLabelElement: HTMLElement | null = null;

	function handleBeatFrameHeightChange(event: CustomEvent<{ height: number }>) {
		beatFrameNaturalHeight = event.detail.height;
	}

	$effect(() => {
		if (!containerHeight || !currentWordLabelElement) return;
		const labelHeight = currentWordLabelElement.offsetHeight || 0;
		const available = containerHeight - labelHeight;
		beatFrameShouldScroll = beatFrameNaturalHeight > available;
	});

	function handleBeatClick(index: number) {
		onBeatSelected?.(index);
	}
</script>

<div
	class="sequence-container"
	style:justify-content={beatFrameShouldScroll ? 'flex-start' : 'center'}
	style:align-items={beatFrameShouldScroll ? 'stretch' : 'center'}
>
	<div class="content-wrapper" class:scroll-mode-active={beatFrameShouldScroll}>
		<div class="label-and-beatframe-unit" class:scroll-mode-active={beatFrameShouldScroll}>
			<div bind:this={currentWordLabelElement} class="sequence-widget-labels">
				<div class="current-word-label" title={sequenceName}>{sequenceName}</div>
			</div>

			<div class="beat-frame-wrapper" class:scroll-mode-active={beatFrameShouldScroll}>
				<BeatFrame
					beats={currentSequence?.beats ?? []}
					{selectedBeatIndex}
					onBeatClick={handleBeatClick}
					on:naturalheightchange={handleBeatFrameHeightChange}
					isScrollable={beatFrameShouldScroll}
				/>
			</div>
		</div>
	</div>
</div>

<style>
	.sequence-container {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
		min-height: 0;
		overflow: visible;
		padding: 10px 0 10px 0;
		box-sizing: border-box;
		transition: all 0.3s ease-out;
	}

	.content-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		flex: 1;
		min-height: 0;
		transition: all 0.3s ease-out;
	}

	.content-wrapper.scroll-mode-active {
		justify-content: flex-start;
	}

	.label-and-beatframe-unit {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		gap: 0;
		flex: 0 0 auto;
		transition: all 0.3s ease-out;
	}

	.label-and-beatframe-unit.scroll-mode-active {
		width: 100%;
		flex: 1 1 auto;
		min-height: 0;
	}

	.current-word-label {
		font-size: 14px;
		font-weight: 600;
		color: #333;
		text-align: center;
		padding: 4px 8px;
	}
</style>
