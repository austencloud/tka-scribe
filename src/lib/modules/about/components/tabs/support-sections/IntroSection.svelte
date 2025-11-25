<!-- IntroSection.svelte - Introduction and Impact Message -->
<section class="intro-section">
  <header class="section-header">
    <h1><i class="fas fa-heart"></i> Support TKA</h1>
    <p class="intro-text">
      TKA Studio is <strong>free and open source</strong>. Your support helps keep
      it alive and growing.
    </p>
  </header>
  <div class="impact-message">
    <div class="impact-icon-wrapper">
      <i class="fas fa-hand-holding-heart"></i>
    </div>
    <div class="impact-content">
      <strong>Every contribution makes a difference</strong>
      <p>
        Donations fund hosting costs, development time, and help us keep TKA free
        for the entire flow arts community
      </p>
    </div>
  </div>
</section>

<style>
  /* Introduction Section - Admin Style */
  .intro-section {
    max-width: 900px;
    margin-left: auto;
    margin-right: auto;
  }

  .section-header {
    text-align: center;
    margin-bottom: 24px;
  }

  .intro-section h1 {
    font-size: 24px;
    margin: 0 0 12px 0;
    color: rgba(255, 255, 255, 0.95);
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }

  .intro-section h1 i {
    color: #ec4899;
    font-size: 20px;
  }

  .intro-text {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.6;
    margin: 0;
  }

  .intro-text strong {
    color: rgba(255, 255, 255, 0.9);
    font-weight: 600;
  }

  /* Impact Message - Admin Metric Card Style */
  .impact-message {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
  }

  .impact-icon-wrapper {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: rgba(236, 72, 153, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ec4899;
    font-size: 20px;
    flex-shrink: 0;
  }

  .impact-content {
    flex: 1;
  }

  .impact-content strong {
    display: block;
    font-size: 16px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    margin-bottom: 4px;
  }

  .impact-content p {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
    line-height: 1.5;
  }

  /* Mobile */
  @media (max-width: 480px) {
    .impact-message {
      flex-direction: column;
      text-align: center;
      align-items: center;
    }

    .intro-section h1 {
      font-size: 20px;
    }
  }
</style>
