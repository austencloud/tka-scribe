<!--
HowItWorksSection.svelte - Numbered steps explaining the tab workflow

Displays a list of numbered steps with colored indicators.
-->
<script lang="ts">
	/**
	 * A single step in the "How it works" section
	 */
	export interface HowItWorksStep {
		/** Step number (1, 2, 3...) */
		number: number;
		/** Step description (can include HTML like <strong>) */
		text: string;
		/** Color class for the step indicator */
		colorClass: "blue" | "red" | "green" | "purple";
	}

	interface Props {
		steps: HowItWorksStep[];
	}

	const { steps }: Props = $props();
</script>

<div class="how-it-works">
	<h2 class="section-title">How it works</h2>
	<ol class="steps-list">
		{#each steps as step}
			<li>
				<span class="step-number {step.colorClass}">{step.number}</span>
				<span class="step-text">{@html step.text}</span>
			</li>
		{/each}
	</ol>
</div>

<style>
	.how-it-works {
		width: 100%;
		background: var(--theme-card-bg, rgba(255, 255, 255, 0.03));
		border-radius: 12px;
		padding: 16px 20px;
	}

	.section-title {
		font-size: var(--font-size-compact, 12px);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--theme-text-dim, rgba(255, 255, 255, 0.4));
		margin: 0 0 12px 0;
	}

	.steps-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.steps-list li {
		display: flex;
		align-items: center;
		gap: 12px;
		text-align: left;
	}

	.step-number {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--font-size-compact, 12px);
		font-weight: 700;
		flex-shrink: 0;
	}

	.step-number.blue {
		background: rgba(59, 130, 246, 0.2);
		color: #3b82f6;
	}

	.step-number.red {
		background: rgba(239, 68, 68, 0.2);
		color: #ef4444;
	}

	.step-number.green {
		background: rgba(16, 185, 129, 0.2);
		color: #10b981;
	}

	.step-number.purple {
		background: rgba(139, 92, 246, 0.2);
		color: #8b5cf6;
	}

	.step-text {
		font-size: var(--font-size-min, 14px);
		color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
	}

	.step-text :global(strong) {
		color: var(--theme-text, rgba(255, 255, 255, 0.9));
	}
</style>
