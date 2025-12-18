/**
 * YouTube Service Type Identifiers
 *
 * DI tokens for YouTube audio services used in the Compose module.
 */

export const YouTubeTypes = {
  IYouTubeSearchService: Symbol.for("IYouTubeSearchService"),
  IYouTubeAudioService: Symbol.for("IYouTubeAudioService"),
} as const;
