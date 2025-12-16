import type { BackgroundType } from "../../domain/enums/background-enums";

/**
 * Service for preloading and updating background CSS in the browser
 */
export interface IBackgroundPreloaderService {
  /**
   * Updates the body background immediately by setting the CSS custom property
   */
  updateBodyBackground(backgroundType: BackgroundType): void;

  /**
   * Preloads the background from localStorage on app startup
   */
  preloadBackgroundFromStorage(): void;
}