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
			title: 'Accessibility',
			icon: '<i class="fas fa-universal-access"></i>',
			color: '#f97316',
			gradient: 'linear-gradient(135deg, #f97316, #ea580c)',
			getStatusText: (s) => {
				const haptic = s.hapticFeedback ?? true;
				const motion = s.reducedMotion ?? false;
				return `Haptic ${haptic ? 'ON' : 'OFF'}`;
			}
		},
		{
			id: 'Cache',
			title: 'Cache',
			icon: '<i class="fas fa-database"></i>',
			color: '#a855f7',
			gradient: 'linear-gradient(135deg, #a855f7, #9333ea)',
			getStatusText: () => 'OK' // TODO: Get from cache service
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
		padding: var(--settings-container-padding);
		overflow-y: auto;
		overflow-x: hidden;
		container-type: inline-size;
		container-name: settings-galaxy;
	}

	/* Header */
	.galaxy-header {
		text-align: center;
		margin-bottom: var(--settings-space-2xl);
		padding-top: var(--settings-space-lg);
	}

	.galaxy-title {
		font-size: var(--settings-font-size-hero);
		font-weight: var(--settings-font-weight-bold);
		color: var(--settings-text-primary);
		margin: 0 0 var(--settings-space-sm) 0;
		letter-spacing: var(--settings-letter-spacing-tight);
		background: var(--settings-gradient-primary);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.galaxy-subtitle {
		font-size: var(--settings-font-size-body);
		font-weight: var(--settings-font-weight-medium);
		color: var(--settings-text-secondary);
		margin: 0;
		letter-spacing: var(--settings-letter-spacing-wide);
	}

	/* Grid layout - container query responsive */
	.galaxy-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
		gap: var(--settings-grid-gap);
		width: 100%;
		justify-items: center;
	}

	/* Container queries for true responsive behavior */
	@container (min-width: 400px) and (max-width: 599px) {
		.galaxy-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: var(--settings-grid-gap-mobile);
		}
	}

	@container (min-width: 600px) and (max-width: 899px) {
		.galaxy-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@container (min-width: 900px) and (max-width: 1199px) {
		.galaxy-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	@container (min-width: 1200px) {
		.galaxy-grid {
			grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
			max-width: 1400px;
			margin: 0 auto;
		}
	}

	/* Mobile adjustments */
	@media (max-width: 768px) {
		.settings-galaxy {
			padding: var(--settings-container-padding-mobile);
		}

		.galaxy-header {
			margin-bottom: var(--settings-space-xl);
			padding-top: var(--settings-space-md);
		}

		.galaxy-title {
			font-size: var(--settings-font-size-h1);
		}

		.galaxy-subtitle {
			font-size: var(--settings-font-size-caption);
		}

		/* Mobile: Try to fit 2 columns if there's enough space, otherwise 1 */
		.galaxy-grid {
			grid-template-columns: repeat(auto-fit, minmax(min(140px, 100%), 1fr));
			gap: var(--settings-grid-gap-mobile);
		}
	}

	/* Very small mobile: force single column */
	@media (max-width: 360px) {
		.galaxy-grid {
			grid-template-columns: 1fr;
		}
	}

	/* Smooth scrolling */
	.settings-galaxy {
		scroll-behavior: smooth;
	}

	/* Custom scrollbar for webkit browsers */
	.settings-galaxy::-webkit-scrollbar {
		width: 8px;
	}

	.settings-galaxy::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.05);
		border-radius: 4px;
	}

	.settings-galaxy::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.2);
		border-radius: 4px;
	}

	.settings-galaxy::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.3);
	}
</style>
