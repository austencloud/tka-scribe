<!-- GeneralTab.svelte - Compact general settings with better contrast -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import SettingCard from '../SettingCard.svelte';
	import TextInput from '../TextInput.svelte';
	import ToggleSetting from '../ToggleSetting.svelte';
	import SelectInput from '../SelectInput.svelte';

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

	// Options
	const gridModeOptions = [
		{ value: 'diamond', label: 'Diamond' },
		{ value: 'box', label: 'Box' }
	];

	// Update handlers
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
		max-width: 500px;
	}
</style>
