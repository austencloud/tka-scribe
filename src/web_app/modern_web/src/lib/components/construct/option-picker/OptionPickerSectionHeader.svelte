<!--
OptionPickerSectionHeader.svelte - Section header with colored type button

Matches the desktop version exactly:
- Centered colored button showing type name and description
- Uses LetterType colors and styling
- Clickable to toggle section (like desktop)
-->
<script lang="ts">
	import { LetterType } from './types/LetterType.js';

	// Props
	const { letterType, onToggle = () => {} } = $props<{
		letterType: string;
		onToggle?: () => void;
	}>();

	// Get type info
	const typeInfo = $derived(LetterType.getTypeDescription(letterType));
	const colorPairs = $derived(LetterType.getLegacyColorPairs(letterType));
	const coloredDescription = $derived(LetterType.getColoredText(typeInfo.description));

	// Generate button text like desktop
	const buttonText = $derived(`${typeInfo.typeName}: ${typeInfo.description}`);
	const buttonHtml = $derived(`${typeInfo.typeName}: ${coloredDescription}`);
</script>

<div class="section-header">
	<div class="header-layout">
		<!-- Stretch before button -->
		<div class="stretch"></div>

		<!-- Type button (matches desktop exactly) -->
		<button
			class="type-button"
			style:border-color={colorPairs.primary}
			style:background-color={`${colorPairs.primary}15`}
			onclick={onToggle}
			title={`Toggle ${buttonText} section`}
		>
			<span class="button-label">
				{@html buttonHtml}
			</span>
		</button>

		<!-- Stretch after button -->
		<div class="stretch"></div>
	</div>
</div>

<style>
	.section-header {
		width: 100%;
		margin-bottom: 8px;
	}

	.header-layout {
		display: flex;
		align-items: center;
		width: 100%;
	}

	.stretch {
		flex: 1;
	}

	.type-button {
		/* Match desktop button styling exactly */
		padding: 8px 16px;
		border: 2px solid;
		border-radius: 6px;
		background: transparent;
		cursor: pointer;
		font-family: inherit;
		font-size: 14px;
		font-weight: 500;
		transition: all 0.2s ease;

		/* Center the button */
		flex-shrink: 0;

		/* Text styling */
		color: var(--foreground, #000000);
		text-align: center;
		white-space: nowrap;
	}

	.type-button:hover {
		transform: translateY(-1px);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		opacity: 0.9;
	}

	.type-button:active {
		transform: translateY(0);
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
	}

	.button-label {
		display: inline-block;
		line-height: 1.2;
	}

	/* Ensure colored text in button label is visible */
	.button-label :global(span) {
		font-weight: inherit;
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.type-button {
			padding: 6px 12px;
			font-size: 13px;
		}
	}

	@media (max-width: 480px) {
		.type-button {
			padding: 4px 8px;
			font-size: 12px;
		}
	}
</style>
