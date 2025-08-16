/**
 * Panel Management Service Interfaces
 *
 * Interfaces for managing UI panels, layout, and window management.
 * This handles panel resizing, coordination, and state management.
 */

// Re-export panel interfaces from DI interfaces for convenience
export type {
  IPanelManagementService,
  PanelState,
  PanelConfiguration,
  ResizeOperation,
  ResizeDirection,
  SplitterConfig,
} from "../di/interfaces/panel-interfaces";
