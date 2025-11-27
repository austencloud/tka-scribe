<script lang="ts">
	/**
	 * AdminModal
	 * Confirmation modal dialog
	 */

	import type { ModalVariant } from '../types/admin-component-types';

	interface AdminModalProps {
		title: string;
		message?: string;
		variant?: ModalVariant;
		confirmLabel?: string;
		cancelLabel?: string;
		onConfirm: () => void | Promise<void>;
		onCancel: () => void;
		loading?: boolean;
		class?: string;
		children?: any;
	}

	let {
		title,
		message,
		variant = 'confirm',
		confirmLabel = 'Confirm',
		cancelLabel = 'Cancel',
		onConfirm,
		onCancel,
		loading = false,
		class: className = '',
		children,
	}: AdminModalProps = $props();

	async function handleConfirm() {
		await onConfirm();
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onCancel();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onCancel();
		}
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="modal-overlay" onclick={handleBackdropClick} onkeydown={handleKeydown}>
	<div class="admin-modal variant-{variant} {className}" role="dialog" aria-labelledby="modal-title">
		<h3 id="modal-title" class="modal-title">{title}</h3>

		{#if children}
			<div class="modal-content">
				{@render children()}
			</div>
		{:else if message}
			<p class="modal-message">{message}</p>
		{/if}

		<div class="modal-actions">
			<button class="cancel-btn" onclick={onCancel} disabled={loading}>
				{cancelLabel}
			</button>
			<button
				class="confirm-btn"
				class:danger={variant === 'danger'}
				class:warning={variant === 'warning'}
				onclick={handleConfirm}
				disabled={loading}
			>
				{#if loading}
					<i class="fas fa-spinner fa-spin"></i>
				{:else}
					{confirmLabel}
				{/if}
			</button>
		</div>
	</div>
</div>

<style>
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 24px;
	}

	.admin-modal {
		background: #1a1a2e;
		border-radius: 16px;
		padding: 24px;
		max-width: 400px;
		width: 100%;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.modal-title {
		margin: 0 0 12px 0;
		font-size: 18px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.95);
	}

	.modal-message {
		margin: 0 0 24px 0;
		color: rgba(255, 255, 255, 0.7);
		line-height: 1.5;
	}

	.modal-content {
		margin-bottom: 24px;
	}

	.modal-actions {
		display: flex;
		gap: 12px;
		justify-content: flex-end;
	}

	.cancel-btn,
	.confirm-btn {
		padding: 10px 20px;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		border: none;
	}

	.cancel-btn {
		background: rgba(255, 255, 255, 0.1);
		color: rgba(255, 255, 255, 0.8);
	}

	.cancel-btn:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.15);
	}

	.confirm-btn {
		background: #3b82f6;
		color: white;
	}

	.confirm-btn:hover:not(:disabled) {
		background: #2563eb;
	}

	.confirm-btn.danger {
		background: #ef4444;
	}

	.confirm-btn.danger:hover:not(:disabled) {
		background: #dc2626;
	}

	.confirm-btn.warning {
		background: #f59e0b;
	}

	.confirm-btn.warning:hover:not(:disabled) {
		background: #d97706;
	}

	.cancel-btn:disabled,
	.confirm-btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}
</style>
