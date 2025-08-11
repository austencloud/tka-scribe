<!--
NavigationSidebar - Advanced Browse Navigation

Provides sophisticated navigation sections matching desktop functionality:
- Favorites section with quick access
- Date-based navigation (Recently Added)
- Length-based grouping
- Letter-based organization
- Difficulty level sections
- Author groupings

Follows Svelte 5 runes + microservices architecture.
-->
<script lang="ts">
	import type { NavigationItem, NavigationSection } from '$lib/services/interfaces';
	import { slide } from 'svelte/transition';

	// ✅ PURE RUNES: Props using modern Svelte 5 runes
	const {
		sections = [],
		onSectionToggle = () => {},
		onItemClick = () => {},
	} = $props<{
		sections?: NavigationSection[];
		onSectionToggle?: (sectionId: string) => void;
		onItemClick?: (sectionId: string, itemId: string) => void;
	}>();

	// Handle section header click
	function handleSectionClick(section: NavigationSection) {
		onSectionToggle(section.id);
	}

	// Handle navigation item click
	function handleItemClick(section: NavigationSection, item: NavigationItem) {
		onItemClick(section.id, item.id);
	}

	// Get section icon based on type
	function getSectionIcon(section: NavigationSection): string {
		switch (section.type) {
			case 'favorites':
				return '⭐';
			case 'date':
				return '📅';
			case 'length':
				return '📏';
			case 'letter':
				return '🔤';
			case 'level':
				return '📊';
			case 'author':
				return '👤';
			default:
				return '📁';
		}
	}

	// Format item count for display
	function formatCount(count: number): string {
		if (count === 0) return '';
		if (count === 1) return '(1)';
		return `(${count})`;
	}
</script>

