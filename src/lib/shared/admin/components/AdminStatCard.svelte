<script lang="ts">
	/**
	 * AdminStatCard
	 * Metric display card with icon and value
	 */

	interface AdminStatCardProps {
		label: string;
		value: string | number;
		icon: string;
		color?: string;
		change?: number;
		changeLabel?: string;
		trend?: 'up' | 'down' | 'neutral';
		class?: string;
	}

	let {
		label,
		value,
		icon,
		color = '#3b82f6',
		change,
		changeLabel,
		trend,
		class: className = '',
	}: AdminStatCardProps = $props();
</script>

<div class="admin-stat-card {className}" style="--accent-color: {color}">
	<div class="stat-icon">
		<i class="fas {icon}"></i>
	</div>

	<div class="stat-content">
		<span class="stat-value">{value}</span>
		<span class="stat-label">{label}</span>

		{#if change !== undefined && changeLabel}
			<span class="stat-change trend-{trend || 'neutral'}">
				<i class="fas fa-arrow-{change >= 0 ? 'up' : 'down'}"></i>
				{Math.abs(change)}% {changeLabel}
			</span>
		{/if}
	</div>
</div>

<style>
	.admin-stat-card {
		background: linear-gradient(
			135deg,
			rgba(255, 255, 255, 0.05),
			rgba(255, 255, 255, 0.02)
		);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		padding: 20px;
		display: flex;
		align-items: flex-start;
		gap: 16px;
		transition: all 0.3s ease;
	}

	.admin-stat-card:hover {
		border-color: var(--accent-color);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		transform: translateY(-2px);
	}

	.stat-icon {
		width: 48px;
		height: 48px;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--accent-color);
		font-size: 24px;
		flex-shrink: 0;
		background: rgba(255, 255, 255, 0.05);
	}

	.stat-content {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.stat-value {
		font-size: 28px;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.95);
	}

	.stat-label {
		font-size: 14px;
		color: rgba(255, 255, 255, 0.6);
	}

	.stat-change {
		font-size: 12px;
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.stat-change.trend-up {
		color: #10b981;
	}

	.stat-change.trend-down {
		color: #ef4444;
	}

	.stat-change.trend-neutral {
		color: rgba(255, 255, 255, 0.5);
	}
</style>
