<!--
  AnalysisResultCard.svelte - Displays completed analysis results
-->
<script lang="ts">
  import type { AnalysisResult } from "../../domain/models/analysis-models";
  import { CONFIDENCE_DISPLAY, TYPE_SUGGESTIONS } from "../../domain/models/analysis-models";

  interface Props {
    result: AnalysisResult;
    showReanalyze?: boolean;
    isAnalyzing?: boolean;
    onReanalyze?: () => void;
    onClarify?: (clarification: string) => void;
  }

  let {
    result,
    showReanalyze = false,
    isAnalyzing = false,
    onReanalyze,
    onClarify,
  }: Props = $props();

  // Clarification state
  let showClarifyInput = $state(false);
  let clarificationText = $state("");

  function handleClarifyClick() {
    showClarifyInput = true;
  }

  function handleCancelClarify() {
    showClarifyInput = false;
    clarificationText = "";
  }

  function handleSubmitClarify() {
    if (clarificationText.trim() && onClarify) {
      onClarify(clarificationText.trim());
      showClarifyInput = false;
      clarificationText = "";
    }
  }

  const confidenceInfo = $derived(
    CONFIDENCE_DISPLAY[result.confidence] || CONFIDENCE_DISPLAY.low
  );

  const typeInfo = $derived(
    result.suggestedType ? TYPE_SUGGESTIONS[result.suggestedType] : null
  );
</script>

