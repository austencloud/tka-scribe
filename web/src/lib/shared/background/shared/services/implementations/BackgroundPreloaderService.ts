import { injectable } from "inversify";
import { BACKGROUND_GRADIENTS } from "../../domain/constants/BackgroundGradients";
import type { BackgroundType } from "../../domain/enums/background-enums";
import type { IBackgroundPreloaderService } from "../contracts/IBackgroundPreloaderService";

@injectable()
export class BackgroundPreloaderService implements IBackgroundPreloaderService {
  /**
   * Updates the body background immediately by setting the --gradient-cosmic CSS variable
   */
  updateBodyBackground(backgroundType: BackgroundType): void {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return; // SSR safety
    }

    try {
      const gradient =
        BACKGROUND_GRADIENTS[backgroundType] || BACKGROUND_GRADIENTS.nightSky;

      // Update the CSS custom property that controls the body background
      document.documentElement.style.setProperty("--gradient-cosmic", gradient);

      console.log(`🎨 Body background updated to: ${backgroundType}`);
    } catch (error) {
      console.warn("Failed to update body background:", error);
    }
  }

  /**
   * Preloads the background from localStorage on app startup
   * This is called by the inline script in app.html
   */
  preloadBackgroundFromStorage(): void {
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
      return; // SSR safety
    }

    try {
      const settingsKey = "tka-modern-web-settings";
      const stored = localStorage.getItem(settingsKey);

      if (stored) {
        const settings = JSON.parse(stored);
        const backgroundType = settings.backgroundType || "nightSky";
        this.updateBodyBackground(backgroundType as BackgroundType);
      }
    } catch (error) {
      console.warn("Failed to preload background:", error);
    }
  }
}
