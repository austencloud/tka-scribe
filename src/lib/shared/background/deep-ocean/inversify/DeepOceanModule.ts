import type { ContainerModuleLoadOptions } from "inversify";
import { ContainerModule } from "inversify";
import { TYPES } from "../../../inversify/types";
import type { IBubblePhysics } from '../services/contracts/IBubblePhysics';
import type { IMarineLifeAnimator } from '../services/contracts/IMarineLifeAnimator';
import type { IParticleSystem } from '../services/contracts/IParticleSystem';
import type { IFishSpriteManager } from '../services/contracts/IFishSpriteManager';
import type { IOceanRenderer } from '../services/contracts/IOceanRenderer';
import type { ILightRayCalculator } from '../services/contracts/ILightRayCalculator';
import { BubblePhysics } from '../services/implementations/BubblePhysics';
import { MarineLifeAnimator } from '../services/implementations/MarineLifeAnimator';
import { ParticleSystem } from '../services/implementations/ParticleSystem';
import { FishSpriteManager } from '../services/implementations/FishSpriteManager';
import { OceanRenderer } from '../services/implementations/OceanRenderer';
import { LightRayCalculator } from '../services/implementations/LightRayCalculator';

/**
 * Deep Ocean Background Services Module
 *
 * Binds all the focused deep ocean background services that replace the monolithic system.
 */
export const deepOceanBackgroundModule = new ContainerModule(
  async (options: ContainerModuleLoadOptions) => {
    const { bind, isBound } = options;

    // Physics & Animation Services - guard against duplicate bindings
    if (!isBound(TYPES.IBubblePhysics)) {
      bind<IBubblePhysics>(TYPES.IBubblePhysics)
        .to(BubblePhysics)
        .inSingletonScope();
    }
    if (!isBound(TYPES.IMarineLifeAnimator)) {
      bind<IMarineLifeAnimator>(TYPES.IMarineLifeAnimator)
        .to(MarineLifeAnimator)
        .inSingletonScope();
    }
    if (!isBound(TYPES.IParticleSystem)) {
      bind<IParticleSystem>(TYPES.IParticleSystem)
        .to(ParticleSystem)
        .inSingletonScope();
    }
    if (!isBound(TYPES.ILightRayCalculator)) {
      bind<ILightRayCalculator>(TYPES.ILightRayCalculator)
        .to(LightRayCalculator)
        .inSingletonScope();
    }

    // Resource Management Services
    if (!isBound(TYPES.IFishSpriteManager)) {
      bind<IFishSpriteManager>(TYPES.IFishSpriteManager)
        .to(FishSpriteManager)
        .inSingletonScope();
    }

    // Rendering Services
    if (!isBound(TYPES.IOceanRenderer)) {
      bind<IOceanRenderer>(TYPES.IOceanRenderer)
        .to(OceanRenderer)
        .inSingletonScope();
    }
  }
);
