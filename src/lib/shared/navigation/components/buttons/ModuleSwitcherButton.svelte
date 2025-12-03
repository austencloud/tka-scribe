<!-- ModuleSwitcherButton - Home Button with Profile Picture -->
<script lang="ts">
  import { onMount } from "svelte";
  import { resolve, TYPES } from "$lib/shared/inversify/di";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import { authStore } from "$lib/shared/auth/stores/authStore.svelte";

  let { onClick = () => {} } = $props<{
    onClick?: () => void;
  }>();

  let hapticService: IHapticFeedbackService | undefined;

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(TYPES.IHapticFeedbackService);
  });

  function handleClick() {
    hapticService?.trigger("selection");
    onClick();
  }

  // Get user photo reactively
  const userPhoto = $derived(authStore.user?.photoURL);
  const isAuthenticated = $derived(authStore.isAuthenticated);
</script>

<button
  class="home-button"
  onclick={handleClick}
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
    align-items: center;
    justify-content: center;
    /* Clean 48px round target - no container */
    width: 48px;
    height: 48px;
    min-width: 48px;
    min-height: 48px;
    padding: 0;
    background: transparent;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition: transform 0.1s ease, opacity 0.15s ease;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }

  .home-button:hover {
    opacity: 0.9;
  }

  .home-button:active {
    transform: scale(0.95);
  }

  /* Focus state for keyboard navigation */
  .home-button:focus-visible {
    outline: 2px solid hsl(210 100% 60%);
    outline-offset: 4px;
  }

  .avatar-container {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid hsl(0 0% 100% / 0.2);
    box-shadow: 0 2px 8px hsl(0 0% 0% / 0.3);
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
    background: linear-gradient(135deg, hsl(239 84% 67%) 0%, hsl(263 70% 65%) 100%);
    color: white;
    font-size: 20px;
  }

  .home-label {
    /* Hidden - avatar speaks for itself */
    display: none;
  }

  /* High contrast mode */
  @media (prefers-contrast: high) {
    .home-button:focus-visible {
      outline: 3px solid white;
    }

    .avatar-container {
      border: 3px solid white;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .home-button {
      transition: none;
    }

    .home-button:active {
      transform: none;
    }
  }
</style>
