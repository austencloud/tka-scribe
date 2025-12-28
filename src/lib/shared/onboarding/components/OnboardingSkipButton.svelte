<!-- OnboardingSkipButton - Skip button for onboarding -->
<script lang="ts">
  const { onclick } = $props<{
    onclick: () => void;
  }>();
</script>

<button class="skip-button" {onclick}>
  Skip <i class="fas fa-forward" aria-hidden="true"></i>
</button>

<style>
  .skip-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    z-index: 10;
    padding: 0.5rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid var(--theme-stroke);
    border-radius: 8px;
    color: var(--theme-text-dim);
    font-size: 0.8125rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 180ms ease;
  }

  .skip-button:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.8);
  }

  .skip-button i {
    font-size: 0.75rem;
  }

  @media (max-width: 500px) {
    .skip-button {
      top: 0.75rem;
      right: 0.75rem;
      padding: 0.375rem 0.75rem;
      font-size: 0.75rem;
    }
  }
</style>
