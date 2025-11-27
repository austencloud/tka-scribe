<script lang="ts">
	/**
	 * Feature Flag Management
	 * Admin interface for managing feature flags and access control
	 *
	 * Features:
	 * - Manage global feature flag settings (minimumRole, enabled)
	 * - View feature flags by category (module/tab/capability)
	 * - Search and filter feature flags
	 * - Manage per-user feature overrides
	 * - View statistics and usage
	 */

	import { onMount } from 'svelte';
	import { collection, query, getDocs, doc, getDoc, where, limit } from 'firebase/firestore';
	import { firestore } from '$shared/auth/firebase';
	import { featureFlagService } from '$shared/auth/services';
	import {
		type FeatureFlagConfig,
		type FeatureId,
		type UserRole,
		type UserFeatureOverrides,
		ROLE_HIERARCHY,
		ROLE_DISPLAY,
	} from '$shared/auth/domain';
	import {
		AdminTwoPanelLayout,
		AdminDetailPanel,
		AdminSearchBox,
		AdminFilterGroup,
		AdminListItem,
		AdminFormField,
		AdminStatCard,
		AdminEmptyState,
		AdminModal,
		AdminActionButton,
		type FilterOption,
	} from '$shared/admin';
	import {
		MODULE_DEFINITIONS,
		CREATE_TABS,
		LEARN_TABS,
		EXPLORE_TABS,
		COMMUNITY_TABS,
		COLLECT_TABS,
		ANIMATE_TABS,
		EDIT_TABS,
		ABOUT_TABS,
		ADMIN_TABS,
	} from '$shared/navigation/state/navigation-state.svelte';

	// Types
	interface UserData {
		id: string;
		email: string;
		displayName: string;
		username: string;
		photoURL: string | null;
		role: UserRole;
		featureOverrides?: UserFeatureOverrides;
	}

	// View mode
	let viewMode = $state<'global' | 'users'>('global');

	// Global settings state
	let featureFlags = $state<FeatureFlagConfig[]>([]);
	let searchQuery = $state('');
	let debouncedSearchQuery = $state(''); // Debounced version for filtering
	let categoryFilter = $state<'all' | 'module' | 'tab' | 'capability'>('all');
	let selectedFlag = $state<FeatureFlagConfig | null>(null);
	let isLoading = $state(true);
	let isSaving = $state(false);
	let errorMessage = $state<string | null>(null);
	let confirmModal = $state<{
		show: boolean;
		title: string;
		message: string;
		onConfirm: () => Promise<void>;
	} | null>(null);

	// Form state for editing global flags
	let editedMinimumRole = $state<UserRole>('user');
	let editedEnabled = $state(true);

	// User overrides state
	let userSearchQuery = $state('');
	let searchedUsers = $state<UserData[]>([]);
	let selectedUser = $state<UserData | null>(null);
	let isSearchingUsers = $state(false);
	let editedEnabledFeatures = $state<FeatureId[]>([]);
	let editedDisabledFeatures = $state<FeatureId[]>([]);

	// Category filter options
	const categoryFilterOptions: FilterOption[] = [
		{ id: 'all', label: 'All', icon: 'fa-list' },
		{ id: 'module', label: 'Modules', icon: 'fa-cubes' },
		{ id: 'tab', label: 'Tabs', icon: 'fa-window-restore' },
		{ id: 'capability', label: 'Capabilities', icon: 'fa-magic' },
	];

	// State for module expansion
	let expandedModules = $state<Set<string>>(new Set());

	// Computed: hierarchical feature flags (modules with their tabs)
	const hierarchicalFlags = $derived.by(() => {
		// Separate flags by type
		const modules: FeatureFlagConfig[] = [];
		const tabsByModule: Map<string, FeatureFlagConfig[]> = new Map();
		const capabilities: FeatureFlagConfig[] = [];

		for (const flag of featureFlags) {
			if (flag.category === 'module') {
				modules.push(flag);
				// Initialize tab array for this module
				const moduleId = flag.id.split(':')[1] ?? ''; // "module:create" -> "create"
				tabsByModule.set(moduleId, []);
			} else if (flag.category === 'capability') {
				capabilities.push(flag);
			}
			// Tabs are handled in the next loop
		}

		// Group tabs under their parent modules
		for (const flag of featureFlags) {
			if (flag.category === 'tab') {
				const parts = flag.id.split(':'); // "tab:create:assembler" -> ["tab", "create", "assembler"]
				const moduleId = parts[1] ?? ''; // "create"
				const tabs = tabsByModule.get(moduleId);
				if (tabs) {
					tabs.push(flag);
				}
			}
		}

		// Apply filters
		let filteredModules = modules;
		let filteredCapabilities = capabilities;

		// Apply category filter
		if (categoryFilter === 'module') {
			filteredCapabilities = [];
		} else if (categoryFilter === 'tab') {
			filteredModules = modules.filter((m) => {
				const moduleId = m.id.split(':')[1] ?? '';
				const tabs = tabsByModule.get(moduleId) || [];
				return tabs.length > 0;
			});
		} else if (categoryFilter === 'capability') {
			filteredModules = [];
		}

		// Apply search (using debounced query for performance)
		if (debouncedSearchQuery.trim()) {
			const query = debouncedSearchQuery.toLowerCase();

			filteredModules = filteredModules.filter((module) => {
				const moduleMatches =
					module.name.toLowerCase().includes(query) ||
					module.description.toLowerCase().includes(query) ||
					module.id.toLowerCase().includes(query);

				const moduleId = module.id.split(':')[1] ?? '';
				const tabs = tabsByModule.get(moduleId) || [];
				const anyTabMatches = tabs.some((tab) =>
					tab.name.toLowerCase().includes(query) ||
					tab.description.toLowerCase().includes(query) ||
					tab.id.toLowerCase().includes(query)
				);

				return moduleMatches || anyTabMatches;
			});

			filteredCapabilities = filteredCapabilities.filter(
				(flag) =>
					flag.name.toLowerCase().includes(query) ||
					flag.description.toLowerCase().includes(query) ||
					flag.id.toLowerCase().includes(query)
			);

			// Filter tabs within modules - create NEW map instead of mutating
			const filteredTabsByModule = new Map<string, FeatureFlagConfig[]>();
			for (const [moduleId, tabs] of tabsByModule.entries()) {
				const filtered = tabs.filter(
					(tab) =>
						tab.name.toLowerCase().includes(query) ||
						tab.description.toLowerCase().includes(query) ||
						tab.id.toLowerCase().includes(query)
				);
				filteredTabsByModule.set(moduleId, filtered);
			}
			return {
				modules: filteredModules,
				tabsByModule: filteredTabsByModule,
				capabilities: filteredCapabilities,
			};
		}

		return {
			modules: filteredModules,
			tabsByModule,
			capabilities: filteredCapabilities,
		};
	});

	// Toggle module expansion
	function toggleModule(moduleId: string) {
		const newExpanded = new Set(expandedModules);
		if (newExpanded.has(moduleId)) {
			newExpanded.delete(moduleId);
		} else {
			newExpanded.add(moduleId);
		}
		expandedModules = newExpanded;
	}

	// Check if module is expanded
	function isModuleExpanded(moduleId: string): boolean {
		return expandedModules.has(moduleId);
	}

	// Computed: statistics
	const stats = $derived.by(() => {
		const total = featureFlags.length;
		const enabled = featureFlags.filter((f) => f.enabled).length;
		const disabled = total - enabled;

		const byRole = {
			user: featureFlags.filter((f) => f.minimumRole === 'user').length,
			premium: featureFlags.filter((f) => f.minimumRole === 'premium').length,
			tester: featureFlags.filter((f) => f.minimumRole === 'tester').length,
			admin: featureFlags.filter((f) => f.minimumRole === 'admin').length,
		};

		const byCategory = {
			module: featureFlags.filter((f) => f.category === 'module').length,
			tab: featureFlags.filter((f) => f.category === 'tab').length,
			capability: featureFlags.filter((f) => f.category === 'capability').length,
		};

		return { total, enabled, disabled, byRole, byCategory };
	});

	// Load feature flags
	function loadFeatureFlags() {
		isLoading = true;
		try {
			featureFlags = featureFlagService.featureConfigs;
		} catch (error) {
			console.error('Failed to load feature flags:', error);
			errorMessage = 'Failed to load feature flags. Please refresh.';
		} finally {
			isLoading = false;
		}
	}

	// Select a flag for editing
	function selectFlag(flag: FeatureFlagConfig) {
		selectedFlag = flag;
		editedMinimumRole = flag.minimumRole;
		editedEnabled = flag.enabled;
	}

	// Save changes to a feature flag
	async function saveChanges() {
		if (!selectedFlag) return;

		// Check if anything changed
		const hasChanges =
			editedMinimumRole !== selectedFlag.minimumRole || editedEnabled !== selectedFlag.enabled;

		if (!hasChanges) {
			return;
		}

		confirmModal = {
			show: true,
			title: 'Update Feature Flag',
			message: `Are you sure you want to update "${selectedFlag.name}"? This will affect all users.`,
			onConfirm: async () => {
				isSaving = true;
				errorMessage = null;

				try {
					const flagToUpdate = selectedFlag;
					if (!flagToUpdate) return;

					await featureFlagService.updateGlobalFeatureFlag(flagToUpdate.id, {
						minimumRole: editedMinimumRole,
						enabled: editedEnabled,
					});

					// Update local state
					featureFlags = featureFlags.map((f) =>
						f.id === flagToUpdate.id
							? { ...f, minimumRole: editedMinimumRole, enabled: editedEnabled }
							: f
					);

					// Update selected flag
					if (selectedFlag) {
						selectedFlag = { ...selectedFlag, minimumRole: editedMinimumRole, enabled: editedEnabled };
					}
				} catch (error) {
					console.error('Failed to update feature flag:', error);
					errorMessage = 'Failed to update feature flag. Please try again.';
				} finally {
					isSaving = false;
					confirmModal = null;
				}
			},
		};
	}

	// Search for users by email, name, or username
	async function searchUsers() {
		if (!userSearchQuery.trim()) {
			searchedUsers = [];
			return;
		}

		isSearchingUsers = true;
		errorMessage = null;

		try {
			const searchTerm = userSearchQuery.toLowerCase();
			const usersRef = collection(firestore, 'users');

			// Fetch users and filter locally (supports search by email, name, or username)
			// Note: Firestore doesn't support OR queries or full-text search,
			// so we fetch a reasonable batch and filter client-side
			const q = query(usersRef, limit(200));
			const snapshot = await getDocs(q);

			console.log(`🔍 User Search Debug:`);
			console.log(`  Search term: "${searchTerm}"`);
			console.log(`  Total users fetched: ${snapshot.docs.length}`);

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

			console.log(`  Sample users:`, allUsers.slice(0, 5).map(u => ({
				name: u.displayName,
				email: u.email,
				username: u.username
			})));

			searchedUsers = allUsers
				.filter((user) => {
					// Search across email, display name, and username
					const emailMatch = user.email.toLowerCase().includes(searchTerm);
					const nameMatch = user.displayName.toLowerCase().includes(searchTerm);
					const usernameMatch = user.username.toLowerCase().includes(searchTerm);
					return emailMatch || nameMatch || usernameMatch;
				})
				.sort((a, b) => {
					// Prioritize exact matches, then email matches, then name matches
					const aEmailExact = a.email.toLowerCase() === searchTerm;
					const bEmailExact = b.email.toLowerCase() === searchTerm;
					if (aEmailExact && !bEmailExact) return -1;
					if (!aEmailExact && bEmailExact) return 1;

					const aEmailMatch = a.email.toLowerCase().includes(searchTerm);
					const bEmailMatch = b.email.toLowerCase().includes(searchTerm);
					if (aEmailMatch && !bEmailMatch) return -1;
					if (!aEmailMatch && bEmailMatch) return 1;

					// Otherwise alphabetically by name
					return a.displayName.localeCompare(b.displayName);
				})
				.slice(0, 20); // Return top 20 results

			console.log(`  Matching users: ${searchedUsers.length}`);
			console.log(`  Results:`, searchedUsers.map(u => u.displayName));
		} catch (error) {
			console.error('❌ Failed to search users:', error);
			errorMessage = 'Failed to search users. Please try again.';
		} finally {
			isSearchingUsers = false;
		}
	}

	// Select a user for editing overrides
	function selectUser(user: UserData) {
		selectedUser = user;
		editedEnabledFeatures = user.featureOverrides?.enabledFeatures || [];
		editedDisabledFeatures = user.featureOverrides?.disabledFeatures || [];
	}

	// Toggle a feature in the enabled list
	function toggleEnabledFeature(featureId: FeatureId) {
		if (editedEnabledFeatures.includes(featureId)) {
			editedEnabledFeatures = editedEnabledFeatures.filter((f) => f !== featureId);
		} else {
			editedEnabledFeatures = [...editedEnabledFeatures, featureId];
			// Remove from disabled if it's there
			editedDisabledFeatures = editedDisabledFeatures.filter((f) => f !== featureId);
		}
	}

	// Toggle a feature in the disabled list
	function toggleDisabledFeature(featureId: FeatureId) {
		if (editedDisabledFeatures.includes(featureId)) {
			editedDisabledFeatures = editedDisabledFeatures.filter((f) => f !== featureId);
		} else {
			editedDisabledFeatures = [...editedDisabledFeatures, featureId];
			// Remove from enabled if it's there
			editedEnabledFeatures = editedEnabledFeatures.filter((f) => f !== featureId);
		}
	}

	// Save user overrides
	async function saveUserOverrides() {
		if (!selectedUser) return;

		const hasChanges =
			JSON.stringify(editedEnabledFeatures.sort()) !==
				JSON.stringify((selectedUser.featureOverrides?.enabledFeatures || []).sort()) ||
			JSON.stringify(editedDisabledFeatures.sort()) !==
				JSON.stringify((selectedUser.featureOverrides?.disabledFeatures || []).sort());

		if (!hasChanges) {
			return;
		}

		confirmModal = {
			show: true,
			title: 'Update User Overrides',
			message: `Are you sure you want to update feature overrides for ${selectedUser.displayName}?`,
			onConfirm: async () => {
				isSaving = true;
				errorMessage = null;

				try {
					await featureFlagService.setUserFeatureOverrides(selectedUser!.id, {
						enabledFeatures: editedEnabledFeatures,
						disabledFeatures: editedDisabledFeatures,
					});

					// Update local state
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
					errorMessage = 'Failed to update user overrides. Please try again.';
				} finally {
					isSaving = false;
					confirmModal = null;
				}
			},
		};
	}

	// Get role badge color
	function getRoleColor(role: UserRole): string {
		return ROLE_DISPLAY[role].color;
	}

	// Get role icon
	function getRoleIcon(role: UserRole): string {
		return ROLE_DISPLAY[role].icon;
	}

	// Map of all tabs for quick lookup
	const ALL_TABS = [
		...CREATE_TABS,
		...LEARN_TABS,
		...EXPLORE_TABS,
		...COMMUNITY_TABS,
		...COLLECT_TABS,
		...ANIMATE_TABS,
		...EDIT_TABS,
		...ABOUT_TABS,
		...ADMIN_TABS,
	];

	// Get icon and color from feature ID
	function getFeatureIconAndColor(featureId: FeatureId): { icon: string; color: string } {
		// Parse feature ID (e.g., "module:create", "tab:create:assembler", "capability:export:video")
		const parts = featureId.split(':');
		const type = parts[0]; // "module", "tab", or "capability"

		if (type === 'module') {
			const moduleId = parts[1] ?? ''; // "create", "explore", etc.
			const module = MODULE_DEFINITIONS.find((m) => m.id === moduleId);
			if (module) {
				// Extract icon class from HTML string (e.g., '<i class="fas fa-tools" ...></i>')
				const iconMatch = module.icon.match(/class="([^"]+)"/);
				const iconClasses = iconMatch?.[1] ?? 'fas fa-cubes';
				// Extract just the icon class (e.g., "fa-tools")
				const iconClass = iconClasses.split(' ').pop() ?? 'fa-cubes';

				// Extract color from style attribute
				const colorMatch = module.icon.match(/color:\s*([^;"]+)/);
				const color = colorMatch?.[1]?.trim() ?? '#8b5cf6';

				return { icon: iconClass, color };
			}
		} else if (type === 'tab') {
			const tabId = parts[2] ?? ''; // "assembler", "constructor", etc.
			const tab = ALL_TABS.find((t) => t.id === tabId);
			if (tab) {
				// Extract icon class from HTML string
				const iconMatch = tab.icon.match(/class="([^"]+)"/);
				const iconClasses = iconMatch?.[1] ?? 'fas fa-window-restore';
				const iconClass = iconClasses.split(' ').pop() ?? 'fa-window-restore';

				return { icon: iconClass, color: tab.color ?? '#6b7280' };
			}
		}

		// Fallback for capabilities or unknown features
		return {
			icon: type === 'capability' ? 'fa-magic' : 'fa-flag',
			color: type === 'capability' ? '#f59e0b' : '#6b7280',
		};
	}

	// Debounce search query (300ms delay)
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;
	$effect(() => {
		// Clear previous timer
		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}

		// Set new timer
		debounceTimer = setTimeout(() => {
			debouncedSearchQuery = searchQuery;
		}, 300);

		// Cleanup
		return () => {
			if (debounceTimer) {
				clearTimeout(debounceTimer);
			}
		};
	});

	onMount(() => {
		loadFeatureFlags();
	});
