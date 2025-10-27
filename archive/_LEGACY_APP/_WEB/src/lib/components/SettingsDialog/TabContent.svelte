<script lang="ts">
	// import { fly } from 'svelte/transition'; // REMOVED transition for debug
	export let activeTab: string;
	export let background: string;
	export let onChangeBackground: (newBackground: string) => void;

	// Import child tab components
	import UserProfileTab from './UserProfileTab.svelte';
	import PropTypeTab from './PropTypeTab/PropTypeTab.svelte';
	import BackgroundTab from './BackgroundTab.svelte';
	import VisibilityTab from './VisibilityTab.svelte';
	import BeatLayoutTab from './BeatLayoutTab/BeatLayoutTab.svelte';

	let tabs = ['User', 'Prop Type', 'Background', 'Visibility', 'Beat Layouts'];

	// REMOVED transition variables: previousTabIndex, activeTabIndex, getFlyDirection
</script>

<div class="tab-content-wrapper">
	{#each tabs as tab (tab)}
		{#if activeTab === tab}
			<div class="tab-pane">
				{#if tab === 'User'}
					<UserProfileTab />
				{:else if tab === 'Prop Type'}
					<PropTypeTab />
				{:else if tab === 'Background'}
					<BackgroundTab {background} {onChangeBackground} />
				{:else if tab === 'Visibility'}
					<VisibilityTab />
				{:else if tab === 'Beat Layouts'}
					<BeatLayoutTab />
				{/if}
			</div>
		{/if}
	{/each}
</div>

<style>
	.tab-content-wrapper {
		/* Ensure this container takes up space */
		display: flex;
		flex-direction: column;
		flex: 1; /* Takes available space in parent flex container */
		min-height: 0; /* Important for flex children */
		width: 100%;
		/* Add border to see its bounds */
		padding: 5px;
		box-sizing: border-box;
		overflow: hidden; /* Prevent content from spilling out */
	}

	.tab-pane {
		/* Static positioning, allow normal flow */
		/* position: absolute; */
		width: 100%;
		/* Let content determine height, but allow scrolling */
		height: 100%; /* Try filling the container */
		overflow-y: auto; /* Allow scrolling if content overflows */
		box-sizing: border-box;
		color: white; /* Ensure text inside is visible */
	}
</style>
