<script lang="ts">
	import type { FeatureFlagConfig, FeatureId } from "$lib/shared/auth/domain";
	import { ROLE_DISPLAY } from "$lib/shared/auth/domain";
	import { AdminDetailPanel, AdminActionButton } from "$lib/shared/admin";
	import { getRoleColor, getRoleIcon, getFeatureIconAndColor, type UserData } from './utils';

	interface Props {
		selectedUser: UserData;
		featureFlags: FeatureFlagConfig[];
		editedEnabledFeatures: FeatureId[];
		editedDisabledFeatures: FeatureId[];
		isSaving: boolean;
		onToggleEnabled: (featureId: FeatureId) => void;
		onToggleDisabled: (featureId: FeatureId) => void;
		onSave: () => void;
		onReset: () => void;
		onClose: () => void;
	}

	let {
		selectedUser,
		featureFlags,
		editedEnabledFeatures,
		editedDisabledFeatures,
		isSaving,
		onToggleEnabled,
		onToggleDisabled,
		onSave,
		onReset,
		onClose,
	}: Props = $props();
</script>

<AdminDetailPanel
	title={selectedUser.displayName}
	subtitle={selectedUser.email}
	icon="fa-user-cog"
	{onClose}
>
	{#snippet children()}
		<div class="detail-content">
			<div class="detail-section">
				<h3>User Information</h3>
				<div class="status-info">
					<div class="status-item">
						<span class="status-label">Role:</span>
						<span class="status-value" style="color: {getRoleColor(selectedUser.role)}">
							<i class="fas {getRoleIcon(selectedUser.role)}"></i>
							{ROLE_DISPLAY[selectedUser.role].label}
						</span>
					</div>
					<div class="status-item">
						<span class="status-label">User ID:</span>
						<span class="status-value user-id">
							{selectedUser.id}
						</span>
					</div>
				</div>
			</div>

			<div class="detail-section">
				<h3>Feature Overrides</h3>
				<p class="override-description">
					Enable or disable specific features for this user, overriding their role permissions.
				</p>

				<div class="override-list">
					<div class="override-header">
						<h4>
							<i class="fas fa-check-circle" style="color: #10b981;"></i>
							Explicitly Enabled ({editedEnabledFeatures.length})
						</h4>
						<p>Features this user can access regardless of their role</p>
					</div>
					<div class="feature-checkboxes">
						{#each featureFlags as flag}
							{@const flagStyle = getFeatureIconAndColor(flag.id)}
							<label class="feature-checkbox">
								<input
									type="checkbox"
									checked={editedEnabledFeatures.includes(flag.id)}
									onchange={() => onToggleEnabled(flag.id)}
								/>
								<span class="checkbox-label">
									<i class="fas {flagStyle.icon}" style="color: {flagStyle.color}"></i>
									{flag.name}
								</span>
							</label>
						{/each}
					</div>
				</div>

				<div class="override-list">
					<div class="override-header">
						<h4>
							<i class="fas fa-ban" style="color: #ef4444;"></i>
							Explicitly Disabled ({editedDisabledFeatures.length})
						</h4>
						<p>Features this user cannot access even if their role allows it</p>
					</div>
					<div class="feature-checkboxes">
						{#each featureFlags as flag}
							{@const flagStyle = getFeatureIconAndColor(flag.id)}
							<label class="feature-checkbox">
								<input
									type="checkbox"
									checked={editedDisabledFeatures.includes(flag.id)}
									onchange={() => onToggleDisabled(flag.id)}
								/>
								<span class="checkbox-label">
									<i class="fas {flagStyle.icon}" style="color: {flagStyle.color}"></i>
									{flag.name}
								</span>
							</label>
						{/each}
					</div>
				</div>
			</div>
		</div>
	{/snippet}

	{#snippet actions()}
		<AdminActionButton variant="secondary" onclick={onReset}>Reset</AdminActionButton>
		<AdminActionButton variant="primary" icon="fa-save" loading={isSaving} onclick={onSave}>
			Save Overrides
		</AdminActionButton>
	{/snippet}
</AdminDetailPanel>

<style>
	.detail-content {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.detail-section h3 {
		margin: 0 0 12px 0;
		font-size: 14px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.9);
	}

	.override-description {
		margin-bottom: 16px;
		font-size: 13px;
		color: rgba(255, 255, 255, 0.6);
	}

	.status-info {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.status-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 6px;
	}

	.status-label {
		font-size: 13px;
		color: rgba(255, 255, 255, 0.6);
		font-weight: 500;
	}

	.status-value {
		font-size: 13px;
		color: rgba(255, 255, 255, 0.9);
		font-weight: 500;
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.status-value.user-id {
		font-family: monospace;
		font-size: 11px;
	}

	.override-list {
		margin-top: 20px;
		padding: 16px;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
	}

	.override-header {
		margin-bottom: 16px;
	}

	.override-header h4 {
		margin: 0 0 4px 0;
		font-size: 14px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.9);
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.override-header p {
		margin: 0;
		font-size: 12px;
		color: rgba(255, 255, 255, 0.5);
	}

	.feature-checkboxes {
		display: flex;
		flex-direction: column;
		gap: 8px;
		max-height: 300px;
		overflow-y: auto;
		padding: 4px;
	}

	.feature-checkbox {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 12px;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 6px;
		cursor: pointer;
		transition: background 0.2s;
	}

	.feature-checkbox:hover {
		background: rgba(255, 255, 255, 0.06);
	}

	.feature-checkbox input[type='checkbox'] {
		cursor: pointer;
		width: 16px;
		height: 16px;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 13px;
		color: rgba(255, 255, 255, 0.8);
		flex: 1;
	}

	.checkbox-label i {
		font-size: 12px;
	}
</style>
