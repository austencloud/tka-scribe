<script lang="ts">
	/**
	 * UserFeatureOverrides
	 * Self-contained component for managing per-user feature overrides
	 */

	import { collection, query, getDocs, limit } from 'firebase/firestore';
	import { getFirestoreInstance } from '../../../../shared/auth/firebase';
	import { featureFlagService } from '../../../../shared/auth/services/FeatureFlagService.svelte';
	import type { FeatureFlagConfig, FeatureId } from "$lib/shared/auth/domain/models/FeatureFlag";
	import type { UserRole } from "$lib/shared/auth/domain/models/UserRole";
	import AdminTwoPanelLayout from "$lib/shared/admin/components/AdminTwoPanelLayout.svelte";
	import AdminModal from "$lib/shared/admin/components/AdminModal.svelte";
	import UserOverridesList from './UserOverridesList.svelte';
	import UserOverridesDetail from './UserOverridesDetail.svelte';
	import type { UserData } from './utils';

	interface Props {
		onError: (message: string) => void;
	}

	let { onError }: Props = $props();

	// State
	let featureFlags = $state<FeatureFlagConfig[]>([]);
	let userSearchQuery = $state('');
	let searchedUsers = $state<UserData[]>([]);
	let selectedUser = $state<UserData | null>(null);
	let isSearchingUsers = $state(false);
	let isSaving = $state(false);

	// Edit state
	let editedEnabledFeatures = $state<FeatureId[]>([]);
	let editedDisabledFeatures = $state<FeatureId[]>([]);

	// Modal state
	let confirmModal = $state<{
		show: boolean;
		title: string;
		message: string;
		onConfirm: () => Promise<void>;
	} | null>(null);

	// Load feature flags on init
	$effect(() => {
		featureFlags = featureFlagService.featureConfigs;
	});

	async function searchUsers() {
		if (!userSearchQuery.trim()) {
			searchedUsers = [];
			return;
		}

		isSearchingUsers = true;

		try {
			const firestore = await getFirestoreInstance();
			const searchTerm = userSearchQuery.toLowerCase();
			const usersRef = collection(firestore, 'users');
			const q = query(usersRef, limit(200));
			const snapshot = await getDocs(q);

			const allUsers = snapshot.docs.map((doc) => {
				const data = doc.data();
				return {
					id: doc.id,
					email: data['email'] || '',
					displayName: data['displayName'] || 'Unknown User',
					username: data['username'] || '',
					photoURL: data['photoURL'] || null,
					role: (data['role'] as UserRole) || 'user',
					featureOverrides: data['featureOverrides'],
				};
			});

			searchedUsers = allUsers
				.filter((user) => {
					const emailMatch = user.email.toLowerCase().includes(searchTerm);
					const nameMatch = user.displayName.toLowerCase().includes(searchTerm);
					const usernameMatch = user.username.toLowerCase().includes(searchTerm);
					return emailMatch || nameMatch || usernameMatch;
				})
				.sort((a, b) => {
					const aEmailExact = a.email.toLowerCase() === searchTerm;
					const bEmailExact = b.email.toLowerCase() === searchTerm;
					if (aEmailExact && !bEmailExact) return -1;
					if (!aEmailExact && bEmailExact) return 1;

					const aEmailMatch = a.email.toLowerCase().includes(searchTerm);
					const bEmailMatch = b.email.toLowerCase().includes(searchTerm);
					if (aEmailMatch && !bEmailMatch) return -1;
					if (!aEmailMatch && bEmailMatch) return 1;

					return a.displayName.localeCompare(b.displayName);
				})
				.slice(0, 20);
		} catch (error) {
			console.error('Failed to search users:', error);
			onError('Failed to search users. Please try again.');
		} finally {
			isSearchingUsers = false;
		}
	}

	function selectUser(user: UserData) {
		selectedUser = user;
		editedEnabledFeatures = user.featureOverrides?.enabledFeatures || [];
		editedDisabledFeatures = user.featureOverrides?.disabledFeatures || [];
	}

	function toggleEnabledFeature(featureId: FeatureId) {
		if (editedEnabledFeatures.includes(featureId)) {
			editedEnabledFeatures = editedEnabledFeatures.filter((f) => f !== featureId);
		} else {
			editedEnabledFeatures = [...editedEnabledFeatures, featureId];
			editedDisabledFeatures = editedDisabledFeatures.filter((f) => f !== featureId);
		}
	}

	function toggleDisabledFeature(featureId: FeatureId) {
		if (editedDisabledFeatures.includes(featureId)) {
			editedDisabledFeatures = editedDisabledFeatures.filter((f) => f !== featureId);
		} else {
			editedDisabledFeatures = [...editedDisabledFeatures, featureId];
			editedEnabledFeatures = editedEnabledFeatures.filter((f) => f !== featureId);
		}
	}

	async function saveUserOverrides() {
		if (!selectedUser) return;

		const hasChanges =
			JSON.stringify(editedEnabledFeatures.sort()) !==
				JSON.stringify((selectedUser.featureOverrides?.enabledFeatures || []).sort()) ||
			JSON.stringify(editedDisabledFeatures.sort()) !==
				JSON.stringify((selectedUser.featureOverrides?.disabledFeatures || []).sort());

		if (!hasChanges) return;

		confirmModal = {
			show: true,
			title: 'Update User Overrides',
			message: `Are you sure you want to update feature overrides for ${selectedUser.displayName}?`,
			onConfirm: async () => {
				isSaving = true;

				try {
					await featureFlagService.setUserFeatureOverrides(selectedUser!.id, {
						enabledFeatures: editedEnabledFeatures,
						disabledFeatures: editedDisabledFeatures,
					});

					searchedUsers = searchedUsers.map((u) =>
						u.id === selectedUser!.id
							? {
									...u,
									featureOverrides: {
										enabledFeatures: editedEnabledFeatures,
										disabledFeatures: editedDisabledFeatures,
									},
								}
							: u
					);

					if (selectedUser) {
						selectedUser = {
							...selectedUser,
							featureOverrides: {
								enabledFeatures: editedEnabledFeatures,
								disabledFeatures: editedDisabledFeatures,
							},
						};
					}
				} catch (error) {
					console.error('Failed to update user overrides:', error);
					onError('Failed to update user overrides. Please try again.');
				} finally {
					isSaving = false;
					confirmModal = null;
				}
			},
		};
	}
</script>

<AdminTwoPanelLayout hasSelection={selectedUser !== null} onClose={() => (selectedUser = null)}>
	{#snippet list()}
		<UserOverridesList
			searchQuery={userSearchQuery}
			{searchedUsers}
			{selectedUser}
			isSearching={isSearchingUsers}
			onSearchChange={(v) => (userSearchQuery = v)}
			onSearch={searchUsers}
			onClearSearch={() => {
				userSearchQuery = '';
				searchedUsers = [];
			}}
			onSelectUser={selectUser}
		/>
	{/snippet}

	{#snippet detail()}
		{#if selectedUser}
			<UserOverridesDetail
				{selectedUser}
				{featureFlags}
				{editedEnabledFeatures}
				{editedDisabledFeatures}
				{isSaving}
				onToggleEnabled={toggleEnabledFeature}
				onToggleDisabled={toggleDisabledFeature}
				onSave={saveUserOverrides}
				onReset={() => {
					editedEnabledFeatures = selectedUser?.featureOverrides?.enabledFeatures || [];
					editedDisabledFeatures = selectedUser?.featureOverrides?.disabledFeatures || [];
				}}
				onClose={() => (selectedUser = null)}
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
