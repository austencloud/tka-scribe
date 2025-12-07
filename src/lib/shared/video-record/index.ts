/**
 * Video Record Module
 *
 * Provides camera-based video recording for sequence performance submissions.
 */

// Components
export { default as VideoRecordDrawer } from "./components/VideoRecordDrawer.svelte";
export { default as VideoRecordPanel } from "./components/VideoRecordPanel.svelte";

// Services
export type { IVideoRecordService, RecordingProgress, RecordingResult, RecordingOptions } from "./services/contracts/IVideoRecordService";
export { VideoRecordService, getVideoRecordService } from "./services/implementations/VideoRecordService";
