<script lang="ts">
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';
	
	// Components
	import FullScreen from '$lib/FullScreen.svelte';
	import MainLayout from './layout/MainLayout.svelte';
	import LoadingOverlay from './loading/LoadingOverlay.svelte';
	import BackgroundCanvas from '../Backgrounds/BackgroundCanvas.svelte';
	import BackgroundProvider from '../Backgrounds/BackgroundProvider.svelte';

	// State (XState)
	import {
		selectIsLoading,
		selectIsInitializingApp,
		selectHasInitializationFailed,
		selectIsReady,
		selectBackground,
		selectInitializationError,
		selectLoadingProgress,
		selectLoadingMessage
	} from './state/store';
	import { actions } from './state/actions';

	// Window Store
	import { windowHeight } from '$lib/stores/ui/windowStore';

	// Types
	interface PerformanceReportEvent {
		fps: number;
		memory?: { used: number; total: number };
	}
	// Adjust event map if needed, though dispatching 'tabChange' is internal here
	type Events = {
		// tabChange: { index: number; id: string }; // This component dispatches other events upwards
		changeBackground: string;
		toggleFullscreen: boolean;
	};

	const dispatch = createEventDispatcher<Events>();

	// --- Get State from XState using specific selectors ---
	const isLoading = selectIsLoading();
	const isInitializingApp = selectIsInitializingApp();
	const hasFailed = selectHasInitializationFailed();
	const isReady = selectIsReady();
	const currentBackground = selectBackground();
	const initializationErrorMsg = selectInitializationError();
	const loadingProgress = selectLoadingProgress();
	const loadingMessage = selectLoadingMessage();

	// --- Event Handlers ---
	function handleFullScreenToggle(event: CustomEvent<boolean>) {
		actions.setFullScreen(event.detail);
		dispatch('toggleFullscreen', event.detail);
	}
	function handleBackgroundChange(event: CustomEvent<string>) {
		actions.updateBackground(event.detail);
		dispatch('changeBackground', event.detail);
	}

	// *** FIX: Update handler signature and call to actions.changeTab ***
	function handleTabChange(event: CustomEvent<number>) {
		// event.detail is now the number (index)
		actions.changeTab(event.detail);
	}

	function handleRetry(): void {
		actions.retryInitialization();
	}
	function handleBackgroundReady(): void {
		actions.backgroundReady();
	}
	function handlePerformanceReport(event: CustomEvent<PerformanceReportEvent>): void {
		const fps = event.detail?.fps ?? 0;
		if (fps < 30) {
			console.warn('Low performance detected in background animation');
		}
	}

	// --- Lifecycle ---
	onMount(() => {
		// Service started in store.ts
	});
</script>

<div id="main-widget" style="height: {$windowHeight}" class="main-widget">
	<FullScreen on:toggleFullscreen={handleFullScreenToggle}>
		<div class="background" class:blur-background={$isInitializingApp || $hasFailed}>
			<BackgroundProvider
				backgroundType={$currentBackground || 'snowfall'}
				isLoading={$isInitializingApp || $hasFailed}
				initialQuality={$isInitializingApp || $hasFailed ? 'medium' : 'high'}
			>
				<BackgroundCanvas
					appIsLoading={$isInitializingApp || $hasFailed}
					on:ready={handleBackgroundReady}
					on:performanceReport={handlePerformanceReport}
				/>
			</BackgroundProvider>
		</div>

		{#if $isInitializingApp || $hasFailed}
			<div class="loading-overlay-wrapper" transition:fade={{ duration: 300 }}>
				<LoadingOverlay
					message={$loadingMessage}
					progress={$loadingProgress}
					onRetry={handleRetry}
					showInitializationError={$hasFailed}
					errorMessage={$initializationErrorMsg}
				/>
			</div>
		{/if}

		{#if $isReady}
			<div class="main-layout-wrapper" transition:fade={{ duration: 500, delay: 100 }}>
				<MainLayout
					background={$currentBackground}
					on:changeBackground={handleBackgroundChange}
					on:tabChange={handleTabChange} />
			</div>
		{/if}
	</FullScreen>
</div>

<style>
	/* Styles remain the same */
	.main-widget {
		display: flex;
		flex-direction: column;
		flex: 1;
		position: relative;
		color-scheme: light dark;
		color: light-dark(black, white);
		overflow: hidden;
		background-color: rgb(11, 29, 42);
	}
	.background {
		position: absolute;
		inset: 0;
		overflow: hidden;
		z-index: 0;
		transition: filter 0.3s ease-in-out;
		filter: blur(0px);
	}
	.background.blur-background {
		filter: blur(4px);
	}
	.loading-overlay-wrapper {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 999;
	}
	.main-layout-wrapper {
		flex: 1;
		display: flex;
		min-height: 0;
		position: relative;
		z-index: 1;
	}
</style>
