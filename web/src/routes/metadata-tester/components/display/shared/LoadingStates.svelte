<!-- Loading States Component -->
<script lang="ts">
  interface Props {
    type: "batch" | "extraction" | "general";
    message?: string;
    subtitle?: string;
  }

  let { type, message, subtitle }: Props = $props();

  const defaultMessages = {
    batch: "Running batch analysis on all sequences...",
    extraction: "Extracting metadata...",
    general: "Loading...",
  };

  const defaultSubtitles = {
    batch: "This may take a moment",
    extraction: "",
    general: "",
  };
</script>

<div class="loading-state">
  <div class="spinner"></div>
  <p>{message || defaultMessages[type]}</p>
  {#if subtitle || defaultSubtitles[type]}
    <p class="loading-subtext">{subtitle || defaultSubtitles[type]}</p>
  {/if}
</div>

<style>
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 300px;
    text-align: center;
  }

  .loading-state p {
    margin: 8px 0 0 0;
    color: #9ca3af;
  }

  .loading-subtext {
    font-size: 0.9rem;
    color: #6b7280;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top: 3px solid #22c55e;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 15px;
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
