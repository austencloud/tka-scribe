<script lang="ts">
	import MenuBar from '$lib/components/MenuBar/MenuBar.svelte';
	import TabContent from '../tabs/TabContent.svelte';
	import { createEventDispatcher } from 'svelte';
	import SequenceInspector from '$lib/components/Developer/SequenceInspector.svelte';
	import { selectIsSettingsOpen, selectActiveTabData } from '../state/store';
	import { actions } from '../state/actions';
	import SettingsContent from '$lib/components/SettingsDialog/SettingsContent.svelte';

	// --- Props & Events ---
	export let background: string;

	// --- Events Emitted Up ---
	const dispatch = createEventDispatcher<{
		changeBackground: string;
		tabChange: number;
	}>();

	// --- Get State from XState ---
	const isSettingsDialogOpen = selectIsSettingsOpen();
	const activeTabData = selectActiveTabData();

	// --- Event Handlers ---
	function handleToggleSettings() {
		// Toggle settings dialog 
		if ($isSettingsDialogOpen) {
			actions.closeSettings();
		} else {
			actions.openSettings();
		}
	}

	// This function will be passed down as a prop.
	function handleBackgroundChange(newBackground: string) {
		const validBackgrounds = ['snowfall', 'nightSky']; // Keep updated
		const backgroundType = newBackground.toLowerCase();
		if (validBackgrounds.includes(backgroundType)) {
			dispatch('changeBackground', backgroundType);
		} else {
			console.warn(`Invalid background type requested: ${newBackground}. Using default.`);
			dispatch('changeBackground', 'snowfall');
		}
	}

	// Handler for tab changes bubbling up
	function handleTabChange(event: CustomEvent<number>) {
		dispatch('tabChange', event.detail);
	}

	// Get the current section name based on active tab
	$: currentSection = $activeTabData ? $activeTabData.title : 'Construct';
</script>

<div class="content">
	<div class="menuBar">
		<MenuBar
			onSettingsClick={handleToggleSettings} 
			on:tabChange={handleTabChange}
		/>
		{#if import.meta.env.DEV}
			<SequenceInspector />
		{/if}
	</div>

	<div class="mainContent">
		<TabContent 

		/>
	</div>

	{#if $isSettingsDialogOpen}
		<div class="settingsContent">
			<SettingsContent
				{background}
				{currentSection}
				onChangeBackground={handleBackgroundChange} 
				onClose={() => actions.closeSettings()}
			/>
		</div>
	{/if}
</div>

<style>
	.content {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-height: 0;
		z-index: 1;
		width: 100%;
	}
	.mainContent {
		display: flex;
		flex: 1;
		overflow: hidden;
		position: relative;
		z-index: 0;
		width: 100%;
		opacity: 1;
	}
	.settingsContent {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 10;
	}
    .menuBar {
        padding: 5px 10px;
    }
</style>