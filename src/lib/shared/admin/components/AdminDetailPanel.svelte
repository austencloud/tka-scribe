<script lang="ts">
	/**
	 * AdminDetailPanel
	 *
	 * Right-side detail panel with header, close button, and optional action footer.
	 * Used within AdminTwoPanelLayout to display details of a selected item.
	 *
	 * @example
	 * <AdminDetailPanel
	 *   title="User Details"
	 *   subtitle="john@example.com"
	 *   icon="fa-user"
	 *   onClose={() => selectedUser = null}
	 * >
	 *   <div>Detail content</div>
	 *
	 *   {#snippet actions()}
	 *     <button>Save</button>
	 *   {/snippet}
	 * </AdminDetailPanel>
	 */

	import { ADMIN_COLORS, ADMIN_SPACING, ADMIN_RADIUS } from '../styles/admin-theme';

	interface AdminDetailPanelProps {
		title: string;
		subtitle?: string;
		icon?: string;
		onClose: () => void;
		variant?: 'default' | 'form' | 'readonly';
		class?: string;
		children: any;
		header?: any;
		actions?: any;
	}

	let {
		title,
		subtitle,
		icon,
		onClose,
		variant = 'default',
		class: className = '',
		children,
		header,
		actions,
	}: AdminDetailPanelProps = $props();
</script>

<div class="admin-detail-panel {className} variant-{variant}">
	{#if header}
		{@render header()}
	{:else}
		<header class="detail-header">
			<button class="close-btn" onclick={onClose} aria-label="Close detail panel">
				<i class="fas fa-times"></i>
			</button>

			{#if icon}
				<div class="header-icon">
					<i class="fas {icon}"></i>
				</div>
			{/if}

			<h3 class="header-title">{title}</h3>

			{#if subtitle}
				<p class="header-subtitle">{subtitle}</p>
			{/if}
		</header>
	{/if}

	<div class="detail-content">
		{@render children()}
	</div>

	{#if actions}
		<footer class="detail-footer">
			{@render actions()}
		</footer>
	{/if}
</div>

<style>
	.admin-detail-panel {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: rgba(0, 0, 0, 0.2);
	}

	/* Header */
	.detail-header {
		position: relative;
		padding: 32px 24px;
		text-align: center;
		background: linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 0%, transparent 100%);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.close-btn {
		position: absolute;
		top: 16px;
		right: 16px;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.1);
		border: none;
		color: rgba(255, 255, 255, 0.6);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
	}

	/* Expand touch target while maintaining visual size */
	.close-btn::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		min-width: 48px;
		min-height: 48px;
	}

	.close-btn:hover {
		background: rgba(255, 255, 255, 0.2);
		color: white;
	}

	.header-icon {
		width: 64px;
		height: 64px;
		margin: 0 auto 16px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.05);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 24px;
		color: rgba(255, 255, 255, 0.7);
	}

	.header-title {
		margin: 0 0 4px 0;
		font-size: 20px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.95);
	}

	.header-subtitle {
		margin: 0;
		font-size: 14px;
		color: rgba(255, 255, 255, 0.6);
	}

	/* Content */
	.detail-content {
		flex: 1;
		overflow-y: auto;
		padding: 24px;
	}

	.detail-content::-webkit-scrollbar {
		width: 6px;
	}

	.detail-content::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.05);
	}

	.detail-content::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.2);
		border-radius: 3px;
	}

	.detail-content::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.3);
	}

	/* Footer */
	.detail-footer {
		padding: 16px 24px;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		background: rgba(0, 0, 0, 0.3);
		display: flex;
		gap: 12px;
		justify-content: flex-end;
	}

	/* Variant: readonly (remove edit actions styling) */
	.variant-readonly .detail-footer {
		justify-content: center;
	}

	/* Mobile adjustments */
	@media (max-width: 767px) {
		.detail-header {
			padding: 24px 16px;
		}

		.detail-content {
			padding: 16px;
		}

		.detail-footer {
			padding: 12px 16px;
		}
	}
</style>
