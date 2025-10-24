<script lang="ts">
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import TabsNavigation from './TabsNavigation.svelte';
	import { activeTabStore } from '../../stores/ui/settingsStore';
	import { get } from 'svelte/store';

	// Define better types for our settings
	type BaseSetting = {
		label: string;
	};

	type ToggleSetting = BaseSetting & {
		type: 'toggle';
		defaultValue: boolean;
	};

	type NumberSetting = BaseSetting & {
		type: 'number';
		defaultValue: number;
		min: number;
		max: number;
	};

	type RangeSetting = BaseSetting & {
		type: 'range';
		defaultValue: number;
		min: number;
		max: number;
	};

	type SelectSetting = BaseSetting & {
		type: 'select';
		defaultValue: string;
		options: string[];
	};

	// Union type of all settings
	type Setting = ToggleSetting | NumberSetting | RangeSetting | SelectSetting;

	// Section type
	type Section = {
		id: string;
		icon: string;
		settings: Setting[];
	};

	// Define sections with Font Awesome class strings
	const sections: Record<string, Section> = {
		Construct: {
			id: 'construct',
			icon: 'fa-solid fa-hammer',
			settings: [
				{ label: 'Sequence Mode', type: 'toggle', defaultValue: true },
				{ label: 'Grid Snap', type: 'toggle', defaultValue: false },
				{ label: 'Max Sequence Length', type: 'number', defaultValue: 64, min: 1, max: 128 },
				{
					label: 'Default Prop Type',
					type: 'select',
					options: ['Hand', 'Staff', 'Fan'],
					defaultValue: 'Hand'
				}
			]
		},
		Generate: {
			id: 'generate',
			icon: 'fa-solid fa-robot',
			settings: [
				{ label: 'AI Assist', type: 'toggle', defaultValue: true },
				{ label: 'Creativity Level', type: 'range', defaultValue: 50, min: 0, max: 100 },
				{
					label: 'Preferred Style',
					type: 'select',
					options: ['Flow', 'Technical', 'Freestyle'],
					defaultValue: 'Flow'
				},
				{ label: 'Generation Timeout', type: 'number', defaultValue: 30, min: 10, max: 120 }
			]
		},
		Browse: {
			id: 'browse',
			icon: 'fa-solid fa-folder',
			settings: [
				{
					label: 'Default View',
					type: 'select',
					options: ['Grid', 'List', 'Compact'],
					defaultValue: 'Grid'
				},
				{ label: 'Show Thumbnails', type: 'toggle', defaultValue: true },
				{
					label: 'Sort By',
					type: 'select',
					options: ['Date', 'Name', 'Complexity'],
					defaultValue: 'Date'
				},
				{ label: 'Items per Page', type: 'number', defaultValue: 20, min: 10, max: 100 }
			]
		},
		Learn: {
			id: 'learn',
			icon: 'fa-solid fa-book',
			settings: [
				{ label: 'Tutorial Mode', type: 'toggle', defaultValue: true },
				{
					label: 'Difficulty',
					type: 'select',
					options: ['Beginner', 'Intermediate', 'Advanced'],
					defaultValue: 'Beginner'
				},
				{ label: 'Show Tips', type: 'toggle', defaultValue: true },
				{ label: 'Lesson Progress Tracking', type: 'toggle', defaultValue: true }
			]
		},
		Write: {
			id: 'write',
			icon: 'fa-solid fa-pencil',
			settings: [
				{ label: 'Auto-Save', type: 'toggle', defaultValue: true },
				{ label: 'Save Interval', type: 'number', defaultValue: 5, min: 1, max: 30 },
				{
					label: 'Export Format',
					type: 'select',
					options: ['JSON', 'CSV', 'Text'],
					defaultValue: 'JSON'
				},
				{
					label: 'Notation Style',
					type: 'select',
					options: ['Symbolic', 'Descriptive', 'Minimal'],
					defaultValue: 'Symbolic'
				}
			]
		}
	};

	// Define allowed tab labels as a type
	type TabLabel = 'User Profile' | 'Background' | 'Prop Type' | 'Visibility' | 'Beat Layouts';

	// Define tabs configuration with Font Awesome class strings
	const tabs: { id: string; label: TabLabel; icon: string }[] = [
		{ id: 'User', label: 'User Profile', icon: 'fa-solid fa-user' },
		{ id: 'Background', label: 'Background', icon: 'fa-solid fa-fill-drip' },
		{ id: 'Prop Type', label: 'Prop Type', icon: 'fa-solid fa-paintbrush' },
		{ id: 'Visibility', label: 'Visibility', icon: 'fa-solid fa-eye' },
		{ id: 'Beat Layouts', label: 'Beat Layouts', icon: 'fa-solid fa-table-cells-large' }
	];

	// Props
	export let onClose: () => void;
	// Removed unused exports:
	// export let background: string;
	// export let onChangeBackground: (newBackground: string) => void;
	export let currentSection: keyof typeof sections = 'Construct';

	// State
	let searchQuery = '';
	let hasUnsavedChanges = false;
	let activeTab = get(activeTabStore);

	// Event Dispatcher
	const dispatch = createEventDispatcher<{
		changeBackground: string;
		save: void;
		reset: void;
	}>();

	// State for section-specific settings
	let sectionSettings: Record<string, any> = {};

	// Initialize settings
	$: {
		if (currentSection in sections) {
			sectionSettings = sections[currentSection]?.settings.reduce<Record<string, any>>((acc, setting) => {
				acc[setting.label] = setting.defaultValue;
				return acc;
			}, {});
		} else {
			// Handle case where currentSection might not exist in sections initially
			sectionSettings = {};
		}
	}

	// Save changes
	function handleSave() {
		// Placeholder: Implement actual saving logic here
		console.log('Saving settings:', sectionSettings);
		dispatch('save');
		hasUnsavedChanges = false;
	}

	// Reset to defaults
	function handleReset() {
		if (currentSection in sections) {
			sectionSettings = sections[currentSection].settings.reduce<Record<string, any>>((acc, setting) => {
				acc[setting.label] = setting.defaultValue;
				return acc;
			}, {});
		}
		// Placeholder: Implement actual reset logic if needed beyond local state
		console.log('Resetting settings for:', currentSection);
		dispatch('reset');
		hasUnsavedChanges = false;
	}

	// Track changes
	function markUnsavedChanges() {
		hasUnsavedChanges = true;
	}
