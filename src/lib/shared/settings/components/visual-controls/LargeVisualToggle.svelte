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
			class="visual-setting-toggle"
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
		container-type: inline-size;
		container-name: visual-toggle;
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

	/* Toggle switch - container query aware with 48px minimum */
	.visual-setting-toggle {
		flex-shrink: 0;
		position: relative;
		border: none;
		cursor: pointer;
		padding: 0;
		transition: all var(--settings-transition-base) var(--settings-ease-out);
		background: transparent;
		/* Container query aware sizing with 48px min touch target */
		min-width: 48px;
		min-height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.visual-setting-toggle:disabled,
	.visual-setting-toggle.disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.visual-setting-toggle:disabled .toggle-track,
	.visual-setting-toggle.disabled .toggle-track {
		background: rgba(120, 120, 128, 0.2);
	}

	/* Large size - responsive with container queries */
	.visual-setting-toggle.large .toggle-track {
		width: clamp(48px, 10cqi, var(--settings-toggle-width, 68px));
		height: clamp(28px, 6cqi, var(--settings-toggle-height, 40px));
	}

	/* Standard size - responsive with container queries */
	.visual-setting-toggle.standard .toggle-track {
		width: clamp(48px, 8cqi, var(--settings-toggle-width-standard, 51px));
		height: clamp(28px, 5cqi, var(--settings-toggle-height-standard, 31px));
	}

	.toggle-track {
		display: block;
		border-radius: var(--settings-radius-full);
		background: rgba(120, 120, 128, 0.32);
		position: relative;
		transition: all var(--settings-transition-base) var(--settings-ease-out);
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.visual-setting-toggle.on .toggle-track {
		background: linear-gradient(135deg, var(--settings-primary-indigo), var(--settings-primary-purple));
		box-shadow:
			0 4px 20px rgba(99, 102, 241, 0.4),
			inset 0 1px 2px rgba(255, 255, 255, 0.2);
	}

	.toggle-thumb {
		position: absolute;
		top: var(--settings-toggle-padding, 2px);
		left: var(--settings-toggle-padding, 2px);
		border-radius: 50%;
		background: white;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		transition: box-shadow var(--settings-transition-base) var(--settings-ease-out);
		will-change: transform;
	}

	/* Large thumb - responsive */
	.visual-setting-toggle.large .toggle-thumb {
		width: clamp(24px, 5cqi, var(--settings-toggle-thumb-size, 36px));
		height: clamp(24px, 5cqi, var(--settings-toggle-thumb-size, 36px));
	}

	/* Standard thumb - responsive */
	.visual-setting-toggle.standard .toggle-thumb {
		width: clamp(24px, 4cqi, var(--settings-toggle-thumb-size-standard, 27px));
		height: clamp(24px, 4cqi, var(--settings-toggle-thumb-size-standard, 27px));
	}

	.visual-setting-toggle.on .toggle-thumb {
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
	}

	/* Hover effects */
	.visual-setting-toggle:hover .toggle-track {
		background: rgba(120, 120, 128, 0.4);
	}

	.visual-setting-toggle.on:hover .toggle-track {
		background: linear-gradient(135deg, #7c7ff3, #9d6cf8);
	}

	/* Focus state */
	.visual-setting-toggle:focus-visible {
		outline: 2px solid var(--settings-primary-indigo);
		outline-offset: 4px;
		border-radius: var(--settings-radius-full);
	}

	/* Active (pressed) state */
	.visual-setting-toggle:active .toggle-thumb {
		transform: translateX(calc(var(--thumb-translate, 0px))) scale(0.95);
	}

	/* Container query based adjustments */
	@container visual-toggle (max-width: 300px) {
		.toggle-control {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--settings-space-sm);
		}

		.visual-setting-toggle {
			align-self: flex-end;
		}
	}

	@container visual-toggle (max-width: 200px) {
		.visual-setting-toggle.large .toggle-track,
		.visual-setting-toggle.standard .toggle-track {
			width: 48px;
			height: 28px;
		}

		.visual-setting-toggle.large .toggle-thumb,
		.visual-setting-toggle.standard .toggle-thumb {
			width: 24px;
			height: 24px;
		}
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
		.visual-setting-toggle,
		.toggle-track,
		.toggle-thumb {
			transition: none;
		}
	}
</style>
