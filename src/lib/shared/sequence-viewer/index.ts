/**
 * Sequence Viewer Module
 *
 * Standalone sequence viewing with integrated edit panel.
 * Used as landing page for deep links to shared sequences.
 */

// Components
export { SequenceViewer } from "./components";

// Services
export type { ISequenceViewerService } from "./services";
export { SequenceViewerService } from "./services";

// State
export { createSequenceViewerState, type SequenceViewerState } from "./state";
