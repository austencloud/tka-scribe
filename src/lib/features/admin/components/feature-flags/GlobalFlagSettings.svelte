<script lang="ts">
	/**
	 * GlobalFlagSettings
	 * Self-contained component for managing global feature flag settings
	 */

	import { onMount } from 'svelte';
	import { featureFlagService } from '../../../../shared/auth/services/FeatureFlagService.svelte';
	import type { FeatureFlagConfig } from "$lib/shared/auth/domain/models/FeatureFlag";
	import type { UserRole } from "$lib/shared/auth/domain/models/UserRole";
	import AdminTwoPanelLayout from "$lib/shared/admin/components/AdminTwoPanelLayout.svelte";
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

		isSaving = true;

		try {
			await featureFlagService.updateGlobalFeatureFlag(selectedFlag.id, {
				minimumRole: editedMinimumRole,
				enabled: editedEnabled,
			});

			featureFlags = featureFlags.map((f) =>
				f.id === selectedFlag!.id
					? { ...f, minimumRole: editedMinimumRole, enabled: editedEnabled }
					: f
			);

			selectedFlag = null;
		} catch (error) {
			console.error('Failed to update feature flag:', error);
			onError('Failed to update feature flag. Please try again.');
		} finally {
			isSaving = false;
		}
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

