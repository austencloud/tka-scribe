/**
 * Animated image transcoding helpers.
 * Handles conversions between legacy GIF exports and modern formats.
 */

export interface WebpTranscodeOptions {
  /** Use lossless conversion when possible (default: false) */
  lossless?: boolean;
}

export interface IAnimatedImageTranscoder {
  /**
   * Convert a GIF blob into an animated WebP blob.
   */
  convertGifToWebp(blob: Blob, options?: WebpTranscodeOptions): Promise<Blob>;
}
