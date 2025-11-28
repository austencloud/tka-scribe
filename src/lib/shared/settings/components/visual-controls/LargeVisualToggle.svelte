<script lang="ts">
	import { spring } from 'svelte/motion';
	import type { Snippet } from 'svelte';

	interface Props {
		enabled: boolean;
		label: string;
		description?: string;
		helperText?: string;
		size?: 'standard' | 'large';
		preview?: Snippet<[{ enabled: boolean }]>;
		disabled?: boolean;
		onChange?: (enabled: boolean) => void;
		onToggle?: () => void;
	}

	let {
		enabled = $bindable(),
		label,
		description,
		helperText,
		size = 'large',
		preview,
		disabled = false,
		onChange,
		onToggle
	}: Props = $props();

	// Spring animation for smooth thumb movement
	const thumbPosition = spring(enabled ? 1 : 0, {
		stiffness: 0.3,
		damping: 0.4
	});

	// Update spring when enabled changes
	$effect(() => {
		thumbPosition.set(enabled ? 1 : 0);
	});

	// Calculate thumb translation based on size
	const thumbTranslate = $derived(
		size === 'large'
			? $thumbPosition * 30 // 68px - 36px - 2px padding
			: $thumbPosition * 22 // 51px - 27px - 2px padding
	);

	function handleToggle() {
		if (disabled) return;
		enabled = !enabled;
		onChange?.(enabled);
		onToggle?.();
	}
</script>

<div class="visual-toggle" class:has-preview={!!preview}>
	<!-- Optional preview slot (left side) -->
	{#if preview}
		<div class="toggle-preview">
			{@render preview({ enabled })}
		</div>
	{/if}

	<!-- Control section (right side or full width if no preview) -->
	<div class="toggle-control">
		<div class="toggle-text">
			<label for="toggle-{label}" class="toggle-label" class:disabled>
				{label}
			</label>
			{#if description}
				<p class="toggle-description">{description}</p>
			{/if}
			{#if helperText}
				<p class="toggle-helper-text">{helperText}</p>
			{/if}
		</div>

		<button
			id="toggle-{label}"
			class="toggle-switch"
			class:on={enabled}
			class:large={size === 'large'}
			class:standard={size === 'standard'}
			class:disabled
			{disabled}
			onclick={handleToggle}
			role="switch"
			aria-checked={enabled}
			aria-label={label}
		>
			<span class="toggle-track">
				<span
					class="toggle-thumb"
					style="transform: translateX({thumbTranslate}px)"
				></span>
			</span>
		</button>
	</div>
</div>

<style>
	.visual-toggle {
		display: flex;
		gap: var(--settings-space-lg);
		align-items: center;
		padding: var(--settings-space-md);
		background: var(--settings-glass-bg);
		border: 1px solid var(--settings-glass-border);
		border-radius: var(--settings-radius-md);
		transition: all var(--settings-transition-base) var(--settings-ease-out);
	}

	.visual-toggle:hover {
		background: var(--settings-glass-bg-hover);
		border-color: var(--settings-glass-border-hover);
	}

	/* Preview section (if provided) */
	.toggle-preview {
		flex: 0 0 120px;
		height: 80px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.2);
		border-radius: var(--settings-radius-sm);
		overflow: hidden;
	}

	/* Control section */
	.toggle-control {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--settings-space-md);
	}

	.toggle-text {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--settings-space-xs);
	}

	.toggle-label {
		font-size: var(--settings-font-size-body);
		font-weight: var(--settings-font-weight-semibold);
		color: var(--settings-text-primary);
		cursor: pointer;
		margin: 0;
		letter-spacing: var(--settings-letter-spacing-normal);
	}

	.toggle-description {
		font-size: var(--settings-font-size-caption);
		font-weight: var(--settings-font-weight-normal);
		color: var(--settings-text-secondary);
		margin: 0;
		line-height: 1.4;
	}

	.toggle-helper-text {
		font-size: var(--settings-font-size-caption);
		font-weight: var(--settings-font-weight-normal);
		color: var(--settings-text-tertiary, rgba(255, 255, 255, 0.5));
		margin: 0;
		line-height: 1.4;
		font-style: italic;
	}

	.toggle-label.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Toggle switch */
	.toggle-switch {
		flex-shrink: 0;
		position: relative;
		border: none;
		cursor: pointer;
		padding: 0;
		transition: all var(--settings-transition-base) var(--settings-ease-out);
		background: transparent;
	}

	.toggle-switch:disabled,
	.toggle-switch.disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.toggle-switch:disabled .toggle-track,
	.toggle-switch.disabled .toggle-track {
		background: rgba(120, 120, 128, 0.2);
	}

	/* Large size (68x40) */
	.toggle-switch.large {
		width: var(--settings-toggle-width);
		height: var(--settings-toggle-height);
	}

	/* Standard size (51x31 - iOS compatible) */
	.toggle-switch.standard {
		width: var(--settings-toggle-width-standard);
		height: var(--settings-toggle-height-standard);
	}

	.toggle-track {
		display: block;
		width: 100%;
		height: 100%;
		border-radius: var(--settings-radius-full);
		background: rgba(120, 120, 128, 0.32);
		position: relative;
		transition: all var(--settings-transition-base) var(--settings-ease-out);
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.toggle-switch.on .toggle-track {
		background: linear-gradient(135deg, var(--settings-primary-indigo), var(--settings-primary-purple));
		box-shadow:
			0 4px 20px rgba(99, 102, 241, 0.4),
			inset 0 1px 2px rgba(255, 255, 255, 0.2);
	}

	.toggle-thumb {
		position: absolute;
		top: var(--settings-toggle-padding);
		left: var(--settings-toggle-padding);
		border-radius: 50%;
		background: white;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		transition: box-shadow var(--settings-transition-base) var(--settings-ease-out);
		will-change: transform;
	}

	/* Large thumb */
	.toggle-switch.large .toggle-thumb {
		width: var(--settings-toggle-thumb-size);
		height: var(--settings-toggle-thumb-size);
	}

	/* Standard thumb */
	.toggle-switch.standard .toggle-thumb {
		width: var(--settings-toggle-thumb-size-standard);
		height: var(--settings-toggle-thumb-size-standard);
	}

	.toggle-switch.on .toggle-thumb {
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
	}

	/* Hover effects */
	.toggle-switch:hover .toggle-track {
		background: rgba(120, 120, 128, 0.4);
	}

	.toggle-switch.on:hover .toggle-track {
		background: linear-gradient(135deg, #7c7ff3, #9d6cf8);
	}

	/* Focus state */
	.toggle-switch:focus-visible {
		outline: 2px solid var(--settings-primary-indigo);
		outline-offset: 4px;
		border-radius: var(--settings-radius-full);
	}

	/* Active (pressed) state */
	.toggle-switch:active .toggle-thumb {
		transform: translateX(calc(var(--thumb-translate, 0px))) scale(0.95);
	}

	/* Mobile adjustments */
	@media (max-width: 768px) {
		.visual-toggle {
			flex-direction: column;
			align-items: stretch;
		}

		.visual-toggle.has-preview {
			flex-direction: column;
		}

		.toggle-preview {
			flex: 0 0 auto;
			width: 100%;
			height: 100px;
		}

		.toggle-control {
			flex-direction: row;
		}
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.toggle-switch,
		.toggle-track,
		.toggle-thumb {
			transition: none;
		}
	}
</style>
