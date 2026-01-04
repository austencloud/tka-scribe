import type { ContainerModuleLoadOptions } from "inversify";
import { ContainerModule } from "inversify";
import { TYPES } from "../../../inversify/types";
import type { IGeoLocationProvider } from "$lib/shared/device/services/contracts/IGeoLocationProvider";
import { GeoLocationProvider } from "$lib/shared/device/services/implementations/GeoLocationProvider";
import type { INightSkyCalculationService } from "../services/contracts/INightSkyCalculationService";
import { NightSkyCalculationService } from "../services/implementations/NightSkyCalculationService";

/**
 * Night Sky Background Services Module
 *
 * Loaded on-demand when the Night Sky background is selected.
 * This keeps the NightSkyCalculationService out of the initial bundle.
 */
export const nightSkyBackgroundModule = new ContainerModule(
  async (options: ContainerModuleLoadOptions) => {
    const { bind, isBound } = options;

    // GeoLocation Provider - for location-aware moon orientation
    if (!isBound(TYPES.IGeoLocationProvider)) {
      bind<IGeoLocationProvider>(TYPES.IGeoLocationProvider)
        .to(GeoLocationProvider)
        .inSingletonScope();
    }

    // Night Sky Calculation Service - guard against duplicate bindings
    if (!isBound(TYPES.INightSkyCalculationService)) {
      bind<INightSkyCalculationService>(TYPES.INightSkyCalculationService)
        .to(NightSkyCalculationService)
        .inSingletonScope();
    }
  }
);
