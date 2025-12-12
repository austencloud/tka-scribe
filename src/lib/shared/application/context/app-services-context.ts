/**
 * Application Services Context
 *
 * Provides DI-resolved services to all descendant components via Svelte context.
 * This eliminates the need for child components to call resolve() directly.
 *
 * Usage:
 * - In MainApplication: setAppServicesContext({ ... })
 * - In child components: const { settingsService } = getAppServicesContext()
 */

import { getContext, setContext } from "svelte";
import type { ISettingsState } from "../../settings/services/contracts/ISettingsState";
import type { IDeviceDetector } from "../../device/services/contracts/IDeviceDetector";
import type { IHapticFeedbackService } from "../services/contracts/IHapticFeedbackService";
import type { ICollaborativeVideoService } from "../../video-collaboration/services/contracts/ICollaborativeVideoService";
import type { IUserService } from "../../community/services/contracts/IUserService";
import type { IDiscoverLoader } from "$lib/features/discover/gallery/display/services/contracts/IDiscoverLoader";
import type { ICodexService } from "$lib/features/learn/codex/services/contracts/ICodexService";
// TODO: IQuizRepoManager contract doesn't exist yet - uncomment when created
// import type { IQuizRepoManager } from "$lib/features/learn/quiz/services/contracts/IQuizRepoManager";
import type { ICAPTypeService } from "$lib/features/create/generate/shared/services/contracts/ICAPTypeService";
import type { IStartPositionService } from "$lib/features/create/construct/start-position-picker/services/contracts/IStartPositionService";

const APP_SERVICES_KEY = "app-services";

/**
 * All services available via app context
 */
export interface AppServicesContext {
  // Core services
  settingsService: ISettingsState;
  deviceService: IDeviceDetector;
  hapticService: IHapticFeedbackService;

  // Feature services (lazy-loaded, may be null initially)
  videoService?: ICollaborativeVideoService;
  userService?: IUserService;
  discoverLoader?: IDiscoverLoader;
  codexService?: ICodexService;
  // quizRepo?: IQuizRepoManager; // TODO: uncomment when IQuizRepoManager contract is created
  capTypeService?: ICAPTypeService;
  startPositionService?: IStartPositionService;
}

/**
 * Set the app services context (call in MainApplication)
 */
export function setAppServicesContext(services: AppServicesContext): void {
  setContext(APP_SERVICES_KEY, services);
}

/**
 * Get the app services context (call in child components)
 */
export function getAppServicesContext(): AppServicesContext {
  const ctx = getContext<AppServicesContext>(APP_SERVICES_KEY);
  if (!ctx) {
    throw new Error(
      "AppServicesContext not found. Ensure component is a descendant of MainApplication."
    );
  }
  return ctx;
}

/**
 * Try to get app services context (returns undefined if not available)
 */
export function tryGetAppServicesContext(): AppServicesContext | undefined {
  return getContext<AppServicesContext>(APP_SERVICES_KEY);
}
