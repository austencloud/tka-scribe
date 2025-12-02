<!-- ModuleSwitcherButton - Home Button with Profile Picture -->
<script lang="ts">
  import { authStore } from "$lib/shared/auth/stores/authStore.svelte";

  let { onClick = () => {} } = $props<{
    onClick?: () => void;
  }>();

  // Get user photo reactively
  const userPhoto = $derived(authStore.user?.photoURL);
  const isAuthenticated = $derived(authStore.isAuthenticated);
</script>

<button
  class="home-button"
  onclick={onClick}
  aria-label="Go to Dashboard"
>
  <div class="avatar-container">
    {#if isAuthenticated && userPhoto}
      <img
        src={userPhoto}
        alt="Home"
        class="avatar-image"
        crossorigin="anonymous"
        referrerpolicy="no-referrer"
      />
    {:else}
      <div class="avatar-placeholder">
        <i class="fas fa-user"></i>
      </div>
    {/if}
  </div>
  <span class="home-label">Home</span>
</button>

<style>
  .home-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    padding: 6px 4px;
    width: 60px;
    height: 52px;
    min-width: 60px;
    min-height: 52px;
    max-width: 60px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }

  .home-button:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }

  .home-button:active {
    transform: scale(0.95);
  }

  .avatar-container {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid rgba(255, 255, 255, 0.3);
    flex-shrink: 0;
  }

  .avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
    font-size: 12px;
  }

  .home-label {
    font-size: 9px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.1;
  }

  @media (prefers-reduced-motion: reduce) {
    .home-button {
      transition: none;
    }

    .home-button:hover,
    .home-button:active {
      transform: none;
    }
  }
</style>
