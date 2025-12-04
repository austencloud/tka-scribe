<!--
  FeedbackAnalysisSection.svelte - AI-powered feedback analysis section

  Main container for AI analysis UI in the feedback detail panel.
  Displays analysis status, results, clarifying questions, and Claude Code prompts.
  Includes deep codebase analysis with local Ollama for thorough pre-analysis.
-->
<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import type { FeedbackItem } from "../../domain/models/feedback-models";
  import type { FeedbackAnalysis } from "../../domain/models/analysis-models";
  import { getAISettingsService } from "../../services/implementations/AISettingsService";
  import AnalysisStatusBadge from "./AnalysisStatusBadge.svelte";
  import AnalysisResultCard from "./AnalysisResultCard.svelte";
  import ClarifyingQuestionsPanel from "./ClarifyingQuestionsPanel.svelte";
  import DeepAnalysisPanel from "./DeepAnalysisPanel.svelte";

  interface Props {
    feedback: FeedbackItem;
    analysis: FeedbackAnalysis | null;
    isAnalyzing: boolean;
    error: string | null;
    onAnalyze: () => void;
    onSubmitAnswer: (questionId: string, answer: string) => void;
    onPassToUser: (questionId: string) => void;
    onGeneratePrompt: () => void;
    onMarkPromptCopied: (promptId: string) => void;
    onClarify: (clarification: string) => void;
  }

  let {
    feedback,
    analysis,
    isAnalyzing,
    error,
    onAnalyze,
    onSubmitAnswer,
    onPassToUser,
    onGeneratePrompt,
    onMarkPromptCopied,
    onClarify,
  }: Props = $props();

  // Check if AI analysis is enabled
  let aiEnabled = $state(false);
  let checkingSettings = $state(true);
  let showDeepAnalysis = $state(false);
  let deepAnalysisResult = $state<{ claudeCodePrompt?: string } | null>(null);
  let promptCopied = $state(false);

  onMount(async () => {
    try {
      const settingsService = getAISettingsService();
      const settings = await settingsService.getSettings();
      aiEnabled = settings.enabled;
    } catch (err) {
      console.error("Failed to check AI settings:", err);
    } finally {
      checkingSettings = false;
    }
  });

  function handleDeepAnalysisComplete(result: { claudeCodePrompt?: string }) {
    deepAnalysisResult = result;
  }

  async function handleCopyPrompt() {
    if (!latestPrompt) return;
    try {
      await navigator.clipboard.writeText(latestPrompt.prompt);
      promptCopied = true;
      onMarkPromptCopied(latestPrompt.id);
      setTimeout(() => {
        promptCopied = false;
      }, 2000);
    } catch (err) {
      console.error("Failed to copy prompt:", err);
    }
  }

  // Derived states
  const hasUnansweredQuestions = $derived(
    analysis?.clarifyingQuestions.some((q) => q.isRequired && !q.answer) ??
      false
  );

  const latestPrompt = $derived(
    analysis?.claudeCodePrompts[analysis.claudeCodePrompts.length - 1] ?? null
  );
</script>

