<script lang="ts">
	import { fly, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	interface Props {
		id: string;
		title: string;
		icon: string;
		color: string;
		gradient: string;
		statusText: string;
		index?: number;
		onclick?: () => void;
	}

	let { id, title, icon, color, gradient, statusText, index = 0, onclick }: Props = $props();

	// 3D tilt effect state
	let tiltX = $state(0);
	let tiltY = $state(0);

	function handleMouseMove(event: MouseEvent) {
		const card = event.currentTarget as HTMLElement;
		const rect = card.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;

		// Calculate tilt based on mouse position (max 10 degrees)
		const centerX = rect.width / 2;
		const centerY = rect.height / 2;
		tiltY = ((x - centerX) / centerX) * 5; // Horizontal tilt
		tiltX = ((centerY - y) / centerY) * 5; // Vertical tilt (inverted)
	}

	function handleMouseLeave() {
		tiltX = 0;
		tiltY = 0;
	}
</script>

<button
	class="category-card settings-glass-card settings-shimmer"
	data-category-id={id}
	in:scale={{ delay: index * 50, duration: 400, easing: quintOut }}
	style="--tilt-x: {tiltX}deg; --tilt-y: {tiltY}deg; --stagger-index: {index}; --category-color: {color}; --category-gradient: {gradient}"
	onmousemove={handleMouseMove}
	onmouseleave={handleMouseLeave}
	{onclick}
>
	<!-- Color accent overlay -->
	<div class="color-accent"></div>

	<!-- Unified card content -->
	<div class="category-card-body">
		<div class="card-icon-large">
			{@html icon}
		</div>
		<div class="card-text">
			<h3 class="card-title">{title}</h3>
			<p class="card-status">{statusText}</p>
		</div>
	</div>

	<!-- Hover shine effect -->
	<div class="card-shine"></div>

	<!-- Selection indicator (shows when active detail view) -->
	<div class="selection-ring"></div>
</button>

<style>
	.category-card {
		position: relative;
		width: 100%;
		cursor: pointer;
		overflow: hidden;
		transition: all var(--settings-transition-base) var(--settings-ease-out);
		display: flex;
		flex-direction: row;
		align-items: center;
		padding: 0;
		border: none;
	}

	/* Hover effects - subtle horizontal shift */
	.category-card:hover {
		transform: translateX(6px);
		box-shadow:
			var(--settings-shadow-lg),
			0 8px 24px -8px color-mix(in srgb, var(--category-color) 30%, transparent),
			inset 0 1px 0 rgba(255, 255, 255, 0.12);
		border-color: color-mix(in srgb, var(--category-color) 25%, var(--settings-glass-border-active));
	}

	.category-card:active {
		transform: translateX(3px) scale(0.99);
		transition-duration: var(--settings-transition-fast);
	}

	/* Focus state for keyboard navigation */
	.category-card:focus-visible {
		outline: 2px solid var(--settings-primary-indigo);
		outline-offset: 2px;
		border-color: var(--settings-glass-border-active);
	}

	/* Color accent overlay */
	.color-accent {
		position: absolute;
		inset: 0;
		background: var(--category-gradient);
		opacity: 0.05;
		pointer-events: none;
		transition: opacity var(--settings-transition-base);
	}

	.category-card:hover .color-accent {
		opacity: 0.1;
	}

	/* Horizontal card content layout - fills height naturally */
	.category-card-body {
		width: 100%;
		height: 100%;
		padding: 18px 24px;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: flex-start;
		text-align: left;
		gap: 20px;
		position: relative;
	}

	.card-icon-large {
		font-size: 32px;
		line-height: 1;
		color: var(--category-color);
		filter: drop-shadow(0 2px 6px color-mix(in srgb, var(--category-color) 35%, transparent));
		transition:
			transform var(--settings-transition-base) var(--settings-ease-spring),
			filter var(--settings-transition-base);
		flex-shrink: 0;
		width: 40px;
		text-align: center;
	}

	.category-card:hover .card-icon-large {
		transform: scale(1.12);
		filter: drop-shadow(0 4px 10px color-mix(in srgb, var(--category-color) 50%, transparent));
	}

	.card-text {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 3px;
		flex: 1;
		min-width: 0; /* Allow text truncation */
	}

	.card-title {
		font-size: 18px;
		font-weight: var(--settings-font-weight-semibold);
		color: var(--settings-text-primary);
		margin: 0;
		letter-spacing: var(--settings-letter-spacing-tight);
		transition: color var(--settings-transition-base);
	}

	.category-card:hover .card-title {
		color: color-mix(in srgb, var(--category-color) 70%, var(--settings-text-primary));
	}

	.card-status {
		font-size: 15px;
		font-weight: var(--settings-font-weight-normal);
		color: var(--settings-text-secondary);
		margin: 0;
		letter-spacing: var(--settings-letter-spacing-wide);
		opacity: 0.7;
		transition: opacity var(--settings-transition-base);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 100%;
	}

	.category-card:hover .card-status {
		opacity: 0.9;
	}

	/* Shine effect (animated on hover) */
	.card-shine {
		position: absolute;
		inset: 0;
		background: var(--settings-shimmer-gradient);
		opacity: 0;
		transition: opacity var(--settings-transition-fast);
		pointer-events: none;
	}

	.category-card:hover .card-shine {
		opacity: 1;
		animation: shimmer 1.2s ease-in-out;
	}

	@keyframes shimmer {
		0% {
			transform: translateX(-100%) translateY(-100%);
		}
		100% {
			transform: translateX(100%) translateY(100%);
		}
	}

	/* Selection ring (reserved for future active state functionality) */
	.selection-ring {
		position: absolute;
		inset: -2px;
		border: 2px solid transparent;
		border-radius: var(--settings-radius-lg);
		pointer-events: none;
		transition: border-color var(--settings-transition-base);
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.category-card,
		.card-icon-large,
		.card-shine {
			animation: none !important;
			transition-duration: 0ms !important;
		}

		.category-card:hover {
			transform: none;
		}
	}
</style>
