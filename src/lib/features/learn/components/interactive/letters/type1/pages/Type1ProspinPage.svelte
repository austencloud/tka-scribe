<!--
Type1ProspinPage - Prospin (Pro-Pro) letters lesson page
Page 2 of 5: Letters A, D, G, J, M, P, S
-->
<script lang="ts">
	import Type1LetterVisualizer from '../Type1LetterVisualizer.svelte';
	import { PROSPIN_LETTERS } from '../domain/type1-letter-data';
	import type { Type1LetterData } from '../Type1LetterData';

	interface Props {
		currentLetter: Type1LetterData | undefined;
		letterIndex: number;
		onCycle: (direction: 1 | -1) => void;
		onSelectLetter: (index: number) => void;
		onNext: () => void;
		onPrevious: () => void;
	}

	let { currentLetter, letterIndex, onCycle, onSelectLetter, onNext, onPrevious }: Props =
		$props();
</script>

<div class="page">
	<h2>Prospin Letters</h2>

	<div class="motion-intro pro">
		<div class="motion-icon">
			<i class="fa-solid fa-rotate-right"></i>
		</div>
		<p class="motion-summary">
			Both hands perform <strong>prospin</strong> motion
		</p>
		<span class="motion-badge">Pro-Pro Pattern</span>
	</div>

	<div class="explanation">
		<h3>What is Prospin?</h3>
		<ul>
			<li>
				The prop spins <strong>in the same direction</strong> as the hand's movement
			</li>
			<li>Think: spinning <strong>with</strong> the flow of motion</li>
			<li>Creates smooth, continuous visual patterns</li>
		</ul>
	</div>

	<div class="visualizer-section">
		{#if currentLetter}
			<Type1LetterVisualizer letterData={currentLetter} size="large" />
		{/if}

		<div class="nav-controls">
			<button
				class="nav-button"
				onclick={() => onCycle(-1)}
				disabled={letterIndex === 0}
				aria-label="Previous prospin letter"
			>
				<i class="fa-solid fa-chevron-left"></i>
			</button>
			<span class="nav-indicator">
				{letterIndex + 1} / {PROSPIN_LETTERS.length}
			</span>
			<button
				class="nav-button"
				onclick={() => onCycle(1)}
				disabled={letterIndex === PROSPIN_LETTERS.length - 1}
				aria-label="Next prospin letter"
			>
				<i class="fa-solid fa-chevron-right"></i>
			</button>
		</div>
	</div>

	<div class="letter-summary">
		<h3>Prospin Letters</h3>
		<div class="summary-letters">
			{#each PROSPIN_LETTERS as letterData, i}
				<button
					class="letter-chip"
					class:active={i === letterIndex}
					onclick={() => onSelectLetter(i)}
				>
					{letterData.letter}
				</button>
			{/each}
		</div>
	</div>

	<div class="button-row">
		<button class="prev-button" onclick={onPrevious}>
			<i class="fa-solid fa-arrow-left"></i>
			Back
		</button>
		<button class="next-button" onclick={onNext}>
			Learn Antispin Letters
			<i class="fa-solid fa-arrow-right"></i>
		</button>
	</div>
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		max-width: 700px;
		margin: 0 auto;
		width: 100%;
		animation: slideInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	@keyframes slideInUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	h2 {
		font-size: 1.875rem;
		font-weight: 700;
		color: white;
		margin: 0;
		text-align: center;
		background: linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	h3 {
		font-size: 1.125rem;
		font-weight: 600;
		color: white;
		margin: 0;
	}

	.motion-intro {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		padding: 1.5rem;
		border-radius: 16px;
	}

	.motion-intro.pro {
		background: linear-gradient(
			135deg,
			rgba(34, 211, 238, 0.1) 0%,
			rgba(34, 211, 238, 0.02) 100%
		);
		border: 1px solid rgba(34, 211, 238, 0.2);
	}

	.motion-icon {
		width: 52px;
		height: 52px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		font-size: 1.5rem;
		background: rgba(34, 211, 238, 0.2);
		color: #22d3ee;
	}

	.motion-summary {
		font-size: 1.25rem;
		font-weight: 500;
		color: rgba(255, 255, 255, 0.85);
		margin: 0;
		text-align: center;
	}

	.motion-badge {
		font-size: 0.75rem;
		font-weight: 700;
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		background: rgba(34, 211, 238, 0.2);
		color: #22d3ee;
	}

	.explanation {
		padding: 1.25rem;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 12px;
	}

	.explanation ul {
		margin: 0.75rem 0 0 0;
		padding-left: 1.25rem;
	}

	.explanation li {
		font-size: 1rem;
		color: rgba(255, 255, 255, 0.75);
		line-height: 1.6;
		margin-bottom: 0.5rem;
	}

	.explanation li:last-child {
		margin-bottom: 0;
	}

	.visualizer-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.nav-controls {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.nav-button {
		width: 52px;
		height: 52px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 50%;
		color: white;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.nav-button:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.15);
		border-color: rgba(255, 255, 255, 0.25);
	}

	.nav-button:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.nav-indicator {
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.6);
		min-width: 60px;
		text-align: center;
	}

	.letter-summary {
		padding: 1rem;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 12px;
	}

	.summary-letters {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 0.75rem;
		justify-content: center;
	}

	.letter-chip {
		width: 52px;
		height: 52px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.08);
		border: 2px solid rgba(255, 255, 255, 0.15);
		border-radius: 8px;
		font-weight: 700;
		font-size: 1.125rem;
		color: rgba(255, 255, 255, 0.7);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.letter-chip:hover {
		background: rgba(255, 255, 255, 0.12);
		color: white;
	}

	.letter-chip.active {
		background: rgba(34, 211, 238, 0.2);
		border-color: rgba(34, 211, 238, 0.5);
		color: #22d3ee;
	}

	.button-row {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin-top: 1rem;
	}

	.next-button,
	.prev-button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.625rem;
		padding: 1rem 2rem;
		border-radius: 12px;
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.3s;
		min-height: 52px;
	}

	.next-button {
		background: linear-gradient(
			135deg,
			rgba(34, 211, 238, 0.3) 0%,
			rgba(6, 182, 212, 0.3) 100%
		);
		backdrop-filter: blur(20px);
		border: 2px solid rgba(34, 211, 238, 0.5);
		color: white;
	}

	.next-button:hover {
		background: linear-gradient(
			135deg,
			rgba(34, 211, 238, 0.4) 0%,
			rgba(6, 182, 212, 0.4) 100%
		);
		border-color: rgba(34, 211, 238, 0.8);
		transform: translateY(-2px);
	}

	.prev-button {
		background: rgba(255, 255, 255, 0.06);
		border: 2px solid rgba(255, 255, 255, 0.15);
		color: rgba(255, 255, 255, 0.8);
	}

	.prev-button:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.25);
	}

	@media (max-width: 600px) {
		h2 {
			font-size: 1.5rem;
		}

		.button-row {
			flex-direction: column;
		}

		.next-button,
		.prev-button {
			width: 100%;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.page {
			animation: none;
		}
	}
</style>
