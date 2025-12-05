/**
 * Feedback Submit State
 *
 * State management for the feedback submission form.
 */

import type {
  FeedbackFormData,
  FeedbackFormErrors,
  FeedbackSubmitStatus,
  FeedbackType,
} from "../domain/models/feedback-models";
import { feedbackService } from "../services/implementations/FeedbackService";
import { getCapturedModule, getCapturedTab } from "./feedback-context-tracker.svelte";

/**
 * Creates feedback submit form state
 */
export function createFeedbackSubmitState() {
  // Capture context at creation time (before user navigates to feedback)
  const initialCapturedModule = getCapturedModule();
  const initialCapturedTab = getCapturedTab();

  // Form data (simplified - just type, title, description)
  let formData = $state<FeedbackFormData>({
    type: "general",
    title: "",
    description: "",
  });

  // Attached images
  let images = $state<File[]>([]);

  // Form errors
  let formErrors = $state<FeedbackFormErrors>({});

  // Submission status
  let submitStatus = $state<FeedbackSubmitStatus>("idle");

  // Derived state
  const isSubmitting = $derived(submitStatus === "submitting");

  // Only description is required - AI will generate title if needed
  const isFormValid = $derived(
    formData.description.trim().length >= 10
  );

  // Actions
  function updateField<K extends keyof FeedbackFormData>(
    field: K,
    value: FeedbackFormData[K]
  ) {
    formData = { ...formData, [field]: value };

    // Clear error when field is updated
    if (formErrors[field as keyof FeedbackFormErrors]) {
      formErrors = { ...formErrors, [field]: undefined };
    }
  }

  function setType(type: FeedbackType) {
    updateField("type", type);
  }

  function validate(): boolean {
    const errors: FeedbackFormErrors = {};

    // Only description is required - title is optional (AI will generate if needed)

    if (!formData.description.trim()) {
      errors.description = "Description is required";
    } else if (formData.description.trim().length < 10) {
      errors.description = "Please provide a bit more detail (at least 10 characters)";
    }

    formErrors = errors;
    return Object.keys(errors).length === 0;
  }

  async function submit(): Promise<boolean> {
    if (!validate()) {
      return false;
    }

    submitStatus = "submitting";

    try {
      // Get captured context
      const capturedModule = getCapturedModule();
      const capturedTab = getCapturedTab();

      await feedbackService.submitFeedback(
        formData,
        capturedModule,
        capturedTab,
        images.length > 0 ? images : undefined
      );
      submitStatus = "success";
      return true;
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      submitStatus = "error";
      return false;
    }
  }

  function reset() {
    formData = {
      type: "general",
      title: "",
      description: "",
    };
    images = [];
    formErrors = {};
    submitStatus = "idle";
  }

  return {
    // State
    get formData() {
      return formData;
    },
    get images() {
      return images;
    },
    set images(value: File[]) {
      images = value;
    },
    get formErrors() {
      return formErrors;
    },
    get submitStatus() {
      return submitStatus;
    },
    get isSubmitting() {
      return isSubmitting;
    },
    get isFormValid() {
      return isFormValid;
    },
    // Captured context (frozen at state creation time)
    get capturedModule() {
      return initialCapturedModule;
    },
    get capturedTab() {
      return initialCapturedTab;
    },

    // Actions
    updateField,
    setType,
    validate,
    submit,
    reset,
  };
}

export type FeedbackSubmitState = ReturnType<typeof createFeedbackSubmitState>;
