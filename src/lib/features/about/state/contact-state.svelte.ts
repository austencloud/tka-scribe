/**
 * Contact State Factory
 *
 * Svelte 5 runes-based state management for contact form.
 * Handles form data, validation, and submission status.
 */

import type {
  ContactFormData,
  ContactFormErrors,
  ContactSubmitStatus,
} from "../domain/models/contact-models";

/**
 * Create contact form state with reactive validation
 */
export function createContactState() {
  // Reactive state using Svelte 5 $state rune
  let formData = $state<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  let submitStatus = $state<ContactSubmitStatus>("idle");

  // Derived validation using $derived rune
  const formErrors = $derived.by((): ContactFormErrors => {
    const errors: ContactFormErrors = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.subject.trim()) {
      errors.subject = "Subject is required";
    }

    if (!formData.message.trim()) {
      errors.message = "Message is required";
    }

    return errors;
  });

  // Derived computed values
  const isFormValid = $derived(Object.keys(formErrors).length === 0);
  const isSubmitting = $derived(submitStatus === "submitting");

  // Actions to mutate state
  function updateField<K extends keyof ContactFormData>(
    field: K,
    value: ContactFormData[K]
  ) {
    formData[field] = value;
  }

  function resetForm() {
    formData = {
      name: "",
      email: "",
      subject: "",
      message: "",
    };
    submitStatus = "idle";
  }

  function setSubmitStatus(status: ContactSubmitStatus) {
    submitStatus = status;
  }

  // Return public API with getters
  /**
   * Submit the form
   */
  async function submitForm(): Promise<void> {
    if (!isFormValid || isSubmitting) {
      return;
    }

    submitStatus = "submitting";

    try {
      // Simulate form submission - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Reset form on success
      resetForm();
      submitStatus = "success";
      console.log("📧 Contact form submitted successfully");
    } catch (error) {
      console.error("Form submission error:", error);
      submitStatus = "error";
      throw error;
    }
  }

  return {
    // Getters for reactive state
    get formData() {
      return formData;
    },
    get formErrors() {
      return formErrors;
    },
    get isFormValid() {
      return isFormValid;
    },
    get isSubmitting() {
      return isSubmitting;
    },
    get submitStatus() {
      return submitStatus;
    },

    // Actions
    updateField,
    resetForm,
    setSubmitStatus,
    submitForm,
  };
}

export type ContactState = ReturnType<typeof createContactState>;
