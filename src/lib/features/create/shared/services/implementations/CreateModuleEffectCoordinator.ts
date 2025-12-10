/**
 * CreateModuleEffectCoordinator.ts
 *
 * Service implementation for coordinating all reactive effects in CreateModule.
 * Centralizes effect setup to reduce complexity in the component.
 *
 * Domain: Create module - Effect Orchestration
 */

import { injectable } from "inversify";
import type {
  ICreateModuleEffectCoordinator,
  CreateModuleEffectConfig,
} from "../contracts/ICreateModuleEffectCoordinator";
import {
  createAutoEditPanelEffect,
  createAutoSequenceActionsEffect,
} from "../../state/managers/AutoEditPanelManager.svelte";
import { createCurrentWordDisplayEffect } from "../../state/managers/CurrentWordDisplayManager.svelte";
import { createLayoutEffects } from "../../state/managers/LayoutManager.svelte";
import { createNavigationSyncEffects } from "../../state/managers/NavigationSyncManager.svelte";
import { createPanelHeightTracker } from "../../state/managers/PanelHeightTracker.svelte";
import { createPWAEngagementEffect } from "../../state/managers/PWAEngagementManager.svelte";

@injectable()
export class CreateModuleEffectCoordinator
  implements ICreateModuleEffectCoordinator
{
  /**
   * Set up all reactive effects for CreateModule
   * Coordinates:
   * - Navigation synchronization
   * - Responsive layout management
   * - Auto edit panel behavior
   * - Single beat edit mode
   * - PWA engagement tracking
   * - Current word display updates
   * - Panel height tracking
   */
  setupEffects(config: CreateModuleEffectConfig): () => void {
    const {
      CreateModuleState,
      constructTabState,
      panelState,
      navigationState,
      layoutService,
      navigationSyncService,
      hasSelectedCreationMethod,
      onLayoutChange,
      onCurrentWordChange,
      toolPanelElement,
      buttonPanelElement,
    } = config;

    const cleanups: (() => void)[] = [];

    // Navigation sync effects
    const navigationCleanup = createNavigationSyncEffects({
      CreateModuleState,
      navigationState,
      navigationSyncService,
    });
    cleanups.push(navigationCleanup);

    // URL sync removed - share panel now generates viewer URLs on-demand
    // Deep links still work for incoming shared links via DeepLinkService

    // Layout effects
    const layoutCleanup = createLayoutEffects({
      layoutService,
      onLayoutChange,
    });
    cleanups.push(layoutCleanup);

    // Auto edit panel effects (multi-select)
    const autoEditCleanup = createAutoEditPanelEffect({
      CreateModuleState,
      panelState,
    });
    cleanups.push(autoEditCleanup);

    // Auto Sequence Actions panel effects (single beat + auto-open/close)
    const autoSequenceActionsCleanup = createAutoSequenceActionsEffect({
      CreateModuleState,
      panelState,
    });
    cleanups.push(autoSequenceActionsCleanup);

    // PWA engagement tracking
    const pwaCleanup = createPWAEngagementEffect({ CreateModuleState });
    cleanups.push(pwaCleanup);

    // Current word display effects (if callback provided)
    if (onCurrentWordChange) {
      const currentWordCleanup = createCurrentWordDisplayEffect({
        CreateModuleState,
        constructTabState,
        hasSelectedCreationMethod,
        onCurrentWordChange,
      });
      cleanups.push(currentWordCleanup);
    }

    // Panel height tracking (if elements are available)
    if (toolPanelElement || buttonPanelElement) {
      const panelHeightCleanup = createPanelHeightTracker({
        toolPanelElement,
        buttonPanelElement,
        panelState,
      });
      cleanups.push(panelHeightCleanup);
    }

    // Return combined cleanup function
    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }
}
