<script lang="ts">
	import NavWidget from './NavWidget/NavWidget.svelte';
	import SettingsButton from './SettingsButton/SettingsButton.svelte';
	import { createEventDispatcher } from 'svelte';
	import { slide } from 'svelte/transition';
	import { elasticOut } from 'svelte/easing';
	import { writable } from 'svelte/store';

	export let onSettingsClick: () => void;

	// Toggle state for nav bar
	const isNavVisible = writable(true);

	const dispatch = createEventDispatcher();

	function handleTabChange(event: CustomEvent<number>) {
		dispatch('tabChange', event.detail);
	}

	function toggleNav() {
		isNavVisible.update((v) => !v);
	}
</script>

<header class="menu-bar-container">
	{#if $isNavVisible}
		<div class="menu-bar" transition:slide={{ duration: 300, easing: elasticOut }}>
			<SettingsButton on:click={onSettingsClick} />

			<div class="nav-widget-wrapper">
				<NavWidget on:tabChange={handleTabChange} />
			</div>
		</div>
	{/if}

	<!-- The pull tab -->
	<button
		type="button"
		class="nav-tab"
		on:click={toggleNav}
		on:keydown={(e) => e.key === 'Enter' && toggleNav()}
		aria-label="{$isNavVisible ? 'Hide' : 'Show'} navigation menu"
	>
		<i class="fas fa-{$isNavVisible ? 'chevron-up' : 'chevron-down'}"></i>
	</button>
</header>

<style>
	.menu-bar-container {
		position: relative;
		width: 100%;
	}

	.menu-bar {
		display: flex;
		align-items: center;
		padding: 4px;
		position: relative;
		background-color: rgba(0, 0, 0, 0.3);
		backdrop-filter: blur(8px);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.nav-tab {
		position: absolute;
		bottom: -20px;
		left: 50%;
		transform: translateX(-50%);
		width: 40px;
		height: 20px;
		background-color: rgba(0, 0, 0, 0.3);
		backdrop-filter: blur(8px);
		border-radius: 0 0 10px 10px;
		display: flex;
		justify-content: center;
		align-items: center;
		cursor: pointer;
		color: white;
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-top: none;
		z-index: 10;
		transition: all 0.2s ease;
		padding: 0;
		font-size: inherit;
		outline: none;
	}

	.nav-tab:hover {
		height: 24px;
		bottom: -24px;
		color: #6c9ce9;
	}
</style>
