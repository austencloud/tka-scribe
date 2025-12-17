<!--
StartNewButton.svelte - Primary CTA to start a new sequence

The main action button on the start screen. Customizable accent color per tab.
-->
<script lang="ts">
	interface Props {
		/** Button label */
		label?: string;
		/** Accent color (tab-specific) */
		accentColor?: string;
		/** Click handler */
		onclick: () => void;
		/** Disabled state */
		disabled?: boolean;
	}

	const { label = "Start New Sequence", accentColor, onclick, disabled = false }: Props = $props();
</script>

<button
	class="start-button"
	style:--btn-accent={accentColor}
	type="button"
	{onclick}
	{disabled}
>
	<span class="button-text">{label}</span>
	<span class="button-icon">→</span>
</button>

<style>
	.start-button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		width: 100%;
		max-width: 280px;
		padding: 16px 24px;
		background: linear-gradient(
			135deg,
			var(--btn-accent, var(--theme-accent-strong, #8b5cf6)),
			color-mix(in srgb, var(--btn-accent, var(--theme-accent-strong, #8b5cf6)) 80%, black)
		);
		border: none;
		border-radius: 12px;
		color: white;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		box-shadow: 0 4px 16px color-mix(in srgb, var(--btn-accent, var(--theme-accent-strong, #8b5cf6)) 30%, transparent);
	}

	.start-button:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px color-mix(in srgb, var(--btn-accent, var(--theme-accent-strong, #8b5cf6)) 40%, transparent);
	}

	.start-button:active:not(:disabled) {
		transform: translateY(0);
	}

	.start-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.button-icon {
		font-size: 18px;
		transition: transform 0.2s ease;
	}

	.start-button:hover:not(:disabled) .button-icon {
		transform: translateX(4px);
	}
</style>
