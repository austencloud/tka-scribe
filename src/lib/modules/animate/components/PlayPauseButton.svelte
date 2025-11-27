<!--
PlayPauseButton.svelte

Floating play/pause button overlay for animation canvas.
Positioned at bottom center of canvas with glassmorphism styling.
-->
<script lang="ts">
	let {
		isPlaying = false,
		onToggle = () => {},
		style = "",
	}: {
		isPlaying?: boolean;
		onToggle?: () => void;
		style?: string;
	} = $props();
</script>

<button
	class="play-pause-btn"
	{style}
	onclick={onToggle}
	aria-label={isPlaying ? "Pause animation" : "Play animation"}
	type="button"
>
	<i class="fas" class:fa-pause={isPlaying} class:fa-play={!isPlaying}></i>
</button>

<style>
	/* Play/Pause button positioned on the canvas */
	.play-pause-btn {
		position: absolute;
		z-index: 15;
		width: 48px;
		height: 48px;
		border: none;
		border-radius: 50%;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition:
			background 0.2s ease,
			box-shadow 0.2s ease;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
		/* Fallback positioning - can be overridden by style prop */
		bottom: 16px;
		left: 50%;
		transform: translateX(-50%);
	}

	.play-pause-btn:hover {
		background: rgba(0, 0, 0, 0.7);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
	}

	.play-pause-btn:active {
		background: rgba(0, 0, 0, 0.8);
	}

	.play-pause-btn i {
		font-size: 18px;
		color: white;
	}

	.play-pause-btn i.fa-play {
		margin-left: 3px; /* Visually center the play icon */
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.play-pause-btn {
			transition: none;
		}
	}
</style>
