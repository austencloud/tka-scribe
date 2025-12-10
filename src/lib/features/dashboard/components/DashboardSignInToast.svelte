<script lang="ts">
  interface Props {
    message: string;
    visible: boolean;
  }

  const { message, visible } = $props();
</script>

{#if visible}
  <div class="sign-in-toast" role="alert" aria-live="assertive">
    <i class="fas fa-lock"></i>
    <span>{message}</span>
  </div>
{/if}

<style>
  .sign-in-toast {
    position: fixed;
    bottom: calc(env(safe-area-inset-bottom, 0px) + 80px);
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 20px;
    background: rgba(99, 102, 241, 0.95);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border-radius: 14px;
    color: white;
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
    font-size: 15px;
    font-weight: 600;
    line-height: 20px;
    letter-spacing: -0.24px;
    box-shadow:
      0 8px 24px rgba(99, 102, 241, 0.35),
      0 2px 8px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    animation: toast-enter 0.4s cubic-bezier(0.36, 0.66, 0.04, 1);
  }

  .sign-in-toast i {
    font-size: 14px;
    opacity: 0.9;
  }

  @keyframes toast-enter {
    0% {
      opacity: 0;
      transform: translateX(-50%) translateY(20px) scale(0.95);
    }
    100% {
      opacity: 1;
      transform: translateX(-50%) translateY(0) scale(1);
    }
  }

  @media (min-width: 769px) {
    .sign-in-toast {
      bottom: 32px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .sign-in-toast {
      animation: none;
    }
  }
</style>
