<!-- IntroSection.svelte - Introduction and Impact Message -->
<section class="intro-section">
  <h1>Support TKA</h1>
  <p class="intro-text">
    TKA Studio is <strong>free and open source</strong>. Your support helps keep
    it alive and growing. Whether you contribute financially or help build the
    platform,
    <strong>every contribution makes a difference</strong>.
  </p>
  <div class="impact-message">
    <i class="fas fa-heart impact-icon"></i>
    <p>
      Donations fund hosting costs, development time, and help us keep TKA free
      for the entire flow arts community
    </p>
  </div>
</section>

<style>
  /* Introduction Section */
  .intro-section {
    text-align: center;
    max-width: 800px;
    padding-bottom: clamp(1rem, 3vw, 2rem);
    margin-left: auto;
    margin-right: auto;
  }

  .intro-section h1 {
    font-size: clamp(2rem, 4vw, 2.5rem);
    margin-bottom: var(--spacing-md);
    background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 900;
  }

  .intro-text {
    font-size: 1rem;
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: var(--spacing-lg);
  }

  .intro-text strong {
    color: var(--text-color);
    font-weight: 600;
  }

  /* Impact Message */
  .impact-message {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-md);
    padding: var(--spacing-md) var(--spacing-lg);
    background: linear-gradient(
      135deg,
      rgba(236, 72, 153, 0.08) 0%,
      rgba(219, 39, 119, 0.04) 100%
    );
    border: 1px solid rgba(236, 72, 153, 0.2);
    border-radius: 0.75rem;
    margin-top: var(--spacing-lg);
  }

  .impact-icon {
    font-size: 1.5rem;
    background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: pulse-heart 2s ease-in-out infinite;
  }

  @keyframes pulse-heart {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
  }

  .impact-message p {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.5;
    font-style: italic;
  }

  /* Small Tablet - 2 column layout */
  @media (min-width: 600px) and (max-width: 768px) {
    .impact-message {
      flex-direction: row;
    }
  }

  /* Large Phone - 2 column layout */
  @media (min-width: 480px) and (max-width: 599px) {
    .impact-message {
      flex-direction: column;
      text-align: center;
    }
  }

  /* Small Phone - Single column */
  @media (max-width: 479px) {
    .impact-message {
      flex-direction: column;
      text-align: center;
      padding: clamp(0.875rem, 2vw, 1.25rem);
    }

    .intro-section h1 {
      font-size: clamp(1.75rem, 4vw, 2rem);
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .impact-icon {
      animation: none;
    }
  }
</style>
