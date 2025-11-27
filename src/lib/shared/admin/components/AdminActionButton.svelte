<script lang="ts">
	/**
	 * AdminActionButton
	 * Styled action button with variants
	 */

	import type { AdminVariant } from '../types/admin-component-types';

	interface AdminActionButtonProps {
		variant?: AdminVariant;
		icon?: string;
		loading?: boolean;
		disabled?: boolean;
		fullWidth?: boolean;
		class?: string;
		onclick?: () => void;
		children: any;
	}

	let {
		variant = 'primary',
		icon,
		loading = false,
		disabled = false,
		fullWidth = false,
		class: className = '',
		onclick,
		children,
	}: AdminActionButtonProps = $props();
</script>

<button
	class="admin-action-btn variant-{variant} {className}"
	class:full-width={fullWidth}
	{onclick}
	disabled={disabled || loading}
>
	{#if loading}
		<i class="fas fa-spinner fa-spin"></i>
	{:else if icon}
		<i class="fas {icon}"></i>
	{/if}
	<span>{@render children()}</span>
</button>

<style>
	.admin-action-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 10px 20px;
		border: none;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.admin-action-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.admin-action-btn.full-width {
		width: 100%;
	}

	/* Primary variant */
	.variant-primary {
		background: #3b82f6;
		color: white;
	}

	.variant-primary:hover:not(:disabled) {
		background: #2563eb;
	}

	/* Secondary variant */
	.variant-secondary {
		background: rgba(255, 255, 255, 0.1);
		color: rgba(255, 255, 255, 0.9);
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.variant-secondary:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.15);
	}

	/* Warning variant */
	.variant-warning {
		background: rgba(245, 158, 11, 0.15);
		color: #fbbf24;
		border: 1px solid rgba(245, 158, 11, 0.3);
	}

	.variant-warning:hover:not(:disabled) {
		background: rgba(245, 158, 11, 0.25);
	}

	/* Danger variant */
	.variant-danger {
		background: rgba(239, 68, 68, 0.15);
		color: #fca5a5;
		border: 1px solid rgba(239, 68, 68, 0.3);
	}

	.variant-danger:hover:not(:disabled) {
		background: rgba(239, 68, 68, 0.25);
	}

	/* Info variant */
	.variant-info {
		background: rgba(99, 102, 241, 0.15);
		color: #a5b4fc;
		border: 1px solid rgba(99, 102, 241, 0.3);
	}

	.variant-info:hover:not(:disabled) {
		background: rgba(99, 102, 241, 0.25);
	}
</style>
