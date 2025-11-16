<!-- ContactSection.svelte - Clean contact section coordinator -->
<script lang="ts">
  import { createContactState } from "../state/contact-state.svelte";
  import ContactForm from "./contact/forms/ContactForm.svelte";
  import SocialLinks from "./contact/social/SocialLinks.svelte";

  // Create contact form state
  const contactState = createContactState();
</script>

<section class="contact-section">
  <div class="contact-section-content">
    <div class="contact-grid">
      <!-- Contact Info & Social -->
      <div class="info-column">
        <SocialLinks />
      </div>

      <!-- Contact Form -->
      <div class="form-column">
        <ContactForm
          formData={contactState.formData}
          formErrors={contactState.formErrors}
          isFormValid={contactState.isFormValid}
          isSubmitting={contactState.isSubmitting}
          submitStatus={contactState.submitStatus}
          onFieldUpdate={contactState.updateField}
          onSubmit={contactState.submitForm}
        />
      </div>
    </div>
  </div>
</section>

<style>
  .contact-section {
    padding: var(--spacing-3xl) 0;
  }

  .contact-section-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--spacing-lg);
  }

  .contact-grid {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-3xl);
    align-items: stretch;
  }

  .info-column {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xl);
  }

  .form-column {
    display: flex;
    flex-direction: column;
  }

  @media (max-width: 768px) {
    .contact-section {
      padding: var(--spacing-2xl) 0;
    }

    .contact-section-content {
      padding: 0 var(--spacing-md);
    }

    .contact-grid {
      gap: var(--spacing-2xl);
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    * {
      transition: none !important;
      animation: none !important;
    }
  }
</style>
