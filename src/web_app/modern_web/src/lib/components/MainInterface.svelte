<script lang="ts">
	// Import runes-based state
	import {
		getActiveTab,
		getSettings,
		getShowSettings,
		isTabActive,
		switchTab,
	} from '$stores/appState.svelte';
	// Import Svelte's built-in fade transition
	import { shouldAnimate } from '$lib/utils/simpleFade';
	import { fade } from 'svelte/transition';
	// Import tab components
	import BackgroundCanvas from './backgrounds/BackgroundCanvas.svelte';
	import BackgroundProvider from './backgrounds/BackgroundProvider.svelte';
	import NavigationBar from './navigation/NavigationBar.svelte';
	import SettingsDialog from './SettingsDialog.svelte';
	import BrowseTab from './tabs/BrowseTab.svelte';
	import ConstructTab from './tabs/ConstructTab.svelte';
	import LearnTab from './tabs/LearnTab.svelte';
	import SequenceCardTab from './tabs/SequenceCardTab.svelte';
	import WriteTab from './tabs/WriteTab.svelte';

	// Sequential fade timing - this is the key to making it work!
	const OUT_DURATION = 250;
	const IN_DURATION = 250;
	const IN_DELAY = OUT_DURATION; // Wait for out transition to complete

	// Get reactive state
	const activeTab = $derived(getActiveTab());
	// Animation settings consumed by simpleFade utilities
	const animationSettings = $derived({ animationsEnabled: !!getSettings().animationsEnabled });

	// Transition parameters
	const fadeOutParams = $derived(
		shouldAnimate(animationSettings) ? { duration: OUT_DURATION } : { duration: 0 }
	);
	const fadeInParams = $derived(
		shouldAnimate(animationSettings)
			? { duration: IN_DURATION, delay: IN_DELAY }
			: { duration: 0 }
	);

	// Tab configuration - UPDATED to include Sequence Card tab matching desktop app exactly
	const tabs = [
		{ id: 'construct', label: 'Construct', icon: '🔧' },
		{ id: 'browse', label: 'Browse', icon: '🔍' },
		{ id: 'sequence_card', label: 'Sequence Card', icon: '🎴' },
		{ id: 'write', label: 'Write', icon: '✍️' },
		{ id: 'learn', label: 'Learn', icon: '🧠' },
	] as const;

	type TabId = (typeof tabs)[number]['id'];
	function handleTabSelect(tabId: string) {
		if ((tabs as readonly { id: TabId }[]).some((t) => t.id === tabId)) {
			switchTab(tabId as TabId);
		}
	}
</script>

<BackgroundProvider>
	<div class="main-interface">
		<!-- Background Canvas - positioned behind everything -->
		{#if getSettings().backgroundEnabled}
			<BackgroundCanvas
				backgroundType={getSettings().backgroundType || 'aurora'}
				quality={getSettings().backgroundQuality || 'medium'}
				onReady={() =>
					console.log(
						`🌌 Main app background ready: ${getSettings().backgroundType} at ${getSettings().backgroundQuality} quality`
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

		<NavigationBar {tabs} {activeTab} onTabSelect={handleTabSelect} />

		<main class="content-area">
			<!-- Main tab content with sequential fade transitions using {#key} block -->
			{#key activeTab}
				<div class="tab-content" in:fade={fadeInParams} out:fade={fadeOutParams}>
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
{#if getShowSettings()}
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
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		width: 100%;
		height: 100%;
		/* Ensure smooth transitions without layout jumps */
		will-change: opacity;
		backface-visibility: hidden;
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.main-interface {
			height: 100vh;
			height: 100dvh; /* Dynamic viewport height for mobile */
		}
	}
</style>
