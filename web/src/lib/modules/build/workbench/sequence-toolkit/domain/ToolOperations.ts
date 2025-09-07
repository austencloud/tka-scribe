/**
 * Tool Operations Domain Models
 * 
 * Defines types and interfaces for sequence toolkit operations.
 * These models represent the various operations that can be performed on sequences.
 */

import type { SequenceData } from "$shared";

/**
 * Types of operations available in the sequence toolkit
 */
export enum ToolOperationType {
  // Transform operations
  MIRROR = "mirror",
  ROTATE_CLOCKWISE = "rotate_clockwise", 
  ROTATE_COUNTERCLOCKWISE = "rotate_counterclockwise",
  SWAP_COLORS = "swap_colors",
  CLEAR = "clear",
  DUPLICATE = "duplicate",
  
  // Delete operations
  DELETE_SEQUENCE = "delete_sequence",
  DELETE_BEAT = "delete_beat",
  DELETE_BEATS = "delete_beats",
  DELETE_BEAT_AND_FOLLOWING = "delete_beat_and_following",
  CLEAR_BEATS = "clear_beats",
  
  // Export operations
  EXPORT_JSON = "export_json",
  COPY_JSON = "copy_json",
  ADD_TO_DICTIONARY = "add_to_dictionary",
  EXPORT_FULLSCREEN = "export_fullscreen",
}

/**
 * Base interface for all tool operation results
 */
export interface ToolOperationResult {
  success: boolean;
  operation: ToolOperationType;
  message?: string;
  error?: string;
}

/**
 * Result for operations that modify sequence data
 */
export interface SequenceOperationResult extends ToolOperationResult {
  sequence?: SequenceData;
  originalSequence?: SequenceData;
}

/**
 * Result for delete operations
 */
export interface DeleteOperationResult extends ToolOperationResult {
  deletedSequenceId?: string;
  affectedSequences?: SequenceData[];
}

/**
 * Result for export operations
 */
export interface ExportOperationResult extends ToolOperationResult {
  exportData?: string;
  exportFormat?: "json" | "fullscreen" | "dictionary";
}

/**
 * Parameters for transform operations
 */
export interface TransformOperationParams {
  sequence: SequenceData;
  operation: ToolOperationType;
  newName?: string; // For duplicate operation
}

/**
 * Parameters for delete operations
 */
export interface DeleteOperationParams {
  sequenceId: string;
  operation: ToolOperationType;
  beatIndex?: number; // For single beat deletion
  beatIndices?: number[]; // For multiple beat deletion
  startIndex?: number; // For delete beat and following
}

/**
 * Parameters for export operations
 */
export interface ExportOperationParams {
  sequence: SequenceData;
  operation: ToolOperationType;
  format?: "json" | "fullscreen" | "dictionary";
}

/**
 * Tool state for tracking current operation
 */
export interface ToolState {
  currentOperation?: ToolOperationType;
  isProcessing: boolean;
  lastResult?: ToolOperationResult;
  selectedTool?: ToolOperationType;
}

/**
 * Tool configuration options
 */
export interface ToolConfig {
  enabledOperations: ToolOperationType[];
  confirmDestructiveOperations: boolean;
  autoSaveAfterOperations: boolean;
}

/**
 * Helper type for operation handlers
 */
export type OperationHandler<TParams, TResult extends ToolOperationResult> = (
  params: TParams
) => Promise<TResult>;

/**
 * Tool operation metadata
 */
export interface ToolOperationMetadata {
  type: ToolOperationType;
  name: string;
  description: string;
  icon: string;
  isDestructive: boolean;
  requiresConfirmation: boolean;
  category: "transform" | "delete" | "export";
}

/**
 * Predefined tool operation metadata
 */
