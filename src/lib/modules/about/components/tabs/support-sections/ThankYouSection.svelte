<!-- Thank You Section -->
<div class="thank-you-section">
  <i class="fas fa-sparkles" aria-hidden="true"></i>
  <p>
    <strong>Thank you</strong> for being part of the TKA community!<br />
    Your support, whether through donations, code contributions, or sharing with
    friends, helps keep flow arts accessible to all.
  </p>
</div>

<style>
  /* Thank You Section */
  .thank-you-section {
    text-align: center;
    max-width: 700px;
    margin-left: auto;
    margin-right: auto;
    padding: clamp(1.5rem, 3vw, 2.5rem);
    background: linear-gradient(
      135deg,
      rgba(236, 72, 153, 0.06) 0%,
      rgba(139, 92, 246, 0.06) 100%
    );
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(236, 72, 153, 0.2);
    border-radius: 1.25rem;
    position: relative;
    overflow: hidden;
    box-shadow:
      0 2px 4px rgba(0, 0, 0, 0.08),
      0 4px 12px rgba(236, 72, 153, 0.08);
  }

  .thank-you-section::before {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle,
      rgba(236, 72, 153, 0.1) 0%,
      transparent 70%
    );
    animation: rotate-gradient 10s linear infinite;
    pointer-events: none;
  }

  @keyframes rotate-gradient {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .thank-you-section i {
    font-size: 2rem;
    background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: var(--spacing-sm);
    display: inline-block;
  }

  .thank-you-section p {
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.6;
    position: relative;
    z-index: 1;
  }

  .thank-you-section strong {
    color: var(--text-color);
    font-weight: 600;
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .thank-you-section::before {
      animation: none;
    }
  }
</style>
