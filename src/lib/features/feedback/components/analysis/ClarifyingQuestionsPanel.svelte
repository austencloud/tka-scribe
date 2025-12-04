<!--
  ClarifyingQuestionsPanel.svelte - Question/answer interface for clarifying questions
-->
<script lang="ts">
  import type { ClarifyingQuestion } from "../../domain/models/analysis-models";

  interface Props {
    questions: ClarifyingQuestion[];
    onSubmitAnswer: (questionId: string, answer: string) => void;
    onPassToUser: (questionId: string) => void;
  }

  let { questions, onSubmitAnswer, onPassToUser }: Props = $props();

  // Track answer inputs
  let answerInputs: Record<string, string> = $state({});
  let submitting: Record<string, boolean> = $state({});

  // Filter to unanswered questions
  const unansweredQuestions = $derived(
    questions.filter((q) => !q.answer)
  );

  const answeredQuestions = $derived(
    questions.filter((q) => q.answer)
  );

  async function handleSubmit(questionId: string) {
    const answer = answerInputs[questionId]?.trim();
    if (!answer) return;

    submitting = { ...submitting, [questionId]: true };
    try {
      onSubmitAnswer(questionId, answer);
      answerInputs = { ...answerInputs, [questionId]: "" };
    } finally {
      submitting = { ...submitting, [questionId]: false };
    }
  }

  function handleSuggestionClick(questionId: string, suggestion: string) {
    answerInputs = { ...answerInputs, [questionId]: suggestion };
  }
</script>

