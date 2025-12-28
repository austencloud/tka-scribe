<script lang="ts">
  import type { ActionConfig } from "./sharePanelTypes";

  export let primaryActions: ActionConfig[] = [];
  export let socialActions: ActionConfig[] = [];
</script>

<section class="actions-section">
  <div class="primary-actions">
    {#each primaryActions as action}
      <button
        class="action-btn"
        class:primary={action.variant === "primary"}
        class:secondary={action.variant === "secondary"}
        disabled={action.disabled}
      >
        <i class={action.icon}></i>
        <span>{action.label}</span>
      </button>
    {/each}
  </div>

  <div class="divider">
    <span>Share to Social</span>
  </div>

  <div class="social-actions">
    {#each socialActions as action}
      <button
        class="action-btn social"
        class:instagram={action.variant === "instagram"}
        class:facebook={action.variant === "facebook"}
        disabled={action.disabled}
      >
        <i class={action.icon}></i>
        <span>{action.label}</span>
        {#if action.comingSoon}
          <span class="coming-soon-badge">Soon</span>
        {/if}
      </button>
    {/each}
  </div>
</section>

<style>
  .actions-section {
    animation: fadeIn 0.4s ease-out backwards;
    animation-delay: 0.15s;
  }

  .primary-actions,
  .social-actions {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
  }

  .divider {
    position: relative;
    text-align: center;
    margin: 12px 0;
  }

  .divider span {
    display: inline-block;
    padding: 0 18px;
    background: linear-gradient(
      135deg,
      rgba(20, 25, 35, 0.98) 0%,
      rgba(15, 20, 30, 0.96) 50%,
      rgba(12, 16, 25, 0.98) 100%
    );
    color: rgba(255, 255, 255, 0.45);
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    position: relative;
    z-index: 1;
  }

  .divider::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.15) 20%,
      rgba(255, 255, 255, 0.15) 80%,
      transparent 100%
    );
  }

  .action-btn {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 16px 28px;
    border: none;
    border-radius: 14px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    overflow: hidden;
    isolation: isolate;
  }

  .action-btn > * {
    position: relative;
    z-index: 2;
  }

  .action-btn::before {
    content: "";
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
    z-index: 0;
  }

  .action-btn::after {
    z-index: 1;
  }

  .action-btn:hover::before {
    opacity: 1;
  }

  .action-btn.primary {
    background: linear-gradient(135deg, var(--semantic-info) 0%, #2563eb 100%);
    color: white;
    box-shadow:
      0 4px 16px rgba(59, 130, 246, 0.4),
      0 2px 8px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.25);
    position: relative;
  }

  .action-btn.primary::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 14px;
    background: radial-gradient(
      circle at top left,
      rgba(255, 255, 255, 0.2),
      transparent 50%
    );
    pointer-events: none;
  }

  .action-btn.primary::before {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  }

  .action-btn.primary:hover {
    transform: scale(1.03) translateY(-2px);
    box-shadow:
      0 8px 24px rgba(59, 130, 246, 0.5),
      0 4px 12px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }

  .action-btn.primary i {
    font-size: 18px;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
  }

  .action-btn.secondary {
    background: linear-gradient(
      135deg,
      var(--theme-card-hover-bg),
      var(--theme-card-bg)
    );
    color: rgba(255, 255, 255, 0.95);
    border: 1.5px solid rgba(255, 255, 255, 0.25);
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
    position: relative;
  }

  .action-btn.secondary::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 14px;
    background: radial-gradient(
      circle at top right,
      rgba(255, 255, 255, 0.1),
      transparent 60%
    );
    pointer-events: none;
  }

  .action-btn.secondary::before {
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.18),
      rgba(255, 255, 255, 0.12)
    );
  }

  .action-btn.secondary:hover {
    transform: scale(1.02) translateY(-1px);
    border-color: rgba(255, 255, 255, 0.35);
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  .action-btn.secondary i {
    font-size: 18px;
    opacity: 0.9;
  }

  .action-btn.social {
    background: linear-gradient(
      135deg,
      var(--theme-card-bg),
      rgba(255, 255, 255, 0.04)
    );
    color: rgba(255, 255, 255, 0.95);
    border: 1.5px solid rgba(255, 255, 255, 0.18);
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.08),
      inset 0 1px 0 var(--theme-stroke);
  }

  .action-btn.social::before {
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.12),
      rgba(255, 255, 255, 0.06)
    );
  }

  .action-btn.social:hover:not(:disabled) {
    transform: scale(1.02) translateY(-1px);
    border-color: rgba(255, 255, 255, 0.28);
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }

  .action-btn.instagram {
    background: linear-gradient(
      135deg,
      #f09433 0%,
      #e6683c 25%,
      #dc2743 50%,
      #cc2366 75%,
      #bc1888 100%
    );
    border: none;
    color: white;
    box-shadow:
      0 4px 16px rgba(188, 24, 136, 0.35),
      0 2px 8px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  .action-btn.instagram::before {
    background: linear-gradient(
      135deg,
      #e6683c 0%,
      #dc2743 25%,
      #cc2366 50%,
      #bc1888 75%,
      #8a0868 100%
    );
  }

  .action-btn.instagram:hover:not(:disabled) {
    transform: scale(1.03) translateY(-2px);
    box-shadow:
      0 8px 24px rgba(188, 24, 136, 0.5),
      0 4px 12px var(--theme-shadow),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }

  .action-btn.instagram i {
    font-size: 18px;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
  }

  .action-btn.facebook {
    position: relative;
  }

  .action-btn.facebook i {
    color: #1877f2;
    font-size: 18px;
  }

  .action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }

  .action-btn:disabled::before {
    display: none;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
