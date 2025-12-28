<!--
  CAP Labeler Loading State

  Full-screen loading spinner shown during initialization.
-->
<script lang="ts">
  // No props needed - purely presentational
</script>

<div class="loading">
  <div class="spinner"></div>
  <p>Loading CAP Labeler...</p>
</div>

<style>
  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-lg);
    height: 100vh;
    font-size: var(--font-size-lg);
    color: var(--muted);
  }

  .spinner {
    width: 48px;
    height: 48px;
    border: 4px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-top-color: var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
