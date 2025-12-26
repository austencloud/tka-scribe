import type { ContainerModuleLoadOptions } from "inversify";
import { ContainerModule } from "inversify";
import { TYPES } from "../../../shared/inversify/types";
import type { IAnimationRenderer } from "../services/contracts/IAnimationRenderer";
import { Canvas2DAnimationRenderer } from "../services/implementations/Canvas2DAnimationRenderer";

/**
 * Animation Rendering Module
 *
 * Loaded on-demand when animation rendering is needed.
 * Uses Canvas2D for simpler, leak-free rendering (replaced PixiJS WebGL).
 */
export const pixiModule = new ContainerModule(
  async (options: ContainerModuleLoadOptions) => {
    const { bind, isBound } = options;

    // Canvas2D Animation Renderer - guard against duplicate bindings
    // NOT a singleton - each AnimatorCanvas instance needs its own renderer
    if (!isBound(TYPES.IAnimationRenderer)) {
      bind<IAnimationRenderer>(TYPES.IAnimationRenderer).to(
        Canvas2DAnimationRenderer
      );
    }
  }
);
