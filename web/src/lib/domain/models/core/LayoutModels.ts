/**
 * Layout Domain Types
 *
 * Types for responsive UI layout calculations, grid configuration,
 * and layout management.
 */

// ============================================================================
// PANEL MANAGEMENT TYPES
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

import { ResizeDirection } from "../../enums/LayoutEnums";

export interface SplitterConfig {
  orientation: "horizontal" | "vertical";
  initialPosition: number;
  minPosition: number;
  maxPosition: number;
}

// ============================================================================
// RESPONSIVE LAYOUT TYPES
// ============================================================================

export interface LayoutDimensions {
  width: number;
  height: number;
}

export interface GridConfiguration {
  columns: number;
  gap: string;
  itemSize: number;
  gridClass: string;
  aspectClass: string;
  scaleFactor: number;
}

export interface LayoutCalculationParams {
  count: number;
  containerWidth: number;
  containerHeight: number;
  windowWidth?: number;
  windowHeight?: number;
  isMobileUserAgent?: boolean;
}
