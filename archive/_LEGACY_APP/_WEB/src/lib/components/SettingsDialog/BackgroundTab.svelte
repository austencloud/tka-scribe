<script lang="ts">
	import { Check, ChevronDown } from 'lucide-svelte';
	import { afterUpdate } from 'svelte';

	export let background: string; 
	export let onChangeBackground: (newBackgroundValue: string) => void;

	// Enhanced backgrounds with preview details
	const backgrounds = [
		{ 
			label: 'Snowfall', 
			value: 'snowfall', 
			preview: '/images/backgrounds/snowfall-preview.jpg',
			description: 'Gentle snowflakes drifting across a serene winter landscape'
		},
		{ 
			label: 'Night Sky', 
			value: 'nightSky', 
			preview: '/images/backgrounds/night-sky-preview.jpg',
			description: 'Twinkling stars and cosmic nebulae in a deep space backdrop'
		},
		// Add more backgrounds here with preview images and descriptions
	];

	// State management for dropdown
	let isOpen = false;
	let selectButton: HTMLButtonElement;
	let dropdownRef: HTMLDivElement;
	let focusedIndex = -1;

	// Find the display label for the currently selected value
	$: currentBackground = backgrounds.find(b => b.value === background) || backgrounds[0];

	// Keyboard navigation handler
	function handleKeyDown(event: KeyboardEvent) {
		if (!isOpen) return;

		switch (event.key) {
			case 'Escape':
				isOpen = false;
				selectButton?.focus();
				break;
			case 'ArrowDown':
				event.preventDefault();
				focusedIndex = (focusedIndex + 1) % backgrounds.length;
				break;
			case 'ArrowUp':
				event.preventDefault();
				focusedIndex = (focusedIndex - 1 + backgrounds.length) % backgrounds.length;
				break;
			case 'Enter':
			case ' ':
				if (focusedIndex !== -1) {
					handleSelect(backgrounds[focusedIndex].value);
				}
				break;
		}
	}

	// Toggle dropdown visibility
	function toggleDropdown() {
		isOpen = !isOpen;
		focusedIndex = backgrounds.findIndex(b => b.value === background);
	}

	// Handle background selection
	function handleSelect(value: string) {
		onChangeBackground(value);
		isOpen = false;
		selectButton?.focus();
	}

	// Click outside action
	function handleClickOutside(node: HTMLElement) {
		const handleClick = (event: MouseEvent) => {
			if (node && !node.contains(event.target as Node) && !selectButton?.contains(event.target as Node)) {
				isOpen = false;
			}
		};
		
		document.addEventListener('click', handleClick, true);
		return {
			destroy() {
				document.removeEventListener('click', handleClick, true);
			}
		};
	}

	// Ensure focused item is in view
	afterUpdate(() => {
		if (isOpen && focusedIndex !== -1) {
			const focusedElement = dropdownRef?.children[focusedIndex] as HTMLElement;
			focusedElement?.scrollIntoView({ block: 'nearest' });
		}
	});
</script>

<div class="space-y-4">
	<h3 class="text-lg font-medium text-slate-300">Background</h3>
	<p class="text-sm text-slate-500">Select the animated background effect.</p>

	<div class="relative w-full max-w-md" use:handleClickOutside>
		<button
			bind:this={selectButton}
			on:click={toggleDropdown}
			on:keydown={handleKeyDown}
			type="button"
			class="flex h-12 w-full items-center justify-between rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 ring-offset-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
			aria-haspopup="listbox"
			aria-expanded={isOpen}
			aria-labelledby="background-label"
		>
			<div class="flex items-center space-x-3">
				<img 
					src={currentBackground.preview} 
					alt={currentBackground.label} 
					class="w-8 h-8 rounded object-cover"
				/>
				<span id="background-label">{currentBackground.label}</span>
			</div>
			<ChevronDown class="h-4 w-4 opacity-50" />
		</button>

		{#if isOpen}
			<div
				bind:this={dropdownRef}
				class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-700 bg-slate-800 py-1 text-base text-slate-100 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
				role="listbox"
				tabindex="-1"
				on:keydown={handleKeyDown}
			>
				{#each backgrounds as bg, index (bg.value)}
					<div
						role="option"
						tabindex="0"
						aria-selected={background === bg.value}
						class="relative cursor-pointer select-none py-2 pl-3 pr-9 text-slate-100 
							{background === bg.value ? 'bg-sky-600' : 'hover:bg-slate-700'}
							{focusedIndex === index ? 'bg-slate-700' : ''}"
						on:click={() => handleSelect(bg.value)}
						on:keydown={(e) => { 
							if (e.key === 'Enter' || e.key === ' ') handleSelect(bg.value); 
						}}
					>
						<div class="flex items-center space-x-3">
							<img 
								src={bg.preview} 
								alt={bg.label} 
								class="w-10 h-10 rounded object-cover"
							/>
							<div>
								<span class="block truncate font-medium">{bg.label}</span>
								<span class="block text-xs text-slate-400">{bg.description}</span>
							</div>
						</div>
						
						{#if background === bg.value}
							<span class="absolute inset-y-0 right-0 flex items-center pr-3 text-sky-300">
								<Check class="h-5 w-5" aria-hidden="true" />
							</span>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>