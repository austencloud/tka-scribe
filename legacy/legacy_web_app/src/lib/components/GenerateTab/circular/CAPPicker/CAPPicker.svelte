<!-- src/lib/components/GenerateTab/circular/CAPPicker/CAPPicker.svelte -->
<script lang="ts" generics="T extends { id: string; label: string; description: string }">
    import { createEventDispatcher } from 'svelte';
    import CAPButton from './CAPButton.svelte';
    
    // Props
    export let capTypes: T[];
    export let selectedCapId: string;
    
    // Group CAP types for better organization
    const groupedCapTypes = {
      mirror: capTypes.filter(cap => cap.id.includes('mirrored')),
      rotate: capTypes.filter(cap => cap.id.includes('rotated')),
      other: capTypes.filter(cap => !cap.id.includes('mirrored') && !cap.id.includes('rotated')),
    };
    
    // Create event dispatcher
    const dispatch = createEventDispatcher<{
      select: string
    }>();
    
    // Handle CAP selection
    function handleSelect(capId: string) {
      dispatch('select', capId);
    }
  </script>
  
  <div class="cap-picker">
    <div class="cap-group">
      <h4>Mirrored Types</h4>
      <div class="cap-buttons">
        {#each groupedCapTypes.mirror as capType (capType.id)}
          <CAPButton
            capType={capType}
            selected={selectedCapId === capType.id}
            on:select={() => handleSelect(capType.id)}
          />
        {/each}
      </div>
    </div>
    
    <div class="cap-group">
      <h4>Rotated Types</h4>
      <div class="cap-buttons">
        {#each groupedCapTypes.rotate as capType (capType.id)}
          <CAPButton
            capType={capType}
            selected={selectedCapId === capType.id}
            on:select={() => handleSelect(capType.id)}
          />
        {/each}
      </div>
    </div>
    
    {#if groupedCapTypes.other.length > 0}
      <div class="cap-group">
        <h4>Other Types</h4>
        <div class="cap-buttons">
          {#each groupedCapTypes.other as capType (capType.id)}
            <CAPButton
              capType={capType}
              selected={selectedCapId === capType.id}
              on:select={() => handleSelect(capType.id)}
            />
          {/each}
        </div>
      </div>
    {/if}
  </div>
  
  <style>
    .cap-picker {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    
    .cap-group {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    
    .cap-group h4 {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-text-secondary, rgba(255, 255, 255, 0.6));
      margin: 0;
      padding-bottom: 0.25rem;
      border-bottom: 1px solid var(--color-border, rgba(255, 255, 255, 0.1));
    }
    
    .cap-buttons {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
  </style>