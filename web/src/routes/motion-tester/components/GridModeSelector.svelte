<!--
GridModeSelector.svelte - Grid type selection component

Allows switching between diamond and box grid modes with proper accessibility.
Includes visual icons and clear labels for each mode.
-->
<script lang="ts">
	import type { MotionTesterState } from '../state/motion-tester-state.svelte';

	interface Props {
		state: MotionTesterState;
	}

	let { state }: Props = $props();

	// Event handlers
	function selectDiamond() {
		state.setGridType('diamond');
	}

	function selectBox() {
		state.setGridType('box');
	}

	function handleKeyDown(event: KeyboardEvent) {
		// Arrow keys for navigation between options
		if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
			event.preventDefault();
			selectDiamond();
		} else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
			event.preventDefault();
			selectBox();
		}
		// Number keys for quick selection
		else if (event.key === '1') {
			event.preventDefault();
			selectDiamond();
		} else if (event.key === '2') {
			event.preventDefault();
			selectBox();
		}
	}
</script>

<div 
	class="grid-mode-selector"
	role="radiogroup"
	aria-label="Grid display mode"
	tabindex="-1"
	onkeydown={handleKeyDown}
>
	<div class="selector-header">
		<h3>🔲 Grid Mode</h3>
		<div class="keyboard-hint" aria-label="Keyboard shortcuts">
			<span>1: Diamond</span>
			<span>2: Box</span>
		</div>
	</div>

	<div class="grid-options">
		<button 
			class="grid-btn diamond-btn {state.gridType === 'diamond' ? 'active' : ''}"
			onclick={selectDiamond}
			role="radio"
			aria-checked={state.gridType === 'diamond'}
			aria-label="Diamond grid mode"
			title="Switch to diamond grid layout"
		>
			<span class="grid-icon" aria-hidden="true">◆</span>
			<span class="grid-label">Diamond</span>
			<span class="grid-description">Traditional flow arts grid</span>
		</button>

		<button 
			class="grid-btn box-btn {state.gridType === 'box' ? 'active' : ''}"
			onclick={selectBox}
			role="radio"
			aria-checked={state.gridType === 'box'}
			aria-label="Box grid mode"
			title="Switch to box grid layout"
		>
			<span class="grid-icon" aria-hidden="true">⬜</span>
			<span class="grid-label">Box</span>
			<span class="grid-description">Square grid layout</span>
		</button>
	</div>

	<!-- Visual Preview -->
	<div class="grid-preview" aria-hidden="true">
		<div class="preview-container">
			<div class="preview-grid {state.gridType}">
				{#if state.gridType === 'diamond'}
					<div class="diamond-points">
						<div class="point center"></div>
						<div class="point top"></div>
						<div class="point right"></div>
						<div class="point bottom"></div>
						<div class="point left"></div>
					</div>
				{:else}
					<div class="box-points">
						<div class="point tl"></div>
						<div class="point tr"></div>
						<div class="point bl"></div>
						<div class="point br"></div>
						<div class="point center"></div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.grid-mode-selector {
		background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(99, 102, 241, 0.05));
		border: 1px solid rgba(139, 92, 246, 0.2);
		border-radius: 12px;
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 16px;
		min-height: fit-content;
	}

	.grid-mode-selector:focus-within {
		border-color: rgba(139, 92, 246, 0.4);
		box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.1);
	}

	.selector-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 4px;
	}

	.selector-header h3 {
		margin: 0;
		color: #e0e7ff;
		font-size: 1rem;
		font-weight: 600;
	}

	.keyboard-hint {
		display: flex;
		gap: 8px;
		font-size: 11px;
		color: #a5b4fc;
		opacity: 0.7;
	}

	.keyboard-hint span {
		background: rgba(0, 0, 0, 0.2);
		padding: 2px 6px;
		border-radius: 4px;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	/* Grid Options */
	.grid-options {
		display: flex;
		gap: 12px;
	}

	.grid-btn {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		background: rgba(0, 0, 0, 0.2);
		border: 2px solid rgba(255, 255, 255, 0.2);
		border-radius: 12px;
		color: #e0e7ff;
		padding: 16px 12px;
		cursor: pointer;
		font-size: 13px;
		font-weight: 500;
		transition: all 0.2s ease;
		position: relative;
		overflow: hidden;
	}

	.grid-btn:hover {
		background: rgba(139, 92, 246, 0.15);
		border-color: rgba(139, 92, 246, 0.4);
		transform: translateY(-2px);
	}

	.grid-btn:focus {
		outline: none;
		box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.5);
	}

	.grid-btn.active {
		background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(99, 102, 241, 0.2));
		border-color: rgba(139, 92, 246, 0.6);
		box-shadow: 
			0 0 20px rgba(139, 92, 246, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
		transform: translateY(-1px);
	}

	.grid-btn.active::before {
		content: '';
		position: absolute;
		top: 8px;
		right: 8px;
		width: 16px;
		height: 16px;
		background: #10b981;
		border-radius: 50%;
		border: 2px solid white;
		box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
	}

	.grid-icon {
		font-size: 24px;
		line-height: 1;
		margin-bottom: 4px;
	}

	.grid-label {
		font-weight: 600;
		color: white;
		margin-bottom: 2px;
	}

	.grid-description {
		font-size: 11px;
		color: #a5b4fc;
		text-align: center;
		line-height: 1.2;
	}

	/* Grid Preview */
	.grid-preview {
		margin-top: 8px;
		padding-top: 16px;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
	}

	.preview-container {
		display: flex;
		justify-content: center;
	}

	.preview-grid {
		width: 80px;
		height: 80px;
		position: relative;
		background: rgba(0, 0, 0, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.point {
		width: 6px;
		height: 6px;
		background: #a5b4fc;
		border-radius: 50%;
		position: absolute;
		transition: all 0.3s ease;
		box-shadow: 0 0 6px rgba(165, 180, 252, 0.4);
	}

	/* Diamond layout */
	.diamond-points .center { top: 50%; left: 50%; transform: translate(-50%, -50%); }
	.diamond-points .top { top: 15%; left: 50%; transform: translate(-50%, -50%); }
	.diamond-points .right { top: 50%; right: 15%; transform: translate(50%, -50%); }
	.diamond-points .bottom { bottom: 15%; left: 50%; transform: translate(-50%, 50%); }
	.diamond-points .left { top: 50%; left: 15%; transform: translate(-50%, -50%); }

	/* Box layout */
	.box-points .center { top: 50%; left: 50%; transform: translate(-50%, -50%); }
	.box-points .tl { top: 20%; left: 20%; }
	.box-points .tr { top: 20%; right: 20%; }
	.box-points .bl { bottom: 20%; left: 20%; }
	.box-points .br { bottom: 20%; right: 20%; }

	/* Responsive Design */
	@media (max-width: 768px) {
		.grid-mode-selector {
			padding: 12px;
			gap: 12px;
		}

		.keyboard-hint {
			display: none; /* Hide on mobile */
		}

		.grid-btn {
			padding: 12px 8px;
		}

		.grid-description {
			display: none; /* Hide descriptions on mobile */
		}

		.grid-preview {
			display: none; /* Hide preview on mobile to save space */
		}

		.selector-header h3 {
			font-size: 0.9rem;
		}
	}

	/* High contrast mode */
	@media (prefers-contrast: high) {
		.grid-mode-selector {
			border: 2px solid white;
			background: rgba(0, 0, 0, 0.8);
		}

		.grid-btn {
			border: 2px solid white;
		}

		.grid-btn.active {
			background: white;
			color: black;
		}

		.point {
			background: white;
		}
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.grid-btn {
			transition: none;
		}

		.point {
			transition: none;
		}
	}
</style>
