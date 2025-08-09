<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let option: any;
	export let visualType: string = '';

	const dispatch = createEventDispatcher();

	function handleClick() {
		dispatch('selected', option.value || option.label);
	}

	// Get button styling based on option type
	function getButtonStyle(option: any, visualType: string) {
		let style = '';
		
		if (option.color) {
			style += `--button-accent: ${option.color}; `;
		}
		
		if (visualType === 'difficulty') {
			const colors = {
				1: '#10b981', // green
				2: '#f59e0b', // yellow
				3: '#ef4444', // red
				4: '#8b5cf6'  // purple
			};
			style += `--button-accent: ${colors[option.value] || '#6366f1'}; `;
		}
		
		return style;
	}
</script>

<button 
	class="category-button"
	class:visual={visualType}
	class:has-icon={option.icon}
	style={getButtonStyle(option, visualType)}
	on:click={handleClick}
	type="button"
>
	{#if option.icon}
		<span class="button-icon">{option.icon}</span>
	{/if}
	
	<span class="button-label">{option.label}</span>
	
	{#if visualType === 'difficulty'}
		<div class="difficulty-indicator">
			{#each Array(option.value) as _}
				<div class="difficulty-dot"></div>
			{/each}
		</div>
	{/if}
</button>

<style>
	.category-button {
		--button-accent: var(--primary-color);
		
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-xs);
		
		padding: var(--spacing-md);
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		cursor: pointer;
		transition: all var(--transition-fast);
		
		font-family: inherit;
		font-size: var(--font-size-sm);
		font-weight: 500;
		color: var(--foreground);
		
		min-height: 60px;
		position: relative;
		overflow: hidden;
	}

	.category-button::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(135deg, var(--button-accent), transparent);
		opacity: 0;
		transition: opacity var(--transition-fast);
		z-index: 0;
	}

	.category-button:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: var(--button-accent);
		box-shadow: 
			0 4px 16px rgba(0, 0, 0, 0.1),
			0 0 0 1px var(--button-accent),
			0 0 20px rgba(var(--button-accent-rgb, 99, 102, 241), 0.3);
		transform: translateY(-2px);
	}

	.category-button:hover::before {
		opacity: 0.1;
	}

	.category-button:active {
		transform: translateY(0);
		box-shadow: 
			0 2px 8px rgba(0, 0, 0, 0.1),
			0 0 0 1px var(--button-accent);
	}

	/* Visual type buttons (larger, more prominent) */
	.category-button.visual {
		min-height: 80px;
		padding: var(--spacing-lg);
	}

	.category-button.visual.has-icon {
		min-height: 100px;
	}

	/* Button Icon */
	.button-icon {
		font-size: var(--font-size-xl);
		margin-bottom: var(--spacing-xs);
		z-index: 1;
		position: relative;
	}

	.visual .button-icon {
		font-size: var(--font-size-2xl);
	}

	/* Button Label */
	.button-label {
		text-align: center;
		line-height: 1.3;
		z-index: 1;
		position: relative;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 100%;
	}

	/* Difficulty Indicator */
	.difficulty-indicator {
		display: flex;
		gap: 2px;
		margin-top: var(--spacing-xs);
		z-index: 1;
		position: relative;
	}

	.difficulty-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--button-accent);
		opacity: 0.8;
		animation: difficultyPulse 2s ease-in-out infinite;
	}

	.difficulty-dot:nth-child(2) {
		animation-delay: 0.2s;
	}

	.difficulty-dot:nth-child(3) {
		animation-delay: 0.4s;
	}

	.difficulty-dot:nth-child(4) {
		animation-delay: 0.6s;
	}

	/* Animations */
	@keyframes difficultyPulse {
		0%, 100% {
			opacity: 0.8;
			transform: scale(1);
		}
		50% {
			opacity: 1;
			transform: scale(1.2);
		}
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.category-button {
			min-height: 50px;
			padding: var(--spacing-sm);
			font-size: var(--font-size-xs);
		}

		.category-button.visual {
			min-height: 70px;
		}

		.category-button.visual.has-icon {
			min-height: 80px;
		}

		.button-icon {
			font-size: var(--font-size-lg);
		}

		.visual .button-icon {
			font-size: var(--font-size-xl);
		}
	}

	@media (max-width: 480px) {
		.button-label {
			font-size: var(--font-size-xs);
		}
	}
</style>
