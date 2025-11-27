<script lang="ts">
	interface Props {
		viewMode: 'global' | 'users';
		onViewModeChange: (mode: 'global' | 'users') => void;
		stats: {
			total: number;
			enabled: number;
			disabled: number;
			byRole: Record<string, number>;
			byCategory: Record<string, number>;
		};
	}

	let { viewMode, onViewModeChange, stats }: Props = $props();
</script>

<header class="management-header">
	<div class="header-top">
		<div class="header-content">
			<h2>Feature Flag Management</h2>
			<p class="header-description">Control feature access and permissions across the platform</p>
		</div>

		<div class="view-toggle">
			<button
				class="toggle-btn"
				class:active={viewMode === 'global'}
				onclick={() => onViewModeChange('global')}
			>
				<i class="fas fa-globe"></i>
				Global Settings
			</button>
			<button
				class="toggle-btn"
				class:active={viewMode === 'users'}
				onclick={() => onViewModeChange('users')}
			>
				<i class="fas fa-user-cog"></i>
				User Overrides
			</button>
		</div>
	</div>
</header>

<style>
	.management-header {
		padding: 24px;
		background: rgba(255, 255, 255, 0.02);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.header-top {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 24px;
	}

	.header-content {
		flex: 1;
	}

	.header-content h2 {
		margin: 0 0 4px 0;
		font-size: 24px;
		font-weight: 600;
	}

	.header-description {
		margin: 0;
		font-size: 14px;
		color: rgba(255, 255, 255, 0.6);
	}

	.view-toggle {
		display: flex;
		gap: 8px;
		background: rgba(255, 255, 255, 0.05);
		padding: 4px;
		border-radius: 8px;
	}

	.toggle-btn {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 16px;
		border: none;
		border-radius: 6px;
		background: transparent;
		color: rgba(255, 255, 255, 0.6);
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		white-space: nowrap;
	}

	.toggle-btn:hover {
		background: rgba(255, 255, 255, 0.05);
		color: rgba(255, 255, 255, 0.8);
	}

	.toggle-btn.active {
		background: rgba(59, 130, 246, 0.2);
		color: #60a5fa;
	}

	@media (max-width: 768px) {
		.header-top {
			flex-direction: column;
		}

		.view-toggle {
			width: 100%;
		}

		.toggle-btn {
			flex: 1;
			justify-content: center;
		}
	}
</style>
