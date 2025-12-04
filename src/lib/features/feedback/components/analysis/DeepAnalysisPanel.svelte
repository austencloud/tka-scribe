<!--
  DeepAnalysisPanel.svelte - Deep codebase analysis with local Ollama

  Provides a UI for running thorough background analysis of feedback
  against the actual codebase. Uses SSE for real-time progress updates.
-->
<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import type { FeedbackItem } from "../../domain/models/feedback-models";

  interface Props {
    feedback: FeedbackItem;
    onComplete?: (result: DeepAnalysisResultData) => void;
  }

  let { feedback, onComplete }: Props = $props();

  // State
  let status = $state<"idle" | "checking" | "running" | "completed" | "error">(
    "idle"
  );
  let ollamaHealth = $state<{
    available: boolean;
    model: string | null;
    error?: string;
  } | null>(null);
  let progress = $state<ProgressEvent[]>([]);
  let currentStep = $state<string>("");
  let confidence = $state(0);
  let filesExplored = $state(0);
  let iteration = $state(0);
  let result = $state<DeepAnalysisResultData | null>(null);
  let error = $state<string | null>(null);
  let abortController = $state<AbortController | null>(null);

  interface ProgressEvent {
    type: string;
    timestamp: string;
    message: string;
    data?: unknown;
  }

  interface DeepAnalysisResultData {
    summary: string;
    technicalAnalysis: string;
    affectedFiles: string[];
    suggestedFix: string;
    implementationSteps: string[];
    riskAssessment: string;
    claudeCodePrompt: string;
    confidence: number;
    filesExplored: number;
    iterations: number;
  }

  // Check Ollama health on mount
  onMount(async () => {
    await checkHealth();
  });

  onDestroy(() => {
    abortController?.abort();
  });

  async function checkHealth() {
    status = "checking";
    try {
      const response = await fetch("/api/feedback/deep-analyze?action=health");
      ollamaHealth = await response.json();
      status = "idle";
    } catch (err) {
      ollamaHealth = {
        available: false,
        model: null,
        error: "Failed to check Ollama status",
      };
      status = "error";
      error = "Failed to check Ollama status";
    }
  }

  async function startAnalysis() {
    if (!ollamaHealth?.available) return;

    status = "running";
    error = null;
    progress = [];
    result = null;
    confidence = 0;
    filesExplored = 0;
    iteration = 0;

    abortController = new AbortController();

    try {
      const response = await fetch("/api/feedback/deep-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedbackId: feedback.id,
          config: {
            maxIterations: 20,
            confidenceThreshold: 0.85,
            maxFilesRead: 50,
          },
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to start analysis");
      }

      // Process SSE stream
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const event: ProgressEvent = JSON.parse(line.slice(6));
              handleProgressEvent(event);
            } catch (e) {
              console.error("Failed to parse event:", e);
            }
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        status = "idle";
        currentStep = "Analysis cancelled";
      } else {
        status = "error";
        error = err instanceof Error ? err.message : "Analysis failed";
      }
    }
  }

  function handleProgressEvent(event: ProgressEvent) {
    progress = [...progress, event];

    switch (event.type) {
      case "started":
        currentStep = event.message;
        break;

      case "thinking":
        currentStep =
          "Analyzing: " +
          (event.message.length > 100
            ? event.message.slice(0, 100) + "..."
            : event.message);
        break;

      case "tool_call":
        currentStep = `Calling: ${(event.data as { tool?: string })?.tool || "tool"}`;
        break;

      case "tool_result":
        // Keep current step, just log
        break;

      case "confidence_update":
        confidence =
          ((event.data as { confidence?: number })?.confidence || 0) * 100;
        break;

      case "iteration":
        iteration = (event.data as { iteration?: number })?.iteration || 0;
        currentStep = event.message;
        break;

      case "completed":
        status = "completed";
        currentStep = "Analysis complete!";
        if (event.data) {
          result = event.data as DeepAnalysisResultData;
          confidence = result.confidence * 100;
          filesExplored = result.filesExplored;
          onComplete?.(result);
        }
        break;

      case "error":
        status = "error";
        error = event.message;
        break;
    }

    // Update files explored from state
    if ((event.data as { filesRead?: unknown[] })?.filesRead) {
      filesExplored = (event.data as { filesRead: unknown[] }).filesRead.length;
    }
  }

  function stopAnalysis() {
    abortController?.abort();
    status = "idle";
  }

  function copyClaudePrompt() {
    if (result?.claudeCodePrompt) {
      navigator.clipboard.writeText(result.claudeCodePrompt);
    }
  }

  // Derived
  const showProgress = $derived(status === "running" || status === "completed");
  const canStart = $derived(
    status === "idle" && ollamaHealth?.available === true
  );