</script>

<div class="settings-container" role="dialog" aria-modal="true" aria-labelledby="settings-title-h2">
	<div class="settings-header">
		<div class="settings-title">
			{#if sections[currentSection]?.icon}
				<i class="{sections[currentSection].icon} icon-style text-sky-400"></i>
			{/if}
			<h2 id="settings-title-h2" class="text-xl font-semibold text-slate-100">
				{currentSection} Settings
			</h2>
		</div>

		<div class="settings-actions">
			<div class="search-container">
				<input
					type="text"
					placeholder="Search settings..."
					bind:value={searchQuery}
					class="search-input"
				/>
				<i class="fa-solid fa-magnifying-glass search-icon"></i>
			</div>

			<button on:click={onClose} class="close-button" aria-label="Close settings">
				<i class="fa-solid fa-xmark icon-style-button"></i>
			</button>
		</div>
	</div>

	<div class="settings-content">
		<div class="tabs-navigation">
			<TabsNavigation bind:activeTab {tabs} />
		</div>

		<div class="section-settings">
			{#if sections[currentSection]}
				<div class="section-settings-grid">
					{#each sections[currentSection].settings as setting (setting.label)}
						{@const lowerCaseLabel = setting.label.toLowerCase()}
						{#if !searchQuery || lowerCaseLabel.includes(searchQuery.toLowerCase())}
							<div class="setting-item">
								<label class="setting-label" for="setting-{lowerCaseLabel}">{setting.label}</label>
								
								{#if setting.type === 'toggle'}
									<label class="toggle-switch">
										<input
											id="setting-{lowerCaseLabel}"
											type="checkbox"
											bind:checked={sectionSettings[setting.label]}
											on:change={markUnsavedChanges}
										/>
										<span class="slider"></span>
									</label>
								
								{:else if setting.type === 'number'}
									<input
										id="setting-{lowerCaseLabel}"
										type="number"
										bind:value={sectionSettings[setting.label]}
										min={setting.min}
										max={setting.max}
										on:input={markUnsavedChanges}
										class="number-input"
									/>
								
								{:else if setting.type === 'range'}
									<div class="range-container">
										<input
											id="setting-{lowerCaseLabel}"
											type="range"
											bind:value={sectionSettings[setting.label]}
											min={setting.min}
											max={setting.max}
											on:input={markUnsavedChanges}
											class="range-input"
										/>
										<span class="range-value">{sectionSettings[setting.label]}</span>
									</div>
								
								{:else if setting.type === 'select'}
									<select
										id="setting-{lowerCaseLabel}"
										bind:value={sectionSettings[setting.label]}
										on:change={markUnsavedChanges}
										class="select-input"
									>
										{#each setting.options as opt}
											<option value={opt}>{opt}</option>
										{/each}
									</select>
								
								{:else}
									<span>Unsupported setting type</span>
								{/if}
							</div>
						{/if}
					{/each}
				</div>
			{:else}
				<p class="text-slate-400 p-4">Select a section to view settings.</p>
			{/if}
		</div>
	</div>

	<div class="settings-footer">
		<div class="unsaved-changes">
			{#if hasUnsavedChanges}
				<p class="text-sm text-yellow-400">You have unsaved changes</p>
			{/if}
		</div>
		<div class="action-buttons">
			<button on:click={handleReset} class="reset-button">
				<i class="fa-solid fa-arrows-rotate icon-style-button-sm"></i>
				Reset to Defaults
			</button>
			<button on:click={handleSave} disabled={!hasUnsavedChanges} class="save-button">
				<i class="fa-solid fa-floppy-disk icon-style-button-sm"></i>
				Save Changes
			</button>
		</div>
	</div>
</div>

<style>
	/* --- Base Container & Layout --- */
	.settings-container {
		display: flex;
		flex-direction: column;
		height: 100%; /* Changed from 100vh to fit parent */
		width: 100%;
		background: rgba(30, 40, 60, 0.9);
		backdrop-filter: blur(10px);
		color: #e0e0e0; /* Default light text */
		border-radius: 12px; /* Match parent dialog */
		overflow: hidden; /* Prevent content spill */
	}

	.settings-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.5rem; /* Consistent padding */
		border-bottom: 1px solid rgba(108, 156, 233, 0.2);
		flex-shrink: 0;
	}

	.settings-content {
		display: flex;
		flex: 1; /* Grow to fill available space */
		min-height: 0; /* Important for flex children */
	}

	.settings-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.5rem;
		border-top: 1px solid rgba(108, 156, 233, 0.2);
		background-color: rgba(20, 30, 50, 0.5); /* Slightly different footer bg */
		flex-shrink: 0;
	}

	/* --- Header Elements --- */
	.settings-title {
		display: flex;
		align-items: center;
		gap: 0.75rem; /* Space between icon and text */
	}
	.settings-title h2 {
		margin: 0; /* Remove default heading margin */
	}

	.settings-actions {
		display: flex;
		align-items: center;
		gap: 1rem; /* Space between search and close */
	}

	.search-container {
		position: relative;
	}

	.search-input {
		background: rgba(20, 30, 50, 0.7);
		border: 1px solid rgba(108, 156, 233, 0.2);
		color: white;
		padding: 8px 12px 8px 32px; /* Add padding for icon */
		border-radius: 6px;
		font-size: 0.9rem;
		width: 200px; /* Adjust as needed */
		transition: border-color 0.2s ease;
	}
	.search-input:focus {
		outline: none;
		border-color: #6c9ce9;
	}
	.search-input::placeholder {
		color: #a0aec0;
	}

	.search-icon {
		position: absolute;
		left: 10px;
		top: 50%;
		transform: translateY(-50%);
		color: #a0aec0;
		font-size: 0.9rem; /* Match input font size */
	}

	.close-button {
		background: transparent;
		border: none;
		color: #a0aec0;
		cursor: pointer;
		padding: 4px;
		border-radius: 50%;
		transition:
			color 0.2s ease,
			background-color 0.2s ease;
	}
	.close-button:hover {
		color: white;
		background-color: rgba(255, 255, 255, 0.1);
	}

	/* --- Icon Styling Helpers --- */
	.icon-style {
		font-size: 1.5rem; /* Adjust title icon size */
		margin-right: 0.75rem; /* Consistent gap */
		width: 24px; /* Explicit width */
		text-align: center;
	}
	.icon-style-button {
		font-size: 1.2rem; /* Adjust button icon size */
		width: 24px;
		height: 24px;
		display: inline-block; /* Ensure size is respected */
		line-height: 24px; /* Center icon vertically */
		text-align: center;
	}
	.icon-style-button-sm {
		font-size: 1rem; /* Smaller icons for footer buttons */
		margin-right: 0.5rem;
		width: 16px;
		height: 16px;
		display: inline-block;
		line-height: 16px;
		text-align: center;
	}


	/* --- Tabs Navigation --- */
	.tabs-navigation {
		width: 220px; /* Slightly wider */
		border-right: 1px solid rgba(108, 156, 233, 0.2);
		background: rgba(20, 30, 50, 0.5);
		padding: 1rem 0; /* Add vertical padding */
		flex-shrink: 0;
		overflow-y: auto; /* Allow scrolling if many tabs */
	}
	/* NOTE: Assumes TabsNavigation.svelte is updated to use <i> tags */


	/* --- Section Settings Area --- */
	.section-settings {
		flex: 1; /* Grow to fill space */
		padding: 1.5rem; /* More padding */
		overflow-y: auto; /* Enable scrolling for content */
	}

	.section-settings-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem; /* Increased gap */
	}

	.setting-item {
		display: flex;
		flex-wrap: wrap; /* Allow wrapping on smaller widths within grid cell */
		justify-content: space-between;
		align-items: center;
		background: rgba(20, 30, 50, 0.4); /* Slightly less opaque */
		padding: 1rem; /* Consistent padding */
		border-radius: 8px;
		border: 1px solid rgba(108, 156, 233, 0.1); /* Subtle border */
		gap: 1rem; /* Space between label and input */
	}

	.setting-label {
		color: #cbd5e0; /* Lighter label color */
		font-weight: 500;
		flex-shrink: 0; /* Prevent label from shrinking */
	}

	/* --- Input Styles --- */
	.toggle-switch {
		position: relative;
		display: inline-block;
		width: 50px; /* Smaller toggle */
		height: 28px;
	}
	.toggle-switch input { opacity: 0; width: 0; height: 0; }
	.slider {
		position: absolute;
		cursor: pointer;
		top: 0; left: 0; right: 0; bottom: 0;
		background-color: #555; /* Darker off state */
		transition: .4s;
		border-radius: 28px;
	}
	.slider:before {
		position: absolute;
		content: "";
		height: 20px; width: 20px;
		left: 4px; bottom: 4px;
		background-color: white;
		transition: .4s;
		border-radius: 50%;
	}
	.toggle-switch input:checked + .slider { background-color: #3a7bd5; } /* Blue accent */
	.toggle-switch input:focus + .slider { box-shadow: 0 0 1px #3a7bd5; }
	.toggle-switch input:checked + .slider:before { transform: translateX(22px); } /* Adjusted translation */

	.number-input,
	.select-input {
		background: rgba(30, 40, 60, 0.7);
		border: 1px solid rgba(108, 156, 233, 0.2);
		color: white;
		padding: 8px 12px;
		border-radius: 6px; /* Match search input */
		font-size: 0.9rem;
	}
	.number-input { width: 80px; text-align: right; } /* Fixed width for numbers */
	.select-input { min-width: 150px; } /* Minimum width for selects */
	.number-input:focus,
	.select-input:focus {
		outline: none;
		border-color: #6c9ce9;
	}

	.range-container {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 100%; /* Allow range to fill space */
		min-width: 200px;
	}
	.range-input {
		flex-grow: 1; /* Allow slider to take up space */
		cursor: pointer;
		accent-color: #6c9ce9; /* Style slider color */
	}
	.range-value {
		color: #cbd5e0;
		font-size: 0.9rem;
		min-width: 30px; /* Ensure space for value */
		text-align: right;
	}

	/* --- Footer Elements --- */
	.unsaved-changes {
		flex-grow: 1; /* Push action buttons to the right */
	}
	.action-buttons {
		display: flex;
		gap: 0.75rem; /* Space between buttons */
	}

	.reset-button,
	.save-button {
		display: inline-flex; /* Align icon and text */
		align-items: center;
		padding: 8px 16px; /* Consistent padding */
		border-radius: 6px;
		border: none; /* Remove default border */
		cursor: pointer;
		font-weight: 500;
		font-size: 0.9rem;
		transition: all 0.2s ease;
	}

	.reset-button {
		background: rgba(100, 100, 110, 0.4); /* Slightly adjusted gray */
		color: #cbd5e0;
	}
	.reset-button:hover {
		background: rgba(110, 110, 120, 0.6);
	}

	.save-button {
		background: #3a7bd5; /* Blue accent */
		color: white;
	}
	.save-button:hover:not(:disabled) {
		background: #2a5da5; /* Darker blue on hover */
	}
	.save-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		background: #555; /* Darker disabled background */
	}
</style>