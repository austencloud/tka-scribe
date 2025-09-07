/**
 * Panel Management Service Interfaces
 *
 * Interfaces for managing UI panels, layout, and window management.
 * This handles panel resizing, coordination, and state management.
 */

import type {
  GalleryPanelConfig,
  GalleryPanelResizeOperation,
  GalleryPanelState,
} from "../../domain/models/gallery-panel-models";

// ============================================================================
// SERVICE CONTRACTS (Behavioral Interfaces)
// ============================================================================

export interface IGalleryPanelManager {
  registerPanel(id: string, config: GalleryPanelConfig): void;
  unregisterPanel(id: string): void;
  getPanelState(id: string): GalleryPanelState | null;
  updatePanelState(id: string, state: Partial<GalleryPanelState>): void;
  startResize(operation: GalleryPanelResizeOperation): void;
  endResize(): void;
  isResizing(): boolean;

  // Additional methods used by panel-state.svelte.ts
  onPanelStateChanged(
    callback: (panelId: string, state: GalleryPanelState) => void
  ): void;
  offPanelStateChanged(
    callback: (panelId: string, state: GalleryPanelState) => void
  ): void;
  togglePanelCollapse(panelId: string): void;
  setPanelVisible(panelId: string, visible: boolean): void;
  setPanelWidth(panelId: string, width: number): void;
  loadPanelStates(): void;
}