<div class="questions-panel">
  <header class="panel-header">
    <i class="fas fa-question-circle"></i>
    <h4>Clarifying Questions</h4>
    {#if unansweredQuestions.length > 0}
      <span class="question-count">{unansweredQuestions.length} remaining</span>
    {/if}
  </header>

  <div class="questions-list">
    <!-- Unanswered Questions -->
    {#each unansweredQuestions as question (question.id)}
      <div class="question-card" class:required={question.isRequired}>
        <div class="question-header">
          <span class="question-text">{question.question}</span>
          {#if question.isRequired}
            <span class="required-badge">Required</span>
          {/if}
        </div>

        {#if question.passedToUser}
          <div class="passed-to-user">
            <i class="fas fa-user-clock"></i>
            <span>Waiting for user response</span>
          </div>
        {:else}
          <!-- Suggested Answers -->
          {#if question.suggestedAnswers && question.suggestedAnswers.length > 0}
            <div class="suggestions">
              <span class="suggestions-label">Suggestions:</span>
              <div class="suggestion-buttons">
                {#each question.suggestedAnswers as suggestion}
                  <button
                    class="suggestion-button"
                    onclick={() => handleSuggestionClick(question.id, suggestion)}
                    disabled={submitting[question.id]}
                  >
                    {suggestion}
                  </button>
                {/each}
              </div>
            </div>
          {/if}

          <!-- Answer Input -->
          <div class="answer-input">
            <textarea
              placeholder="Type your answer..."
              bind:value={answerInputs[question.id]}
              rows="2"
              disabled={submitting[question.id]}
            ></textarea>
            <div class="answer-actions">
              <button
                class="submit-button"
                onclick={() => handleSubmit(question.id)}
                disabled={submitting[question.id] || !answerInputs[question.id]?.trim()}
              >
                {#if submitting[question.id]}
                  <i class="fas fa-spinner fa-spin"></i>
                {:else}
                  <i class="fas fa-check"></i>
                {/if}
                Submit
              </button>
              <button
                class="pass-button"
                onclick={() => onPassToUser(question.id)}
                disabled={submitting[question.id]}
                title="Pass this question to the original user"
              >
                <i class="fas fa-user-tag"></i>
                Ask User
              </button>
            </div>
          </div>
        {/if}
      </div>
    {/each}

    <!-- Answered Questions (collapsed) -->
    {#if answeredQuestions.length > 0}
      <details class="answered-section">
        <summary>
          <i class="fas fa-check-circle"></i>
          <span>{answeredQuestions.length} answered question{answeredQuestions.length === 1 ? '' : 's'}</span>
        </summary>
        <div class="answered-list">
          {#each answeredQuestions as question (question.id)}
            <div class="answered-question">
              <div class="answered-q">
                <i class="fas fa-q"></i>
                <span>{question.question}</span>
              </div>
              <div class="answered-a">
                <i class="fas fa-a"></i>
                <span>{question.answer}</span>
                <span class="answered-by">
                  - {question.answeredBy === "admin" ? "Admin" : "User"}
                </span>
              </div>
            </div>
          {/each}
        </div>
      </details>
    {/if}
  </div>
</div>

<style>
  .questions-panel {
    background: rgba(245, 158, 11, 0.08);
    border: 1px solid rgba(245, 158, 11, 0.25);
    border-radius: 10px;
    overflow: hidden;
  }

  .panel-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 14px;
    background: rgba(245, 158, 11, 0.12);
    border-bottom: 1px solid rgba(245, 158, 11, 0.2);
  }

  .panel-header i {
    font-size: 14px;
    color: #f59e0b;
  }

  .panel-header h4 {
    margin: 0;
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }

  .question-count {
    margin-left: auto;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.6);
  }

  .questions-list {
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  /* Question Card */
  .question-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 14px;
  }

  .question-card.required {
    border-color: rgba(245, 158, 11, 0.3);
  }

  .question-header {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 12px;
  }

  .question-text {
    flex: 1;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.4;
  }

  .required-badge {
    padding: 2px 8px;
    background: rgba(245, 158, 11, 0.2);
    border-radius: 10px;
    font-size: 10px;
    font-weight: 600;
    color: #f59e0b;
    text-transform: uppercase;
    flex-shrink: 0;
  }

  .passed-to-user {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: rgba(99, 102, 241, 0.1);
    border-radius: 6px;
    font-size: 13px;
    color: rgba(99, 102, 241, 0.9);
  }

  .passed-to-user i {
    font-size: 14px;
  }

  /* Suggestions */
  .suggestions {
    margin-bottom: 12px;
  }

  .suggestions-label {
    display: block;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 6px;
  }

  .suggestion-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .suggestion-button {
    padding: 6px 12px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 14px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .suggestion-button:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.25);
  }

  .suggestion-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Answer Input */
  .answer-input {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .answer-input textarea {
    width: 100%;
    padding: 10px;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 6px;
    color: white;
    font-size: 13px;
    font-family: inherit;
    resize: vertical;
    min-height: 60px;
  }

  .answer-input textarea:focus {
    outline: none;
    border-color: rgba(245, 158, 11, 0.5);
  }

  .answer-input textarea:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .answer-actions {
    display: flex;
    gap: 8px;
  }

  .submit-button,
  .pass-button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .submit-button {
    background: rgba(34, 197, 94, 0.2);
    border: 1px solid rgba(34, 197, 94, 0.4);
    color: #22c55e;
  }

  .submit-button:hover:not(:disabled) {
    background: rgba(34, 197, 94, 0.3);
  }

  .submit-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .pass-button {
    background: rgba(99, 102, 241, 0.15);
    border: 1px solid rgba(99, 102, 241, 0.3);
    color: rgba(99, 102, 241, 0.9);
  }

  .pass-button:hover:not(:disabled) {
    background: rgba(99, 102, 241, 0.25);
  }

  .pass-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Answered Section */
  .answered-section {
    margin-top: 8px;
  }

  .answered-section summary {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    background: rgba(34, 197, 94, 0.1);
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    color: #22c55e;
    list-style: none;
  }

  .answered-section summary::-webkit-details-marker {
    display: none;
  }

  .answered-section summary i {
    font-size: 12px;
  }

  .answered-list {
    padding: 12px 0 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .answered-question {
    padding: 10px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 6px;
  }

  .answered-q,
  .answered-a {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 13px;
  }

  .answered-q {
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 8px;
  }

  .answered-a {
    color: rgba(255, 255, 255, 0.9);
  }

  .answered-q i,
  .answered-a i {
    font-size: 10px;
    margin-top: 4px;
    opacity: 0.5;
  }

  .answered-by {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.5);
    margin-left: auto;
  }

  /* Accessibility */
  @media (prefers-reduced-motion: reduce) {
    .suggestion-button,
    .submit-button,
    .pass-button {
      transition: none;
    }
  }
</style>
