<!-- ContactForm.svelte - Controlled contact form component -->
<script lang="ts">
  import type {
    ContactFormData,
    ContactFormErrors,
    ContactSubmitStatus,
  } from "../../../domain/models/contact-models";
  import CheckIcon from "../icons/CheckIcon.svelte";
  import ErrorIcon from "./../icons/ErrorIcon.svelte";
  import SpinnerIcon from "./../icons/SpinnerIcon.svelte";

  // Props from external state management
  const {
    formData,
    formErrors,
    isFormValid,
    isSubmitting,
    submitStatus,
    onFieldUpdate,
    onSubmit,
  } = $props<{
    formData: ContactFormData;
    formErrors: ContactFormErrors;
    isFormValid: boolean;
    isSubmitting: boolean;
    submitStatus: ContactSubmitStatus;
    onFieldUpdate: (field: keyof ContactFormData, value: string) => void;
    onSubmit: () => Promise<void>;
  }>();

  function handleFieldChange(
    field: keyof ContactFormData,
    event: Event & {
      currentTarget: EventTarget & (HTMLInputElement | HTMLTextAreaElement);
    }
  ) {
    onFieldUpdate(field, event.currentTarget.value);
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    await onSubmit();
  }
</script>

<div class="contact-form-container">
  <h2>Send a Message</h2>
  <p class="form-description">
    Fill out the form below and I'll get back to you as soon as possible.
  </p>

  <form onsubmit={handleSubmit} class="contact-form">
    <div class="form-row">
      <div class="form-group">
        <label for="name">Name *</label>
        <input
          type="text"
          id="name"
          value={formData.name}
          oninput={(e) => handleFieldChange("name", e)}
          required
          placeholder="Your name"
          class="form-input"
          class:error={formErrors.name}
        />
        {#if formErrors.name}
          <span class="error-text">{formErrors.name}</span>
        {/if}
      </div>

      <div class="form-group">
        <label for="email">Email *</label>
        <input
          type="email"
          id="email"
          value={formData.email}
          oninput={(e) => handleFieldChange("email", e)}
          required
          placeholder="your.email@example.com"
          class="form-input"
          class:error={formErrors.email}
        />
        {#if formErrors.email}
          <span class="error-text">{formErrors.email}</span>
        {/if}
      </div>
    </div>

    <div class="form-group">
      <label for="subject">Subject</label>
      <input
        type="text"
        id="subject"
        value={formData.subject}
        oninput={(e) => handleFieldChange("subject", e)}
        placeholder="What's this about?"
        class="form-input"
      />
    </div>

    <div class="form-group">
      <label for="message">Message *</label>
      <textarea
        id="message"
        value={formData.message}
        oninput={(e) => handleFieldChange("message", e)}
        required
        placeholder="Tell me about your question, suggestion, or how you'd like to contribute..."
        rows="6"
        class="form-textarea"
        class:error={formErrors.message}
      ></textarea>
      {#if formErrors.message}
        <span class="error-text">{formErrors.message}</span>
      {/if}
    </div>

    <button
      type="submit"
      disabled={isSubmitting || !isFormValid}
      class="submit-button"
      class:submitting={isSubmitting}
    >
      {#if isSubmitting}
        <SpinnerIcon />
        Sending...
      {:else}
        Send Message
      {/if}
    </button>

    {#if submitStatus === "success"}
      <div class="status-message success">
        <CheckIcon />
        Thank you! Your message has been sent successfully.
      </div>
    {:else if submitStatus === "error"}
      <div class="status-message error">
        <ErrorIcon />
        Please check your information and try again.
      </div>
    {/if}
  </form>
</div>

<style>
  .contact-form-container {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-2xl);
  }

  .contact-form-container h2 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-color);
    margin-bottom: var(--spacing-sm);
  }

  .form-description {
    color: var(--text-secondary);
    margin-bottom: var(--spacing-xl);
    line-height: 1.5;
  }

  .contact-form {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-md);
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .form-group label {
    font-weight: 500;
    color: var(--text-color);
    font-size: var(--font-size-sm);
  }

  .form-input,
  .form-textarea {
    padding: var(--spacing-md);
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: var(--border-radius);
    color: var(--text-color);
    font-size: var(--font-size-base);
    transition: all 0.2s ease;
  }

  .form-input:focus,
  .form-textarea:focus {
    outline: none;
    border-color: var(--primary-color);
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
  }

  .form-input.error,
  .form-textarea.error {
    border-color: #ef4444;
  }

  .error-text {
    color: #ef4444;
    font-size: var(--font-size-sm);
    margin-top: var(--spacing-xs);
  }

  .form-textarea {
    resize: vertical;
    min-height: 120px;
    font-family: inherit;
  }

  .submit-button {
    padding: var(--spacing-md) var(--spacing-xl);
    background: linear-gradient(
      135deg,
      var(--primary-color),
      var(--secondary-color)
    );
    border: none;
    border-radius: var(--border-radius);
    color: white;
    font-weight: 600;
    font-size: var(--font-size-base);
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    align-self: flex-start;
  }

  .submit-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
  }

  .submit-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .status-message {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    border-radius: var(--border-radius);
    font-weight: 500;
  }

  .status-message.success {
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.3);
    color: #22c55e;
  }

  .status-message.error {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #ef4444;
  }

  @media (max-width: 768px) {
    .form-row {
      grid-template-columns: 1fr;
    }

    .contact-form-container {
      padding: var(--spacing-md);
    }

    .submit-button:hover {
      transform: none;
    }
  }
</style>
