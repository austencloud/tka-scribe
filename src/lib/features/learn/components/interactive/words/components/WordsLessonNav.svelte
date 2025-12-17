<script lang="ts">
  let {
    showBack = true,
    nextLabel = "Next",
    onBack,
    onNext,
  } = $props<{
    showBack?: boolean;
    nextLabel?: string;
    onBack?: () => void;
    onNext: () => void;
  }>();
</script>

<div class="nav-buttons">
  {#if showBack && onBack}
    <button class="back-btn" onclick={onBack}>
      <i class="fa-solid fa-arrow-left"></i>
      Back
    </button>
  {/if}
  <button class="next-button" onclick={onNext}>
    <span>{nextLabel}</span>
    <i class="fa-solid fa-arrow-right"></i>
  </button>
</div>

<style>
  .nav-buttons {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 0.5rem;
  }

  .back-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 1.5rem;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .back-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  .next-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.625rem;
    padding: 1rem 2rem;
    background: linear-gradient(
      135deg,
      rgba(80, 200, 120, 0.3) 0%,
      rgba(60, 179, 113, 0.3) 100%
    );
    backdrop-filter: blur(20px);
    border: 2px solid rgba(80, 200, 120, 0.5);
    border-radius: 12px;
    color: white;
    font-size: 1.0625rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s;
    min-height: var(--min-touch-target);
    margin-left: auto;
  }

  .next-button:hover {
    background: linear-gradient(
      135deg,
      rgba(80, 200, 120, 0.4) 0%,
      rgba(60, 179, 113, 0.4) 100%
    );
    border-color: rgba(80, 200, 120, 0.8);
    transform: translateY(-2px);
  }

  @media (max-width: 600px) {
    .nav-buttons {
      flex-direction: column;
    }

    .back-btn,
    .next-button {
      width: 100%;
      justify-content: center;
    }
  }
</style>
