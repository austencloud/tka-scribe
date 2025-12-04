<!--
  PracticeModeToggle.svelte - Practice Mode Selector

  Segmented control for switching between Adaptive, Step-by-Step, and Timed modes.
  Shows labels and descriptions to make mode purposes clear to users.

  Props:
  - compact: When true, shows icon-only (for use in space-constrained areas)
-->
<script lang="ts">
	import { PracticeMode } from "../../domain/enums/TrainEnums";

	interface Props {
		activeMode: PracticeMode;
		onModeChange: (mode: PracticeMode) => void;
		compact?: boolean;
	}

	let { activeMode, onModeChange, compact = false }: Props = $props();

	const modes = [
		{
			value: PracticeMode.ADAPTIVE,
			label: "Adaptive",
			shortDesc: "Auto-advance",
			icon: "fa-brain",
			description: "Moves forward when you match the position"
		},
		{
			value: PracticeMode.STEP_BY_STEP,
			label: "Step",
			shortDesc: "Manual",
			icon: "fa-shoe-prints",
			description: "Advance manually at your own pace"
		},
		{
			value: PracticeMode.TIMED,
			label: "Timed",
			shortDesc: "Beat sync",
			icon: "fa-stopwatch",
			description: "Follow the rhythm with scoring"
		}
	];
</script>

<div class="mode-toggle" class:compact>
	{#each modes as mode}
		<button
			class="mode-button"
			class:active={activeMode === mode.value}
			onclick={() => onModeChange(mode.value)}
			title={mode.description}
			aria-label={`${mode.label} mode: ${mode.description}`}
		>
			<i class="fas {mode.icon}"></i>
			{#if !compact}
				<div class="mode-text">
					<span class="mode-label">{mode.label}</span>
					<span class="mode-desc">{mode.shortDesc}</span>
				</div>
			{/if}
		</button>
	{/each}
</div>

<style>
	.mode-toggle {
		display: flex;
		gap: 0.375rem;
		padding: 0.25rem;
		background: rgba(0, 0, 0, 0.3);
		border-radius: 0.75rem;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.mode-button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.625rem;
		min-height: 48px;
		min-width: 48px;
		padding: 0.5rem 1rem;
		background: transparent;
		border: none;
		border-radius: 0.5rem;
		color: rgba(255, 255, 255, 0.6);
		cursor: pointer;
		transition: all 0.2s;
		white-space: nowrap;
	}

	.mode-button:hover {
		background: rgba(255, 255, 255, 0.1);
		color: rgba(255, 255, 255, 0.9);
	}

	.mode-button.active {
		background: rgba(59, 130, 246, 0.25);
		border: 1px solid rgba(59, 130, 246, 0.4);
		color: #ffffff;
	}

	.mode-button i {
		font-size: 1.125rem;
		flex-shrink: 0;
	}

	/* Text container for label + description */
	.mode-text {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.0625rem;
	}

	.mode-label {
		font-size: 0.875rem;
		font-weight: 600;
		line-height: 1.2;
	}

	.mode-desc {
		font-size: 0.6875rem;
		font-weight: 400;
		color: rgba(255, 255, 255, 0.5);
		line-height: 1.2;
	}

	.mode-button.active .mode-desc {
		color: rgba(255, 255, 255, 0.7);
	}

	/* Compact mode - icon-only */
	.mode-toggle.compact {
		gap: 0.25rem;
		padding: 0.2rem;
	}

	.mode-toggle.compact .mode-button {
		padding: 0.5rem;
	}

	.mode-toggle.compact .mode-button i {
		font-size: 1.25rem;
	}

	/* Responsive: collapse to icon + label only on smaller screens */
	@media (max-width: 640px) {
		.mode-toggle {
			gap: 0.25rem;
		}

		.mode-button {
			padding: 0.5rem 0.75rem;
			gap: 0.5rem;
		}

		.mode-desc {
			display: none;
		}

		.mode-button i {
			font-size: 1rem;
		}

		.mode-label {
			font-size: 0.8125rem;
		}
	}

	/* Very small screens: icon only */
	@media (max-width: 420px) {
		.mode-text {
			display: none;
		}

		.mode-button {
			padding: 0.5rem;
		}

		.mode-button i {
			font-size: 1.25rem;
		}
	}
</style>
