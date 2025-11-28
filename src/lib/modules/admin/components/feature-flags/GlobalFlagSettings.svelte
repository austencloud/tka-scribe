<script lang="ts">
	/**
	 * GlobalFlagSettings
	 * Self-contained component for managing global feature flag settings
	 */

	import { onMount } from 'svelte';
	import { featureFlagService } from '$shared/auth/services';
	import type { FeatureFlagConfig, UserRole } from "$shared/auth/domain";
	import { AdminTwoPanelLayout, AdminModal } from "$shared/admin";
	import GlobalFlagList from './GlobalFlagList.svelte';
	import GlobalFlagDetail from './GlobalFlagDetail.svelte';
	import { buildHierarchicalFlags } from './utils';

	interface Props {
		onError: (message: string) => void;
	}

	let { onError }: Props = $props();

	// State
	let featureFlags = $state<FeatureFlagConfig[]>([]);
	let searchQuery = $state('');
	let debouncedSearchQuery = $state('');
	let categoryFilter = $state<'all' | 'module' | 'tab' | 'capability'>('all');
	let selectedFlag = $state<FeatureFlagConfig | null>(null);
	let expandedModules = $state<Set<string>>(new Set());
	let isLoading = $state(true);
	let isSaving = $state(false);

	// Edit state
	let editedMinimumRole = $state<UserRole>('user');
	let editedEnabled = $state(true);

	// Modal state
	let confirmModal = $state<{
		show: boolean;
		title: string;
		message: string;
		onConfirm: () => Promise<void>;
	} | null>(null);

	// Derived
	const hierarchicalFlags = $derived(
		buildHierarchicalFlags(featureFlags, categoryFilter, debouncedSearchQuery)
	);

	// Debounce - must read searchQuery synchronously for effect to track it
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;
	$effect(() => {
		const query = searchQuery; // Read synchronously so effect tracks this dependency
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			debouncedSearchQuery = query;
		}, 300);
		return () => {
			if (debounceTimer) clearTimeout(debounceTimer);
		};
	});

	function loadFeatureFlags() {
		isLoading = true;
		try {
			featureFlags = featureFlagService.featureConfigs;
		} catch (error) {
			console.error('Failed to load feature flags:', error);
			onError('Failed to load feature flags. Please refresh.');
		} finally {
			isLoading = false;
		}
	}

	function selectFlag(flag: FeatureFlagConfig) {
		selectedFlag = flag;
		editedMinimumRole = flag.minimumRole;
		editedEnabled = flag.enabled;
	}

	function toggleModule(moduleId: string) {
		const newExpanded = new Set(expandedModules);
		if (newExpanded.has(moduleId)) {
			newExpanded.delete(moduleId);
		} else {
			newExpanded.add(moduleId);
		}
		expandedModules = newExpanded;
	}

	async function saveChanges() {
		if (!selectedFlag) return;

		const hasChanges =
			editedMinimumRole !== selectedFlag.minimumRole || editedEnabled !== selectedFlag.enabled;

		if (!hasChanges) return;

		confirmModal = {
			show: true,
			title: 'Update Feature Flag',
			message: `Are you sure you want to update "${selectedFlag.name}"? This will affect all users.`,
			onConfirm: async () => {
				isSaving = true;

				try {
					const flagToUpdate = selectedFlag;
					if (!flagToUpdate) return;

					await featureFlagService.updateGlobalFeatureFlag(flagToUpdate.id, {
						minimumRole: editedMinimumRole,
						enabled: editedEnabled,
					});

					featureFlags = featureFlags.map((f) =>
						f.id === flagToUpdate.id
							? { ...f, minimumRole: editedMinimumRole, enabled: editedEnabled }
							: f
					);

					if (selectedFlag) {
						selectedFlag = { ...selectedFlag, minimumRole: editedMinimumRole, enabled: editedEnabled };
					}
				} catch (error) {
					console.error('Failed to update feature flag:', error);
					onError('Failed to update feature flag. Please try again.');
				} finally {
					isSaving = false;
					confirmModal = null;
				}
			},
		};
	}

	onMount(() => {
		loadFeatureFlags();
	});
</script>

<AdminTwoPanelLayout hasSelection={selectedFlag !== null} onClose={() => (selectedFlag = null)}>
	{#snippet list()}
		<GlobalFlagList
			{hierarchicalFlags}
			{selectedFlag}
			{expandedModules}
			{isLoading}
			{searchQuery}
			{categoryFilter}
			onSearchChange={(v) => (searchQuery = v)}
			onCategoryChange={(c) => (categoryFilter = c)}
			onSelectFlag={selectFlag}
			onToggleModule={toggleModule}
		/>
	{/snippet}

	{#snippet detail()}
		{#if selectedFlag}
			<GlobalFlagDetail
				{selectedFlag}
				{editedMinimumRole}
				{editedEnabled}
				{isSaving}
				onRoleChange={(r) => (editedMinimumRole = r)}
				onEnabledChange={(e) => (editedEnabled = e)}
				onSave={saveChanges}
				onReset={() => {
					editedMinimumRole = selectedFlag!.minimumRole;
					editedEnabled = selectedFlag!.enabled;
				}}
				onClose={() => (selectedFlag = null)}
			/>
		{/if}
	{/snippet}
</AdminTwoPanelLayout>

{#if confirmModal?.show}
	<AdminModal
		title={confirmModal.title}
		message={confirmModal.message}
		variant="warning"
		confirmLabel="Update"
		cancelLabel="Cancel"
		onConfirm={confirmModal.onConfirm}
		onCancel={() => (confirmModal = null)}
		loading={isSaving}
	/>
{/if}
