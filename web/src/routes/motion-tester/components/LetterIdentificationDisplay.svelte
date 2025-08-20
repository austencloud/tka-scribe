<!--
LetterIdentificationDisplay.svelte - Display identified TKA letter

Shows the TKA letter that corresponds to the current motion parameters
with confidence level and matching details.
-->
<script lang="ts">
  import type { LetterIdentificationResult } from "../services/MotionLetterIdentificationService";

  interface Props {
    identificationResult: LetterIdentificationResult;
  }

  let { identificationResult }: Props = $props();

  // Reactive computed values with null safety
  const hasLetter = $derived(identificationResult?.letter !== null);
  const confidenceClass = $derived(() => {
    if (!identificationResult) return "confidence-none";
    switch (identificationResult.confidence) {
      case "exact":
        return "confidence-exact";
      case "partial":
        return "confidence-partial";
      case "none":
      default:
        return "confidence-none";
    }
  });

  const confidenceText = $derived(() => {
    if (!identificationResult) return "No Match";
    switch (identificationResult.confidence) {
      case "exact":
        return "Exact Match";
      case "partial":
        return "Partial Match";
      case "none":
      default:
        return "No Match";
    }
  });

  const confidenceIcon = $derived(() => {
    if (!identificationResult) return "❌";
    switch (identificationResult.confidence) {
      case "exact":
        return "✅";
      case "partial":
        return "🔍";
      case "none":
      default:
        return "❌";
    }
  });
</script>

<div class="letter-identification-display">
  <header class="display-header">
    <h3>🔤 Identified Letter</h3>
  </header>

  <div class="identification-content">
    {#if hasLetter}
      <div class="letter-result {confidenceClass}">
        <div class="letter-display">
          <span class="letter-text">{identificationResult?.letter || "?"}</span>
          <div class="confidence-badge">
            <span class="confidence-icon" aria-hidden="true"
              >{confidenceIcon}</span
            >
            <span class="confidence-text">{confidenceText}</span>
          </div>
        </div>

        {#if identificationResult?.matchedParameters?.length > 0}
          <div class="matched-parameters">
            <h4>✅ Matched Parameters:</h4>
            <ul class="parameter-list">
              {#each identificationResult.matchedParameters as param}
                <li class="matched-param">{param}</li>
              {/each}
            </ul>
          </div>
        {/if}

        {#if identificationResult?.missingParameters?.length > 0}
          <div class="missing-parameters">
            <h4>❌ Missing/Different Parameters:</h4>
            <ul class="parameter-list">
              {#each identificationResult.missingParameters as param}
                <li class="missing-param">{param}</li>
              {/each}
            </ul>
          </div>
        {/if}
      </div>
    {:else}
      <div class="no-letter-result">
        <div class="no-match-icon">🤷‍♂️</div>
        <p class="no-match-text">
          No TKA letter matches the current motion parameters.
        </p>
        <p class="suggestion-text">
          Try adjusting the motion parameters to find a matching letter.
        </p>
      </div>
    {/if}
  </div>
</div>

<style>
  .letter-identification-display {
    background: var(--surface-color, #f8f9fa);
    border: 1px solid var(--border-color, #e9ecef);
    border-radius: 8px;
    padding: 16px;
    margin: 16px 0;
  }

  .display-header {
    margin-bottom: 12px;
  }

  .display-header h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary, #212529);
  }

  .identification-content {
    min-height: 80px;
  }

  /* Letter Result Styles */
  .letter-result {
    padding: 12px;
    border-radius: 6px;
    border: 2px solid;
  }

  .confidence-exact {
    background: #d4edda;
    border-color: #28a745;
    color: #155724;
  }

  .confidence-partial {
    background: #fff3cd;
    border-color: #ffc107;
    color: #856404;
  }

  .confidence-none {
    background: #f8d7da;
    border-color: #dc3545;
    color: #721c24;
  }

  .letter-display {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .letter-text {
    font-size: 2.5rem;
    font-weight: bold;
    font-family: "Georgia", serif;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
  }

  .confidence-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: 500;
  }

  .confidence-icon {
    font-size: 1rem;
  }

  /* Parameter Lists */
  .matched-parameters,
  .missing-parameters {
    margin-top: 12px;
  }

  .matched-parameters h4,
  .missing-parameters h4 {
    margin: 0 0 6px 0;
    font-size: 0.9rem;
    font-weight: 600;
  }

  .parameter-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .matched-param,
  .missing-param {
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 0.8rem;
    font-weight: 500;
  }

  .matched-param {
    background: rgba(40, 167, 69, 0.2);
    color: #155724;
  }

  .missing-param {
    background: rgba(220, 53, 69, 0.2);
    color: #721c24;
    font-family: monospace;
  }

  /* No Letter Result */
  .no-letter-result {
    text-align: center;
    padding: 20px;
    color: var(--text-secondary, #6c757d);
  }

  .no-match-icon {
    font-size: 2rem;
    margin-bottom: 8px;
  }

  .no-match-text {
    margin: 0 0 8px 0;
    font-weight: 500;
  }

  .suggestion-text {
    margin: 0;
    font-size: 0.9rem;
    font-style: italic;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .letter-identification-display {
      padding: 12px;
      margin: 12px 0;
    }

    .letter-display {
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .letter-text {
      font-size: 2rem;
    }

    .parameter-list {
      justify-content: center;
    }
  }
</style>
