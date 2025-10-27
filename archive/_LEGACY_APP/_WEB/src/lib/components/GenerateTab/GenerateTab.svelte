<!-- src/lib/components/GenerateTab/GenerateTab.svelte -->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	
	// Import stores
	import { 
	  settingsStore, 
	  generatorType as activeGeneratorType
	} from './store/settings';
	
	import { 
	  generatorStore, 
	  isGenerating, 
	  hasError, 
	  statusMessage 
	} from './store/generator';
	
	// Import UI components
	import GenerateButton from './ui/GenerateButton.svelte';
	import HeaderLabel from './ui/HeaderLabel.svelte';
	import GeneratorToggle from './ui/GeneratorToggle.svelte';
	import LengthSelector from './ui/LengthSelector.svelte';
	import TurnIntensity from './ui/TurnIntensity.svelte';
	import PropContinuity from './ui/PropContinuity.svelte';
	import LevelSelector from './ui/LevelSelector/LevelSelector.svelte';
	
	// Import generators
	import CircularSequencer from './circular/CircularSequencer.svelte';
	import FreeformSequencer from './freeform/FreeformSequencer.svelte';
	
	// Generator types for the toggle
	const generatorTypes = [
	  { id: 'circular', label: 'Circular' },
	  { id: 'freeform', label: 'Freeform' }
	];
	
	// Handle generate click
	function handleGenerate() {
	  // The actual generation will be handled by the active sequencer component
	  // We just need to dispatch the event
	  const event = new CustomEvent('generate-sequence', {
		detail: {
		  // We could pass additional options here if needed
		}
	  });
	  
	  document.dispatchEvent(event);
	}
	
	// Handle generator type change
	function handleGeneratorTypeChange(type: string) {
	  settingsStore.setGeneratorType(type as 'circular' | 'freeform');
	}
	
	// Clean up event listeners
	onDestroy(() => {
	  // Any cleanup if needed
	});
  </script>
  
  <div class="generate-tab">
	<HeaderLabel />
	
	<!-- Generator type toggle -->
	<div class="generator-type">
	  <GeneratorToggle 
		options={generatorTypes} 
		value={$activeGeneratorType}
		on:change={(e) => handleGeneratorTypeChange(e.detail)} 
	  />
	</div>
	
	<!-- Generator content - shows either circular or freeform -->
	<div class="generator-content">
	  {#if $activeGeneratorType === 'circular'}
		<CircularSequencer />
	  {:else}
		<FreeformSequencer />
	  {/if}
	</div>
	
	<!-- Generator controls -->
	<div class="controls-container">
	  <div class="controls-grid">
		<LengthSelector />
		<TurnIntensity />
		<PropContinuity />
		<LevelSelector />
	  </div>
	  
	  <!-- Generate button -->
	  <div class="generate-button">
		<GenerateButton 
		  isLoading={$isGenerating} 
		  hasError={$hasError}
		  statusMessage={$statusMessage}
		  on:click={handleGenerate}
		/>
	  </div>
	</div>
  </div>
  
  <style>
	.generate-tab {
	  display: flex;
	  flex-direction: column;
	  height: 100%;
	  padding: 1rem;
	  gap: 1.5rem;
	}
	
	.generator-type {
	  display: flex;
	  justify-content: center;
	  margin-bottom: 0.5rem;
	}
	
	.generator-content {
	  flex: 1;
	  min-height: 0;
	  display: flex;
	  overflow: auto;
	}
	
	.controls-container {
	  display: flex;
	  flex-direction: column;
	  gap: 1.5rem;
	}
	
	.controls-grid {
	  display: grid;
	  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
	  gap: 1rem;
	}
	
	.generate-button {
	  display: flex;
	  justify-content: center;
	  margin-top: 0.5rem;
	}
	
	/* Responsive adjustments */
	@media (max-width: 768px) {
	  .controls-grid {
		grid-template-columns: 1fr;
	  }
	}
  </style>