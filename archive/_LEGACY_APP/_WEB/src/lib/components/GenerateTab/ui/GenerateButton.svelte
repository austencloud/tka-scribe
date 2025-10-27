<!-- src/lib/components/GenerateTab/ui/GenerateButton.svelte -->
<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    
    // Props
    export let isLoading = false;
    export let hasError = false;
    export let statusMessage = '';
    export let text = 'Generate Sequence';
    
    // Create dispatcher for click events
    const dispatch = createEventDispatcher();
    
    // Handle click
    function handleClick() {
      if (!isLoading) {
        dispatch('click');
      }
    }
  </script>
  
  <div class="button-container">
    <button 
      class="generate-button"
      class:loading={isLoading}
      class:error={hasError}
      on:click={handleClick}
      disabled={isLoading}
    >
      {#if isLoading}
        <div class="spinner"></div>
        <span>{statusMessage || 'Generating...'}</span>
      {:else if hasError}
        <span>Try Again</span>
      {:else}
        <span>{text}</span>
      {/if}
    </button>
    
    {#if hasError}
      <div class="error-message">
        {statusMessage}
      </div>
    {/if}
  </div>
  
  <style>
    .button-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }
    
    .generate-button {
      padding: 0.75rem 2rem;
      background: var(--color-accent, #3a7bd5);
      color: white;
      border: none;
      border-radius: 0.25rem;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      min-width: 180px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    
    .generate-button:hover:not(:disabled) {
      background: var(--color-accent-hover, #2a5298);
      transform: translateY(-1px);
    }
    
    .generate-button:disabled {
      cursor: not-allowed;
      opacity: 0.8;
    }
    
    .loading {
      background: var(--color-accent-muted, #5a8bd5);
    }
    
    .error {
      background: var(--color-error, #d54a3a);
    }
    
    .error-message {
      color: var(--color-error, #d54a3a);
      font-size: 0.875rem;
      text-align: center;
      max-width: 300px;
    }
    
    .spinner {
      width: 1rem;
      height: 1rem;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>