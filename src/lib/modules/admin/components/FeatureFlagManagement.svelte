<script lang="ts">
	/**
	 * Feature Flag Management
	 * Admin interface for managing feature flags and access control
	 */

	import { featureFlagService } from '$shared/auth/services';
	import {
		FeatureFlagHeader,
		GlobalFlagSettings,
		UserFeatureOverrides,
		computeStats,
	} from './feature-flags';

	let viewMode = $state<'global' | 'users'>('global');
	let errorMessage = $state<string | null>(null);

	const stats = $derived(computeStats(featureFlagService.featureConfigs));

	function handleViewModeChange(mode: 'global' | 'users') {
		viewMode = mode;
	}

	function handleError(message: string) {
		errorMessage = message;
	}
</script>

<div class="feature-flag-management">
	<FeatureFlagHeader {viewMode} onViewModeChange={handleViewModeChange} {stats} />

	{#if errorMessage}
		<div class="error-banner">
			<i class="fas fa-exclamation-triangle"></i>
			{errorMessage}
			<button onclick={() => (errorMessage = null)} aria-label="Dismiss error">
				<i class="fas fa-times"></i>
			</button>
		</div>
	{/if}

	<div class="content-area">
		{#if viewMode === 'global'}
			<GlobalFlagSettings onError={handleError} />
		{:else}
			<UserFeatureOverrides onError={handleError} />
		{/if}
	</div>
</div>

<style>
	.feature-flag-management {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: var(--background-color, #1a1a2e);
		color: var(--text-color, #ffffff);
		overflow: hidden;
		container-type: inline-size;
		container-name: feature-flags;
	}

	.error-banner {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 24px;
		background: rgba(239, 68, 68, 0.1);
		border-bottom: 1px solid rgba(239, 68, 68, 0.3);
		color: #fca5a5;
		font-size: 14px;
	}

	.error-banner button {
		margin-left: auto;
		background: none;
		border: none;
		color: inherit;
		cursor: pointer;
		padding: 4px;
		opacity: 0.7;
		transition: opacity 0.2s;
	}

	.error-banner button:hover {
		opacity: 1;
	}

	.content-area {
		flex: 1;
		overflow: hidden;
		min-height: 0;
	}
</style>
