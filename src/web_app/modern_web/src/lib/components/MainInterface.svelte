<script lang="ts">
	// Import runes-based state
	import { getActiveTab, isTabActive, switchTab, getShowSettings } from '$stores/appState.svelte';

	// Reactive state for template
	let activeTab = $derived(getActiveTab());
	let showSettings = $derived(getShowSettings());

	// Import tab components 
	import ConstructTab from './tabs/ConstructTab.svelte';
	import BrowseTab from './tabs/BrowseTab.svelte';
	import LearnTab from './tabs/LearnTab.svelte';
	import SequenceTab from './tabs/SequenceTab.svelte';
	import NavigationBar from './navigation/NavigationBar.svelte';
	import SettingsDialog from './SettingsDialog.svelte';

	// Tab configuration - UPDATED to include Sequence tab matching desktop app exactly
	const tabs = [
		{ id: 'construct', label: 'Construct', icon: '🔧' },
		{ id: 'browse', label: 'Browse', icon: '🔍' },
		{ id: 'sequence', label: 'Sequence', icon: '🎵' },
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
		{:else if isTabActive('sequence')}
			<SequenceTab />
		{:else if isTabActive('write')}
			<!-- Write tab - placeholder for now -->
			<div class="placeholder-tab">
				<div class="placeholder-content">
					<h2>✍️ Write Tab</h2>
					<p>Coming soon... This will contain sequence writing and documentation tools.</p>
				</div>
			</div>
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

	/* Placeholder tab styling */
	.placeholder-tab {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-xl);
		background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
	}

	.placeholder-content {
		text-align: center;
		background: rgba(255, 255, 255, 0.05);
		border: 2px dashed rgba(255, 255, 255, 0.2);
		border-radius: 16px;
		padding: var(--spacing-xl);
		max-width: 500px;
		backdrop-filter: blur(10px);
	}

	.placeholder-content h2 {
		margin: 0 0 var(--spacing-md) 0;
		font-size: var(--font-size-2xl);
		font-weight: 600;
		color: var(--foreground);
	}

	.placeholder-content p {
		margin: 0;
		font-size: var(--font-size-lg);
		color: var(--muted-foreground);
		line-height: 1.5;
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.main-interface {
			height: 100vh;
			height: 100dvh; /* Dynamic viewport height for mobile */
		}

		.placeholder-content {
			padding: var(--spacing-lg);
			margin: var(--spacing-md);
		}

		.placeholder-content h2 {
			font-size: var(--font-size-xl);
		}

		.placeholder-content p {
			font-size: var(--font-size-md);
		}
	}
</style>
