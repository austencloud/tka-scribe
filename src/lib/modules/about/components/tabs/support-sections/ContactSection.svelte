<script lang="ts">
  import { CONTACT_EMAIL } from "$shared/info/domain";
</script>

<!-- Contact Section -->
<section class="contact-section" aria-labelledby="contact-heading">
  <h3 id="contact-heading">Get in Touch</h3>
  <p>
    Have questions or feedback? Email us at
    <a
      href="mailto:{CONTACT_EMAIL}"
      class="email-link"
      aria-label="Email TKA at {CONTACT_EMAIL}">{CONTACT_EMAIL}</a
    >
  </p>
</section>

<style>
  /* Contact Section */
  .contact-section {
    text-align: center;
    max-width: 700px;
    margin-left: auto;
    margin-right: auto;
    padding: clamp(1.5rem, 3vw, 2rem);
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 1.25rem;
    box-shadow:
      0 2px 4px rgba(0, 0, 0, 0.08),
      0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .contact-section h3 {
    color: var(--text-color);
    margin-bottom: var(--spacing-sm);
    font-size: 1.25rem;
  }

  .contact-section p {
    color: var(--text-secondary);
    margin: 0;
  }

  .email-link {
    color: #ec4899;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.3s ease;
  }

  .email-link:hover {
    color: #db2777;
    text-decoration: underline;
  }

  .email-link:focus-visible {
    outline: 2px solid #ec4899;
    outline-offset: 2px;
    border-radius: 2px;
  }
</style>
