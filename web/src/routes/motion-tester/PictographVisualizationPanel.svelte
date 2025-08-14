<!--
PictographVisualizationPanel.svelte - Redesigned with component composition

Clean, modular visualization panel that composes focused sub-components
for better organization, accessibility, and responsive design.
-->
<script lang="ts">
	import type { MotionTesterState } from './state/motion-tester-state.svelte';
	
	// Import the new focused components
	import MotionVisualizationControls from './components/MotionVisualizationControls.svelte';
	import GridModeSelector from './components/GridModeSelector.svelte';
	import CompactPictographDisplay from './components/CompactPictographDisplay.svelte';
	import PropStateIndicators from './components/PropStateIndicators.svelte';
	import MotionSummaryCard from './components/MotionSummaryCard.svelte';

	interface Props {
		state: MotionTesterState;
	}

	let { state: motionState }: Props = $props();

	// Local state for panel layout management
	let showAdvancedControls = $state(true);
	let layoutMode = $state<'default' | 'compact' | 'focus'>('default');

	// Panel visibility toggles for responsive design
	let showPropStates = $state(true);
	let showMotionSummary = $state(true);

	// Layout functions
	function toggleAdvancedControls() {
		showAdvancedControls = !showAdvancedControls;
	}

	function setLayoutMode(mode: 'default' | 'compact' | 'focus') {
		layoutMode = mode;
		
		// Adjust panel visibility based on layout mode
		if (mode === 'compact') {
			showPropStates = false;
			showMotionSummary = true;
		} else if (mode === 'focus') {
			showPropStates = false;
			showMotionSummary = false;
		} else {
			showPropStates = true;
			showMotionSummary = true;
		}
	}

	function togglePropStates() {
		showPropStates = !showPropStates;
	}

	function toggleMotionSummary() {
		showMotionSummary = !showMotionSummary;
	}

	// Keyboard shortcuts for layout management
	function handleKeyDown(event: KeyboardEvent) {
		if (event.altKey) {
			switch (event.key) {
				case '1':
					event.preventDefault();
					setLayoutMode('default');
					break;
				case '2':
					event.preventDefault();
					setLayoutMode('compact');
					break;
				case '3':
					event.preventDefault();
					setLayoutMode('focus');
					break;
			}
		}
		
		switch (event.key) {
			case 'a':
			case 'A':
				if (event.shiftKey) {
					event.preventDefault();
					toggleAdvancedControls();
				}
				break;
			case 'p':
			case 'P':
				event.preventDefault();
				togglePropStates();
				break;
			case 'm':
			case 'M':
				event.preventDefault();
				toggleMotionSummary();
				break;
		}
	}
</script>

<div 
	class="pictograph-visualization-panel"
	class:compact={layoutMode === 'compact'}
	class:focus={layoutMode === 'focus'}
	role="region"
	aria-label="Motion visualization panel"
	tabindex="-1"
	onkeydown={handleKeyDown}
>
	<!-- Panel Header with Layout Controls -->
	<header class="panel-header">
		<div class="header-title">
			<h2>🎬 Motion Visualization</h2>
			<span class="layout-indicator">{layoutMode}</span>
		</div>
		
		<div class="layout-controls" role="group" aria-label="Layout controls">
			<div class="layout-modes">
				<button
					class="layout-btn {layoutMode === 'default' ? 'active' : ''}"
					onclick={() => setLayoutMode('default')}
					aria-pressed={layoutMode === 'default'}
					title="Default layout (Alt+1)"
				>
					<span aria-hidden="true">📋</span>
					<span class="btn-text">Full</span>
				</button>
				
				<button
					class="layout-btn {layoutMode === 'compact' ? 'active' : ''}"
					onclick={() => setLayoutMode('compact')}
					aria-pressed={layoutMode === 'compact'}
					title="Compact layout (Alt+2)"
				>
					<span aria-hidden="true">📐</span>
					<span class="btn-text">Compact</span>
				</button>
				
				<button
					class="layout-btn {layoutMode === 'focus' ? 'active' : ''}"
					onclick={() => setLayoutMode('focus')}
					aria-pressed={layoutMode === 'focus'}
					title="Focus layout (Alt+3)"
				>
					<span aria-hidden="true">🎯</span>
					<span class="btn-text">Focus</span>
				</button>
			</div>

			<div class="panel-toggles">
				<button
					class="toggle-btn {showAdvancedControls ? 'active' : ''}"
					onclick={toggleAdvancedControls}
					aria-pressed={showAdvancedControls}
					title="Toggle advanced controls (Shift+A)"
				>
					⚙️
				</button>
			</div>
		</div>
	</header>

	<!-- Main Content Area -->
	<main class="panel-content">
		<!-- Top Row: Controls and Grid Selector -->
		<div class="controls-row">
			<div class="control-section animation-section">
				<MotionVisualizationControls motionState={motionState} />
			</div>
			
			<div class="control-section grid-section">
				<GridModeSelector state={motionState} />
			</div>
		</div>

		<!-- Middle Row: Pictograph Display -->
		<div class="visualization-row">
			<CompactPictographDisplay motionState={motionState} />
		</div>


	</main>


</div>

