<script lang="ts">
	import SettingsCategoryCard from './SettingsCategoryCard.svelte';
	import type { AppSettings } from '../../domain/AppSettings';

	interface CategoryConfig {
		id: string;
		title: string;
		icon: string;
		color: string;
		gradient: string;
		getStatusText: (settings: AppSettings) => string;
	}

	interface Props {
		settings: AppSettings;
		onCategorySelect: (categoryId: string) => void;
	}

	let { settings, onCategorySelect }: Props = $props();

	// Category configurations with colors, gradients, and FontAwesome icons
	const categories: CategoryConfig[] = [
		{
			id: 'Profile',
			title: 'Profile',
			icon: '<i class="fas fa-user"></i>',
			color: '#6366f1',
			gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
			getStatusText: () => 'Signed in' // TODO: Get from auth state
		},
		{
			id: 'PropType',
			title: 'Prop Type',
			icon: '<i class="fas fa-tags"></i>',
			color: '#ec4899',
			gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)',
			getStatusText: (s) => {
				if (s.catDogMode) {
					const blue = s.bluePropType || s.propType || 'Staff';
					const red = s.redPropType || s.propType || 'Staff';
					return `${blue} / ${red}`;
				}
				return s.propType || 'Staff';
			}
		},
		{
			id: 'Background',
			title: 'Background',
			icon: '<i class="fas fa-image"></i>',
			color: '#06b6d4',
			gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
			getStatusText: (s) => {
				const type = s.backgroundType || 'Night Sky';
				const quality = s.backgroundQuality || 'high';
				return `${type} (${quality})`;
			}
		},
		{
			id: 'Visibility',
			title: 'Visibility',
			icon: '<i class="fas fa-eye"></i>',
			color: '#22c55e',
			gradient: 'linear-gradient(135deg, #22c55e, #16a34a)',
			getStatusText: () => {
				// TODO: Count visible elements from visibility settings
				return '5 shown';
			}
		},
		{
			id: 'Accessibility',
			title: 'Miscellaneous',
			icon: '<i class="fas fa-sliders-h"></i>',
			color: '#f97316',
			gradient: 'linear-gradient(135deg, #f97316, #ea580c)',
			getStatusText: (s) => {
				const haptic = s.hapticFeedback ?? true;
				return `Haptic ${haptic ? 'ON' : 'OFF'}`;
			}
		}
	];
</script>

<div class="settings-galaxy">
	<div class="galaxy-header">
		<h1 class="galaxy-title">Settings</h1>
		<p class="galaxy-subtitle">Customize your experience</p>
	</div>

	<div class="galaxy-grid">
		{#each categories as category, index}
			<SettingsCategoryCard
				id={category.id}
				title={category.title}
				icon={category.icon}
				color={category.color}
				gradient={category.gradient}
				statusText={category.getStatusText(settings)}
				{index}
				onclick={() => onCategorySelect(category.id)}
			/>
		{/each}
	</div>
</div>

<style>
	.settings-galaxy {
		width: 100%;
		height: 100%;
		padding: var(--settings-space-lg);
		overflow: hidden; /* No scrolling - fit all cards in view */
		display: flex;
		flex-direction: column;
	}

	/* Header - compact to maximize card space */
	.galaxy-header {
		text-align: center;
		margin-bottom: var(--settings-space-md);
		padding-top: 0;
		flex-shrink: 0;
	}

	.galaxy-title {
		font-size: var(--settings-font-size-h1);
		font-weight: var(--settings-font-weight-bold);
		color: var(--settings-text-primary);
		margin: 0 0 var(--settings-space-xs) 0;
		letter-spacing: var(--settings-letter-spacing-tight);
		background: var(--settings-gradient-primary);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.galaxy-subtitle {
		font-size: var(--settings-font-size-caption);
		font-weight: var(--settings-font-weight-medium);
		color: var(--settings-text-secondary);
		margin: 0;
		letter-spacing: var(--settings-letter-spacing-wide);
	}

	/*
	 * Vertical stack layout - cards fill available height evenly
	 * Using flexbox with flex: 1 on cards to distribute space intentionally
	 */
	.galaxy-grid {
		display: flex;
		flex-direction: column;
		flex: 1; /* Take remaining vertical space */
		gap: 14px;
		width: 100%;
		max-width: 560px;
		margin: 0 auto;
		min-height: 0; /* Allow flex shrinking */
		justify-content: center; /* Center cards if they can't fill all space */
	}

	/* Cards should flex to fill available space evenly with sensible limits */
	.galaxy-grid > :global(.category-card) {
		flex: 1 1 auto;
		min-height: 64px;
		max-height: 120px; /* Allow cards to grow larger to fill space */
	}

	/* Mobile adjustments */
	@media (max-width: 768px) {
		.settings-galaxy {
			padding: var(--settings-space-md);
		}

		.galaxy-header {
			margin-bottom: var(--settings-space-sm);
		}

		.galaxy-title {
			font-size: var(--settings-font-size-h2);
		}

		.galaxy-grid {
			gap: 12px;
		}

		.galaxy-grid > :global(.category-card) {
			min-height: 60px;
			max-height: 110px;
		}
	}

	/* Tall screens - allow cards to fill more space */
	@media (min-height: 700px) {
		.galaxy-grid > :global(.category-card) {
			max-height: 140px;
		}
	}

	/* Very tall screens */
	@media (min-height: 900px) {
		.galaxy-grid > :global(.category-card) {
			max-height: 160px;
		}
	}
</style>
