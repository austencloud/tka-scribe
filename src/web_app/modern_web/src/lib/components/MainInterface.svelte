<script lang="ts">
	// Import runes-based state
	import { getActiveTab, isTabActive, switchTab, getShowSettings } from '$stores/appState.svelte';

	// Reactive state for template
	let activeTab = $derived(getActiveTab());
	let showSettings = $derived(getShowSettings());

	// Import tab components
	import ConstructTab from './tabs/ConstructTab.svelte';
	import BrowseTab from './tabs/BrowseTab.svelte';
	import WriteTab from './tabs/WriteTab.svelte';
	import LearnTab from './tabs/LearnTab.svelte';
	import SequenceCardTab from './tabs/SequenceCardTab.svelte';
	import NavigationBar from './navigation/NavigationBar.svelte';
	import SettingsDialog from './SettingsDialog.svelte';

	// Tab configuration - UPDATED to include Sequence Card tab matching desktop app exactly
	const tabs = [
		{ id: 'construct', label: 'Construct', icon: '🔧' },
		{ id: 'browse', label: 'Browse', icon: '🔍' },
		{ id: 'sequence_card', label: 'Sequence Card', icon: '🎴' },
		{ id: 'write', label: 'Write', icon: '✍️' },
		{ id: 'learn', label: 'Learn', icon: '🧠' }
	] as const;
</script>

<div class="main-interface">
	<NavigationBar {tabs} {activeTab} onTabSelect={switchTab} />

	<main class="content-area">
		{#if isTabActive('construct')}
			<ConstructTab />
		{:else if isTabActive('browse')}
			<BrowseTab />
		{:else if isTabActive('sequence_card')}
			<SequenceCardTab />
		{:else if isTabActive('write')}
			<WriteTab />
		{:else if isTabActive('learn')}
			<LearnTab />
		{/if}
	</main>
</div>

<!-- Settings Dialog -->
{#if showSettings}
	<SettingsDialog />
{/if}

<style>
	.main-interface {
		display: flex;
		flex-direction: column;
		height: 100vh;
		width: 100%;
		overflow: hidden;
	}

	.content-area {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		position: relative;
	}

	/* Tab content styling */

	/* Responsive design */
	@media (max-width: 768px) {
		.main-interface {
			height: 100vh;
			height: 100dvh; /* Dynamic viewport height for mobile */
		}

		/* Mobile responsive adjustments */
	}
</style>