<style>
	.pictograph-visualization-panel {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.02));
		border-radius: 12px;
		overflow: hidden;
		position: relative;
	}

	.pictograph-visualization-panel:focus-within {
		outline: 2px solid rgba(99, 102, 241, 0.3);
		outline-offset: 2px;
	}

	/* Panel Header */
	.panel-header {
		background: linear-gradient(135deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.1));
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		padding: 12px 16px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 16px;
		flex-shrink: 0;
	}

	.header-title {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.panel-header h2 {
		margin: 0;
		color: #e0e7ff;
		font-size: 1.1rem;
		font-weight: 700;
		background: linear-gradient(135deg, #6366f1, #8b5cf6);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.layout-indicator {
		font-size: 11px;
		color: #a5b4fc;
		background: rgba(0, 0, 0, 0.2);
		padding: 2px 6px;
		border-radius: 4px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.layout-controls {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.layout-modes {
		display: flex;
		gap: 4px;
	}

	.layout-btn {
		display: flex;
		align-items: center;
		gap: 4px;
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 6px;
		color: #c7d2fe;
		padding: 6px 10px;
		cursor: pointer;
		font-size: 11px;
		font-weight: 500;
		transition: all 0.2s ease;
	}

	.layout-btn:hover {
		background: rgba(99, 102, 241, 0.2);
		border-color: rgba(99, 102, 241, 0.4);
	}

	.layout-btn:focus {
		outline: none;
		box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5);
	}

	.layout-btn.active {
		background: rgba(99, 102, 241, 0.3);
		border-color: rgba(99, 102, 241, 0.5);
		color: white;
	}

	.btn-text {
		font-size: 10px;
	}

	.panel-toggles {
		display: flex;
		gap: 4px;
	}

	.toggle-btn {
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 6px;
		color: #c7d2fe;
		padding: 6px 8px;
		cursor: pointer;
		font-size: 12px;
		transition: all 0.2s ease;
		min-width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.toggle-btn:hover {
		background: rgba(139, 92, 246, 0.2);
		border-color: rgba(139, 92, 246, 0.4);
	}

	.toggle-btn:focus {
		outline: none;
		box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.5);
	}

	.toggle-btn.active {
		background: rgba(139, 92, 246, 0.3);
		border-color: rgba(139, 92, 246, 0.5);
		color: white;
	}

	/* Main Content */
	.panel-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 16px;
		min-height: 0;
		overflow-y: auto;
	}

	/* Layout Rows */
	.controls-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
		flex-shrink: 0;
	}

	.visualization-row {
		flex: 1;
		min-height: 300px;
		display: flex;
	}

	.info-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
		flex-shrink: 0;
	}

	.control-section,
	.info-section {
		min-height: fit-content;
	}

	/* Layout Mode Adaptations */
	.pictograph-visualization-panel.compact .controls-row {
		grid-template-columns: 2fr 1fr;
	}

	.pictograph-visualization-panel.compact .info-row {
		grid-template-columns: 1fr;
	}

	.pictograph-visualization-panel.focus .controls-row {
		display: none;
	}

	.pictograph-visualization-panel.focus .visualization-row {
		min-height: 400px;
	}

	/* Quick Toggles */
	.quick-toggles {
		position: absolute;
		bottom: 16px;
		right: 16px;
		display: flex;
		gap: 8px;
		z-index: 10;
	}

	.quick-toggle {
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 8px;
		color: white;
		padding: 8px;
		cursor: pointer;
		font-size: 14px;
		transition: all 0.2s ease;
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.quick-toggle:hover {
		background: rgba(99, 102, 241, 0.6);
		transform: translateY(-2px);
	}

	.quick-toggle:focus {
		outline: none;
		box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5);
	}

	.quick-toggle.active {
		background: rgba(99, 102, 241, 0.8);
	}

	/* Keyboard Help */
	.keyboard-help {
		background: rgba(0, 0, 0, 0.1);
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		padding: 12px 16px;
		color: #a5b4fc;
		flex-shrink: 0;
	}

	.keyboard-help details summary {
		cursor: pointer;
		font-size: 12px;
		user-select: none;
		padding: 4px;
	}

	.shortcuts-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		gap: 16px;
		margin-top: 8px;
	}

	.shortcut-group h4 {
		margin: 0 0 6px 0;
		font-size: 11px;
		color: #c7d2fe;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.shortcut-group ul {
		margin: 0;
		padding: 0;
		list-style: none;
		font-size: 10px;
	}

	.shortcut-group li {
		margin: 2px 0;
	}

	.keyboard-help kbd {
		background: rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 3px;
		padding: 1px 4px;
		font-size: 9px;
	}

	/* Responsive Design */
	@media (max-width: 1200px) {
		.controls-row {
			grid-template-columns: 1fr;
			gap: 12px;
		}

		.info-row {
			grid-template-columns: 1fr;
			gap: 12px;
		}

		.panel-content {
			padding: 12px;
			gap: 12px;
		}
	}

	@media (max-width: 768px) {
		.panel-header {
			padding: 8px 12px;
		}

		.layout-modes .btn-text {
			display: none;
		}

		.panel-header h2 {
			font-size: 1rem;
		}

		.keyboard-help {
			display: none;
		}

		.quick-toggles {
			bottom: 12px;
			right: 12px;
		}

		.visualization-row {
			min-height: 250px;
		}
	}

	/* High contrast mode */
	@media (prefers-contrast: high) {
		.pictograph-visualization-panel {
			border: 2px solid white;
		}

		.panel-header {
			border-bottom: 2px solid white;
		}

		.layout-btn,
		.toggle-btn,
		.quick-toggle {
			border: 2px solid white;
		}

		.keyboard-help {
			border-top: 2px solid white;
		}
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.layout-btn,
		.toggle-btn,
		.quick-toggle {
			transition: none;
		}

		.quick-toggle:hover {
			transform: none;
		}
	}

	/* Scrollbar styling */
	.panel-content::-webkit-scrollbar {
		width: 6px;
	}

	.panel-content::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 3px;
	}

	.panel-content::-webkit-scrollbar-thumb {
		background: rgba(99, 102, 241, 0.5);
		border-radius: 3px;
	}

	.panel-content::-webkit-scrollbar-thumb:hover {
		background: rgba(99, 102, 241, 0.7);
	}
</style>
