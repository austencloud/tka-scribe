


<script lang="ts">
	import { onMount } from 'svelte';
	import { enterAppMode } from '$lib/state/appModeState.svelte';
	import { switchTab } from '$lib/state/appState.svelte';
	import MainApplication from '$components/MainApplication.svelte';

	onMount(async () => {
		// Enter app mode and go to constructor
		console.log('🔧 Root route accessed - entering app mode...');
		await enterAppMode();
		switchTab('construct');
	});
</script>
<h1>Welcome to TKA</h1>
<p>The Kinetic Alphabet - Consolidated Web Application</p>enters app mode directly -->

<MainApplication />
