<!-- src/lib/providers/ReduxProvider.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { store, persistor } from '$lib/components/MainWidget/state/store';
	import { writable } from 'svelte/store';
	
	const state = writable(store.getState());
	
	onMount(() => {
		const unsubscribe = store.subscribe(() => {
			state.set(store.getState());
		});
		
		return unsubscribe;
	});
</script>

<slot />
