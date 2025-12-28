<!-- TabSlide - Tab explanation slide for module onboarding -->
<script lang="ts">
  const { icon, title, subtitle, description, features, recommendation, color } =
    $props<{
      icon: string;
      title: string;
      subtitle: string;
      description: string;
      features?: string[];
      recommendation?: string;
      color: string;
    }>();
</script>

<div class="slide-content tab-slide">
  <div class="slide-icon" style="--tab-color: {color}">
    <i class="fas {icon}" aria-hidden="true"></i>
  </div>
  <h1 class="slide-title">{title}</h1>
  <p class="slide-subtitle">{subtitle}</p>
  <p class="slide-description">{description}</p>

  {#if features?.length}
    <ul class="feature-list">
      {#each features as feature}
        <li>
          <i class="fas fa-check" aria-hidden="true"></i>
          {feature}
        </li>
      {/each}
    </ul>
  {/if}

  {#if recommendation}
    <span class="recommendation">{recommendation}</span>
  {/if}
</div>

<style>
  .slide-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    max-width: 500px;
    width: 100%;
  }

  .slide-icon {
    width: 5rem;
    height: 5rem;
    display: grid;
    place-items: center;
    border-radius: 1.5rem;
    font-size: 2.5rem;
    margin-bottom: 1.25rem;
    background: var(--theme-card-bg);
    color: var(--tab-color);
    position: relative;
  }

  .slide-icon::before {
    content: "";
    position: absolute;
    inset: 0;
    background: var(--tab-color);
    opacity: 0.15;
    border-radius: 1.5rem;
  }

  .slide-title {
    font-size: clamp(1.5rem, 5vw, 2rem);
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    margin: 0 0 0.25rem;
  }

  .slide-subtitle {
    font-size: 1rem;
    color: var(--theme-text-dim);
    margin: 0 0 0.75rem;
  }

  .slide-description {
    font-size: 0.9375rem;
    color: rgba(255, 255, 255, 0.45);
    margin: 0 0 1rem;
    line-height: 1.5;
  }

  .feature-list {
    list-style: none;
    padding: 0;
    margin: 0 0 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .feature-list li {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9375rem;
    color: var(--theme-text-dim);
  }

  .feature-list i {
    color: var(--semantic-success);
    font-size: 0.75rem;
  }

  .recommendation {
    font-size: 0.8125rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.75); /* WCAG AAA */
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 6px;
  }

  @media (max-width: 500px) {
    .slide-icon {
      width: 4rem;
      height: 4rem;
      font-size: 2rem;
    }

    .feature-list li {
      font-size: 0.875rem;
    }
  }

  @media (min-width: 900px) {
    .slide-content {
      max-width: 600px;
    }

    .slide-icon {
      width: 6rem;
      height: 6rem;
      font-size: 3rem;
      border-radius: 1.75rem;
    }

    .slide-title {
      font-size: 2.25rem;
    }

    .slide-description {
      font-size: 1.0625rem;
    }

    .feature-list li {
      font-size: 1rem;
    }
  }
</style>