<div class="navigation-sidebar">
	<!-- Header -->
	<div class="sidebar-header">
		<h3 class="sidebar-title">Browse Library</h3>
		<div class="sidebar-subtitle">Quick Navigation</div>
	</div>

	<!-- Navigation Sections -->
	<div class="navigation-sections">
		{#each sections as section (section.id)}
			<div class="navigation-section" class:has-items={section.items.length > 0}>
				<!-- Section Header -->
				<button
					class="section-header"
					class:expanded={section.isExpanded}
					onclick={() => handleSectionClick(section)}
					disabled={section.items.length === 0}
				>
					<div class="section-header-content">
						<span class="section-icon">{getSectionIcon(section)}</span>
						<span class="section-title">{section.title}</span>
						<span class="section-count">{formatCount(section.totalCount)}</span>
					</div>

					{#if section.items.length > 0}
						<div class="section-expand-icon" class:rotated={section.isExpanded}>▶</div>
					{/if}
				</button>

				<!-- Section Items -->
				{#if section.isExpanded && section.items.length > 0}
					<div class="section-items" transition:slide={{ duration: 200 }}>
						{#each section.items as item (item.id)}
							<button
								class="navigation-item"
								class:active={item.isActive}
								onclick={() => handleItemClick(section, item)}
							>
								<span class="item-label">{item.label}</span>
								<span class="item-count">{formatCount(item.count)}</span>
							</button>
						{/each}
					</div>
				{/if}
			</div>
		{/each}
	</div>

	<!-- Footer Stats -->
	{#if sections.length > 0}
		{@const totalSequences = sections.reduce(
			(sum: number, section: NavigationSection) => sum + section.totalCount,
			0
		)}
		{@const expandedCount = sections.filter((s: NavigationSection) => s.isExpanded).length}
		<div class="sidebar-footer">
			<div class="footer-stats">
				<div class="stat-item">
					<span class="stat-label">Total Sequences:</span>
					<span class="stat-value">{totalSequences}</span>
				</div>
				<div class="stat-item">
					<span class="stat-label">Sections:</span>
					<span class="stat-value">{expandedCount}/{sections.length}</span>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.navigation-sidebar {
		display: flex;
		flex-direction: column;
		height: 100%;
		width: 280px;
		background: rgba(255, 255, 255, 0.02);
		border-right: var(--glass-border);
		backdrop-filter: blur(10px);
		overflow: hidden;
	}

	/* Header */
	.sidebar-header {
		flex-shrink: 0;
		padding: var(--spacing-lg);
		border-bottom: var(--glass-border);
		background: rgba(255, 255, 255, 0.05);
	}

	.sidebar-title {
		font-size: var(--font-size-lg);
		font-weight: 600;
		color: white;
		margin: 0 0 var(--spacing-xs) 0;
	}

	.sidebar-subtitle {
		font-size: var(--font-size-sm);
		color: rgba(255, 255, 255, 0.7);
		margin: 0;
	}

	/* Navigation Sections */
	.navigation-sections {
		flex: 1;
		overflow-y: auto;
		padding: var(--spacing-sm) 0;
	}

	.navigation-section {
		margin-bottom: var(--spacing-xs);
	}

	.navigation-section:not(.has-items) {
		opacity: 0.5;
	}

	/* Section Header */
	.section-header {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--spacing-sm) var(--spacing-md);
		background: none;
		border: none;
		color: white;
		font-size: var(--font-size-sm);
		font-weight: 500;
		cursor: pointer;
		transition: all var(--transition-fast);
		text-align: left;
	}

	.section-header:not(:disabled):hover {
		background: rgba(255, 255, 255, 0.1);
	}

	.section-header:disabled {
		cursor: default;
	}

	.section-header.expanded {
		background: rgba(255, 255, 255, 0.05);
	}

	.section-header-content {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		flex: 1;
	}

	.section-icon {
		font-size: 14px;
		width: 16px;
		text-align: center;
	}

	.section-title {
		flex: 1;
	}

	.section-count {
		font-size: var(--font-size-xs);
		color: rgba(255, 255, 255, 0.6);
		font-weight: 400;
	}

	.section-expand-icon {
		font-size: 10px;
		color: rgba(255, 255, 255, 0.6);
		transform: rotate(0deg);
		transition: transform var(--transition-fast);
	}

	.section-expand-icon.rotated {
		transform: rotate(90deg);
	}

	/* Section Items */
	.section-items {
		background: rgba(0, 0, 0, 0.2);
		border-top: 1px solid rgba(255, 255, 255, 0.1);
	}

	.navigation-item {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--spacing-xs) var(--spacing-lg);
		background: none;
		border: none;
		color: rgba(255, 255, 255, 0.8);
		font-size: var(--font-size-xs);
		cursor: pointer;
		transition: all var(--transition-fast);
		text-align: left;
	}

	.navigation-item:hover {
		background: rgba(255, 255, 255, 0.05);
		color: white;
	}

	.navigation-item.active {
		background: rgba(var(--primary-color-rgb), 0.2);
		color: var(--primary-color);
		border-left: 2px solid var(--primary-color);
	}

	.item-label {
		flex: 1;
	}

	.item-count {
		font-size: var(--font-size-xs);
		color: rgba(255, 255, 255, 0.5);
		font-weight: 400;
	}

	.navigation-item.active .item-count {
		color: rgba(var(--primary-color-rgb), 0.8);
	}

	/* Footer */
	.sidebar-footer {
		flex-shrink: 0;
		padding: var(--spacing-md);
		border-top: var(--glass-border);
		background: rgba(0, 0, 0, 0.2);
	}

	.footer-stats {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	.stat-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: var(--font-size-xs);
	}

	.stat-label {
		color: rgba(255, 255, 255, 0.7);
	}

	.stat-value {
		color: white;
		font-weight: 500;
	}

	/* Custom scrollbar */
	.navigation-sections::-webkit-scrollbar {
		width: 6px;
	}

	.navigation-sections::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.05);
	}

	.navigation-sections::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.2);
		border-radius: 3px;
	}

	.navigation-sections::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.3);
	}

	/* Responsive Design */
	@media (max-width: 1024px) {
		.navigation-sidebar {
			width: 240px;
		}

		.sidebar-header {
			padding: var(--spacing-md);
		}

		.section-header {
			padding: var(--spacing-xs) var(--spacing-sm);
		}

		.navigation-item {
			padding: var(--spacing-xs) var(--spacing-md);
		}
	}

	@media (max-width: 768px) {
		.navigation-sidebar {
			display: none; /* Hide on mobile - would show in a slide-out drawer */
		}
	}
</style>
