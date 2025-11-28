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
	<div class="card-content">
		<div class="card-icon-large">
			{@html icon}
		</div>
		<h3 class="card-title">{title}</h3>
		<p class="card-status">{statusText}</p>
	</div>

	<!-- Hover shine effect -->
	<div class="card-shine"></div>

	<!-- Selection indicator (shows when active detail view) -->
	<div class="selection-ring"></div>
</button>

<style>
	.category-card {
		position: relative;
		width: var(--settings-card-width);
		height: var(--settings-card-height);
		cursor: pointer;
		overflow: hidden;
		transform-style: preserve-3d;
		transition: all var(--settings-transition-base) var(--settings-ease-out);
		display: flex;
		flex-direction: column;
		padding: 0;
		border: none;
	}

	/* Hover effects */
	.category-card:hover {
		transform: translateY(-8px) scale(1.03)
			perspective(1000px)
			rotateX(var(--tilt-x, 0deg))
			rotateY(var(--tilt-y, 0deg));
		box-shadow:
			var(--settings-shadow-xl),
			0 20px 40px -12px color-mix(in srgb, var(--category-color) 35%, transparent),
			inset 0 1px 0 rgba(255, 255, 255, 0.15);
		border-color: color-mix(in srgb, var(--category-color) 30%, var(--settings-glass-border-active));
	}

	.category-card:active {
		transform: translateY(-6px) scale(0.98);
		transition-duration: var(--settings-transition-fast);
	}

	/* Focus state for keyboard navigation */
	.category-card:focus-visible {
		outline: 2px solid var(--settings-primary-indigo);
		outline-offset: 4px;
		border-color: var(--settings-glass-border-active);
	}

	/* Color accent overlay */
	.color-accent {
		position: absolute;
		inset: 0;
		background: var(--category-gradient);
		opacity: 0.06;
		pointer-events: none;
		transition: opacity var(--settings-transition-base);
	}

	.category-card:hover .color-accent {
		opacity: 0.12;
	}

	/* Unified card content */
	.card-content {
		width: 100%;
		height: 100%;
		padding: var(--settings-space-xl);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		gap: var(--settings-space-lg);
		position: relative;
	}

	.card-icon-large {
		font-size: 56px;
		line-height: 1;
		color: var(--category-color);
		filter: drop-shadow(0 4px 12px color-mix(in srgb, var(--category-color) 40%, transparent));
		transition:
			transform var(--settings-transition-base) var(--settings-ease-spring),
			filter var(--settings-transition-base);
	}

	.category-card:hover .card-icon-large {
		transform: scale(1.1) translateY(-4px);
		filter: drop-shadow(0 8px 16px color-mix(in srgb, var(--category-color) 60%, transparent));
	}

	.card-title {
		font-size: var(--settings-font-size-h2);
		font-weight: var(--settings-font-weight-bold);
		color: var(--settings-text-primary);
		margin: 0;
		letter-spacing: var(--settings-letter-spacing-tight);
		transition: color var(--settings-transition-base);
	}

	.category-card:hover .card-title {
		color: color-mix(in srgb, var(--category-color) 80%, var(--settings-text-primary));
	}

	.card-status {
		font-size: var(--settings-font-size-body);
		font-weight: var(--settings-font-weight-medium);
		color: var(--settings-text-secondary);
		margin: 0;
		letter-spacing: var(--settings-letter-spacing-wide);
		opacity: 0.8;
		transition: opacity var(--settings-transition-base);
	}

	.category-card:hover .card-status {
		opacity: 1;
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
		animation: shimmer 1.5s ease-in-out;
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

	/* Mobile responsive */
	@media (max-width: 768px) {
		.category-card {
			width: var(--settings-card-width-mobile);
			height: var(--settings-card-height-mobile);
		}

		.card-content {
			padding: var(--settings-space-lg);
			gap: var(--settings-space-md);
		}

		.card-icon-large {
			font-size: 48px;
		}

		.card-title {
			font-size: var(--settings-font-size-h3);
		}

		.card-status {
			font-size: var(--settings-font-size-caption);
		}

		/* Disable 3D tilt on mobile (performance) */
		.category-card:hover {
			transform: translateY(-4px) scale(1.02);
		}

		.category-card:hover .card-icon-large {
			transform: scale(1.1) translateY(-4px);
		}
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