</script>

<div class="feature-flag-management">
	<!-- Header with stats -->
	<header class="management-header">
		<div class="header-top">
			<div class="header-content">
				<h2>Feature Flag Management</h2>
				<p class="header-description">Control feature access and permissions across the platform</p>
			</div>

			<!-- View mode toggle -->
			<div class="view-toggle">
				<button
					class="toggle-btn"
					class:active={viewMode === 'global'}
					onclick={() => {
						viewMode = 'global';
						selectedFlag = null;
						selectedUser = null;
					}}
				>
					<i class="fas fa-globe"></i>
					Global Settings
				</button>
				<button
					class="toggle-btn"
					class:active={viewMode === 'users'}
					onclick={() => {
						viewMode = 'users';
						selectedFlag = null;
						selectedUser = null;
					}}
				>
					<i class="fas fa-user-cog"></i>
					User Overrides
				</button>
			</div>
		</div>

		<div class="stats-grid">
			<AdminStatCard
				label="Total Features"
				value={stats.total}
				icon="fa-flag"
				color="#3b82f6"
			/>
			<AdminStatCard
				label="Disabled"
				value={stats.disabled}
				icon="fa-ban"
				color="#ef4444"
			/>
		</div>
	</header>

	{#if errorMessage}
		<div class="error-banner">
			<i class="fas fa-exclamation-triangle"></i>
			{errorMessage}
			<button onclick={() => (errorMessage = null)} aria-label="Dismiss error">
				<i class="fas fa-times"></i>
			</button>
		</div>
	{/if}

	<!-- Main content -->
	<div class="content-area">
		{#if viewMode === 'global'}
			<!-- Global feature flag settings -->
			<AdminTwoPanelLayout hasSelection={selectedFlag !== null} onClose={() => (selectedFlag = null)}>
			{#snippet list()}
				<div class="list-section">
					<!-- Search and filters -->
					<div class="list-controls">
						<AdminSearchBox bind:value={searchQuery} placeholder="Search feature flags..." />
						<AdminFilterGroup
							options={categoryFilterOptions}
							selected={categoryFilter}
							onChange={(id) => (categoryFilter = id as typeof categoryFilter)}
						/>
					</div>

					<!-- Feature flag list (hierarchical) -->
					<div class="flag-list">
						{#if isLoading}
							<div class="loading-state">
								<i class="fas fa-spinner fa-spin"></i>
								<p>Loading feature flags...</p>
							</div>
						{:else if hierarchicalFlags.modules.length === 0 && hierarchicalFlags.capabilities.length === 0}
							<AdminEmptyState
								icon="fa-flag"
								title="No feature flags found"
								message={searchQuery.trim()
									? 'Try adjusting your search or filters'
									: 'No feature flags available'}
							/>
						{:else}
							<!-- Modules with their tabs -->
							{#each hierarchicalFlags.modules as module}
								{@const moduleId = module.id.split(':')[1] ?? ''}
								{@const tabs = hierarchicalFlags.tabsByModule.get(moduleId) || []}
								{@const moduleStyle = getFeatureIconAndColor(module.id)}
								{@const expanded = isModuleExpanded(moduleId)}

								<!-- Module -->
								<div class="module-group">
									<div
										class="module-header"
										class:expanded
										class:selected={selectedFlag?.id === module.id}
									>
										<button
											class="expand-icon"
											onclick={(e) => {
												e.stopPropagation();
												toggleModule(moduleId);
											}}
											aria-label={expanded ? `Collapse ${module.name} tabs` : `Expand ${module.name} tabs`}
											aria-expanded={expanded}
										>
											<i class="fas fa-chevron-{expanded ? 'down' : 'right'}"></i>
										</button>
										<button
											class="module-content"
											onclick={() => selectFlag(module)}
											aria-label={`Edit ${module.name} settings`}
										>
											<div class="flag-icon" style="color: {moduleStyle.color}">
												<i class="fas {moduleStyle.icon}"></i>
											</div>
											<div class="flag-info">
												<h4>{module.name}</h4>
											</div>
											<div class="flag-badges">
												<span
													class="role-badge"
													style="background: {getRoleColor(module.minimumRole)}20; color: {getRoleColor(
														module.minimumRole
													)}"
												>
													<i class="fas {getRoleIcon(module.minimumRole)}"></i>
													{module.minimumRole}
												</span>
												{#if !module.enabled}
													<span class="disabled-badge">
														<i class="fas fa-ban"></i>
														Disabled
													</span>
												{/if}
											</div>
										</button>
									</div>

									<!-- Tabs (shown when expanded) -->
									{#if expanded}
										<div class="tabs-list">
											{#each tabs as tab}
												{@const tabStyle = getFeatureIconAndColor(tab.id)}
												<AdminListItem
													selected={selectedFlag?.id === tab.id}
													onClick={() => selectFlag(tab)}
													class="tab-item"
												>
													{#snippet icon()}
														<div class="flag-icon" style="color: {tabStyle.color}">
															<i class="fas {tabStyle.icon}"></i>
														</div>
													{/snippet}

													{#snippet children()}
														<div class="flag-info">
															<h4>{tab.name}</h4>
														</div>
													{/snippet}

													{#snippet meta()}
														<div class="flag-badges">
															<span
																class="role-badge"
																style="background: {getRoleColor(tab.minimumRole)}20; color: {getRoleColor(
																	tab.minimumRole
																)}"
															>
																<i class="fas {getRoleIcon(tab.minimumRole)}"></i>
																{tab.minimumRole}
															</span>
															{#if !tab.enabled}
																<span class="disabled-badge">
																	<i class="fas fa-ban"></i>
																	Disabled
																</span>
															{/if}
														</div>
													{/snippet}
												</AdminListItem>
											{/each}
										</div>
									{/if}
								</div>
							{/each}

							<!-- Capabilities (standalone) -->
							{#if hierarchicalFlags.capabilities.length > 0}
								<div class="capabilities-section">
									<div class="section-header">
										<i class="fas fa-magic"></i>
										<span>Capabilities</span>
									</div>
									<div class="capabilities-grid">
										{#each hierarchicalFlags.capabilities as capability}
											{@const capabilityStyle = getFeatureIconAndColor(capability.id)}
											<AdminListItem
												selected={selectedFlag?.id === capability.id}
												onClick={() => selectFlag(capability)}
											>
												{#snippet icon()}
													<div class="flag-icon" style="color: {capabilityStyle.color}">
														<i class="fas {capabilityStyle.icon}"></i>
													</div>
												{/snippet}

												{#snippet children()}
													<div class="flag-info">
														<h4>{capability.name}</h4>
													</div>
												{/snippet}

												{#snippet meta()}
													<div class="flag-badges">
														<span
															class="role-badge"
															style="background: {getRoleColor(capability.minimumRole)}20; color: {getRoleColor(
																capability.minimumRole
															)}"
														>
															<i class="fas {getRoleIcon(capability.minimumRole)}"></i>
															{capability.minimumRole}
														</span>
														{#if !capability.enabled}
															<span class="disabled-badge">
																<i class="fas fa-ban"></i>
																Disabled
															</span>
														{/if}
													</div>
												{/snippet}
											</AdminListItem>
										{/each}
									</div>
								</div>
							{/if}
						{/if}
					</div>
				</div>
			{/snippet}

			{#snippet detail()}
				{#if selectedFlag}
					{@const flagStyle = getFeatureIconAndColor(selectedFlag.id)}
					<AdminDetailPanel
						title={selectedFlag.name}
						subtitle={selectedFlag.id}
						icon={flagStyle.icon}
						onClose={() => (selectedFlag = null)}
					>
						{#snippet children()}
							<div class="detail-content">
								<!-- Type Indicator -->
								<div class="type-indicator-section">
									<div class="type-indicator {selectedFlag?.category}">
										<i class="fas {selectedFlag?.category === 'module' ? 'fa-cubes' : selectedFlag?.category === 'tab' ? 'fa-window-restore' : 'fa-magic'}"></i>
										<span class="type-label">{selectedFlag?.category}</span>
									</div>
								</div>

								<!-- Description -->
								<div class="detail-section">
									<h3>Description</h3>
									<p>{selectedFlag?.description}</p>
								</div>

								<!-- Settings Form -->
								<div class="detail-section">
									<h3>Access Control</h3>
									<div class="form-fields">
										<!-- Role Chip Selector -->
										<div class="form-field" role="radiogroup" aria-labelledby="role-label">
											<span id="role-label" class="field-label">Minimum Role</span>
											<div class="role-chips">
												{#each ROLE_HIERARCHY as role}
													<button
														class="role-chip"
														class:selected={editedMinimumRole === role}
														style="--role-color: {getRoleColor(role)}"
														onclick={() => (editedMinimumRole = role)}
														type="button"
														role="radio"
														aria-checked={editedMinimumRole === role}
													>
														<i class="fas {getRoleIcon(role)}"></i>
														<span>{ROLE_DISPLAY[role].label}</span>
													</button>
												{/each}
											</div>
										</div>

										<!-- Enabled Toggle -->
										<div class="form-field">
											<span id="enabled-label" class="field-label">Enabled</span>
											<button
												aria-labelledby="enabled-label"
												class="toggle-switch"
												class:enabled={editedEnabled}
												onclick={() => (editedEnabled = !editedEnabled)}
												type="button"
												role="switch"
												aria-checked={editedEnabled}
											>
												<span class="toggle-track">
													<span class="toggle-thumb"></span>
												</span>
												<span class="toggle-label">{editedEnabled ? 'Enabled' : 'Disabled'}</span>
											</button>
										</div>
									</div>
								</div>

								<!-- Current Status -->
								<div class="detail-section">
									<h3>Current Status</h3>
									<div class="status-info">
										<div class="status-item">
											<span class="status-label">Status:</span>
											<span class="status-value" class:enabled={selectedFlag?.enabled}>
												{selectedFlag?.enabled ? 'Enabled' : 'Disabled'}
											</span>
										</div>
										<div class="status-item">
											<span class="status-label">Minimum Role:</span>
											<span
												class="status-value"
												style="color: {getRoleColor(selectedFlag?.minimumRole || 'user')}"
											>
												<i class="fas {getRoleIcon(selectedFlag?.minimumRole || 'user')}"></i>
												{ROLE_DISPLAY[selectedFlag?.minimumRole || 'user'].label}
											</span>
										</div>
									</div>
								</div>
							</div>
						{/snippet}

						{#snippet actions()}
							<AdminActionButton
								variant="secondary"
								onclick={() => {
									editedMinimumRole = selectedFlag!.minimumRole;
									editedEnabled = selectedFlag!.enabled;
								}}
							>
								Reset
							</AdminActionButton>
							<AdminActionButton
								variant="primary"
								icon="fa-save"
								loading={isSaving}
								onclick={saveChanges}
							>
								Save Changes
							</AdminActionButton>
						{/snippet}
					</AdminDetailPanel>
				{/if}
			{/snippet}
		</AdminTwoPanelLayout>
		{:else}
			<!-- User feature overrides -->
			<AdminTwoPanelLayout hasSelection={selectedUser !== null} onClose={() => (selectedUser = null)}>
				{#snippet list()}
					<div class="list-section">
						<!-- User search -->
						<div class="list-controls">
							<AdminSearchBox
								bind:value={userSearchQuery}
								placeholder="Search by name, email, or username..."
								onclear={() => {
									userSearchQuery = '';
									searchedUsers = [];
								}}
							/>
							<AdminActionButton
								variant="primary"
								icon="fa-search"
								loading={isSearchingUsers}
								onclick={searchUsers}
								fullWidth
							>
								Search Users
							</AdminActionButton>
						</div>

						<!-- User list -->
						<div class="flag-list">
							{#if searchedUsers.length === 0 && !userSearchQuery.trim()}
								<AdminEmptyState
									icon="fa-search"
									title="Search for a user"
									message="Enter a name, email, or username to find users and manage their feature overrides"
								/>
							{:else if isSearchingUsers}
								<div class="loading-state">
									<i class="fas fa-spinner fa-spin"></i>
									<p>Searching users...</p>
								</div>
							{:else if searchedUsers.length === 0}
								<AdminEmptyState
									icon="fa-user-slash"
									title="No users found"
									message="Try a different search term"
								/>
							{:else}
								{#each searchedUsers as user}
									<AdminListItem
										selected={selectedUser?.id === user.id}
										onClick={() => selectUser(user)}
									>
										{#snippet icon()}
											<div class="user-avatar">
												{#if user.photoURL}
													<img src={user.photoURL} alt={user.displayName} />
												{:else}
													<span class="initials">
														{user.displayName
															.split(' ')
															.map((n) => n[0])
															.join('')
															.toUpperCase()
															.slice(0, 2)}
													</span>
												{/if}
											</div>
										{/snippet}

										{#snippet children()}
											<div class="user-info">
												<h4>{user.displayName}</h4>
												<p class="user-email">{user.email}</p>
											</div>
										{/snippet}

										{#snippet meta()}
											<span
												class="role-badge"
												style="background: {getRoleColor(user.role)}20; color: {getRoleColor(
													user.role
												)}"
											>
												<i class="fas {getRoleIcon(user.role)}"></i>
												{user.role}
											</span>
										{/snippet}
									</AdminListItem>
								{/each}
							{/if}
						</div>
					</div>
				{/snippet}

				{#snippet detail()}
					{#if selectedUser}
						<AdminDetailPanel
							title={selectedUser.displayName}
							subtitle={selectedUser.email}
							icon="fa-user-cog"
							onClose={() => (selectedUser = null)}
						>
							{#snippet children()}
								<div class="detail-content">
									<!-- User info -->
									<div class="detail-section">
										<h3>User Information</h3>
										<div class="status-info">
											<div class="status-item">
												<span class="status-label">Role:</span>
												<span
													class="status-value"
													style="color: {getRoleColor(selectedUser?.role || 'user')}"
												>
													<i class="fas {getRoleIcon(selectedUser?.role || 'user')}"></i>
													{ROLE_DISPLAY[selectedUser?.role || 'user'].label}
												</span>
											</div>
											<div class="status-item">
												<span class="status-label">User ID:</span>
												<span class="status-value" style="font-family: monospace; font-size: 11px;">
													{selectedUser?.id}
												</span>
											</div>
										</div>
									</div>

									<!-- Feature overrides -->
									<div class="detail-section">
										<h3>Feature Overrides</h3>
										<p style="margin-bottom: 16px; font-size: 13px; color: rgba(255, 255, 255, 0.6);">
											Enable or disable specific features for this user, overriding their role permissions.
										</p>

										<!-- Enabled features -->
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
															onchange={() => toggleEnabledFeature(flag.id)}
														/>
														<span class="checkbox-label">
															<i class="fas {flagStyle.icon}" style="color: {flagStyle.color}"></i>
															{flag.name}
														</span>
													</label>
												{/each}
											</div>
										</div>

										<!-- Disabled features -->
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
															onchange={() => toggleDisabledFeature(flag.id)}
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
								<AdminActionButton
									variant="secondary"
									onclick={() => {
										editedEnabledFeatures = selectedUser?.featureOverrides?.enabledFeatures || [];
										editedDisabledFeatures = selectedUser?.featureOverrides?.disabledFeatures || [];
									}}
								>
									Reset
								</AdminActionButton>
								<AdminActionButton
									variant="primary"
									icon="fa-save"
									loading={isSaving}
									onclick={saveUserOverrides}
								>
									Save Overrides
								</AdminActionButton>
							{/snippet}
						</AdminDetailPanel>
					{/if}
				{/snippet}
			</AdminTwoPanelLayout>
		{/if}
	</div>
</div>

<!-- Confirmation Modal -->
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

	/* Header */
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
		margin-bottom: 20px;
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

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 16px;
	}

	/* Error banner */
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

	/* Content area */
	.content-area {
		flex: 1;
		overflow: hidden;
		min-height: 0;
	}

	/* List section */
	.list-section {
		display: flex;
		flex-direction: column;
		height: 100%;
		overflow: hidden;
	}

	.list-controls {
		padding: 12px;
		display: flex;
		flex-direction: column;
		gap: 10px;
		background: rgba(255, 255, 255, 0.02);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		min-width: 0; /* Allow shrinking */
		overflow: hidden;
	}

	.flag-list {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		display: grid;
		grid-template-columns: 1fr;
		gap: 4px;
		align-content: start;
		padding: 8px;
	}

	/* Multi-column on wide containers */
	@container feature-flags (min-width: 1200px) {
		.flag-list {
			grid-template-columns: repeat(2, 1fr);
			gap: 12px;
		}
	}

	@container feature-flags (min-width: 1800px) {
		.flag-list {
			grid-template-columns: repeat(3, 1fr);
			gap: 16px;
		}
	}

	.loading-state {
		grid-column: 1 / -1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 48px 24px;
		gap: 12px;
		color: rgba(255, 255, 255, 0.5);
	}

	.loading-state i {
		font-size: 32px;
	}

	/* Empty state should span all columns */
	.flag-list > :global(.admin-empty-state) {
		grid-column: 1 / -1;
	}

	/* Flag list items */
	.flag-icon {
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
		background: rgba(255, 255, 255, 0.05);
		font-size: 18px;
		flex-shrink: 0;
	}

	/* Module icons are slightly larger */
	.module-content .flag-icon {
		width: 44px;
		height: 44px;
		font-size: 20px;
		background: rgba(255, 255, 255, 0.08);
	}

	.flag-info h4 {
		margin: 0 0 4px 0;
		font-size: 14px;
		font-weight: 500;
		color: rgba(255, 255, 255, 0.9);
	}

	/* Module rows get bolder text */
	.module-content .flag-info h4 {
		font-size: 15px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.95);
	}

	.flag-badges {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.role-badge {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 4px 8px;
		border-radius: 4px;
		font-size: 11px;
		font-weight: 500;
		text-transform: capitalize;
	}

	.disabled-badge {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 4px 8px;
		border-radius: 4px;
		background: rgba(239, 68, 68, 0.15);
		color: #fca5a5;
		font-size: 11px;
		font-weight: 500;
	}

	/* Hierarchical structure */
	.module-group {
		background: rgba(255, 255, 255, 0.02);
		border-radius: 12px;
		border: 1px solid rgba(255, 255, 255, 0.06);
		overflow: hidden;
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	.module-group:hover {
		border-color: rgba(255, 255, 255, 0.12);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.module-header {
		display: flex;
		align-items: stretch;
		background: transparent;
		border-left: 3px solid transparent;
		transition: all 0.2s;
	}

	.module-header:hover {
		background: rgba(255, 255, 255, 0.03);
	}

	.module-header.selected {
		background: rgba(59, 130, 246, 0.1);
		border-left-color: #3b82f6;
	}

	.module-group:has(.module-header.selected) {
		border-color: rgba(59, 130, 246, 0.3);
		box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.2);
	}

	.module-header.expanded {
		background: rgba(255, 255, 255, 0.02);
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
	}

	.expand-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		border: none;
		background: transparent;
		color: rgba(255, 255, 255, 0.4);
		cursor: pointer;
		transition: all 0.2s;
		flex-shrink: 0;
	}

	.expand-icon:hover {
		background: rgba(255, 255, 255, 0.05);
		color: rgba(255, 255, 255, 0.7);
	}

	.expand-icon i {
		font-size: 12px;
		transition: transform 0.2s;
	}

	.module-content {
		display: flex;
		align-items: center;
		gap: 12px;
		flex: 1;
		padding: 12px 16px 12px 0;
		border: none;
		background: transparent;
		color: inherit;
		cursor: pointer;
		text-align: left;
		transition: background 0.2s;
	}

	.module-content:hover {
		background: rgba(255, 255, 255, 0.03);
	}

	.tabs-list {
		background: rgba(0, 0, 0, 0.15);
		border-left: 2px solid rgba(255, 255, 255, 0.08);
		margin-left: 20px;
		margin-right: 8px;
		margin-bottom: 8px;
		border-radius: 0 0 8px 8px;
		padding: 4px 0;
	}

	.tabs-list :global(.tab-item) {
		border-left: 3px solid transparent;
		padding-left: 28px;
	}

	.tabs-list :global(.tab-item.selected) {
		border-left-color: #60a5fa;
		background: rgba(59, 130, 246, 0.08);
	}

	.capabilities-section {
		grid-column: 1 / -1; /* Span all columns */
		background: rgba(255, 255, 255, 0.02);
		border-radius: 12px;
		border: 1px solid rgba(255, 255, 255, 0.06);
		padding: 12px;
		margin-top: 8px;
	}

	.capabilities-section :global(.admin-list-item) {
		background: rgba(255, 255, 255, 0.02);
		border-radius: 8px;
		border: 1px solid rgba(255, 255, 255, 0.04);
	}

	.capabilities-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 8px;
		margin-top: 8px;
	}

	.section-header {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 12px;
		font-size: 13px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.7);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.section-header i {
		font-size: 14px;
		color: #f59e0b;
	}

	/* Detail content */
	.detail-content {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	/* Type Indicator - Prominent badge at top */
	.type-indicator-section {
		margin: -8px 0 0 0;
	}

	.type-indicator {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		padding: 12px 20px;
		border-radius: 8px;
		font-weight: 600;
		font-size: 15px;
		letter-spacing: 0.5px;
		text-transform: uppercase;
		border: 2px solid;
	}

	.type-indicator.module {
		background: rgba(139, 92, 246, 0.15);
		border-color: rgba(139, 92, 246, 0.4);
		color: #a78bfa;
	}

	.type-indicator.tab {
		background: rgba(59, 130, 246, 0.15);
		border-color: rgba(59, 130, 246, 0.4);
		color: #60a5fa;
	}

	.type-indicator.capability {
		background: rgba(245, 158, 11, 0.15);
		border-color: rgba(245, 158, 11, 0.4);
		color: #fbbf24;
	}

	.type-indicator i {
		font-size: 18px;
	}

	.type-label {
		font-weight: 700;
	}

	.detail-section h3 {
		margin: 0 0 12px 0;
		font-size: 14px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.9);
	}

	.detail-section p {
		margin: 0;
		font-size: 14px;
		color: rgba(255, 255, 255, 0.7);
		line-height: 1.5;
	}

	.form-fields {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.form-field {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.field-label {
		font-size: 13px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.8);
	}

	/* Role Chip Selector */
	.role-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.role-chip {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 16px;
		border: 2px solid rgba(255, 255, 255, 0.1);
		border-radius: 24px;
		background: rgba(255, 255, 255, 0.03);
		color: rgba(255, 255, 255, 0.7);
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.role-chip:hover {
		border-color: rgba(255, 255, 255, 0.2);
		background: rgba(255, 255, 255, 0.06);
		color: rgba(255, 255, 255, 0.9);
	}

	.role-chip.selected {
		border-color: var(--role-color);
		background: color-mix(in srgb, var(--role-color) 15%, transparent);
		color: var(--role-color);
		box-shadow: 0 0 12px color-mix(in srgb, var(--role-color) 30%, transparent);
	}

	.role-chip i {
		font-size: 14px;
	}

	/* Custom Toggle Switch */
	.toggle-switch {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 0;
		border: none;
		background: transparent;
		cursor: pointer;
		color: rgba(255, 255, 255, 0.7);
	}

	.toggle-track {
		position: relative;
		width: 52px;
		height: 28px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 14px;
		transition: background 0.2s ease;
	}

	.toggle-switch.enabled .toggle-track {
		background: rgba(16, 185, 129, 0.3);
	}

	.toggle-thumb {
		position: absolute;
		top: 3px;
		left: 3px;
		width: 22px;
		height: 22px;
		background: rgba(255, 255, 255, 0.6);
		border-radius: 50%;
		transition: all 0.2s ease;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.toggle-switch.enabled .toggle-thumb {
		left: 27px;
		background: #10b981;
		box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
	}

	.toggle-label {
		font-size: 14px;
		font-weight: 500;
		transition: color 0.2s;
	}

	.toggle-switch.enabled .toggle-label {
		color: #34d399;
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

	.status-value.enabled {
		color: #34d399;
	}

	/* User overrides UI */
	.user-avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.1);
		flex-shrink: 0;
	}

	.user-avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.initials {
		font-size: 14px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.8);
	}

	.user-info h4 {
		margin: 0 0 4px 0;
		font-size: 14px;
		font-weight: 500;
		color: rgba(255, 255, 255, 0.9);
	}

	.user-email {
		margin: 0;
		font-size: 12px;
		color: rgba(255, 255, 255, 0.5);
	}

	/* Feature overrides lists */
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

	/* Responsive adjustments */
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

		.stats-grid {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>
