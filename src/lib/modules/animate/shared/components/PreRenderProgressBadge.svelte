<!--
PreRenderProgressBadge.svelte

Displays pre-render progress indicator or perfect playback badge.
Shows optimization progress during pre-rendering, then briefly shows
success badge when complete.
-->
<script lang="ts">
	  import type { PreRenderProgress } from './../../services/implementations/SequenceFramePreRenderer.ts';

	let {
		isPreRendering = false,
		progress = null,
		isReady = false,
	}: {
		isPreRendering?: boolean;
		progress?: PreRenderProgress | null;
		isReady?: boolean;
	} = $props();
</script>

{#if isPreRendering && progress}
	<div class="pre-render-badge">
		<div class="badge-content">
			<div class="spinner-small"></div>
			<span>Optimizing... {Math.round(progress.percent)}%</span>
		</div>
		<div class="progress-bar">
			<div class="progress-fill" style="width: {progress.percent}%"></div>
		</div>
	</div>
{/if}

{#if isReady}
	<div class="perfect-mode-badge">Perfect Playback</div>
{/if}

<style>
	.pre-render-badge {
		position: absolute;
		top: 12px;
		right: 12px;
		background: rgba(0, 0, 0, 0.85);
		backdrop-filter: blur(8px);
		color: white;
		padding: 8px 12px;
		border-radius: 8px;
		font-size: 11px;
		font-weight: 500;
		z-index: 10;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
		min-width: 140px;
	}

	.badge-content {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 6px;
	}

	.spinner-small {
		width: 12px;
		height: 12px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.progress-bar {
		width: 100%;
		height: 3px;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 2px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #4ade80, #22c55e);
		transition: width 0.3s ease;
	}

	.perfect-mode-badge {
		position: absolute;
		top: 12px;
		right: 12px;
		background: linear-gradient(135deg, #22c55e, #16a34a);
		color: white;
		padding: 6px 12px;
		border-radius: 6px;
		font-size: 11px;
		font-weight: 600;
		z-index: 10;
		box-shadow: 0 2px 8px rgba(34, 197, 94, 0.4);
		animation: fadeInOut 3s ease forwards;
	}

	@keyframes fadeInOut {
		0% {
			opacity: 0;
			transform: translateY(-10px);
		}
		10% {
			opacity: 1;
			transform: translateY(0);
		}
		90% {
			opacity: 1;
			transform: translateY(0);
		}
		100% {
			opacity: 0;
			transform: translateY(-10px);
		}
	}
</style>
