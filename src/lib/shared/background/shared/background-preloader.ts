/**
 * Background Preloader Utility
 *
 * Handles immediate body background updates when background settings change.
 * Uses CSS ::before pseudo-element with opacity transition for smooth gradient changes.
 */

import { BACKGROUND_GRADIENTS } from "./domain";
import type { BackgroundType } from "./domain/enums/background-enums";

let isTransitioning = false;

// Background animation mapping - same as app.html
const BACKGROUND_ANIMATIONS: Record<BackgroundType, string> = {
  aurora: "aurora-flow",
  snowfall: "snow-fall",
  nightSky: "star-twinkle",
  deepOcean: "deep-ocean-flow",
};

/**
 * Updates the body background with smooth transition using ::before overlay technique
 * This works because CSS CAN transition opacity, even though gradients cannot be transitioned directly
 */
export function updateBodyBackground(backgroundType: BackgroundType): void {
  console.log("🔵 updateBodyBackground called with:", backgroundType);

  if (typeof window === "undefined" || typeof document === "undefined") {
    console.log("❌ SSR - window/document undefined");
    return; // SSR safety
  }

  try {
    const newGradient =
      BACKGROUND_GRADIENTS[backgroundType] || BACKGROUND_GRADIENTS.nightSky;
    const newAnimation = BACKGROUND_ANIMATIONS[backgroundType] || BACKGROUND_ANIMATIONS.nightSky;

    console.log("🎨 New gradient:", newGradient);
    console.log("🎨 New animation:", newAnimation);

    // Get current gradient
    const currentGradient = document.documentElement.style.getPropertyValue("--gradient-cosmic");
    console.log("🎨 Current gradient:", currentGradient);

    // Skip if already set to this gradient
    if (currentGradient === newGradient) {
      console.log("⏭️ Skipping - gradient already set");
      return;
    }

    if (isTransitioning) {
      console.log("⏭️ Skipping - already transitioning");
      return;
    }

    console.log("✅ Starting background transition");
    isTransitioning = true;
    const body = document.body;

    console.log("🔍 Body element:", body);
    console.log("🔍 Body classes before:", body.className);

    // Update body animation class immediately
    body.classList.remove(
      "aurora-flow",
      "snow-fall",
      "star-twinkle",
      "deep-ocean-flow"
    );
    body.classList.add(newAnimation);

    console.log("🔍 Body classes after animation update:", body.className);

    // Step 1: Set the ::before overlay to the NEW gradient (separate CSS variable)
    document.documentElement.style.setProperty("--gradient-next", newGradient);
    console.log("🔍 Set --gradient-next to:", document.documentElement.style.getPropertyValue("--gradient-next"));

    // Step 2: Fade in the ::before overlay (showing NEW gradient on top of OLD)
    requestAnimationFrame(() => {
      console.log("🔍 Adding background-transitioning class");
      body.classList.add('background-transitioning');
      console.log("🔍 Body classes after adding transitioning:", body.className);
      console.log("🔍 Body has background-transitioning class:", body.classList.contains('background-transitioning'));
    });

    // Step 3: After transition completes, swap the gradients
    setTimeout(() => {
      console.log("🔍 Transition complete, swapping gradients");
      document.documentElement.style.setProperty("--gradient-cosmic", newGradient);
      console.log("🔍 Set --gradient-cosmic to:", document.documentElement.style.getPropertyValue("--gradient-cosmic"));
      body.classList.remove('background-transitioning');
      console.log("🔍 Body classes after removing transitioning:", body.className);
      isTransitioning = false;
      console.log("✅ Background transition complete!");
    }, 1500);

  } catch (error) {
    console.warn("Failed to update body background:", error);
    isTransitioning = false;
  }
}

/**
 * Preloads the background from localStorage on app startup
 * This is called by the inline script in app.html
 */
export function preloadBackgroundFromStorage(): void {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return; // SSR safety
  }

  try {
    const settingsKey = "tka-modern-web-settings";
    const stored = localStorage.getItem(settingsKey);

    if (stored) {
      const settings = JSON.parse(stored);
      const backgroundType = settings.backgroundType || "nightSky";
      updateBodyBackground(backgroundType as BackgroundType);
    }
  } catch (error) {
    console.warn("Failed to preload background:", error);
  }
}
