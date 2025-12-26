<section class="hero">
  <div>
    <p class="eyebrow">Notifications</p>
    <h2>Control how you’re notified</h2>
  </div>
</section>

<style>
  .hero {
    padding: 18px 18px;
    background: linear-gradient(
      135deg,
      var(--theme-panel-bg, #0f172a),
      var(--theme-panel-elevated-bg, #0b1021)
    );
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    border-radius: 18px;
    box-shadow: var(--theme-panel-shadow, 0 14px 36px rgba(0, 0, 0, 0.4));
  }

  .hero h2 {
    margin: 4px 0 8px;
    font-size: 26px;
    color: var(--theme-text, rgba(255, 255, 255, 0.96));
  }

  .eyebrow {
    margin: 0;
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
  }

  @media (max-width: 900px) {
    .hero {
      padding: 16px;
    }
  }

  @media (max-width: 640px) {
    .hero h2 {
      font-size: 22px;
    }
  }
</style>
