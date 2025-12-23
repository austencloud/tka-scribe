import type { ContainerModuleLoadOptions } from "inversify";
import { ContainerModule } from "inversify";
import { TYPES } from "../../../shared/inversify/types";
import type { IPixiAnimationRenderer } from "../services/contracts/IPixiAnimationRenderer";
import { PixiAnimationRenderer } from "../services/implementations/PixiAnimationRenderer";

/**
 * Pixi Rendering Module
 *
 * Loaded on-demand when animation rendering is needed.
 * This keeps pixi.js (~500KB) out of the initial bundle and loads it
 * only when the user actually uses animation features.
 */
export const pixiModule = new ContainerModule(
  async (options: ContainerModuleLoadOptions) => {
    const { bind, isBound } = options;

    // Pixi Animation Renderer - guard against duplicate bindings
    // NOT a singleton - each AnimatorCanvas instance needs its own renderer
    if (!isBound(TYPES.IPixiAnimationRenderer)) {
      bind<IPixiAnimationRenderer>(TYPES.IPixiAnimationRenderer).to(
        PixiAnimationRenderer
      );
    }
  }
);
