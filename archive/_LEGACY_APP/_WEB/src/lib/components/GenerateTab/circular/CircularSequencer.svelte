<!-- src/lib/components/GenerateTab/circular/CircularSequencer.svelte -->
<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { settingsStore, capType, numBeats, turnIntensity, propContinuity } from '../store/settings';
    import { generatorStore } from '../store/generator';
    import CAPPicker from './CAPPicker/CAPPicker.svelte';
    import { createCircularSequence } from './createCircularSequence';
    import { beatsStore } from '../../../stores/sequence/beatsStore';
    
    // CAP types data with descriptions
    const capTypes = [
      { 
        id: 'mirrored', 
        label: 'Mirrored', 
        description: 'Creates a mirrored sequence where the second half mirrors the first half.'
      },
      { 
        id: 'rotated', 
        label: 'Rotated', 
        description: 'Creates a rotated sequence where the second half repeats the first half with rotation.'
      },
      { 
        id: 'mirrored_complementary', 
        label: 'Mirrored Complementary', 
        description: 'Creates a mirrored sequence with complementary motion types.'
      },
      { 
        id: 'rotated_complementary', 
        label: 'Rotated Complementary', 
        description: 'Creates a rotated sequence with complementary motion types.'
      },
      { 
        id: 'mirrored_swapped', 
        label: 'Mirrored Swapped', 
        description: 'Creates a mirrored sequence with swapped prop colors.'
      },
      { 
        id: 'rotated_swapped', 
        label: 'Rotated Swapped', 
        description: 'Creates a rotated sequence with swapped prop colors.'
      },
      { 
        id: 'strict_mirrored', 
        label: 'Strict Mirrored', 
        description: 'Creates a strictly mirrored sequence with exact mirror positions.'
      },
      { 
        id: 'strict_rotated', 
        label: 'Strict Rotated', 
        description: 'Creates a strictly rotated sequence with exact rotation positions.'
      },
      { 
        id: 'strict_complementary', 
        label: 'Strict Complementary', 
        description: 'Creates a sequence with strictly complementary motion types.'
      },
      { 
        id: 'strict_swapped', 
        label: 'Strict Swapped', 
        description: 'Creates a sequence with strictly swapped prop colors.'
      },
      { 
        id: 'swapped_complementary', 
        label: 'Swapped Complementary', 
        description: 'Creates a sequence with swapped colors and complementary motion types.'
      }
    ];
    
    // Local state
    let currentCapType = $capType;
    let selectedCapInfo = capTypes.find(cap => cap.id === currentCapType) || capTypes[0];
    
    // Update the selected CAP info when the store changes
    $: {
      currentCapType = $capType;
      selectedCapInfo = capTypes.find(cap => cap.id === currentCapType) || capTypes[0];
    }
    
    // Handle CAP type selection
    function handleCapTypeSelect(newCapType: string) {
      settingsStore.setCAPType(newCapType as any);
    }
    
    // Handle generate sequence
    async function handleGenerateSequence() {
      // Start the generation process
      generatorStore.startGeneration();
      
      try {
        // Create the sequence
        const result = await createCircularSequence({
          capType: $capType,
          numBeats: $numBeats,
          turnIntensity: $turnIntensity,
          propContinuity: $propContinuity
        });
        
        // Update the beats store with the new sequence
        beatsStore.set(result);
        
        // Complete the generation
        generatorStore.completeGeneration();
      } catch (error: unknown) {
        // Handle error
        const errorMessage = error instanceof Error ? error.message : 'Failed to generate sequence';
        generatorStore.setError(errorMessage);
        console.error('Generate sequence error:', error);
      }
    }
    
    // Listen for generate-sequence event
    function setupEventListener() {
      const handleEvent = (e: CustomEvent) => {
        handleGenerateSequence();
      };
      
      document.addEventListener('generate-sequence', handleEvent as EventListener);
      
      return () => {
        document.removeEventListener('generate-sequence', handleEvent as EventListener);
      };
    }
    
    // Lifecycle
    onMount(() => {
      const cleanup = setupEventListener();
      return cleanup;
    });
  </script>
  
  <div class="circular-sequencer">
    <h3>Circular Sequence Generator</h3>
    
    <div class="content">
      <div class="cap-picker-container">
        <CAPPicker 
          capTypes={capTypes} 
          selectedCapId={currentCapType}
          on:select={(e) => handleCapTypeSelect(e.detail)}
        />
      </div>
      
      <div class="description-container">
        <div class="description-card">
          <h4>{selectedCapInfo.label}</h4>
          <p>{selectedCapInfo.description}</p>
          
          <div class="info-box">
            <div class="info-item">
              <span class="info-label">Sequence Length:</span>
              <span class="info-value">{$numBeats * 2} beats</span>
            </div>
            
            <div class="info-item">
              <span class="info-label">First Half:</span>
              <span class="info-value">{$numBeats} beats</span>
            </div>
            
            <p class="info-note">
              The generator will create a {$numBeats}-beat sequence and then 
              apply the {selectedCapInfo.label} transformation to create a 
              {$numBeats * 2}-beat circular sequence.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <style>
    .circular-sequencer {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      width: 100%;
    }
    
    h3 {
      font-size: 1.25rem;
      color: var(--color-text-primary, white);
      margin: 0;
      font-weight: 500;
    }
    
    .content {
      display: flex;
      gap: 1.5rem;
      width: 100%;
    }
    
    .cap-picker-container {
      flex: 2;
      overflow-y: auto;
      max-height: 30rem;
    }
    
    .description-container {
      flex: 1;
      min-width: 240px;
    }
    
    .description-card {
      background: var(--color-surface, rgba(30, 40, 60, 0.85));
      border: 1px solid var(--color-border, rgba(255, 255, 255, 0.1));
      border-radius: 0.5rem;
      padding: 1rem;
    }
    
    .description-card h4 {
      font-size: 1.1rem;
      margin: 0 0 0.75rem 0;
      color: var(--color-text-primary, white);
      font-weight: 500;
    }
    
    .description-card p {
      color: var(--color-text-secondary, rgba(255, 255, 255, 0.7));
      font-size: 0.9rem;
      margin: 0 0 1rem 0;
      line-height: 1.4;
    }
    
    .info-box {
      margin-top: 1rem;
      padding: 0.75rem;
      background: var(--color-surface-hover, rgba(255, 255, 255, 0.05));
      border-radius: 0.375rem;
    }
    
    .info-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }
    
    .info-label {
      font-size: 0.875rem;
      color: var(--color-text-secondary, rgba(255, 255, 255, 0.7));
    }
    
    .info-value {
      font-size: 0.875rem;
      color: var(--color-accent, #3a7bd5);
      font-weight: 500;
    }
    
    .info-note {
      font-size: 0.8rem;
      color: var(--color-text-secondary, rgba(255, 255, 255, 0.6));
      margin-top: 0.75rem;
      font-style: italic;
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
      .content {
        flex-direction: column;
      }
      
      .cap-picker-container,
      .description-container {
        width: 100%;
      }
      
      .cap-picker-container {
        max-height: 20rem;
      }
    }
  </style>