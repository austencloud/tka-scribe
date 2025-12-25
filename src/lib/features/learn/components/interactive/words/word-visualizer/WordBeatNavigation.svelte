<!--
WordBeatNavigation - Beat navigation dots for letter sequence
-->
<script lang="ts">
	import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
	import { resolve } from "$lib/shared/inversify/di";
	import { TYPES } from "$lib/shared/inversify/types";
	import type { LetterDefinition } from "../../../../domain/constants/word-visualizer-data";

	let {
		letters,
		currentBeatIndex,
		showBeatNumber = true,
		compact = false,
		onBeatChange
	}: {
		letters: LetterDefinition[];
		currentBeatIndex: number;
		showBeatNumber?: boolean;
		compact?: boolean;
		onBeatChange: (index: number) => void;
	} = $props();

	const hapticService = resolve<IHapticFeedbackService>(TYPES.IHapticFeedbackService);

	function goToBeat(index: number) {
		hapticService?.trigger("selection");
		onBeatChange(index);
	}
</script>

<div class="beat-navigation">
	{#each letters as letter, i}
		<button
			class="beat-dot"
			class:active={i === currentBeatIndex}
			class:compact
			onclick={() => goToBeat(i)}
			aria-label="Beat {i + 1}: {letter.letter}"
		>
			{#if showBeatNumber}
				<span class="beat-number">{i + 1}</span>
			{/if}
		</button>
	{/each}
</div>

<style>
	.beat-navigation {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		justify-content: center;
	}

	.beat-dot {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.08);
		border: 2px solid rgba(255, 255, 255, 0.15);
		border-radius: 50%;
		cursor: pointer;
		transition: all 0.2s ease;
		color: rgba(255, 255, 255, 0.6);
		font-size: 0.75rem;
		font-weight: 600;
	}

	.beat-dot.compact {
		width: 24px;
		height: 24px;
		font-size: 0.625rem;
	}

	.beat-dot:hover {
		background: rgba(255, 255, 255, 0.12);
		border-color: rgba(255, 255, 255, 0.25);
		transform: scale(1.1);
	}

	.beat-dot.active {
		background: rgba(34, 211, 238, 0.25);
		border-color: rgba(34, 211, 238, 0.6);
		color: #22d3ee;
	}

	.beat-number {
		line-height: 1;
	}
</style>
