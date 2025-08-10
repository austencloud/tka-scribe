<!-- GeneralTab.svelte - Compact general settings with fade system controls -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import SelectInput from '../SelectInput.svelte';
	import SettingCard from '../SettingCard.svelte';
	import TextInput from '../TextInput.svelte';
	import ToggleSetting from '../ToggleSetting.svelte';

	// Fade system removed - using simple animations only

	interface Props {
		settings: any;
	}

	let { settings }: Props = $props();
	const dispatch = createEventDispatcher();

	// Local state for form values
	let userName = $state(settings.userName || '');
	let autoSave = $state(settings.autoSave ?? true);
	let gridMode = $state(settings.gridMode || 'diamond');
	let workbenchColumns = $state(settings.workbenchColumns || 5);

	// Animation settings (simplified)
	let animationsEnabled = $state(settings.animationsEnabled ?? true);

	// Options
	const gridModeOptions = [
		{ value: 'diamond', label: 'Diamond' },
		{ value: 'box', label: 'Box' },
	];

	// Animation handlers (simplified)
	function handleAnimationsEnabledChange(event: CustomEvent) {
		animationsEnabled = event.detail;
		dispatch('update', { key: 'animationsEnabled', value: animationsEnabled });
		console.log(`🎨 Animations ${animationsEnabled ? 'enabled' : 'disabled'}`);
	}
	function handleUserNameChange(event: CustomEvent) {
		userName = event.detail;
		dispatch('update', { key: 'userName', value: userName });
	}

	function handleAutoSaveChange(event: CustomEvent) {
		autoSave = event.detail;
		dispatch('update', { key: 'autoSave', value: autoSave });
	}

	function handleGridModeChange(event: CustomEvent) {
		gridMode = event.detail;
		dispatch('update', { key: 'gridMode', value: gridMode });
	}

	function handleWorkbenchColumnsChange(event: CustomEvent) {
		workbenchColumns = parseInt(event.detail);
		dispatch('update', { key: 'workbenchColumns', value: workbenchColumns });
	}
</script>

<div class="tab-content">
	<SettingCard title="User Profile">
		<TextInput
			label="User Name"
			value={userName}
			placeholder="Enter your name..."
			maxlength={50}
			helpText="Appears on exported sequences"
			on:change={handleUserNameChange}
		/>
	</SettingCard>

	<SettingCard title="Animation Settings">
		<ToggleSetting
			label="Enable Animations"
			checked={animationsEnabled}
			helpText="Enable smooth animations and transitions"
			on:change={handleAnimationsEnabledChange}
		/>
	</SettingCard>

	<SettingCard title="Application Settings">
		<ToggleSetting
			label="Auto-save Settings"
			checked={autoSave}
			helpText="Save changes automatically"
			on:change={handleAutoSaveChange}
		/>

		<SelectInput
			label="Grid Mode"
			value={gridMode}
			options={gridModeOptions}
			helpText="Pictograph grid layout style"
			on:change={handleGridModeChange}
		/>

		<TextInput
			label="Workbench Columns"
			value={workbenchColumns.toString()}
			type="number"
			min={1}
			max={12}
			helpText="Number of columns in sequence workbench"
			on:change={handleWorkbenchColumnsChange}
		/>
	</SettingCard>
</div>

<style>
	.tab-content {
		width: 100%;
		max-width: var(--max-content-width, 100%);
		margin: 0 auto;
		container-type: inline-size;
	}

	/* Responsive grid layout for settings cards */
	@container (min-width: 400px) {
		.tab-content {
			display: grid;
			grid-template-columns: 1fr;
			gap: clamp(16px, 2vw, 32px);
		}
	}

	@container (min-width: 600px) {
		.tab-content {
			grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
			gap: clamp(20px, 3vw, 40px);
		}
	}

	@container (min-width: 800px) {
		.tab-content {
			grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
			gap: clamp(24px, 4vw, 48px);
		}
	}

	.fade-debug-section {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		margin-top: var(--spacing-md);
		padding: var(--spacing-sm);
		background: var(--muted) / 10;
		border-radius: var(--border-radius-sm);
		border: 1px solid var(--border);
	}

	.debug-button {
		padding: var(--spacing-xs) var(--spacing-sm);
		background: var(--primary);
		color: var(--primary-foreground);
		border: none;
		border-radius: var(--border-radius-sm);
		cursor: pointer;
		font-size: var(--font-size-xs);
		font-weight: 500;
		transition: all var(--transition-fast);
	}

	.debug-button:hover {
		background: var(--primary-hover);
		transform: translateY(-1px);
	}

	.debug-help {
		font-size: var(--font-size-xs);
		color: var(--muted-foreground);
		font-style: italic;
	}
</style>