</script>

<div class="deep-analysis-panel">
  <header class="panel-header">
    <div class="header-left">
      <i class="fas fa-microscope"></i>
      <h4>Deep Codebase Analysis</h4>
    </div>
    <div class="header-right">
      {#if ollamaHealth}
        <span class="health-badge" class:healthy={ollamaHealth.available}>
          <i
            class="fas {ollamaHealth.available
              ? 'fa-check-circle'
              : 'fa-times-circle'}"
          ></i>
          {ollamaHealth.available
            ? `Ollama (${ollamaHealth.model || "qwen2.5:32b"})`
            : "Ollama unavailable"}
        </span>
      {/if}
    </div>
  </header>

  <div class="panel-content">
    {#if status === "checking"}
      <div class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <span>Checking Ollama connection...</span>
      </div>
    {:else if !ollamaHealth?.available}
      <div class="error-state">
        <i class="fas fa-exclamation-triangle"></i>
        <div class="error-content">
          <p>Ollama is not available</p>
          <span class="error-detail"
            >{ollamaHealth?.error ||
              "Make sure Ollama is running locally"}</span
          >
        </div>
        <button class="retry-button" onclick={checkHealth}>
          <i class="fas fa-redo"></i>
          Retry Connection
        </button>
      </div>
    {:else if status === "idle" && !result}
      <div class="start-state">
        <div class="description">
          <p>
            Run a thorough analysis of the codebase to understand this feedback
            in depth.
          </p>
          <ul class="features">
            <li>
              <i class="fas fa-search"></i> Explores files related to the feedback
            </li>
            <li><i class="fas fa-code"></i> Traces imports and data flow</li>
            <li>
              <i class="fas fa-brain"></i> Builds understanding until confident
            </li>
            <li>
              <i class="fas fa-clipboard-list"></i> Generates implementation game
              plan
            </li>
          </ul>
        </div>
        <button
          class="start-button"
          onclick={startAnalysis}
          disabled={!canStart}
        >
          <i class="fas fa-play"></i>
          Start Deep Analysis
        </button>
      </div>
    {:else if status === "running"}
      <div class="running-state">
        <div class="progress-header">
          <div class="metrics">
            <div class="metric">
              <span class="label">Confidence</span>
              <span class="value">{Math.round(confidence)}%</span>
              <div class="progress-bar">
                <div
                  class="progress-fill confidence"
                  style="width: {confidence}%"
                ></div>
              </div>
            </div>
            <div class="metric">
              <span class="label">Iteration</span>
              <span class="value">{iteration}/20</span>
            </div>
            <div class="metric">
              <span class="label">Files</span>
              <span class="value">{filesExplored}</span>
            </div>
          </div>
          <button class="stop-button" onclick={stopAnalysis}>
            <i class="fas fa-stop"></i>
            Stop
          </button>
        </div>

        <div class="current-step">
          <i class="fas fa-spinner fa-spin"></i>
          <span>{currentStep}</span>
        </div>

        <div class="progress-log">
          {#each progress.slice(-10) as event}
            <div class="log-entry {event.type}">
              <span class="log-icon">
                {#if event.type === "tool_call"}
                  <i class="fas fa-wrench"></i>
                {:else if event.type === "thinking"}
                  <i class="fas fa-brain"></i>
                {:else if event.type === "iteration"}
                  <i class="fas fa-sync"></i>
                {:else}
                  <i class="fas fa-info-circle"></i>
                {/if}
              </span>
              <span class="log-message">{event.message.slice(0, 80)}</span>
            </div>
          {/each}
        </div>
      </div>
    {:else if status === "completed" && result}
      <div class="completed-state">
        <div class="result-summary">
          <div class="summary-header">
            <i class="fas fa-check-circle"></i>
            <span>Analysis Complete</span>
            <span class="confidence-badge"
              >{Math.round(confidence)}% confidence</span
            >
          </div>
          <div class="stats">
            <span
              ><i class="fas fa-file-code"></i>
              {result.filesExplored} files explored</span
            >
            <span
              ><i class="fas fa-sync"></i> {result.iterations} iterations</span
            >
          </div>
        </div>

        <div class="result-section">
          <h5>Summary</h5>
          <p>{result.summary}</p>
        </div>

        {#if result.technicalAnalysis}
          <div class="result-section">
            <h5>Technical Analysis</h5>
            <p>{result.technicalAnalysis}</p>
          </div>
        {/if}

        {#if result.affectedFiles.length > 0}
          <div class="result-section">
            <h5>Affected Files</h5>
            <ul class="file-list">
              {#each result.affectedFiles.slice(0, 10) as file}
                <li><code>{file}</code></li>
              {/each}
              {#if result.affectedFiles.length > 10}
                <li class="more">
                  ...and {result.affectedFiles.length - 10} more
                </li>
              {/if}
            </ul>
          </div>
        {/if}

        {#if result.suggestedFix}
          <div class="result-section">
            <h5>Suggested Approach</h5>
            <p>{result.suggestedFix}</p>
          </div>
        {/if}

        {#if result.implementationSteps.length > 0}
          <div class="result-section">
            <h5>Implementation Steps</h5>
            <ol class="steps-list">
              {#each result.implementationSteps as step}
                <li>{step}</li>
              {/each}
            </ol>
          </div>
        {/if}

        {#if result.riskAssessment}
          <div class="result-section warning">
            <h5><i class="fas fa-exclamation-triangle"></i> Risk Assessment</h5>
            <p>{result.riskAssessment}</p>
          </div>
        {/if}

        <div class="actions">
          <button class="copy-button" onclick={copyClaudePrompt}>
            <i class="fas fa-copy"></i>
            Copy Claude Code Prompt
          </button>
          <button class="rerun-button" onclick={startAnalysis}>
            <i class="fas fa-redo"></i>
            Re-analyze
          </button>
        </div>
      </div>
    {:else if status === "error"}
      <div class="error-state">
        <i class="fas fa-exclamation-triangle"></i>
        <div class="error-content">
          <p>Analysis failed</p>
          <span class="error-detail">{error}</span>
        </div>
        <button class="retry-button" onclick={startAnalysis}>
          <i class="fas fa-redo"></i>
          Retry Analysis
        </button>
      </div>
    {/if}
  </div>
</div>

<style>
  .deep-analysis-panel {
    background: rgba(139, 92, 246, 0.05);
    border: 1px solid rgba(139, 92, 246, 0.2);
    border-radius: 12px;
    overflow: hidden;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: rgba(139, 92, 246, 0.1);
    border-bottom: 1px solid rgba(139, 92, 246, 0.15);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .header-left i {
    color: rgba(139, 92, 246, 0.8);
  }

  .header-left h4 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }

  .health-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    background: rgba(239, 68, 68, 0.2);
    border-radius: 12px;
    font-size: 12px;
    color: #ef4444;
  }

  .health-badge.healthy {
    background: rgba(34, 197, 94, 0.2);
    color: #22c55e;
  }

  .panel-content {
    padding: 16px;
  }

  /* States */
  .loading-state,
  .error-state,
  .start-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 24px;
    text-align: center;
  }

  .loading-state i {
    font-size: 24px;
    color: rgba(139, 92, 246, 0.6);
  }

  .loading-state span {
    color: rgba(255, 255, 255, 0.7);
  }

  .error-state i {
    font-size: 28px;
    color: #ef4444;
  }

  .error-content p {
    margin: 0;
    font-weight: 500;
    color: #ef4444;
  }

  .error-detail {
    font-size: 12px;
    color: rgba(239, 68, 68, 0.8);
  }

  .description p {
    margin: 0 0 12px;
    color: rgba(255, 255, 255, 0.7);
  }

  .features {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
    text-align: left;
  }

  .features li {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
  }

  .features li i {
    width: 16px;
    color: rgba(139, 92, 246, 0.6);
  }

  /* Buttons */
  .start-button,
  .retry-button,
  .stop-button,
  .copy-button,
  .rerun-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .start-button {
    background: rgba(139, 92, 246, 0.2);
    border: 1px solid rgba(139, 92, 246, 0.4);
    color: #a78bfa;
  }

  .start-button:hover:not(:disabled) {
    background: rgba(139, 92, 246, 0.3);
    border-color: rgba(139, 92, 246, 0.6);
  }

  .start-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .retry-button {
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #ef4444;
  }

  .stop-button {
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #ef4444;
    padding: 6px 12px;
    font-size: 12px;
  }

  .copy-button {
    background: rgba(34, 197, 94, 0.15);
    border: 1px solid rgba(34, 197, 94, 0.3);
    color: #22c55e;
  }

  .rerun-button {
    background: rgba(139, 92, 246, 0.15);
    border: 1px solid rgba(139, 92, 246, 0.3);
    color: #a78bfa;
  }

  /* Running State */
  .running-state {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .metrics {
    display: flex;
    gap: 24px;
  }

  .metric {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .metric .label {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
  }

  .metric .value {
    font-size: 18px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }

  .progress-bar {
    width: 100px;
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    transition: width 0.3s ease;
  }

  .progress-fill.confidence {
    background: linear-gradient(90deg, #8b5cf6, #22c55e);
  }

  .current-step {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: rgba(139, 92, 246, 0.1);
    border-radius: 8px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.8);
  }

  .current-step i {
    color: rgba(139, 92, 246, 0.8);
  }

  .progress-log {
    max-height: 200px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 8px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    font-family: monospace;
    font-size: 11px;
  }

  .log-entry {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px;
    border-radius: 4px;
  }

  .log-entry.tool_call {
    background: rgba(59, 130, 246, 0.1);
  }

  .log-entry.thinking {
    background: rgba(139, 92, 246, 0.1);
  }

  .log-icon {
    width: 16px;
    color: rgba(255, 255, 255, 0.5);
  }

  .log-message {
    color: rgba(255, 255, 255, 0.6);
  }

  /* Completed State */
  .completed-state {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .result-summary {
    padding: 16px;
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.2);
    border-radius: 8px;
  }

  .summary-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    color: #22c55e;
    font-weight: 500;
  }

  .confidence-badge {
    margin-left: auto;
    padding: 2px 8px;
    background: rgba(34, 197, 94, 0.2);
    border-radius: 12px;
    font-size: 12px;
  }

  .stats {
    display: flex;
    gap: 16px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
  }

  .stats span {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .result-section {
    padding: 12px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 8px;
  }

  .result-section h5 {
    margin: 0 0 8px;
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
  }

  .result-section p {
    margin: 0;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.5;
    white-space: pre-wrap;
  }

  .result-section.warning {
    background: rgba(245, 158, 11, 0.1);
    border-color: rgba(245, 158, 11, 0.2);
  }

  .result-section.warning h5 {
    color: #f59e0b;
  }

  .file-list {
    margin: 0;
    padding-left: 20px;
    font-size: 12px;
  }

  .file-list li {
    margin-bottom: 4px;
    color: rgba(255, 255, 255, 0.7);
  }

  .file-list code {
    font-family: monospace;
    color: rgba(139, 92, 246, 0.9);
  }

  .file-list .more {
    color: rgba(255, 255, 255, 0.5);
    font-style: italic;
  }

  .steps-list {
    margin: 0;
    padding-left: 20px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.6;
  }

  .actions {
    display: flex;
    gap: 12px;
    margin-top: 8px;
  }
</style>