<div class="result-card">
  <!-- Summary -->
  <div class="result-section">
    <h4 class="section-title">Summary</h4>
    <p class="summary-text">{result.summary}</p>
    <div class="confidence-badge" style="--confidence-color: {confidenceInfo.color}">
      <i class="fas {confidenceInfo.icon}"></i>
      <span>{confidenceInfo.label} confidence</span>
    </div>
  </div>

  <!-- Confirmed Facts -->
  {#if result.confirmedFacts && result.confirmedFacts.length > 0}
    <div class="result-section">
      <h4 class="section-title">Confirmed Facts</h4>
      <ul class="facts-list">
        {#each result.confirmedFacts as fact}
          <li>
            <i class="fas fa-check"></i>
            <span>{fact}</span>
          </li>
        {/each}
      </ul>
    </div>
  {/if}

  <!-- Suggested Classification -->
  {#if result.suggestedType || result.suggestedPriority || result.suggestedModule}
    <div class="result-section">
      <h4 class="section-title">Suggested Classification</h4>
      <div class="classification-grid">
        {#if result.suggestedType && typeInfo}
          <div class="classification-item">
            <span class="item-label">Type</span>
            <span class="item-value" style="color: {typeInfo.color}">
              <i class="fas {typeInfo.icon}"></i>
              {typeInfo.label}
            </span>
          </div>
        {/if}
        {#if result.suggestedPriority}
          <div class="classification-item">
            <span class="item-label">Priority</span>
            <span class="item-value priority-{result.suggestedPriority}">
              {result.suggestedPriority}
            </span>
          </div>
        {/if}
        {#if result.suggestedModule}
          <div class="classification-item">
            <span class="item-label">Module</span>
            <span class="item-value">{result.suggestedModule}</span>
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Affected Areas -->
  {#if result.affectedAreas && result.affectedAreas.length > 0}
    <div class="result-section">
      <h4 class="section-title">Affected Areas</h4>
      <div class="areas-list">
        {#each result.affectedAreas as area}
          <span class="area-tag">{area}</span>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Suggested Actions -->
  {#if result.suggestedActions && result.suggestedActions.length > 0}
    <div class="result-section">
      <h4 class="section-title">Suggested Actions</h4>
      <ul class="actions-list">
        {#each result.suggestedActions as action, index}
          <li>
            <span class="action-number">{index + 1}</span>
            <span>{action}</span>
          </li>
        {/each}
      </ul>
    </div>
  {/if}

  <!-- Technical Notes -->
  {#if result.technicalNotes}
    <div class="result-section">
      <h4 class="section-title">Technical Notes</h4>
      <p class="technical-notes">{result.technicalNotes}</p>
    </div>
  {/if}

  <!-- Action Buttons -->
  {#if showReanalyze && (onReanalyze || onClarify)}
    <div class="actions-section">
      {#if showClarifyInput}
        <!-- Clarification Input -->
        <div class="clarify-input-section">
          <label for="clarify-input" class="clarify-label">
            <i class="fas fa-comment-dots"></i>
            Provide clarification or correction:
          </label>
          <textarea
            id="clarify-input"
            class="clarify-textarea"
            bind:value={clarificationText}
            placeholder="Explain what the AI misunderstood or provide additional context..."
            rows="3"
            disabled={isAnalyzing}
          ></textarea>
          <div class="clarify-buttons">
            <button
              class="clarify-cancel-button"
              onclick={handleCancelClarify}
              disabled={isAnalyzing}
            >
              Cancel
            </button>
            <button
              class="clarify-submit-button"
              onclick={handleSubmitClarify}
              disabled={isAnalyzing || !clarificationText.trim()}
            >
              {#if isAnalyzing}
                <i class="fas fa-spinner fa-spin"></i>
                Reanalyzing...
              {:else}
                <i class="fas fa-paper-plane"></i>
                Submit Clarification
              {/if}
            </button>
          </div>
        </div>
      {:else}
        <!-- Action Buttons Row -->
        <div class="button-row">
          {#if onClarify}
            <button
              class="clarify-button"
              onclick={handleClarifyClick}
              disabled={isAnalyzing}
            >
              <i class="fas fa-comment-dots"></i>
              Clarify
            </button>
          {/if}
          {#if onReanalyze}
            <button
              class="reanalyze-button"
              onclick={onReanalyze}
              disabled={isAnalyzing}
            >
              {#if isAnalyzing}
                <i class="fas fa-spinner fa-spin"></i>
                Reanalyzing...
              {:else}
                <i class="fas fa-sync-alt"></i>
                Reanalyze
              {/if}
            </button>
          {/if}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .result-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    padding: 16px;
  }

  .result-section {
    margin-bottom: 16px;
  }

  .result-section:last-child {
    margin-bottom: 0;
  }

  .section-title {
    font-size: 12px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0 0 8px 0;
  }

  /* Summary */
  .summary-text {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.5;
    margin: 0 0 8px 0;
  }

  .confidence-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    font-size: 11px;
    color: var(--confidence-color);
  }

  .confidence-badge i {
    font-size: 10px;
  }

  /* Facts List */
  .facts-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .facts-list li {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.85);
  }

  .facts-list li i {
    font-size: 10px;
    color: #22c55e;
    margin-top: 4px;
    flex-shrink: 0;
  }

  /* Classification Grid */
  .classification-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 12px;
  }

  .classification-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .item-label {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
  }

  .item-value {
    font-size: 13px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .item-value i {
    font-size: 11px;
  }

  .priority-critical { color: #ef4444; }
  .priority-high { color: #f97316; }
  .priority-medium { color: #eab308; }
  .priority-low { color: #22c55e; }

  /* Areas List */
  .areas-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .area-tag {
    padding: 4px 10px;
    background: rgba(99, 102, 241, 0.15);
    border: 1px solid rgba(99, 102, 241, 0.3);
    border-radius: 12px;
    font-size: 12px;
    font-family: monospace;
    color: rgba(99, 102, 241, 0.9);
  }

  /* Actions List */
  .actions-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .actions-list li {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.85);
  }

  .action-number {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(99, 102, 241, 0.2);
    border-radius: 50%;
    font-size: 11px;
    font-weight: 600;
    color: rgba(99, 102, 241, 0.9);
  }

  /* Technical Notes */
  .technical-notes {
    font-size: 13px;
    font-family: monospace;
    color: rgba(255, 255, 255, 0.7);
    background: rgba(0, 0, 0, 0.2);
    padding: 12px;
    border-radius: 6px;
    margin: 0;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
  }

  /* Actions Section */
  .actions-section {
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    margin-top: 16px;
  }

  .button-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .reanalyze-button,
  .clarify-button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .reanalyze-button:hover:not(:disabled),
  .clarify-button:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.9);
  }

  .reanalyze-button:disabled,
  .clarify-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Clarify Button - more prominent */
  .clarify-button {
    background: rgba(245, 158, 11, 0.15);
    border-color: rgba(245, 158, 11, 0.3);
    color: rgba(245, 158, 11, 0.9);
  }

  .clarify-button:hover:not(:disabled) {
    background: rgba(245, 158, 11, 0.25);
    border-color: rgba(245, 158, 11, 0.5);
    color: #f59e0b;
  }

  /* Clarify Input Section */
  .clarify-input-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .clarify-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 500;
    color: rgba(245, 158, 11, 0.9);
  }

  .clarify-label i {
    font-size: 14px;
  }

  .clarify-textarea {
    width: 100%;
    padding: 12px;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(245, 158, 11, 0.3);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 13px;
    font-family: inherit;
    line-height: 1.5;
    resize: vertical;
    min-height: 80px;
  }

  .clarify-textarea:focus {
    outline: none;
    border-color: rgba(245, 158, 11, 0.5);
    box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.1);
  }

  .clarify-textarea::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  .clarify-textarea:disabled {
    opacity: 0.6;
  }

  .clarify-buttons {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }

  .clarify-cancel-button {
    padding: 8px 14px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .clarify-cancel-button:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.9);
  }

  .clarify-cancel-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .clarify-submit-button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: rgba(245, 158, 11, 0.2);
    border: 1px solid rgba(245, 158, 11, 0.4);
    border-radius: 6px;
    color: #f59e0b;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .clarify-submit-button:hover:not(:disabled) {
    background: rgba(245, 158, 11, 0.3);
    border-color: rgba(245, 158, 11, 0.6);
  }

  .clarify-submit-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Accessibility */
  @media (prefers-reduced-motion: reduce) {
    .reanalyze-button,
    .clarify-button,
    .clarify-cancel-button,
    .clarify-submit-button {
      transition: none;
    }
  }
</style>
