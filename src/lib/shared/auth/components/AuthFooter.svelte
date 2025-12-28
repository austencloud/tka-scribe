<!--
  AuthFooter.svelte - Authentication Sheet Footer

  Footer with Terms of Service and Privacy Policy links
-->
<script lang="ts">
  import { resolve } from "../../inversify/di";
  import { TYPES } from "../../inversify/types";
  import type { IHapticFeedback } from "../../application/services/contracts/IHapticFeedback";
  import type { ISheetRouter } from "$lib/shared/navigation/services/contracts/ISheetRouter";
  import { onMount } from "svelte";

  // Services
  let hapticService: IHapticFeedback | null = null;
  let sheetRouterService: ISheetRouter | null = null;

  onMount(() => {
    hapticService = resolve<IHapticFeedback>(
      TYPES.IHapticFeedback
    );
    try {
      sheetRouterService = resolve<ISheetRouter>(
        TYPES.ISheetRouter
      );
    } catch {
      // Service not available
    }
  });

  function openTerms(e: Event) {
    e.preventDefault();
    hapticService?.trigger("selection");
    sheetRouterService?.openSheet("terms");
  }

  function openPrivacy(e: Event) {
    e.preventDefault();
    hapticService?.trigger("selection");
    sheetRouterService?.openSheet("privacy");
  }
</script>

<footer class="auth-footer">
  <p class="auth-footer__text">
    By continuing, you agree to our
    <button class="auth-footer__link" onclick={openTerms}
      >Terms of Service</button
    >
    and
    <button class="auth-footer__link" onclick={openPrivacy}
      >Privacy Policy</button
    >
  </p>
</footer>

<style>
  .auth-footer {
    padding: 16px 24px;
    border-top: 1px solid var(--theme-stroke, var(--theme-stroke));
    background: color-mix(in srgb, var(--theme-shadow) 20%, transparent);
    flex-shrink: 0;
  }

  .auth-footer__text {
    font-size: var(--font-size-compact);
    color: var(--theme-text-dim, var(--theme-text-dim));
    margin: 0;
    text-align: center;
    line-height: 1.6;
  }

  .auth-footer__link {
    background: none;
    border: none;
    padding: 0;
    color: color-mix(
      in srgb,
      var(--theme-accent-strong, var(--theme-accent)) 90%,
      transparent
    );
    font-size: inherit;
    font-family: inherit;
    text-decoration: none;
    cursor: pointer;
    transition: color 0.2s ease;
  }

  .auth-footer__link:hover {
    color: var(--theme-accent-strong);
    text-decoration: underline;
  }

  /* ============================================================================
     RESPONSIVE DESIGN
     ============================================================================ */
  @media (max-width: 480px) {
    .auth-footer {
      padding: 12px 16px;
    }

    .auth-footer__text {
      font-size: var(--font-size-compact);
    }
  }

  @media (max-height: 700px) {
    .auth-footer {
      padding: 11px 16px;
    }
  }

  /* iPhone SE 2/3 and smaller - hide footer to prevent scrolling */
  @media (max-height: 700px) {
    .auth-footer {
      display: none;
    }
  }

  /* ============================================================================
     ACCESSIBILITY
     ============================================================================ */
  @media (prefers-contrast: high) {
    .auth-footer {
      border-color: white;
    }
  }
</style>
