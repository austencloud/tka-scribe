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

// Domain Models
export type { RecordingMetadata } from "./domain/RecordingMetadata";
export { createRecordingMetadata, detectDeviceType } from "./domain/RecordingMetadata";

// Persistence
export type { IRecordingPersistenceService } from "./services/implementations/RecordingPersistenceService";
export { RecordingPersistenceService } from "./services/implementations/RecordingPersistenceService";
