<script lang="ts">
	import ArrowDebugCanvas from './ArrowDebugCanvas.svelte';
	import ArrowDebugControlPanel from './ArrowDebugControlPanel.svelte';
	import ArrowDebugInfoPanel from './ArrowDebugInfoPanel.svelte';
	import { createArrowDebugState } from './state/arrow-debug-state.svelte';

	// Initialize the arrow debug state
	const state = createArrowDebugState();
</script>

<svelte:head>
	<title>TKA Arrow Positioning Debug - Step-by-Step Analysis</title>
</svelte:head>

<div class="arrow-debug-container">
	<header class="debug-header">
		<h1>🎯 Arrow Positioning Debug</h1>
		<p>Visual step-by-step analysis of arrow placement with coordinate system debugging</p>
	</header>

	<main class="debug-main">
		<!-- Left Panel: Controls & Pictograph Selection -->
		<div class="panel control-panel">
			<ArrowDebugControlPanel {state} />
		</div>

		<!-- Center Panel: Visual Canvas with Step-by-Step Positioning -->
		<div class="panel canvas-panel">
			<ArrowDebugCanvas {state} />
		</div>

		<!-- Right Panel: Debug Information & Coordinate Details -->
		<div class="panel debug-info-panel">
			<ArrowDebugInfoPanel {state} />
		</div>
	</main>
</div>

<style>
	.arrow-debug-container {
		min-height: 100vh;
		background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%);
		color: white;
		padding: 20px;
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
	}

	.debug-header {
		text-align: center;
		margin-bottom: 30px;
		padding-bottom: 20px;
		border-bottom: 2px solid rgba(99, 102, 241, 0.3);
	}

	.debug-header h1 {
		font-size: 2rem;
		margin-bottom: 10px;
		background: linear-gradient(135deg, #fbbf24, #f59e0b);
		background-clip: text;
		-webkit-background-clip: text;
		color: transparent;
	}

	.debug-header p {
		color: #c7d2fe;
		font-size: 1.1rem;
	}

	.debug-main {
		display: grid;
		grid-template-columns: 400px 1fr 450px;
		gap: 20px;
		max-width: 1600px;
		margin: 0 auto;
		min-height: calc(100vh - 200px);
	}

	.panel {
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 16px;
		padding: 20px;
		overflow-y: auto;
	}

	.canvas-panel {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.05);
	}

	.control-panel {
		max-height: calc(100vh - 200px);
	}

	.debug-info-panel {
		max-height: calc(100vh - 200px);
	}

	@media (max-width: 1400px) {
		.debug-main {
			grid-template-columns: 350px 1fr 400px;
		}
	}

	@media (max-width: 1200px) {
		.debug-main {
			grid-template-columns: 1fr;
			grid-template-rows: auto 1fr auto;
			gap: 15px;
		}

		.panel {
			min-height: auto;
		}
	}

	@media (max-width: 768px) {
		.arrow-debug-container {
			padding: 10px;
		}

		.debug-header h1 {
			font-size: 1.5rem;
		}

		.panel {
			padding: 15px;
		}
	}
</style>
