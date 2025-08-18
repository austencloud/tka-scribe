<!-- TransitionOverlay.svelte - Loading overlay during transitions -->
<div class="loading-overlay">
  <div class="loading-spinner"></div>
  <p>Loading options...</p>
</div>

<style>
  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: var(--border-radius);
    z-index: 1000;
  }

  .loading-overlay .loading-spinner {
    width: 32px;
    height: 32px;
    border: 4px solid var(--border);
    border-top: 4px solid var(--primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: var(--spacing-md);
  }

  .loading-overlay p {
    color: var(--foreground);
    font-size: 1.1rem;
    margin: 0;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
