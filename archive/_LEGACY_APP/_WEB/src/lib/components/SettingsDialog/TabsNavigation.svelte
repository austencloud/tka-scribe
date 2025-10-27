<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { 
		User, 
		PaintBucket, 
		LayoutGrid, 
		Eye, 
		Brush 
	} from 'lucide-svelte';

	// Define icon mapping
	const iconMap = {
		'User Profile': User,
		'Background': PaintBucket,
		'Prop Type': Brush,
		'Visibility': Eye,
		'Beat Layouts': LayoutGrid
	};

	// Props
	export let activeTab: string = 'User';
	export let tabs: Array<{
		id: string;
		label: keyof typeof iconMap;
	}> = [
		{ id: 'User', label: 'User Profile' },
		{ id: 'Background', label: 'Background' },
		{ id: 'Prop Type', label: 'Prop Type' },
		{ id: 'Visibility', label: 'Visibility' },
		{ id: 'Beat Layouts', label: 'Beat Layouts' }
	];

	const dispatch = createEventDispatcher<{ changeTab: string }>();

	function changeTab(tab: string) {
		dispatch('changeTab', tab);
	}
</script>

<nav class="h-full overflow-y-auto py-4">
	<ul class="space-y-2 px-2">
		{#each tabs as tab (tab.id)}
			<li>
				<button
					on:click={() => changeTab(tab.id)}
					class="w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-all duration-200 ease-in-out"
					class:bg-sky-600={activeTab === tab.id}
					class:text-white={activeTab === tab.id}
					class:text-slate-300={activeTab !== tab.id}
					class:hover:bg-slate-700={activeTab !== tab.id}
					class:hover:text-white={activeTab !== tab.id}
					aria-selected={activeTab === tab.id}
					role="tab"
				>
					<svelte:component 
						this={iconMap[tab.label]} 
						class="w-5 h-5 {activeTab === tab.id ? 'text-white' : 'text-slate-400'}"
					/>
					<span class="text-sm font-medium truncate">{tab.label}</span>
				</button>
			</li>
		{/each}
	</ul>
</nav>

<style>
	/* Smooth transitions for hover and active states */
	button {
		transition: 
			background-color 0.2s ease,
			color 0.2s ease,
			transform 0.1s ease;
	}

	button:hover {
		transform: translateX(2px);
	}

	button:active {
		transform: scale(0.98);
	}
</style>