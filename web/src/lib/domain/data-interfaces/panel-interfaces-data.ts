/**
 * Panel Management Service Interfaces
 *
 * Interfaces for managing UI panels, layout, and window management.
 * This handles panel resizing, coordination, and state management.
 */

// ============================================================================
// DATA CONTRACTS (Domain Models)
// ============================================================================

export interface PanelState {
  id: string;
  isVisible: boolean;
  isCollapsed: boolean;
  width: number;
  height?: number;
  position?: { x: number; y: number };
  // Extended properties for TKA panel management
  minWidth: number;
  maxWidth: number;
  defaultWidth: number;
  collapsedWidth: number;
  isResizing: boolean;
}

export interface PanelConfiguration {
  id: string;
  title: string;
  defaultWidth: number;
  defaultHeight?: number;
  minWidth: number;
  maxWidth: number;
  minHeight?: number;
  resizable?: boolean;
  collapsible?: boolean;
  collapsedWidth: number;
  persistKey: string;
}

export interface ResizeOperation {
  panelId: string;
  direction: ResizeDirection;
  startPosition: { x: number; y: number };
  startSize: { width: number; height: number };
}

export enum ResizeDirection {
  TOP = "top",
  BOTTOM = "bottom",
  LEFT = "left",
  RIGHT = "right",
  TOP_LEFT = "top-left",
  TOP_RIGHT = "top-right",
  BOTTOM_LEFT = "bottom-left",
  BOTTOM_RIGHT = "bottom-right",
}

export interface SplitterConfig {
  orientation: "horizontal" | "vertical";
  initialPosition: number;
  minPosition: number;
  maxPosition: number;
}
