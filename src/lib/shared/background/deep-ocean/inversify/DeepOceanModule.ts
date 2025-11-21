import type { ContainerModuleLoadOptions } from "inversify";
import { ContainerModule } from "inversify";

import { TYPES } from "$shared/inversify/types";

import type {
  IBubblePhysics,
  IFishSpriteManager,
  ILightRayCalculator,
  IMarineLifeAnimator,
  IOceanRenderer,
  IParticleSystem,
} from "../services/contracts";
import {
  BubblePhysics,
  FishSpriteManager,
  LightRayCalculator,
  MarineLifeAnimator,
  OceanRenderer,
  ParticleSystem,
} from "../services/implementations";

/**
 * Deep Ocean Background Services Module
 *
 * Binds all the focused deep ocean background services that replace the monolithic system.
 */
export const deepOceanBackgroundModule = new ContainerModule(
  async (options: ContainerModuleLoadOptions) => {
    const { bind } = options;

    // Physics & Animation Services
    bind<IBubblePhysics>(TYPES.IBubblePhysics)
      .to(BubblePhysics)
      .inSingletonScope();
    bind<IMarineLifeAnimator>(TYPES.IMarineLifeAnimator)
      .to(MarineLifeAnimator)
      .inSingletonScope();
    bind<IParticleSystem>(TYPES.IParticleSystem)
      .to(ParticleSystem)
      .inSingletonScope();
    bind<ILightRayCalculator>(TYPES.ILightRayCalculator)
      .to(LightRayCalculator)
      .inSingletonScope();

    // Resource Management Services
    bind<IFishSpriteManager>(TYPES.IFishSpriteManager)
      .to(FishSpriteManager)
      .inSingletonScope();

    // Rendering Services
    bind<IOceanRenderer>(TYPES.IOceanRenderer)
      .to(OceanRenderer)
      .inSingletonScope();
  }
);
