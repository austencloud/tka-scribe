<!--
  PracticeModeToggle.svelte - Practice Mode Selector

  Segmented control for switching between Adaptive, Step-by-Step, and Timed modes.
  Follows the design pattern of PanelTabs.svelte.

  Props:
  - compact: When true, shows icon-only on all screen sizes (for use in headers)
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
			icon: "fa-brain",
			description: "Auto-advance when you match positions"
		},
		{
			value: PracticeMode.STEP_BY_STEP,
			label: "Step-by-Step",
			icon: "fa-shoe-prints",
			description: "Advance manually or with voice"
		},
		{
			value: PracticeMode.TIMED,
			label: "Timed",
			icon: "fa-stopwatch",
			description: "Follow beat timing with scoring"
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
			aria-label={mode.label}
		>
			<i class="fas {mode.icon}"></i>
			{#if !compact}
				<span class="mode-label">{mode.label}</span>
			{/if}
		</button>
	{/each}
</div>

<style>
	.mode-toggle {
		display: flex;
		gap: 0.5rem;
		padding: 0.25rem;
		background: rgba(0, 0, 0, 0.3);
		border-radius: 0.75rem;
		border: 1px solid rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
	}

	.mode-button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: transparent;
		border: none;
		border-radius: 0.5rem;
		color: rgba(255, 255, 255, 0.6);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		white-space: nowrap;
	}

	.mode-button:hover {
		background: rgba(255, 255, 255, 0.1);
		color: rgba(255, 255, 255, 0.9);
	}

	.mode-button.active {
		background: rgba(59, 130, 246, 0.3);
		color: #ffffff;
		box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
	}

	.mode-button i {
		font-size: 1rem;
	}

	.mode-label {
		font-size: 0.875rem;
	}

	/* Compact mode - icon-only on all screen sizes */
	.mode-toggle.compact {
		gap: 0.25rem;
		padding: 0.2rem;
	}

	.mode-toggle.compact .mode-button {
		padding: 0.5rem 0.625rem;
	}

	.mode-toggle.compact .mode-button i {
		font-size: 1rem;
	}

	/* Mobile responsive */
	@media (max-width: 640px) {
		.mode-toggle {
			gap: 0.25rem;
		}

		.mode-button {
			padding: 0.5rem 0.75rem;
			gap: 0.375rem;
		}

		.mode-label {
			display: none;
		}

		.mode-button i {
			font-size: 1.125rem;
		}
	}
</style>
