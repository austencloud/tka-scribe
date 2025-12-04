<!--
  ClaudeCodePromptCard.svelte - Copyable Claude Code prompt display
-->
<script lang="ts">
  import type { ClaudeCodePrompt } from "../../domain/models/analysis-models";

  interface Props {
    prompt: ClaudeCodePrompt;
    onCopy: () => void;
  }

  let { prompt, onCopy }: Props = $props();

  let copied = $state(false);
  let expanded = $state(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(prompt.prompt);
      copied = true;
      onCopy();

      setTimeout(() => {
        copied = false;
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }

  const previewText = $derived(
    prompt.prompt.length > 150
      ? prompt.prompt.substring(0, 150) + "..."
      : prompt.prompt
  );

  const formattedDate = $derived(
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(prompt.generatedAt)
  );
</script>

<div class="prompt-card" class:copied={prompt.copied}>
  <header class="card-header">
    <div class="header-left">
      <i class="fas fa-terminal"></i>
      <span class="title">Claude Code Prompt</span>
    </div>
    <div class="header-right">
      <span class="timestamp">{formattedDate}</span>
      {#if prompt.copied}
        <span class="copied-badge">
          <i class="fas fa-check"></i>
          Used
        </span>
      {/if}
    </div>
  </header>

  <div class="card-content">
    <!-- Prompt Preview/Full -->
    <div class="prompt-text" class:expanded>
      {#if expanded}
        <pre>{prompt.prompt}</pre>
      {:else}
        <pre>{previewText}</pre>
      {/if}
    </div>

    {#if prompt.prompt.length > 150}
      <button class="expand-button" onclick={() => (expanded = !expanded)}>
        <i class="fas {expanded ? 'fa-chevron-up' : 'fa-chevron-down'}"></i>
        {expanded ? "Collapse" : "Expand"}
      </button>
    {/if}

    <!-- Investigation Goals -->
    {#if prompt.investigationGoals && prompt.investigationGoals.length > 0}
      <div class="goals-section">
        <span class="goals-label">Investigation Goals:</span>
        <ul class="goals-list">
          {#each prompt.investigationGoals as goal}
            <li>{goal}</li>
          {/each}
        </ul>
      </div>
    {/if}

    <!-- Suggested Files -->
    {#if prompt.suggestedFiles && prompt.suggestedFiles.length > 0}
      <div class="files-section">
        <span class="files-label">Suggested Files:</span>
        <div class="files-list">
          {#each prompt.suggestedFiles as file}
            <code class="file-tag">{file}</code>
          {/each}
        </div>
      </div>
    {/if}
  </div>

  <footer class="card-footer">
    <button
      class="copy-button"
      class:copied
      onclick={handleCopy}
    >
      {#if copied}
        <i class="fas fa-check"></i>
        Copied!
      {:else}
        <i class="fas fa-copy"></i>
        Copy to Clipboard
      {/if}
    </button>
  </footer>
</div>

<style>
  .prompt-card {
    background: rgba(34, 197, 94, 0.05);
    border: 1px solid rgba(34, 197, 94, 0.2);
    border-radius: 10px;
    overflow: hidden;
  }

  .prompt-card.copied {
    border-color: rgba(34, 197, 94, 0.4);
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    background: rgba(34, 197, 94, 0.1);
    border-bottom: 1px solid rgba(34, 197, 94, 0.15);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .header-left i {
    font-size: 12px;
    color: #22c55e;
  }

  .title {
    font-size: 12px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .timestamp {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.5);
  }

  .copied-badge {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    background: rgba(34, 197, 94, 0.2);
    border-radius: 10px;
    font-size: 10px;
    font-weight: 500;
    color: #22c55e;
  }

  .copied-badge i {
    font-size: 8px;
  }

  .card-content {
    padding: 14px;
  }

  /* Prompt Text */
  .prompt-text {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 6px;
    overflow: hidden;
    max-height: 120px;
    overflow-y: auto;
  }

  .prompt-text.expanded {
    max-height: 400px;
  }

  .prompt-text pre {
    margin: 0;
    padding: 12px;
    font-size: 12px;
    font-family: "SF Mono", Monaco, Consolas, monospace;
    color: rgba(255, 255, 255, 0.85);
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .expand-button {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
    padding: 6px 10px;
    background: transparent;
    border: none;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    transition: color 0.2s ease;
  }

  .expand-button:hover {
    color: rgba(255, 255, 255, 0.9);
  }

  .expand-button i {
    font-size: 10px;
  }

  /* Goals Section */
  .goals-section {
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .goals-label {
    display: block;
    font-size: 11px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 8px;
    text-transform: uppercase;
  }

  .goals-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .goals-list li {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
    padding-left: 16px;
    position: relative;
  }

  .goals-list li::before {
    content: ">";
    position: absolute;
    left: 0;
    color: #22c55e;
    font-family: monospace;
  }

  /* Files Section */
  .files-section {
    margin-top: 12px;
  }

  .files-label {
    display: block;
    font-size: 11px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 8px;
    text-transform: uppercase;
  }

  .files-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .file-tag {
    padding: 4px 8px;
    background: rgba(99, 102, 241, 0.15);
    border: 1px solid rgba(99, 102, 241, 0.25);
    border-radius: 4px;
    font-size: 11px;
    font-family: "SF Mono", Monaco, Consolas, monospace;
    color: rgba(99, 102, 241, 0.9);
  }

  /* Footer */
  .card-footer {
    padding: 12px 14px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: flex-end;
  }

  .copy-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    background: rgba(34, 197, 94, 0.2);
    border: 1px solid rgba(34, 197, 94, 0.4);
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    color: #22c55e;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .copy-button:hover {
    background: rgba(34, 197, 94, 0.3);
    border-color: rgba(34, 197, 94, 0.6);
  }

  .copy-button.copied {
    background: #22c55e;
    color: white;
    border-color: #22c55e;
  }

  /* Scrollbar */
  .prompt-text::-webkit-scrollbar {
    width: 6px;
  }

  .prompt-text::-webkit-scrollbar-track {
    background: transparent;
  }

  .prompt-text::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }

  /* Accessibility */
  @media (prefers-reduced-motion: reduce) {
    .copy-button,
    .expand-button {
      transition: none;
    }
  }
</style>