<div class="analysis-section">
  <header class="section-header">
    <div class="header-title">
      <i class="fas fa-robot"></i>
      <h3>AI Analysis</h3>
    </div>
    <div class="header-actions">
      <button
        class="deep-analysis-toggle"
        class:active={showDeepAnalysis}
        onclick={() => (showDeepAnalysis = !showDeepAnalysis)}
        title="Deep Codebase Analysis with local Ollama"
      >
        <i class="fas fa-microscope"></i>
        <span>Deep</span>
      </button>
      {#if analysis}
        <AnalysisStatusBadge status={analysis.status} />
      {/if}
    </div>
  </header>

  <div class="section-content">
    <!-- Deep Analysis Panel (collapsible) -->
    {#if showDeepAnalysis && aiEnabled}
      <DeepAnalysisPanel {feedback} onComplete={handleDeepAnalysisComplete} />
      <div class="section-divider"></div>
    {/if}

    {#if checkingSettings}
      <div class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <span>Checking AI settings...</span>
      </div>
    {:else if !aiEnabled}
      <div class="disabled-state">
        <i class="fas fa-power-off"></i>
        <p>AI Analysis is disabled</p>
        <span class="hint">Enable it in Settings &gt; AI Analysis</span>
      </div>
    {:else if error}
      <div class="error-state">
        <i class="fas fa-exclamation-triangle"></i>
        <p>{error}</p>
        <button class="retry-button" onclick={onAnalyze} disabled={isAnalyzing}>
          <i class="fas fa-redo"></i>
          Retry Analysis
        </button>
      </div>
    {:else if !analysis}
      <!-- No analysis yet - show analyze button -->
      <div class="empty-state">
        <p>No analysis yet for this feedback item.</p>
        <button
          class="analyze-button"
          onclick={onAnalyze}
          disabled={isAnalyzing}
        >
          {#if isAnalyzing}
            <i class="fas fa-spinner fa-spin"></i>
            Analyzing...
          {:else}
            <i class="fas fa-magic"></i>
            Analyze with AI
          {/if}
        </button>
      </div>
    {:else}
      <!-- Analysis exists -->
      <div class="analysis-content">
        <!-- Status info bar -->
        <div class="status-info">
          <span class="provider-badge">
            <i
              class="fas {analysis.provider === 'ollama'
                ? 'fa-cube'
                : analysis.provider === 'claude'
                  ? 'fa-comment-alt'
                  : 'fa-brain'}"
            ></i>
            {analysis.provider}
          </span>
          <span class="model-name">{analysis.modelId}</span>
          {#if analysis.tokenUsage}
            <span class="token-usage">
              {analysis.tokenUsage.total} tokens
              {#if analysis.tokenUsage.estimatedCost}
                (${analysis.tokenUsage.estimatedCost.toFixed(4)})
              {/if}
            </span>
          {/if}
        </div>

        <!-- Failed state with retry option -->
        {#if analysis.status === "failed"}
          <div class="failed-state">
            <div class="error-message">
              <i class="fas fa-exclamation-triangle"></i>
              <div class="error-details">
                <p>Analysis failed</p>
                {#if analysis.error}
                  <span class="error-reason">{analysis.error.message}</span>
                {/if}
              </div>
            </div>
            <button
              class="retry-button"
              onclick={onAnalyze}
              disabled={isAnalyzing}
            >
              {#if isAnalyzing}
                <i class="fas fa-spinner fa-spin"></i>
                Retrying...
              {:else}
                <i class="fas fa-redo"></i>
                Retry Analysis
              {/if}
            </button>
          </div>
        {:else}
          <!-- Clarifying Questions (if any unanswered) -->
          {#if hasUnansweredQuestions}
            <ClarifyingQuestionsPanel
              questions={analysis.clarifyingQuestions}
              {onSubmitAnswer}
              {onPassToUser}
            />
          {/if}

          <!-- Analysis Result -->
          {#if analysis.result}
            <AnalysisResultCard
              result={analysis.result}
              showReanalyze={!hasUnansweredQuestions}
              onReanalyze={onAnalyze}
              {onClarify}
              {isAnalyzing}
            />
          {/if}
        {/if}

        <!-- Claude Code Prompt Action -->
        {#if analysis.status === "completed" && analysis.result}
          <div class="prompt-action">
            {#if latestPrompt}
              <button
                class="copy-prompt-button"
                class:copied={promptCopied}
                onclick={handleCopyPrompt}
              >
                {#if promptCopied}
                  <i class="fas fa-check"></i>
                  Copied!
                {:else}
                  <i class="fas fa-clipboard"></i>
                  Copy Claude Code Prompt
                {/if}
              </button>
            {:else}
              <button
                class="generate-prompt-button"
                onclick={onGeneratePrompt}
                disabled={isAnalyzing}
              >
                <i class="fas fa-terminal"></i>
                Generate Claude Code Prompt
              </button>
            {/if}
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .analysis-section {
    background: rgba(99, 102, 241, 0.05);
    border: 1px solid rgba(99, 102, 241, 0.2);
    border-radius: 12px;
    overflow: hidden;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: rgba(99, 102, 241, 0.1);
    border-bottom: 1px solid rgba(99, 102, 241, 0.15);
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .header-title i {
    font-size: 16px;
    color: rgba(99, 102, 241, 0.8);
  }

  .header-title h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .deep-analysis-toggle {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    background: rgba(139, 92, 246, 0.1);
    border: 1px solid rgba(139, 92, 246, 0.2);
    border-radius: 6px;
    color: rgba(139, 92, 246, 0.7);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .deep-analysis-toggle:hover {
    background: rgba(139, 92, 246, 0.2);
    border-color: rgba(139, 92, 246, 0.4);
    color: rgba(139, 92, 246, 0.9);
  }

  .deep-analysis-toggle.active {
    background: rgba(139, 92, 246, 0.3);
    border-color: rgba(139, 92, 246, 0.5);
    color: #a78bfa;
  }

  .deep-analysis-toggle i {
    font-size: 11px;
  }

  .section-divider {
    height: 1px;
    margin: 16px 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(139, 92, 246, 0.3),
      transparent
    );
  }

  .section-content {
    padding: 16px;
  }

  /* States */
  .loading-state,
  .disabled-state,
  .empty-state,
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 24px;
    text-align: center;
  }

  .loading-state i,
  .disabled-state i,
  .error-state i {
    font-size: 24px;
    color: rgba(255, 255, 255, 0.5);
  }

  .error-state i {
    color: #ef4444;
  }

  .loading-state span,
  .disabled-state p,
  .empty-state p {
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
    margin: 0;
  }

  .error-state p {
    color: #ef4444;
    font-size: 14px;
    margin: 0;
  }

  .disabled-state .hint {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
  }

  /* Buttons */
  .analyze-button,
  .retry-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: rgba(99, 102, 241, 0.2);
    border: 1px solid rgba(99, 102, 241, 0.4);
    border-radius: 8px;
    color: rgba(99, 102, 241, 0.9);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .analyze-button:hover:not(:disabled),
  .retry-button:hover:not(:disabled) {
    background: rgba(99, 102, 241, 0.3);
    border-color: rgba(99, 102, 241, 0.6);
  }

  .analyze-button:disabled,
  .retry-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .retry-button {
    background: rgba(239, 68, 68, 0.15);
    border-color: rgba(239, 68, 68, 0.3);
    color: #ef4444;
  }

  .retry-button:hover:not(:disabled) {
    background: rgba(239, 68, 68, 0.25);
  }

  /* Failed state styling */
  .failed-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: rgba(239, 68, 68, 0.05);
    border: 1px solid rgba(239, 68, 68, 0.15);
    border-radius: 8px;
  }

  .error-message {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    color: #ef4444;
  }

  .error-message > i {
    font-size: 20px;
    margin-top: 2px;
  }

  .error-details {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .error-details p {
    margin: 0;
    font-size: 14px;
    font-weight: 500;
  }

  .error-reason {
    font-size: 12px;
    color: rgba(239, 68, 68, 0.8);
    font-family: monospace;
  }

  /* Analysis Content */
  .analysis-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .status-info {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
  }

  .provider-badge {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    text-transform: capitalize;
  }

  .provider-badge i {
    font-size: 10px;
  }

  .model-name {
    font-family: monospace;
    font-size: 11px;
  }

  .token-usage {
    margin-left: auto;
    font-family: monospace;
    font-size: 11px;
    opacity: 0.7;
  }

  /* Prompt Action */
  .prompt-action {
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .copy-prompt-button,
  .generate-prompt-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 10px 16px;
    background: rgba(34, 197, 94, 0.15);
    border: 1px solid rgba(34, 197, 94, 0.3);
    border-radius: 8px;
    color: #22c55e;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .copy-prompt-button:hover,
  .generate-prompt-button:hover:not(:disabled) {
    background: rgba(34, 197, 94, 0.25);
    border-color: rgba(34, 197, 94, 0.5);
  }

  .copy-prompt-button.copied {
    background: #22c55e;
    border-color: #22c55e;
    color: white;
  }

  .generate-prompt-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Accessibility */
  @media (prefers-reduced-motion: reduce) {
    .analyze-button,
    .retry-button,
    .generate-prompt-button,
    .copy-prompt-button {
      transition: none;
    }
  }

  @media (prefers-contrast: high) {
    .analysis-section {
      border-width: 2px;
    }
  }
</style>
