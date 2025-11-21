<!-- ContactInfoCard.svelte - Reusable info card component -->
<script lang="ts">
  import type { Snippet } from "svelte";

  let { icon, title, description, linkText, linkHref } = $props<{
    icon: Snippet,
    title: string,
    description: string,
    linkText: string,
    linkHref: string
  }>();
</script>

<div class="info-card">
  <div class="info-icon">
    {@render icon()}
  </div>
  <div class="info-content">
    <h3>{title}</h3>
    <p>{description}</p>
    <a href={linkHref} class="contact-link">{linkText}</a>
  </div>
</div>

<style>
  .info-card {
    display: flex;
    gap: var(--spacing-lg);
    padding: var(--spacing-xl);
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--border-radius-lg);
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
  }

  .info-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }

  .info-icon {
    flex-shrink: 0;
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
  }

  .info-content {
    flex: 1;
  }

  .info-content h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-color);
    margin-bottom: var(--spacing-sm);
  }

  .info-content p {
    color: var(--text-secondary);
    margin-bottom: var(--spacing-md);
    line-height: 1.6;
  }

  .contact-link {
    display: inline-block;
    color: var(--primary-color);
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s ease;
  }

  .contact-link:hover {
    color: var(--primary-hover);
    text-decoration: underline;
  }

  @media (max-width: 768px) {
    .info-card {
      flex-direction: column;
      text-align: center;
      gap: var(--spacing-md);
    }

    .info-icon {
      margin: 0 auto;
    }
  }
</style>
