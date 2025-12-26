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
  createAutoBeatEditorEffect,
} from "../../state/managers/AutoEditPanelManager.svelte";
import { createCurrentWordDisplayEffect } from "../../state/managers/CurrentWordDisplayManager.svelte";
import { createLayoutEffects } from "../../state/managers/LayoutManager.svelte";
import { createNavigationSyncEffects } from "../../state/managers/NavigationSyncManager.svelte";
import { createPanelHeightTracker } from "../../state/managers/PanelHeightTracker.svelte";
import { createPWAEngagementEffect } from "../../state/managers/PWAEngagementManager.svelte";
import { createGlobalStateSyncEffects } from "../../state/managers/GlobalStateSyncManager.svelte";
import { createCreationFlowEffects } from "../../state/managers/CreationFlowManager.svelte";
import { createPendingEditEffect } from "../../state/managers/PendingEditManager.svelte";
import { createPropTypeSyncEffect } from "../../state/managers/PropTypeSyncManager.svelte";
import { createAutosaveEffect } from "../../state/managers/AutosaveManager.svelte";

@injectable()
export class CreateModuleEffectCoordinator
  implements ICreateModuleEffectCoordinator
{
  setupEffects(config: CreateModuleEffectConfig): () => void {
    const {
      getCreateModuleState,
      getConstructTabState,
      panelState,
      navigationState,
      layoutService,
      navigationSyncService,
      getDeepLinkService,
      getCreationMethodPersistence,
      getBeatOperationsService,
      getAutosaveService,
      isServicesInitialized,
      hasSelectedCreationMethod,
      setHasSelectedCreationMethod,
      onLayoutChange,
      getShouldUseSideBySideLayout,
      setAnimatingBeatNumber,
      onCurrentWordChange,
      onTabAccessibilityChange,
      toolPanelElement,
      buttonPanelElement,
    } = config;

    const cleanups: (() => void)[] = [];

    // Global state sync (panel state, layout, animation beat)
    cleanups.push(
      createGlobalStateSyncEffects({
        panelState,
        getShouldUseSideBySideLayout,
        setAnimatingBeatNumber,
      })
    );

    // Creation flow (selector visibility, tab accessibility)
    cleanups.push(
      createCreationFlowEffects({
        getCreateModuleState,
        hasSelectedCreationMethod,
        onTabAccessibilityChange,
      })
    );

    // Pending edit processing (from Discover gallery)
    cleanups.push(
      createPendingEditEffect({
        getDeepLinkService,
        getCreateModuleState,
        getConstructTabState,
        getCreationMethodPersistence,
        isServicesInitialized,
        hasSelectedCreationMethod,
        setHasSelectedCreationMethod,
      })
    );

    // Prop type sync (bulk update when settings change)
    cleanups.push(
      createPropTypeSyncEffect({
        getBeatOperationsService,
        getCreateModuleState,
        isServicesInitialized,
      })
    );

    // Autosave dirty marking
    cleanups.push(
      createAutosaveEffect({
        getCreateModuleState,
        getAutosaveService,
      })
    );

    // Navigation sync effects
    const createModuleState = getCreateModuleState();
    if (createModuleState) {
      cleanups.push(
        createNavigationSyncEffects({
          CreateModuleState: createModuleState,
          navigationState,
          navigationSyncService,
        })
      );
    }

    // Layout effects
    cleanups.push(
      createLayoutEffects({
        layoutService,
        onLayoutChange,
      })
    );

    // Auto edit panel effects (multi-select)
    if (createModuleState) {
      cleanups.push(
        createAutoEditPanelEffect({
          CreateModuleState: createModuleState,
          panelState,
        })
      );

      // Auto Beat Editor panel effects
      cleanups.push(
        createAutoBeatEditorEffect({
          CreateModuleState: createModuleState,
          panelState,
        })
      );

      // PWA engagement tracking
      cleanups.push(
        createPWAEngagementEffect({ CreateModuleState: createModuleState })
      );
    }

    // Current word display effects
    const constructTabState = getConstructTabState();
    if (onCurrentWordChange && createModuleState && constructTabState) {
      cleanups.push(
        createCurrentWordDisplayEffect({
          CreateModuleState: createModuleState,
          constructTabState,
          hasSelectedCreationMethod,
          onCurrentWordChange,
        })
      );
    }

    // Panel height tracking
    if (toolPanelElement || buttonPanelElement) {
      cleanups.push(
        createPanelHeightTracker({
          toolPanelElement,
          buttonPanelElement,
          panelState,
        })
      );
    }

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }
}
