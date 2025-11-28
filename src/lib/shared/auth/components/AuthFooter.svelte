<!--
  AuthFooter.svelte - Authentication Sheet Footer

  Footer with Terms of Service and Privacy Policy links
-->
<script lang="ts">
  import { resolve } from "../../inversify";
  import { TYPES } from "../../inversify/types";
  import type { IHapticFeedbackService } from "../../application/services/contracts/IHapticFeedbackService";
  import type { ISheetRouterService } from "$lib/shared/navigation/services/contracts";
  import { onMount } from "svelte";

  // Services
  let hapticService: IHapticFeedbackService | null = null;
  let sheetRouterService: ISheetRouterService | null = null;

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
    try {
      sheetRouterService = resolve<ISheetRouterService>(
        TYPES.ISheetRouterService
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
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.2);
    flex-shrink: 0;
  }

  .auth-footer__text {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    margin: 0;
    text-align: center;
    line-height: 1.6;
  }

  .auth-footer__link {
    background: none;
    border: none;
    padding: 0;
    color: rgba(99, 102, 241, 0.9);
    font-size: inherit;
    font-family: inherit;
    text-decoration: none;
    cursor: pointer;
    transition: color 0.2s ease;
  }

  .auth-footer__link:hover {
    color: rgba(99, 102, 241, 1);
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
      font-size: 11px;
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
