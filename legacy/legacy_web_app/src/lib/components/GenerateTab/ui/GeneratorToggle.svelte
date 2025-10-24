<!-- src/lib/components/GenerateTab/ui/GeneratorToggle.svelte -->
<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    
    // Props
    export let options: Array<{ id: string; label: string }>;
    export let value: string;
    
    // Create event dispatcher
    const dispatch = createEventDispatcher();
    
    // Handle option click
    function handleSelect(id: string) {
      if (id !== value) {
        dispatch('change', id);
      }
    }
  </script>
  
  <div class="toggle-container">
    {#each options as option}
      <button
        class="toggle-option"
        class:selected={option.id === value}
        on:click={() => handleSelect(option.id)}
      >
        {option.label}
      </button>
    {/each}
  </div>
  
  <style>
    .toggle-container {
      display: flex;
      background: var(--color-surface-hover, rgba(255, 255, 255, 0.1));
      border-radius: 0.25rem;
      padding: 0.25rem;
      width: fit-content;
    }
    
    .toggle-option {
      background: none;
      border: none;
      color: var(--color-text-secondary, rgba(255, 255, 255, 0.7));
      padding: 0.5rem 1rem;
      border-radius: 0.25rem;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }
    
    .toggle-option:hover:not(.selected) {
      background: var(--color-surface-hover, rgba(255, 255, 255, 0.05));
      color: var(--color-text-primary, white);
    }
    
    .toggle-option.selected {
      background: var(--color-surface, rgba(30, 40, 60, 0.85));
      color: var(--color-text-primary, white);
    }
  </style>