<!--
  TrainSetup.svelte - Initial setup screen for selecting a sequence

  Responsive drawer pattern: bottom on mobile, right on desktop
-->
<script lang="ts">
	import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
	import { SequenceBrowserPanel } from "$lib/shared/animate/components";
	import { resolve } from "$lib/shared/inversify";
	import { TYPES } from "$lib/shared/inversify/types";
	import type { IDiscoverLoader } from "$lib/modules/discover";

	interface Props {
		onSequenceSelected: (sequence: SequenceData) => void;
	}

	let { onSequenceSelected }: Props = $props();

	// Services
	const loaderService = resolve(TYPES.IDiscoverLoader) as IDiscoverLoader;

	// State
	let showBrowser = $state(false);
	let isMobile = $state(false);
	let isLoadingFullSequence = $state(false);

	$effect(() => {
		isMobile = window.innerWidth < 768;
		const handleResize = () => {
			isMobile = window.innerWidth < 768;
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});

	function openBrowser() {
		showBrowser = true;
	}

	function closeBrowser() {
		showBrowser = false;
	}

	async function handleSequenceSelect(sequence: SequenceData) {
		// Load full sequence data including beats
		try {
			isLoadingFullSequence = true;
			console.log('[TrainSetup] Loading full sequence data for:', sequence.name);
			const fullSequence = await loaderService.loadFullSequenceData(sequence.name);

			if (fullSequence) {
				console.log('[TrainSetup] Loaded full sequence with beats:', fullSequence.beats?.length);
				closeBrowser();
				onSequenceSelected(fullSequence);
			} else {
				console.error('[TrainSetup] Failed to load full sequence data');
			}
		} catch (error) {
			console.error('[TrainSetup] Error loading full sequence:', error);
		} finally {
			isLoadingFullSequence = false;
		}
	}
</script>

<div class="train-setup">
	<div class="setup-container">
		<!-- Header -->
		<header class="setup-header">
			<div class="icon-container">
				<i class="fas fa-dumbbell"></i>
			</div>
			<h1>Train Mode</h1>
			<p>Practice sequences with real-time hand tracking feedback</p>
		</header>

		<!-- Main Content -->
		<div class="content">
			<div class="feature-list">
				<div class="feature">
					<i class="fas fa-video"></i>
					<span>Live camera tracking</span>
				</div>
				<div class="feature">
					<i class="fas fa-hand-paper"></i>
					<span>Hand position detection</span>
				</div>
				<div class="feature">
					<i class="fas fa-chart-line"></i>
					<span>Performance scoring</span>
				</div>
			</div>

			<!-- Call to Action -->
			<button class="select-sequence-button" onclick={openBrowser}>
				<i class="fas fa-th-list"></i>
				<span>Select Sequence</span>
			</button>
		</div>
	</div>

	<!-- Loading Overlay -->
	{#if isLoadingFullSequence}
		<div class="loading-overlay">
			<div class="loading-spinner"></div>
			<p>Loading sequence data...</p>
		</div>
	{/if}

	<!-- Sequence Browser Drawer -->
	<SequenceBrowserPanel
		mode="primary"
		show={showBrowser}
		onSelect={handleSequenceSelect}
		onClose={closeBrowser}
	/>
</div>

<style>
	.train-setup {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: var(--background-primary, #0f0f0f);
		color: white;
		overflow: hidden;
		position: relative;
	}

	.setup-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		overflow: auto;
	}

	.setup-header {
		text-align: center;
		margin-bottom: 3rem;
	}

	.icon-container {
		width: 80px;
		height: 80px;
		margin: 0 auto 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2));
		border-radius: 20px;
		border: 2px solid rgba(59, 130, 246, 0.3);
	}

	.icon-container i {
		font-size: 2.5rem;
		background: linear-gradient(135deg, #3b82f6, #8b5cf6);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.setup-header h1 {
		font-size: 2rem;
		font-weight: 800;
		margin: 0 0 0.75rem 0;
		background: linear-gradient(135deg, #3b82f6, #8b5cf6);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.setup-header p {
		margin: 0;
		color: rgba(255, 255, 255, 0.6);
		font-size: 1rem;
		max-width: 400px;
		margin: 0 auto;
	}

	.content {
		width: 100%;
		max-width: 400px;
	}

	.feature-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-bottom: 2.5rem;
	}

	.feature {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 12px;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.feature i {
		font-size: 1.25rem;
		color: #3b82f6;
		width: 24px;
		text-align: center;
	}

	.feature span {
		flex: 1;
		font-size: 0.95rem;
		color: rgba(255, 255, 255, 0.9);
	}

	.select-sequence-button {
		width: 100%;
		padding: 1.25rem 2rem;
		background: linear-gradient(135deg, #3b82f6, #8b5cf6);
		border: none;
		border-radius: 12px;
		color: white;
		font-size: 1.125rem;
		font-weight: 600;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		transition: all 0.2s;
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
	}

	.select-sequence-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
	}

	.select-sequence-button i {
		font-size: 1.25rem;
	}

	/* Loading Overlay */
	.loading-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.8);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		z-index: 1000;
	}

	.loading-spinner {
		width: 50px;
		height: 50px;
		border: 4px solid rgba(255, 255, 255, 0.1);
		border-top-color: #3b82f6;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	.loading-overlay p {
		color: white;
		font-size: 1rem;
		margin: 0;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (max-width: 768px) {
		.setup-header h1 {
			font-size: 1.75rem;
		}

		.icon-container {
			width: 60px;
			height: 60px;
			margin-bottom: 1rem;
		}

		.icon-container i {
			font-size: 2rem;
		}
	}
</style>