export const TOOL_OPERATIONS: Record<ToolOperationType, ToolOperationMetadata> = {
  [ToolOperationType.MIRROR]: {
    type: ToolOperationType.MIRROR,
    name: "Mirror",
    description: "Mirror the sequence horizontally",
    icon: "🪞",
    isDestructive: false,
    requiresConfirmation: false,
    category: "transform",
  },
  [ToolOperationType.ROTATE_CLOCKWISE]: {
    type: ToolOperationType.ROTATE_CLOCKWISE,
    name: "Rotate Clockwise",
    description: "Rotate the sequence clockwise",
    icon: "🔄",
    isDestructive: false,
    requiresConfirmation: false,
    category: "transform",
  },
  [ToolOperationType.ROTATE_COUNTERCLOCKWISE]: {
    type: ToolOperationType.ROTATE_COUNTERCLOCKWISE,
    name: "Rotate Counterclockwise",
    description: "Rotate the sequence counterclockwise",
    icon: "🔄",
    isDestructive: false,
    requiresConfirmation: false,
    category: "transform",
  },
  [ToolOperationType.SWAP_COLORS]: {
    type: ToolOperationType.SWAP_COLORS,
    name: "Swap Colors",
    description: "Swap red and blue colors",
    icon: "🎨",
    isDestructive: false,
    requiresConfirmation: false,
    category: "transform",
  },
  [ToolOperationType.CLEAR]: {
    type: ToolOperationType.CLEAR,
    name: "Clear",
    description: "Clear all beats in the sequence",
    icon: "🧹",
    isDestructive: true,
    requiresConfirmation: true,
    category: "transform",
  },
  [ToolOperationType.DUPLICATE]: {
    type: ToolOperationType.DUPLICATE,
    name: "Duplicate",
    description: "Create a copy of the sequence",
    icon: "📋",
    isDestructive: false,
    requiresConfirmation: false,
    category: "transform",
  },
  [ToolOperationType.DELETE_SEQUENCE]: {
    type: ToolOperationType.DELETE_SEQUENCE,
    name: "Delete Sequence",
    description: "Delete the entire sequence",
    icon: "🗑️",
    isDestructive: true,
    requiresConfirmation: true,
    category: "delete",
  },
  [ToolOperationType.DELETE_BEAT]: {
    type: ToolOperationType.DELETE_BEAT,
    name: "Delete Beat",
    description: "Delete a single beat",
    icon: "❌",
    isDestructive: true,
    requiresConfirmation: false,
    category: "delete",
  },
  [ToolOperationType.DELETE_BEATS]: {
    type: ToolOperationType.DELETE_BEATS,
    name: "Delete Beats",
    description: "Delete multiple beats",
    icon: "❌",
    isDestructive: true,
    requiresConfirmation: true,
    category: "delete",
  },
  [ToolOperationType.DELETE_BEAT_AND_FOLLOWING]: {
    type: ToolOperationType.DELETE_BEAT_AND_FOLLOWING,
    name: "Delete Beat and Following",
    description: "Delete beat and all following beats",
    icon: "❌",
    isDestructive: true,
    requiresConfirmation: true,
    category: "delete",
  },
  [ToolOperationType.CLEAR_BEATS]: {
    type: ToolOperationType.CLEAR_BEATS,
    name: "Clear Beats",
    description: "Clear all beats but keep sequence structure",
    icon: "🧹",
    isDestructive: true,
    requiresConfirmation: true,
    category: "delete",
  },
  [ToolOperationType.EXPORT_JSON]: {
    type: ToolOperationType.EXPORT_JSON,
    name: "Export JSON",
    description: "Export sequence as JSON",
    icon: "📄",
    isDestructive: false,
    requiresConfirmation: false,
    category: "export",
  },
  [ToolOperationType.COPY_JSON]: {
    type: ToolOperationType.COPY_JSON,
    name: "Copy JSON",
    description: "Copy sequence JSON to clipboard",
    icon: "📋",
    isDestructive: false,
    requiresConfirmation: false,
    category: "export",
  },
  [ToolOperationType.ADD_TO_DICTIONARY]: {
    type: ToolOperationType.ADD_TO_DICTIONARY,
    name: "Add to Dictionary",
    description: "Add sequence to dictionary",
    icon: "📚",
    isDestructive: false,
    requiresConfirmation: false,
    category: "export",
  },
  [ToolOperationType.EXPORT_FULLSCREEN]: {
    type: ToolOperationType.EXPORT_FULLSCREEN,
    name: "Fullscreen",
    description: "View sequence in fullscreen",
    icon: "🔍",
    isDestructive: false,
    requiresConfirmation: false,
    category: "export",
  },
};
