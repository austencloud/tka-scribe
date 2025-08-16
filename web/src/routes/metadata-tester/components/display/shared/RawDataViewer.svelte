<!-- Raw Data Viewer Component -->
<script lang="ts">
  interface Props {
    rawData: string;
    title?: string;
  }

  let { rawData, title = "🔍 Raw JSON Data" }: Props = $props();

  // Copy to clipboard functionality
  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(rawData);
      // Could emit an event here for toast notification
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  }
</script>

<details class="raw-data">
  <summary>
    {title}
    <button
      class="copy-btn"
      onclick={copyToClipboard}
      title="Copy raw data to clipboard"
    >
      📋 Copy
    </button>
  </summary>
  <pre class="json-content">{rawData}</pre>
</details>

<style>
  .raw-data {
    margin-top: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    overflow: hidden;
  }

  .raw-data summary {
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.05);
    cursor: pointer;
    font-weight: 500;
    color: #60a5fa;
    user-select: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .raw-data summary:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .copy-btn {
    background: rgba(34, 197, 94, 0.2);
    border: 1px solid rgba(34, 197, 94, 0.4);
    color: #22c55e;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
    transition: all 0.2s ease;
  }

  .copy-btn:hover {
    background: rgba(34, 197, 94, 0.3);
    border-color: rgba(34, 197, 94, 0.6);
  }

  .json-content {
    padding: 16px;
    margin: 0;
    background: rgba(0, 0, 0, 0.2);
    font-family: "Courier New", monospace;
    font-size: 0.85rem;
    line-height: 1.4;
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 400px;
    overflow-y: auto;
  }
</style>
