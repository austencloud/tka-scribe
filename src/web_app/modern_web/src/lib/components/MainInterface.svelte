<script lang="ts">
	// Import runes-based state
	import {
		getActiveTab,
		isTabActive,
		switchTab,
		getShowSettings,
		getSettings,
	} from '$stores/appState.svelte';

	// Import simple fade transitions
	import { conditionalFade } from '$lib/utils/simpleFade';
	import { getAnimationSettings } from '$lib/utils/animationControl';

	// Reactive state for template
	let activeTab = $derived(getActiveTab());
	let showSettings = $derived(getShowSettings());
	let settings = $derived(getSettings());
	let animationSettings = $derived(getAnimationSettings());

	// Import tab components
	import ConstructTab from './tabs/ConstructTab.svelte';
	import BrowseTab from './tabs/BrowseTab.svelte';
	import WriteTab from './tabs/WriteTab.svelte';
	import LearnTab from './tabs/LearnTab.svelte';
	import SequenceCardTab from './tabs/SequenceCardTab.svelte';
	import NavigationBar from './navigation/NavigationBar.svelte';
	import SettingsDialog from './SettingsDialog.svelte';
	import BackgroundProvider from './backgrounds/BackgroundProvider.svelte';
	import BackgroundCanvas from './backgrounds/BackgroundCanvas.svelte';

	// Simple fade configuration
	const fadeIn = (node: Element) => conditionalFade(node, { 
		duration: 300, 
		settings: animationSettings 
	});
	
	const fadeOut = (node: Element) => conditionalFade(node, { 
		duration: 250, 
		settings: animationSettings 
	});

	// Tab configuration - UPDATED to include Sequence Card tab matching desktop app exactly
	const tabs = [
		{ id: 'construct', label: 'Construct', icon: '🔧' },
		{ id: 'browse', label: 'Browse', icon: '🔍' },
		{ id: 'sequence_card', label: 'Sequence Card', icon: '🎴' },
		{ id: 'write', label: 'Write', icon: '✍️' },
		{ id: 'learn', label: 'Learn', icon: '🧠' },
	] as const;
</script>

<BackgroundProvider>
	<div class="main-interface">
		<!-- Background Canvas - positioned behind everything -->
		{#if settings.backgroundEnabled}
			<BackgroundCanvas
				backgroundType={settings.backgroundType || 'aurora'}
				quality={settings.backgroundQuality || 'medium'}
				onReady={() =>
					console.log(
						`🌌 Main app background ready: ${settings.backgroundType} at ${settings.backgroundQuality} quality`
					)}
			/>
		{:else}
			<!-- Debug: Show when background is disabled -->
			<div
				style="position: absolute; top: 10px; right: 10px; background: rgba(255,0,0,0.5); color: white; padding: 4px; font-size: 12px; z-index: 1000;"
			>
				Background Disabled
			</div>
		{/if}

		<NavigationBar {tabs} {activeTab} onTabSelect={switchTab} />

		<main class="content-area">
			<!-- Main tab content with simple fade transitions using {#key} block -->
			{#key activeTab}
				<div class="tab-content" in:fadeIn out:fadeOut>
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
				</div>
			{/key}
		</main>
	</div>
</BackgroundProvider>

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
		position: relative;
		z-index: 1;
	}

	.content-area {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		position: relative;
	}

	/* Tab content styling for transitions */
	.tab-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		position: relative;
		height: 100%;
		width: 100%;
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.main-interface {
			height: 100vh;
			height: 100dvh; /* Dynamic viewport height for mobile */
		}
	}
</style>
