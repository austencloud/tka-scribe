/**
 * Audio Service Type Identifiers
 *
 * DI tokens for audio library services used in the Compose module.
 */

export const AudioTypes = {
  IAudioLibraryService: Symbol.for("IAudioLibraryService"),
  IAudioStorageService: Symbol.for("IAudioStorageService"),
} as const;

// Legacy export for backwards compatibility
export const YouTubeTypes = AudioTypes;
