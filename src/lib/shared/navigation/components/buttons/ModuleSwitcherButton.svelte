<!-- ModuleSwitcherButton - Home Button with Profile Picture -->
<script lang="ts">
  import { onMount } from "svelte";
  import { resolve, TYPES } from "$lib/shared/inversify/di";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import { authState } from "$lib/shared/auth/state/authState.svelte";

  let { onClick = () => {} } = $props<{
    onClick?: () => void;
  }>();

  let hapticService: IHapticFeedbackService | undefined;

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  function handleClick(event: MouseEvent | TouchEvent) {
    const target = event.target as HTMLElement;
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();

    let clickX: number, clickY: number;

    if (event instanceof MouseEvent) {
      clickX = event.clientX - rect.left;
      clickY = event.clientY - rect.top;
    } else if (event instanceof TouchEvent && event.changedTouches[0]) {
      clickX = event.changedTouches[0].clientX - rect.left;
      clickY = event.changedTouches[0].clientY - rect.top;
    } else {
      clickX = rect.width / 2;
      clickY = rect.height / 2;
    }

    console.log("🖱️ [ModuleSwitcherButton] Click detected:", {
      eventType: event instanceof MouseEvent ? "mouse" : "touch",
      clickedElement:
        target.tagName + (target.className ? "." + target.className : ""),
      isButton: target === button,
      clickPosition: { x: clickX, y: clickY },
      buttonSize: { width: rect.width, height: rect.height },
      clickRelative: {
        xPercent: ((clickX / rect.width) * 100).toFixed(1) + "%",
        yPercent: ((clickY / rect.height) * 100).toFixed(1) + "%",
      },
    });

    if (target !== button) {
      console.warn(
        "⚠️ [ModuleSwitcherButton] Click intercepted by child element:",
        target.tagName,
        target.className
      );
    }

    // Prevent double-firing on devices that support both touch and mouse
    if (event instanceof TouchEvent) {
      event.preventDefault();
    }

    hapticService?.trigger("selection");
    onClick();
  }

  // Get user photo reactively
  const userPhoto = $derived(authState.user?.photoURL);
  const isAuthenticated = $derived(authState.isAuthenticated);
</script>

<button
  class="home-button"
  onclick={handleClick}
  ontouchend={handleClick}
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
    /* Clean 50px round target - no container */
    width: 52px;
    height: 52px;
    min-width: 52px;
    min-height: 52px;
    padding: 0;
    background: transparent;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition:
      transform 0.1s ease,
      opacity 0.15s ease;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    /* Expand touch target area - make entire left section clickable */
    position: relative;
  }

  /* Expanded invisible touch target - square area matching button size */
  .home-button::before {
    content: "";
    position: absolute;
    /* Square touch target matching button dimensions */
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    border-radius: 0; /* Square instead of circle */
    cursor: pointer;
    /* Debug: uncomment to see touch area */
    /* background: rgba(255, 0, 0, 0.2); */
  }

  .home-button:hover {
    opacity: 0.9;
  }

  .home-button:active {
    transform: scale(0.95);
  }

  /* Focus state for keyboard navigation */
  .home-button:focus-visible {
    outline: 2px solid var(--theme-accent, #6366f1);
    outline-offset: 4px;
  }

  .avatar-container {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    overflow: hidden;
    border: 1px solid var(--module-color, #667eea);
    box-shadow: 0 2px 8px hsl(0 0% 0% / 0.3);
    /* Prevent container from blocking button clicks */
    pointer-events: none;
  }

  .avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    /* Prevent image from blocking button clicks */
    pointer-events: none;
  }

  .avatar-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(
      135deg,
      var(--theme-accent, #6366f1) 0%,
      var(--theme-accent-strong, #8b5cf6) 100%
    );
    color: white;
    font-size: 20px;
    /* Prevent placeholder from blocking button clicks */
    pointer-events: none;
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
